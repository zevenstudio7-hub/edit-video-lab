// VIDEO-008 (#edit-2-pantalla-dividida, «Dashboard de la agencia con agentes de IA»): resuelve el montaje.
//  1. Tramos que se conservan (edl.keep, por índices de palabra de whisper) → regiones de voz medidas en la banda
//     200–3500 Hz; las pausas internas de más de 0,32 s se comprimen (se corta en el medio y quedan ~0,3 s).
//  2. Voz montada: public/video-008/dialogue.wav (fundidos de 8 ms, normalizada a −14 LUFS / −1,5 dBTP).
//  3. Timeline a 24 fps: planos del presentador, palabras corregidas, bloques de subtítulos S6 (sin palabra clave),
//     reparto (presentador completo / pantalla dividida) y tomas de apoyo ancladas a palabras.
// Uso: node src/videoAnalysis/video008/buildEdit.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-008.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const {edl} = order;
const FPS = edl.fps, SR = 48000;
const src = path.join(root, '.whisper/video-008/main-48k.wav');
const out = path.join(root, 'public/video-008/dialogue.wav');

// ---------- palabras (whisper + correcciones) ----------
const wj = JSON.parse(fs.readFileSync(path.join(root, '.whisper/video-008/main.json'), 'utf8'));
let words = wj.transcription.map((s) => ({t: s.text.trim(), a: s.offsets.from / 1000, b: s.offsets.to / 1000})).filter((w) => w.t);
for (const [i, t] of Object.entries(edl.correcciones)) words[+i].t = t;
words = words.map((w, i) => ({...w, i})).filter((w) => w.t !== '');

// ---------- energía de la voz cada 10 ms ----------
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', src, '-af', 'highpass=f=200,lowpass=f=3500', '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], {maxBuffer: 1 << 30});
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const HOP = 480, db = [];
for (let a = 0; a + HOP <= x.length; a += HOP) { let s = 0; for (let k = 0; k < HOP; k++) s += x[a + k] ** 2; db.push(10 * Math.log10(s / HOP + 1e-12)); }
const sorted = [...db].sort((p, q) => p - q), floor = sorted[Math.floor(sorted.length * 0.15)];
const TH = floor + 14;
const voiced = (t) => db[Math.round(t * 100)] > TH;

// ---------- regiones de voz por tramo ----------
// Límites de cada tramo en el punto de menor energía entre su primera palabra y la anterior, y entre su última
// palabra y la siguiente (whisper da tiempos de palabra aproximados: así no se arrastra el inicio de otra palabra).
const MAXGAP = 0.45, KEEPGAP = 0.32, LEAD = 0.05, TAIL = 0.09;
const argmin = (t0, t1) => { let best = t0, v = Infinity; for (let t = t0; t <= t1; t += 0.01) { const d = db[Math.round(t * 100)]; if (d < v) { v = d; best = t; } } return best; };
// tiempos por palabra con DTW (main-dtw.json): los de los segmentos de una palabra iban desplazados hasta 1 s
const dj = JSON.parse(fs.readFileSync(path.join(root, '.whisper/video-008/main-dtw.json'), 'utf8'));
const dw = [];
for (const seg of dj.transcription) for (const tk of seg.tokens) {
  if (tk.text.startsWith('[') || tk.t_dtw < 0) continue;
  if (/^\s/.test(tk.text) || !dw.length) dw.push({t: tk.text.trim(), a: tk.t_dtw / 100}); else dw.at(-1).t += tk.text;
}
const nz = (w) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ]/g, '');
const all = wj.transcription.map((s) => ({t: s.text.trim(), a: s.offsets.from / 1000, b: s.offsets.to / 1000})).filter((w) => w.t);
{ // alineación por programación dinámica (palabras iguales coste 0; sustitución o hueco coste 1)
  const A = all.map((w) => nz(w.t)), B = dw.map((w) => nz(w.t)), n = A.length, m = B.length;
  const D = Array.from({length: n + 1}, (_, i) => Int32Array.from({length: m + 1}, (_, j) => i + j));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
  let i = n, j = m;
  while (i > 0 && j > 0) {
    if (D[i][j] === D[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1)) { all[i - 1].a = dw[j - 1].a - 0.05; all[i - 1].dtw = true; i--; j--; }
    else if (D[i][j] === D[i - 1][j] + 1) i--; else j--;
  }
  for (let k = 0; k < all.length; k++) all[k].b = Math.min((all[k + 1]?.a ?? all[k].a + 0.6), all[k].a + 1.0);
  for (const w of words) { w.a = all[w.i].a; w.b = all[w.i].b; }
}
const cuts = [];
for (const k of edl.keep) {
  const first = all[k.from], last = all[k.to], prev = all[k.from - 1], next = all[k.to + 1];
  const S = prev ? argmin(Math.max(prev.a + 0.12, first.a - 0.6), first.a + 0.04) : Math.max(0, first.a - 0.2);
  const E = next ? argmin(last.a + 0.15, next.a + 0.04) : last.a + 1.0;
  const segs = [];
  for (let t = S; t < E; t += 0.01) {
    if (!voiced(t)) continue;
    const l = segs.at(-1);
    if (l && t - l.b <= MAXGAP) l.b = t + 0.01; else segs.push({a: t, b: t + 0.01});
  }
  const v = segs.filter((q) => q.b - q.a >= 0.06);
  const pieces = [{in: Math.max(S, v[0].a - LEAD), out: Math.min(E, v.at(-1).b + TAIL)}];
  for (let i = 1; i < v.length; i++) {
    const p = pieces.at(-1), mid = KEEPGAP / 2;
    pieces.splice(pieces.length - 1, 1, {in: p.in, out: v[i - 1].b + mid}, {in: v[i].a - mid, out: p.out});
  }
  pieces.forEach((p, j) => cuts.push({id: `${k.id}${pieces.length > 1 ? String.fromCharCode(97 + j) : ''}`, tramo: k.id, in: +p.in.toFixed(3), out: +p.out.toFixed(3)}));
}
// pausa entre tramos: el tramo siguiente arranca LEAD antes de su voz y el anterior termina TAIL después (≈ 0,16 s);
// se añade silencio de sala hasta ~0,3 s para que no se atropellen las ideas
const JOIN = 0.14;

