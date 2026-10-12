// VIDEO-002: actividad de voz cada 10 ms y pausas (≥ 100 ms) de cada toma, con las palabras de whisper (DTW) alrededor.
// Uso: node src/videoAnalysis/video002/pauses.mjs <toma> [umbral dB bajo el pico de voz, por defecto 32]
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(import.meta.dirname, '../../..');
const [, , toma, umbralArg] = process.argv;
const SR = 48000, H = 480, N = 960;
const b = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-i', path.join(root, `.whisper/video-002/${toma}.48k.wav`), '-af', 'highpass=f=90', '-f', 'f32le', '-'], {maxBuffer: 1 << 29});
const x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
const db = []; for (let s = 0; s + N <= x.length; s += H) { let e = 0; for (let i = 0; i < N; i++) e += x[s + i] ** 2; db.push(10 * Math.log10(e / N + 1e-12)); }
const sorted = [...db].sort((a, c) => a - c); const pico = sorted[Math.floor(sorted.length * 0.98)], suelo = sorted[Math.floor(sorted.length * 0.05)];
const umbral = pico - Number(umbralArg ?? 32);
const voz = db.map((v) => v > umbral);
// palabras (tokens de whisper agrupados)
const j = JSON.parse(fs.readFileSync(path.join(root, `analysis/video-002-whisper/${toma}.json`), 'utf8'));
const words = []; for (const s of j.transcription) for (const t of s.tokens) { if (t.text.startsWith('[_')) continue; const tt = t.t_dtw / 100; if (/^\s/.test(t.text) || !words.length) words.push({w: t.text.trim(), t: tt}); else words[words.length - 1].w += t.text; }
const near = (t) => { let i = words.findIndex((w) => w.t > t); if (i < 0) i = words.length; return `${words.slice(Math.max(0, i - 2), i).map((w) => w.w).join(' ')} ‖ ${words.slice(i, i + 2).map((w) => w.w).join(' ')}`; };
console.log(`${toma}: ${(x.length / SR).toFixed(2)} s · pico de voz ${pico.toFixed(1)} dB · suelo ${suelo.toFixed(1)} dB (ruido ${(suelo - pico).toFixed(1)} dB bajo la voz) · umbral ${umbral.toFixed(1)} dB`);
let i = 0; const gaps = [];
while (i < voz.length) { if (voz[i]) { i++; continue; } let k = i; while (k < voz.length && !voz[k]) k++; const a = i * H / SR, z = k * H / SR; if (z - a >= 0.1) gaps.push({a, z}); i = k; }
for (const g of gaps) console.log(`  pausa ${g.a.toFixed(2)}–${g.z.toFixed(2)} (${Math.round((g.z - g.a) * 1000)} ms)   ${near(g.a)}`);
