# #edit-2-pantalla-dividida — formato aprobado

Estado: **aprobado por el usuario el 2026-10-04**. Es la forma de ejecutar el EDIT_TYPE `#edit-2-pantalla-dividida` de la RAÍZ (`docs/VIDEO-SYSTEM-ROOT.md`). Desde el 2026-10-09 es la **variante 2A**; la 2B (demo protagonista) es candidata.

Referencia: VIDEO-001, exportado como `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4` (2:43, 1080×1920, 30 fps) desde la composición `Video001V3`, con los datos en `video-orders/VIDEO-001.json → candidatoV3`. Empezó como el preset experimental `reel-editorial-reforzado` (`.claude/skills/video-lab/references/preset-experimental.md`).

Sus colores, tipografía, subtítulos, sonido, CTA y área segura forman la **identidad video-zeven**, que comparten todos los formatos (`formatos/identidad-video-zeven.md`).

## Variantes (acordadas el 2026-10-09)

La orden declara `variante` y `subtitulos` (catálogo: `formatos/subtitulos/SUBTITULOS.md`).

| Variante | Qué es | Cuándo usarla | Subtítulos (defecto · alternativa) | Estado |
|---|---|---|---|---|
| **2A Apoyo arriba, presentador abajo** | El formato aprobado de VIDEO-001 (todo lo que describe este documento) | explicar con evidencias y motion semántico mientras se ve al presentador | S1 · S6 | aprobado (VIDEO-001) |
| **2B Demo protagonista** | La pantalla o el producto ocupa casi todo el cuadro; el presentador va en un recuadro | demostraciones de software o producto donde lo importante es lo que se ve | S6 · S1 | candidata |

### 2B Demo protagonista (candidata)
- La grabación de pantalla o la toma del producto ocupa el cuadro (y 250–1500), con zoom y señalador (`FocusPanImage`, `FocusHighlight`) en lo que se dice.
- El presentador va en un **recuadro** (≈ 300 × 400 px, esquinas redondeadas, borde fino) abajo a la izquierda, x 65, y ≈ 1080–1480, fuera de la columna de iconos; se oculta si tapa algo importante.
- Subtítulos S6 centrados entre la demo y el recuadro, o arriba del recuadro, siempre sin tapar la acción de pantalla.
- Medidas sin validar: se ajustan con el primer video.


1. **Dos zonas en 9:16.** Arriba va el apoyo visual y abajo el presentador, separados por una línea amarilla. El reparto cambia con la narración: presentador a pantalla completa en el gancho y el cierre, gráfico a pantalla completa solo para una evidencia puntual, y pantalla dividida el resto del tiempo.
2. **Motion semántico arriba.** Objetos y acciones que representan lo que se dice (balanza, batería, cargador, caja, cubos, personas…), y capturas reales como evidencia, con su crédito. **Sin frases ni listas**: el texto ya está en los subtítulos. Cada escena tiene momentos (beats) anclados a palabras.
3. **Subtítulos tipográficos en dos capas.**
   - Lectura: bloques cortos (2–4 palabras, cortados en la puntuación) en sans pesada (Inter Tight 800–900), blancos, sin caja.
   - Énfasis: unos 14 bloques grandes apilados (1–3 líneas, tamaños mixtos) con textura rosa o roja en las ideas clave, aproximadamente uno cada 12 s. El énfasis **sustituye** a la lectura en sus palabras: no la duplica.
4. **Cámara estable con intención.** Escala 1 por defecto. Unos 7 movimientos suaves (acercamientos y derivas lentas), cada uno con su motivo y anclado a una palabra. Son independientes de los cortes.
5. **Cortes limpios y ritmo.** Sin silencios largos ni muletillas: las pausas naturales (≤ 0,49 s) se conservan y las largas se comprimen a unos 0,2 s. Ningún corte recorta una «s» ni la última vocal de una palabra. La referencia va a **1.1x**: la imagen con `playbackRate` y la voz acelerada conservando tono y formantes. Las animaciones no se aceleran.
6. **Una sola voz, limpia.** Va en una pista de diálogo continua, y el audio de los planos de cámara está silenciado. Si el usuario entrega una voz mejorada (sin ruido), esa sustituye a la generada.
7. **Efectos de sonido con sentido.** Llevan efecto cada aparición de motion, cada movimiento, cada énfasis, cada cambio de reparto, cada marca sobre una captura y el CTA. Cada uno se elige por lo que se dice: madera para cubos, campana para valor o logro, subida para «arriba», caída para lo que se derrumba, sello para «copiado», alerta para los puntos críticos… Suenan por debajo de la voz.
8. **Identidad ZevenPRO solo en los gráficos.** Fondo claro crema → azul, tarjetas blancas con borde suave y sombra ligera, amarillo para destacar, azul solo para lo digital y rojo solo para alertas. **Los subtítulos no usan la paleta de marca.**
9. **Todo dentro del área segura de Instagram Reels**, y CTA «Seguir» al final.

