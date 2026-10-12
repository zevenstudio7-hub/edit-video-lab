import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const order=JSON.parse(await fs.readFile(path.join(root,'video-orders/VIDEO-001.json'),'utf8'));
const boundaries=order.scenes.flatMap(scene=>scene.sourceRanges.map(r=>scene.startFrame+r.startFrame));
const frames=[...new Set([0,order.durationInFrames-1,...boundaries.flatMap(f=>[f-1,f,f+1]).filter(f=>f>=0)])].sort((a,b)=>a-b);
const expression=batch=>`(async()=>{
 const frames=${JSON.stringify(batch)};
 const result=[];
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const visible=el=>{for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}return true;};
 for(const frame of frames){
   window.remotion_setFrame(frame,'Video001',0);
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   await wait(100);
   const scenes=[...document.querySelectorAll('[data-video001-scene]')].filter(visible);
   const ranges=[...document.querySelectorAll('[data-presenter-range]')].filter(visible);
   const video=ranges[0]?.querySelector('video');
   const poster=ranges[0]?.querySelector('img');
   for(let i=0;video&&(video.readyState<2||video.seeking)&&i<25;i++)await wait(80);
   const actual=video&&video.readyState>=2&&visible(video)?video:poster;
   let brightness=0;
   if(actual){const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const c=canvas.getContext('2d');c.drawImage(actual,0,0,32,32);const d=c.getImageData(0,0,32,32).data;for(let i=0;i<d.length;i+=4)brightness+=(d[i]+d[i+1]+d[i+2])/3;brightness/=1024;}
   const entry={frame,scene:scenes[0]?.dataset.video001Scene,range:ranges[0]?.dataset.presenterRange,visibleScenes:scenes.length,visibleRanges:ranges.length,videoReady:video?.readyState,videoTime:video?.currentTime,error:video?.error?.message??null,brightness,fallbackUsed:actual===poster};
   result.push(entry);
 }
 window.remotion_setFrame(30,'Video001',0);
 return JSON.stringify(result);
})()`;
const results=[];
for(let i=0;i<frames.length;i+=6){
  const output=execFileSync('pnpm',['dlx','agent-browser@0.38.1','--session','video001-oct','eval',expression(frames.slice(i,i+6))],{encoding:'utf8',maxBuffer:2e6,timeout:45000,cwd:'/private/tmp'});
  const jsonLine=output.split('\n').find(l=>l.startsWith('"['));
  if(!jsonLine)throw new Error('Unexpected browser response: '+output.slice(0,500));
  results.push(...JSON.parse(JSON.parse(jsonLine)));
  console.log(`Cut frames checked: ${results.length}/${frames.length}`);
}
const failures=results.filter(r=>r.visibleScenes!==1||r.visibleRanges!==1||r.error||r.brightness<8);
const report={checkedAt:new Date().toISOString(),composition:'Video001',durationInFrames:order.durationInFrames,checkedFrames:results.length,boundaries:boundaries.length,passed:failures.length===0,failures,results,scope:'DOM/media pixel checks before, at, after every scene/subclip cut; Studio preview only, no final render'};
await fs.writeFile(path.join(root,'analysis/video-001-cut-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,results:undefined},null,2));
if(failures.length)process.exitCode=1;
