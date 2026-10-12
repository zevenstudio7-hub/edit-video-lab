// Transcripción por frases con tiempos medidos en el audio real de cada toma.
//
// 1. La energía RMS (ventanas de 10 ms) marca dónde hay voz: «islas» separadas por pausas ≥ 0,15 s.
// 2. Las islas se agrupan en frases cortadas en pausas ≥ 0,30 s (máx. 9 s).
// 3. Cada frase se transcribe POR SEPARADO con whisper.cpp (una sola carga del modelo por toma). Así cada intento
//    repetido o falso inicio conserva su propio texto: con el audio completo whisper tiende a fundir repeticiones.
// 4. Las palabras se asignan a las islas de su frase con el tiempo DTW de whisper y se reparten dentro de la isla
//    por longitud (aproximación editorial, no alineación fonética).
// Los cortes del montaje se colocan en pausas medidas, nunca en mitad de una isla.
//
// Entrada: .whisper/audio/<toma>.wav (16 kHz mono, lo crea transcribeWhisper.mjs)
// Salida:  analysis/video-001-whisper/<toma>.aligned.json   (caché de frases en .whisper/chunks/)
// Uso: node src/videoAnalysis/alignTranscript.mjs [--take=X.MP4] [--print]
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const audioDir = path.join(root, '.whisper/audio');
const chunkDir = path.join(root, '.whisper/chunks');
const outDir = path.join(root, 'analysis/video-001-whisper');
const whisperBin = path.join(root, '.whisper/whisper.cpp/main');
const model = path.join(root, '.whisper/models/ggml-large-v3-turbo.bin');
const PROMPT = 'Apple, Samsung, iPhone, iPhone Duo, Galaxy, Galaxy Fold, plegable, posicionamiento de marca.';
const SR = 16000;
const FRAME = 0.01; // s
const MIN_PAUSE = 0.15; // pausas más cortas quedan dentro de la misma isla
const MIN_ISLAND = 0.06; // descarta chasquidos aislados
const OVER_FLOOR_DB = 6; // umbral = suelo de ruido (percentil 10) + 6 dB
const PHRASE_PAUSE = 0.3;
const MAX_PHRASE = 9;
const PAD = 0.1; // audio real alrededor de cada frase al transcribirla
// Alucinaciones habituales de whisper sobre respiraciones o ruido.
const HALLUCINATION = /suscr[ií]bete|gracias por ver|subt[ií]tulos|^\W*gracias\W*$|amara\.org/i;

const readWav = async (file) => {
  const buf = await fs.readFile(file);
  let off = 12;
  while (off < buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const len = buf.readUInt32LE(off + 4);
    if (id === 'data') return new Int16Array(buf.buffer.slice(buf.byteOffset + off + 8, buf.byteOffset + off + 8 + len));
    off += 8 + len;
  }
  throw new Error('WAV sin bloque data: ' + file);
};

const writeWav = (file, samples) => {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + samples.length * 2, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(samples.length * 2, 40);
  return fs.writeFile(file, Buffer.concat([header, Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength)]));
};

const envelope = (samples) => {
  const step = Math.round(SR * FRAME);
  const db = [];
  for (let i = 0; i + step <= samples.length; i += step) {
    let acc = 0;
    for (let j = i; j < i + step; j++) acc += samples[j] * samples[j];
    db.push(20 * Math.log10(Math.sqrt(acc / step) / 32768 + 1e-9));
  }
  return db;
};

const islandsFrom = (db) => {
  const sorted = [...db].filter((v) => v > -120).sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.1)];
  const threshold = floor + OVER_FLOOR_DB;
  const raw = [];
  let start = null;
  db.forEach((v, i) => {
    if (v >= threshold && start === null) start = i;
    if (v < threshold && start !== null) { raw.push([start, i]); start = null; }
  });
  if (start !== null) raw.push([start, db.length]);
  const merged = [];
  for (const r of raw) {
    const last = merged[merged.length - 1];
    if (last && (r[0] - last[1]) * FRAME < MIN_PAUSE) last[1] = r[1];
    else merged.push([...r]);
  }
  const islands = merged.filter(([a, b]) => (b - a) * FRAME >= MIN_ISLAND)
    .map(([a, b], id) => ({id, start: +(a * FRAME).toFixed(2), end: +(b * FRAME).toFixed(2)}));
  return {floor: +floor.toFixed(1), threshold: +threshold.toFixed(1), islands};
};