## Medidas de referencia (1080 × 1920, 30 fps)

| Elemento | Valor |
|---|---|
| Área segura (Reels orgánico) | x 65–1015, y 250–1500; nada a la derecha de x = 940 por debajo de y = 1000 (columna de iconos). Para anuncios, Meta pide más margen: 14 % arriba, 35 % abajo, 6 % a los lados |
| Pantalla dividida | zona gráfica de 800 px de alto, con el contenido en y 250–776; presentador en 800–1920, encuadrado al 0,25 de su zona; línea amarilla de 5 px entre zonas |
| Cambios de reparto | 12–16 frames. En el gráfico a pantalla completa, una sombra inferior mantiene legibles los subtítulos |
| Lectura | centro en y = 1438, 66 px, x 65–940 |
| Énfasis | apoyado en y = 1480 (anclaje por la base); tamaños 96 / 128 / 160 px; tonos blanco, rosa `#f4c0ca` y rojo `#ff4b2e`, con textura |
| Contraste bajo el presentador | degradado desde el 55 % de la altura de su zona hasta negro al 55 % de opacidad en la base |
| Cámara | escala base 1; acercamientos (push) a 1,12–1,18 y derivas lentas (drift) a 1,08–1,10; entrada de 12–16 frames y salida de 12–18 (0 cuando coincide con un corte) |
| CTA | botón «Seguir» amarillo a la altura del pecho (y 1170–1260); aparece al empezar el último plano; un cursor lo pulsa en la palabra de cierre («síganme») |
| Voz | −14 LUFS integrados, −1,5 dBTP |
| Efectos | separación mínima de 3 frames (6 frames para el mismo sonido); prioridad énfasis/CTA > movimiento > aparición; ganancias: énfasis y CTA ×1,4, aparición ×1,12, movimiento ×1; pista con limitador a −6 dBFS, unos 6 dB por debajo de la voz |
| Duración | ≤ 3:00 (la referencia dura 2:43) |

## Piezas

- **Composición de referencia** (`src/compositions/video001v3/`):
  - `Video001V3.tsx`: zonas, cámara, subtítulos, audio, CTA, área segura y guía `showSafeArea`.
  - `kit.tsx`: primitivas reutilizables (lienzo, tarjetas, objetos, fondo de marca, sombras).
  - `scenes.tsx`: escenas propias de VIDEO-001; **se rehacen para cada video** con las primitivas del kit.
- **Biblioteca** (`library/catalog.json`):
  - `type-captions`, solo con la variante `texture`.
  - `camera-layout-tracks`, `presenter-camera` y `focus-pan-image`.
  - `synth-sfx`, más el obturador y el clic de `sfx-pack`.
  - Paleta de `brand-zevenpro`.
- **Herramientas** (`src/videoAnalysis/`):
  - `refineWordTimesV3.mjs`: tiempos por palabra.
  - `buildEditV3.mjs`: pasa la EDL a la timeline.
  - `buildDialogueTrack.mjs`: pista de voz.
  - `buildSfxBed.mjs`: pista de efectos.
  - `qaEditAudio.mjs --v3`: comprobación de cortes.
  - `prepareV3Assets.mjs`: texturas de los énfasis.
  - Fuera de esa carpeta: `.whisper/tools/stills.mjs`, que genera fotogramas de control.
- **Contrato**: las decisiones van en la orden como EDL, cada una con su motivo (cortes, reparto, cámara, subtítulos, escenas con beats, diseño de sonido, CTA, audio, velocidad, paleta). La timeline sale siempre de `buildEditV3.mjs`. Plantilla: `video-orders/VIDEO-001.json → candidatoV3.edl`.

## Proceso

