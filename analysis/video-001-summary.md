# VIDEO-001 — análisis y montaje para revisión

ESTADO ACTUAL: PREVIEW v2 (2026-10-03, composición `Video001`) + CANDIDATA V3 (2026-10-04, composición `Video001V3`). El usuario dio el visto bueno a la V3 combinada, se exportó como `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4` y quedó definida como formato de `#edit-2-pantalla-dividida` (2026-10-04; `formatos/edit-2-pantalla-dividida/FORMATO.md`, ver «Exportación V5»).
Duración: 179,97 s (5399 frames a 30 FPS) · 43 planos de 11 tomas · 26 apoyos en la zona superior · 143 bloques de subtítulos.
Carpeta del proyecto: `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/`. Tiene la ficha, las exportaciones (v2, V3, V4 y V5), la voz mejorada que entregó el usuario (`material/`) y las capturas de control (`revision/`, antes en `out/qa-*`).
Contrato: `video-orders/VIDEO-001.json` (`edl` = decisiones; `timeline` = resuelto por `node src/videoAnalysis/buildEdit.mjs`). La v1 está en `video-001-order-before-v2.json` y su historial sigue más abajo.

## Candidata V3 — 2026-10-04 (preset experimental `reel-editorial-reforzado`, #edit-2)

Composición aislada `Video001V3`; la v2 no cambia (`edl`/`timeline` de primer nivel, 5399 frames). Datos: `video-orders/VIDEO-001.json → candidatoV3` (`edl` = decisiones con motivo; `timeline` = resuelto). Dirección: `DIRECCION-VIDEO001-V3.md` (proyecto de revisión del usuario) y las tres referencias tipográficas.
Duración: 162,8 s (4885 frames a 30 fps; velocidad 1.1x pedida el 2026-10-04; a 1x eran 179,1 s) · 41 planos de 11 tomas · 21 escenas arriba (16 de motion semántico + 5 evidencias reales) · 130 bloques de lectura + 14 énfasis tipográficos · 7 eventos de cámara · 4 cambios de layout · 11 efectos.

### Formato final — 2026-10-04 (efectos de sonido, identidad en los gráficos, área segura y voz entregada)
- **Voz**: la sustituye el audio corregido por el usuario (`formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/material/audio samsum aaple-enhanced-v2.mp3`, sin ruido) sobre esta misma timeline a 1.1x. Llegaba 78 ms tarde respecto al montaje (medido por correlación de ataques, constante en todo el archivo): se adelanta 78 ms (sincronía comprobada: 0 ± 2 ms), se ajusta a la longitud exacta y se normaliza a −14,7 LUFS / −1,48 dBTP con loudnorm (modo dinámico: el pico del original no permitía hacerlo lineal; rango 3,3 → 2,8 LU). Sin RNNoise ni EQ (`buildDialogueTrack.mjs`, modo «audio entregado»; `audio.dialogueSource` en la orden).
- **Identidad ZevenPRO solo en los gráficos en movimiento** (`library/brand/zevenpro.ts`): fondo claro crema → azul en la zona gráfica, tarjetas blancas con borde suave y sombra ligera, línea amarilla entre zonas, botón «Seguir» amarillo. Las 21 escenas usan amarillo para lo que se destaca, azul solo para lo digital (pantallas, recuadros de capturas, confianza) y rojo solo en el «=» de la copia. **Los subtítulos conservan el estilo anterior** (lectura blanca sin caja; 14 énfasis con textura rosa/roja), por decisión del usuario.
- **Área segura de Instagram Reels** (orgánico): gráficos en y 250–776; lectura centrada en 1438 y énfasis apoyado en 1480 (tamaños 66/96/128/160 px, algo menores que antes para caber), ancho hasta x = 940; CTA en el pecho (1170–1260); el presentador sube para que la barbilla quede encima de los subtítulos. En el gráfico a pantalla completa, una sombra inferior bajo la franja de subtítulos mantiene legible el texto blanco. El aviso de revisión solo aparece en el Studio. Guía visual: `showSafeArea` en las props de `Video001V3` (capturas con la guía: `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/revision/qa-v3-safe`). Si el video se va a pautar como anuncio, Meta pide márgenes mayores (14 % arriba, 35 % abajo).
- **Sonido**: 103 efectos, uno por cada aparición de motion, movimiento y texto destacado, elegidos por lo que se dice (diseño en `candidatoV3.edl.sfxDesign`): madera para cubos y tablas, campana para valor y logros, subida para «arriba», caída para lo que se derrumba, desenchufe para el conector, mecánico para la batería, sello para «copiado», alerta para los puntos críticos, marcador para los subrayados, obturador para las capturas, pasos para el cliente que cruza. 22 sonidos propios sintetizados (`library/sfx/synth-sfx.mjs`) + obturador y clic CC0. Una sola pista (`buildSfxBed.mjs` → `public/video-001/v3/sfx.wav`): pico −6 dBFS con limitador local, lo más fuerte ~6 dB por debajo de la voz; textos destacados +3 dB, apariciones +1 dB, movimientos sutiles.
- Verificado: render de un tramo con una sola voz (la entregada) y los efectos debajo; Studio con dos pistas (voz y efectos) sin programación duplicada; typecheck y librería válidos; capturas con y sin guía de área segura.
- Pendiente de oído: nivel y carácter de los efectos (generados y medidos, no escuchados) y el resultado de la normalización sobre la voz entregada.

