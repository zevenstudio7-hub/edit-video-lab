// Candidata V3 de VIDEO-001 (preset experimental «reel-editorial-reforzado», #edit-2): resuelve en frames las
// decisiones de video-orders/VIDEO-001.json → candidatoV3.edl y escribe candidatoV3.timeline.
// La v2 (edl/timeline de primer nivel) no se toca: base y candidata quedan independientes.
//
// Novedades frente a v2 (dirección V3):
//  - cámara y layout son pistas propias, separadas de los cortes (un evento por cambio narrativo);
//  - subtítulos en dos capas: lectura (bloques cortos) y énfasis (bloques tipográficos que sustituyen a la
//    lectura en sus palabras: no se duplica la frase);
//  - escenas de motion con «beats» anclados a palabras;
//  - cues de sonido por acción, con la poda de library/sfx/cues (thinCues).
//
// Tiempos por palabra: analysis/video-001-whisper/v3-word-times.json (refineWordTimesV3.mjs) cuando coincide con
// el plano; si no, los proporcionales de editCore (aviso en consola).
//
// Orden de trabajo: buildEditV3 → refineWordTimesV3 (si cambian planos) → buildEditV3 → buildDialogueTrack.
// Uso: node src/videoAnalysis/buildEditV3.mjs [--dry] [--read]   (--read imprime los bloques de lectura)
import fs from 'node:fs/promises';
import path from 'node:path';
import {alignedLoader, anchorResolver, norm, resolveCuts} from './lib/editCore.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const orderPath = path.join(root, 'video-orders/VIDEO-001.json');
const order = JSON.parse(await fs.readFile(orderPath, 'utf8'));
const cand = order.candidatoV3;
if (!cand?.edl) throw new Error('La orden no tiene candidatoV3.edl');
const edl = cand.edl;
const fps = edl.fps;
const sfxLib = JSON.parse(await fs.readFile(path.join(root, 'library/sfx/sfx.json'), 'utf8'));

const {cuts, total} = await resolveCuts(edl.cuts, {fps, pad: edl.padding, take: alignedLoader(root), sourceDir: edl.source.dir});
const fail = (m) => { throw new Error(m); };

// Tiempos por palabra afinados (refineWordTimesV3.mjs: DTW por plano + arranques de energía). Solo se usan si el
// plano coincide (mismo texto y mismos frames de entrada/salida); si no, quedan los tiempos proporcionales.
const refinedPath = path.join(root, 'analysis/video-001-whisper/v3-word-times.json');
const refined = await fs.readFile(refinedPath, 'utf8').then(JSON.parse).catch(() => ({cuts: {}}));
const stale = [];
for (const c of cuts) {
  const r = refined.cuts[c.id];
  if (!r || r.text !== c.text || Math.abs(r.inTime - c.inTime) > 1e-3 || Math.abs(r.outTime - c.outTime) > 1e-3 || r.words.length !== c._words.length) { stale.push(c.id); continue; }
  const toFrame = (t) => c.startFrame + Math.round((t - c.inTime) * fps);
  c._words.forEach((w, i) => { w.frame = toFrame(r.words[i].start); w.endFrame = Math.max(w.frame + 1, toFrame(r.words[i].end)); w.exact = r.words[i].source !== 'interp'; w.refined = true; });
}
if (stale.length) console.warn(`Tiempos proporcionales (sin afinar) en ${stale.length} planos: ${stale.join(', ')} → node src/videoAnalysis/refineWordTimesV3.mjs`);
const resolve = anchorResolver(cuts);

// ---------- cámara: eventos independientes de los cortes ----------
const camera = {
  base: {scale: edl.camera.base.scale, focus: edl.camera.base.focus},
  events: edl.camera.events.map((e) => {
    const startFrame = resolve(e.at);
    const holdEnd = resolve(e.until);
    if (holdEnd <= startFrame) fail(`Cámara ${e.id}: «until» antes de «at»`);
    return {id: e.id, type: e.type ?? 'push', startFrame, inFrames: e.inFrames ?? 16, toScale: e.to, holdEnd, outFrames: e.outFrames ?? 18, motivo: e.motivo};
  }),
};
camera.events.sort((a, b) => a.startFrame - b.startFrame);
for (let i = 1; i < camera.events.length; i++) {
  const p = camera.events[i - 1];
  if (camera.events[i].startFrame < p.holdEnd + p.outFrames) fail(`Eventos de cámara solapados: ${p.id} / ${camera.events[i].id}`);
}

