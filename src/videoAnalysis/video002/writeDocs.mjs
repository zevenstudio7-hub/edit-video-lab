// VIDEO-002: genera los entregables escritos desde la orden (no se editan a mano):
//  - mapa-de-cortes.md / mapa-de-cortes.csv: archivo, entrada, salida, posición en la pista montada y frase conservada;
//  - guion-tecnico.md: por tramo, narración real (transcripción depurada), modo, imagen, cámara, énfasis y sonido.
// Uso: node src/videoAnalysis/video002/writeDocs.mjs   (después de buildTimeline.mjs)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-002.json'), 'utf8'));
const {edl, timeline: tl} = order;
const dialogue = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-002-dialogue.json'), 'utf8'));
const words = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-002-words.json'), 'utf8')).palabras;
const dir = path.join(root, order.carpeta);
const FPS = tl.fps, speed = tl.speed ?? 1;
const ts = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;
const fr = (f) => ts(f / FPS);
const mapa = Object.fromEntries(dialogue.cortes.map((c) => [c.id, c]));

// ---------- mapa de cortes ----------
const rows = edl.cuts.map((c, i) => ({n: i + 1, id: c.id, archivo: edl.tomas[c.toma].id + '.MP4', toma: c.toma, entrada: c.in, salida: c.out, desde: mapa[c.id].desde / speed, hasta: mapa[c.id].hasta / speed, frase: c.frase, motivo: c.motivo}));
let md = `# VIDEO-002 — mapa de cortes\n\nGenerado desde \`video-orders/VIDEO-002.json\` (\`edl.cuts\`) por \`src/videoAnalysis/video002/writeDocs.mjs\`. Tiempos en segundos de cada toma; «En la pista» es la posición en la voz montada a ${speed}x (\`public/video-002/dialogue.wav\`, ${dialogue.duracion} s; a 1x, \`dialogue-1x.wav\`, ${dialogue.duracion1x ?? dialogue.duracion} s).\n\n`;
md += `- **Toma A:** \`${edl.tomas.A.id}.MP4\` (60,1 s), ideas 1–8. Su intento cortado de la frase de Muse (53,5–60 s) se descarta.\n- **Toma B:** \`${edl.tomas.B.id}.MP4\` (48,0 s), ideas 9–12 y la pregunta final.\n\n`;
md += '| # | Archivo | Entrada | Salida | En la pista | Frase conservada |\n|---|---|---|---|---|---|\n';
for (const r of rows) md += `| ${r.n} | ${r.toma} · \`${r.archivo.slice(0, 8)}…\` | ${r.entrada.toFixed(3)} | ${r.salida.toFixed(3)} | ${ts(r.desde)}–${ts(r.hasta)} | ${r.frase} |\n`;
md += '\n## Motivo de cada corte\n\n';
for (const r of rows) md += `- **${r.n} (${r.id})**: ${r.motivo}\n`;
md += `\n## Criterios\n\n${Object.entries(edl.criterios).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}\n`;
fs.writeFileSync(path.join(dir, 'mapa-de-cortes.md'), md);
const csv = ['n,archivo,toma,entrada_s,salida_s,pista_desde_s,pista_hasta_s,frase', ...rows.map((r) => [r.n, r.archivo, r.toma, r.entrada, r.salida, r.desde, r.hasta, `"${r.frase.replace(/"/g, '""')}"`].join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(dir, 'mapa-de-cortes.csv'), csv);

// ---------- guion técnico ----------
const said = (a, b) => words.filter((w) => (w.start / speed) * FPS >= a - 1 && (w.start / speed) * FPS < b - 1).map((w) => w.text).join(' ');
const sceneDef = Object.fromEntries(edl.escenas.map((e) => [e.id, e]));
let g = `# VIDEO-002 — guion técnico\n\nBasado en la transcripción depurada de la voz montada (lo que el presentador dice), no en el guion orientativo. Generado por \`src/videoAnalysis/video002/writeDocs.mjs\` desde la timeline (${tl.durationInFrames} frames, ${(tl.durationInFrames / FPS).toFixed(2)} s a ${FPS} fps, velocidad ${speed}x: voz con Rubber Band conservando el tono, planos a ${speed}x; las animaciones no se aceleran).\n\n`;
g += '**Identidad:** video-zeven (`formatos/identidad-video-zeven.md`). **Subtítulos:** lectura + énfasis de edit-2. **Música:** base propia (`library/music/synth-music.mjs`), comprimida bajo la voz y reducida en la última frase.\n\n';
g += '**Voz:** la versión mejorada que entregó el usuario (`edl.vozMejorada`), colocada a la muestra sobre el montaje. **Motion:** sobre la franja negra (`band.tsx`): los textos y las tarjetas oscuras salen de ella, los objetos se apoyan en su borde y cada escena se hunde en ella al dar paso a la siguiente. **Iconos:** 3D propios (`icons3d.tsx`, horneados) y relieve SVG (`relief.tsx`). Cuentas y perfiles de redes con la marca del usuario, @yeirodriguez.co.\n\n';
g += '**Recursos externos:** investigación y derechos en `analysis/video-002-support-research.json` (imagen oficial de Muse con la mascota Jolly: `requiere_revision`).\n\n';
g += '## Diferencias con el guion orientativo\n\n';
g += [
  '- **Escena 2:** dice «el paso del tiempo y el avance de la tecnología… algo totalmente diferente», no «la evolución de la inteligencia artificial… algo mucho más interesante». La escena muestra la sustitución del feed por una tarjeta de trabajo.',
  '- **Escena 3:** «Facebook, Instagram, TikTok, sí compiten por entretenerte» (whisper oye «y todo»; Gemini y la señal, «TikTok»).',
  '- **Escena 4:** «algo muchísimo más importante» (no «valioso»).',
  '- **Escena 5:** «algo todavía mucho más importante y valioso, audiencia».',
  '- **Escena 6:** «Y aquí es donde se pone más interesante, porque Meta acaba de lanzar Muse for Small Business» («Muse» dicho rápido: los transcriptores lo funden con «for», pero la señal muestra la sílaba).',
  '- **Escena 8:** el objetivo es «ayúdame a **buscar** nuevos clientes» (no «conseguir»); es lo que se escribe en la tarjeta.',
  '- **Escena 9:** nombra solo **Shopify, Canva y Notion** y «etcétera»; no Stripe, Klaviyo ni HighLevel. Un solo grupo de herramientas y un «+».',
  '- **Escena 10:** «tienes contenido, tienes audiencia, tienes ejecución y sobre todo tienes ventas» (sin «atención»): cuatro tarjetas.',
  '- **Escena 11:** «encontrar a quien vendérselo».',
  '- **Idea nueva:** cierre con la pregunta «¿En qué lado estás tú?» (grabada): presentador y énfasis.',
  '- **Se descartan:** el falso arranque «las» (toma A), la muletilla «eh» entre Canva y Notion (toma B) y el intento cortado de la frase de Muse al final de la toma A.',
].join('\n') + '\n\n';
g += '## Tramos\n\n';
for (const s of tl.scenes) {
  const end = s.startFrame + s.durationInFrames, def = sceneDef[s.id];
  const cam = tl.camera.presentador[s.id];
  const emph = tl.captions.emphasis.filter((e) => e.startFrame >= s.startFrame && e.startFrame < end);
  const sfx = tl.sfx.filter((c) => c.frame >= s.startFrame && c.frame < end);
  g += `### ${s.id} · ${fr(s.startFrame)}–${fr(end)} · ${s.modo === 'presentador' ? 'Presentador' : 'Motion a pantalla completa'} · ${s.tipo}\n\n`;
  g += `- **Voz:** «${said(s.startFrame, end)}»\n`;
  g += `- **Imagen:** ${def.motivo}\n`;
  g += `- **Momentos:** ${Object.entries(s.beats).map(([k, f]) => `${k} ${fr(f)}`).join(' · ')}\n`;
  if (cam) g += `- **Cámara:** presentador ${Math.round(cam.de * 100)} % → ${Math.round(cam.a * 100)} % (${fr(cam.desde)}–${fr(cam.hasta)}).\n`;
  else g += '- **Cámara:** cámara interna de la escena (acercamientos al detalle y alejamientos para revelar conjuntos).\n';
  if (emph.length) g += `- **Énfasis:** ${emph.map((e) => `«${e.lines.map((l) => l.text).join(' ')}» (${fr(e.startFrame)})`).join(' · ')}\n`;
  if (sfx.length) g += `- **Sonido:** ${sfx.map((c) => `${c.sound} ${fr(c.frame)}`).join(' · ')}\n`;
  g += '\n';
}
fs.writeFileSync(path.join(dir, 'guion-tecnico.md'), g);
console.log(`escritos: ${path.relative(root, path.join(dir, 'mapa-de-cortes.md'))}, mapa-de-cortes.csv, guion-tecnico.md`);
