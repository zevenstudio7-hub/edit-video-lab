// Convierte las decisiones editoriales de video-orders/VIDEO-001.json («edl») en la línea de tiempo («timeline»)
// que pinta la composición Video001. La orden sigue siendo el único contrato: este script no inventa decisiones,
// solo resuelve tiempos.
//
// - Cada plano declara su rango de voz en la fuente (from/to, s). El script añade colchones dentro de la pausa medida
//   (sin invadir la voz vecina), cuantiza a frames y encadena los planos sin huecos.
// - El texto corregido de cada plano se alinea con las palabras de whisper (programación dinámica) para heredar
//   tiempos; las palabras sustituidas se interpolan entre vecinas. De ahí salen subtítulos y anclas de palabra.
// - Los apoyos y sus marcas se anclan a palabras ({cut, word, n}) o a extremos de plano ({cut, at:'start'|'end'}).
//
// Uso: node src/videoAnalysis/buildEdit.mjs [--dry]
import fs from 'node:fs/promises';
import path from 'node:path';
import {alignedLoader, anchorResolver, norm, resolveCuts} from './lib/editCore.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const orderPath = path.join(root, 'video-orders/VIDEO-001.json');
const order = JSON.parse(await fs.readFile(orderPath, 'utf8'));
const edl = order.edl;
if (!edl) throw new Error('La orden no tiene «edl».');
const fps = edl.fps;
const pad = edl.padding;

const take = alignedLoader(root);
const FRAMING = edl.framing;
const {cuts, total} = await resolveCuts(edl.cuts, {fps, pad, take, sourceDir: edl.source.dir});
for (const c of cuts) {
  const e = edl.cuts[c._index];
  const framing = {...FRAMING[e.framing ?? 'wide']};
  const words = c._words;
  Object.assign(c, {
    scale: e.scale ?? framing.scale, focus: e.focus ?? edl.source.focus, push: e.push ?? framing.push,
    ...(e.revealFrom ?? framing.revealFrom ? {revealFrom: e.revealFrom ?? framing.revealFrom} : {}),
    punches: (e.punches ?? []).map((p) => {
      const idx = words.findIndex((w, i) => norm(w.text) === norm(p.word) && words.slice(0, i + 1).filter((x) => norm(x.text) === norm(p.word)).length === (p.n ?? 1));
      if (idx < 0) throw new Error(`${c.id}: palabra de golpe no encontrada: ${p.word}`);
      return {frame: Math.max(0, words[idx].frame - c.startFrame - 2), add: p.add};
    }),
  });
}
const resolve = anchorResolver(cuts);

const supports = edl.supports.map((s, i) => {
  const startFrame = resolve(s.from);
  const next = edl.supports[i + 1];
  const endFrame = s.to ? resolve(s.to) : next ? resolve(next.from) : total;
  const local = (a) => Math.max(0, resolve(a) - startFrame);
  const {from, to, ...rest} = s;
  const out = {...rest, startFrame, durationInFrames: endFrame - startFrame};
  if (out.keys) out.keys = out.keys.map((k) => ({...k, frame: local(k.at), at: undefined}));
  if (out.marks) out.marks = out.marks.map((m) => ({...m, frame: local(m.at), until: m.until ? local(m.until) : undefined, at: undefined}));
  if (out.items) out.items = out.items.map((it) => ({...it, frame: local(it.at), at: undefined}));
  if (out.lines) out.lines = out.lines.map((l) => ({...l, frame: local(l.at), at: undefined}));
  if (out.chips) out.chips = out.chips.map((c) => ({...c, frame: local(c.at), at: undefined}));
  if (out.strikeAt) out.strikeAt = local(out.strikeAt);
  if (out.footer) out.footer = {...out.footer, frame: local(out.footer.at), at: undefined};
  if (out.title && typeof out.title === 'object') out.title = {...out.title, frame: local(out.title.at), at: undefined}; // en «chips» es texto
  if (out.left) out.left = {...out.left, frame: local(out.left.at), at: undefined};
  if (out.right) out.right = {...out.right, frame: local(out.right.at), at: undefined};
  if (out.durationInFrames <= 0) throw new Error(`Apoyo ${s.id} sin duración`);
  return JSON.parse(JSON.stringify(out));
});
for (let i = 1; i < supports.length; i++) {
  if (supports[i].startFrame < supports[i - 1].startFrame + supports[i - 1].durationInFrames) throw new Error(`Apoyos solapados: ${supports[i - 1].id} / ${supports[i].id}`);
}

// Subtítulos: bloques de 2–4 palabras, corte en puntuación, cambio duro, énfasis declarado por plano.
const captions = [];
for (const c of cuts) {
  const emph = new Set((edl.cuts[c._index].emphasis ?? []).map(norm));
  let block = [];
  const flush = () => {
    if (!block.length) return;
    captions.push({text: block.map((w) => w.text).join(' '), startFrame: block[0].frame, endFrame: block[block.length - 1].endFrame, emphasis: block.filter((w) => emph.has(norm(w.text))).map((w) => w.text)});
    block = [];
  };
  for (const w of c._words) {
    block.push(w);
    const chars = block.map((x) => x.text).join(' ').length;
    if (/[,.;:?!…]$/.test(w.text) && block.length >= 2) flush();
    else if (block.length >= 4 || chars >= 20) flush();
  }
  flush();
}
// cada bloque dura hasta el siguiente (sin huecos de menos de 12 frames) y nunca más allá del final
for (let i = 0; i < captions.length; i++) {
  const next = captions[i + 1];
  const end = next ? (next.startFrame - captions[i].endFrame < 12 ? next.startFrame : captions[i].endFrame + 8) : Math.min(total, captions[i].endFrame + 10);
  captions[i].endFrame = Math.max(captions[i].startFrame + 4, end);
  captions[i].startFrame = Math.max(0, captions[i].startFrame);
}

order.timeline = {
  fps, durationInFrames: total, topHeight: edl.topHeight, source: {width: edl.source.width, height: edl.source.height}, accent: edl.accent,
  cuts: cuts.map(({_words, _index, _local, take: _t, id, block, source, inTime, outTime, startFrame, durationInFrames, trimBefore, trimAfter, scale, focus, push, revealFrom, punches, text}) => ({id, block, source, inTime, outTime, startFrame, durationInFrames, trimBefore, trimAfter, scale, focus, push, ...(revealFrom ? {revealFrom} : {}), punches, text})), supports, captions,
};
order.durationInFrames = total;
order.durationSeconds = +(total / fps).toFixed(2);
const report = {
  cuts: cuts.length, captions: captions.length, supports: supports.length, seconds: order.durationSeconds,
  inexactWords: cuts.reduce((a, c) => a + c._words.filter((w) => !w.exact).length, 0),
  totalWords: cuts.reduce((a, c) => a + c._words.length, 0),
};
if (process.argv.includes('--dry')) console.log(JSON.stringify(report));
else {
  await fs.writeFile(orderPath, JSON.stringify(order, null, 2) + '\n');
  console.log('Orden actualizada:', JSON.stringify(report));
}
