# library/ — catálogo y recetas reutilizables

Capa **aditiva** sobre LIB-001 (`src/components`, `src/presets`). No duplica componentes: los cataloga, añade las pocas recetas que LIB-001 no cubre y deja un lugar único donde saber qué existe antes de crear algo.

La política manda desde `docs/VIDEO-SYSTEM-ROOT.md`; la orden `video-orders/VIDEO-XXX.json` manda sobre el video concreto. Nada aquí cambia los EDIT_TYPE de la RAÍZ.

## Contenido

| Ruta | Para qué |
|---|---|
| `catalog.json` | Registro de los recursos: archivo, referencia (REF-1/2/3), estado y si se puede usar en cada EDIT_TYPE. |
| `recipes/` | Recetas nuevas, todas `candidata`: `ChunkCaptions`, `CutSequence`, `TextBehindSubject`, `KeywordTint`. |
| `brand/` | `BrandProfile` + `BrandProvider` (preset base + overrides que el repo ya soporta) y el perfil `zevenpro` (incompleto). |
| `gallery/Samples.tsx` | Una composición sintética por receta, para verla en Studio. |
| `recipes/SfxTrack.tsx` | Efectos de sonido por frame (candidata). |
| `recipes/TypeCaptions.tsx`, `recipes/tracks.ts` | Subtítulos de lectura + énfasis tipográfico; pistas de cámara y layout por eventos (candidatas, VIDEO-001 V3). |
| `sfx/` | `sfx.json` (6 sonidos CC0 declarada, reglas evento/palabra → sonido, límites), `cues.ts` (genera las señales), `fetch-sfx.mjs` (descarga los archivos a `public/sfx`). |
| `audio/` | `clean-voice.mjs` (limpieza de voz con FFmpeg) y `models/sh.rnnn` (modelo RNNoise). |
| `assets.json` | Manifiesto de procedencia de recursos externos (hoy: el modelo de ruido; los clips y fuentes entran cuando un video los use). |
| `validate.mjs` | Comprueba que el catálogo y el manifiesto son coherentes (sin dependencias). |
| `index.ts`, `Root.tsx` | Entrada de Remotion propia de la biblioteca (independiente de `src/Root.tsx`). |
| `tsconfig.json` | Typecheck de `library/` (incluye `src/` porque lo importa). |

## Comandos

```bash
pnpm library            # Studio solo con las muestras LIB-*
pnpm library:check      # valida catalog.json y assets.json
pnpm typecheck:library  # tsc sobre library/ (el typecheck de src/ no cambia)
```

Voz y sonido (no necesitan instalar nada nuevo; solo FFmpeg y Node ≥ 18):

```bash
node library/audio/clean-voice.mjs ruta/toma.mov --from 5 --to 35   # A/B rápido de 30 s → toma.clean.wav + informe
node library/audio/clean-voice.mjs ruta/toma.mov --mux             # además, video copiado + audio limpio
node library/sfx/fetch-sfx.mjs                                      # baja los 6 sonidos CC0 a public/sfx
```

Un still de una receta (ejemplo):

```bash
pnpm remotion still library/index.ts LIB-ChunkCaptions out/library/chunk-captions.png --frame=30
```

## Regla de alta de un recurso

1. Buscar primero en `catalog.json`, luego en `src/components`, luego en Remotion oficial.
2. Si hace falta uno nuevo, entra como **`candidata`** con su referencia y su fila de enrutamiento.
3. Pasa a **`validada`** solo cuando una orden VIDEO-XXX lo usa y su preview revisada lo confirma; entonces se rellena `validada_en` con esa orden. `pnpm library:check` lo exige.
4. Toda receta de `recipes/` debe estar en el catálogo (el validador falla si no).

## Investigación y alta de recursos externos

La búsqueda de imágenes, videos, capturas, logos, personajes y mascotas se rige por `docs/VIDEO-SYSTEM-ROOT.md`. Cada VIDEO-XXX conserva candidatos, consultas y decisiones en `analysis/<video-id>-support-research.json`; `assets.json` registra únicamente los recursos externos que sí se integran. Estar visible en una web o red social no equivale a tener licencia de reutilización. Ningún recurso con derechos `requiere_revision` puede pasar al render final.