const phrasesFrom = (islands) => {
  const groups = [];
  for (const isl of islands) {
    const g = groups[groups.length - 1];
    if (g && isl.start - g[g.length - 1].end < PHRASE_PAUSE) g.push(isl);
    else groups.push([isl]);
  }
  const split = (g) => {
    if (g.length < 2 || g[g.length - 1].end - g[0].start <= MAX_PHRASE) return [g];
    let cut = 1, gap = -1;
    for (let i = 1; i < g.length; i++) if (g[i].start - g[i - 1].end > gap) { gap = g[i].start - g[i - 1].end; cut = i; }
    return [...split(g.slice(0, cut)), ...split(g.slice(cut))];
  };
  return groups.flatMap(split).map((g, id) => ({id, start: g[0].start, end: g[g.length - 1].end, islands: g.map((i) => i.id)}));
};

const runWhisper = (files) => new Promise((resolve, reject) => {
  // -ac 640 (≈12,8 s de contexto): las frases miden ≤ 9,6 s con relleno; en este CPU reduce ~3× el tiempo del codificador
  // sin pérdida apreciable frente al contexto completo (comparado en 5 frases de 595d).
  const args = ['-ng', '-l', 'es', '-m', model, '-ac', '640', '--dtw', 'large.v3.turbo', '-oj', '-ojf', '-np', '--prompt', PROMPT, ...files.flatMap((f) => ['-f', f])];
  const p = spawn(whisperBin, args, {stdio: ['ignore', 'ignore', 'pipe']});
  let err = '';
  p.stderr.on('data', (d) => { err += d; });
  p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('whisper.cpp ' + code + ': ' + err.slice(-400)))));
});

const tokensOf = (json) => json.transcription.flatMap((s) => s.tokens ?? [])
  .filter((t) => !/^\[_.*\]$/.test(t.text.trim()) && t.text.trim() !== '');

