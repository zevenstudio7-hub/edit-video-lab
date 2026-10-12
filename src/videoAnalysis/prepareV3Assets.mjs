// Recursos generados para la candidata V3 de VIDEO-001 (public/video-001/v3/, ignorado por git):
//  - texturas de relleno para los subtítulos de énfasis (rosa y roja), procedimentales con FFmpeg `geq`:
//    vetas suaves tipo mármol + grano fino. Sin imágenes de terceros.
// Uso: node src/videoAnalysis/prepareV3Assets.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'public/video-001/v3');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
await fs.mkdir(out, {recursive: true});

const vein = '(sin((X*0.011+3.2*sin(Y*0.0065)+1.6*sin((X+Y)*0.0042))*3.1)+0.45*sin((Y*0.023+2.1*sin(X*0.009))*2.2))';
const textures = {
  'texture-pink.jpg': {r: [243, 16], g: [190, 15], b: [201, 13]},
  'texture-red.jpg': {r: [232, 22], g: [52, 16], b: [52, 14]},
};
for (const [file, c] of Object.entries(textures)) {
  const ch = (k) => `clip(${c[k][0]}+${c[k][1]}*${vein},0,255)`;
  await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:s=1024x1024',
    '-vf', `format=rgb24,geq=r='${ch('r')}':g='${ch('g')}':b='${ch('b')}',gblur=sigma=1.4,noise=alls=7:allf=t,format=yuvj444p`,
    '-frames:v', '1', '-q:v', '3', path.join(out, file)]);
  console.log('textura', file);
}
