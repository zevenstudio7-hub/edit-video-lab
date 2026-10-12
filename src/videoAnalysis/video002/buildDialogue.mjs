// VIDEO-002: monta la pista de voz continua a partir de edl.cuts (corte por muestra, fundidos coseno, relleno de ambiente),
// iguala la sonoridad de las dos tomas y normaliza a −14 LUFS / −1,5 dBTP (loudnorm 2 pasadas).
// Salidas: public/video-002/dialogue.wav (48 kHz mono 24 bit) + analysis/video-002-dialogue.json (cortes en tiempo de salida).
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const ff = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-002.json'), 'utf8'));
const {edl} = order; const SR = edl.sampleRate;
const tmp = path.join(root, '.whisper/video-002/tmp'); fs.mkdirSync(tmp, {recursive: true});
const load = (f, af) => { const b = execFileSync(ff, ['-v', 'error', '-i', f, ...(af ? ['-af', af] : []), '-f', 'f32le', '-'], {maxBuffer: 1 << 30}); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const writeWav = (file, x, fmt = 'pcm_f32le') => { const raw = path.join(tmp, 'raw.f32'); fs.writeFileSync(raw, Buffer.from(x.buffer, x.byteOffset, x.byteLength)); execFileSync(ff, ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', raw, '-c:a', fmt, file]); };
function require_ebur(file) { const p = execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -nostats -i "${file}" -af ebur128=peak=true -f null - 2>&1 | tail -16`], {encoding: 'utf8'}); const I = [...p.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop(); const TP = [...p.matchAll(/Peak:\s+(-?[\d.]+) dBFS/g)].pop(); return {I: I ? +I[1] : null, TP: TP ? +TP[1] : null}; }
// fuentes con pasa-altos suave (80 Hz) para quitar retumbe sin tocar la voz
const src = Object.fromEntries(Object.entries(edl.tomas).map(([k, t]) => [k, load(path.join(root, t.audio), 'highpass=f=80:poles=2')]));
// 1) sonoridad de lo que se conserva de cada toma → ganancia para igualarlas
const kept = {}; for (const c of edl.cuts) (kept[c.toma] ??= []).push(src[c.toma].subarray(Math.round(c.in * SR), Math.round(c.out * SR)));
const lk = {}; for (const [k, parts] of Object.entries(kept)) { const n = parts.reduce((s, p) => s + p.length, 0), x = new Float32Array(n); let o = 0; for (const p of parts) { x.set(p, o); o += p.length; } const f = path.join(tmp, `kept-${k}.wav`); writeWav(f, x); lk[k] = require_ebur(f).I; }
const target = Object.values(lk).reduce((a, b) => a + b, 0) / Object.keys(lk).length;
const gain = Object.fromEntries(Object.entries(lk).map(([k, v]) => [k, 10 ** ((target - v) / 20)]));
// 2) montaje
const fade = (x, n, dir) => { for (let i = 0; i < n && i < x.length; i++) { const g = 0.5 - 0.5 * Math.cos(Math.PI * i / n); if (dir === 'in') x[i] *= g; else x[x.length - 1 - i] *= g; } };
const pieces = []; const mapa = []; let t = 0;
for (const c of edl.cuts) {
  const seg = src[c.toma].slice(Math.round(c.in * SR), Math.round(c.out * SR)).map((v) => v * gain[c.toma]);
  fade(seg, Math.round((c.fadeIn ?? edl.fundidoPorDefecto) * SR), 'in'); fade(seg, Math.round((c.fadeOut ?? edl.fundidoPorDefecto) * SR), 'out');
  pieces.push(seg); mapa.push({id: c.id, toma: c.toma, in: c.in, out: c.out, desde: +t.toFixed(4), hasta: +(t + seg.length / SR).toFixed(4)}); t += seg.length / SR;
  if (c.gapAfter) { const a = c.ambiente ?? edl.ambiente; const amb = src[a.toma].slice(Math.round(a.in * SR), Math.round(a.in * SR) + Math.round(c.gapAfter * SR)).map((v) => v * gain[a.toma]); fade(amb, Math.round(0.005 * SR), 'in'); fade(amb, Math.round(0.005 * SR), 'out'); pieces.push(amb); t += amb.length / SR; }
}
const n = pieces.reduce((s, p) => s + p.length, 0), y = new Float32Array(n); { let o = 0; for (const p of pieces) { y.set(p, o); o += p.length; } }
const pre = path.join(tmp, 'dialogue-pre.wav'); writeWav(pre, y);
// 3) loudnorm 2 pasadas
const p1 = execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -nostats -i "${pre}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`], {encoding: 'utf8'});
const m = JSON.parse(p1.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
const outDir = path.join(root, 'public/video-002'); fs.mkdirSync(outDir, {recursive: true});
// con voz mejorada del usuario (edl.vozMejorada) el montaje propio es la referencia de alineación (dialogue-original.wav);
// dialogue.wav lo escribe después useEnhancedVoice.mjs con la voz mejorada colocada a la muestra
const out1x = path.join(outDir, 'dialogue-1x.wav'), outFile = path.join(outDir, edl.vozMejorada ? 'dialogue-original.wav' : 'dialogue.wav');
const speed = edl.speed ?? 1, n2 = Math.round(n / speed);
// Rubber Band: cambia el tempo sin cambiar el tono (mismos ajustes que VIDEO-001)
const tempo = speed !== 1 ? `rubberband=tempo=${speed}:pitch=1:transients=mixed:detector=compound:phase=laminar:window=standard:smoothing=off:formant=preserved:pitchq=quality:channels=together,aresample=${SR},` : '';
const p2 = execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -nostats -y -i "${pre}" -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json,aresample=${SR},atrim=end_sample=${n} -ar ${SR} -c:a pcm_s24le "${out1x}" 2>&1`], {encoding: 'utf8'});
// pista a la velocidad pedida: tempo sobre el montaje sin normalizar y DESPUÉS loudnorm de 2 pasadas (como VIDEO-001):
// Rubber Band baja la sonoridad ~3 dB y sube los picos, así que la normalización tiene que ir detrás
const pre2 = path.join(tmp, 'dialogue-pre-tempo.wav');
execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -loglevel error -y -i "${pre}" -af "${tempo}apad=whole_len=${n2},atrim=end_sample=${n2}" -ar ${SR} -c:a pcm_f32le "${pre2}"`]);
const q1 = execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -nostats -i "${pre2}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`], {encoding: 'utf8'});
const mq = JSON.parse(q1.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
execFileSync('/bin/sh', ['-c', `"${ff}" -hide_banner -nostats -y -i "${pre2}" -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${mq.input_i}:measured_TP=${mq.input_tp}:measured_LRA=${mq.input_lra}:measured_thresh=${mq.input_thresh}:offset=${mq.target_offset}:linear=true,aresample=${SR},atrim=end_sample=${n2} -ar ${SR} -c:a pcm_s24le "${outFile}" 2>&1`], {encoding: 'utf8'});
const m2 = JSON.parse(p2.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
const fin = require_ebur(outFile), fin1x = require_ebur(out1x);
const report = {creado: new Date().toISOString(), velocidad: speed, duracion1x: +(n / SR).toFixed(4), duracion: +(n2 / SR).toFixed(4), frames: Math.round(n2 / SR * edl.fps), sonoridadTomas: lk, ganancias: Object.fromEntries(Object.entries(gain).map(([k, v]) => [k, +(20 * Math.log10(v)).toFixed(2)])), antes: {I: +m.input_i, TP: +m.input_tp, LRA: +m.input_lra}, despues: fin, despues1x: fin1x, modoLoudnorm: m2.normalization_type, cortes: mapa, nota: 'cortes.desde/hasta en segundos de la pista 1x (dialogue-1x.wav); en la pista final se dividen por la velocidad'};
fs.writeFileSync(path.join(root, 'analysis/video-002-dialogue.json'), JSON.stringify(report, null, 2) + '\n');
if (edl.vozMejorada) console.log('voz mejorada en la orden: ejecuta useEnhancedVoice.mjs para escribir public/video-002/dialogue.wav');
console.log(`voz: ${report.duracion1x} s a 1x → ${report.duracion} s a ${speed}x (${report.frames} frames) · tomas ${JSON.stringify(lk)} LUFS → ganancias ${JSON.stringify(report.ganancias)} dB · ${m.input_i} → ${fin.I} LUFS, TP ${fin.TP} dBTP (${m2.normalization_type})`);
