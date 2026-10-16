// VIDEO-005 (#edit-1-motion · 1C · S1+S4): resuelve en frames de 30 fps el guion técnico del usuario
// (formatos/edit-1-motion/VIDEO-005-google-ia-contadores/material/raiz-contenido-yeirodriguez.md) y escribe
// video-orders/VIDEO-005.json → timeline.
// La voz es la de la toma, intacta (decisión del usuario 2026-10-13: «no le trabajes al audio»): la timeline va 1:1 con
// la toma (frame f ↔ f/30 s de fuente) y se añade un cierre de 1,5 s sin voz para las tarjetas finales.
// Palabras: whisper large-v3-turbo de la toma (analysis/video-005-whisper/source.json), instante DTW − 60 ms;
// correcciones por índice contrastadas con Gemini (analysis/video-005-gemini-snippets.txt).
// Uso: node src/videoAnalysis/video005/buildTimeline.mjs [--dry] [--read]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-005.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const FPS = 30;
const fail = (m) => { throw new Error(m); };
const sfxLib = JSON.parse(fs.readFileSync(path.join(root, 'library/sfx/sfx.json'), 'utf8'));
const FUENTE_S = 72.583; // duración de la toma
const VOZ_F = Math.floor(FUENTE_S * FPS); // 2177
const CIERRE_F = 45; // tarjetas finales tras la voz
const total = VOZ_F + CIERRE_F;

// ---------- palabras ----------
const wj = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-005-whisper/source.json'), 'utf8'));
const raw = [];
for (const seg of wj.transcription) for (const t of seg.tokens ?? []) {
  const x = t.text; if (/^\[_.*\]$/.test(x.trim()) || !x.trim()) continue;
  const d = t.t_dtw >= 0 ? t.t_dtw / 100 : t.offsets.from / 1000;
  const punct = /^[\p{P}\s]+$/u.test(x);
  if ((x.startsWith(' ') && !punct) || !raw.length) raw.push({text: x.trim(), start: Math.max(0, d - 0.06)}); else raw[raw.length - 1].text += x.trim();
}
// correcciones por índice (orden.verificacion.correcciones): texto oído, no el del guion
const FIX = {13: 'Sheets', 109: 'guarda el', 110: 'adjunto', 146: 'adjuntos', 155: 'clasp', 176: 'Sheets,', 186: 'n8n-MCP', 201: 'Sheets'};
const DROP = new Set([187, 188, 233]); // «en NCP» (parte de n8n-MCP) · «a» de «comenta a Google» (Gemini: «comenta Google»)
const words = [];
raw.forEach((w, i) => { if (DROP.has(i)) return; words.push({i, text: FIX[i] ?? w.text, start: w.start}); });
words.forEach((w, k) => { w.frame = Math.round(w.start * FPS); w.endFrame = Math.round((words[k + 1]?.start ?? FUENTE_S) * FPS); });
words[words.length - 1].endFrame = Math.min(VOZ_F, words[words.length - 1].frame + 20);
const W = (i) => (words.find((w) => w.i === i) ?? fail(`palabra ${i}`)).frame;

