// VIDEO-002: sustituye la voz montada por la versión mejorada que entrega el usuario (ya trabajada fuera del laboratorio).
//  1. Guarda la voz montada como public/video-002/dialogue-original.wav (una sola vez) y la usa de referencia.
//  2. Mide el desfase de la voz mejorada contra la referencia: envolvente para el desfase grueso y forma de onda,
//     en ventanas de 1 s cada 4 s, para afinarlo a la muestra. Aborta si deriva (otro tempo u otro montaje).
//  3. Coloca la voz mejorada a la muestra exacta de la referencia, que cuadra con la timeline: el contenido no se
//     retrasa ni se adelanta. La deja en mono (media L/R) y con la misma duración que la referencia.
//  4. Iguala el nivel integrado de la referencia con ganancia fija y contiene los picos con un limitador de pico
//     verdadero con anticipación (sin latencia). No aplica ningún otro proceso.
//  5. Escribe public/video-002/dialogue.wav (la pista de voz que lee la composición) y analysis/video-002-voz-mejorada.json.
// Uso: node src/videoAnalysis/video002/useEnhancedVoice.mjs ["<voz mejorada>"]   (por defecto, edl.vozMejorada.archivo)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const SR = 48000;
const pub = path.join(root, 'public/video-002');
const outFile = path.join(pub, 'dialogue.wav'), refFile = path.join(pub, 'dialogue-original.wav');
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-002.json'), 'utf8'));
const src = path.resolve(root, process.argv[2] ?? order.edl.vozMejorada?.archivo ?? 'formatos/edit-1-motion/RSS - Entretenimiento/material/audio muse-enhanced-v2.mp3');
const CEILING_DBTP = -1.5; // techo del limitador; la voz anterior quedó en −1,4 dBTP
const ATTACK = Math.round(0.005 * SR), RELEASE_S = 0.08;
const rel = (p) => path.relative(root, p);

if (!fs.existsSync(refFile)) fs.copyFileSync(outFile, refFile, fs.constants.COPYFILE_EXCL);

// ---------- lectura ----------
const channels = (file) => { const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file], {encoding: 'utf8'}); return /Audio:.*\bmono\b/.test(r.stderr) ? 1 : 2; };
const decode = (file) => {
  const mono = channels(file) === 1;
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', file, ...(mono ? ['-ac', '1'] : ['-af', 'pan=mono|c0=0.5*c0+0.5*c1']), '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 30});
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4).slice();
};
const ref = decode(refFile), enh = decode(src);

// ---------- desfase ----------
const env = (x, hop = 48, win = 192) => { const n = Math.floor(x.length / hop), e = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0; const a = i * hop; for (let k = 0; k < win && a + k < x.length; k++) s += x[a + k] ** 2; e[i] = Math.log10(Math.sqrt(s / win) + 1e-4); } return e; };
const ncc = (a, b, lag) => { let sa = 0, sb = 0, sab = 0, saa = 0, sbb = 0, n = 0; for (let t = 0; t < b.length; t++) { const u = t + lag; if (u < 0 || u >= a.length) continue; const x = a[u], y = b[t]; sa += x; sb += y; sab += x * y; saa += x * x; sbb += y * y; n++; } return (sab - sa * sb / n) / Math.sqrt((saa - sa * sa / n) * (sbb - sb * sb / n)); };
const Ee = env(enh), Er = env(ref);
let coarse = {lag: 0, c: -1};
for (let lag = -3000; lag <= 3000; lag++) { const c = ncc(Ee, Er, lag); if (c > coarse.c) coarse = {lag, c}; }
const fineAt = (x, center) => {
  const out = [];
  for (let a = 2 * SR; a + 2 * SR < ref.length; a += 4 * SR) {
    let e2 = 0; for (let k = 0; k < SR; k++) e2 += ref[a + k] ** 2;
    if (e2 / SR < 1e-4) continue; // ventana sin voz
    let best = {lag: 0, c: -1};
    for (let lag = center - 96; lag <= center + 96; lag++) { let sab = 0, saa = 0, sbb = 0; for (let k = 0; k < SR; k++) { const p = x[a + k + lag] ?? 0, q = ref[a + k]; sab += p * q; saa += p * p; sbb += q * q; } const c = sab / Math.sqrt(saa * sbb); if (c > best.c) best = {lag, c}; }
    out.push({s: a / SR, muestras: best.lag, correlacion: +best.c.toFixed(3)});
  }
  return out;
};
const windows = fineAt(enh, coarse.lag * 48);
const lags = windows.map((w) => w.muestras).sort((p, q) => p - q);
const lag = lags[Math.floor(lags.length / 2)], spread = lags.at(-1) - lags[0];
const medCorr = windows.map((w) => w.correlacion).sort((p, q) => p - q)[Math.floor(windows.length / 2)];
if (medCorr < 0.6) throw new Error(`la voz mejorada no coincide con la voz montada (correlación ${medCorr})`);
if (spread > 8) throw new Error(`la voz mejorada deriva respecto de la voz montada: desfases de ${lags[0]} a ${lags.at(-1)} muestras`);

// ---------- colocación ----------
const N = ref.length, x = new Float32Array(N);
for (let n = 0; n < N; n++) x[n] = enh[n + lag] ?? 0;
const valid = Math.min(N, enh.length - lag), FADE = 480;
for (let k = 0; k < FADE; k++) { const n = valid - FADE + k; if (n >= 0 && n < N) x[n] *= 0.5 * (1 + Math.cos(Math.PI * (k + 1) / FADE)); }
let dropped = 0; for (let n = 0; n < Math.max(0, lag); n++) dropped = Math.max(dropped, Math.abs(enh[n]));

