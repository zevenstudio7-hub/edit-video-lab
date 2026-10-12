// VIDEO-002 (#edit-1-motion): resuelve en frames las decisiones de video-orders/VIDEO-002.json → edl y escribe
// timeline: planos de las tomas (alineados con la pista de voz montada), escenas con beats anclados a palabras,
// cámara del presentador, subtítulos (lectura + énfasis, receta TypeCaptions) y efectos de sonido por beat.
// Requiere: analysis/video-002-dialogue.json (buildDialogue.mjs) y analysis/video-002-words.json (wordTimes.mjs).
// Uso: node src/videoAnalysis/video002/buildTimeline.mjs [--dry] [--read]
import fs from 'node:fs';
import path from 'node:path';
import {norm} from '../lib/editCore.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-002.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const {edl} = order; const FPS = edl.fps;
const dialogue = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-002-dialogue.json'), 'utf8'));
const words = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-002-words.json'), 'utf8')).palabras.map((w) => ({...w, frame: Math.round(w.start * FPS), endFrame: Math.round(w.end * FPS)}));
const sfxLib = JSON.parse(fs.readFileSync(path.join(root, 'library/sfx/sfx.json'), 'utf8'));
const fail = (m) => { throw new Error(m); };
// todo se calcula a 1x (tiempos de dialogue-1x.wav) y al final se pasa a la velocidad pedida (edl.speed)
const speed = edl.speed ?? 1;
const total = Math.round((dialogue.duracion1x ?? dialogue.duracion) * FPS);
const mapa = Object.fromEntries(dialogue.cortes.map((c) => [c.id, c]));

// ---------- anclas ----------
const anchor = (a, ctx) => {
  if (a.fin) return total;
  if (a.cutStart) return Math.round((mapa[a.cutStart] ?? fail(`${ctx}: corte ${a.cutStart} desconocido`)).desde * FPS);
  const list = words.filter((w) => w.cut === a.cut && norm(w.text) === norm(a.word));
  const w = list[(a.n ?? 1) - 1] ?? fail(`${ctx}: «${a.word}» (n=${a.n ?? 1}) no está en ${a.cut}`);
  return w.frame + (a.off ?? 0);
};
const wordAt = (a, ctx) => { const list = words.filter((w) => w.cut === a.cut && norm(w.text) === norm(a.word)); return list[(a.n ?? 1) - 1] ?? fail(`${ctx}: «${a.word}» no está en ${a.cut}`); };

// ---------- planos de las tomas (vídeo contiguo; cada plano empieza con su audio) ----------
const cuts = edl.cuts.map((c, i) => {
  const startFrame = Math.round(mapa[c.id].desde * FPS);
  const next = edl.cuts[i + 1];
  const endFrame = next ? Math.round(mapa[next.id].desde * FPS) : total;
  const toma = edl.tomas[c.toma];
  return {id: c.id, toma: c.toma, source: toma.video, startFrame, durationInFrames: endFrame - startFrame, trimBefore: Math.round(c.in * FPS)};
});

// ---------- escenas ----------
const scenes = edl.escenas.map((e) => ({id: e.id, modo: e.modo, tipo: e.tipo, startFrame: anchor(e.desde, e.id), beats: Object.fromEntries(Object.entries(e.beats ?? {}).map(([k, a]) => [k, anchor(a, `${e.id}.${k}`)])), motivo: e.motivo}));
scenes.sort((a, b) => a.startFrame - b.startFrame);
scenes.forEach((s, i) => { s.durationInFrames = (scenes[i + 1]?.startFrame ?? total) - s.startFrame; if (s.durationInFrames <= 0) fail(`Escena vacía o solapada: ${s.id}`); });
if (scenes[0].startFrame !== 0) fail('La primera escena debe empezar en el frame 0');
for (const s of scenes) for (const [k, f] of Object.entries(s.beats)) if (f < s.startFrame - 2 || f > s.startFrame + s.durationInFrames + 30) fail(`Beat ${s.id}.${k} (${f}) fuera de su escena (${s.startFrame}–${s.startFrame + s.durationInFrames})`);

// ---------- cámara del presentador ----------
const camera = {foco: edl.camara.foco, presentador: Object.fromEntries(Object.entries(edl.camara.presentador).map(([id, c]) => {
  const sc = scenes.find((s) => s.id === id) ?? fail(`Cámara: escena ${id} desconocida`);
  return [id, {de: c.de, a: c.a, desde: c.desde ? anchor(c.desde, `cámara ${id}`) : sc.startFrame, hasta: c.hasta ? anchor(c.hasta, `cámara ${id}`) : sc.startFrame + sc.durationInFrames}];
}))};

