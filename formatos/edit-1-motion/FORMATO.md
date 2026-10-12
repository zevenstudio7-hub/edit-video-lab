# #edit-1-motion — formato en preparación

Estado: **en preparación**. Recoge la nota del usuario del 2026-10-04 y el análisis de su video de ejemplo. Primer video: VIDEO-002 («RSS - Entretenimiento», Muse for Small Business), en preview desde el 2026-10-05. La composición está en `src/compositions/video002/` y las herramientas en `src/videoAnalysis/video002/`. El formato se aprueba con ese video.

## Intención del usuario (2026-10-04)

Talking head acompañado de motion en cuatro posiciones:
1. **Encima del personaje:** objetos, iconos y etiquetas superpuestos al video.
2. **Alrededor de él:** elementos junto a la cabeza y los hombros que acompañan lo que dice.
3. **Detrás, recortando al personaje:** capas entre el fondo y la persona; el fondo puede sustituirse por una escena.
4. **Imágenes de apoyo con textos grandes,** como en `#edit-2-pantalla-dividida`.

Además:
- **Motion a pantalla completa** mientras el personaje sigue hablando: su voz continúa en off por debajo de los gráficos.
- **Subtítulos:** los del formato `#edit-2-pantalla-dividida` quedan definidos como el tipo de subtítulos de este formato (lectura + énfasis tipográfico con textura). Desde el 2026-10-09 se llaman **S1** en el catálogo, y en motion a pantalla completa rige **S4** (titular de escena); ver «Variantes».
- **Identidad video-zeven:** los mismos colores, tipografías y demás (`formatos/identidad-video-zeven.md`).

## Decisiones del usuario con VIDEO-002 (2026-10-05)

- **Franja negra integrada, sin degradado.** El motion de pantalla completa vive sobre un suelo negro sólido (ink de la identidad) con el borde nítido en y = 1180. La franja:
  - se mantiene mientras se encadenan escenas de motion y sube desde abajo al entrar desde el presentador;
  - de ella salen los textos (los subtítulos viven dentro y aparecen con ella) y las tarjetas oscuras, que nacen de la franja sin borde inferior;
  - los objetos se apoyan en su borde como en una mesa;
  - al cambiar de escena, el contenido se hunde en ella con desenfoque de movimiento y el siguiente sale de ella: el flujo es continuo.

  Los acercamientos de cámara se anclan al borde para que no se mueva. Código: `src/compositions/video002/band.tsx`.
- **Iconos 3D propios** para lo que se menciona (no los del ejemplo), como los objetos de fieltro de la referencia:
  - se modelan con three.js (`@remotion/three`) con material afelpado y la paleta video-zeven;
  - se hornean en hojas de fotogramas (entrada y reposo en bucle), porque varios lienzos WebGL a la vez congelaban el Studio.

  Código: `src/compositions/video002/icons3d.tsx`; script de horneado: `src/videoAnalysis/video002/buildIconSprites.mjs`.
- **Relieve SVG** («inflado» con textura de fieltro) para lo que no existe como icono y se crea a medida: público, fichas, insignias. Se renderiza a PNG (`buildRelief.mjs`).
- **Logos de marca:** nunca se redibujan ni se pasan a 3D. Van enteros, dentro de tarjetas o recuadros.
- **Marca del usuario:** en las cuentas y perfiles de redes simulados aparece **@yeirodriguez.co**.
- **Voz mejorada:** el usuario puede entregar la voz ya trabajada (por ejemplo, sin el sonido «en el vacío»). Sustituye a la voz montada en la misma pista, colocada a la muestra (`useEnhancedVoice.mjs`), sin duplicarla y sin tocar efectos ni música.

## Video de ejemplo

Grabación de pantalla de un reel de Instagram de otro creador, sobre el lanzamiento de un agente de IA: 65 s, 1206×2622 a 60 fps. Copia en `formatos/edit-1-motion/referencias/` (sin versionar; el original está en Descargas) y hojas de fotogramas con tiempo en `formatos/edit-1-motion/referencias/analisis/`. **Es solo referencia de estilo:** no se reutilizan su material, textos, mascota ni marcas.

