import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const orderPath = path.join(root, 'video-orders/VIDEO-001.json');
const original = await fs.readFile(orderPath, 'utf8');
const order = JSON.parse(original);
if (order.pacingRevision) throw new Error('Pacing revision already applied; do not trim twice.');
const measured = JSON.parse(await fs.readFile(path.join(root, 'analysis/video-001-pacing-measurements.json'), 'utf8'));
const fps = order.format.fps;
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const envelopes = new Map();
const analysis = [];
for (const item of measured.files) {
  const file = path.join(root, 'public/video-001', item.file.replace(/\.mp4$/i, '.mp4'));
  const pcm = execFileSync(ffmpeg, ['-v','error','-i',file,'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1'], {maxBuffer:32e6});
  const thresholdDb = Math.min(-35, Number(item.loudness.input_thresh) + 2);
  const windows = [];
  for (let offset=0; offset+1280<=pcm.length; offset+=1280) {
    let energy=0;
    for (let j=0;j<320;j++) energy+=pcm.readFloatLE(offset+j*4)**2;
    windows.push(10*Math.log10(energy/320+1e-15));
  }
  const pauses=[];
  let first=null;
  for(let i=0;i<=windows.length;i++) {
    if(windows[i]<thresholdDb) first??=i;
    else if(first!==null) {
      if(i-first>=20) pauses.push({startTime:first*0.02,endTime:i*0.02});
      first=null;
    }
  }
  envelopes.set(item.file, pauses);
  analysis.push({sourceFile:item.file,thresholdDb,windowMs:20,minimumPauseMs:400,pauses});
}

const removed=[];
let timeline=0;
for(const scene of order.scenes) {
  const first=Math.round(scene.inTime*fps);
  const last=Math.round(scene.outTime*fps);
  const cuts=[];
  for(const pause of envelopes.get(scene.sourceFile)) {
    // Retain four frames (133ms) on either side of every measured pause.
    const start=Math.max(first,Math.ceil(pause.startTime*fps)+4);
    const end=Math.min(last,Math.floor(pause.endTime*fps)-4);
    if(end-start<4) continue;
    // Do not isolate a tiny fragment of speech at an edit edge.
    const previous=cuts.at(-1)?.end??first;
    if(start>previous&&start-previous<6) continue;
    if(end<last&&last-end<6) continue;
    cuts.push({start,end});
    removed.push({scene:scene.scene,sourceFile:scene.sourceFile,startTime:start/fps,endTime:end/fps,durationSeconds:(end-start)/fps,detectedPause:pause});
  }
  let cursor=first, local=0;
  const ranges=[];
  for(const cut of [...cuts,{start:last,end:last}]) {
    if(cut.start>cursor) {
      const durationInFrames=cut.start-cursor;
      ranges.push({startTime:cursor/fps,endTime:cut.start/fps,startFrame:local,durationInFrames,poster:`video-001/posters/scene-${scene.scene}-${ranges.length}.jpg`});
      local+=durationInFrames;
    }
    cursor=cut.end;
  }
  if(!ranges.length) throw new Error('Empty scene '+scene.scene);
  scene.originalTiming={inTime:scene.inTime,outTime:scene.outTime,durationInFrames:scene.durationInFrames,captionCues:scene.captionCues};
  const captions=[];
  for(const range of ranges) {
    for(const cue of scene.captionCues) {
      const start=Math.max(scene.inTime+cue.startTime,range.startTime);
      const end=Math.min(scene.inTime+cue.endTime,range.endTime);
      if(end<=start) continue;
      const mapped={startTime:range.startFrame/fps+start-range.startTime,endTime:range.startFrame/fps+end-range.startTime,text:cue.text};
      const previous=captions.at(-1);
      if(previous?.text===mapped.text&&Math.abs(previous.endTime-mapped.startTime)<0.001) previous.endTime=mapped.endTime;
      else captions.push(mapped);
    }
  }
  scene.sourceRanges=ranges;
  scene.captionCues=captions;
  // Also expose the official Caption JSON shape, without inventing word timings.
  scene.captions=captions.map(c=>({text:c.text,startMs:Math.round(c.startTime*1000),endMs:Math.round(c.endTime*1000),timestampMs:null,confidence:null}));
  scene.inTime=scene.startTime=ranges[0].startTime;
  scene.outTime=scene.endTime=ranges.at(-1).endTime;
  scene.durationInFrames=local;
  scene.startFrame=timeline;
  scene.timelineStartTime=timeline/fps;
  scene.motion={type:'spring-editorial',durationInFrames:18,description:'Títulos siempre visibles; palabras escalonadas, subrayado y progreso por escena; sin fade a negro.'};
  scene.transition={type:'cut',description:'Corte directo con premontaje de 45 frames; sin solapar voces ni insertar tiempo negro.'};
  if(scene.visualSupport.type==='screen-recording') scene.visualSupport.poster=`video-001/posters/screen-${scene.scene}.jpg`;
  timeline+=local;
}
order.pacingRevision={version:1,method:'20ms RMS envelope, EBU gate +2dB capped at -35dBFS; pauses >=400ms; 133ms protected at each side',previousDurationInFrames:order.durationInFrames,removedFrames:order.durationInFrames-timeline,removed,analysis};
order.durationInFrames=timeline;
order.durationSeconds=timeline/fps;

// Prepare actual first frames as visual fallback while media buffers/seeks.
const posterDir=path.join(root,'public/video-001/posters');
await fs.mkdir(posterDir,{recursive:true});
for(const scene of order.scenes) {
  const source=path.join(root,'public/video-001',scene.sourceFile.replace(/\.mp4$/i,'.mp4'));
  for(const range of scene.sourceRanges) {
    execFileSync(ffmpeg,['-v','error','-n','-ss',String(range.startTime),'-i',source,'-frames:v','1','-q:v','2',path.join(root,'public',range.poster)]);
  }
  if(scene.visualSupport.poster) {
    execFileSync(ffmpeg,['-v','error','-n','-ss',String(scene.visualSupport.startTime),'-i',path.join(root,'public/video-001/grabacion-pantalla.mp4'),'-frames:v','1','-q:v','2',path.join(root,'public',scene.visualSupport.poster)]);
  }
}
await fs.writeFile(path.join(root,'analysis/video-001-order-before-pacing.json'),original,{flag:'wx'});
await fs.writeFile(orderPath,JSON.stringify(order,null,2)+'\n');
await fs.writeFile(path.join(root,'analysis/video-001-pacing-report.json'),JSON.stringify(order.pacingRevision,null,2)+'\n');
console.log(JSON.stringify({before:order.pacingRevision.previousDurationInFrames/fps,after:timeline/fps,removedSeconds:order.pacingRevision.removedFrames/fps,pausesShortened:removed.length,scenes:order.scenes.length,ranges:order.scenes.reduce((n,s)=>n+s.sourceRanges.length,0),removed},null,2));
