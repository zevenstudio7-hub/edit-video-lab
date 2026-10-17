// VIDEO-009: ajusta cada corte de la orden a la energía real del audio (ventanas de 10 ms).
// Entrada: edl[].aprox_s (rango aproximado) y la fuente (wav 16 kHz). El corte entra 70 ms antes del inicio de la voz y sale 120 ms
// después de su final, dentro del silencio; se informa la energía en cada punto de corte para comprobar que no cae sobre voz.
// Uso: node src/videoAnalysis/video009/refineCuts.mjs   (reescribe edl[].in_s / out_s en video-orders/VIDEO-009.json)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-009.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const SR = 16000, WIN = 160; // 10 ms
const cache = {};
const envOf = (src) => {
  if (cache[src.id]) return cache[src.id];
  const wav = fs.readFileSync(path.join(root, src.wav));
  const pcm = new Int16Array(wav.buffer, wav.byteOffset + 44, (wav.length - 44) >> 1);
  const env = [];
  for (let i = 0; i + WIN <= pcm.length; i += WIN) {
    let s = 0;
    for (let k = 0; k < WIN; k++) s += pcm[i + k] * pcm[i + k];
    env.push(20 * Math.log10(Math.sqrt(s / WIN) + 1) - 90.3);
  }
  return (cache[src.id] = env);
};
// 1.ª pasada: inicio y final de la voz de cada corte; 2.ª: punto de corte = mínimo de energía del hueco
const info = order.edl.map((c) => {
  const src = order.fuentes.tomas.find((t) => t.id === c.src);
  const env = envOf(src);
  const [a, b] = c.aprox_s;
  let i0 = Math.round(a / 0.01), i1 = Math.round(b / 0.01);
  while (i0 < i1 && env[i0] < src.umbral_db) i0++;
  while (i1 > i0 && env[i1] < src.umbral_db) i1--;
  return {c, env, on: i0, off: i1 + 1};
});
info.forEach((x, k) => {
  const {c, env, on, off} = x;
  const prev = info.filter((y, j) => j !== k && y.c.src === c.src && y.off <= on).sort((p, q) => q.off - p.off)[0];
  const next = info.filter((y, j) => j !== k && y.c.src === c.src && y.on >= off).sort((p, q) => p.on - q.on)[0];
  const argmin = (x0, x1) => { let m = x0; for (let q = x0; q <= x1; q++) if (env[q] < env[m]) m = q; return m; };
  const inLo = Math.max(on - 12, prev ? prev.off + 1 : 0), inHi = on - 1;
  const outLo = off + 1, outHi = Math.min(off + 16, next ? next.on - 3 : off + 16);
  const inI = argmin(Math.min(inLo, inHi), inHi);
  const outI = argmin(outLo, Math.max(outLo, outHi));
  c.in_s = +(inI * 0.01).toFixed(2);
  c.out_s = +(outI * 0.01 + (c.hold_s ?? 0)).toFixed(2); // hold_s: cola de silencio opcional (p. ej. para que termine una animación)
  c.voz_s = [+(on * 0.01).toFixed(2), +(off * 0.01).toFixed(2)];
  c.energia_corte_db = [+env[inI].toFixed(1), +env[outI].toFixed(1)];
  console.log(c.id, c.src, 'voz', c.voz_s.join('–'), 'corte', c.in_s, c.out_s, 'energía en cortes (dB)', c.energia_corte_db.join(' / '));
});
fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));