### Exportación V5 — 2026-10-04
- **Formato**: el usuario definió esta edición como el formato de `#edit-2-pantalla-dividida`. Queda descrito en `formatos/edit-2-pantalla-dividida/FORMATO.md`, enlazado desde la RAÍZ, la skill `video-lab` y el comando de Gemini. En el catálogo, las recetas usadas pasan a `validada` y el formato tiene su propia entrada. En la orden, `candidatoV3.estado = aprobada-exportada`, sin aviso de revisión en el Studio.
- **Archivo**: `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4` (1080×1920, 30 fps, 4885 frames, 162,83 s; H.264 + AAC 48 kHz estéreo; 94,3 MB), exportado desde la composición `Video001V3`. Los nombres V3/V4/V5 de `out/` son de archivo, no de composición: `Video001V3.mp4` = versión anterior a 1x; `Video001V4.mp4` = render de las 08:18 con los subtítulos en tarjetas y la voz RNNoise; `Video001V5.mp4` = motion ZevenPRO + subtítulos con textura + voz entregada + efectos.
- **Una sola voz**: la composición solo tiene dos pistas (`dialogue.wav` = voz entregada, `sfx.wav` = efectos); los planos de cámara van silenciados (`muted`, volumen 0). En el render completo, el audio es exactamente voz + efectos (correlación 1,0000; residuo −49,5 dB; correlación del residuo con la voz de cámara 0,007). Control con la voz de cámara añadida a propósito: residuo −15,5 dB y correlación 0,986, así que la prueba la detectaría. La voz entregada no trae eco ni copias: frente a la voz de cámara tiene un único pico de correlación de forma de onda y su autocorrelación es igual a la de la voz original. Studio: dos `<audio>` sincronizados y ningún fragmento de audio web de los planos.
- **Desfase del render de Remotion corregido**: el render local codifica el AAC como ADTS (`compress-audio.js`, `-f adts`) y se pierde el relleno inicial del codificador; en el MP4, el audio queda 2048 muestras (42,7 ms) por detrás de la imagen. Pasa también en `Video001.mp4`, `Video001V3.mp4` y `Video001V4.mp4` (lista de edición del audio sin salto). En la V5, el vídeo se copia sin recodificar del render (mismo MD5 de paquetes) y el audio se recodifica desde las mismas pistas, con la misma mezcla de Remotion (suma `amix normalize=0`, paso a estéreo a −3 dB por canal, AAC 320k con corte de 18 kHz) y una lista de edición correcta: desfase de 0 muestras, −14,7 LUFS, pico −3,5 dBFS, LRA 2,5 LU.
  `ffmpeg -i <render>.mp4 -i public/video-001/v3/dialogue.wav -i public/video-001/v3/sfx.wav -filter_complex "[1:a][2:a]amix=inputs=2:dropout_transition=0:normalize=0,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a]" -map 0:v:0 -map "[a]" -map_metadata 0 -c:v copy -c:a aac -b:a 320k -cutoff 18000 -movflags +faststart formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`