// ---------- subtítulos: énfasis + lectura (mismo criterio que la V3 de VIDEO-001) ----------
const emphasis = edl.enfasis.map((e) => {
  const a = wordAt(e.desde, e.id), b = wordAt(e.hasta, e.id);
  const ia = words.indexOf(a), ib = words.indexOf(b);
  if (ib < ia) fail(`Énfasis ${e.id}: «hasta» antes de «desde»`);
  const startFrame = a.frame - 2;
  return {id: e.id, startFrame, endFrame: Math.max(b.endFrame + (e.hold ?? 8), startFrame + (e.minFrames ?? 30)), lines: e.lines, range: [ia, ib], motivo: e.motivo};
}).sort((x, y) => x.startFrame - y.startFrame);
const inEmphasis = (i) => emphasis.some((e) => i >= e.range[0] && i <= e.range[1]);
const phrases = []; let phrase = [];
const close = () => { if (phrase.length) phrases.push(phrase); phrase = []; };
words.forEach((w, i) => { if (inEmphasis(i)) { close(); return; } phrase.push(w); if (/[,.;:?!…»]$/.test(w.text)) close(); });
close();
const len = (ws) => ws.map((x) => x.text).join(' ').length;
// un bloque no debe terminar en palabra débil («pero con el paso del | tiempo»): penaliza artículos, preposiciones,
// conjunciones y pronombres átonos al final de bloque
const DEBIL = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'a', 'al', 'con', 'por', 'para', 'y', 'e', 'o', 'que', 'nos', 'se', 'tu', 'tus', 'su', 'sus', 'mi', 'en', 'entre', 'es', 'como', 'pero', 'mientras', 'hacia', 'esta']);
const coste = (ws, last) => len(ws) + (!last && DEBIL.has(norm(ws[ws.length - 1].text)) ? 12 : 0) + (ws.length > 5 ? 50 : 0);
const read = [];
for (const p of phrases) {
  const m0 = Math.max(Math.ceil(p.length / 5), Math.ceil(len(p) / 24));
  const best = (i, parts) => { if (parts === 1) return {cost: coste(p.slice(i), true), cuts: []}; let out = {cost: Infinity, cuts: []}; for (let j = i + 1; j <= p.length - parts + 1; j++) { const rest = best(j, parts - 1); const cost = Math.max(coste(p.slice(i, j), false), rest.cost); if (cost < out.cost) out = {cost, cuts: [j, ...rest.cuts]}; } return out; };
  const weakEnd = (b) => [0, ...b.cuts].slice(1).some((j) => DEBIL.has(norm(p[j - 1].text)));
  let pick = best(0, Math.min(m0, p.length));
  if (weakEnd(pick) && m0 + 1 <= p.length) { const alt = best(0, m0 + 1); if (!weakEnd(alt)) pick = alt; }
  const bounds = [0, ...pick.cuts, p.length];
  for (let k = 0; k < bounds.length - 1; k++) { const ws = p.slice(bounds[k], bounds[k + 1]); read.push({text: ws.map((w) => w.text).join(' '), startFrame: ws[0].frame, endFrame: ws[ws.length - 1].endFrame}); }
}
read.sort((a, b) => a.startFrame - b.startFrame);
const starts = [...read.map((r) => r.startFrame), ...emphasis.map((e) => e.startFrame)].sort((a, b) => a - b);
for (const r of read) {
  const blocker = emphasis.find((e) => e.startFrame < r.endFrame + 12 && e.endFrame > r.startFrame && e.startFrame >= r.startFrame);
  const nextStart = starts.find((f) => f > r.startFrame) ?? total;
  let end = nextStart - r.endFrame < 12 ? nextStart : r.endFrame + 8;
  if (blocker) end = Math.min(end, blocker.startFrame);
  r.endFrame = Math.max(r.startFrame + 4, Math.min(end, total));
}
for (const r of read) { const e = emphasis.find((x) => r.startFrame >= x.startFrame && r.startFrame < x.endFrame); if (e) { r.startFrame = e.endFrame; r.endFrame = Math.max(r.endFrame, r.startFrame + 10); } }
for (let i = 0; i < read.length - 1; i++) read[i].endFrame = Math.min(read[i].endFrame, read[i + 1].startFrame);

