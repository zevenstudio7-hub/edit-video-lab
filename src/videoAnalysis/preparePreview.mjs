import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const base = path.resolve('node_modules/.pnpm/@remotion+compositor-darwin-x64@4.0.438/node_modules/@remotion/compositor-darwin-x64');
await fs.mkdir('public/video-001', {recursive:true});
let names;
if(process.argv.includes('--all')) {
  names=(await fs.readdir('raw-material/video-001')).filter(n=>/\.(mp4|mov)$/i.test(n)).sort();
} else {
  const plan = JSON.parse(await fs.readFile('video-orders/VIDEO-001.json','utf8'));
  names = [...new Set(plan.scenes.map(s=>s.sourceFile))];
  if(plan.scenes.some(s=>s.visualSupport.type==='screen-recording')) names.push('grabacion-pantalla.mov');
}
for(const name of names){
  const out=path.join('public/video-001',name.replace(/\.(mp4|mov)$/i,'.mp4'));
  try{await fs.access(out);console.log('Using existing preview:',out);continue;}catch{}
  const screen=name.endsWith('.mov');
  const temporary=out+'.partial.mp4';
  const args=['-hide_banner','-loglevel','error','-nostdin','-n','-i',path.join('raw-material/video-001',name),'-vf',screen?'scale=1280:-2':'transpose=2,scale=1280:-2','-r','30','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',temporary];
  console.log('Preparing preview:',name);
  await new Promise((resolve,reject)=>{const p=spawn(path.join(base,'ffmpeg'),args,{env:{...process.env,DYLD_LIBRARY_PATH:base},stdio:'inherit'});p.on('error',reject);p.on('exit',c=>c===0?resolve():reject(new Error('FFmpeg failed: '+name)));});
  await fs.rename(temporary,out);
}