- **Paso automático (2026-10-09):** `src/videoAnalysis/fixRenderAudioSync.mjs` sustituye al comando anterior para los próximos renders. No recodifica: mide el cebado con el ffmpeg de Remotion y reescribe solo la lista de edición del audio. Probado sobre `Video001V4.mp4`: desfase 2048 → 0 muestras, MD5 de los paquetes de vídeo y de audio iguales, −14,8 → −14,8 LUFS. Detalle y uso: `library/README.md` → «Desfase de audio del render». Aparte: `library/audio/clean-voice.mjs` retrasa la voz ~480 muestras (10 ms) por la latencia de RNNoise sin compensar.

### Ajustes del 2026-10-04 (pedido: «la voz se duplicó» y «velocidad 1.1x»)
- **Voz duplicada en la vista previa.** Causa medida en el Studio: con `<Audio>` de `@remotion/media`, la pista de diálogo larga se programaba dos veces solapadas (~1 s de desfase); los planos de video, silenciados, no aportaban audio y el render no la duplicaba (comprobado: una sola voz). La pista se reproduce ahora con `Html5Audio` de `remotion` (un solo `<audio>`): en reproducción hay un único elemento sonando y ningún fragmento de audio web programado.
- **Velocidad 1.1x.** Los planos se reproducen a 1.1x (`playbackRate`) y la pista de diálogo se acelera con Rubber Band conservando tono y formantes; todos los tiempos (palabras, énfasis, escenas, cámara, layout, efectos, CTA) se recalculan sobre la timeline acelerada (`edl.speed` en `buildEditV3.mjs`). Sincronía de la voz acelerada comprobada en 7 puntos (0–10 ms). Las animaciones y transiciones no se aceleran; el paso del puente se acortó para terminar dentro de su escena.
- La pista limpia se ajusta a la longitud exacta de la timeline y termina con un fundido de 30 ms (un final seco provocaba un chasquido en la última muestra al limpiar): −14,8 LUFS, −1,5 dBTP.
- QA a 1.1x (`qaEditAudio.mjs --v3`): diferencia de palabras 6,4 % (4,8 % a 1x), 0 bordes con voz cortada; las nuevas diferencias son confusiones del transcriptor con habla más rápida. Escuchar especialmente v05 («se burlaba… abrazados a una pared»), donde se agrupan.
- `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V3.mp4` (render lanzado desde el Studio a las 07:17) es la versión anterior a 1x; la exportación vigente es `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`.

### Qué cambia frente a la v2
- **Cortes.** Los planos contiguos de una misma toma se unen conservando la pausa natural; solo se corta para quitar contenido o pausas largas dentro de frase (seis de 0,53–0,73 s quedan en ~0,2 s). Cada borde se revisó con energía de banda completa y de agudos (>3 kHz) y cada plano se transcribió exacto. Defectos heredados de la v2 corregidos: «2014» arrastraba el inicio de «o por lo menos» (v03); se perdía el «que» de «aún es que» (v12); la «s» final de «Paredes» quedaba fuera (v04) y también la vocal final de «después» (v19) y la «s» de «servicios» (v26b); varias «s» iniciales empezaban recortadas («Su», «sus», «sino», «sabe», «Si»). Se quitó una «e» de vacilación antes de «decir» (v22).
- **Cámara estable** (escala 1) con 7 eventos con motivo, entrada, permanencia y salida: gancho, tesis, revelación («se han copiado»), detalle del post, contraste («mira cómo lo hacemos nosotros»), argumento central y cierre. Tres coinciden con un corte de la misma toma para que el salto se lea como acercamiento/apertura (k2, k5, k6).
- **Layout por función:** presentador a pantalla completa en el arranque del gancho y en el cierre; gráfico completo solo para la evidencia de la ironía (titular de 9to5Mac leído de cerca); split en el resto.
- **Arriba, objetos y acciones en lugar de frases:** el producto sube por encima de otras marcas, balanza cantidad/valor, la batería sale, el conector desaparece, el cargador sale de la caja, Samsung retira auriculares y cargador, columnas Apple/Samsung con «=», medalla «1º», recorridos (llegar primero / llegar después), bisagra que ensambla, carrera, acumulación que no sube el valor, puente de confianza/valor/percepción/experiencia, pieza que encaja, reloj de arena. Evidencias reales con marcador sincronizado: anuncio «Wall Huggers» (2014), página de batería de Apple, 9to5Mac (2020), nota de Apple del iPhone Duo y post de @samsungmobilemx.
- **Subtítulos en dos capas** (`library/recipes/TypeCaptions.tsx`): lectura en Inter Tight 800 blanca sin caja, en bloques equilibrados de ≤5 palabras; 14 énfasis tipográficos asimétricos (rosa/rojo con textura, tamaños s–xl) elegidos por sentido que **sustituyen** a la lectura en sus palabras (no se repite la frase).
- **Tiempos por palabra afinados** (`src/videoAnalysis/refineWordTimesV3.mjs`): alineación forzada por sílabas (núcleos vocálicos en la energía de banda vocal + DP), con el DTW de whisper solo como referencia; los tiempos proporcionales de la v2 se desviaban hasta ±0,5 s y el DTW solo, ±0,25 s.
- **Pista de diálogo continua** (`src/videoAnalysis/buildDialogueTrack.mjs`): audio original, cortes por muestra (1600 muestras por frame), microrrampas de 6 ms (15 ms y 10 ms en tres bordes dentro de voz) y `library/audio/clean-voice.mjs`: −28,2 → −14,5 LUFS, −1,5 dBTP. Queda `dialogue-raw.wav` para A/B.
- **Sonido:** 11 efectos CC0 de `library/sfx` ligados a acciones (ganancia 0,26–0,45; picos de −9 a −15 dBFS), ninguno por corte ni por subtítulo.

