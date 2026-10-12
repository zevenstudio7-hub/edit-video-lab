// VIDEO-002: fotogramas de control de una composición (un solo empaquetado, muchos renderStill) y hoja de contactos.
// Uso: node src/videoAnalysis/video002/stills.mjs <carpeta-salida> <frame,frame,…> [composición=Video002] [columnas=6]
// Escribe <carpeta>/fNNNN.jpg y <carpeta>/hoja.jpg (los iconos 3D necesitan WebGL: se renderiza con gl «angle»).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '../../..');
const [outDir, frameList, compId = 'Video002', cols = '6'] = process.argv.slice(2);
if (!outDir || !frameList) throw new Error('uso: stills.mjs <carpeta> <frames> [composición] [columnas]');
fs.mkdirSync(outDir, {recursive: true});
const frames = frameList.split(',').map(Number);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const chromiumOptions = {gl: 'angle'};
const composition = await selectComposition({serveUrl, id: compId, chromiumOptions});
const files = [];
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`);
  await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 88, chromiumOptions, scale: 0.5});
  files.push(output);
  process.stdout.write(`${frame} `);
}
// hoja de contactos con el número de frame
const n = Number(cols), rows = Math.ceil(files.length / n);
const inputs = files.flatMap((f) => ['-i', f]);
const font = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const label = files.map((f, i) => fs.existsSync(font) ? `[${i}:v]drawtext=fontfile='${font}':text='${frames[i]}':x=12:y=10:fontsize=30:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=8[l${i}]` : `[${i}:v]null[l${i}]`).join(';');
const pads = Array.from({length: n * rows - files.length}, (_, k) => `color=c=black:s=540x960:d=1[p${k}]`).join(';');
const all = [...files.map((_, i) => `[l${i}]`), ...Array.from({length: n * rows - files.length}, (_, k) => `[p${k}]`)];
const grid = `${all.join('')}xstack=inputs=${n * rows}:layout=${Array.from({length: n * rows}, (_, i) => `${(i % n) * 540}_${Math.floor(i / n) * 960}`).join('|')}`;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', [label, pads, grid].filter(Boolean).join(';'), '-frames:v', '1', '-q:v', '3', path.join(outDir, 'hoja.jpg')]);
console.log(`\nhoja: ${path.join(outDir, 'hoja.jpg')} (${files.length} fotogramas)`);