// Tokens → palabras (un token con espacio inicial abre palabra; la puntuación se pega a la anterior).
const wordsFrom = (tokens, offset) => {
  const words = [];
  for (const t of tokens) {
    const anchor = offset + (t.t_dtw >= 0 ? t.t_dtw / 100 : (t.offsets.from + t.offsets.to) / 2000);
    const isPunct = /^[.,;:!?¿¡…"')\]]+$/.test(t.text.trim());
    if ((t.text.startsWith(' ') && !isPunct) || words.length === 0) words.push({text: t.text.trim(), anchor, p: t.p});
    else {
      const w = words[words.length - 1];
      w.text += t.text.trim();
      if (!isPunct) w.anchor = anchor;
      w.p = Math.min(w.p, t.p);
    }
  }
  return words;
};

const only = process.argv.find((a) => a.startsWith('--take='))?.slice(7);
const takes = (await fs.readdir(audioDir)).filter((f) => f.endsWith('.wav')).map((f) => f.replace(/\.wav$/, '.MP4'))
  .filter((t) => !only || t === only).sort();

for (const take of takes) {
  const samples = await readWav(path.join(audioDir, take.replace(/\.mp4$/i, '.wav')));
  const db = envelope(samples);
  const {floor, threshold, islands} = islandsFrom(db);
  const phrases = phrasesFrom(islands);
  const dir = path.join(chunkDir, take);
  await fs.mkdir(dir, {recursive: true});
  const pending = [];
  for (const ph of phrases) {
    const wav = path.join(dir, `p${String(ph.id).padStart(3, '0')}_${ph.start.toFixed(2)}.wav`);
    ph.wav = wav;
    ph.from = Math.max(0, ph.start - PAD);
    if (existsSync(wav + '.json')) continue;
    const a = Math.round(ph.from * SR);
    const b = Math.min(samples.length, Math.round((ph.end + PAD) * SR));
    // 0,4 s de silencio digital al final ayudan a whisper a cerrar la frase
    const padded = new Int16Array(b - a + Math.round(0.4 * SR));
    padded.set(samples.subarray(a, b));
    await writeWav(wav, padded);
    pending.push(wav);
  }
  const started = Date.now();
  if (pending.length) await runWhisper(pending);
  const words = [];
  for (const ph of phrases) {
    const json = JSON.parse(await fs.readFile(ph.wav + '.json', 'utf8'));
    const tokens = tokensOf(json);
    const ws = wordsFrom(tokens, ph.from);
    ph.text = ws.map((w) => w.text).join(' ');
    const meanP = tokens.length ? tokens.reduce((a, t) => a + t.p, 0) / tokens.length : 0;
    ph.meanP = +meanP.toFixed(2);
    ph.suspect = !ws.length || HALLUCINATION.test(ph.text) || meanP < 0.45;
    // asignación monótona a las islas de la frase
    const own = islands.filter((i) => ph.islands.includes(i.id));
    let cursor = 0;
    for (const w of ws) {
      let idx = own.findIndex((isl, i) => i >= cursor && w.anchor >= isl.start - 0.15 && w.anchor <= isl.end + 0.35);
      if (idx === -1) idx = cursor;
      w.island = own[idx].id;
      w.phrase = ph.id;
      cursor = idx;
    }
    for (const isl of own) {
      const iw = ws.filter((w) => w.island === isl.id);
      isl.text = iw.map((w) => w.text).join(' ');
      const weights = iw.map((w) => Math.max(1, w.text.replace(/[^\p{L}\p{N}]/gu, '').length));
      const total = weights.reduce((a, b) => a + b, 0);
      let acc = 0;
      iw.forEach((w, i) => {
        w.start = +(isl.start + (acc / total) * (isl.end - isl.start)).toFixed(3);
        acc += weights[i];
        w.end = +(isl.start + (acc / total) * (isl.end - isl.start)).toFixed(3);
      });
    }
    words.push(...ws);
  }
  const result = {
    sourceFile: take,
    durationSeconds: +(samples.length / SR).toFixed(3),
    method: {
      frameSeconds: FRAME, noiseFloorDb: floor, thresholdDb: threshold, minPauseSeconds: MIN_PAUSE, phrasePauseSeconds: PHRASE_PAUSE,
      transcription: 'whisper.cpp 1.7.2, large-v3-turbo, -ac 640, --dtw large.v3.turbo, es, una transcripción por frase',
      note: 'Islas y frases medidas por RMS. Texto por frase transcrito de forma aislada. Reparto de palabras dentro de cada isla proporcional a su longitud: no es alineación fonética.',
      seconds: +((Date.now() - started) / 1000).toFixed(1),
    },
    phrases: phrases.map(({wav, from, ...p}) => ({...p, pauseBefore: p.id === 0 ? p.start : +(p.start - phrases[p.id - 1].end).toFixed(2)})),
    islands,
    words: words.map((w) => ({...w, anchor: +w.anchor.toFixed(2), p: +w.p.toFixed(3)})),
  };
  await fs.writeFile(path.join(outDir, take + '.aligned.json'), JSON.stringify(result, null, 2) + '\n');
  if (process.argv.includes('--print')) {
    console.log(`\n=== ${take}  (${result.durationSeconds}s, umbral ${threshold} dB, ${phrases.length} frases, ${result.method.seconds}s)`);
    for (const p of result.phrases) console.log(`${String(p.id).padStart(3)} ${p.start.toFixed(2).padStart(6)}-${p.end.toFixed(2).padStart(6)} (+${p.pauseBefore.toFixed(2)})${p.suspect ? ' ?' : '  '} ${p.text}`);
  }
}