## Enrutamiento por EDIT_TYPE

La columna `edit_types` cubre los cinco formatos operativos: edit-1 HIGH, edit-2 MEDIUM, edit-3 LOW, edit-4-business LOW-MEDIUM y edit-5-creator MEDIUM. Business se revisó contra su `FORMATO.md` el 2026-10-10: rótulos y recursos sobrios para marca, evidencia real y UI de producto digital bajo condición; ya no copia automáticamente otra columna. `si` = uso normal, `condicional` = solo bajo la condición de `nota`, `no` = no encaja. Es enrutamiento técnico, sin aprobación audiovisual. Avatar permanece fuera del catálogo. La orden decide.

## Verificación original de `486cb14` (histórico)

Comprobado:

- `catalog.json` y `assets.json` pasan `pnpm library:check`.
- Las cuatro composiciones LIB-* se registran y se pintan en Chromium sin errores de página.
- El orden de capas de `TextBehindSubject`, el cambio duro y el reinicio del empuje por plano de `CutSequence`, el énfasis de `ChunkCaptions` y el lavado de `KeywordTint` se revisaron en cuadros fijos.

- `clean-voice.mjs` se ejecutó con FFmpeg 6.1.1 sobre 30 s de una grabación de pantalla de referencia (reel de otro autor, no una toma de VIDEO-001): pasó de −12,6 LUFS y 0,0 dBTP a −13,9 LUFS y −1,5 dBTP; probados los rechazos (destino existente, destino = entrada), `--denoise fft`, `--mux` y `--dry-run`.
- `cues.ts` se compiló y se probó con casos propios (adelantos, orden, descarte por cercanía, evento sin regla). `SfxTrack.tsx` pasa tsc contra un sustituto de la API.
- El validador falla con datos de sonido mal puestos (probado rompiéndolos a propósito).

No comprobado:

- **Oído**: nadie ha escuchado todavía el audio limpio ni los efectos; las cifras miden nivel, no timbre, eco ni artefactos del reductor de ruido.
- Las pruebas de audio usaron una grabación de pantalla de Instagram (recodificada), no una toma original.
- `fetch-sfx.mjs` no se pudo ejecutar aquí (el entorno no alcanza remotion.media): falta bajar los archivos y comprobar que `<Audio>` los reproduce en Studio.
- Que el FFmpeg del Mac tenga `arnndn` y `deesser`: comprobar con `ffmpeg -filters | grep -E "arnndn|deesser"`. Sin `arnndn` el script se detiene (no cae en silencio a `afftdn`, que casi no reduce ruido).
- Ejecución con **Remotion real**: las pruebas usaron un sustituto mínimo de la API (npm no era accesible). Los tiempos del `spring` pueden diferir.
- `pnpm typecheck:library` con los tipos reales de React y Remotion 4.0.438.
- Reproducción en Studio, render con audio y comportamiento con material real.
- En ese commit ninguna receta estaba probada en una orden VIDEO-XXX: todas entraron como `candidata`.

## Validación real en VIDEO-001 — 2026-10-02

- `pnpm typecheck`, `pnpm typecheck:library` y `pnpm library:check` pasan con React 19.2.3 y Remotion **4.0.438** reales.
- `ChunkCaptions` y `CutSequence` se usan en `video-orders/VIDEO-001.json` y `src/compositions/VIDEO-001.tsx`. Solo estas dos recetas pasan a `validada`.
- **ChunkCaptions:** 98 bloques de 2–4 palabras, serif Georgia, 68 px, centro Y=1570 px y X=508 px, sin caja, énfasis en cursiva. Se comprobó cada bloque en su primer frame, con opacidad 1 y dentro del área segura. Se eliminó el fade inicial que contradecía el cambio duro. Los tiempos internos son aproximaciones editoriales a partir de frases reales de Gemini, no alineación ASR/fonética.
- **CutSequence:** 24 rangos de presentador, `push:false` y nueva opción `premountFor=45`. El empuje suave de 1→1.025 sigue en la escena exterior. No cambia la zona superior ni solapa voces. Se comprobaron 72 frames antes/en/después de los límites: un único rango visible y ningún frame negro detectado en el presentador.
- La reproducción se probó con un clic real de Play: 193 frames avanzados en una muestra de unos 6 s, todos los muestreos con video decodificado y sin errores de medios. El control Render estaba disponible; **no se ejecutó render final**.
- Evidencias: `analysis/video-001-cut-verification.json` y `analysis/video-001-library-verification.json`. Esto valida el uso técnico/visual en esta composición, **no** la sincronización fonética, la aprobación audiovisual humana ni todas las variantes de las recetas.
- `TextBehindSubject` y `KeywordTint` conservan su estado candidato. El perfil ZevenPRO sigue incompleto. VIDEO-001 sigue siendo una revisión parcial: 8/12 tomas analizadas.

