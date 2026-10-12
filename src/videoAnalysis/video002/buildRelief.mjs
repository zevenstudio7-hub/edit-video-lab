// VIDEO-002: renderiza el relieve SVG (src/compositions/video002/relief.tsx → composición «Video002Relieve») a PNG
// transparente en public/video-002/relieve/<variante>.png. Las escenas usan esas imágenes: los filtros de relieve son
// demasiado caros para recalcularlos en cada frame (el Studio iba a saltos con las 36 personas de m3).
// Uso: node src/videoAnalysis/video002/buildRelief.mjs   (después de cambiar relief.tsx)
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '../../..');
const outDir = path.join(root, 'public/video-002/relieve');
fs.mkdirSync(outDir, {recursive: true});
const VARIANTS = ['avatar-ink', 'avatar-blue', 'avatar-yellow', 'avatar-red', 'chip-plain', 'chip-grey', 'chip-blue', 'check', 'heart'];
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
for (const variant of VARIANTS) {
  const inputProps = {variant};
  const composition = await selectComposition({serveUrl, id: 'Video002Relieve', inputProps});
  await renderStill({serveUrl, composition, inputProps, frame: 0, output: path.join(outDir, `${variant}.png`), imageFormat: 'png'});
  process.stdout.write(`${variant} `);
}
console.log(`\n${VARIANTS.length} imágenes en ${path.relative(root, outDir)}`);
