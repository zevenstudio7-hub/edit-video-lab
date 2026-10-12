// VIDEO-003 (método de VIDEO-002): pistas de efectos y de música con la longitud exacta de la timeline (48 kHz, mono, 24 bit).
//  - Efectos: suma de timeline.sfx (sonidos de library/sfx/sfx.json) con limitador local a −6 dBFS (como VIDEO-001).
//  - Música: base propia (library/music/synth-music.mjs) que baja bajo la voz (compresión por la envolvente de la pista
//    de diálogo) y en la última frase (criterio de VIDEO-002).
// Salidas: public/video-003/sfx.wav, public/video-003/music.wav + informe analysis/video-003-audio.json.
// Uso: node src/videoAnalysis/video003/buildAudioBeds.mjs   (después de buildTimeline.mjs)
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {synthMusic, wav24} from '../../../library/music/synth-music.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const ff = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const SR = 48000;
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-003.json'), 'utf8'));
const tl = order.timeline ?? (() => { throw new Error('Falta timeline: ejecuta buildTimeline.mjs'); })();
const total = Math.round((tl.durationInFrames / tl.fps) * SR), perFrame = SR / tl.fps;
const load = (f, af) => { const b = execFileSync(ff, ['-v', 'error', '-i', f, ...(af ? ['-af', af] : []), '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 30}); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const ebur = (f) => { const s = execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -nostats -i "${f}" -af ebur128=peak=true -f null - 2>&1`], {encoding: 'utf8', maxBuffer: 1 << 26}); const last = (re) => { const a = [...s.matchAll(re)]; return a.length ? +a[a.length - 1][1] : null; }; return {I: last(/I:\s+(-?[\d.]+) LUFS/g), TP: last(/Peak:\s+(-?[\d.]+) dBFS/g), Mmax: Math.max(...[...s.matchAll(/M:\s*(-?[\d.]+)/g)].map((m) => +m[1]).filter((v) => v > -70))}; };
const limit = (x, db) => { const ceil = 10 ** (db / 20), look = Math.round(0.0015 * SR), rel = Math.exp(-1 / (0.06 * SR)); let g = 1, min = 1; const need = Float32Array.from(x, (v) => (Math.abs(v) > ceil ? ceil / Math.abs(v) : 1)); for (let i = 0; i < x.length; i++) { let t = 1; for (let k = i; k < Math.min(x.length, i + look); k += 8) t = Math.min(t, need[k]); g = t < g ? t : 1 - (1 - g) * rel; min = Math.min(min, g); x[i] *= g; } return min; };

// ---------- efectos ----------
const lib = JSON.parse(fs.readFileSync(path.join(root, 'library/sfx/sfx.json'), 'utf8'));
const byId = new Map([...(lib.sonidos ?? []), ...(lib.sintetizados ?? [])].map((s) => [s.id, s]));
const cache = new Map();
const sfx = new Float32Array(total);
for (const c of tl.sfx) {
  if (!cache.has(c.sound)) cache.set(c.sound, load(path.join(root, byId.get(c.sound)?.archivo ?? (() => { throw new Error(`Sonido desconocido: ${c.sound}`); })())));
  const x = cache.get(c.sound), o = Math.round(c.frame * perFrame);
  for (let i = 0; i < x.length && o + i < total; i++) if (o + i >= 0) sfx[o + i] += x[i] * c.volume;
}
const sfxMin = limit(sfx, -6);
fs.writeFileSync(path.join(root, 'public', tl.audio.sfx), wav24(sfx));

// ---------- música con compresión por la voz ----------
const m = tl.musica;
const music = synthMusic({seconds: total / SR, bpm: m.bpm});
const voice = load(path.join(root, 'public', tl.audio.dialogue));
// envolvente de la voz (RMS 20 ms) → atenuación con ataque 60 ms y liberación 350 ms
const win = Math.round(0.02 * SR), duck = 10 ** (m.duckingDb / 20), finalG = 10 ** (m.finalDb / 20);
const att = Math.exp(-1 / (0.06 * SR)), relC = Math.exp(-1 / (0.35 * SR));
let g = 1, speaking = false;
const finalAt = Math.round(m.finalDesde * perFrame), finalRamp = Math.round(0.3 * SR);
for (let i = 0; i < total; i++) {
  if (i % win === 0) { let a = 0; for (let k = i; k < Math.min(total, i + win); k++) a += voice[k] * voice[k]; speaking = Math.sqrt(a / win) > 0.02; }
  const target = speaking ? duck : 1;
  g = target < g ? target + (g - target) * att : target + (g - target) * relC;
  const fin = i < finalAt ? 1 : 1 + (finalG - 1) * Math.min(1, (i - finalAt) / finalRamp);
  music[i] *= g * fin;
}
// nivel: la música queda en el nivel objetivo (LUFS integrados de la pista ya comprimida)
const tmp = path.join(root, '.whisper/video-003/tmp'); fs.mkdirSync(tmp, {recursive: true});
const probe = path.join(tmp, 'music-probe.wav'); fs.writeFileSync(probe, wav24(music));
const before = ebur(probe).I, gain = 10 ** ((m.nivel - before) / 20);
for (let i = 0; i < total; i++) music[i] *= gain;
limit(music, -12);
fs.writeFileSync(path.join(root, 'public', tl.audio.music), wav24(music));

const report = {
  creado: new Date().toISOString(),
  segundos: +(total / SR).toFixed(3),
  efectos: {cues: tl.sfx.length, limitadorMin: +sfxMin.toFixed(3), ...ebur(path.join(root, 'public', tl.audio.sfx))},
  musica: {generador: m.generador, bpm: m.bpm, compresionDb: m.duckingDb, finalDb: m.finalDb, ...ebur(path.join(root, 'public', tl.audio.music))},
  voz: ebur(path.join(root, 'public', tl.audio.dialogue)),
};
fs.writeFileSync(path.join(root, 'analysis/video-003-audio.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`efectos: ${report.efectos.cues} cues · I ${report.efectos.I} LUFS, momentánea máx ${report.efectos.Mmax} · música: I ${report.musica.I} LUFS, pico ${report.musica.TP} dBFS · voz: I ${report.voz.I} LUFS`);