### Verificación
- Los 41 planos transcritos uno a uno se oyen completos. Alertas restantes revisadas: «Es decir» en v22 y «El que» en v17b son artefactos de transcribir aislado (con contexto o en fragmentos más cortos no aparecen); «información» en v28 es una alucinación sobre el silencio final; «O sea» en v30b contradice la energía (s-a-b-e sin vocal previa).
- QA de la pista limpia (`qaEditAudio.mjs --v3` → `video-001-v3-qa-audio.json`): diferencia de palabras 4,8 % frente a los subtítulos, 0 bordes con voz cortada; las diferencias son variantes del transcriptor (marcas, «atreven/atraen») y una alucinación al final del archivo.
- 113 fotogramas de control (`formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/revision/qa-v3`, `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/revision/qa-v3-final`): escenas, énfasis, cortes con cámara, evidencias y CTA. `pnpm typecheck`, `typecheck:library` y `library:check`: OK. Studio: `Video001V3` carga sin errores.
- Tabla de revisión de oído por plano: `video-001-v3-cut-review.csv` (texto, lo que oyó whisper en el plano exacto y motivo de cada borde).

### Pendiente (revisión humana)
- Escuchar la pieza completa en Studio: uniones, rampas y nivel de los 11 efectos (no se han escuchado; solo se midieron).
- v02a: «un producto, un servicio» (Gemini y montaje v2) frente a «un producto o un servicio» (whisper en dos pasadas).
- v16: posible arrastre entre «Pero» y «mi» (la transcripción completa oye «Pero venga»). v24: «empresarios» (whisper oye «empresariales»). v18: «atreven/atrevimos» se subtitula como el post.
- v13 empieza dentro de una «s» continua («veintitrés | Samsung»): inaudible en las transcripciones y cubierto por el layout gráfico; confirmar de oído.
- Render final: no ejecutado; requiere aprobación.

## Revisión v2 — 2026-10-03

