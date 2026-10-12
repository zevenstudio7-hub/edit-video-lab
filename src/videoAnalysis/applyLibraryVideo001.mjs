import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'../..');
const orderPath=path.join(root,'video-orders/VIDEO-001.json');
const original=await fs.readFile(orderPath,'utf8');
const order=JSON.parse(original);
if(order.libraryRevision)throw new Error('Library revision already applied; do not trim twice.');
if(order.pacingRevision?.version!==1)throw new Error('Expected existing pacing revision 1.');
const fps=order.format.fps;
const removed=[];
let timeline=0;
const normalize=w=>w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]/gu,'');
const keywords=new Set(['apple','samsung','valor','confianza','solucion','experiencia','primeros','ecosistema']);
const weakEnd=new Set(['de','del','a','al','el','la','los','las','un','una','que','por','para','y','o','ni','en','con','su','sus']);

// Editorial grouping only. Gemini phrase boundaries remain the timing evidence;
// these subdivisions are NOT ASR/forced-alignment word timestamps.
function groupWords(text){
  const words=text.trim().split(/\s+/);
  const memo=new Map();
  function solve(i){
    if(i===words.length)return {cost:0,groups:[]};
    if(memo.has(i))return memo.get(i);
    let best=null;
    for(let n=2;n<=4&&i+n<=words.length;n++){
      const rest=solve(i+n);
      if(!rest)continue;
      const group=words.slice(i,i+n);
      const cost=rest.cost+Math.abs(3-n)*0.25+(weakEnd.has(normalize(group.at(-1)))?2:0)-( /[,.;?!…]$/.test(group.at(-1))?0.4:0);
      if(!best||cost<best.cost)best={cost,groups:[group,...rest.groups]};
    }
    memo.set(i,best);
    return best;
  }
  const result=solve(0);
  if(!result)throw new Error('Cannot group caption: '+text);
  return result.groups;
}

