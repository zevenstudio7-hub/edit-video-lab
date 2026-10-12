// VIDEO-002: energía por bandas cada 10 ms en una ventana de una toma (para decidir fonemas dudosos y pausas).
// Uso: node bands.mjs <toma> <desde> <hasta>   (toma = FBF4A159… o B0B164E0…, segundos)
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const [, , toma, desde, hasta] = process.argv;
const SR = 48000, N = 1024, H = 480;
const b = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-i', path.join(root, `.whisper/video-002/${toma}.48k.wav`), '-ss', desde, '-to', hasta, '-f', 'f32le', '-'], {maxBuffer: 1 << 28});
const x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const p = i + k, q = p + len / 2, xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr; re[q] = re[p] - xr; im[q] = im[p] - xi; re[p] += xr; im[p] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const band = (P, lo, hi) => { let s = 0; for (let k = Math.round(lo * N / SR); k <= Math.round(hi * N / SR); k++) s += P[k]; return 10 * Math.log10(s + 1e-12); };
const rows = [];
for (let s = 0; s + N <= x.length; s += H) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = x[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); fft(re, im); const P = re.map((v, k) => v * v + im[k] * im[k]);
  rows.push({t: +desde + (s + N / 2) / SR, tot: band(P, 80, 8000), low: band(P, 300, 1200), f2: band(P, 1500, 2600), hi: band(P, 3500, 8000)}); }
const ref = Math.max(...rows.map((r) => r.tot));
for (const r of rows) { const bar = (v, c) => c.repeat(Math.max(0, Math.round((v - ref + 50) / 4))); console.log(`${r.t.toFixed(2)}  tot ${(r.tot - ref).toFixed(0).padStart(4)}  e/o ${(r.f2 - r.low).toFixed(0).padStart(4)}  agudos ${(r.hi - ref).toFixed(0).padStart(4)}  ${bar(r.tot, '█')}${' '.repeat(Math.max(0, 14 - Math.round((r.tot - ref + 50) / 4)))}|${bar(r.hi, '░')}`); }