### Qué cambió frente a la v1
- **Cobertura completa del material.** Las 12 tomas se transcribieron en local con whisper.cpp 1.7.2 + large-v3-turbo (paquete oficial `@remotion/install-whisper-cpp` 4.0.438); Gemini analizó 11/12 (ffe3… quedó fuera por la cuota diaria, cubierta por whisper). Las 4 tomas que faltaban aportan el iPhone Duo y la respuesta de Samsung Mobile MX (ac101), el cargador en 2020 (b1eb), el giro «Samsung puede decir que llegó primero» (e7648) y el cierre (ffe3).
- **Narrativa según el guion**, con lo realmente dicho: gancho → tesis → 2014 «Abraza Paredes» → batería → 2016 → 2020 → ironía (Samsung también quita cargador) → iPhone Duo y post de Samsung → primero vs. diferente → cómo presenta Apple el Duo → obsesión por ser primero → qué compra el cliente → cierre → CTA.
- **Cortes y uniones.** Fronteras en pausas medidas por energía (islas RMS de 10 ms) y comprobadas transcribiendo cada fragmento y cada unión entre tomas. Se quitaron silencios, falsos inicios, el lapsus «Samsung acaba de lanzar el nuevo iPhone Duo», «en 2023» (dato erróneo), «de de», «etcétera ×3», «eh» y colas ininteligibles. Lista completa en la orden (`tomas.fragmentosExcluidos`).
- **Zoom in/out y motion por palabra.** `PresenterCamera` alterna encuadres (wide/medium/close) entre planos para disimular los saltos, con empujes lentos, alejamientos al abrir bloque y golpes de zoom en palabras clave. `FocusPanImage` hace zoom a regiones de las capturas y marca el texto real (subrayador, recuadro) en el momento en que se nombra.
- **Zona superior con la captura del usuario** (pizarra de Canva): página de batería de Apple con sus flechas («Reparación de la batería 135 €»), post de @samsungmobilemx («El mundo es de los que se atreven primero. Nosotros nos atrevimos hace 7 años»), iPhone Duo y Galaxy Z Fold. Se corrige la etiqueta de la v1: la imagen del Duo coincide con la oficial de Apple (nota del 9-9-2026), no es un concepto.
- **Referencias web verificadas:** Apple Newsroom (iPhone Duo, 9-9-2026), iPhone in Canada y MacRumors (campaña «Wall Huggers», 2014), 9to5Mac (Samsung quita el cargador tras burlarse, 7-12-2020). Fotos libres de Wikimedia Commons (CC BY-SA 4.0, con atribución en pantalla). Procedencia: `video-001-support-assets.json` y `library/assets.json`.
- **Proxies 1920×1080** (antes 1280×720 ampliados 1,6×), audio normalizado a −16 LUFS. Preview con `<Video>` de `@remotion/media` (fotograma exacto).
- **Duración ≤ 3:00** para que valga como Reel y Short.

### Verificación
- `pnpm typecheck`, `pnpm typecheck:library`, `pnpm library:check`: OK.
- Audio del montaje (`node src/videoAnalysis/qaEditAudio.mjs` → `video-001-qa-audio.json`): 179,85 s; diferencia de palabras 2,7 % frente al texto previsto (ambigüedades del transcriptor y normalizaciones registradas en `correcciones`); 0 bordes con voz cortada (umbral: suelo + 12 dB en los 40 ms extremos). Este control detectó y corrigió un final cortado («valor», c35) y una «o» perdida (c40).
- Fotogramas de control renderizados de toda la pieza (cada 6 s y en cada apoyo): maquetación, marcas sobre texto, créditos y subtítulos revisados.
- Remotion Studio: Video001 carga y reproduce (canvas 1920×1080 decodificado, sin errores de consola). En este Mac Intel la preview avanza al ~78 % de tiempo real; no afecta al render.

### Pendiente
- Revisión auditiva humana de: «atreven/atrevimos» (c24, se subtitula como el post), «aterradora» (c30), «sus productos, sus teléfonos» (c08b) y el CTA (se omite en subtítulo una muletilla dudosa).
- Opcional: recuperar el teaser «cuando llegue el iPhone Duo vamos a probarla aquí» (ffe3 46,6–48,3 s), fuera por duración y por no estar confirmado de oído.
- Render final: no ejecutado; requiere aprobación.
- **No ejecutar `pnpm analyze-video` sin `--take=`**: el modo completo regenera `video-orders/VIDEO-001.json` desde Gemini y sobrescribiría la v2. Los scripts de la v1 (`applyLibraryVideo001`, `finalizeEdit`, `refinePacing`, `validateEdit`, `verifyLibraryVideo001`…) esperan el esquema antiguo con `scenes`.

## Historial v1

ESTADO v1: PROVISIONAL, INCOMPLETO POR CUOTA DIARIA DE GEMINI.
Modelo fijado: gemini-3.6-flash. Analizadas: 8/12 tomas + grabación de pantalla. Duración de este montaje: 124.93 s (3748 fotogramas a 30 FPS).

## Comparación editorial

MONTAJE PROVISIONAL: ocho de doce tomas analizadas con Gemini. La cuota diaria impide analizar las cuatro restantes. Selección editorial basada en los datos reales disponibles, priorizando fidelidad, eliminación de falsos inicios, fluidez, inteligibilidad de audio y continuidad. La calidad visual, encuadre y expresión mantienen las limitaciones de la grabación; se corrige la orientación. Falta confirmar cobertura y mejores alternativas de auriculares, introducción del plegable y cierre del guion. El CTA final es material grabado fuera del guion y se usa solo como cierre provisional. No equivale a VIDEO-001 terminado.

