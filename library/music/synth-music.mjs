// Base musical instrumental propia (sin letra) generada por síntesis determinista: sin descargas ni licencias de
// terceros. Pensada para ir muy por debajo de una voz en off: pad cálido, arpegio suave en corcheas, pulso grave muy
// bajo y un shaker casi inaudible, sobre una progresión de cuatro acordes que se repite cada 8 compases.
//
// Uso como módulo: import {synthMusic} from 'library/music/synth-music.mjs' → Float32Array (48 kHz, mono)
// Uso por consola: node library/music/synth-music.mjs <segundos> <salida.wav> [bpm]
import fs from 'node:fs';

const SR = 48000;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
// Fmaj7 – G6 – Em7 – Am7 (dos compases cada uno)
const CHORDS = [[53, 57, 60, 64], [55, 59, 62, 64], [52, 55, 59, 62], [57, 60, 64, 67]];
const BASS = [41, 43, 40, 45];

let seed = 7;
const rand = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; };
const lowpass = (x, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y = (1 - a) * x[i] + a * y; x[i] = y; } return x; };
const highpass = (x, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0, px = 0; for (let i = 0; i < x.length; i++) { const v = a * (y + x[i] - px); px = x[i]; y = v; x[i] = v; } return x; };

export function synthMusic({seconds, bpm = 96}) {
  seed = 7;
  const n = Math.round(seconds * SR), beat = 60 / bpm, bar = 4 * beat;
  const pad = new Float32Array(n), arp = new Float32Array(n), low = new Float32Array(n), perc = new Float32Array(n);
  const chordAt = (t) => Math.floor(t / (2 * bar)) % CHORDS.length;
  // pad: tres osciladores ligeramente desafinados por nota, ataque y caída lentos en cada cambio de acorde
  for (let i = 0; i < n; i++) {
    const t = i / SR, c = chordAt(t), tc = t % (2 * bar);
    const envPad = Math.min(1, tc / 0.9) * (tc > 2 * bar - 0.6 ? Math.max(0, (2 * bar - tc) / 0.6) * 0.6 + 0.4 : 1);
    let v = 0;
    for (const note of CHORDS[c]) { const f = midi(note); v += Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 1.003 * t + 1.1) + 0.25 * Math.sin(2 * Math.PI * f * 2.001 * t + 0.4); }
    pad[i] = v * envPad * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.11 * t));
  }
  lowpass(lowpass(pad, 1400), 1800);
  // arpegio en corcheas (notas del acorde, una octava arriba), cada nota con caída corta
  const eighth = beat / 2;
  for (let k = 0; k * eighth < seconds; k++) {
    const t0 = k * eighth, c = chordAt(t0), notes = CHORDS[c], note = notes[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12, f = midi(note);
    const g = (k % 2 ? 0.55 : 0.8) * (0.9 + 0.1 * rand());
    for (let i = Math.round(t0 * SR), j = 0; i < Math.min(n, Math.round((t0 + 0.6) * SR)); i++, j++) { const tt = j / SR; arp[i] += g * Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt / 0.16) * Math.min(1, tt / 0.004); }
  }
  lowpass(arp, 3200);
  // bajo suave en negras + pulso grave en los tiempos 1 y 3
  for (let k = 0; k * beat < seconds; k++) {
    const t0 = k * beat, f = midi(BASS[chordAt(t0)]);
    for (let i = Math.round(t0 * SR), j = 0; i < Math.min(n, Math.round((t0 + beat) * SR)); i++, j++) { const tt = j / SR; low[i] += 0.5 * Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt / 0.35) * Math.min(1, tt / 0.01); }
    if (k % 2 === 0) for (let i = Math.round(t0 * SR), j = 0; i < Math.min(n, Math.round((t0 + 0.25) * SR)); i++, j++) { const tt = j / SR; low[i] += 0.6 * Math.sin(2 * Math.PI * (55 + 50 * Math.exp(-tt / 0.03)) * tt) * Math.exp(-tt / 0.09); }
  }
  lowpass(low, 400);
  // shaker en contratiempos, muy bajo
  for (let k = 0; k * eighth < seconds; k++) {
    if (k % 2 === 0) continue;
    const t0 = k * eighth;
    for (let i = Math.round(t0 * SR), j = 0; i < Math.min(n, Math.round((t0 + 0.07) * SR)); i++, j++) { const tt = j / SR; perc[i] += rand() * Math.exp(-tt / 0.018) * Math.min(1, tt / 0.003); }
  }
  highpass(highpass(perc, 5000), 5000);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = 0.16 * pad[i] + 0.10 * arp[i] + 0.22 * low[i] + 0.035 * perc[i];
  // entrada y salida suaves
  const fi = Math.round(1.2 * SR), fo = Math.round(2.0 * SR);
  for (let i = 0; i < fi && i < n; i++) out[i] *= i / fi;
  for (let i = 0; i < fo && i < n; i++) out[n - 1 - i] *= i / fo;
  let peak = 0; for (const v of out) peak = Math.max(peak, Math.abs(v));
  const g = 10 ** (-3 / 20) / (peak || 1);
  for (let i = 0; i < n; i++) out[i] *= g;
  return out;
}

export function wav24(x) {
  const data = Buffer.alloc(x.length * 3);
  for (let i = 0; i < x.length; i++) data.writeIntLE(Math.max(-8388608, Math.min(8388607, Math.round(x[i] * 8388607))), i * 3, 3);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 3, 28); h.writeUInt16LE(3, 32); h.writeUInt16LE(24, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , secs, out, bpm] = process.argv;
  if (!secs || !out) { console.error('Uso: node library/music/synth-music.mjs <segundos> <salida.wav> [bpm]'); process.exit(1); }
  fs.writeFileSync(out, wav24(synthMusic({seconds: +secs, bpm: bpm ? +bpm : 96})));
  console.log(`música: ${secs} s → ${out}`);
}
