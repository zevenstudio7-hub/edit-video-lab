import fs from 'node:fs/promises';
const file='analysis/video-001-cache/screen.analysis.json';
const raw=JSON.parse(await fs.readFile(file,'utf8'));
const geminiSegments=raw.geminiSegments??raw.segments;
const upload=JSON.parse(await fs.readFile('analysis/video-001-cache/grabacion-pantalla.mov.upload.json','utf8'));
const segments=[
  {id:'SCREEN-01',startTime:8,endTime:16,description:'Imagen conceptual de un teléfono plegable bajo la etiqueta 2026 dentro del tablero aportado. No identifica un lanzamiento oficial.',guionBlock:'Mención del Duo y contraste entre posicionamiento y ser el primero.',recommendedDuration:8,splitScreen:true,relevance:'high',label:'Concepto visual · material aportado',geminiParentRange:[0,26]},
  {id:'SCREEN-02',startTime:55,endTime:60,description:'Publicación de Samsung Mobile MX sobre haber llegado primero, con referencia visible al Galaxy Fold de 2019. El reproductor incrustado muestra carga; no usarlo como demostración funcionando.',guionBlock:'Samsung: nosotros estuvimos aquí primero.',recommendedDuration:5,splitScreen:true,relevance:'high',label:'Publicación mostrada en la captura',geminiParentRange:[27,66]},
  {id:'SCREEN-03',startTime:365,endTime:373,description:'Vista estable del concepto de plegable a la izquierda y la imagen de otro plegable sostenido con las manos a la derecha; sirve para comparar presentación visual, no para probar especificaciones.',guionBlock:'Primero frente a diferente: experiencia, percepción y posicionamiento.',recommendedDuration:8,splitScreen:true,relevance:'high',label:'Comparativa del tablero · incluye concepto visual',geminiParentRange:[326,440]}
];
const map={sourceFile:'grabacion-pantalla.mov',durationSeconds:439.866667,provenance:{model:'gemini-3.6-flash',remoteFile:upload.name,method:'Segmentación Gemini Files API seguida de selección editorial de ventanas cortas; revisión visual de extremos de las ventanas en el archivo original.'},geminiSegments,segments};
await fs.writeFile(file,JSON.stringify(map,null,2)+'\n');
await fs.writeFile('analysis/video-001-screen-map.json',JSON.stringify(map,null,2)+'\n');
console.log('3 reviewed screen windows; original Gemini segmentation preserved');