## Rangos seleccionados

| Escena / corte | Fuente | Entrada | Salida | Bloque |
|---|---|---:|---:|---|
| 1.1 | 1071a10986d4473fab0f545091431ee2.MP4 | 2.533 | 10.800 | Apertura: posicionamiento de marca |
| 1.2 | 1071a10986d4473fab0f545091431ee2.MP4 | 10.933 | 11.200 | Apertura: posicionamiento de marca |
| 2.1 | 1071a10986d4473fab0f545091431ee2.MP4 | 21.000 | 26.367 | No siempre tienes que dar más |
| 2.2 | 1071a10986d4473fab0f545091431ee2.MP4 | 26.533 | 29.767 | No siempre tienes que dar más |
| 3.1 | 595d143df4df4001b7f25feb100d1df1.MP4 | 11.200 | 21.200 | Samsung y la batería en 2014 |
| 3.2 | 595d143df4df4001b7f25feb100d1df1.MP4 | 21.400 | 22.200 | Samsung y la batería en 2014 |
| 4.1 | 595d143df4df4001b7f25feb100d1df1.MP4 | 34.000 | 43.500 | El argumento de la batería intercambiable |
| 5.1 | 25b212d80cdc44b1964cc6b2e152e9cf.MP4 | 3.800 | 11.800 | Auriculares y cargadores |
| 6.1 | 25b212d80cdc44b1964cc6b2e152e9cf.MP4 | 45.067 | 51.267 | Decisiones que después adopta Samsung |
| 6.2 | 25b212d80cdc44b1964cc6b2e152e9cf.MP4 | 51.400 | 55.200 | Decisiones que después adopta Samsung |
| 7.1 | 1a6a3dcea3b6473caad383a7d6a076f1.MP4 | 23.000 | 32.500 | Llegar primero frente a hacerlo diferente |
| 8.1 | 1a6a3dcea3b6473caad383a7d6a076f1.MP4 | 37.500 | 45.000 | La presentación del Duo en el discurso |
| 9.1 | 5fd399dccff74959baa046f8d2c45050.MP4 | 1.500 | 14.500 | La obsesión por ser los primeros |
| 10.1 | 5fd399dccff74959baa046f8d2c45050.MP4 | 14.500 | 20.000 | Agregar más servicios y características |
| 11.1 | 5fd399dccff74959baa046f8d2c45050.MP4 | 32.000 | 35.000 | Lo que necesita el cliente |
| 11.2 | 5fd399dccff74959baa046f8d2c45050.MP4 | 35.233 | 38.000 | Lo que necesita el cliente |
| 12.1 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 1.200 | 7.800 | Valor, confianza y experiencia |
| 12.2 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 8.400 | 11.433 | Valor, confianza y experiencia |
| 12.3 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 11.600 | 16.800 | Valor, confianza y experiencia |
| 13.1 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 21.500 | 21.700 | Una solución con valor real |
| 13.2 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 21.967 | 23.433 | Una solución con valor real |
| 13.3 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 24.200 | 26.400 | Una solución con valor real |
| 13.4 | a55db7a6e9a94b999d680a2912b19f55.MP4 | 26.633 | 32.000 | Una solución con valor real |
| 14.1 | 136ecbbf804041dfa4bf6e6d4c64538f.MP4 | 29.833 | 34.000 | CTA grabado fuera del guion; cierre provisional |

## Tomas descartadas

- 2eff061b16754ce896239dade75e3c9d.MP4: Copia audiovisual verificada de 1071a10986d4473fab0f545091431ee2.MP4; no aporta otra interpretación ni otra ejecución.

## Pendientes de análisis

- ac101fa5da344fc3b1c2f135b14ff93c.MP4
- b1eb53d64406404f95a673182fe597fd.MP4
- e7648b9b117b45218bd4bac13da69698.MP4
- ffe3314cd47f4f4293b8bfc328054b4b.MP4

## Apoyos visuales

