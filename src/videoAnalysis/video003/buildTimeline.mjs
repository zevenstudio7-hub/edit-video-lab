// VIDEO-003 (#edit-1-motion): resuelve en frames de 30 fps las decisiones del guion técnico y escribe
// video-orders/VIDEO-003.json → timeline: planos de la toma (cortes de edl.cortes), escenas de motion con beats
// anclados a palabras, cámara (acercamientos discretos), subtítulos (lectura + énfasis, receta TypeCaptions, mismos
// criterios que VIDEO-002) y efectos de sonido por beat.
// Palabras: whisper large-v3-turbo sobre la voz montada (analysis/video-003-whisper/dialogue.json), instante DTW.
// Inicio de palabra = DTW − 60 ms (en esta grabación el DTW cae ~60–100 ms después del ataque de energía).
// Uso: node src/videoAnalysis/video003/buildTimeline.mjs [--dry] [--read]
import fs from 'node:fs';
import path from 'node:path';
import {norm} from '../lib/editCore.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-003.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const FPS = 30;
const fail = (m) => { throw new Error(m); };
const sfxLib = JSON.parse(fs.readFileSync(path.join(root, 'library/sfx/sfx.json'), 'utf8'));

// ---------- planos ----------
let at = 0;
const cuts = order.edl.cortes.map((c) => {
  const trimBefore = Math.round(c.in * FPS), dur = Math.round(c.out * FPS) - trimBefore;
  const cut = {id: c.id, source: 'video-003/hq/fuente-1080.mp4', alpha: 'video-003/hq/presentador-alfa.webm', startFrame: at, durationInFrames: dur, trimBefore};
  at += dur; return cut;
});
const total = at;

// ---------- palabras ----------
const wj = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-003-whisper/dialogue.json'), 'utf8'));
const fix = order.edl.correccionesTexto ?? {};
const words = [];
for (const seg of wj.transcription) for (const t of seg.tokens ?? []) {
  const x = t.text; if (/^\[_.*\]$/.test(x.trim()) || !x.trim()) continue;
  const d = t.t_dtw >= 0 ? t.t_dtw / 100 : t.offsets.from / 1000;
  const punct = /^[\p{P}\s]+$/u.test(x);
  if ((x.startsWith(' ') && !punct) || !words.length) words.push({text: x.trim(), start: Math.max(0, d - 0.06)}); else words[words.length - 1].text += x.trim();
}
for (const w of words) if (fix[w.text]) w.text = fix[w.text];
words.forEach((w, i) => { w.frame = Math.round(w.start * FPS); w.endFrame = Math.round((words[i + 1]?.start ?? total / FPS) * FPS); w.i = i; });
// la última palabra termina con la voz (~0,25 s de cola en el corte B)
words[words.length - 1].endFrame = Math.min(total, words[words.length - 1].frame + 22);
// busca «palabra» desde el frame `from` (anclas en orden de lectura)
// admite frases («se trata de velocidad»): devuelve la primera palabra de la secuencia
const find = (phrase, from = 0, ctx = '') => { const q = phrase.split(' ').map(norm); return words.find((w, i) => w.frame >= from && q.every((x, k) => words[i + k] && norm(words[i + k].text) === x)) ?? fail(`${ctx}: «${phrase}» no aparece después del frame ${from}`); };