## Recetas nuevas en VIDEO-001 v2 — 2026-10-03 (candidatas)

- **PresenterCamera** (`recipes/PresenterCamera.tsx`): plano horizontal del presentador dentro de la zona inferior con cámara virtual (escala, foco, empuje, alejamiento de entrada, golpes de zoom por palabra) y rampas de volumen de 1 frame. Usa `<Video>` de `@remotion/media` 4.0.438 (fotograma exacto, recomendado por Remotion frente al `<Video>` HTML5). En VIDEO-001 sustituye a CutSequence: cada plano es un `<Sequence>` con su encuadre.
- **FocusPanImage** (`recipes/FocusPanImage.tsx`): zoom/paneo entre regiones de una captura en frames dados y marcas sobre el texto real (subrayador, recuadro, subrayado, foco) que siguen a la cámara. El acercamiento continuo está limitado (`maxDrift`, 5 %) para no recortar tarjetas anchas.
- Ambas pasan typecheck y fotogramas de control; siguen **candidatas** hasta que la preview de VIDEO-001 v2 sea aprobada por el usuario.
- `src/components/CTA.tsx` acepta ahora `buttonTextColor` (opcional): con el preset screen-tutorial y un acento claro, el texto del botón quedaba sin contraste.

## Recetas nuevas en la candidata V3 de VIDEO-001 — 2026-10-04 (candidatas)