// ---------- efectos de sonido ----------
const sounds = Object.fromEntries([...(sfxLib.sonidos ?? []), ...(sfxLib.sintetizados ?? [])].map((s) => [s.id, s]));
const design = edl.sfxDesign; const finalFrame = anchor(design.finalDesde, 'sfx final');
const cues = [];
for (const s of scenes) for (const [beat, sound, g = 1, off = 0] of design.escenas[s.id] ?? []) {
  const def = sounds[sound] ?? fail(`Sonido desconocido: ${sound}`);
  const frame = (s.beats[beat] ?? fail(`${s.id}: beat ${beat} no existe`)) + off;
  cues.push({frame, sound, file: def.archivo, volume: +(def.volumen * g * (frame >= finalFrame ? 0.5 : 1)).toFixed(3), motivo: `${s.id}.${beat}`});
}
for (const e of emphasis) { const def = sounds[design.enfasis]; cues.push({frame: e.startFrame, sound: design.enfasis, file: def.archivo, volume: +(def.volumen * (e.startFrame >= finalFrame ? 0.5 : 1)).toFixed(3), motivo: `${e.id} · énfasis`}); }
cues.sort((a, b) => a.frame - b.frame);
const kept = [], dropped = [];
for (const c of cues) {
  const clash = kept.find((k) => (k.sound === c.sound && c.frame - k.frame < design.limites.mismoSonidoFrames) || c.frame === k.frame && k.sound === c.sound);
  if (clash) dropped.push({...c, por: clash.motivo}); else kept.push(c);
}

// ---------- velocidad: cada frame f de la timeline 1x pasa a round(f / speed); las animaciones internas no cambian ----------
const map = (x) => Math.round(x / speed);
const totalOut = Math.round(dialogue.duracion * FPS);
for (const c of cuts) { const a = map(c.startFrame), z = map(c.startFrame + c.durationInFrames); Object.assign(c, {startFrame: a, durationInFrames: z - a, playbackRate: speed}); }
cuts[cuts.length - 1].durationInFrames = totalOut - cuts[cuts.length - 1].startFrame;
for (const sc of scenes) { sc.startFrame = map(sc.startFrame); for (const k of Object.keys(sc.beats)) sc.beats[k] = map(sc.beats[k]); }
scenes.forEach((sc, i) => { sc.durationInFrames = (scenes[i + 1]?.startFrame ?? totalOut) - sc.startFrame; });
for (const c of Object.values(camera.presentador)) { c.desde = map(c.desde); c.hasta = map(c.hasta); }
for (const r of [...read, ...emphasis]) { r.startFrame = map(r.startFrame); r.endFrame = map(r.endFrame); }
for (const c of [...kept, ...dropped]) c.frame = map(c.frame);
const finalOut = map(finalFrame);

const timeline = {
  fps: FPS, width: 1080, height: 1920, durationInFrames: totalOut, speed,
  audio: {dialogue: 'video-002/dialogue.wav', sfx: 'video-002/sfx.wav', music: 'video-002/music.wav', finalFrame: finalOut},
  source: {width: 1080, height: 1920},
  cuts, scenes, camera,
  captions: {read, emphasis: emphasis.map(({range, ...e}) => e)},
  sfx: kept, sfxDropped: dropped,
  musica: {...edl.musica, finalDesde: finalOut},
};
const report = {velocidad: speed, frames: totalOut, segundos: +(totalOut / FPS).toFixed(2), segundos1x: +(total / FPS).toFixed(2), cortes: cuts.length, escenas: scenes.length, presentador: scenes.filter((x) => x.modo === 'presentador').reduce((a, x) => a + x.durationInFrames, 0), lectura: read.length, enfasis: emphasis.length, efectos: kept.length, descartados: dropped.length};
if (process.argv.includes('--read')) console.log(read.map((r) => `${(r.startFrame / FPS).toFixed(2)} ${r.text}`).join('\n'));
if (!process.argv.includes('--dry')) {
  order.timeline = timeline; order.durationInFrames = totalOut; order.durationSeconds = report.segundos; order.status = 'preview-pendiente-de-revision';
  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2) + '\n');
}
console.log(`timeline: ${JSON.stringify(report)} · presentador ${(100 * report.presentador / totalOut).toFixed(0)} %`);
for (const s of scenes) console.log(`  ${s.id.padEnd(4)} ${s.modo.padEnd(11)} ${(s.startFrame / FPS).toFixed(2).padStart(6)}–${((s.startFrame + s.durationInFrames) / FPS).toFixed(2).padStart(6)} s  ${s.tipo}`);