// ---------- escenas (guion técnico del usuario, tramo a tramo) ----------
// beats: [nombre, palabra, desplazamiento en frames]
const ESCENAS = [
  {id: 's01', tipo: 'linea-tiempo', desde: null, beats: [['nodos', 'La'], ['ia', 'empezó'], ['pulso', 'rato']], motivo: '«La guerra… empezó hace rato»: línea temporal con nodos que avanzan; IA con pulso.'},
  {id: 's02', tipo: 'convergen', desde: 'y no se', beats: [['lineas', 'no se'], ['texto', 'militar,', -4]], motivo: '«no se trata de una guerra militar»: dos líneas enfrentadas que convergen; texto pequeño.'},
  {id: 's03', tipo: 'velocidad', desde: 'se trata de velocidad', beats: [['v', 'velocidad'], ['a', 'adaptación.']], motivo: '«velocidad y adaptación»: palabras con flecha y curva ascendente que se dibuja y acelera.'},
  {id: 's04', tipo: 'limite', desde: 'Mientras', beats: [['limite', 'hablan'], ['control', 'controlar'], ['seguridad', 'seguridad,']], motivo: '«controlar su avance por seguridad»: la curva encuentra un límite y desacelera; indicadores CONTROL y SEGURIDAD (lo que se dice).'},
  {id: 's05', tipo: 'acelera', desde: 'las', beats: [['libera', 'mismas'], ['contador', 'construyendo'], ['acelerador', 'acelerador.']], motivo: '«siguen pisando el acelerador»: el límite desaparece, la curva acelera y el medidor de velocidad de desarrollo sube.'},
  {id: 's06', tipo: 'dias', desde: 'En', beats: [['dias', 'días,', -6]], motivo: '«En cuestión de días»: contador de días acelerado y marcas de calendario (sin cifra concreta).'},
  {id: 's07', tipo: 'anthropic', desde: 'Anthropic', beats: [['marca', 'Anthropic'], ['opus', 'Opus'], ['sonnet', 'Sonnet']], motivo: 'Nodos en la línea: ANTHROPIC → OPUS 5.5 → SONNET 5.5, como se dice.'},
  {id: 's08', tipo: 'openai', desde: 'OpenAI', beats: [['marca', 'OpenAI'], ['astra', 'GPT-6'], ['sol', '6.1']], motivo: 'Otra rama: OPENAI → GPT-6 ASTRA → 6.1 SOL, como se dice; separación cada vez menor.'},
  {id: 's09', tipo: 'agentes', desde: 'junto', beats: [['capacidad', 'capacidad'], ['agentes', 'agentes.']], motivo: '«capacidad para agentes»: los nodos se conectan a RAZONAR → PLANIFICAR → EJECUTAR → HERRAMIENTAS.'},
  {id: 's10', tipo: 'claro', desde: 'Para mí', beats: [['claro', 'claro.']], motivo: '«esto es algo bastante claro»: limpieza; queda una sola línea ascendente y el presentador.'},
  {id: 's11', tipo: 'dominar', desde: 'La pregunta para', beats: [['negocio', 'negocio'], ['dominar', 'dominar'], ['tacha1', 'o nos', 2], ['reemplazar', 'reemplazar.'], ['tacha2', 'reemplazar.', 14]], motivo: '«¿dominar? / ¿reemplazar?»: indicadores que se tachan mientras la curva sigue creciendo.'},
  {id: 's12', tipo: 'pausa', desde: 'La pregunta debería', beats: [['zoom', 'pregunta debería']], motivo: '«La pregunta debería ser»: todo desaparece; micro pausa y acercamiento.'},
  {id: 's13', tipo: 'hoy', desde: 'cómo', beats: [['hoy', 'cómo'], ['ia', 'aprovechar'], ['agentes', 'todo'], ['auto', 'está'], ['prod', 'avanzando']], motivo: '«cómo vas a aprovechar todo lo que está avanzando»: gráfico desde HOY con IA → AGENTES → AUTOMATIZACIÓN → PRODUCTIVIDAD.'},
  {id: 's14', tipo: 'trayectorias', desde: 'antes', beats: [['tu', 'tu'], ['comp', 'competencia'], ['decision', 'haga']], motivo: '«antes de que tu competencia lo haga por ti»: dos trayectorias; la competencia se separa; punto de decisión en TU NEGOCIO.'},
  {id: 's15', tipo: 'carrera', desde: 'Porque', beats: [['ticks', 'carrera'], ['frenar', 'frenar']], motivo: '«esta carrera no va a frenar»: ambas curvas siguen y los ticks del eje pasan cada vez más rápido.'},
  {id: 's16', tipo: 'ventaja', desde: 'quienes', beats: [['supera', 'aprovechar'], ['ventaja', 'ventaja.'], ['flecha', 'ventaja.', 12]], motivo: '«tomarán la ventaja»: la línea de adopción supera a la otra; VENTAJA ↑; queda una flecha y el presentador.'},
];
let cursor = 0;
const scenes = ESCENAS.map((e) => {
  const startFrame = e.desde ? find(e.desde, cursor, e.id).frame - 3 : 0;
  cursor = startFrame + 4;
  const beats = Object.fromEntries(e.beats.map(([k, word, off = 0]) => [k, find(word, cursor - 1, `${e.id}.${k}`).frame + off]));
  return {id: e.id, tipo: e.tipo, startFrame, beats, motivo: e.motivo};
});
scenes.forEach((s, i) => { s.durationInFrames = (scenes[i + 1]?.startFrame ?? total) - s.startFrame; if (s.durationInFrames <= 0) fail(`Escena vacía: ${s.id}`); });