- Escena 1: remotion-component; Posicionamiento de marca
- Escena 2: remotion-component; Más cosas ≠ más valor
- Escena 3: remotion-component; 2014 · La batalla por la batería
- Escena 4: remotion-component; Una batería que podías cambiar
- Escena 5: remotion-component; Auriculares. Cargadores. Percepción.
- Escena 6: remotion-component; La competencia también cambia
- Escena 7: screen-recording; Publicación de Samsung Mobile MX sobre haber llegado primero, con referencia visible al Galaxy Fold de 2019. El reproductor incrustado muestra carga; no usarlo como demostración funcionando.
- Escena 8: screen-recording; Imagen conceptual de un teléfono plegable bajo la etiqueta 2026 dentro del tablero aportado. No identifica un lanzamiento oficial.
- Escena 9: remotion-component; La obsesión por ser primero
- Escena 10: remotion-component; Agregar más
- Escena 11: remotion-component; ¿Más… o mejor?
- Escena 12: screen-recording; Vista estable del concepto de plegable a la izquierda y la imagen de otro plegable sostenido con las manos a la derecha; sirve para comparar presentación visual, no para probar especificaciones.
- Escena 13: remotion-component; ¿Qué valor real ofreces?
- Escena 14: remotion-component; Comparte esta reflexión

## Trazabilidad y revisión

Tiempos interpretados por Gemini, cuantizados a 30 FPS para edición y validados contra duración del contenedor. Revisión audiovisual en Studio requerida.

Los originales no se modifican. Los proxies H.264 corrigen orientación para Studio. No se ha hecho render final. La presencia de una afirmación en el guion o una imagen en la captura no constituye verificación externa de esa afirmación.

## Ajuste de ritmo y motion — 2026-10-01

- Duración anterior: 128,90 s. Duración tras revisión 1: 126.17 s. Reducción: 2.73 s en 9 pausas medidas.
- Se mantienen 14 escenas editoriales, con 23 rangos de presentador en esta revisión. Los subtítulos se retiman con la misma transformación.
- Detector RMS en ventanas de 20 ms: el ruido de fondo impedía usar silencedetect por picos como único criterio. Se protegen al menos 133 ms a cada lado del tramo retirado. Los resultados son candidatos acústicos revisables, no alineación fonética certificada.
- Los siete proxies de presentador no contienen intervalos negros según blackdetect al 98% de píxeles y 0,05 s mínimos.
- Premontaje de 45 frames (1,5 s) y 26 fotogramas reales de respaldo cubren la carga inicial/seek. Títulos visibles desde el primer frame; spring, marcadores y progreso, sin fundidos a negro ni superposición de voces.
- Primitivas oficiales: https://www.remotion.dev/docs/spring y https://www.remotion.dev/docs/sequence#premountfor; código base: https://github.com/remotion-dev/remotion. Se conserva Remotion 4.0.438; no se migra de versión.
- Plan anterior conservado en video-001-order-before-pacing.json. No se han tocado originales, credenciales ni los ocho análisis de Gemini. No hay render final.

## Correcciones de biblioteca — 2026-10-02

- Referencia inspeccionada: feat/library, commit 486cb14f2d95854c1fe8f5b70a17644378db6a2f. No se fusiona la rama ni se reemplaza la RAÍZ.
- Duración actual: 124.93 s / 3748 frames. 5 ajustes adicionales de pausa reducen 1.23 s; total retirado desde el primer plan: 3.97 s. Se reutilizan las mediciones existentes, protegiendo 100 ms junto a la voz.
- 14 escenas, 24 rangos reales. CutSequence solo organiza la zona del presentador con corte duro y premountFor=45. Se mantienen los apoyos superiores sin fade de la composición.
- 98 bloques de 2–4 palabras con ChunkCaptions: Georgia/serif, 68 px, centro vertical 1570 px, sin caja, énfasis en cursiva y opacidad 1 desde el primer frame. No se atribuye el acento existente a una marca ZevenPRO aprobada.
- El texto procede de las transcripciones de Gemini existentes. El reparto temporal dentro de cada frase es proporcional/editorial, no ASR ni alineación fonética. Necesita revisión auditiva fina. No se reescriben los ocho análisis originales.
- Evidencia técnica de cortes: video-001-cut-verification.json. Evidencia de estilo/reproducción: video-001-library-verification.json. Los resultados técnicos no equivalen a aprobación audiovisual humana.
- Respaldo de orden anterior: video-001-order-before-library.json. 27 posters referenciados en el plan actual; no se borran los anteriores. Sin render final.