// ---------- nivel ----------
const measure = (sig) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-', '-af', 'ebur128=peak=true', '-f', 'null', '-'], {input: Buffer.from(sig.buffer, sig.byteOffset, sig.byteLength), encoding: 'utf8', maxBuffer: 1 << 30});
  const sum = r.stderr.slice(r.stderr.lastIndexOf('Summary'));
  return {I: +sum.match(/I:\s+(-?[\d.]+) LUFS/)[1], TP: +sum.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/)[1]};
};
// pico verdadero por tramo [n, n+1]: interpolación ×4 con sinc enventanado (Blackman, 32 muestras)
const H = 16, kern = [1, 2, 3].map((p) => { const h = []; for (let k = -H + 1; k <= H; k++) { const d = p / 4 - k, s = Math.sin(Math.PI * d) / (Math.PI * d), w = 0.42 + 0.5 * Math.cos(Math.PI * d / H) + 0.08 * Math.cos(2 * Math.PI * d / H); h.push(s * w); } return h; });
const tp = new Float32Array(N);
for (let n = 0; n < N; n++) {
  let m = Math.max(Math.abs(x[n]), Math.abs(x[n + 1] ?? 0));
  for (const h of kern) { let s = 0; for (let k = -H + 1, j = 0; k <= H; k++, j++) s += (x[n + k] ?? 0) * h[j]; m = Math.max(m, Math.abs(s)); }
  tp[n] = m;
}
const limit = (G) => {
  const C = 10 ** (CEILING_DBTP / 20), r = new Float32Array(N);
  for (let n = 0; n < N; n++) r[n] = Math.min(1, C / (G * tp[n] + 1e-12), n > 0 ? C / (G * tp[n - 1] + 1e-12) : 1);
  // anticipación: mínimo de [n, n + ATTACK] y media de [n - ATTACK, n] → la ganancia ya ha bajado al llegar el pico
  const g1 = new Float32Array(N), dq = new Int32Array(N); let h = 0, t = 0;
  for (let i = 0; i < N; i++) {
    while (t > h && r[dq[t - 1]] >= r[i]) t--;
    dq[t++] = i;
    const left = i - ATTACK;
    if (left >= 0) { while (dq[h] < left) h++; g1[left] = r[dq[h]]; }
  }
  for (let left = Math.max(0, N - ATTACK); left < N; left++) { while (dq[h] < left) h++; g1[left] = r[dq[h]]; }
  const g = new Float32Array(N); let acc = 0;
  for (let n = 0; n < N; n++) { acc += g1[n]; if (n > ATTACK) acc -= g1[n - ATTACK - 1]; g[n] = acc / Math.min(n + 1, ATTACK + 1); }
  // liberación exponencial
  const a = 1 - Math.exp(-1 / (RELEASE_S * SR));
  for (let n = 1; n < N; n++) g[n] = Math.min(g[n], g[n - 1] + (1 - g[n - 1]) * a);
  const y = new Float32Array(N); for (let n = 0; n < N; n++) y[n] = x[n] * G * g[n];
  return {y, g};
};
const target = measure(ref), before = measure(x);
let G = 10 ** ((target.I - before.I) / 20), res;
for (let it = 0; it < 6; it++) { res = limit(G); const m = measure(res.y); res.m = m; if (Math.abs(m.I - target.I) < 0.03) break; G *= 10 ** ((target.I - m.I) / 20); }
const grDb = Float64Array.from(res.g, (v) => -20 * Math.log10(v));
const share = (th) => +(100 * grDb.filter((v) => v > th).length / N).toFixed(1);

// ---------- escritura y verificación ----------
const w = spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', outFile], {input: Buffer.from(res.y.buffer)});
if (w.status !== 0) throw new Error(String(w.stderr));
const written = decode(outFile), check = fineAt(written, 0);
const report = {
  video: 'VIDEO-002', fecha: new Date().toISOString().slice(0, 10),
  fuente: {archivo: rel(src), md5: crypto.createHash('md5').update(fs.readFileSync(src)).digest('hex'), canales: channels(src), muestras48k: enh.length, nivel: measure(enh)},
  referencia: {archivo: rel(refFile), muestras: N, nivel: target, nota: 'voz montada a 1.1x que cuadra con la timeline (±2,5 ms frente a t/1.1)'},
  desfase: {muestras: lag, ms: +(lag / SR * 1000).toFixed(2), sentido: lag > 0 ? 'la voz mejorada llegaba tarde; se adelanta' : lag < 0 ? 'la voz mejorada llegaba antes; se retrasa' : 'sin desfase', dispersionMuestras: spread, correlacionMediana: medCorr, ventanas: windows, picoDescartadoDbfs: +(20 * Math.log10(dropped + 1e-12)).toFixed(1)},
  nivel: {gananciaDb: +(20 * Math.log10(G)).toFixed(2), techoDbtp: CEILING_DBTP, ataqueMs: ATTACK / SR * 1000, liberacionMs: RELEASE_S * 1000, reduccionMaxDb: +grDb.reduce((p, v) => Math.max(p, v), 0).toFixed(2), tiempoConReduccion: {'>0,5 dB %': share(0.5), '>1 dB %': share(1), '>3 dB %': share(3)}},
  salida: {archivo: rel(outFile), muestras: written.length, nivel: measure(written), desfaseResidualMuestras: [...new Set(check.map((c) => c.muestras))]},
};
fs.writeFileSync(path.join(root, 'analysis/video-002-voz-mejorada.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({desfase: report.desfase.muestras, ms: report.desfase.ms, dispersion: spread, correlacion: medCorr, descartado: report.desfase.picoDescartadoDbfs, nivel: report.nivel, salida: report.salida}, null, 1));