// ---------- cámara: claves [frame, escala] (foco en la cara) ----------
const S = Object.fromEntries(scenes.map((s) => [s.id, s]));
const camara = {
  foco: {x: 0.5, y: 0.27},
  claves: [
    [0, 1.0], [S.s02.startFrame, 1.035], // zoom-in muy ligero en la entrada
    [S.s05.beats.acelerador - 2, 1.035], [S.s05.beats.acelerador + 6, 1.075], // golpe en «acelerador»
    [S.s06.startFrame, 1.0, 'corte'],
    [S.s10.startFrame, 1.0], [S.s11.startFrame - 2, 1.06], // zoom muy suave hacia el rostro
    [S.s11.startFrame + 8, 1.0],
    [S.s12.beats.zoom, 1.0], [S.s12.beats.zoom + 12, 1.07], // la pregunta: pequeño zoom-in
    [S.s13.startFrame, 1.0, 'corte'],
    [cuts[1].startFrame, 1.05, 'corte'], // el corte del falso arranque se disimula con un cambio de escala
    [total, 1.05],
  ],
};

// ---------- subtítulos: énfasis + lectura ----------
const ENFASIS = [
  {id: 'e1', desde: 'empezó', hasta: 'rato', lines: [{text: 'empezó', size: 'l', tone: 'pink'}, {text: 'hace rato', size: 'm', tone: 'white', indent: 60}], motivo: 'Gancho: la guerra ya empezó.'},
  {id: 'e2', desde: 'pisando', hasta: 'acelerador.', lines: [{text: 'pisando el', size: 'm', tone: 'white'}, {text: 'acelerador.', size: 'l', tone: 'red', indent: 30}], motivo: 'Contraste con el control: aceleran.'},
  {id: 'e3', desde: 'bastante', hasta: 'claro.', lines: [{text: 'bastante', size: 'm', tone: 'white'}, {text: 'claro.', size: 'xl', tone: 'pink', indent: 60}], motivo: 'Bisagra del argumento.'},
  {id: 'e4', desde: 'tu negocio', hasta: 'negocio', lines: [{text: 'para tu', size: 'm', tone: 'white'}, {text: 'negocio', size: 'l', tone: 'pink', indent: 40}], motivo: 'Se habla al espectador.'},
  {id: 'e5', desde: 'debería ser cómo', hasta: 'ser cómo', lines: [{text: 'la pregunta', size: 'm', tone: 'white'}, {text: 'debería ser', size: 'l', tone: 'pink', indent: 30}], motivo: 'Cambio de jerarquía (la escena queda limpia).', incluirAnterior: 2},
  {id: 'e6', desde: 'por ti.', hasta: 'ti.', lines: [{text: 'lo haga', size: 'm', tone: 'white'}, {text: 'por ti.', size: 'xl', tone: 'red', indent: 60}], motivo: 'Urgencia frente a la competencia.', incluirAnterior: 2},
  {id: 'e7', desde: 'sepan', hasta: 'aprovechar', lines: [{text: 'quienes sepan', size: 'm', tone: 'white'}, {text: 'aprovechar', size: 'l', tone: 'pink', indent: 30}], motivo: 'Idea final: aprovechar las herramientas.', incluirAnterior: 1},
];
let ec = 0;
const emphasis = ENFASIS.map((e) => {
  let a = find(e.desde, ec, e.id); const b = find(e.hasta, a.frame, e.id);
  if (e.incluirAnterior) a = words[a.i - e.incluirAnterior];
  ec = b.frame;
  const startFrame = a.frame - 2;
  return {id: e.id, startFrame, endFrame: Math.max(b.endFrame + 8, startFrame + 30), lines: e.lines, range: [a.i, b.i], motivo: e.motivo};
});
const inEmphasis = (i) => emphasis.some((e) => i >= e.range[0] && i <= e.range[1]);
const phrases = []; let phrase = [];
const close = () => { if (phrase.length) phrases.push(phrase); phrase = []; };
words.forEach((w, i) => { if (inEmphasis(i)) { close(); return; } phrase.push(w); if (/[,.;:?!…»]$/.test(w.text)) close(); });
close();
const len = (ws) => ws.map((x) => x.text).join(' ').length;
const DEBIL = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'a', 'al', 'con', 'por', 'para', 'y', 'e', 'o', 'que', 'nos', 'se', 'tu', 'tus', 'su', 'sus', 'mi', 'en', 'entre', 'es', 'como', 'pero', 'mientras', 'hacia', 'esta', 'estas', 'va', 'las']);
const coste = (ws, last) => len(ws) + (!last && DEBIL.has(norm(ws[ws.length - 1].text)) ? 12 : 0) + (ws.length > 4 ? 50 : 0);
const read = [];
for (const p of phrases) {
  const m0 = Math.max(Math.ceil(p.length / 4), Math.ceil(len(p) / 22));
  const best = (i, parts) => { if (parts === 1) return {cost: coste(p.slice(i), true), cuts: []}; let out = {cost: Infinity, cuts: []}; for (let j = i + 1; j <= p.length - parts + 1; j++) { const rest = best(j, parts - 1); const cost = Math.max(coste(p.slice(i, j), false), rest.cost); if (cost < out.cost) out = {cost, cuts: [j, ...rest.cuts]}; } return out; };
  const weakEnd = (b) => b.cuts.some((j) => DEBIL.has(norm(p[j - 1].text)));
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
for (let i = 0; i < emphasis.length; i++) { const nx = read.find((r) => r.startFrame >= emphasis[i].startFrame); if (nx) emphasis[i].endFrame = Math.min(emphasis[i].endFrame, nx.startFrame); }

// ---------- efectos ----------
const sounds = Object.fromEntries([...(sfxLib.sonidos ?? []), ...(sfxLib.sintetizados ?? [])].map((s) => [s.id, s]));
const SFX = {
  s01: [['nodos', 'zp-swish', 0.8], ['ia', 'zp-pulse']],
  s02: [['lineas', 'zp-swish'], ['texto', 'zp-pop-hi', 0.7]],
  s03: [['v', 'zp-rise'], ['a', 'zp-pop-hi', 0.8]],
  s04: [['limite', 'zp-clunk', 0.8], ['control', 'zp-pop-hi', 0.7], ['seguridad', 'zp-pop-hi', 0.7]],
  s05: [['libera', 'zp-unplug', 0.8], ['acelerador', 'whoosh', 0.7]],
  s06: [['dias', 'zp-tock']],
  s07: [['marca', 'zp-pop'], ['opus', 'zp-pop-hi'], ['sonnet', 'zp-pop-hi']],
  s08: [['marca', 'zp-pop'], ['astra', 'zp-pop-hi'], ['sol', 'zp-pop-hi']],
  s09: [['capacidad', 'zp-assemble', 0.7]],
  s10: [],
  s11: [['dominar', 'zp-pop-hi', 0.8], ['tacha1', 'zp-marker'], ['reemplazar', 'zp-pop-hi', 0.8], ['tacha2', 'zp-marker']],
  s12: [],
  s13: [['hoy', 'zp-tick'], ['ia', 'zp-pop-hi', 0.8], ['agentes', 'zp-pop-hi', 0.8], ['auto', 'zp-pop-hi', 0.8], ['prod', 'zp-rise', 0.8]],
  s14: [['comp', 'zp-swish'], ['decision', 'zp-pulse']],
  s15: [['ticks', 'zp-step', 0.8]],
  s16: [['supera', 'zp-swish-up'], ['ventaja', 'zp-chime', 0.8]],
};
const cues = [];
for (const s of scenes) for (const [beat, sound, g = 1] of SFX[s.id] ?? []) {
  const def = sounds[sound] ?? fail(`Sonido desconocido: ${sound}`);
  cues.push({frame: s.beats[beat] ?? fail(`${s.id}: beat ${beat}`), sound, file: def.archivo, volume: +(def.volumen * g).toFixed(3), motivo: `${s.id}.${beat}`});
}
for (const e of emphasis) { const def = sounds['zp-text']; cues.push({frame: e.startFrame, sound: 'zp-text', file: def.archivo, volume: +(def.volumen * 0.8).toFixed(3), motivo: `${e.id} · énfasis`}); }
cues.sort((a, b) => a.frame - b.frame);
const kept = [], dropped = [];
for (const c of cues) { const clash = kept.find((k) => Math.abs(c.frame - k.frame) < 5); if (clash) dropped.push({...c, por: clash.motivo}); else kept.push(c); }

const timeline = {
  fps: FPS, durationInFrames: total,
  source: {width: 1080, height: 1920, fps: 24},
  audio: {dialogue: 'video-003/dialogue.wav', sfx: 'video-003/sfx.wav', music: 'video-003/music.wav'},
  cuts, scenes, camera: camara,
  captions: {read, emphasis: emphasis.map(({range, ...e}) => e)},
  sfx: kept, sfxDropped: dropped,
  musica: {generador: 'library/music/synth-music.mjs', bpm: 100, nivel: -31, duckingDb: -5, finalDesde: S.s16.startFrame, finalDb: -8, motivo: 'Base propia discreta bajo la voz (como VIDEO-002); baja en la última frase.'},
};
if (process.argv.includes('--read')) console.log(read.map((r) => `${(r.startFrame / FPS).toFixed(2)} ${r.text}`).join('\n'), '\n', emphasis.map((e) => `${(e.startFrame / FPS).toFixed(2)} [${e.id}] ${e.lines.map((l) => l.text).join(' / ')}`).join('\n'));
if (!process.argv.includes('--dry')) {
  order.timeline = timeline; order.durationInFrames = total; order.durationSeconds = +(total / FPS).toFixed(2);
  order.palabras = words.map((w) => ({text: w.text, start: +w.start.toFixed(3), frame: w.frame}));
  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2) + '\n');
}
console.log(`timeline: ${total} frames (${(total / FPS).toFixed(2)} s) · ${scenes.length} escenas · lectura ${read.length} · énfasis ${emphasis.length} · efectos ${kept.length} (descartados ${dropped.length})`);
for (const s of scenes) console.log(`  ${s.id} ${(s.startFrame / FPS).toFixed(2).padStart(6)}–${((s.startFrame + s.durationInFrames) / FPS).toFixed(2).padStart(6)} s  ${s.tipo}  ${JSON.stringify(s.beats)}`);
