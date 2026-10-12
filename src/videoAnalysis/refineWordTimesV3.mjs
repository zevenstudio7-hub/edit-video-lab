// Tiempos por palabra de la candidata V3 (VIDEO-001) y verificación de bordes de corte.
//
// Los tiempos de analysis/video-001-whisper/*.aligned.json reparten las palabras de cada isla de voz en proporción
// a su longitud: sirven para elegir cortes, pero se desvían hasta ±0,5 s dentro de islas largas. Los énfasis
// tipográficos de V3 necesitan el tiempo real de cada palabra («timing documentado y comprobado»), así que:
//  1. se extrae el audio EXACTO de cada plano (frames de entrada/salida de la timeline) con 0,5 s de silencio a
//     cada lado (whisper inventa palabras sin contexto de silencio);
//  2. whisper.cpp (large-v3-turbo, contexto completo, --dtw) transcribe cada plano: el instante DTW del primer
//     token de cada palabra es su inicio;
//  3. el texto corregido del plano se alinea con esas palabras (misma DP que editCore); las no reconocidas se
//     interpolan y los inicios cercanos a un arranque de isla se ajustan a la energía;
//  4. la transcripción de cada plano se compara con su texto: palabras de más o de menos en los bordes señalan un
//     corte que invade otra palabra o la recorta.
// Salida: analysis/video-001-whisper/v3-word-times.json (la lee buildEditV3.mjs si coincide con los planos).
//
// Uso: node src/videoAnalysis/refineWordTimesV3.mjs [--only=v01,v02a] [--reuse]   (--reuse no vuelve a transcribir)
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {alignWords, alignedLoader, norm, resolveCuts} from './lib/editCore.mjs';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const whisper = path.join(root, '.whisper/whisper.cpp/main');
const model = path.join(root, '.whisper/models/ggml-large-v3-turbo.bin');
const PROMPT = 'Apple, Samsung, iPhone, iPhone Duo, Galaxy, Galaxy Fold, Samsung Mobile MX, plegable, posicionamiento de marca.';
const PAD = 0.5;
const workDir = path.join(root, '.whisper/v3');
const outPath = path.join(root, 'analysis/video-001-whisper/v3-word-times.json');

const order = JSON.parse(await fs.readFile(path.join(root, 'video-orders/VIDEO-001.json'), 'utf8'));
const edl = order.candidatoV3?.edl ?? (() => { throw new Error('La orden no tiene candidatoV3.edl'); })();
const load = alignedLoader(root);
const {cuts} = await resolveCuts(edl.cuts, {fps: edl.fps, pad: edl.padding, take: load, sourceDir: edl.source.dir});
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const reuse = process.argv.includes('--reuse');
const todo = cuts.filter((c) => !only || only.includes(c.id));
await fs.mkdir(workDir, {recursive: true});

// 1. fragmentos exactos (16 kHz mono del original, mismo audio que analizó alignTranscript)
const fragOf = (c) => path.join(workDir, `${c.id}_${c.inTime.toFixed(3)}_${c.outTime.toFixed(3)}.wav`);
const pending = [];
for (const c of todo) {
  const wav = fragOf(c);
  if (existsSync(wav + '.json') && reuse) continue;
  const src = path.join(root, '.whisper/audio', c.take.replace(/\.MP4$/i, '.wav'));
  await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(c.inTime), '-to', String(c.outTime), '-i', src,
    '-af', `adelay=delays=${PAD * 1000}:all=1,apad=pad_dur=${PAD + 0.1}`, '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);
  pending.push(wav);
}
// 2. una sola invocación para todos los fragmentos (el modelo se carga una vez)
if (pending.length) {
  const started = Date.now();
  console.log(`whisper: ${pending.length} planos…`);
  await run(whisper, ['-ng', '-t', '8', '-l', 'es', '-m', model, '--dtw', 'large.v3.turbo', '-oj', '-ojf', '-np', '--prompt', PROMPT, ...pending.flatMap((f) => ['-f', f])], {maxBuffer: 1 << 26});
  console.log(`whisper: ${((Date.now() - started) / 1000).toFixed(0)} s`);
}