| Tramo | Qué se ve | Función de la voz |
|---|---|---|
| 0–10 s | Presentador en plano medio sobre un fondo oscuro con luz de acento. Encima y alrededor de la cabeza: iconos de app, un logotipo, una mascota, una píldora de estado, una fila de avatares y signos de interrogación en 3D. Titular grande sobre el torso | gancho: anuncio y pregunta |
| 10–27 s | Motion a pantalla completa: interfaz de chat, reloj, cursor que escribe, mascota, navegador, portátil y lista de tareas con horas que pasa del día a la noche. Titular grande arriba | explicación |
| ~28 s | Vuelve el presentador un momento, con titular y mascota | frase bisagra |
| 29–58 s | Motion a pantalla completa: tarjeta de trabajo y factura (pendiente → enviada → aprobada), foto real de una persona con su nombre en grande, chat con la mascota, paneles de edición (color, audio, cortes), permisos con interruptores, barra de progreso y tarjetas de planes | ejemplos y condiciones |
| 61–65 s | Presentador con una pregunta grande arriba y una caja de comentario simulada (CTA para comentar) | cierre |

- **Proporción:** el presentador se ve en torno al 25 % del tiempo (gancho, bisagra y cierre). El 75 % restante es motion a pantalla completa con la voz debajo.
- **Ritmo:** unos 27 cambios visuales grandes en 65 s, uno cada ~2,4 s. Dentro de cada escena hay microanimaciones: escribir, marcar casillas, encender interruptores, contadores, un cursor que pulsa. Las transiciones usan desenfoque de movimiento.
- **Recursos que se repiten:**
  - interfaz simulada: tarjetas, casillas, interruptores, chat, barras de progreso, cursor;
  - un personaje o mascota que reaparece;
  - iconos de apps reales;
  - icono dentro de la frase del titular;
  - imagen de apoyo con un nombre en grande.
- **Lo que no se toma del ejemplo:**
  - su tipografía (serif blanca con la palabra clave en rojo cursiva, monoespaciada en la interfaz): se sustituye por la identidad video-zeven. Sus tarjetas oscuras sí se adoptan, en el ink de la identidad y naciendo de la franja (decisión del 2026-10-05);
  - sus subtítulos pequeños abajo: se sustituyen por la lectura y los énfasis de edit-2.
- **Capas detrás de la persona:** en el ejemplo no hay ninguna (todo va encima o alrededor). Esa posición la pide el usuario y exige recortar al personaje.

## Variantes (acordadas el 2026-10-09)

La orden declara `variante` y `subtitulos` (catálogo: `formatos/subtitulos/SUBTITULOS.md`).

| Variante | Qué es | Cuándo usarla | Subtítulos (defecto · alternativa) | Video de referencia |
|---|---|---|---|---|
| **1A Motion sobre el presentador** | Motion encima, alrededor y detrás del presentador (recortado) | el presentador es el eje y el motion acompaña lo que dice | S1 · S3 | VIDEO-003 (preview v1) |
| **1B Motion a pantalla completa** | Gráficos a pantalla completa con la voz en off debajo, sobre la franja negra | explicar procesos, interfaces o ideas que no se ven en la toma | S4 · S1 | VIDEO-002 (tramos de motion) |
| **1C Combinado** | Alterna 1A y 1B (referencia ≈ 25 % presentador / 75 % motion) | la mayoría de los videos de este formato: gancho, bisagra y cierre con el presentador; el resto, motion | S1 + S4 · S3 | VIDEO-002 (preview v3) |

### 1A Motion sobre el presentador
Las cuatro posiciones de la nota del usuario son **capas** de esta variante, no variantes aparte:
1. **Encima:** objetos, iconos y etiquetas superpuestos al video.
2. **Alrededor:** elementos junto a la cabeza y los hombros, anclados a su posición.
3. **Detrás, recortando al personaje:** el fondo se sustituye por una escena; los elementos y titulares van entre el fondo y la persona.
4. **Imagen de apoyo con texto grande:** captura o foto real más un énfasis, como las evidencias de edit-2.

Subtítulos S1: lectura en y = 1438 y énfasis apoyado en y = 1480, sin tapar los objetos alrededor de la cabeza.

### 1B Motion a pantalla completa
Franja negra integrada (borde en y = 1180) con el contenido apoyado en ella; una idea cada ~2–3 s, con microanimaciones y transiciones con desenfoque. Subtítulos S4: el énfasis hace de titular dentro de la franja, **sin lectura duplicada**.

### 1C Combinado
Presentador (1A) en el gancho, en las frases bisagra y en el cierre; motion (1B) en las explicaciones. El cambio de uno a otro lo hace la franja: sube desde abajo al entrar en motion y baja al volver al presentador. Subtítulos S1 sobre el presentador y S4 en el motion.

