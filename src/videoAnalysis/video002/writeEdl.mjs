// VIDEO-002 (#edit-1-motion): decisiones de montaje (EDL) con su motivo → video-orders/VIDEO-002.json → edl.
// La narración sale de lo que el presentador dice en las tomas (transcripción whisper + Gemini + análisis de señal).
// Tiempos en segundos de cada toma. Los cortes en pausas se afinaron con refineCuts.mjs (fin/inicio de voz en la banda
// 300–2500 Hz más las «s» pegadas; pausa objetivo por unión); las dos uniones dentro de voz continua van marcadas.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-002.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const TOMAS = {A: 'FBF4A159-15B2-4B42-B057-E8FFA87CF0C5', B: 'B0B164E0-FD5D-4DB0-ACFA-581CDE53C1E6'};
const cuts = [
  {id: 'a01', toma: 'A', in: 1.01, out: 7.475, fadeOut: 0.035, gapAfter: 0.06, ambiente: {toma: 'A', in: 13.10}, frase: 'Durante mucho tiempo nos han hecho creer que las redes sociales solo se trataban de entretenimiento, pero con el paso del tiempo y', motivo: 'Apertura (única versión). Entra 80 ms antes de «Durante» (1,09 s; antes hay ruido grave sin voz). Se corta al final de la «i» de «y» (7,40–7,46 s; F2 alto) con un fundido de 35 ms para que decaiga, antes del falso arranque «las»; 60 ms de ambiente de la toma A.'},
  {id: 'a02', toma: 'A', in: 7.86, out: 12.365, fadeIn: 0.015, fadeOut: 0.025, frase: 'el avance de la tecnología nos hemos dado cuenta de algo totalmente diferente.', motivo: 'Retoma en el silencio previo a «el»: se elimina «las» y su vacilación (7,47–7,88 s). Pausa con la frase siguiente 1,91 s → 300 ms.'},
  {id: 'a03', toma: 'A', in: 13.975, out: 22.109, fadeIn: 0.025, fadeOut: 0.025, frase: 'Facebook, Instagram, TikTok, sí compiten por entretenerte, porque el entretenimiento captura algo muchísimo más importante, tu atención.', motivo: '«TikTok»: whisper oye «y todo» (p 0,49); Gemini oye «TikTok» en 3 de 3 pasadas y la señal muestra el cierre doble k-t. Pausa expresiva tras «atención» 2,31 s → 380 ms.'},
  {id: 'a04', toma: 'A', in: 24.039, out: 31.749, fadeIn: 0.025, fadeOut: 0.025, frase: 'Cuando una plataforma concentra la atención de millones de personas, tiene algo todavía mucho más importante y valioso, audiencia.', motivo: 'Pausa expresiva tras «audiencia» 2,03 s → 380 ms.'},
  {id: 'a05', toma: 'A', in: 33.399, out: 38.266, fadeIn: 0.025, fadeOut: 0.025, frase: 'Y aquí es donde se pone más interesante, porque Meta acaba de lanzar Muse for Small Business.', motivo: '«Muse»: los dos transcriptores lo funden con «for», pero la señal muestra la sílaba /mus/ (nasal, vocal posterior y «s» en 36,39–36,91 s). Pausa 1,72 s → 320 ms.'},
  {id: 'a06', toma: 'A', in: 39.666, out: 47.674, fadeIn: 0.025, fadeOut: 0.025, frase: 'Es una inteligencia artificial pensada para ayudar a los negocios a ejecutar tareas utilizando la información y las herramientas que ya tienen conectadas.', motivo: 'Pausa 1,66 s → 280 ms.'},
  {id: 'a07', toma: 'A', in: 49.054, out: 53.096, fadeIn: 0.025, fadeOut: 0.025, frase: 'Por ejemplo, puedes darle un objetivo como «ayúdame a buscar nuevos clientes».', motivo: 'Fin de la toma A: lo siguiente (53,5–60 s) es un intento cortado de la frase de Muse, que la toma B completa.'},
  {id: 'b01', toma: 'B', in: 0.686, out: 6.935, fadeIn: 0.025, fadeOut: 0.045, gapAfter: 0.11, frase: 'Y Muse puede trabajar con tus cuentas de Facebook e Instagram y conectarse con herramientas como Shopify, Canva,', motivo: 'Unión de tomas (A→B) con 320 ms de pausa. Se corta al final de la «a» de «Canva» (6,935 s, antes de que suba el F2 hacia la «e») con un fundido de 45 ms; la muletilla «eh» (6,94–7,40 s) se sustituye por 110 ms de ambiente de la toma.'},
  {id: 'b02', toma: 'B', in: 7.4, out: 8.728, fadeIn: 0.008, fadeOut: 0.025, frase: 'Notion, etcétera.', motivo: 'Retoma en la «N» de «Notion». Pausa 2,24 s → 360 ms antes del cambio de idea.'},
  {id: 'b03', toma: 'B', in: 10.608, out: 17.83, fadeIn: 0.025, fadeOut: 0.025, frase: 'Así que mira hacia dónde va toda esta evolución. Tienes contenido, tienes audiencia, tienes ejecución y sobre todo tienes ventas.', motivo: 'Pausa expresiva tras «ventas» 1,29 s → 400 ms.'},
  {id: 'b04', toma: 'B', in: 18.72, out: 21.313, fadeIn: 0.025, fadeOut: 0.025, frase: '¿Y qué significa esto realmente para tu negocio?', motivo: 'Pausa breve tras la pregunta: 2,01 s → 350 ms.'},
  {id: 'b05', toma: 'B', in: 22.973, out: 28.538, fadeIn: 0.025, fadeOut: 0.025, frase: 'Que cada vez habrá menos distancia entre tener algo que vender y encontrar a quien vendérselo.', motivo: 'Pausa 1,50 s → 360 ms.'},
  {id: 'b06', toma: 'B', in: 29.678, out: 35.295, fadeIn: 0.025, fadeOut: 0.025, frase: 'Por eso, mientras muchos utilizan las redes sociales solamente para consumir entretenimiento,', motivo: 'Pausa de contraste 1,91 s → 300 ms.'},
  {id: 'b07', toma: 'B', in: 36.905, out: 41.101, fadeIn: 0.025, fadeOut: 0.025, frase: 'otros están utilizando las mismas plataformas para construir audiencia,', motivo: 'Pausa de enumeración 1,47 s → 220 ms.'},
  {id: 'b08', toma: 'B', in: 42.351, out: 47.43, fadeIn: 0.025, frase: 'automatizar procesos y generar oportunidades de negocio. ¿En qué lado estás tú?', motivo: 'Conserva la pausa natural antes de la pregunta final. Termina 300 ms después de la última palabra (fin de voz 47,13 s).'},
];
order.edl = {
  version: 1,
  fps: 30,
  sampleRate: 48000,
  tomas: Object.fromEntries(Object.entries(TOMAS).map(([k, v]) => [k, {id: v, audio: `.whisper/video-002/${v}.48k.wav`, video: `video-002/hq/${v}.mp4`, fpsFuente: 60}])),
  ambiente: {toma: 'B', in: 9.20, out: 9.40, motivo: 'Silencio de la sala (toma B) para rellenar el hueco de la muletilla eliminada.'},
  fundidoPorDefecto: 0.006,
  // velocidad pedida por el usuario el 2026-10-05: voz acelerada con Rubber Band (tono y formantes conservados),
  // planos con playbackRate y todos los tiempos de la timeline divididos por ella; las animaciones no se aceleran
  speed: 1.1,
  // voz mejorada por el usuario (2026-10-05): buildDialogue deja el montaje propio en dialogue-original.wav y
  // useEnhancedVoice.mjs coloca esta voz a la muestra en dialogue.wav (la pista que lee la composición)
  vozMejorada: {
      "archivo": "formatos/edit-1-motion/RSS - Entretenimiento/material/audio muse-enhanced-v2.mp3",
      "origen": "La voz montada a 1.1x, mejorada por el usuario fuera del laboratorio (2026-10-05) porque la original «se escucha muy en el vacío». Sustituye a la voz montada en la misma pista (sin duplicar); efectos y música no cambian.",
      "desfaseMuestras": 3251,
      "colocacion": "Llegaba 67,7 ms tarde, constante de principio a fin (dispersión 3 muestras): se adelanta a la muestra contra el montaje propio (dialogue-original.wav), que cuadra con la timeline.",
      "nivel": "Ganancia fija hasta el nivel de la voz anterior (−14,5 LUFS) y limitador de pico verdadero con anticipación (−1,5 dBTP); ningún otro proceso.",
      "informe": "analysis/video-002-voz-mejorada.json",
      "herramienta": "src/videoAnalysis/video002/useEnhancedVoice.mjs"
  },
  cuts,
  criterios: {
    narracion: 'Toma A para las ideas 1–8 (única versión completa) y toma B para 9–12 y la pregunta final; el intento cortado de la frase de Muse al final de la toma A se descarta.',
    pausas: 'Medidas en la banda de la voz (el iPhone deja 0,7–1 s de ruido tras cada frase hasta que cierra su puerta de ruido). Internas 220 ms; expresivas 300–400 ms (tras atención, audiencia, ventas, la pregunta y los cambios de idea). Respiraciones y colas de ruido se eliminan con la pausa; fundidos de 25 ms en esos cortes.',
    fundidos: '6 ms por defecto; 25 ms en los cortes en pausa; en las dos uniones dentro de voz continua, 35–45 ms de caída sobre la vocal final y relleno de ambiente (a01→a02: 60 ms; b01→b02: 110 ms).',
    verificado: 'Muse, TikTok, «e Instagram», «etcétera» y las muletillas se comprobaron con whisper, Gemini y análisis de señal (src/videoAnalysis/video002/).',
  },
};
// ---------- plan visual (guion técnico) ----------
// Anclas: W(corte, palabra, n.º de aparición, desfase en frames) o {cutStart: id}. El modo «presentador» muestra las tomas;
// «motion» tapa la toma con una escena a pantalla completa mientras la voz sigue debajo (cubre uniones y saltos).
const W = (cut, word, n = 1, off = 0) => ({cut, word, n, off});
order.edl.escenas = [
  {id: 'p1', modo: 'presentador', tipo: 'Apertura', desde: {cutStart: 'a01'}, beats: {telefono: W('a01', 'mucho'), feed: W('a01', 'redes'), entretenimiento: W('a01', 'entretenimiento,'), scroll2: W('a01', 'entretenimiento,', 1, 18)}, motivo: 'Empieza con el presentador, sin intro: teléfono con un feed junto a él; en «entretenimiento» la tarjeta crece y el feed se desplaza dos veces.'},
  {id: 'm1', modo: 'motion', tipo: 'TiempoTecnologia', desde: W('a01', 'paso', 1, -4), beats: {tiempo: W('a01', 'paso'), avance: W('a02', 'avance'), datos: W('a02', 'la'), tarea: W('a02', 'tecnología'), conecta: W('a02', 'nos'), foco: W('a02', 'algo'), diferente: W('a02', 'diferente.')}, motivo: '«el paso del tiempo y el avance de la tecnología… algo totalmente diferente»: el feed se sustituye por una tarjeta de trabajo (contenido, datos, tarea) que se conecta; acercamiento a la tarjeta central. Tapa el corte del falso arranque «las».'},
  {id: 'm2', modo: 'motion', tipo: 'PlataformasAtencion', desde: {cutStart: 'a03'}, beats: {facebook: W('a03', 'Facebook,'), instagram: W('a03', 'Instagram,'), tiktok: W('a03', 'TikTok,'), compiten: W('a03', 'compiten'), porque: W('a03', 'porque'), captura: W('a03', 'captura'), importante: W('a03', 'importante,'), atencion: W('a03', 'atención.')}, motivo: 'Una tarjeta por plataforma al nombrarla (logos oficiales); se agrupan en un teléfono al «compiten»; notificaciones alrededor, se atenúan y el foco se cierra en el centro en «tu atención».'},
  {id: 'm3', modo: 'motion', tipo: 'Audiencias', desde: {cutStart: 'a04'}, beats: {concentra: W('a04', 'concentra'), millones: W('a04', 'millones'), tiene: W('a04', 'tiene'), valioso: W('a04', 'valioso,'), audiencia: W('a04', 'audiencia.')}, motivo: 'El punto de atención se multiplica en grupos de perfiles (alejamiento progresivo, sin cifras); una tarjeta los engloba en «audiencia».'},
  {id: 'p2', modo: 'presentador', tipo: 'Transicion', desde: {cutStart: 'a05'}, beats: {interesante: W('a05', 'interesante,')}, motivo: 'Vuelve el presentador al 100 % en «Y aquí es donde se pone más interesante».'},
  {id: 'm4', modo: 'motion', tipo: 'Anuncio', desde: W('a05', 'Meta', 1, -3), beats: {meta: W('a05', 'Meta'), muse: W('a05', 'Muse'), business: W('a05', 'Business.')}, motivo: 'Captura verificada del anuncio de Meta (about.fb.com, 29 sep 2026) y acercamiento al nombre del producto; tapa la unión con la frase siguiente.'},
  {id: 'm5', modo: 'motion', tipo: 'Sistema', desde: {cutStart: 'a06'}, beats: {ia: W('a06', 'inteligencia'), negocios: W('a06', 'negocios'), tareas: W('a06', 'ejecutar'), info: W('a06', 'información'), herramientas: W('a06', 'herramientas'), conectadas: W('a06', 'conectadas.')}, motivo: 'Muse al centro (sin interfaz inventada: «Ejemplo ilustrativo»); negocio, información y herramientas se conectan con líneas; las tareas pasan de pendiente a preparada.'},
  {id: 'm6', modo: 'motion', tipo: 'Objetivo', desde: {cutStart: 'a07'}, beats: {ejemplo: W('a07', 'Por'), objetivo: W('a07', 'objetivo'), tecleo: W('a07', 'ayúdame'), fin: W('a07', 'clientes.', 1, 14)}, motivo: 'Conversación conceptual: se escribe el objetivo que dice («Ayúdame a buscar nuevos clientes»), completo al terminar la frase; el cursor envía y aparece «Preparando propuesta» (visible hasta «Y Muse puede…»). Tapa el cambio de toma A→B.'},
  {id: 'm7', modo: 'motion', tipo: 'Herramientas', desde: W('b01', 'puede', 1, -2), beats: {muse: W('b01', 'puede'), facebook: W('b01', 'Facebook'), instagram: W('b01', 'Instagram'), herramientas: W('b01', 'herramientas'), shopify: W('b01', 'Shopify,'), canva: W('b01', 'Canva,'), notion: W('b02', 'Notion,'), etc: W('b02', 'etcétera.')}, motivo: 'Muse como nodo central: primero las cuentas de Facebook e Instagram y luego Shopify, Canva y Notion (logos oficiales, uno por nombre) y «+» en «etcétera». Nota secundaria verificada: disponibilidad en EE. UU. y Canadá.'},
  {id: 'm8', modo: 'motion', tipo: 'Evolucion', desde: {cutStart: 'b03'}, beats: {mira: W('b03', 'mira'), contenido: W('b03', 'contenido,'), audiencia: W('b03', 'audiencia,'), ejecucion: W('b03', 'ejecución'), ventas: W('b03', 'ventas.')}, motivo: 'Recorrido en cuadrícula 2×2 con los conceptos que dice (contenido, audiencia, ejecución, ventas); cada tarjeta se activa con su palabra y la última con más fuerza.'},
  {id: 'p3', modo: 'presentador', tipo: 'Pregunta', desde: {cutStart: 'b04'}, beats: {negocio: W('b04', 'negocio?')}, motivo: 'Presentador al 108 % durante la pregunta.'},
  {id: 'm9', modo: 'motion', tipo: 'Distancia', desde: {cutStart: 'b05'}, beats: {menos: W('b05', 'menos'), vender: W('b05', 'vender'), encontrar: W('b05', 'encontrar'), vendérselo: W('b05', 'vendérselo.')}, motivo: 'Producto y posibles compradores separados; contenido, audiencia y tarea acortan la distancia hasta formar un recorrido conectado.'},
  {id: 'm10', modo: 'motion', tipo: 'Usos', desde: {cutStart: 'b06'}, beats: {redes: W('b06', 'redes'), consumir: W('b06', 'consumir'), otros: W('b07', 'otros'), mismas: W('b07', 'mismas'), construir: W('b07', 'construir')}, motivo: 'El teléfono desplaza un feed («consumir entretenimiento»); «otros…las mismas plataformas» lo sustituye por acciones: perfiles que se agrupan («construir audiencia»).'},
  {id: 'p4', modo: 'presentador', tipo: 'Cierre', desde: {cutStart: 'b08'}, beats: {automatizar: W('b08', 'automatizar'), generar: W('b08', 'generar'), pregunta: W('b08', '¿En')}, motivo: 'Vuelve el presentador; junto a él, casillas que cambian de estado («automatizar procesos») y la ficha de un contacto interesado («oportunidades de negocio»); se retiran en «¿En qué lado estás tú?» y la cámara se acerca despacio hasta 108 %.'},
];
order.edl.camara = {
  foco: {x: 0.48, y: 0.24},
  presentador: {p1: {de: 1, a: 1.08, desde: W('a01', 'mucho'), hasta: W('a01', 'entretenimiento,', 1, 30)}, p2: {de: 1, a: 1}, p3: {de: 1.04, a: 1.08, desde: W('b04', '¿Y'), hasta: W('b04', '¿Y', 1, 10)}, p4: {de: 1, a: 1.08, desde: {cutStart: 'b08'}, hasta: {fin: true}}},
  motivo: 'Presentador al 100 % de base; acercamientos de énfasis a 108 % (orden §4). Las interfaces llevan su propia cámara dentro de cada escena (100 % → 115–125 % sobre el detalle; alejamiento para revelar conjuntos).',
};
order.edl.enfasis = [
  {id: 'e1', desde: W('a01', 'se'), hasta: W('a01', 'entretenimiento,'), lines: [{text: 'se trataban de', size: 'm', tone: 'white'}, {text: 'entretenimiento,', size: 'l', tone: 'pink', indent: 40}], motivo: 'Idea de partida.'},
  {id: 'e2', desde: W('a02', 'algo'), hasta: W('a02', 'diferente.'), lines: [{text: 'algo totalmente', size: 'm', tone: 'white'}, {text: 'diferente.', size: 'xl', tone: 'red', indent: 60}], motivo: 'Giro del argumento.'},
  {id: 'e3', desde: W('a03', 'tu'), hasta: W('a03', 'atención.'), lines: [{text: 'tu', size: 'm', tone: 'white'}, {text: 'atención.', size: 'xl', tone: 'pink', indent: 50}], motivo: 'Primer concepto clave (la tarjeta protagonista usa un icono, no la palabra).'},
  {id: 'e4', desde: W('a04', 'y'), hasta: W('a04', 'audiencia.'), lines: [{text: 'y valioso,', size: 'm', tone: 'white'}, {text: 'audiencia.', size: 'xl', tone: 'pink', indent: 40}], motivo: 'Segundo concepto clave.'},
  {id: 'e5', desde: W('a05', 'se'), hasta: W('a05', 'interesante,'), lines: [{text: 'se pone', size: 'm', tone: 'white'}, {text: 'más interesante,', size: 'l', tone: 'pink', indent: 30}], motivo: 'Bisagra hacia Muse, con el presentador.'},
  {id: 'e6', desde: W('a06', 'ejecutar'), hasta: W('a06', 'tareas'), lines: [{text: 'ejecutar', size: 'm', tone: 'white'}, {text: 'tareas', size: 'xl', tone: 'pink', indent: 60}], motivo: 'Lo que hace Muse.'},
  {id: 'e7', desde: W('b03', 'sobre'), hasta: W('b03', 'ventas.'), lines: [{text: 'sobre todo', size: 'm', tone: 'white'}, {text: 'tienes ventas.', size: 'l', tone: 'red', indent: 30}], motivo: 'Último paso del recorrido, el más marcado.'},
  {id: 'e8', desde: W('b05', 'menos'), hasta: W('b05', 'distancia'), lines: [{text: 'menos', size: 'm', tone: 'white'}, {text: 'distancia', size: 'xl', tone: 'pink', indent: 50}], motivo: 'Consecuencia para el negocio.'},
  {id: 'e9', desde: W('b08', '¿En'), hasta: W('b08', 'tú?'), lines: [{text: '¿En qué lado', size: 'm', tone: 'white'}, {text: 'estás tú?', size: 'xl', tone: 'pink', indent: 40}], motivo: 'Pregunta final al espectador (grabada).'},
];
order.edl.sfxDesign = {
  // sonido por escena y beat: [beat, sonido, ganancia]; el CTA no se añade (no está grabado)
  escenas: {
    p1: [['telefono', 'zp-pop', 1], ['entretenimiento', 'zp-swish', 0.9], ['scroll2', 'zp-swish', 0.8]],
    m1: [['tiempo', 'zp-tock', 0.9], ['avance', 'whoosh', 0.8], ['datos', 'zp-pop-hi', 0.8], ['tarea', 'zp-pop-hi', 0.8], ['conecta', 'zp-pulse', 0.9], ['foco', 'zp-tick', 0.8]],
    m2: [['facebook', 'zp-pop', 1], ['instagram', 'zp-pop', 1], ['tiktok', 'zp-pop', 1], ['compiten', 'zp-swish', 1], ['captura', 'zp-notify', 0.8], ['importante', 'zp-notify', 0.6], ['atencion', 'mouse-click', 0.9], ['atencion', 'zp-thud', 0.7]],
    m3: [['millones', 'zp-sparkle', 0.9], ['audiencia', 'zp-confirm', 1]],
    m4: [['meta', 'whoosh', 0.9], ['muse', 'zp-thud', 0.8]],
    m5: [['ia', 'zp-pop', 0.9], ['negocios', 'zp-pop-hi', 0.8], ['tareas', 'zp-pop-hi', 0.8], ['info', 'mouse-click', 0.7], ['herramientas', 'mouse-click', 0.7], ['conectadas', 'zp-confirm', 1]],
    m6: [['ejemplo', 'zp-pop', 0.9], ['tecleo', 'zp-keys', 1], ['fin', 'mouse-click', 1], ['fin', 'zp-pulse', 0.7, 8]],
    m7: [['facebook', 'zp-pop-hi', 0.9], ['instagram', 'zp-pop-hi', 0.9], ['shopify', 'zp-pop', 0.9], ['canva', 'zp-pop', 0.9], ['notion', 'zp-pop', 0.9], ['etc', 'zp-confirm', 0.9]],
    m8: [['contenido', 'zp-pulse', 0.8], ['audiencia', 'zp-pulse', 0.8], ['ejecucion', 'zp-pulse', 0.8], ['ventas', 'zp-pulse', 1.2], ['ventas', 'zp-chime', 0.7]],
    m9: [['menos', 'zp-swish', 0.9], ['vendérselo', 'mouse-click', 0.9]],
    m10: [['redes', 'zp-swish', 0.8], ['consumir', 'zp-swish', 0.8], ['otros', 'whoosh', 0.8], ['construir', 'zp-pulse', 0.9]],
    p4: [['automatizar', 'zp-tick', 0.8], ['automatizar', 'zp-tick', 0.8, 8], ['generar', 'zp-pop-hi', 0.8]],
  },
  enfasis: 'zp-text',
  limites: {minFrames: 3, mismoSonidoFrames: 5},
  finalDesde: W('b08', '¿En'),
  motivo: 'Efectos sincronizados con la aparición, pulsación o cambio de estado exacto (orden §6); sin whoosh en cada corte ni sonido por subtítulo; se reducen en la última frase.',
};
order.edl.musica = {generador: 'library/music/synth-music.mjs', bpm: 96, nivel: -31, duckingDb: -5, finalDesde: W('b08', '¿En'), finalDb: -10, motivo: 'Música instrumental discreta sin letra, propia (síntesis); baja bajo la voz y en la última frase.'};
order.status = 'narracion-resuelta';
fs.writeFileSync(orderPath, JSON.stringify(order, null, 2) + '\n');
const dur = cuts.reduce((s, c) => s + (c.out - c.in) + (c.gapAfter ?? 0), 0);
console.log(`EDL: ${cuts.length} cortes · narración ${dur.toFixed(2)} s (${Math.round(dur * 30)} frames)`);
