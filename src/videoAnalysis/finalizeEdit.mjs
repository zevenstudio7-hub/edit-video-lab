import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const sourceMap=await read('analysis/video-001-source-map.json');
const screenMap=await read('analysis/video-001-screen-map.json');
const order=await read('video-orders/VIDEO-001.json');
if(order.pacingRevision) throw new Error('This order already has refined source ranges. Use validateEdit.mjs; do not overwrite pacing with the initial finalizer.');
const metadata=await read('analysis/video-001-media-metadata.json');
const duplicates=await read('analysis/video-001-duplicates.json');
const durations=new Map(metadata.sources.map(s=>[s.sourceFile,Number(s.format.duration)]));
const fps=30;
const provisional=process.argv.includes('--provisional');
const assert=(v,msg)=>{if(!v)throw new Error(msg);};
assert(sourceMap.takes.length===12||provisional,'Must analyze all 12 takes');
assert(new Set(sourceMap.takes.map(t=>t.sourceFile)).size===sourceMap.takes.length,'Duplicate source identity');
assert(screenMap.segments.length>1,'Screen recording needs multiple segments');
for(const take of sourceMap.takes){
  assert(take.provenance?.remoteFile&&take.transcript&&take.timestamps?.length,'Missing real analysis: '+take.sourceFile);
  take.measuredDurationSeconds=durations.get(take.sourceFile);
  for(const c of take.timestamps) assert(Number.isFinite(c.startTime)&&c.startTime>=0&&c.endTime>c.startTime&&c.endTime<=take.measuredDurationSeconds+0.15,'Invalid transcript timing: '+take.sourceFile);
}
for(const s of screenMap.segments)assert(s.startTime>=0&&s.endTime>s.startTime&&s.endTime<=durations.get('grabacion-pantalla.mov')+0.15,'Invalid screen range');
let cursor=0;
for(const scene of order.scenes){
  const duplicateGroup=duplicates.duplicateGroups.find(g=>g.sources.includes(scene.sourceFile));
  if(duplicateGroup&&scene.sourceFile!==duplicateGroup.canonicalSource){
    scene.originalPlanSource=scene.sourceFile;
    scene.sourceFile=duplicateGroup.canonicalSource;
    scene.sourceDecision='Copia audiovisual confirmada por audio PCM y fotogramas; unificada con la copia de referencia, no elegida por puntuación subjetiva.';
  }
  assert(durations.has(scene.sourceFile),'Unknown selected source');
  scene.inTime=Math.round(scene.inTime*fps)/fps;
  scene.outTime=Math.round(scene.outTime*fps)/fps;
  assert(scene.inTime>=0&&scene.outTime>scene.inTime&&scene.outTime<=durations.get(scene.sourceFile)+1/fps,'Invalid edit range: '+scene.scene);
  scene.startTime=scene.inTime;
  scene.endTime=scene.outTime;
  scene.startFrame=cursor;
  scene.durationInFrames=Math.round((scene.outTime-scene.inTime)*fps);
  scene.timelineStartTime=cursor/fps;
  cursor+=scene.durationInFrames;
  const take=sourceMap.takes.find(t=>t.sourceFile===scene.sourceFile);
  scene.captionCues=take.timestamps.filter(t=>t.endTime>scene.inTime&&t.startTime<scene.outTime).map(t=>({startTime:Math.max(0,t.startTime-scene.inTime),endTime:Math.min(scene.durationInFrames/fps,t.endTime-scene.inTime),text:t.text}));
  assert(scene.captionCues.length,'No captions for scene '+scene.scene);
  scene.subtitleTiming='Frases temporizadas por Gemini contra el audio original; sin interpolación de tiempos por palabra.';
  scene.motion='Presentador: SoftZoom 1.000 → 1.025. Apoyo: entrada suave BigStatement/MediaFrame.';
  scene.transition='Corte directo en límite de escena; audio original sin superposición.';
  scene.previewSource='video-001/'+scene.sourceFile.replace(/\.mp4$/i,'.mp4');
  scene.orientationCorrection='90 grados antihorario en el proxy; originales preservados';
  const visual=scene.visualSupport;
  if(visual.type==='screen-recording'){
    assert(screenMap.segments.some(s=>visual.startTime>=s.startTime-0.15&&visual.endTime<=s.endTime+0.15),'Visual not grounded in screen map, scene '+scene.scene);
    assert(visual.endTime>visual.startTime,'Empty support range');
    visual.source='grabacion-pantalla.mov';
    const reviewed=screenMap.segments.find(s=>visual.startTime>=s.startTime-0.15&&visual.endTime<=s.endTime+0.15);
    visual.label=reviewed.label;
    visual.playback='Audio silenciado; repetir el rango si la escena es más larga.';
  }
}
order.EDIT_TYPE='#edit-2-pantalla-dividida';
order.durationInFrames=cursor;
order.durationSeconds=cursor/fps;
order.composition='Video001';
order.status=provisional?'provisional-incomplete-analysis':'preview-pending-verification';
order.assetsGenerated={aiImages:[],aiVideo:[],previewProxies:'public/video-001/*.mp4'};
const used=new Set(order.scenes.map(s=>s.sourceFile));
order.discardedTakes=sourceMap.takes.filter(t=>!used.has(t.sourceFile)).map(t=>{
  const clone=duplicates.duplicateGroups.find(g=>g.sources.includes(t.sourceFile)&&g.canonicalSource!==t.sourceFile);
  return {sourceFile:t.sourceFile,reason:clone?`Copia audiovisual verificada de ${clone.canonicalSource}; no aporta otra interpretación ni otra ejecución.`:(order.discardedTakes.find(d=>d.sourceFile===t.sourceFile)?.reason??`No seleccionada en la comparación editorial. ${t.overallRecommendation}`)};
});
sourceMap.selectedRanges=order.scenes.map(s=>({scene:s.scene,guionBlock:s.guionBlock,sourceFile:s.sourceFile,startTime:s.inTime,endTime:s.outTime}));
sourceMap.discardedTakes=order.discardedTakes;
sourceMap.equivalentTakes=order.comparisons;
sourceMap.verifiedDuplicates=duplicates;
sourceMap.scoreMeaning='Puntuaciones cualitativas de Gemini (0-10), no mediciones instrumentales. Conservar las respuestas originales aunque diverjan; para copias audiovisuales usar una sola referencia de transcripción.';
sourceMap.editorialCorrections=[
  'La orientación se comprobó visualmente: la corrección aplicada a las tomas es 90 grados antihorario (transpose=2). La sugerencia horaria de algunas respuestas Gemini no se aplicó.',
  'La rotación es corregible y común al material: no constituye por sí sola un motivo para descartar una toma frente a otra.',
  'La duración medida por ffprobe es la autoridad para los límites de edición; durationSeconds dentro de cada respuesta Gemini es una estimación del modelo.'
];
sourceMap.timingCaveat='Tiempos interpretados por Gemini, cuantizados a 30 FPS para edición y validados contra duración del contenedor. Revisión audiovisual en Studio requerida.';
await write('analysis/video-001-source-map.json',sourceMap);
await write('video-orders/VIDEO-001.json',order);
const lines=['# VIDEO-001 — análisis y montaje para revisión','',provisional?'ESTADO: PROVISIONAL, INCOMPLETO POR CUOTA DIARIA DE GEMINI.':'ESTADO: para revisión.',`Modelo fijado: ${sourceMap.model}. Analizadas: ${sourceMap.takes.length}/12 tomas + grabación de pantalla. Duración de este montaje: ${order.durationSeconds.toFixed(2)} s (${cursor} fotogramas a 30 FPS).`,'','## Comparación editorial','',order.summary,'','## Rangos seleccionados','','| Escena | Fuente | Entrada | Salida | Bloque |','|---|---|---:|---:|---|',...order.scenes.map(s=>`| ${s.scene} | ${s.sourceFile} | ${s.inTime.toFixed(3)} | ${s.outTime.toFixed(3)} | ${s.guionBlock.replaceAll('|','/')} |`),'','## Tomas descartadas','',...order.discardedTakes.map(t=>`- ${t.sourceFile}: ${t.reason}`),'','## Pendientes de análisis','',...(sourceMap.missingSources??[]).map(f=>`- ${f}`),'','## Apoyos visuales','',...order.scenes.map(s=>`- Escena ${s.scene}: ${s.visualSupport.type}; ${s.visualSupport.description}`),'','## Trazabilidad y revisión','',sourceMap.timingCaveat,'','Los originales no se modifican. Los proxies H.264 corrigen orientación para Studio. No se ha hecho render final. La presencia de una afirmación en el guion o una imagen en la captura no constituye verificación externa de esa afirmación.'];
await fs.writeFile('analysis/video-001-summary.md',lines.join('\n')+'\n');
console.log(JSON.stringify({scenes:order.scenes.length,frames:cursor,durationSeconds:order.durationSeconds}));
