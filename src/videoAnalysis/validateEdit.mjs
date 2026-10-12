import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const order=JSON.parse(await fs.readFile('video-orders/VIDEO-001.json','utf8'));
const sources=JSON.parse(await fs.readFile('analysis/video-001-source-map.json','utf8'));
const screen=JSON.parse(await fs.readFile('analysis/video-001-screen-map.json','utf8'));
const base=path.resolve('node_modules/.pnpm/@remotion+compositor-darwin-x64@4.0.438/node_modules/@remotion/compositor-darwin-x64');
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
assert(sources.takes.length===12||(process.argv.includes('--provisional')&&order.analysisComplete===false),'Need 12 real source analyses');
assert(screen.segments.length>1,'Screen needs multiple real segments');
assert(order.format.width===1080&&order.format.height===1920&&order.format.fps===30,'Incorrect format');
let total=0;
const checks=[];
for(const scene of order.scenes){
  assert(scene.startFrame===total,'Timeline has a gap or overlap at scene '+scene.scene);
  total+=scene.durationInFrames;
  assert(scene.durationInFrames>0,'Empty scene');
  assert(scene.captionCues.length>0,'Missing real subtitles');
  for(const cue of scene.captionCues)assert(cue.startTime>=0&&cue.endTime>cue.startTime&&cue.endTime<=scene.durationInFrames/30+0.001,'Subtitle outside scene');
  let captionEnd=0;
  for(const chunk of scene.captionChunks??[]){
    const count=chunk.text.trim().split(/\s+/).length;
    assert(count>=2&&count<=4,'Caption must contain 2–4 words');
    assert(Number.isInteger(chunk.startFrame)&&Number.isInteger(chunk.endFrame),'Caption frames must be integers');
    assert(chunk.startFrame>=captionEnd&&chunk.endFrame>chunk.startFrame&&chunk.endFrame<=scene.durationInFrames,'Invalid/overlapping caption chunk');
    captionEnd=chunk.endFrame;
  }
  if(order.libraryRevision)assert(scene.captionChunks?.length>0,'Missing library captions');
  const file=path.join('public',scene.previewSource);
  const p=JSON.parse(execFileSync(base+'/ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,codec_type,width,height','-of','json',file],{env:{...process.env,DYLD_LIBRARY_PATH:base},encoding:'utf8'}));
  assert(p.streams.some(s=>s.codec_type==='audio'),'Missing presenter audio');
  assert(p.streams.some(s=>s.codec_type==='video'&&s.codec_name==='h264'),'Missing browser-compatible video');
  assert(scene.outTime<=Number(p.format.duration)+0.05,'Edit exceeds proxy duration');
  let rangeFrames=0;
  for(const range of scene.sourceRanges??[{startFrame:0,durationInFrames:scene.durationInFrames,startTime:scene.inTime,endTime:scene.outTime}]) {
    assert(range.startFrame===rangeFrames,'Gap/overlap between source ranges in scene '+scene.scene);
    assert(range.durationInFrames===Math.round((range.endTime-range.startTime)*30),'Source range duration mismatch');
    assert(range.startTime>=0&&range.endTime<=Number(p.format.duration)+0.05,'Source range outside media');
    assert(range.durationInFrames>0,'Empty source range');
    if(range.poster) await fs.access(path.join('public',range.poster));
    rangeFrames+=range.durationInFrames;
  }
  assert(rangeFrames===scene.durationInFrames,'Scene source ranges do not cover the whole scene');
  if(scene.visualSupport.poster) await fs.access(path.join('public',scene.visualSupport.poster));
  checks.push({scene:scene.scene,file:scene.sourceFile,frames:scene.durationInFrames,ranges:scene.sourceRanges?.length??1,mediaOk:true,captionsOk:true,gapFree:true});
}
assert(total===order.durationInFrames,'Composition duration mismatch');
const report={checkedAt:new Date().toISOString(),analysisComplete:order.analysisComplete!==false,format:order.format,sourceAnalyses:sources.takes.length,screenSegments:screen.segments.length,scenes:checks,durationInFrames:total,durationSeconds:total/30,renderedFinal:false};
await fs.writeFile('analysis/video-001-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