// ---------- escenas (guion §4, recalibrado con la toma; ver orden.diferencias) ----------
// presentador = la toma tiene imagen (0–8,04 s · 27,67–32,42 s · 64,50–72,58 s); motion = la toma está en negro
const sec = (s) => Math.round(s * FPS);
const ESCENAS = [
  {id: 'esc1', modo: 'presentador', tipo: 'gancho', desde: 0, beats: {card: W(6), drive: W(10), gmail: W(11), sheets: W(13), cardSale: W(20)}, motivo: 'Gancho a cámara; los 3 iconos aparecen junto a Yeison al nombrarlos.'},
  {id: 'esc2', modo: 'motion', tipo: 'conectar', desde: sec(8.042), beats: {titular: W(25), orbita: W(26), conectar: W(31), ia: W(36), facil: W(44)}, motivo: '«conectar tu Google con la inteligencia artificial»: Gmail, Drive y Sheets orbitan el nodo IA; las líneas se encienden en «mucho más fácil».'},
  {id: 'esc3', modo: 'motion', tipo: 'casos', desde: W(45) - 4, beats: {c1: W(46), c2: W(52), c3: W(60), checks: W(63)}, motivo: 'Tres casos de uso, cada tarjeta con su frase.'},
  {id: 'esc4', modo: 'motion', tipo: 'repos', desde: W(65) - 4, beats: {r1: W(69), r2: W(74), r3: W(83)}, motivo: 'Tres repositorios numerados que se iluminan con su función (aún sin nombrarlos en la voz).'},
  {id: 'esc5', modo: 'presentador', tipo: 'puente', desde: sec(27.667), beats: {card: W(94), k1: W(97), k2: W(98), k3: W(101)}, motivo: 'Puente a la demo: Recibir → Organizar → Enviar y tres checks.'},
  {id: 'esc5b', modo: 'motion', tipo: 'flujo-demo', desde: sec(32.417), beats: {busca: W(106), adjunto: W(110), carpeta: W(113), nombra: W(117), registra: W(120), revisas: W(126)}, motivo: 'Frase grabada que no está en el guion («La IA busca el correo… tú solo revisas»): se muestran aquí los pasos 2–5 de la demo del guion (encuentra, organiza, nombra, registra, revisas). SIMULACIÓN.'},
  {id: 'esc6', modo: 'motion', tipo: 'cli', desde: W(129) - 4, beats: {card: W(130), pides: W(136), teclea: W(138), fin: W(153), listo: W(153) + 4}, motivo: 'Repo 01: Google Workspace CLI; el prompt se teclea al decirlo. SIMULACIÓN.'},
  {id: 'esc7', modo: 'motion', tipo: 'clasp', desde: W(154) - 4, beats: {card: W(155), codigo: W(166), script: W(168), sheets: W(171), pdf: W(174), drive: W(179), gmail: W(183)}, motivo: 'Repo 02: clasp; flujo Sheets → PDF → Drive → Gmail; código genérico desenfocado en «Apps Script».'},
  {id: 'esc8', modo: 'motion', tipo: 'n8n', desde: W(184) - 4, beats: {card: W(186), aclara: W(189), gmail: W(192), sheets: W(199), borrador: W(206)}, motivo: 'Repo 03: n8n-MCP; Gmail → Sheets → Borrador en cadena; «El MCP diseña · n8n ejecuta».'},
  {id: 'esc9', modo: 'presentador', tipo: 'cierre', desde: sec(64.5), beats: {guia: W(212), comenta: W(232), google: W(234), sigueme: W(236) - 4, expande: W(236) + 8, clic: W(236) + 30}, motivo: 'CTA hablado. «comenta Google»: píldora oscura de comentario en la que se escribe GOOGLE y pasa un barrido de luz (referencia del usuario, material/referencias/referencia-comenta-seguir.mov). «sígueme»: el avatar entra en arco y se expande en la tarjeta de perfil recreada (captura del usuario, sin cifras); el cursor pulsa «Seguir» (azul) → «Siguiendo».'},
  {id: 'fin', modo: 'motion', tipo: 'tarjetas-finales', desde: VOZ_F, beats: {}, motivo: 'Últimos ~2 s: las 3 tarjetas apiladas con @yeirodriguez.co (guion §4, ESC 9).'},
];
const scenes = ESCENAS.map((e) => ({...e, startFrame: e.desde}));
scenes.forEach((s, k) => { delete s.desde; s.durationInFrames = (scenes[k + 1]?.startFrame ?? total) - s.startFrame; if (s.durationInFrames <= 0) fail(`escena vacía ${s.id}`); });

// ---------- subtítulos: lectura con palabra activa (S1 + cambio) y énfasis S1 en el presentador ----------
const ENFASIS = [
  {id: 'e1', desde: 22, hasta: 24, lines: [{text: 'esto te', size: 'm', tone: 'white'}, {text: 'interesa.', size: 'l', tone: 'pink', indent: 40}], motivo: 'Remate del gancho.'},
];
const emphasis = ENFASIS.map((e) => {
  const a = words.find((w) => w.i === e.desde), b = words.find((w) => w.i === e.hasta);
  return {id: e.id, startFrame: a.frame - 2, endFrame: Math.max(b.endFrame + 8, a.frame + 28), lines: e.lines, range: [e.desde, e.hasta], motivo: e.motivo};
});
const enEnfasis = (i) => emphasis.some((e) => i >= e.range[0] && i <= e.range[1]);
const DEBIL = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'a', 'al', 'con', 'por', 'para', 'y', 'e', 'o', 'que', 'se', 'tu', 'tus', 'su', 'sus', 'en', 'es', 'lo', 'le', 'te', 'este', 'esta']);
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}-]/gu, '');
// bloques de 2–4 palabras (máx. ~24 caracteres), cortados en la puntuación, en los cambios de escena y antes de un énfasis
const corteEscena = new Set(scenes.map((s) => s.startFrame));
const read = []; let blk = [];
const cerrar = () => { if (blk.length) read.push({words: blk}); blk = []; };
words.forEach((w, k) => {
  if (enEnfasis(w.i)) { cerrar(); return; }
  if (blk.length && [...corteEscena].some((f) => w.frame >= f && blk[0].frame < f)) cerrar();
  const largo = [...blk, w].map((x) => x.text).join(' ').length;
  if (blk.length >= 4 || (blk.length >= 2 && largo > 24)) {
    // no dejar una palabra débil al final del bloque: se pasa al siguiente
    if (DEBIL.has(norm(blk[blk.length - 1].text)) && blk.length > 1) { const last = blk.pop(); cerrar(); blk.push(last); } else cerrar();
  }
  blk.push(w);
  if (/[,.;:?!]$/.test(w.text)) cerrar();
});
cerrar();
const lectura = read.map((b, k) => {
  const startFrame = b.words[0].frame;
  const next = read[k + 1]?.words[0].frame ?? VOZ_F;
  const fin = b.words[b.words.length - 1].endFrame;
  return {text: b.words.map((w) => w.text).join(' '), startFrame, endFrame: next - fin < 12 ? next : fin + 8, palabras: b.words.map((w) => ({text: w.text, frame: w.frame}))};
});
for (const e of emphasis) for (const r of lectura) if (r.endFrame > e.startFrame && r.startFrame < e.startFrame) r.endFrame = e.startFrame;