// 3. palabras de whisper con instante DTW
const whisperWords = (json, inTime) => {
  const words = [];
  for (const seg of json.transcription) for (const t of seg.tokens ?? []) {
    const text = t.text;
    if (/^\[_.*\]$/.test(text.trim()) || !text.trim()) continue;
    const at = t.t_dtw >= 0 ? t.t_dtw / 100 : t.offsets.from / 1000;
    const isPunct = /^[\p{P}\s]+$/u.test(text);
    // palabra nueva: token con espacio inicial, o letra tras una palabra que ya cerró con puntuación («confianza?¿Sabe»)
    const glued = words.length && /[¿?¡!.…]$/.test(words[words.length - 1].text) && /^[\p{L}\p{N}]/u.test(text);
    if ((text.startsWith(' ') && !isPunct) || !words.length || glued) words.push({text: text.trim(), start: +(inTime + at - PAD).toFixed(3), p: t.p});
    else { const w = words[words.length - 1]; w.text += text.trim(); w.p = Math.min(w.p, t.p); }
  }
  return words;
};

// ---------- alineación forzada por sílabas ----------
// El instante DTW se desvía ±0,25 s y no siempre en el mismo sentido: solo sirve de orientación. Cada palabra se
// cuenta en sílabas, los núcleos vocálicos se detectan en la energía y una DP los empareja (con el DTW como
// referencia blanda); el inicio de la palabra es el valle de energía previo al núcleo de su primera sílaba.
// banda de vocales (300–2500 Hz): las fricativas («s») pierden peso y los núcleos vocálicos destacan
const pcmCache = new Map();
const pcmOf = async (take) => {
  if (!pcmCache.has(take)) {
    const {stdout} = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(root, '.whisper/audio', take.replace(/\.MP4$/i, '.wav')),
      '-af', 'highpass=f=300,lowpass=f=2500', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], {encoding: 'buffer', maxBuffer: 1 << 28});
    pcmCache.set(take, new Int16Array(stdout.buffer, stdout.byteOffset, stdout.byteLength / 2));
  }
  return pcmCache.get(take);
};
// envolvente RMS de 10 ms en dB, suavizada en 3 frames
const envelope = (samples, a, b) => {
  const sr = 16000, step = 160, db = [];
  for (let i = Math.round(a * sr); i + step <= Math.round(b * sr); i += step) {
    let acc = 0;
    for (let j = i; j < i + step; j++) acc += samples[j] * samples[j];
    db.push(20 * Math.log10(Math.sqrt(acc / step) / 32768 + 1e-9));
  }
  return {t0: a, s: db.map((v, i) => (db[Math.max(0, i - 1)] + v + db[Math.min(db.length - 1, i + 1)]) / 3)};
};
// núcleos: picos ≥ suelo del plano (percentil 10) + 8 dB, prominencia ≥ 2 dB, separados ≥ 70 ms
const nucleiOf = ({t0, s}) => {
  const floor = [...s].sort((x, y) => x - y)[Math.floor(s.length * 0.1)] ?? -60;
  const peaks = [];
  for (let i = 1; i < s.length - 1; i++) {
    if (!(s[i] >= s[i - 1] && s[i] > s[i + 1]) || s[i] < floor + 8) continue;
    let l = s[i], r = s[i];
    for (let k = i - 1; k >= Math.max(0, i - 15) && s[k] <= s[i]; k--) l = Math.min(l, s[k]);
    for (let k = i + 1; k <= Math.min(s.length - 1, i + 15) && s[k] <= s[i]; k++) r = Math.min(r, s[k]);
    if (s[i] - Math.max(l, r) >= 2) peaks.push({i, t: t0 + i * 0.01, db: s[i]});
  }
  const out = [];
  for (const q of peaks) {
    const last = out[out.length - 1];
    if (last && q.i - last.i < 7) { if (q.db > last.db) out[out.length - 1] = q; } else out.push(q);
  }
  return out;
};
// valle de energía en los 160 ms previos al núcleo i (sin cruzar el núcleo anterior)
const onsetBefore = ({t0, s}, i, lo) => {
  let m = i;
  for (let k = i - 1; k >= Math.max(lo, i - 16); k--) if (s[k] < s[m]) m = k;
  return t0 + m * 0.01;
};
// sílabas en español (diptongo salvo dos vocales fuertes o vocal débil acentuada); marcas y cifras según se dicen
const SYL_FIXED = {apple: 2, iphone: 2, samsung: 2, duo: 2, mobile: 2, galaxy: 3, mx: 4, x: 2, fold: 1};
const SYL_NUM = {2007: 4, 2014: 5, 2016: 5, 2020: 4, 2021: 5, 2023: 5, 12: 2, 7: 2, 100: 1};
const syllables = (word) => {
  const raw = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  if (/^\d+$/.test(raw)) return SYL_NUM[raw] ?? raw.length * 2;
  if (SYL_FIXED[raw]) return SYL_FIXED[raw];
  const w = raw.replace(/y$/, 'i').replace(/([qg])u(?=[eiéí])/g, '$1');
  let n = 0, prev = null;
  for (const ch of w) {
    if (!'aeiouáéíóúü'.includes(ch)) { prev = null; continue; }
    if (prev === null || ('aeoáéó'.includes(prev) && 'aeoáéó'.includes(ch)) || 'íú'.includes(prev) || 'íú'.includes(ch)) n++;
    prev = ch;
  }
  return Math.max(1, n);
};
// DP sílabas ↔ núcleos: emparejar cuesta la desviación respecto a la referencia DTW; saltar una sílaba (no
// detectada, sinalefa) o un núcleo (ruido, consonante sonora) tiene coste fijo
const alignSyllables = (syl, nuclei) => {
  const n = syl.length, m = nuclei.length, SKIP_SYL = 1.2, SKIP_NUC = 1.0, SIGMA = 0.3;
  const D = Array.from({length: n + 1}, () => new Float64Array(m + 1).fill(Infinity));
  const B = Array.from({length: n + 1}, () => new Int8Array(m + 1));
  D[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
    if (!i && !j) continue;
    if (i && j) { const d = (nuclei[j - 1].t - syl[i - 1].prior) / SIGMA; const c = D[i - 1][j - 1] + Math.min(4, 0.5 * d * d); if (c < D[i][j]) { D[i][j] = c; B[i][j] = 1; } }
    if (i) { const c = D[i - 1][j] + SKIP_SYL; if (c < D[i][j]) { D[i][j] = c; B[i][j] = 2; } }
    if (j) { const c = D[i][j - 1] + SKIP_NUC; if (c < D[i][j]) { D[i][j] = c; B[i][j] = 3; } }
  }
  const at = new Array(n).fill(null);
  for (let i = n, j = m; i > 0 || j > 0;) {
    const b = B[i][j];
    if (b === 1) { at[i - 1] = j - 1; i--; j--; } else if (b === 2) i--; else j--;
  }
  return at;
};

