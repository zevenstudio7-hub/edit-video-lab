import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base = path.resolve('node_modules/.pnpm/@remotion+compositor-darwin-x64@4.0.438/node_modules/@remotion/compositor-darwin-x64');
const sources = [];
for (const name of (await fs.readdir('raw-material/video-001')).filter(n=>/\.(mp4|mov)$/i.test(n)).sort()) {
  const probe = JSON.parse(execFileSync(path.join(base, 'ffprobe'), ['-v','error','-show_entries','format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,duration:stream_tags=rotate:stream_side_data=rotation','-of','json',path.join('raw-material/video-001',name)], {env:{...process.env,DYLD_LIBRARY_PATH:base},encoding:'utf8'}));
  sources.push({sourceFile:name,...probe});
  console.log(name, probe.format.duration, probe.streams.map(s=>s.codec_name).join('/'));
}
await fs.writeFile('analysis/video-001-media-metadata.json',JSON.stringify({sources},null,2)+'\n');
