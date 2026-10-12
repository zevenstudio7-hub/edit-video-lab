// Núcleo compartido por los constructores de línea de tiempo (v2: buildEdit.mjs, V3: buildEditV3.mjs).
// Resuelve planos (rango de voz en la fuente → frames con colchones dentro de la pausa medida), alinea el texto
// corregido con las palabras de whisper y convierte anclas ({cut, word, n} / {cut, at}) en frames de la timeline.
import fs from 'node:fs/promises';
import path from 'node:path';

export const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, '');

export const alignedLoader = (root) => {
  const cache = new Map();
  return async (file) => {
    if (!cache.has(file)) cache.set(file, JSON.parse(await fs.readFile(path.join(root, 'analysis/video-001-whisper', file + '.aligned.json'), 'utf8')));
    return cache.get(file);
  };
};

// Alineación de palabras corregidas con palabras de whisper (coste: 0 igual, 1 sustitución/hueco).
export const alignWords = (target, ref) => {
  const n = target.length, m = ref.length;
  const d = Array.from({length: n + 1}, (_, i) => Array.from({length: m + 1}, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const same = norm(target[i - 1]) === norm(ref[j - 1].text);
    d[i][j] = Math.min(d[i - 1][j - 1] + (same ? 0 : 1), d[i - 1][j] + 1, d[i][j - 1] + 1);
  }
  const match = new Array(n).fill(null);
  let i = n, j = m;
  while (i > 0 && j > 0) {
    const same = norm(target[i - 1]) === norm(ref[j - 1].text);
    if (d[i][j] === d[i - 1][j - 1] + (same ? 0 : 1)) { match[i - 1] = {ref: j - 1, exact: same}; i--; j--; }
    else if (d[i][j] === d[i - 1][j] + 1) i--;
    else j--;
  }
  return match;
};

// Tiempos de las palabras corregidas de un plano (en segundos de la fuente).
export const timeWords = (words, ref, from, to) => {
  const match = alignWords(words, ref);
  const t = words.map((w, i) => (match[i] ? {start: ref[match[i].ref].start, end: ref[match[i].ref].end, exact: match[i].exact} : null));
  // huecos: interpolación lineal entre vecinos con tiempo
  for (let i = 0; i < t.length; i++) {
    if (t[i]) continue;
    let a = i - 1; while (a >= 0 && !t[a]) a--;
    let b = i + 1; while (b < t.length && !t[b]) b++;
    const left = a >= 0 ? t[a].end : from;
    const right = b < t.length ? t[b].start : to;
    const k = b - a - 1;
    for (let x = a + 1; x < b; x++) {
      const s = left + ((right - left) * (x - a - 1)) / k;
      t[x] = {start: s, end: left + ((right - left) * (x - a)) / k, exact: false};
    }
    i = b - 1;
  }
  return t.map((x) => ({start: Math.max(from, Math.min(to, x.start)), end: Math.max(from, Math.min(to, x.end)), exact: x.exact}));
};

// Planos encadenados sin huecos. Devuelve también las palabras de cada plano en frames de la timeline (_words).
export const resolveCuts = async (edlCuts, {fps, pad, take, sourceDir}) => {
  const cuts = [];
  let cursor = 0;
  for (const [index, c] of edlCuts.entries()) {
    const data = await take(c.take);
    // colchón dentro de la pausa medida: nunca más de la mitad de la pausa ni dentro de otra isla
    const prevIsland = [...data.islands].reverse().find((i) => i.end <= c.from + 0.02);
    const nextIsland = data.islands.find((i) => i.start >= c.to - 0.02);
    const sentenceEnd = /[.?!…]$/.test(c.text.trim());
    const padIn = c.padIn ?? pad.inSeconds;
    const padOut = c.padOut ?? (sentenceEnd ? pad.sentenceEndSeconds : pad.outSeconds);
    const inTime = Math.max(prevIsland ? Math.min(c.from - 0.03, prevIsland.end + (c.from - prevIsland.end) / 2) : 0, c.from - padIn);
    const outTime = Math.min(nextIsland ? Math.max(c.to + 0.03, c.to + (nextIsland.start - c.to) / 2) : data.durationSeconds, c.to + padOut);
    const trimBefore = Math.round(inTime * fps); // ±16 ms: los colchones lo absorben; floor/ceil invadían palabras vecinas en cortes dentro de frase
    const trimAfter = Math.round(outTime * fps);
    const durationInFrames = trimAfter - trimBefore;
    const words = c.text.split(/\s+/).filter(Boolean);
    const ref = data.words.filter((w) => w.end > c.from - 0.05 && w.start < c.to + 0.05);
    const times = timeWords(words, ref, c.from, c.to);
    const toFrame = (t) => Math.round((t - trimBefore / fps) * fps);
    cuts.push({
      id: c.id, block: c.block, take: c.take, source: `${sourceDir}/${c.take.replace(/\.MP4$/i, '.mp4')}`,
      inTime: +(trimBefore / fps).toFixed(3), outTime: +(trimAfter / fps).toFixed(3),
      startFrame: cursor, durationInFrames, trimBefore, trimAfter, text: c.text,
      _words: words.map((w, i) => ({text: w, frame: cursor + toFrame(times[i].start), endFrame: cursor + toFrame(times[i].end), exact: times[i].exact})),
      _local: (t) => toFrame(t),
      _index: index,
    });
    cursor += durationInFrames;
  }
  return {cuts, total: cursor};
};

// Ancla → frame de la línea de tiempo.
export const anchorResolver = (cuts) => {
  const byId = new Map(cuts.map((c) => [c.id, c]));
  return (a) => {
    if (typeof a === 'number') return a;
    const c = byId.get(a.cut);
    if (!c) throw new Error('Plano desconocido en ancla: ' + JSON.stringify(a));
    if (a.at === 'start') return c.startFrame + (a.offset ?? 0);
    if (a.at === 'end') return c.startFrame + c.durationInFrames + (a.offset ?? 0);
    const hits = c._words.filter((w) => norm(w.text) === norm(a.word));
    const hit = hits[(a.n ?? 1) - 1];
    if (!hit) throw new Error(`Palabra «${a.word}» (n=${a.n ?? 1}) no está en ${a.cut}: ${c.text}`);
    return (a.after ? hit.endFrame : hit.frame) + (a.offset ?? 0);
  };
};
