// Proxies de calidad para preview y render de VIDEO-001 (destino separado: public/video-001/hq/).
// Los originales HEVC 1080×1920 vienen girados: transpose=2 los deja en 1920×1080 horizontales.
// - Vídeo: H.264 CRF 18, keyframe cada 15 frames (búsquedas rápidas con muchos cortes), BT.709 rango limitado.
// - Audio: normalización EBU R128 en dos pasadas a −16 LUFS / −1,5 dBTP (ganancia lineal si es posible), AAC 192 kb/s.
// Los proxies 1280×720 anteriores (public/video-001/*.mp4) no se tocan.
//
// Uso: node src/videoAnalysis/prepareHqProxies.mjs [--take=X.MP4]
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const outDir = path.join(root, 'public/video-001/hq');
const DUPLICATES = new Set(['2eff061b16754ce896239dade75e3c9d.MP4']); // copia verificada de 1071…
const only = process.argv.find((a) => a.startsWith('--take='))?.slice(7);
const takes = (await fs.readdir(path.join(root, 'raw-material/video-001'))).filter((f) => /\.mp4$/i.test(f) && !DUPLICATES.has(f) && (!only || f === only)).sort();
await fs.mkdir(outDir, {recursive: true});
const report = [];
for (const take of takes) {
  const input = path.join(root, 'raw-material/video-001', take);
  const out = path.join(outDir, take.replace(/\.MP4$/i, '.mp4'));
  if (existsSync(out)) { console.log('Existe:', path.relative(root, out)); continue; }
  const probe = await run(ffmpeg, ['-hide_banner', '-nostdin', '-i', input, '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {maxBuffer: 1 << 24});
  const m = JSON.parse(probe.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
  const af = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
  const tmp = out + '.partial.mp4';
  const started = Date.now();
  await run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', input,
    '-vf', 'transpose=2,scale=in_range=full:out_range=tv,format=yuv420p',
    '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-g', '15', '-keyint_min', '15', '-sc_threshold', '0',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-af', af, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', tmp,
  ], {maxBuffer: 1 << 24});
  await fs.rename(tmp, out);
  report.push({take, measuredLufs: +m.input_i, measuredTruePeak: +m.input_tp, normalization: m.normalization_type, seconds: Math.round((Date.now() - started) / 1000)});
  console.log(take, `${m.input_i} LUFS → −16 (${m.normalization_type})`, Math.round((Date.now() - started) / 1000) + 's');
}
if (report.length) {
  const file = path.join(root, 'analysis/video-001-hq-proxies.json');
  const prev = existsSync(file) ? JSON.parse(await fs.readFile(file, 'utf8')).takes : [];
  await fs.writeFile(file, JSON.stringify({method: 'transpose=2 → 1920×1080, x264 CRF 18 GOP 15, BT.709 tv; loudnorm 2 pasadas −16 LUFS/−1,5 dBTP, AAC 192k 48 kHz', takes: [...prev.filter((p) => !report.some((r) => r.take === p.take)), ...report]}, null, 2) + '\n');
}