// ---------- efectos (guion §3.5 + mapa de Motion UX) ----------
const sounds = Object.fromEntries([...(sfxLib.sonidos ?? []), ...(sfxLib.sintetizados ?? [])].map((s) => [s.id, s]));
const S = Object.fromEntries(scenes.map((s) => [s.id, s]));
const SFX = [
  ['esc1', 'drive', 'zp-pop-hi', 0.8], ['esc1', 'gmail', 'zp-pop-hi', 0.8], ['esc1', 'sheets', 'zp-pop-hi', 0.8],
  ['esc2', '@', 'whoosh', 0.8], ['esc2', 'conectar', 'zp-swish', 0.7], ['esc2', 'facil', 'zp-pulse'],
  ['esc3', 'c1', 'zp-pop'], ['esc3', 'c2', 'zp-pop'], ['esc3', 'c3', 'zp-pop'], ['esc3', 'checks', 'zp-confirm', 0.7],
  ['esc4', 'r1', 'zp-pulse', 0.8], ['esc4', 'r2', 'zp-pulse', 0.8], ['esc4', 'r3', 'zp-pulse', 0.8],
  ['esc5', 'k1', 'zp-tick'], ['esc5', 'k2', 'zp-tick'], ['esc5', 'k3', 'zp-tick'],
  ['esc5b', '@', 'whoosh', 0.8], ['esc5b', 'busca', 'zp-tick'], ['esc5b', 'carpeta', 'zp-tick'], ['esc5b', 'nombra', 'zp-tick'], ['esc5b', 'registra', 'zp-tick'], ['esc5b', 'revisas', 'zp-confirm'],
  ['esc6', 'card', 'zp-pop'], ['esc6', 'teclea', 'zp-keys', 0.8], ['esc6', 'listo', 'zp-chime', 0.8],
  ['esc7', 'card', 'zp-pop'], ['esc7', 'sheets', 'zp-tick'], ['esc7', 'pdf', 'zp-tick'], ['esc7', 'drive', 'zp-tick'], ['esc7', 'gmail', 'zp-confirm', 0.8],
  ['esc8', 'card', 'zp-pop'], ['esc8', 'gmail', 'zp-tick'], ['esc8', 'sheets', 'zp-tick'], ['esc8', 'borrador', 'zp-confirm', 0.8],
  ['esc9', 'comenta', 'zp-keys', 0.6], ['esc9', 'google', 'zp-pop'], ['esc9', 'sigueme', 'zp-swish-up', 0.8], ['esc9', 'expande', 'zp-pop-hi'], ['esc9', 'clic', 'zp-tick'],
  ['fin', '@', 'zp-sparkle', 0.7],
];
const cues = SFX.map(([id, beat, sound, g = 1]) => {
  const def = sounds[sound] ?? fail(`Sonido desconocido: ${sound}`);
  const frame = beat === '@' ? S[id].startFrame : S[id].beats[beat] ?? fail(`${id}.${beat}`);
  return {frame, sound, file: def.archivo, volume: +(def.volumen * g).toFixed(3), motivo: `${id}.${beat}`};
}).sort((a, b) => a.frame - b.frame);

const timeline = {
  fps: FPS, durationInFrames: total, vozFrames: VOZ_F,
  source: {width: 1080, height: 1920, fps: 24, video: 'video-005/hq/fuente-cine-calido-10.mp4'},
  audio: {dialogue: 'video-005/voz-original.wav', sfx: 'video-005/sfx.wav', music: 'video-005/music.wav'},
  scenes,
  captions: {read: lectura, emphasis: emphasis.map(({range, ...e}) => e)},
  sfx: cues,
  musica: {generador: 'library/music/synth-music.mjs', bpm: 100, nivel: -38.5, duckingDb: -4, finalDesde: total - 60, finalDb: -30, motivo: 'Guion §3.5: base suave 22–24 dB bajo la voz (voz original ≈ −16,1 LUFS → música −38,5 LUFS), compresión por la voz y casi a cero en los últimos 2 s.'},
};
if (process.argv.includes('--read')) console.log(lectura.map((r) => `${(r.startFrame / FPS).toFixed(2)} ${r.text}`).join('\n'));
if (!process.argv.includes('--dry')) {
  order.timeline = timeline; order.durationInFrames = total; order.durationSeconds = +(total / FPS).toFixed(2);
  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2) + '\n');
}
console.log(`timeline: ${total} frames (${(total / FPS).toFixed(2)} s) · ${scenes.length} escenas · lectura ${lectura.length} · énfasis ${emphasis.length} · efectos ${cues.length}`);
for (const s of scenes) console.log(`  ${s.id.padEnd(6)} ${s.modo.padEnd(11)} ${(s.startFrame / FPS).toFixed(2).padStart(6)}–${((s.startFrame + s.durationInFrames) / FPS).toFixed(2).padStart(6)} s  ${JSON.stringify(s.beats)}`);
