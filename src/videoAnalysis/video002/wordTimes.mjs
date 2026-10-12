// VIDEO-002: tiempos por palabra de la narración montada (public/video-002/dialogue.wav), en segundos de salida.
// Texto de referencia = frases verificadas de edl.cuts (no lo que oye whisper). Método de VIDEO-001 (refineWordTimesV3):
// el instante DTW de whisper es solo orientación; sílabas por palabra ↔ núcleos vocálicos (banda 300–2500 Hz) por DP;
// inicio = valle de energía previo al núcleo de su primera sílaba; nunca dentro de una pausa.
// Salida: analysis/video-002-words.json
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {alignWords, norm} from '../lib/editCore.mjs';
const root = path.resolve(import.meta.dirname, '../../..');
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-002.json'), 'utf8'));
const mapa = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-002-dialogue.json'), 'utf8')).cortes;
const wj = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-002-whisper/dialogue.json'), 'utf8'));
// palabras de whisper con instante DTW
const heard = [];
for (const seg of wj.transcription) for (const t of seg.tokens ?? []) {
  const text = t.text; if (/^\[_.*\]$/.test(text.trim()) || !text.trim()) continue;
  const at = t.t_dtw >= 0 ? t.t_dtw / 100 : t.offsets.from / 1000; const isPunct = /^[\p{P}\s]+$/u.test(text);
  const glued = heard.length && /[¿?¡!.…]$/.test(heard[heard.length - 1].text) && /^[\p{L}\p{N}]/u.test(text);
  if ((text.startsWith(' ') && !isPunct) || !heard.length || glued) heard.push({text: text.trim(), start: at}); else heard[heard.length - 1].text += text.trim();
}
// envolvente en banda de vocales (16 kHz) y actividad de voz
const raw = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-i', path.join(root, 'public/video-002/dialogue-1x.wav'), '-af', 'highpass=f=300,lowpass=f=2500', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], {maxBuffer: 1 << 28});
const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
const envelope = (a, b) => { const sr = 16000, step = 160, db = []; for (let i = Math.round(a * sr); i + step <= Math.min(pcm.length, Math.round(b * sr)); i += step) { let acc = 0; for (let j = i; j < i + step; j++) acc += pcm[j] * pcm[j]; db.push(20 * Math.log10(Math.sqrt(acc / step) / 32768 + 1e-9)); } return {t0: a, s: db.map((v, i) => (db[Math.max(0, i - 1)] + v + db[Math.min(db.length - 1, i + 1)]) / 3)}; };
const nucleiOf = ({t0, s}) => { const floor = [...s].sort((x, y) => x - y)[Math.floor(s.length * 0.1)] ?? -60; const peaks = [];
  for (let i = 1; i < s.length - 1; i++) { if (!(s[i] >= s[i - 1] && s[i] > s[i + 1]) || s[i] < floor + 8) continue; let l = s[i], r = s[i]; for (let k = i - 1; k >= Math.max(0, i - 15) && s[k] <= s[i]; k--) l = Math.min(l, s[k]); for (let k = i + 1; k <= Math.min(s.length - 1, i + 15) && s[k] <= s[i]; k++) r = Math.min(r, s[k]); if (s[i] - Math.max(l, r) >= 2) peaks.push({i, t: t0 + i * 0.01, db: s[i]}); }
  const out = []; for (const q of peaks) { const last = out[out.length - 1]; if (last && q.i - last.i < 7) { if (q.db > last.db) out[out.length - 1] = q; } else out.push(q); } return out; };
const onsetBefore = ({t0, s}, i, lo) => { let m = i; for (let k = i - 1; k >= Math.max(lo, i - 16); k--) if (s[k] < s[m]) m = k; return t0 + m * 0.01; };
const islandsOf = ({t0, s}) => { const pk = [...s].sort((x, y) => x - y)[Math.floor(s.length * 0.97)]; const thr = pk - 30; const out = []; let a = null;
  s.forEach((v, i) => { if (v > thr && a === null) a = i; if ((v <= thr || i === s.length - 1) && a !== null) { if (i - a >= 3) out.push({start: t0 + a * 0.01, end: t0 + i * 0.01}); a = null; } });
  const merged = []; for (const x of out) { const last = merged[merged.length - 1]; if (last && x.start - last.end < 0.09) last.end = x.end; else merged.push({...x}); } return merged; };
const SYL_FIXED = {facebook: 2, instagram: 3, tiktok: 2, meta: 2, muse: 1, for: 1, small: 1, business: 2, shopify: 3, canva: 2, notion: 2, etcetera: 4};
const syllables = (word) => { const raw = word.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, ''); if (SYL_FIXED[raw]) return SYL_FIXED[raw];
  const w = word.toLowerCase().replace(/[^\p{L}]/gu, '').replace(/y$/, 'i').replace(/([qg])u(?=[eiéí])/g, '$1'); let n = 0, prev = null;
  for (const ch of w) { if (!'aeiouáéíóúü'.includes(ch)) { prev = null; continue; } if (prev === null || ('aeoáéó'.includes(prev) && 'aeoáéó'.includes(ch)) || 'íú'.includes(prev) || 'íú'.includes(ch)) n++; prev = ch; } return Math.max(1, n); };