1. Tomas y transcripción con tiempos (`analysis/<id>-whisper`). Elegir cortes y anotar el motivo de cada uno.
2. Tiempos por palabra reales: `node src/videoAnalysis/refineWordTimesV3.mjs`. Combina el DTW de whisper con la alineación por sílabas, y los énfasis no se activan sin estos tiempos.
3. Escribir la EDL en la orden y resolverla con `node src/videoAnalysis/buildEditV3.mjs` (`--dry` muestra el resultado sin escribir).
4. Crear las escenas del video en `scenes.tsx` a partir de `kit.tsx`, una por idea, sin texto.
5. Voz con `node src/videoAnalysis/buildDialogueTrack.mjs`. Si el usuario entrega una voz mejorada, se declara en `audio.dialogueSource`: se alinea por correlación, se ajusta a la longitud exacta y se normaliza.
6. Efectos: `node library/sfx/synth-sfx.mjs` (una sola vez) y después `node src/videoAnalysis/buildSfxBed.mjs`.
7. Revisión: abrir el Studio (`pnpm dev`), poner un aviso de revisión (solo visible en el Studio) y pedir la valoración del usuario.

## Comprobaciones antes de entregar

- `node src/videoAnalysis/qaEditAudio.mjs --v3`: ningún borde corta voz.
- Fotogramas con la guía de área segura: `COMP=<composición> SAFE=1 node .whisper/tools/stills.mjs out/qa-… <frames>`.
- Pasan `pnpm typecheck`, `pnpm typecheck:library` y `pnpm library:check`.
- En el Studio solo hay dos `<audio>` (voz y efectos) sincronizados, y los planos no programan audio web (`Html5Audio` para las pistas largas).
- Escucha del usuario: cortes, voz y nivel de los efectos.

## Exportación

1. Exportar solo con autorización explícita del usuario y comprobar antes el ID de la composición.
2. Render con Remotion (Studio o `renderMedia`: H.264, JPEG 80).
3. **Corregir el desfase de audio.** El render local codifica el AAC como ADTS y pierde el cebado del codificador: la voz queda 2048 muestras (42,7 ms) por detrás de la imagen. Desde el 2026-10-09 se corrige con un paso automático, **sin recodificar**:

   ```
   node src/videoAnalysis/fixRenderAudioSync.mjs out/<render>.mp4 --out formatos/<formato>/<VIDEO-XXX-tema>/exportaciones/<Video>V<n>.mp4 --ref public/<video>/dialogue.wav --ref public/<video>/sfx.wav --report analysis/<video>-sync.json
   ```

   El script mide el cebado con el ffmpeg de Remotion, comprueba que el tramo que salta es relleno y que las pistas (`--ref`) dan ese mismo desfase, y reescribe solo la lista de edición del audio. Verifica MD5 de paquetes, audio y sonoridad antes de dejar el archivo. Si las pistas no coinciden con el render, se detiene: no se corrige a ciegas. Detalle: `library/README.md` → «Desfase de audio del render».

   Método anterior (manual; recodifica el audio desde las pistas). Queda como respaldo si falta el ffmpeg de Remotion; el script también puede recodificar con `--reencode`:

   ```
   ffmpeg -i <render>.mp4 -i <dialogue>.wav -i <sfx>.wav -filter_complex "[1:a][2:a]amix=inputs=2:dropout_transition=0:normalize=0,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a]" -map 0:v:0 -map "[a]" -map_metadata 0 -c:v copy -c:a aac -b:a 320k -cutoff 18000 -movflags +faststart formatos/<formato>/<VIDEO-XXX-tema>/exportaciones/<Video>V<n>.mp4
   ```

4. Verificar el archivo:
   - fotogramas iguales a los de la timeline;
   - audio sin desfase (0 muestras) e igual a voz + efectos, sin restos de la voz de cámara;
   - −14,7 LUFS aprox.;
   - aspecto correcto en una hoja de fotogramas.
5. Guardar en la carpeta del video, `formatos/<formato>/<VIDEO-XXX-tema>/exportaciones/`, con un nombre nuevo (`<Video>V<n>.mp4`) y sin sobrescribir exportaciones anteriores. Anotarlo en su ficha (`README.md` de esa carpeta) y en el resumen del video. El render de Remotion sale en `out/`; ahí solo es un archivo de paso.

## Límites conocidos

- Las herramientas de `src/videoAnalysis/*V3*` y la composición tienen rutas y nombres de VIDEO-001. Para el siguiente video hay que parametrizarlas por ID, o copiarlas con el ID nuevo, sin tocar las de VIDEO-001.
- Las escenas de motion son propias de cada guion. Se reutilizan las primitivas del kit, no las escenas.
- Al perfil ZevenPRO le faltan la tipografía y el logo de marca (`library/brand/zevenpro.ts → pendiente`).
- La corrección del desfase de audio ya es automática (`fixRenderAudioSync.mjs`), pero solo se ha probado sobre `Video001V4.mp4`; el primer render nuevo debe pasar también la comprobación con `--ref`.
- El área segura es la del orgánico. Si el video se pauta como anuncio, revisar los márgenes de Meta.
