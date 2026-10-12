// Pista de efectos de la candidata V3 (VIDEO-001): mezcla todos los cues de candidatoV3.timeline.sfx en un solo WAV
// (48 kHz, mono, 24 bit) con la longitud exacta de la timeline. La composición la reproduce con Html5Audio, igual
// que la voz: un único <audio> en la vista previa y la misma mezcla en el render.
// Los sonidos salen de library/sfx/sfx.json («sonidos» CC0 descargados y «sintetizados» propios).
// Salidas: public/video-001/v3/sfx.wav + informe en analysis/video-001-v3-sfx.json (cues, picos, nivel frente a la voz).
//
// Uso: node src/videoAnalysis/buildSfxBed.mjs   (tras buildEditV3.mjs; para los «zp-», library/sfx/synth-sfx.mjs)
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const SR = 48000;
const order = JSON.parse(await fs.readFile(path.join(root, 'video-orders/VIDEO-001.json'), 'utf8'));
const tl = order.candidatoV3?.timeline ?? (() => { throw new Error('Falta candidatoV3.timeline: ejecuta buildEditV3.mjs'); })();
const lib = JSON.parse(await fs.readFile(path.join(root, 'library/sfx/sfx.json'), 'utf8'));
const byId = new Map([...(lib.sonidos ?? []), ...(lib.sintetizados ?? [])].map((s) => [s.id, s]));
const perFrame = SR / tl.fps;
const total = tl.durationInFrames * perFrame;

const cache = new Map();
const pcm = async (id) => {
  if (!cache.has(id)) {
    const s = byId.get(id);
    if (!s) throw new Error(`Sonido desconocido: ${id}`);
    const {stdout} = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(root, s.archivo), '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {encoding: 'buffer', maxBuffer: 1 << 26});
    cache.set(id, new Float32Array(stdout.buffer, stdout.byteOffset, stdout.byteLength / 4));
  }
  return cache.get(id);
};

const out = new Float32Array(total);
for (const c of tl.sfx) {
  const x = await pcm(c.sound);
  const o = c.frame * perFrame;
  const g = c.volume ?? byId.get(c.sound).volumen;
  for (let i = 0; i < x.length && o + i < total; i++) out[o + i] += x[i] * g;
}
let peak = 0, peakAt = 0;
for (let i = 0; i < total; i++) if (Math.abs(out[i]) > peak) { peak = Math.abs(out[i]); peakAt = i; }
// seguridad: limitador local a −6 dBFS (anticipación 1,5 ms, liberación 60 ms). Solo actúa donde un pico o una
// superposición pasa del techo; el resto de la pista queda intacto (antes se bajaba la pista entera).
const ceiling = 10 ** (-6 / 20);
const look = Math.round(0.0015 * SR), rel = Math.exp(-1 / (0.06 * SR));
let g = 1, limited = 0, minGain = 1;
const need = new Float32Array(total);
for (let i = 0; i < total; i++) need[i] = Math.abs(out[i]) > ceiling ? ceiling / Math.abs(out[i]) : 1;
// mínimo de la ganancia necesaria en la ventana de anticipación (cola deslizante simple)
for (let i = 0; i < total; i++) {
  let target = 1;
  for (let k = i; k < Math.min(total, i + look); k += 8) target = Math.min(target, need[k]);
  g = target < g ? target : 1 - (1 - g) * rel;
  if (g < 0.999) limited++;
  minGain = Math.min(minGain, g);
  out[i] *= g;
}
const safety = minGain;

const wav24 = (x) => {
  const data = Buffer.alloc(x.length * 3);
  for (let i = 0; i < x.length; i++) data.writeIntLE(Math.max(-8388608, Math.min(8388607, Math.round(x[i] * 8388607))), i * 3, 3);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 3, 28); h.writeUInt16LE(3, 32); h.writeUInt16LE(24, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};
const bedPath = path.join(root, 'public', tl.audio.sfxBed ?? 'video-001/v3/sfx.wav');
await fs.mkdir(path.dirname(bedPath), {recursive: true});
await fs.writeFile(bedPath, wav24(out));

// nivel frente a la voz: picos de cada efecto y sonoridad momentánea máxima de la pista de efectos
const ebur = async (f) => {
  const {stderr} = await run(ffmpeg, ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], {maxBuffer: 1 << 26}).catch((e) => e);
  // el resumen va al final de la salida: se toma la última coincidencia
  const num = (re) => { const all = [...stderr.matchAll(new RegExp(re.source, 'g'))]; return all.length ? +all[all.length - 1][1] : null; };
  return {I: num(/I:\s+(-?[\d.]+) LUFS/), TP: num(/Peak:\s+(-?[\d.]+) dBFS/), Mmax: Math.max(...[...stderr.matchAll(/M:\s*(-?[\d.]+)/g)].map((m) => +m[1]).filter((v) => v > -70))};
};
const bed = await ebur(bedPath);
const voice = tl.audio.dialogue ? await ebur(path.join(root, 'public', tl.audio.dialogue)) : null;
const counts = {};
for (const c of tl.sfx) counts[c.sound] = (counts[c.sound] ?? 0) + 1;
const report = {
  createdAt: new Date().toISOString(),
  method: 'Suma de cues por muestra (frame × 1600) con la ganancia de cada cue; limitador local a −6 dBFS solo donde un pico lo supera. Sonidos: library/sfx/sfx.json.',
  seconds: +(tl.durationInFrames / tl.fps).toFixed(3),
  cues: tl.sfx.length, descartados: tl.sfxDropped?.length ?? 0, porSonido: counts,
  picoAntesDeSeguridad_dBFS: +(20 * Math.log10(peak + 1e-12)).toFixed(1), picoEn_s: +(peakAt / SR).toFixed(2), limitador: {gananciaMinima: +safety.toFixed(3), segundosLimitados: +(limited / SR).toFixed(3)},
  efectos: bed, voz: voice,
  nota: 'Momentánea máxima de los efectos frente a la integrada de la voz: los efectos deben quedar por debajo de la voz. Ajustar escuchando.',
};
await fs.writeFile(path.join(root, 'analysis/video-001-v3-sfx.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`efectos: ${report.cues} cues (${report.descartados} descartados) → ${path.relative(root, bedPath)} · pico ${report.picoAntesDeSeguridad_dBFS} dBFS${safety < 0.999 ? ` (limitado ${report.limitador.segundosLimitados} s, mín ×${report.limitador.gananciaMinima})` : ''} · momentánea máx ${bed.Mmax} LUFS · voz ${voice?.I} LUFS`);
