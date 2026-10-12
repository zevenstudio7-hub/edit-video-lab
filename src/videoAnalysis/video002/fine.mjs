// VIDEO-002: perfil fino (5 ms) de energía y F2 aproximado alrededor de un corte dentro de voz continua.
// Uso: node fine.mjs <toma> <desde> <hasta>
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const [, , toma, desde, hasta] = process.argv;
const SR = 48000, N = 1024, H = 240;
const b = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-i', path.join(root, `.whisper/video-002/${toma}.48k.wav`), '-ss', desde, '-to', hasta, '-f', 'f32le', '-'], {maxBuffer: 1 << 26});
const x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const p = i + k, q = p + len / 2, xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr; re[q] = re[p] - xr; im[q] = im[p] - xi; re[p] += xr; im[p] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const out = [];
for (let s = 0; s + N <= x.length; s += H) { const re = new Float64Array(N), im = new Float64Array(N); let e = 0; for (let i = 0; i < N; i++) { re[i] = x[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); } for (let i = s + 384; i < s + 640; i++) e += x[i] * x[i];
  fft(re, im); let num = 0, den = 0; for (let k = Math.round(800 * N / SR); k <= Math.round(2800 * N / SR); k++) { const P = re[k] * re[k] + im[k] * im[k]; num += P * k * SR / N; den += P; }
  out.push(`${(+desde + (s + N / 2) / SR).toFixed(3)} ${(10 * Math.log10(e / 256 + 1e-12)).toFixed(0)}dB F2≈${Math.round(num / den)}`); }
console.log(out.join(' | '));