Preset experimental `reel-editorial-reforzado` (#edit-2), composición aislada `Video001V3`; la v2 no cambia.

- **TypeCaptions** (`recipes/TypeCaptions.tsx`): subtítulos en dos capas. Lectura: bloques cortos en sans pesada, blancos con sombra y sin caja. Énfasis: bloques asimétricos de 1–3 líneas (tamaños s/m/l/xl con ajuste al ancho, tonos blanco/rosa/rojo, textura opcional por `background-clip:text`) que **sustituyen** a la lectura en sus palabras, sin duplicar la frase. Necesita tiempos por palabra reales.
- **Pistas de cámara y layout** (`recipes/tracks.ts`, funciones puras): escala de cámara por eventos con motivo (push/drift con entrada, permanencia y salida; `inFrames`/`outFrames` = 0 para cambiar justo en un corte) y altura de la zona superior por modo (split / presenter / graphic). Separan cámara y layout de la lista de cortes.
- **PresenterCamera** acepta `scaleOverride` (escala dictada por la pista de cámara), `muted` (la voz va en una pista de diálogo aparte) y `playbackRate` (velocidad de la fuente; `durationInFrames` ya dividido).
- **Pistas de audio largas:** en la vista previa del Studio (Remotion 4.0.438), `<Audio>` de `@remotion/media` programó una pista de diálogo de 3 min dos veces y la voz se oía duplicada (el render estaba bien). Para pistas largas continuas, usar `Html5Audio` de `remotion`.
- **clean-voice.mjs**: corregida la lectura del JSON de `loudnorm` (FFmpeg ≥ 7 imprime `[out#0/null …]` después del JSON y la expresión anclada al final devolvía `null`). Probado sobre la pista de diálogo de V3 (178,8 s): −28,2 → −14,5 LUFS, −4,7 → −1,5 dBTP.

## Identidad ZevenPRO, sonido sintetizado y área segura — 2026-10-04

- **Marca** (`brand/zevenpro.ts`): paleta definida por el usuario (`zevenproPalette`) y overrides del preset (acento amarillo, secundario azul, fondo crema). Reglas: sin fondo oscuro de base; amarillo para énfasis, botones, líneas y marcadores; azul solo para lo digital; rojo con moderación; tarjetas blancas, bordes suaves, sombras ligeras. Falta tipografía de marca y logo.
- **TypeCaptions**: la variante `texture` acepta `emphasisAnchor="bottom"` y `sizes` (para apoyar el énfasis en el límite del área segura) y respeta `left`/`width` en la lectura. Existe una variante `cards` con la paleta de marca, que VIDEO-001 no usa: el usuario prefirió conservar los subtítulos de antes y aplicar la marca solo a los gráficos.
- **FocusPanImage** acepta `shadowColor` (sombra ligera sobre fondos claros).
- **Efectos propios** (`sfx/synth-sfx.mjs`): 22 sonidos de interfaz generados por síntesis, sin material de terceros, registrados en `sfx.json → sintetizados` (el validador exige generador y licencia «propia»). Pensados para sonar por debajo de la voz; validar de oído.
- **Área segura de Instagram Reels (orgánico)**: contenido en x 65–1015, y 250–1500, y nada a la derecha de x = 940 por debajo de y = 1000. Meta solo publica márgenes para anuncios (14 % arriba, 35 % abajo, 6 % lados), más estrictos.

## Formato #edit-2-pantalla-dividida aprobado — 2026-10-04

- El usuario aprobó la V3 de VIDEO-001 (exportada como `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`) como formato de `#edit-2-pantalla-dividida`. Está descrito en `formatos/edit-2-pantalla-dividida/FORMATO.md` y en la entrada `formato-edit-2-pantalla-dividida` del catálogo.
- Pasan a `validada` (`validada_en` VIDEO-001): TypeCaptions (solo la variante `texture`), las pistas de cámara y layout (`tracks.ts`), PresenterCamera, FocusPanImage y los efectos sintetizados (`synth-sfx`).
- Siguen candidatas:
  - la variante `cards` de TypeCaptions;
  - `sfx-pack`, porque sus licencias no se han verificado de forma independiente;
  - `clean-voice`, porque en la V5 la voz es la que entregó el usuario;
  - las recetas que no se usaron.
- ZevenPRO sigue incompleto: faltan la tipografía y el logo.
- El render local de Remotion deja el audio 42,7 ms tarde: codifica el AAC como ADTS y pierde el relleno inicial. La exportación del formato lo corrige volviendo a codificar el audio y copiando el vídeo sin recodificar.

## Desfase de audio del render: `fixRenderAudioSync.mjs` (2026-10-09)

`src/videoAnalysis/fixRenderAudioSync.mjs` es el paso automático tras el render de Remotion que sustituye al arreglo manual de la V5.

- **Causa:** el render local codifica el audio con libfdk_aac en ADTS (`compress-audio.js`, `-f adts`) y lo copia al MP4. ADTS no guarda el cebado del codificador (2048 muestras): la lista de edición del audio queda con `media_time` 0 y el audio suena 42,7 ms tarde.
- **Qué hace (por defecto, sin pérdida):** mide el cebado pasando una señal de prueba por el mismo ffmpeg de Remotion (`@remotion/compositor-*`), comprueba que el tramo que va a saltar es relleno y reescribe solo la lista de edición del audio y las duraciones (4 bytes). No recodifica nada. Con `--reencode` recodifica el audio (AAC 320k, `-cutoff 18000`) copiando el vídeo.
- **Comprobaciones:** MD5 de los paquetes de vídeo y de audio, audio decodificado = original adelantado el cebado, sonoridad igual y, con `--ref`, desfase 0 contra las pistas de la composición. Escribe en `<destino>.partial` y solo renombra si todo pasa; nunca escribe sobre el render.
- **Uso:** `node src/videoAnalysis/fixRenderAudioSync.mjs out/<render>.mp4 --out formatos/<formato>/<VIDEO-XXX-tema>/exportaciones/<Video>V<n>.mp4 --ref public/<video>/dialogue.wav --ref public/<video>/sfx.wav --report analysis/<video>-sync.json`
- **Verificado el 2026-10-09** en `Video001V4.mp4` (sin `--ref`): cebado 2048 → lista de edición con salto de 2048 muestras, paquetes de vídeo y de audio con el mismo MD5, audio decodificado idéntico desplazado, −14,8 → −14,8 LUFS. Con `--ref` las pistas actuales de `public/video-001/v3/` no coinciden con ese render (se rehicieron a las 08:46, después del render de las 08:18), y el script se niega a corregir: es el comportamiento esperado. En `Video001V5.mp4` no hay nada que corregir (su audio ya se recodificó a mano).
- **Hallazgo aparte:** `library/audio/clean-voice.mjs` retrasa la voz unas 480 muestras (10 ms) porque no compensa la latencia de RNNoise. Pendiente de corregir en ese script.

## Audio y sonido

**Voz.** `clean-voice.mjs` aplica pasa-altos 80 Hz → RNNoise (`arnndn`, modelo `sh.rnnn`: voz hablada con ruido de grabación) → EQ suave (−2 dB a 300 Hz, +2 dB a 3,5 kHz) → de-esser → compresor → loudness en dos pasadas a −14 LUFS / −1,5 dBTP → WAV 48 kHz/24 bit. No toca la entrada, rechaza sobrescribirla y escribe un informe antes/después. Los valores del EQ son un punto de partida, no una medición de tu voz. El objetivo por defecto es −14 LUFS (habitual en Reels); los proxies de VIDEO-001 se normalizan a −16 LUFS: elegir uno y usar `--lufs` para igualar.

**Efectos.** Las señales salen de dos fuentes: eventos de la edición (cortes, transiciones, tarjetas, secciones) y palabras con tiempo real (`cues.ts`; `wordsFromAligned` convierte los `*.aligned.json` de whisper del repo, con el mapeo toma → timeline que da la orden). Las reglas viven en `sfx/sfx.json`; `thinCues` descarta las que quedan demasiado juntas para evitar la «lluvia de sonidos». `SfxTrack` las coloca con `<Audio>` + `<Sequence>`. `pnpm library` → `LIB-SfxTrack` reproduce los 6 sonidos y muestra su nombre en el frame en que suenan (descargarlos antes con `fetch-sfx.mjs`). Solo entran sonidos con CC0 declarada; los que Remotion marca como «probablemente OK» y los de marcas, juegos o memes están en `excluidos`.

**Servicios de pago.** No hay ninguno conectado ni hace falta para esto. ElevenLabs (Voice Isolator, generación de efectos) queda como paso opcional: se prueba con una toma real solo si la cadena local no basta, y exige una clave que debe poner el usuario.

## Notas por receta

- **ChunkCaptions** — solo necesita tiempos por bloque (como `PhraseCaptions`, que vive en VIDEO-002 aún sin versionar). `centerY` hay que medirlo en la composición final.
- **CutSequence** — empuje por defecto 1.00 → 1.20, lineal. Salió de medir **un** video de referencia (n = 1): úsalo como punto de partida, no como regla.
- **TextBehindSubject** — necesita un recorte con canal alfa alineado con el fondo. Generarlo es un paso aparte y la herramienta no está elegida. Notas de investigación previa, sin probar aquí: MatAnyone (S-Lab) no es para uso con clientes; SAM 2 es Apache-2.0 pero exige GPU CUDA y el Mac del proyecto es Intel x64 sin CUDA.
- **KeywordTint** — va debajo de los subtítulos (zIndex 30 < 40). Con rostro en cuadro, `peak` bajo.

## Otra marca

Copiar `brand/zevenpro.ts`, cambiar `id`, `name`, `preset` y `overrides` (`accentColor`, `accentSecondary`, `background`, `useSerifHeading`) y envolver la composición con `<BrandProvider brand={...}>`. El perfil de ZevenPRO tiene en `pendiente` los datos que faltan (acento, secundario, tipografía, logo): hasta completarlos equivale al preset base.

## Integrar en el Studio principal (opcional, más adelante)

Las composiciones LIB-* no están en `src/Root.tsx` a propósito: ese archivo cambia con cada video. Cuando se quiera verlas junto a las demás, importar `LibraryRoot` desde `library/Root.tsx` y renderizarlo dentro de `RemotionRoot`.

## Pendiente de decisión

- Tipografía y logo de ZevenPRO (los colores los definió el usuario el 2026-10-04).
- Herramienta de recorte con alfa para `TextBehindSubject`.
- Si el campo `recursos_biblioteca` entra en el esquema de las órdenes VIDEO-XXX (cambio de política: requiere aprobación, no se hizo).