const alignSyllables = (syl, nuclei) => { const n = syl.length, m = nuclei.length, SKIP_SYL = 1.2, SKIP_NUC = 1.0, SIGMA = 0.3;
  const D = Array.from({length: n + 1}, () => new Float64Array(m + 1).fill(Infinity)), B = Array.from({length: n + 1}, () => new Int8Array(m + 1)); D[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) { if (!i && !j) continue; if (i && j) { const d = (nuclei[j - 1].t - syl[i - 1].prior) / SIGMA; const c = D[i - 1][j - 1] + Math.min(4, 0.5 * d * d); if (c < D[i][j]) { D[i][j] = c; B[i][j] = 1; } } if (i) { const c = D[i - 1][j] + SKIP_SYL; if (c < D[i][j]) { D[i][j] = c; B[i][j] = 2; } } if (j) { const c = D[i][j - 1] + SKIP_NUC; if (c < D[i][j]) { D[i][j] = c; B[i][j] = 3; } } }
  const at = new Array(n).fill(null); for (let i = n, j = m; i > 0 || j > 0;) { const b = B[i][j]; if (b === 1) { at[i - 1] = j - 1; i--; j--; } else if (b === 2) i--; else j--; } return at; };
const out = []; const report = [];
for (const c of order.edl.cuts) {
  const m = mapa.find((x) => x.id === c.id); const from = m.desde, to = m.hasta;
  const target = c.frase.replace(/[«»"]/g, '').split(/\s+/).filter(Boolean);
  const ww = heard.filter((w) => norm(w.text) && w.start > from - 0.3 && w.start < to + 0.1);
  const match = alignWords(target, ww);
  const env = envelope(from, to), nuclei = nucleiOf(env), islands = islandsOf(env);
  const prior = target.map((_, i) => (match[i] ? ww[match[i].ref].start : null));
  for (let i = 0; i < prior.length; i++) { if (prior[i] !== null) continue; let a = i - 1; while (a >= 0 && prior[a] === null) a--; let b = i + 1; while (b < prior.length && prior[b] === null) b++; const left = a >= 0 ? prior[a] : from, right = b < prior.length ? prior[b] : to; for (let x = a + 1; x < b; x++) prior[x] = left + ((right - left) * (x - a)) / (b - a); i = b - 1; }
  const nSyl = target.map(syllables);
  const syl = target.flatMap((_, w) => Array.from({length: nSyl[w]}, (_, k) => ({w, k, prior: prior[w] + k * 0.13})));
  const at = alignSyllables(syl, nuclei); const firstSyl = target.map((_, w) => syl.findIndex((x) => x.w === w));
  const words = target.map((text, w) => { const j = at[firstSyl[w]]; return {text, start: j === null ? null : onsetBefore(env, nuclei[j].i, j > 0 ? nuclei[j - 1].i + 1 : 0), syl: nSyl[w], exact: j !== null, heard: match[w] ? ww[match[w].ref].text : null}; });
  if (islands.length) words[0].start = islands[0].start;
  for (let i = 0; i < words.length; i++) { if (words[i].start !== null) continue; let a = i - 1; while (a >= 0 && words[a].start === null) a--; let b = i + 1; while (b < words.length && words[b].start === null) b++; const left = a >= 0 ? words[a].start : islands[0]?.start ?? from; const right = b < words.length ? words[b].start : islands[islands.length - 1]?.end ?? to; const weights = words.slice(Math.max(0, a), b).map((x) => x.syl); const total = weights.reduce((x, y) => x + y, 0) || 1; let acc = a >= 0 ? words[a].syl : 0; for (let x = a + 1; x < b; x++) { words[x].start = left + ((right - left) * acc) / total; acc += words[x].syl; } i = b - 1; }
  for (const w of words) { if (islands.some((s) => w.start >= s.start - 0.02 && w.start <= s.end)) continue; const next = islands.find((s) => s.start > w.start); if (next) w.start = next.start; }
  for (let i = 1; i < words.length; i++) words[i].start = Math.max(words[i].start, words[i - 1].start + 0.05);
  for (let i = 0; i < words.length; i++) { const next = words[i + 1]?.start ?? to; const own = islands.find((s) => words[i].start >= s.start - 0.02 && words[i].start <= s.end); let end = own && own.end < next ? own.end : next - 0.02; words[i].end = +Math.max(words[i].start + 0.04, Math.min(end, to)).toFixed(3); words[i].start = +words[i].start.toFixed(3); }
  out.push(...words.map((w, i) => ({cut: c.id, i, text: w.text, start: w.start, end: w.end, exact: w.exact})));
  report.push(`${c.id}: ${words.filter((w) => w.exact).length}/${words.length} por sílaba · ${words.map((w) => `${w.text}@${w.start.toFixed(2)}`).slice(0, 4).join(' ')} …`);
}
fs.writeFileSync(path.join(root, 'analysis/video-002-words.json'), JSON.stringify({metodo: 'Sílabas ↔ núcleos vocálicos (banda 300–2500 Hz) con DTW de whisper como referencia (σ 0,3 s); texto = frases verificadas de edl.cuts; tiempos en segundos de public/video-002/dialogue-1x.wav (la timeline los divide por la velocidad).', creado: new Date().toISOString(), palabras: out}, null, 2) + '\n');
console.log(report.join('\n')); console.log(`palabras: ${out.length}`);
