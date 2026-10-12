import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const write=(p,v)=>fs.writeFile(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const order=await read('video-orders/VIDEO-001.json');
if(!order.pacingRevision)throw new Error('No pacing revision');
for(const scene of order.scenes){
  scene.timelineStartTime=scene.startFrame/order.format.fps;
  delete scene.timelineStart;
  scene.subtitleTiming??='Frases de Gemini retimadas mediante sourceRanges después de los recortes de pausas; no se inventan tiempos por palabra.';
  if(scene.subtitleStyle)scene.subtitleStyle.centerY=1570;
  scene.motion.description='Títulos siempre visibles; énfasis escalonado, subrayado, spring y progreso por escena; sin fade a negro.';
}
order.assetsGenerated.framePosters=order.scenes.reduce((n,s)=>n+s.sourceRanges.length+(s.visualSupport.poster?1:0),0);
await write('video-orders/VIDEO-001.json',order);
const sources=await read('analysis/video-001-source-map.json');
sources.selectedRangesBeforePacing??=sources.selectedRanges;
sources.selectedRanges=order.scenes.flatMap(s=>s.sourceRanges.map((r,i)=>({scene:s.scene,subclip:i+1,guionBlock:s.guionBlock,sourceFile:s.sourceFile,startTime:r.startTime,endTime:r.endTime,timelineStartTime:(s.startFrame+r.startFrame)/30})));
sources.pacingRevision={report:'analysis/video-001-pacing-report.json',durationInFrames:order.durationInFrames,durationSeconds:order.durationSeconds,originalAnalysisPreserved:true};
if(order.libraryRevision)sources.libraryRevision={report:'analysis/video-001-library-refinement.json',commit:order.libraryRevision.commit,originalAnalysisPreserved:true};
await write('analysis/video-001-source-map.json',sources);
const summaryPath=path.join(root,'analysis/video-001-summary.md');
let summary=await fs.readFile(summaryPath,'utf8');
summary=summary.replace('centro vertical 1610 px','centro vertical 1570 px');
summary=summary.replace(/Duración de este montaje: .*?\n/,`Duración de este montaje: ${order.durationSeconds.toFixed(2)} s (${order.durationInFrames} fotogramas a 30 FPS).\n`);
const table=['## Rangos seleccionados','','| Escena / corte | Fuente | Entrada | Salida | Bloque |','|---|---|---:|---:|---|',...sources.selectedRanges.map(s=>`| ${s.scene}.${s.subclip} | ${s.sourceFile} | ${s.startTime.toFixed(3)} | ${s.endTime.toFixed(3)} | ${s.guionBlock} |`),'',''].join('\n');
summary=summary.replace(/## Rangos seleccionados[\s\S]*?(?=## Tomas descartadas)/,table);
const heading='## Ajuste de ritmo y motion — 2026-10-01';
// This historical section describes revision 1, not any later library refinement.
const revision1Duration=(order.pacingRevision.previousDurationInFrames-order.pacingRevision.removedFrames)/30;
if(!summary.includes(heading))summary+=`\n${heading}\n\n- Duración anterior: 128,90 s. Duración tras revisión 1: ${revision1Duration.toFixed(2)} s. Reducción: ${(order.pacingRevision.removedFrames/30).toFixed(2)} s en ${order.pacingRevision.removed.length} pausas medidas.\n- Se mantienen 14 escenas editoriales, con 23 rangos de presentador en esta revisión. Los subtítulos se retiman con la misma transformación.\n- Detector RMS en ventanas de 20 ms: el ruido de fondo impedía usar silencedetect por picos como único criterio. Se protegen al menos 133 ms a cada lado del tramo retirado. Los resultados son candidatos acústicos revisables, no alineación fonética certificada.\n- Los siete proxies de presentador no contienen intervalos negros según blackdetect al 98% de píxeles y 0,05 s mínimos.\n- Premontaje de 45 frames (1,5 s) y 26 fotogramas reales de respaldo cubren la carga inicial/seek. Títulos visibles desde el primer frame; spring, marcadores y progreso, sin fundidos a negro ni superposición de voces.\n- Primitivas oficiales: https://www.remotion.dev/docs/spring y https://www.remotion.dev/docs/sequence#premountfor; código base: https://github.com/remotion-dev/remotion. Se conserva Remotion 4.0.438; no se migra de versión.\n- Plan anterior conservado en video-001-order-before-pacing.json. No se han tocado originales, credenciales ni los ocho análisis de Gemini. No hay render final.\n`;
const libraryHeading='## Correcciones de biblioteca — 2026-10-02';
if(order.libraryRevision&&!summary.includes(libraryHeading))summary+=`\n${libraryHeading}\n\n- Referencia inspeccionada: feat/library, commit ${order.libraryRevision.commit}. No se fusiona la rama ni se reemplaza la RAÍZ.\n- Duración actual: ${order.durationSeconds.toFixed(2)} s / ${order.durationInFrames} frames. ${order.libraryRevision.removed.length} ajustes adicionales de pausa reducen ${(order.libraryRevision.removedFrames/30).toFixed(2)} s; total retirado desde el primer plan: ${((3867-order.durationInFrames)/30).toFixed(2)} s. Se reutilizan las mediciones existentes, protegiendo 100 ms junto a la voz.\n- 14 escenas, ${sources.selectedRanges.length} rangos reales. CutSequence solo organiza la zona del presentador con corte duro y premountFor=45. Se mantienen los apoyos superiores sin fade de la composición.\n- ${order.scenes.reduce((n,s)=>n+s.captionChunks.length,0)} bloques de 2–4 palabras con ChunkCaptions: Georgia/serif, 68 px, centro vertical 1610 px, sin caja, énfasis en cursiva y opacidad 1 desde el primer frame. No se atribuye el acento existente a una marca ZevenPRO aprobada.\n- El texto procede de las transcripciones de Gemini existentes. El reparto temporal dentro de cada frase es proporcional/editorial, no ASR ni alineación fonética. Necesita revisión auditiva fina. No se reescriben los ocho análisis originales.\n- Evidencia técnica de cortes: video-001-cut-verification.json. Evidencia de estilo/reproducción: video-001-library-verification.json. Los resultados técnicos no equivalen a aprobación audiovisual humana.\n- Respaldo de orden anterior: video-001-order-before-library.json. ${order.assetsGenerated.framePosters} posters referenciados en el plan actual; no se borran los anteriores. Sin render final.\n`;
summary=summary.replace('centro vertical 1610 px','centro vertical 1570 px');
await fs.writeFile(summaryPath,summary);
console.log(JSON.stringify({durationSeconds:order.durationSeconds,sourceRanges:sources.selectedRanges.length,posters:order.assetsGenerated.framePosters}));