Capas de atrás hacia delante: fondo (video o escena) → motion detrás → personaje recortado (alfa) → motion encima y alrededor → subtítulos → CTA.

En todas las variantes la lectura sigue a la voz. En pantalla completa, el énfasis hace de titular, como en el ejemplo, sin repetir la frase en dos sitios.

## Qué se hereda de edit-2 y de la identidad

- **Subtítulos:** `type-captions` (variante `texture`) con tiempos por palabra reales (`refineWordTimesV3.mjs`). Las posiciones de pantalla completa se revisan en el primer video.
- **Paleta y tipografía:** las de la identidad video-zeven.
- **Sonido:** una sola voz continua (la voz en off es la misma pista) y efectos `zp-` por sentido.
- **Proceso:**
  - EDL en la orden con el motivo de cada decisión, resuelta en una timeline;
  - pistas de cámara y reparto (`camera-layout-tracks`);
  - primitivas de gráficos (`src/compositions/video001v3/kit.tsx`), capturas con zoom (`focus-pan-image`) y encuadre del presentador (`presenter-camera`);
  - exportación con la corrección AAC (`formatos/edit-2-pantalla-dividida/FORMATO.md`).
- **`TextBehindSubject`** (receta candidata): ya ordena las capas fondo → texto → sujeto recortado.

## Qué hay que construir o probar

1. **Recorte del personaje** (alfa por frame), la primera prueba técnica antes de diseñar escenas:
   - **Con croma** (fondo verde o azul liso al grabar): recorte por color, el más limpio y estable.
   - **Sin croma:** segmentación de personas de Apple Vision (macOS 12+). Está disponible en este Mac sin instalar nada (macOS 13.7, Intel, Swift 5.8). Hay que probar el borde del pelo y que no parpadee entre frames.
   - **Probado en VIDEO-003 (2026-10-06), sin croma:** `src/videoAnalysis/video003/segment.swift` con `VNGeneratePersonSegmentationRequest` en calidad «balanced» tarda ~0,4 s por fotograma en este Mac («accurate» va 8 veces más lento, con poca mejora). La máscara se codifica en VP9 con alfa y se pone encima de los gráficos de la capa «detrás». El pelo y las manos salen bien en los fotogramas de control; falta revisar el parpadeo en movimiento rápido.
   - Descartados por ahora: SAM 2 exige GPU CUDA y MatAnyone no es para uso con clientes (`library/README.md`).
2. **Seguimiento de la cabeza:** para anclar objetos alrededor (Apple Vision detecta la cara por frame; hay que suavizarlo).
3. **Kit de interfaz simulada en la paleta video-zeven:** tarjetas, chat, casillas, interruptores, barras de progreso, contadores y un cursor que escribe y pulsa.
4. **Escenas de pantalla completa:** una idea cada ~2–3 s, con microanimaciones y transiciones (desenfoque o empuje).
5. **Subtítulos sobre motion de pantalla completa:** resuelto en VIDEO-002. Lectura y énfasis van dentro de la franja negra (lectura centrada en y = 1438; énfasis apoyado en y = 1480), dentro del área segura.

## Lo que hace falta para empezar

- **Material:** tomas del presentador. ¿Se pueden grabar con fondo verde o azul liso? Facilita mucho la capa «detrás» de 1A.
- **Contenido:** guion o tema, y duración objetivo.
- **Recursos reales:** el sistema investiga logos, capturas, fotos, clips, personajes y mascotas según la regla general de la RAÍZ, y registra procedencia y derechos. El usuario solo aporta lo privado, propio o no disponible públicamente.
- **Objetivo y CTA:** seguir, comentar, enlace…
- **Personaje o mascota:** primero se comprueba si el tema tiene uno oficial utilizable; si se propone uno propio o conceptual, debe distinguirse claramente del oficial y cumplir una función narrativa repetible.
- **Destino:** Reels orgánico o pautado (cambia el área segura).

## Pasos previstos

1. Con el material, crear la orden VIDEO-XXX con `EDIT_TYPE` `#edit-1-motion`.
2. Prueba técnica con unos 10 s de una toma: recorte y seguimiento de la cabeza.
3. Guion visual tramo a tramo: qué variante (1A / 1B), qué motion y por qué.
4. Kit de interfaz y escenas. Las herramientas de VIDEO-001 se adaptan al ID del video nuevo.
5. Preview en el Studio y revisión con el usuario.
6. Exportación con el procedimiento de la identidad.