// ---------- layout ----------
const layout = {
  base: edl.layout.base,
  events: edl.layout.events.map((e) => ({id: e.id, frame: resolve(e.at), mode: e.mode, transitionFrames: e.transitionFrames ?? 14, motivo: e.motivo})).sort((a, b) => a.frame - b.frame),
};

// ---------- escenas de la zona superior ----------
const scenes = edl.scenes.map((s, i) => {
  const startFrame = resolve(s.from);
  const next = edl.scenes[i + 1];
  const endFrame = s.to ? resolve(s.to) : next ? resolve(next.from) : total;
  if (endFrame <= startFrame) fail(`Escena ${s.id} sin duración`);
  const local = (a) => Math.max(0, resolve(a) - startFrame);
  const beats = Object.fromEntries(Object.entries(s.beats ?? {}).map(([k, a]) => [k, local(a)]));
  const props = JSON.parse(JSON.stringify(s.props ?? {}));
  // anclas dentro de props de evidencia (FocusPanImage): keys / marks
  if (props.keys) props.keys = props.keys.map((k) => ({rect: k.rect, duration: k.duration, frame: local(k.at)}));
  if (props.marks) props.marks = props.marks.map((m) => ({rect: m.rect, style: m.style, color: m.color, frame: local(m.at), until: m.until ? local(m.until) : undefined}));
  return {id: s.id, scene: s.scene, startFrame, durationInFrames: endFrame - startFrame, beats, props, motivo: s.motivo};
});
for (let i = 1; i < scenes.length; i++) {
  if (scenes[i].startFrame < scenes[i - 1].startFrame + scenes[i - 1].durationInFrames) fail(`Escenas solapadas: ${scenes[i - 1].id} / ${scenes[i].id}`);
}

// ---------- subtítulos: énfasis + lectura ----------
const words = cuts.flatMap((c) => c._words.map((w, i) => ({...w, cut: c.id, i})));
const emphasis = edl.captions.emphasis.map((e) => {
  const c = cuts.find((x) => x.id === e.cut) ?? fail(`Énfasis ${e.id}: plano ${e.cut} desconocido`);
  const idx = (word, n = 1) => {
    let k = 0;
    const i = c._words.findIndex((w) => norm(w.text) === norm(word) && ++k === n);
    if (i < 0) fail(`Énfasis ${e.id}: «${word}» (n=${n}) no está en ${c.id}`);
    return i;
  };
  const a = idx(e.from, e.fromN), b = idx(e.to, e.toN);
  if (b < a) fail(`Énfasis ${e.id}: «to» antes de «from»`);
  const startFrame = c._words[a].frame - 2;
  const endFrame = Math.max(c._words[b].endFrame + (e.hold ?? 8), startFrame + (e.minFrames ?? 30));
  return {id: e.id, cut: c.id, wordRange: [a, b], startFrame, endFrame, lines: e.lines, motivo: e.motivo};
}).sort((x, y) => x.startFrame - y.startFrame);
const inEmphasis = (w) => emphasis.some((e) => e.cut === w.cut && w.i >= e.wordRange[0] && w.i <= e.wordRange[1]);