for(const scene of order.scenes){
  const pauses=order.pacingRevision.analysis.find(x=>x.sourceFile===scene.sourceFile).pauses;
  const ranges=[];
  let local=0;
  for(const range of scene.sourceRanges){
    const first=Math.round(range.startTime*fps),last=Math.round(range.endTime*fps);
    const cuts=[];
    for(const pause of pauses){
      // Keep 100ms before/after measured voice. At edit edges remove only
      // the measured low-energy part; never trim a spoken caption by text.
      let start=Math.max(first,Math.ceil(pause.startTime*fps)+3);
      let end=Math.min(last,Math.floor(pause.endTime*fps)-3);
      if(pause.startTime*fps<=first+1)start=first;
      if(pause.endTime*fps>=last)end=last;
      if(end-start<2)continue;
      const previous=cuts.at(-1)?.end??first;
      if(start>previous&&start-previous<4)continue;
      if(end<last&&last-end<4)continue;
      cuts.push({start,end});
      removed.push({scene:scene.scene,sourceFile:scene.sourceFile,startTime:start/fps,endTime:end/fps,durationSeconds:(end-start)/fps,detectedPause:pause});
    }
    let cursor=first;
    for(const cut of [...cuts,{start:last,end:last}]){
      if(cut.start>cursor){
        const durationInFrames=cut.start-cursor;
        ranges.push({startTime:cursor/fps,endTime:cut.start/fps,startFrame:local,durationInFrames,poster:`video-001/posters/library-v2-scene-${scene.scene}-${ranges.length}.jpg`});
        local+=durationInFrames;
      }
      cursor=cut.end;
    }
  }
  if(!ranges.length)throw new Error('Would remove scene '+scene.scene);
  const cues=[];
  const sourceCues=scene.originalTiming.captionCues;
  for(const range of ranges){
    for(const cue of sourceCues){
      const start=Math.max(scene.originalTiming.inTime+cue.startTime,range.startTime);
      const end=Math.min(scene.originalTiming.inTime+cue.endTime,range.endTime);
      if(end<=start)continue;
      const mapped={startTime:range.startFrame/fps+start-range.startTime,endTime:range.startFrame/fps+end-range.startTime,text:cue.text};
      const previous=cues.at(-1);
      if(previous?.text===mapped.text&&Math.abs(previous.endTime-mapped.startTime)<0.001)previous.endTime=mapped.endTime;
      else cues.push(mapped);
    }
  }
  scene.sourceRanges=ranges;
  scene.captionCues=cues;
  scene.captionChunks=cues.flatMap(cue=>{
    const groups=groupWords(cue.text);
    const weights=groups.map(g=>g.reduce((sum,w)=>sum+(w==='2014'?12:Math.max(2,normalize(w).length)),0));
    const weight=weights.reduce((a,b)=>a+b,0);
    const first=Math.round(cue.startTime*fps),last=Math.round(cue.endTime*fps);
    let consumed=0;
    return groups.map((words,i)=>{
      const startFrame=first+Math.round((last-first)*consumed/weight);
      consumed+=weights[i];
      const endFrame=i===groups.length-1?last:first+Math.round((last-first)*consumed/weight);
      if(endFrame<=startFrame)throw new Error('Caption too short');
      return {text:words.join(' '),startFrame,endFrame,emphasis:words.filter(w=>keywords.has(normalize(w))).slice(0,1)};
    });
  });
  scene.captions=scene.captionChunks.map(c=>({text:c.text,startMs:Math.round(c.startFrame/fps*1000),endMs:Math.round(c.endFrame/fps*1000),timestampMs:null,confidence:null}));
  scene.subtitleTiming='Límites de frase de Gemini retimados con los cortes; subdivisiones editoriales proporcionales por longitud de palabra. NO son alineación fonética ni tiempos ASR por palabra; pendientes de revisión auditiva fina.';
  scene.subtitleStyle={recipe:'chunk-captions',wordsPerBlock:'2–4',serif:true,box:false,centerY:1570,fontSize:68,emphasis:'italic',hardChange:true};
  scene.inTime=scene.startTime=ranges[0].startTime;
  scene.outTime=scene.endTime=ranges.at(-1).endTime;
  scene.durationInFrames=local;
  scene.startFrame=timeline;
  scene.timelineStartTime=timeline/fps;
  delete scene.timelineStart;
  scene.transition={type:'cut',recipe:'cut-sequence',premountFor:45,description:'Corte directo; poster real bajo cada video; sin apagado, fundidos ni solapamiento de voz.'};
  timeline+=local;
}
order.libraryRevision={version:1,commit:'486cb14f2d95854c1fe8f5b70a17644378db6a2f',recipes:['chunk-captions','cut-sequence'],captionTiming:'Editorial subdivisions of existing Gemini phrase timestamps; not forced alignment.',previousDurationInFrames:order.durationInFrames,removedFrames:order.durationInFrames-timeline,removed,method:'Reuse measured RMS pauses; 100ms protection; refine remaining pause cores and leading/trailing edit edges.'};
order.durationInFrames=timeline;
order.durationSeconds=timeline/fps;
order.assetsGenerated.framePosters=order.scenes.reduce((n,s)=>n+s.sourceRanges.length+(s.visualSupport.poster?1:0),0);
await fs.writeFile(path.join(root,'analysis/video-001-order-before-library.json'),original,{flag:'wx'});
for(const scene of order.scenes){
  for(const range of scene.sourceRanges){
    execFileSync('/usr/local/bin/ffmpeg',['-v','error','-n','-ss',String(range.startTime),'-i',path.join(root,'public/video-001',scene.sourceFile.replace(/\.mp4$/i,'.mp4')),'-frames:v','1','-q:v','2',path.join(root,'public',range.poster)]);
  }
}
await fs.writeFile(orderPath,JSON.stringify(order,null,2)+'\n');
await fs.writeFile(path.join(root,'analysis/video-001-library-refinement.json'),JSON.stringify(order.libraryRevision,null,2)+'\n');
console.log(JSON.stringify({durationSeconds:order.durationSeconds,removedSeconds:order.libraryRevision.removedFrames/fps,ranges:order.scenes.reduce((n,s)=>n+s.sourceRanges.length,0),captionChunks:order.scenes.reduce((n,s)=>n+s.captionChunks.length,0),removed},null,2));
