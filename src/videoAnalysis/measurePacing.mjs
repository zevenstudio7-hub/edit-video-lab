import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const order = JSON.parse(await fs.readFile(path.join(root, 'video-orders/VIDEO-001.json'), 'utf8'));
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const report = {method: 'FFmpeg loudnorm + silencedetect; conservative threshold, >=0.45s', files: []};
for (const file of [...new Set(order.scenes.map(s => s.sourceFile))]) {
  const input = path.join(root, 'public/video-001', file.replace(/\.MP4$/i, '.mp4'));
  const common = ['-hide_banner', '-nostdin', '-nostats', '-i', input];
  const loud = await run(ffmpeg, [...common, '-vn', '-af', 'loudnorm=print_format=json', '-f', 'null', '/dev/null']);
  const stats = JSON.parse(loud.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
  // Lower than the EBU gate so quiet consonants do not become edit decisions.
  const threshold = Math.min(-35, Number(stats.input_thresh) - 4);
  const silent = await run(ffmpeg, [...common, '-vn', '-af', `silencedetect=noise=${threshold}dB:d=0.45`, '-f', 'null', '/dev/null']);
  const silences = [...silent.stderr.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => ({startTime: +m[1], endTime: +m[2]}));
  const black = await run(ffmpeg, [...common, '-an', '-vf', 'scale=160:-2,blackdetect=d=0.05:pix_th=0.05:pic_th=0.98', '-f', 'null', '/dev/null']);
  const blackIntervals = [...black.stderr.matchAll(/black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)/g)].map(m => ({startTime:+m[1],endTime:+m[2]}));
  report.files.push({file, loudness: stats, thresholdDb:threshold, silences, blackIntervals});
  console.log(file, JSON.stringify({threshold, selectedSilences: silences.flatMap(s => order.scenes.filter(c => c.sourceFile===file && s.endTime>c.inTime && s.startTime<c.outTime).map(c=>({scene:c.scene,start:Math.max(s.startTime,c.inTime),end:Math.min(s.endTime,c.outTime)}))), blackIntervals}));
}
await fs.writeFile(path.join(root, 'analysis/video-001-pacing-measurements.json'), JSON.stringify(report,null,2)+'\n');