// Lectura: frases (puntuación o énfasis; un cambio de plano sin puntuación no corta la frase) repartidas en bloques
// equilibrados de ≤5 palabras y ~24 caracteres: «Su argumento era | muy simple:» en vez de dejar una palabra suelta.
const read = [];
const phrases = [];
let phrase = [];
const close = () => { if (phrase.length) phrases.push(phrase); phrase = []; };
let prevCut = null;
for (const w of words) {
  if (w.cut !== prevCut && phrase.length && /[,.;:?!…»]$/.test(phrase[phrase.length - 1].text)) close();
  prevCut = w.cut;
  if (inEmphasis(w)) { close(); continue; }
  phrase.push(w);
  if (/[,.;:?!…»]$/.test(w.text)) close();
}
close();
const len = (ws) => ws.map((x) => x.text).join(' ').length;
for (const p of phrases) {
  const m = Math.max(Math.ceil(p.length / 5), Math.ceil(len(p) / 24));
  // partición en m bloques que minimiza el bloque más largo (en caracteres)
  const best = (i, parts) => {
    if (parts === 1) return {cost: len(p.slice(i)), cuts: []};
    let out = {cost: Infinity, cuts: []};
    for (let j = i + 1; j <= p.length - parts + 1; j++) {
      const rest = best(j, parts - 1);
      const cost = Math.max(len(p.slice(i, j)), rest.cost);
      if (cost < out.cost) out = {cost, cuts: [j, ...rest.cuts]};
    }
    return out;
  };
  const bounds = [0, ...best(0, Math.min(m, p.length)).cuts, p.length];
  for (let k = 0; k < bounds.length - 1; k++) {
    const ws = p.slice(bounds[k], bounds[k + 1]);
    read.push({text: ws.map((w) => w.text).join(' '), startFrame: ws[0].frame, endFrame: ws[ws.length - 1].endFrame, emphasis: []});
  }
}
read.sort((a, b) => a.startFrame - b.startFrame);
// duración: hasta el siguiente bloque si el hueco es corto; nunca encima de un énfasis
const starts = [...read.map((r) => ({f: r.startFrame, kind: 'r'})), ...emphasis.map((e) => ({f: e.startFrame, kind: 'e'}))].sort((a, b) => a.f - b.f);
for (const r of read) {
  const blocker = emphasis.find((e) => e.startFrame < r.endFrame + 12 && e.endFrame > r.startFrame && e.startFrame >= r.startFrame);
  const nextStart = starts.find((s) => s.f > r.startFrame)?.f ?? total;
  let end = nextStart - r.endFrame < 12 ? nextStart : r.endFrame + 8;
  if (blocker) end = Math.min(end, blocker.startFrame);
  r.endFrame = Math.max(r.startFrame + 4, Math.min(end, total));
}
// un bloque de lectura que empiece dentro de un énfasis se retrasa al final del énfasis
for (const r of read) {
  const e = emphasis.find((x) => r.startFrame >= x.startFrame && r.startFrame < x.endFrame);
  if (e) { r.startFrame = e.endFrame; r.endFrame = Math.max(r.endFrame, r.startFrame + 10); }
}
for (let i = 0; i < read.length - 1; i++) read[i].endFrame = Math.min(read[i].endFrame, read[i + 1].startFrame);

