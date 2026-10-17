// VIDEO-009: une los cortes de la orden (de una o varias fuentes) en un proxy continuo (1620×2880, 24 fps, audio original) y
// calcula la línea de tiempo en frames. Los originales no se tocan. Escribe public/video-009/proxy.mp4 y analysis/video-009-timeline.json.
// Uso: node src/videoAnalysis/video009/buildProxy.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-009.json'), 'utf8'));
const FPS = order.formato.fps;
const srcs = order.fuentes.tomas;
let cursor = 0;
const timeline = order.edl.map((c) => {
  const durF = Math.round((c.out_s - c.in_s) * FPS);
  const t = {...c, dur_f: durF, from_f: cursor, to_f: cursor + durF};
  cursor += durF;
  return t;
});
const f = (s) => s.toFixed(3);
const FADE = 0.008;
const parts = timeline.map((t, i) => {
  const k = srcs.findIndex((s) => s.id === t.src);
  const d = t.dur_f / FPS;
  return `[${k}:v]trim=start=${f(t.in_s)}:duration=${f(d)},setpts=PTS-STARTPTS,fps=${FPS},scale=1620:2880:flags=lanczos,setsar=1[v${i}];` +
    `[${k}:a]atrim=start=${f(t.in_s)}:duration=${f(d)},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo,afade=t=in:d=${FADE},afade=t=out:st=${f(d - FADE)}:d=${FADE}[a${i}]`;
});
const labels = timeline.map((_, i) => `[v${i}][a${i}]`).join('');
const graph = parts.join(';') + `;${labels}concat=n=${timeline.length}:v=1:a=1[v][a]`;
fs.mkdirSync(path.join(root, 'public/video-009'), {recursive: true});
const inputs = srcs.flatMap((s) => ['-i', s.ruta]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph, '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', path.join(root, 'public/video-009/proxy.mp4')], {stdio: 'inherit'});
fs.writeFileSync(path.join(root, 'analysis/video-009-timeline.json'), JSON.stringify({fps: FPS, total_f: cursor, timeline}, null, 2));
console.log('total', cursor, 'frames =', (cursor / FPS).toFixed(2), 's');
