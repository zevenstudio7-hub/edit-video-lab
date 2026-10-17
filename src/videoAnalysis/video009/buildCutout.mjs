// VIDEO-009: recorte con alfa de persona + escritorio + computador (VP9 yuva420p, 1080×1920).
// Alfa = máximo( matte de Vision de la persona, con contraste y suavizado de 0,8 px ; polígonos estáticos del escritorio y el computador ).
// Entrada: carpeta de PNG en gris (blanco = persona) a 720×1280, un fotograma por frame del proxy (24 fps).
// Uso: node src/videoAnalysis/video009/buildCutout.mjs <carpeta-mattes> [work-dir]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const dir = process.argv[2];
const work = process.argv[3] ?? path.dirname(dir);
const desk = path.join(work, 'desk.png');
execFileSync('node', [path.join(import.meta.dirname, 'deskMask.mjs'), path.join(work, 'desk.pgm'), '1080', '1920']);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(work, 'desk.pgm'), '-vf', 'gblur=sigma=1.6', desk]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
  '-i', path.join(root, 'public/video-009/proxy.mp4'), '-framerate', '24', '-i', path.join(dir, 'f%05d.png'), '-loop', '1', '-framerate', '24', '-i', desk,
  '-filter_complex',
  "[0:v]scale=1080:1920:flags=lanczos,format=rgb24[c];" +
  "[1:v]scale=1080:1920:flags=bicubic,format=gray,lut=y='clip((val-70)*255/115,0,255)',gblur=sigma=0.8[p];" +
  '[p][2:v]blend=all_mode=lighten:shortest=1[a];[c][a]alphamerge,format=yuva420p[v]',
  '-map', '[v]', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '26', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-row-mt', '1', '-an',
  path.join(root, 'public/video-009/cutout.webm')], {stdio: 'inherit'});
console.log('cutout.webm listo');