// ---------- sonido ----------
// Diseño por sentido (edl.sfxDesign): entrada de cada escena, cada beat (movimiento), zooms y marcas de las capturas,
// cada énfasis (texto destacado), cambios de layout y CTA. Los sonidos viven en library/sfx/sfx.json (CC0 descargados
// en «sonidos» y propios sintetizados en «sintetizados»). Se mezclan en una sola pista con buildSfxBed.mjs.
const soundLib = new Map([...(sfxLib.sonidos ?? []), ...(sfxLib.sintetizados ?? [])].map((x) => [x.id, x]));
const design = edl.sfxDesign;
const cueList = [];
// ganancia por función (edl.sfxDesign.ganancia): textos destacados y CTA algo más presentes; movimientos, sutiles
const roleGain = {3: design?.ganancia?.enfasis ?? 1, 2: design?.ganancia?.movimiento ?? 1, 1: design?.ganancia?.aparicion ?? 1};
const cue = (frame, sound, prio, motivo, volume, gainKey) => {
  if (!sound) return;
  const def = soundLib.get(sound) ?? fail(`SFX desconocido: ${sound}`);
  const g = gainKey ? design?.ganancia?.[gainKey] ?? 1 : roleGain[prio] ?? 1;
  cueList.push({frame: Math.max(0, Math.round(frame)), sound, volume: +((volume ?? def.volumen) * g).toFixed(3), prio, motivo});
};
if (design) {
  for (const sc of scenes) {
    const d = design.escenas?.[sc.id];
    if (!d) continue;
    cue(sc.startFrame, d.entrada, 1, `${sc.id} · aparece (${sc.scene})`);
    for (const [beat, sound] of Object.entries(d.beats ?? {})) {
      if (sc.beats[beat] !== undefined) cue(sc.startFrame + sc.beats[beat], sound, 2, `${sc.id} · ${beat}`);
    }
    for (const x of d.extra ?? []) {
      if (sc.beats[x.beat] !== undefined) cue(sc.startFrame + sc.beats[x.beat] + (x.offset ?? 0), x.sound, 2, `${sc.id} · ${x.motivo ?? x.beat}`);
    }
    if (sc.scene === 'evidencia' && design.evidencia) {
      (sc.props.keys ?? []).slice(1).forEach((k, i) => cue(sc.startFrame + k.frame, design.evidencia.zoom, 1, `${sc.id} · zoom ${i + 1}`));
      for (const m of sc.props.marks ?? []) cue(sc.startFrame + m.frame, design.evidencia[m.style], 2, `${sc.id} · marca ${m.style}`);
    }
  }
  for (const e of emphasis) cue(e.startFrame, design.enfasis?.[e.id], 3, `${e.id} · texto destacado «${e.lines.map((l) => l.text).join(' / ')}»`);
  for (const l of layout.events) cue(l.frame, design.layout, 1, `layout · ${l.mode}`);
  if (edl.cta && design.cta) {
    cue(resolve(edl.cta.at), design.cta.aparece, 3, 'CTA · aparece', undefined, 'cta');
    cue(resolve(edl.cta.click), design.cta.clic, 3, 'CTA · clic', undefined, 'cta');
  }
}
for (const s0 of edl.sfx ?? []) cue(resolve(s0.at) - (s0.lead ?? 0), s0.sound, 2, s0.motivo, s0.volume); // extras manuales
cueList.sort((x, y) => x.frame - y.frame || y.prio - x.prio);
// poda: dos sonidos a menos de minFrames → queda el de más prioridad; el mismo sonido, separado al menos mismoSonidoFrames
const lim = {minFrames: design?.limites?.minFrames ?? sfxLib.limites.separacion_min_frames, same: design?.limites?.mismoSonidoFrames ?? sfxLib.limites.separacion_min_mismo_sonido_frames};
const kept = [], dropped = [];
for (const c of cueList) {
  const near = kept.filter((k) => c.frame - k.frame < lim.minFrames);
  const sameNear = kept.some((k) => k.sound === c.sound && c.frame - k.frame < lim.same);
  if (sameNear) { dropped.push({...c, porque: 'mismo sonido demasiado cerca'}); continue; }
  if (near.length) {
    const best = near.reduce((x, y) => (y.prio > x.prio ? y : x));
    if (c.prio > best.prio) { for (const k of near) { kept.splice(kept.indexOf(k), 1); dropped.push({...k, porque: `cede ante ${c.sound}`}); } kept.push(c); }
    else dropped.push({...c, porque: `cede ante ${best.sound}`});
    continue;
  }
  kept.push(c);
}
kept.sort((x, y) => x.frame - y.frame);

cand.timeline = {
  fps, durationInFrames: total, source: {width: edl.source.width, height: edl.source.height}, palette: edl.palette,
  cuts: cuts.map(({id, block, take, source, inTime, outTime, startFrame, durationInFrames, trimBefore, trimAfter, text}) => {
    // rampas de audio por plano (s) para buildDialogueTrack cuando un borde cae dentro de voz continua
    const e = edl.cuts.find((x) => x.id === id);
    const fades = {...(e.audioFadeIn ? {audioFadeIn: e.audioFadeIn} : {}), ...(e.audioFadeOut ? {audioFadeOut: e.audioFadeOut} : {})};
    return {id, block, take, source, inTime, outTime, startFrame, durationInFrames, trimBefore, trimAfter, text, ...fades};
  }),
  camera, layout, scenes, captions: {read, emphasis: emphasis.map(({wordRange, ...e}) => e)},
  sfx: kept, sfxDropped: dropped, audio: edl.audio,
  ...(edl.cta ? {cta: {startFrame: resolve(edl.cta.at), clickFrame: resolve(edl.cta.click), label: edl.cta.label}} : {}),
};

