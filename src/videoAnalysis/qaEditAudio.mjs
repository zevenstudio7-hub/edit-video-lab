// QA del audio del montaje VIDEO-001 (no es un render: une los mismos rangos de los proxies con FFmpeg).
// 1. Monta el audio de todos los planos del timeline, en orden y con los mismos frames de entrada/salida.
// 2. Mide la energía en los primeros/últimos 40 ms de cada plano: si supera el suelo + 12 dB, el borde
//    puede estar cortando voz.
// 3. Transcribe el audio montado con whisper.cpp y lo alinea con el texto previsto de cada plano para
//    señalar palabras perdidas, sobrantes o distintas.
// Salida: analysis/video-001-qa-audio.json (+ .whisper/qa/montaje.wav)
// --v3: candidata V3 (candidatoV3.timeline). Los bordes se miden igual, pero se transcribe la pista de diálogo que
// suena en la composición (public/video-001/v3/dialogue.wav, ya limpia) → analysis/video-001-v3-qa-audio.json
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const order = JSON.parse(await fs.readFile(path.join(root, 'video-orders/VIDEO-001.json'), 'utf8'));
const v3 = process.argv.includes('--v3');
const {cuts, fps} = v3 ? order.candidatoV3.timeline : order.timeline;
const qaDir = path.join(root, '.whisper/qa');
await fs.mkdir(qaDir, {recursive: true});
const SR = 16000;

const pcm = async (src, a, b) => {
  const {stdout} = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-ss', String(a), '-to', String(b), '-i', src, '-vn', '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], {encoding: 'buffer', maxBuffer: 1 << 28});
  return new Int16Array(stdout.buffer, stdout.byteOffset, stdout.byteLength / 2);
};
const db = (s, a, b) => {
  let acc = 0;
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) / 32768 + 1e-9);
};

const parts = [];
const edges = [];
for (const c of cuts) {
  const s = await pcm(path.join(root, 'public', c.source), c.trimBefore / fps, c.trimAfter / fps);
  parts.push(s);
  const n = Math.round(0.04 * SR);
  const aligned = JSON.parse(await fs.readFile(path.join(root, 'analysis/video-001-whisper', path.basename(c.source).replace(/\.mp4$/i, '.MP4') + '.aligned.json'), 'utf8'));
  // el proxy está normalizado a −16 LUFS: se compara con el suelo de ese mismo plano (percentil 10)
  const frames = [];
  for (let i = 0; i + 160 <= s.length; i += 160) frames.push(db(s, i, i + 160));
  const floor = [...frames].sort((x, y) => x - y)[Math.floor(frames.length * 0.1)];
  const head = db(s, 0, n), tail = db(s, s.length - n, s.length);
  edges.push({id: c.id, headDb: +head.toFixed(1), tailDb: +tail.toFixed(1), floorDb: +floor.toFixed(1), headRisk: head > floor + 12, tailRisk: tail > floor + 12, analysisThresholdDb: aligned.method.thresholdDb});
}
const total = parts.reduce((a, p) => a + p.length, 0);
const all = new Int16Array(total);
let off = 0;
for (const p of parts) { all.set(p, off); off += p.length; }
const wav = path.join(qaDir, 'montaje.wav');
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + all.length * 2, 4); header.write('WAVE', 8); header.write('fmt ', 12);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(all.length * 2, 40);
await fs.writeFile(wav, Buffer.concat([header, Buffer.from(all.buffer)]));
let heardWav = wav;
if (v3) {
  heardWav = path.join(qaDir, 'dialogue-v3.wav');
  await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(root, 'public', order.candidatoV3.timeline.audio.dialogue), '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', heardWav]);
}

const out = path.join(qaDir, v3 ? 'dialogue-v3' : 'montaje');
await run(path.join(root, '.whisper/whisper.cpp/main'), ['-ng', '-l', 'es', '-m', path.join(root, '.whisper/models/ggml-large-v3-turbo.bin'), '-oj', '-of', out, '--prompt', 'Apple, Samsung, iPhone, iPhone Duo, Galaxy, Galaxy Fold, Samsung Mobile MX, plegable, posicionamiento de marca.', '-f', heardWav], {maxBuffer: 1 << 26});
const heard = JSON.parse(await fs.readFile(out + '.json', 'utf8')).transcription.map((t) => ({text: t.text.trim(), from: t.offsets.from / 1000, to: t.offsets.to / 1000}));

const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, '');
const expected = cuts.flatMap((c) => c.text.split(/\s+/).map((w) => ({w: norm(w), cut: c.id}))).filter((x) => x.w);
const got = heard.flatMap((h) => h.text.split(/\s+/)).map(norm).filter(Boolean);
// alineación palabra a palabra (Levenshtein) para listar diferencias por plano
const n = expected.length, m = got.length;
const d = Array.from({length: n + 1}, (_, i) => new Uint16Array(m + 1).map((_, j) => (i === 0 ? j : j === 0 ? i : 0)));
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) d[i][j] = Math.min(d[i - 1][j - 1] + (expected[i - 1].w === got[j - 1] ? 0 : 1), d[i - 1][j] + 1, d[i][j - 1] + 1);
const diffs = [];
let i = n, j = m;
while (i > 0 || j > 0) {
  if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (expected[i - 1].w === got[j - 1] ? 0 : 1)) {
    if (expected[i - 1].w !== got[j - 1]) diffs.push({cut: expected[i - 1].cut, type: 'distinta', expected: expected[i - 1].w, heard: got[j - 1]});
    i--; j--;
  } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { diffs.push({cut: expected[i - 1].cut, type: 'falta', expected: expected[i - 1].w}); i--; }
  else { diffs.push({cut: expected[Math.max(0, i - 1)]?.cut, type: 'sobra', heard: got[j - 1]}); j--; }
}
diffs.reverse();
const wer = +(d[n][m] / n).toFixed(3);
const report = {
  createdAt: new Date().toISOString(), seconds: +(total / SR).toFixed(2), expectedWords: n, heardWords: m, wordErrorRate: wer,
  note: 'WER frente al texto previsto; incluye errores del propio transcriptor. Las diferencias concentradas en un borde de plano son las que importan.',
  edgeRisks: edges.filter((e) => e.headRisk || e.tailRisk), edges, diffs, transcript: heard.map((h) => h.text).join(' '),
};
await fs.writeFile(path.join(root, v3 ? 'analysis/video-001-v3-qa-audio.json' : 'analysis/video-001-qa-audio.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({seconds: report.seconds, wer, edgeRisks: report.edgeRisks.map((e) => `${e.id}:${e.headRisk ? 'inicio' : ''}${e.tailRisk ? 'final' : ''}`), diffs: diffs.length}));
