// VIDEO-002: afina las entradas/salidas de los cortes que caen en pausas, midiendo en la toma original dónde termina
// y empieza la voz (banda 300–2500 Hz, más «s» pegadas en 3,5–8 kHz) y dejando la pausa objetivo de cada unión.
// Uso: node refineCuts.mjs  → imprime los valores propuestos (se copian a writeEdl.mjs).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const {edl} = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-002.json'), 'utf8'));
const cache = {};
const prof = (toma) => cache[toma] ??= (() => {
  const f = path.join(root, edl.tomas[toma].audio);
  const read = (af) => { const b = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-i', f, '-af', af, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], {maxBuffer: 1 << 28}); const p = new Int16Array(b.buffer, b.byteOffset, b.length / 2); const db = []; for (let i = 0; i + 160 <= p.length; i += 160) { let a = 0; for (let j = i; j < i + 160; j++) a += p[j] * p[j]; db.push(20 * Math.log10(Math.sqrt(a / 160) / 32768 + 1e-9)); } return db; };
  const v = read('highpass=f=300,lowpass=f=2500'), h = read('highpass=f=3500');
  const pct = (a, q) => [...a].sort((x, y) => x - y)[Math.floor(a.length * q)];
  return {v, h, vt: pct(v, 0.97) - 28, ht: pct(h, 0.97) - 22};
})();
const isVoice = (P, i) => P.v[i] > P.vt;
// fin de voz: última trama con voz antes de `t` (buscando hacia atrás hasta 1,5 s), más una «s» pegada (≤ 200 ms)
const voiceEnd = (toma, t) => { const P = prof(toma); let i = Math.round(t * 100); for (let k = 0; k < 150 && !isVoice(P, i); k++) i--; let e = i; for (let k = 1; k <= 20 && (P.h[i + k] > P.ht); k++) e = i + k; return (e + 1) / 100; };
// inicio de voz: primera trama con voz después de `t` (hasta 2,5 s), adelantado si hay una «s» inicial (≤ 150 ms)
const voiceStart = (toma, t) => { const P = prof(toma); let i = Math.round(t * 100); for (let k = 0; k < 250 && !isVoice(P, i); k++) i++; let s = i; for (let k = 1; k <= 15 && (P.h[i - k] > P.ht); k++) s = i - k; return s / 100; };
const objetivo = {inicio: 0.08, 'a02>a03': 0.30, 'a03>a04': 0.38, 'a04>a05': 0.38, 'a05>a06': 0.32, 'a06>a07': 0.28, 'a07>b01': 0.32, 'b02>b03': 0.36, 'b03>b04': 0.40, 'b04>b05': 0.35, 'b05>b06': 0.36, 'b06>b07': 0.30, 'b07>b08': 0.22, final: 0.30};
const cuts = edl.cuts.map((c) => ({...c}));
const first = cuts[0]; const s0 = voiceStart(first.toma, first.in); first.in = +(s0 - objetivo.inicio).toFixed(3);
for (let k = 0; k < cuts.length - 1; k++) {
  const a = cuts[k], b = cuts[k + 1], key = `${a.id}>${b.id}`;
  if (!(key in objetivo)) continue; // uniones dentro de voz continua: no se tocan
  const end = voiceEnd(a.toma, a.out), start = voiceStart(b.toma, b.in), T = objetivo[key];
  const h = Math.max(0.09, +(T * 0.55).toFixed(3)), t = Math.max(0.07, +(T - h).toFixed(3));
  a.out = +(end + h).toFixed(3); b.in = +(start - t).toFixed(3); a.fadeOut = a.fadeOut ?? 0.025; b.fadeIn = b.fadeIn ?? 0.025;
  console.log(`${key.padEnd(8)} voz termina ${end.toFixed(2)} (${a.toma}) · empieza ${start.toFixed(2)} (${b.toma}) → out ${a.out} · in ${b.in} · pausa ${Math.round(T * 1000)} ms`);
}
const last = cuts[cuts.length - 1]; const e9 = voiceEnd(last.toma, last.out); last.out = +(e9 + objetivo.final).toFixed(3);
console.log(`inicio ${first.id}.in = ${first.in} (voz en ${s0.toFixed(2)}) · final ${last.id}.out = ${last.out} (voz termina ${e9.toFixed(2)})`);
console.log(JSON.stringify(cuts.map(({id, in: i, out: o, fadeIn, fadeOut}) => ({id, in: i, out: o, fadeIn, fadeOut}))));
