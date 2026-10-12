import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const files=(await fs.readdir('raw-material/video-001')).filter(n=>/\.mp4$/i.test(n)).sort();
const takes=[];
const missingSources=[];
for(const file of files){try{takes.push(await read('analysis/video-001-cache/'+file+'.analysis.json'));}catch(e){if(e.code!=='ENOENT')throw e;missingSources.push(file);}}
const metadata=await read('analysis/video-001-media-metadata.json');
for(const t of takes)t.measuredDurationSeconds=Number(metadata.sources.find(s=>s.sourceFile===t.sourceFile).format.duration);
const byPrefix=p=>{const t=takes.find(t=>t.sourceFile.startsWith(p));if(!t)throw new Error('Missing analyzed source '+p);return t.sourceFile;};
const screen=await read('analysis/video-001-screen-map.json');
const scenes=[];
function scene(prefix,inTime,outTime,guionBlock,headline,screenId){
  const sourceFile=byPrefix(prefix);
  const take=takes.find(t=>t.sourceFile===sourceFile);
  const support=screen.segments.find(s=>s.id===screenId);
  scenes.push({scene:scenes.length+1,guionBlock,sourceFile,inTime,outTime,spokenText:take.timestamps.filter(t=>t.startTime>=inTime-0.05&&t.endTime<=outTime+0.05).map(t=>t.text).join(' '),visualSupport:support?{type:'screen-recording',source:'grabacion-pantalla.mov',startTime:support.startTime,endTime:support.endTime,description:support.description,label:support.label}:{type:'remotion-component',source:'BigStatement',startTime:0,endTime:0,description:headline,headline},subtitles:'Frases transcritas por Gemini, sincronizadas a los timestamps de la fuente.',motion:'SoftZoom sutil y entrada de BigStatement.',transition:'Corte directo.'});
}
scene('1071',2.2,11.2,'Apertura: posicionamiento de marca','Posicionamiento de marca');
scene('1071',21,30.1,'No siempre tienes que dar más','Más cosas ≠ más valor');
scene('595d',11.2,22.2,'Samsung y la batería en 2014','2014 · La batalla por la batería');
scene('595d',34,43.5,'El argumento de la batería intercambiable','Una batería que podías cambiar');
scene('25b2',3.8,11.8,'Auriculares y cargadores','Auriculares. Cargadores. Percepción.');
scene('25b2',45,55.2,'Decisiones que después adopta Samsung','La competencia también cambia');
scene('1a6a',23,32.5,'Llegar primero frente a hacerlo diferente','Primero ≠ preferido','SCREEN-02');
scene('1a6a',37.5,45,'La presentación del Duo en el discurso','Cómo presentas tu propuesta','SCREEN-01');
scene('5fd3',1.5,14.5,'La obsesión por ser los primeros','La obsesión por ser primero');
scene('5fd3',14.5,20,'Agregar más servicios y características','Agregar más');
scene('5fd3',32,38,'Lo que necesita el cliente','¿Más… o mejor?');
scene('a55d',1.2,16.8,'Valor, confianza y experiencia','Valor. Confianza. Experiencia.','SCREEN-03');
scene('a55d',21.5,32,'Una solución con valor real','¿Qué valor real ofreces?');
scene('136e',29.5,34,'CTA grabado fuera del guion; cierre provisional','Comparte esta reflexión');
const comparisons=[
  {guionBlock:'Apertura',candidates:[{sourceFile:byPrefix('1071'),startTime:2.2,endTime:11.2,assessment:'Misma señal audiovisual que la copia 2eff; la transcripción de esta referencia es más coherente. Buena energía inicial, audio inteligible; orientación corregida.'},{sourceFile:byPrefix('2eff'),startTime:2.2,endTime:11.2,assessment:'Copia confirmada por audio PCM completo y cinco fotogramas. Las diferencias de puntuación y transcripción del modelo no demuestran otra toma.'}],selectedSource:byPrefix('1071'),reason:'Usar una sola referencia para las copias verificadas; no duplicar el hook.'},
  {guionBlock:'Samsung 2014 / batería',candidates:[{sourceFile:byPrefix('1071'),startTime:30.1,endTime:58.6,assessment:'Digresión y tropiezos en comercial y todo aquel; menor fidelidad al guion.'},{sourceFile:byPrefix('595d'),startTime:11.2,endTime:43.5,assessment:'Se mantiene la referencia explícita a 2014 y a la batería. Se excluyen los falsos inicios 0–11.2 y 22.2–34. Audio y aspecto consistentes con el resto.'}],selectedSource:byPrefix('595d'),reason:'Mayor fidelidad por bloques, con dos rangos separados para eliminar reinicios.'},
  {guionBlock:'Llegar primero / diferente',candidates:[{sourceFile:byPrefix('1a6a'),startTime:0,endTime:19,assessment:'Repite su su y llegar; mirada fuera de eje y menor fluidez.'},{sourceFile:byPrefix('1a6a'),startTime:23,endTime:32.5,assessment:'Reformulación completa y más resolutiva; misma continuidad de encuadre, audio y expresión.'}],selectedSource:byPrefix('1a6a'),reason:'Seleccionar el segundo intento dentro del mismo archivo.'},
  {guionBlock:'Valor / cliente',candidates:[{sourceFile:byPrefix('5fd3'),startTime:38,endTime:46.5,assessment:'Frase incompleta y reinicio al final.'},{sourceFile:byPrefix('a55d'),startTime:1.2,endTime:16.8,assessment:'Desarrolla confianza, valor y experiencia; pequeña repetición de de, pero continuidad semántica y visual superior.'}],selectedSource:byPrefix('a55d'),reason:'Mantener la explicación completa y evitar el cierre truncado.'},
  {guionBlock:'Cierre provisional',candidates:[{sourceFile:byPrefix('a55d'),startTime:41.5,endTime:51.5,assessment:'Termina en y…, sin cierre completo.'},{sourceFile:byPrefix('136e'),startTime:29.5,endTime:34,assessment:'CTA grabado completo; no pertenece al guion entregado. Uso exclusivo en esta revisión provisional.'}],selectedSource:byPrefix('136e'),reason:'Proporcionar cierre audible a la revisión parcial mientras se analizan las cuatro fuentes restantes.'}
];
const sourceMap={videoId:'VIDEO-001',editType:'#edit-2-pantalla-dividida',model:'gemini-3.6-flash',modelsUsed:[...new Set(takes.map(t=>t.provenance.model))],source:'Análisis reales de Gemini Files API, respuestas individuales preservadas en video-001-cache.',analysisComplete:false,analyzedCount:takes.length,expectedCount:12,missingSources,status:'blocked_daily_api_quota',takes};
const order={videoId:'VIDEO-001',editType:'#edit-2-pantalla-dividida',format:{width:1080,height:1920,fps:30},analysisComplete:false,analyzedCount:takes.length,expectedCount:12,missingSources,reviewNotice:`REVISIÓN PARCIAL · ${takes.length}/12 TOMAS ANALIZADAS`,status:'provisional-incomplete-analysis',scenes,discardedTakes:[{sourceFile:byPrefix('2eff'),reason:'Copia audiovisual verificada del inicio 1071; conservar una sola referencia.'}],comparisons,summary:'MONTAJE PROVISIONAL: ocho de doce tomas analizadas con Gemini. La cuota diaria impide analizar las cuatro restantes. Selección editorial basada en los datos reales disponibles, priorizando fidelidad, eliminación de falsos inicios, fluidez, inteligibilidad de audio y continuidad. La calidad visual, encuadre y expresión mantienen las limitaciones de la grabación; se corrige la orientación. Falta confirmar cobertura y mejores alternativas de auriculares, introducción del plegable y cierre del guion. El CTA final es material grabado fuera del guion y se usa solo como cierre provisional. No equivale a VIDEO-001 terminado.'};
await fs.mkdir('video-orders',{recursive:true});
await fs.writeFile('analysis/video-001-source-map.json',JSON.stringify(sourceMap,null,2)+'\n');
await fs.writeFile('video-orders/VIDEO-001.json',JSON.stringify(order,null,2)+'\n');
console.log(JSON.stringify({analyzed:takes.length,missingSources,scenes:scenes.length}));
