import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const order=JSON.parse(await fs.readFile(path.join(root,'video-orders/VIDEO-001.json'),'utf8'));
const cases=order.scenes.flatMap(s=>s.captionChunks.map(c=>({frame:s.startFrame+c.startFrame,text:c.text,scene:s.scene})));
const expression=(batch,testPlayback)=>`(async()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const visible=el=>{for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}return true;};
  await document.fonts.ready;
  const captions=[];
  for(const test of ${JSON.stringify(batch)}){
    window.remotion_setFrame(test.frame,'Video001',0);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    // Studio can defer a seek while a premounted video buffers. Wait for
    // the requested caption before measuring it; never accept stale DOM.
    for(let retry=0;retry<20;retry++){
      const current=[...document.querySelectorAll('[data-caption-chunk]')].filter(visible);
      if(current.length===1&&current[0].dataset.captionChunk===test.text)break;
      window.remotion_setFrame(test.frame,'Video001',0);
      await wait(50);
    }
    const elements=[...document.querySelectorAll('[data-caption-chunk]')].filter(visible);
    const el=elements[0],css=el?getComputedStyle(el):null;
    const scene=el?.closest('[data-video001-scene]');
    const box=el?.getBoundingClientRect(),canvas=scene?.getBoundingClientRect();
    const scale=canvas?canvas.width/1080:1;
    captions.push({frame:test.frame,expected:test.text,text:el?.dataset.captionChunk,count:elements.length,opacity:css?.opacity,font:css?.fontFamily,fontSize:css?.fontSize,background:css?.backgroundColor,inSafeArea:!!box&&box.left>=canvas.left+63*scale&&box.right<=canvas.left+953*scale&&box.bottom<=canvas.top+1681*scale});
  }
  if(!${testPlayback})return JSON.stringify({captions});
  // Exercise a real play interval across the first scene boundary, not just seek.
  const samples=[];
  const sample=()=>{const ranges=[...document.querySelectorAll('[data-presenter-range]')].filter(visible);const v=ranges[0]?.querySelector('video');const button=[...document.querySelectorAll('button')].find(b=>/^\\d+$/.test(b.textContent.trim()));return {wallMs:performance.now(),frame:Number(button?.textContent),range:ranges[0]?.dataset.presenterRange,time:v?.currentTime,ready:v?.readyState,error:v?.error?.message??null};};
  samples.push(sample());
  for(let i=0;i<40;i++){await wait(150);samples.push(sample());}
  document.querySelector('button[aria-label="Pause"]')?.click();
  const readyRatio=samples.filter(s=>s.ready>=2).length/samples.length;
  let stallStart=null,maxBufferingMs=0;
  for(const s of samples){if(s.ready<2){stallStart??=s.wallMs;maxBufferingMs=Math.max(maxBufferingMs,s.wallMs-stallStart+150);}else stallStart=null;}
  const framesAdvanced=samples.at(-1).frame-samples[0].frame;
  const playbackPassed=samples.some(s=>s.range?.startsWith('2.'))&&framesAdvanced>=135&&readyRatio>=0.9&&maxBufferingMs<=600&&samples.every(s=>!s.error);
  const exportControl=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Render');
  window.remotion_setFrame(60,'Video001',0);
  return JSON.stringify({captions,playback:{passed:playbackPassed,framesAdvanced,readyRatio,maxBufferingMs,samples,criteria:'6s trusted playback; >=135 frames advanced; >=90% samples decoded; no buffering streak >600ms; no media errors'},exportAvailable:!!exportControl&&!exportControl.disabled,url:location.href});
})()`;
function run(batch,testPlayback=false){
  const output=execFileSync('pnpm',['dlx','agent-browser@0.38.1','--session','video001-oct','eval',expression(batch,testPlayback)],{encoding:'utf8',maxBuffer:2e6,timeout:45000,cwd:'/private/tmp'});
  const jsonLine=output.split('\n').find(l=>l.startsWith('"{'));
  if(!jsonLine)throw new Error('Unexpected browser response: '+output.slice(0,500));
  return JSON.parse(JSON.parse(jsonLine));
}
const captions=[];
for(let i=0;i<cases.length;i+=8){
  captions.push(...run(cases.slice(i,i+8)).captions);
  console.log(`Caption blocks checked: ${captions.length}/${cases.length}`);
}
// Playwright's trusted click is required for autoplay/audio activation.
// HTMLElement.click() inside eval does not model the user's Play action.
execFileSync('pnpm',['dlx','agent-browser@0.38.1','--session','video001-oct','eval',`(async()=>{window.remotion_setFrame(${order.scenes[1].startFrame-35},'Video001',0);await new Promise(r=>setTimeout(r,1200));return true;})()`],{encoding:'utf8',timeout:45000,cwd:'/private/tmp'});
execFileSync('pnpm',['dlx','agent-browser@0.38.1','--session','video001-oct','click','button[aria-label="Play"]'],{encoding:'utf8',timeout:45000,cwd:'/private/tmp'});
const result={...run([],true),captions};
const failures=result.captions.filter(c=>c.text!==c.expected||c.count!==1||c.opacity!=='1'||!c.font.includes('Georgia')||c.fontSize!=='68px'||c.background!=='rgba(0, 0, 0, 0)'||!c.inSafeArea);
const report={checkedAt:new Date().toISOString(),commit:order.libraryRevision.commit,composition:'Video001',durationInFrames:order.durationInFrames,captionBlocksChecked:cases.length,passed:failures.length===0&&result.playback.passed&&result.exportAvailable,failures,...result,renderedFinal:false,captionTiming:'Editorial subdivisions; not forced alignment. Visual verification only, not auditory approval.'};
await fs.writeFile(path.join(root,'analysis/video-001-library-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,captions:undefined,playback:{...report.playback,samples:undefined}},null,2));
if(!report.passed)process.exitCode=1;