// ---------- voz montada ----------
let t = 0;
const tl = cuts.map((c, i) => { const dur = c.out - c.in; const r = {...c, at: t}; t += dur + (i < cuts.length - 1 && cuts[i + 1].tramo !== c.tramo ? JOIN : 0); return r; });
const total = t;
const filt = tl.map((c, i) => {
  const d = c.out - c.in, gapAfter = i < tl.length - 1 ? tl[i + 1].at - (c.at + d) : 0;
  return `[0:a]atrim=start=${c.in}:end=${c.out},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st=${(d - 0.008).toFixed(3)}:d=0.008${gapAfter > 0.001 ? `,apad=pad_dur=${gapAfter.toFixed(3)}` : ''}[s${i}]`;
}).join(';') + ';' + tl.map((_, i) => `[s${i}]`).join('') + `concat=n=${tl.length}:v=0:a=1[cat]`;
const tmp = path.join(root, '.whisper/video-008/dialogue-pre.wav');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex', filt, '-map', '[cat]', '-ar', String(SR), '-ac', '1', '-c:a', 'pcm_f32le', tmp]);
const m = JSON.parse(execFileSync('/bin/sh', ['-c', `ffmpeg -hide_banner -nostats -i "${tmp}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p'`], {encoding: 'utf8'}));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=${SR}`, '-ar', String(SR), '-c:a', 'pcm_s24le', out]);

// ---------- timeline ----------
const F = (s) => Math.round(s * FPS);
// tiempo de la fuente → timeline (los inicios de palabra de whisper pueden caer hasta 0,3 s antes del corte)
const toTl = (srcT) => { const c = tl.find((c) => srcT >= c.in - 0.3 && srcT <= c.out + 0.02); return c ? c.at + Math.min(c.out - c.in, Math.max(0, srcT - c.in)) : null; };
const tw = words.map((w) => ({...w, tlA: toTl(w.a)})).filter((w) => w.tlA !== null && edl.keep.some((k) => w.i >= k.from && w.i <= k.to));
// subtítulos S6 (una línea de hasta ~38 caracteres a 46 px): frases cortadas en la puntuación; las frases cortas se
// juntan con la vecina si caben y las largas se reparten en bloques equilibrados (sin palabras sueltas al final)
const MAXC = 38;
const txt = (ws) => ws.map((w) => w.t).join(' ');
let phrases = [], cur = [];
for (const w of tw) { cur.push(w); if (/[.,?!:;]$/.test(w.t)) { phrases.push(cur); cur = []; } }
if (cur.length) phrases.push(cur);
for (let i = 0; i < phrases.length - 1; i++) {
  const p = phrases[i], q = phrases[i + 1];
  if ((txt(p).length < 16 || txt(q).length < 12) && txt([...p, ...q]).length <= MAXC) { phrases.splice(i, 2, [...p, ...q]); i--; }
}
const blocks = [];
for (const p of phrases) {
  const n = Math.ceil(txt(p).length / MAXC);
  if (n <= 1) { blocks.push(p); continue; }
  // reparto equilibrado por caracteres
  const target = txt(p).length / n; let acc = [], len = 0;
  for (const w of p) { if (acc.length && len + w.t.length / 2 > target && blocks.length >= 0 && acc.length >= 2) { blocks.push(acc); acc = []; len = 0; } acc.push(w); len += w.t.length + 1; }
  if (acc.length === 1 && blocks.length) blocks.at(-1).push(acc[0]); else if (acc.length) blocks.push(acc);
}
const read = blocks.map((b, i) => ({text: b.map((w) => w.t).join(' '), startFrame: F(b[0].tlA), endFrame: i < blocks.length - 1 ? F(blocks[i + 1][0].tlA) : F(total) }));
// planos del presentador (frames de la fuente a 24 fps)
// cada plano dura hasta el siguiente: en la pausa añadida entre tramos la imagen sigue corriendo (sin huecos negros)

// anclas: {word: índice} → frame de la timeline
const anchor = (a) => { if (a.frame !== undefined) return a.frame; const w = tw.find((q) => q.i === a.word); if (!w) throw new Error(`ancla sin palabra ${a.word}`); return F(w.tlA) + (a.offset ?? 0); };
// la tarjeta de «Seguir» (edl.cta) necesita ~66 frames para terminar y leerse
const ctaStart = edl.cta ? anchor(edl.cta.desde) : null;
const durationInFrames = Math.max(F(total) + Math.round(FPS * 0.6), ctaStart !== null ? ctaStart + 66 : 0);
// sin pasarse del final de la toma (1:58,0 = 2832 frames a 24 fps): el último plano no puede quedarse sin imagen
const SRC_FRAMES = Math.floor(118.04 * FPS) - 3;
const lastIn = F(tl.at(-1).in), lastAt = F(tl.at(-1).at);
const durCap = lastAt + (SRC_FRAMES - lastIn);
if (durationInFrames > durCap) console.log(`duración recortada a ${durCap} frames (fin de la toma)`);
const finalFrames = Math.min(durationInFrames, durCap);
// cada plano dura hasta el siguiente: en la pausa añadida entre tramos la imagen sigue corriendo (sin huecos negros)
const shots = tl.map((c, i) => ({id: c.id, startFrame: F(c.at), durationInFrames: (i < tl.length - 1 ? F(tl[i + 1].at) : finalFrames) - F(c.at), trimBefore: F(c.in)}));
const layout = edl.reparto.map((r) => ({modo: r.modo, startFrame: anchor(r.desde)}));
const apoyo = edl.apoyo.map((a, i) => ({...a, startFrame: anchor(a.desde)})).map((a, i, arr) => ({...a, endFrame: i < arr.length - 1 ? arr[i + 1].startFrame : Math.min(durationInFrames, durCap)}));
order.timeline = {fps: FPS, width: 1080, height: 1920, durationInFrames: finalFrames, audio: {dialogue: 'video-008/dialogue.wav'}, cta: ctaStart !== null ? {startFrame: ctaStart} : undefined, presentador: 'video-008/presentador.mp4', dashboard: 'video-008/dashboard.mp4', shots, layout, apoyo: apoyo.map(({desde, ...r}) => r), captions: {read}};
order.analisis = {umbralVozDb: +TH.toFixed(1), cortes: tl.map((c) => ({...c, at: +c.at.toFixed(3)})), duracionSegundos: +total.toFixed(2), duracionFuente: 118.04, voz: {antes: m.input_i, objetivo: -14}};
fs.writeFileSync(orderPath, JSON.stringify(order, null, 2) + '\n');
console.log(`${tl.length} cortes · ${total.toFixed(2)} s (fuente 118,04 s) · ${read.length} bloques de subtítulos · voz ${m.input_i} → −14 LUFS`);
for (const c of tl) console.log(`${c.id.padEnd(5)} ${c.in.toFixed(2)}–${c.out.toFixed(2)} → ${c.at.toFixed(2)}`);