// ---------- velocidad global (edl.speed, p. ej. 1.1) ----------
// Todo lo anterior se resuelve a 1x (frames de fuente y de palabra). Aquí se lleva a la timeline acelerada: cada
// frame f de 1x pasa a round(f / speed). Los planos conservan trimBefore/trimAfter (frames de la fuente) y se
// reproducen con playbackRate = speed; la pista de diálogo se acelera aparte (buildDialogueTrack, tono preservado).
// Transiciones (entradas/salidas de cámara, cambios de layout, animaciones) no se aceleran: son gestos visuales.
const speed = edl.speed ?? 1;
if (speed !== 1) {
  const tl = cand.timeline;
  const map = (f) => Math.round(f / speed);
  for (const c of tl.cuts) {
    const start = map(c.startFrame), end = map(c.startFrame + c.durationInFrames);
    Object.assign(c, {startFrame: start, durationInFrames: Math.max(1, end - start), playbackRate: speed});
  }
  for (const e of tl.camera.events) Object.assign(e, {startFrame: map(e.startFrame), holdEnd: map(e.holdEnd)});
  for (let i = 1; i < tl.camera.events.length; i++) {
    const p = tl.camera.events[i - 1];
    if (tl.camera.events[i].startFrame < p.holdEnd + p.outFrames) fail(`Eventos de cámara solapados a ${speed}x: ${p.id} / ${tl.camera.events[i].id}`);
  }
  for (const e of tl.layout.events) e.frame = map(e.frame);
  for (const sc of tl.scenes) {
    const start = map(sc.startFrame), end = map(sc.startFrame + sc.durationInFrames);
    const local = (f) => Math.max(0, map(sc.startFrame + f) - start);
    sc.beats = Object.fromEntries(Object.entries(sc.beats).map(([k, f]) => [k, local(f)]));
    if (sc.props.keys) sc.props.keys = sc.props.keys.map((k) => ({...k, frame: local(k.frame)}));
    if (sc.props.marks) sc.props.marks = sc.props.marks.map((m) => ({...m, frame: local(m.frame), until: m.until === undefined ? undefined : local(m.until)}));
    Object.assign(sc, {startFrame: start, durationInFrames: end - start});
  }
  for (const r of [...tl.captions.read, ...tl.captions.emphasis]) Object.assign(r, {startFrame: map(r.startFrame), endFrame: map(r.endFrame)});
  for (const c of [...tl.sfx, ...tl.sfxDropped]) c.frame = map(c.frame);
  if (tl.cta) Object.assign(tl.cta, {startFrame: map(tl.cta.startFrame), clickFrame: map(tl.cta.clickFrame)});
  tl.durationInFrames = map(total);
  tl.speed = speed;
}
cand.durationInFrames = cand.timeline.durationInFrames;
cand.durationSeconds = +(cand.durationInFrames / fps).toFixed(2);
const report = {
  seconds: cand.durationSeconds, speed, cuts: cuts.length, cameraEvents: camera.events.length, layoutEvents: layout.events.length,
  scenes: scenes.length, readBlocks: read.length, emphasisBlocks: emphasis.length, sfx: kept.length, sfxDropped: dropped.length,
  inexactWords: cuts.reduce((a, c) => a + c._words.filter((w) => !w.exact).length, 0), totalWords: words.length,
  refinedCuts: cuts.length - stale.length,
};
if (process.argv.includes('--read')) console.log(read.map((r) => r.text).join(' | '));
if (process.argv.includes('--dry')) console.log(JSON.stringify(report));
else {
  await fs.writeFile(orderPath, JSON.stringify(order, null, 2) + '\n');
  console.log('candidatoV3 actualizado:', JSON.stringify(report));
}
