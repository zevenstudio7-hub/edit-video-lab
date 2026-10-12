import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const base=path.resolve('node_modules/.pnpm/@remotion+compositor-darwin-x64@4.0.438/node_modules/@remotion/compositor-darwin-x64');
const metadata=JSON.parse(await fs.readFile('analysis/video-001-media-metadata.json','utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const results=[];
for(const source of metadata.sources.filter(s=>/\.mp4$/i.test(s.sourceFile))){
  const file=path.join('raw-material/video-001',source.sourceFile);
  const duration=Number(source.format.duration);
  const times=[0.15,0.3,0.5,0.7,0.85].map(r=>Number((duration*r).toFixed(3)));
  const frames=times.map(time=>({time,sha256:digest(execFileSync(base+'/ffmpeg',['-hide_banner','-loglevel','error','-ss',String(time),'-i',file,'-frames:v','1','-vf','scale=160:-1','-f','image2pipe','-c:v','mjpeg','pipe:1'],{env:{...process.env,DYLD_LIBRARY_PATH:base},maxBuffer:2e6}))}));
  const audio=execFileSync(base+'/ffmpeg',['-hide_banner','-loglevel','error','-i',file,'-vn','-c:a','pcm_s16le','-f','wav','pipe:1'],{env:{...process.env,DYLD_LIBRARY_PATH:base},maxBuffer:30e6});
  const audioSha256=digest(audio);
  results.push({sourceFile:source.sourceFile,duration,frames,audioSha256});
  console.log(source.sourceFile,audioSha256);
}
const groups=[];
for(const r of results){let group=groups.find(g=>g.audioSha256===r.audioSha256&&g.frameHashes===r.frames.map(f=>f.sha256).join('|'));if(!group){group={audioSha256:r.audioSha256,frameHashes:r.frames.map(f=>f.sha256).join('|'),sources:[]};groups.push(group);}group.sources.push(r.sourceFile);}
const report={method:'SHA-256 de audio PCM completo decodificado y cinco fotogramas JPEG decodificados en iguales posiciones relativas. Coincidencia indica duplicación audiovisual con alta confianza, no igualdad binaria del contenedor.',sources:results,duplicateGroups:groups.filter(g=>g.sources.length>1).map(({sources})=>({sources,canonicalSource:sources[0]}))};
await fs.writeFile('analysis/video-001-duplicates.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.duplicateGroups));