const previous = existsSync(outPath) ? JSON.parse(await fs.readFile(outPath, 'utf8')) : {cuts: {}};
const result = {
  method: {
    note: 'Alineación forzada por sílabas: whisper.cpp 1.7.2 (large-v3-turbo, contexto completo, --dtw large.v3.turbo) transcribe el audio exacto de cada plano (0,5 s de silencio a cada lado); su instante DTW por palabra es solo referencia (σ 0,3 s). Sílabas por palabra (reglas del español; marcas y cifras según se pronuncian) ↔ núcleos vocálicos de la envolvente RMS de 10 ms en banda de vocales 300–2500 Hz (picos ≥ suelo del plano + 8 dB, prominencia ≥ 2 dB, ≥ 70 ms entre núcleos) por DP; inicio = valle de energía previo al núcleo de la primera sílaba; sin núcleo → interpolación por sílabas; nunca dentro de una pausa; fin = siguiente inicio o fin de isla.',
    createdAt: new Date().toISOString(),
  },
  cuts: previous.cuts,
};
const report = [];
for (const c of todo) {
  const json = JSON.parse(await fs.readFile(fragOf(c) + '.json', 'utf8'));
  const target = c.text.split(/\s+/).filter(Boolean);
  // whisper a veces parte una palabra («sino» → «Si no,»): se unen dos palabras oídas si juntas forman una del texto
  const targetSet = new Set(target.map(norm));
  const ww = [];
  for (const w of whisperWords(json, c.inTime).filter((x) => norm(x.text) && x.start > c.inTime - 0.3 && x.start < c.outTime + 0.3)) {
    const prev = ww[ww.length - 1];
    if (prev && !targetSet.has(norm(prev.text)) && !targetSet.has(norm(w.text)) && targetSet.has(norm(prev.text + w.text))) {
      prev.text += w.text; prev.p = Math.min(prev.p, w.p);
    } else ww.push(w);
  }
  const match = alignWords(target, ww);
  const data = await load(c.take);
  const islands = data.islands.filter((i) => i.end > c.inTime && i.start < c.outTime).map((i) => ({start: Math.max(i.start, c.inTime), end: Math.min(i.end, c.outTime)}));
  const env = envelope(await pcmOf(c.take), c.inTime, c.outTime);
  const nuclei = nucleiOf(env);
  // referencia DTW por palabra (las no reconocidas, interpoladas)
  const prior = target.map((_, i) => (match[i] ? ww[match[i].ref].start : null));
  for (let i = 0; i < prior.length; i++) {
    if (prior[i] !== null) continue;
    let a = i - 1; while (a >= 0 && prior[a] === null) a--;
    let b = i + 1; while (b < prior.length && prior[b] === null) b++;
    const left = a >= 0 ? prior[a] : c.inTime, right = b < prior.length ? prior[b] : c.outTime;
    for (let x = a + 1; x < b; x++) prior[x] = left + ((right - left) * (x - a)) / (b - a);
    i = b - 1;
  }
  const nSyl = target.map(syllables);
  const syl = target.flatMap((_, w) => Array.from({length: nSyl[w]}, (_, k) => ({w, k, prior: prior[w] + k * 0.13})));
  const at = alignSyllables(syl, nuclei);
  const firstSyl = target.map((_, w) => syl.findIndex((x) => x.w === w));
  let words = target.map((text, w) => {
    const j = at[firstSyl[w]];
    const start = j === null ? null : onsetBefore(env, nuclei[j].i, j > 0 ? nuclei[j - 1].i + 1 : 0);
    return {text, start, syllables: nSyl[w], source: j === null ? 'interp' : 'sílaba', dtw: match[w] ? ww[match[w].ref].start : null, heard: match[w] ? ww[match[w].ref].text : null};
  });
  if (islands.length) words[0].start = islands[0].start; // la primera palabra empieza con la voz del plano
  // sin núcleo propio: interpolación por sílabas entre vecinos
  for (let i = 0; i < words.length; i++) {
    if (words[i].start !== null) continue;
    let a = i - 1; while (a >= 0 && words[a].start === null) a--;
    let b = i + 1; while (b < words.length && words[b].start === null) b++;
    const left = a >= 0 ? words[a].start : islands[0]?.start ?? c.inTime;
    const right = b < words.length ? words[b].start : islands[islands.length - 1]?.end ?? c.outTime;
    const weights = words.slice(Math.max(0, a), b).map((x) => x.syllables);
    const total = weights.reduce((x, y) => x + y, 0) || 1;
    let acc = a >= 0 ? words[a].syllables : 0;
    for (let x = a + 1; x < b; x++) { words[x].start = left + ((right - left) * acc) / total; acc += words[x].syllables; }
    i = b - 1;
  }
  // nunca dentro de una pausa: una palabra que cae entre islas empieza con la isla siguiente
  for (const w of words) {
    if (islands.some((s) => w.start >= s.start - 0.02 && w.start <= s.end)) continue;
    const next = islands.find((s) => s.start > w.start);
    if (next) w.start = next.start;
  }
  // monotonía (≥ 40 ms por palabra) y fin de palabra
  for (let i = 1; i < words.length; i++) words[i].start = Math.max(words[i].start, words[i - 1].start + 0.05);
  for (let i = 0; i < words.length; i++) {
    const next = words[i + 1]?.start ?? c.outTime;
    const own = islands.find((s) => words[i].start >= s.start - 0.02 && words[i].start <= s.end);
    // si entre esta palabra y la siguiente hay una pausa (cambio de isla), la palabra termina con su isla
    words[i].end = own && own.end < next ? own.end : next - 0.02;
    words[i].end = +Math.max(words[i].start + 0.04, Math.min(words[i].end, c.outTime)).toFixed(3);
    words[i].start = +words[i].start.toFixed(3);
  }
  // 4. verificación de bordes: palabras de whisper fuera del texto en el primer/último tramo del plano
  const matchedRefs = new Set(match.filter(Boolean).map((m) => m.ref));
  const extra = ww.filter((w, i) => !matchedRefs.has(i));
  const edgeExtra = extra.filter((w) => w.start - c.inTime < 0.35 || c.outTime - w.start < 0.35).map((w) => `${w.text}@${(w.start - c.inTime).toFixed(2)}`);
  const missing = words.filter((w) => !w.heard).map((w) => w.text);
  result.cuts[c.id] = {take: c.take, inTime: c.inTime, outTime: c.outTime, text: c.text, heard: ww.map((w) => w.text).join(' '), words};
  report.push({id: c.id, exact: words.filter((w) => w.source === 'sílaba').length, approx: nuclei.length, interp: words.filter((w) => w.source === 'interp').length, edgeExtra, heard: result.cuts[c.id].heard, missing});
}

await fs.writeFile(outPath, JSON.stringify(result, null, 2) + '\n');
for (const r of report) {
  const flag = r.edgeExtra.length ? '  ⚠ borde: ' + r.edgeExtra.join(' ') : '';
  console.log(`${r.id.padEnd(5)} palabras con núcleo ${String(r.exact).padStart(2)} · núcleos ${String(r.approx).padStart(3)} · interpoladas ${String(r.interp).padStart(2)}${flag}\n      oído: ${r.heard}${r.missing.length ? '\n      sin oír: ' + r.missing.join(' ') : ''}`);
}
console.log('→', path.relative(root, outPath));
