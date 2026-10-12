// VIDEO-002: hornea los iconos 3D (src/compositions/video002/icons3d.tsx → composición «Video002Icono3D», WebGL con
// gl «angle») en hojas de fotogramas: public/video-002/iconos3d/<nombre>.webp, 14 × 10 celdas de 300 px (20 de entrada
// y 120 de reposo en bucle), WebP con transparencia. Las escenas reproducen esas hojas con <Icon3D>.
// Uso: node src/videoAnalysis/video002/buildIconSprites.mjs [nombre,nombre,…]   (sin nombres: todos)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '../../..');
const ALL = ['clock', 'play', 'chart', 'eye', 'people', 'store', 'target', 'magnifier', 'cart', 'box', 'popcorn', 'gear', 'coins', 'checklist'];
const names = process.argv[2] ? process.argv[2].split(',') : ALL;
const COLS = 14, ROWS = 10;
const outDir = path.join(root, 'public/video-002/iconos3d');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'v002-iconos-'));
fs.mkdirSync(outDir, {recursive: true});
const chromiumOptions = {gl: 'angle'};
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
for (const name of names) {
  const inputProps = {name};
  const composition = await selectComposition({serveUrl, id: 'Video002Icono3D', inputProps, chromiumOptions});
  if (composition.durationInFrames !== COLS * ROWS) throw new Error(`la hoja espera ${COLS * ROWS} fotogramas y la composición tiene ${composition.durationInFrames}`);
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir, {recursive: true});
  const t0 = Date.now();
  await renderFrames({serveUrl, composition, inputProps, outputDir: dir, imageFormat: 'png', chromiumOptions, concurrency: 4, onStart: () => undefined, onFrameUpdate: () => undefined});
  const frames = fs.readdirSync(dir).filter((x) => x.endsWith('.png')).sort();
  if (frames.length !== COLS * ROWS) throw new Error(`${name}: ${frames.length} fotogramas`);
  const list = path.join(dir, 'lista.txt');
  fs.writeFileSync(list, frames.map((x) => `file '${path.join(dir, x)}'`).join('\n') + '\n');
  const out = path.join(outDir, `${name}.webp`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `tile=${COLS}x${ROWS}`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '92', '-pix_fmt', 'yuva420p', out]);
  console.log(`${name}: ${(fs.statSync(out).size / 1e6).toFixed(2)} MB · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
fs.rmSync(tmp, {recursive: true, force: true});
