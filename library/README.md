# library/ — catálogo y recetas reutilizables

Capa **aditiva** sobre LIB-001 (`src/components`, `src/presets`). No duplica componentes: los cataloga, añade las pocas recetas que LIB-001 no cubre y deja un lugar único donde saber qué existe antes de crear algo.

La política manda desde `docs/VIDEO-SYSTEM-ROOT.md`; la orden `video-orders/VIDEO-XXX.json` manda sobre el video concreto. Nada aquí cambia los cuatro EDIT_TYPE.

## Contenido

| Ruta | Para qué |
|---|---|
| `catalog.json` | Registro de los recursos: archivo, referencia (REF-1/2/3), estado y si se puede usar en cada EDIT_TYPE. |
| `recipes/` | Recetas nuevas, todas `candidata`: `ChunkCaptions`, `CutSequence`, `TextBehindSubject`, `KeywordTint`. |
| `brand/` | `BrandProfile` + `BrandProvider` (preset base + overrides que el repo ya soporta) y el perfil `zevenpro` (incompleto). |
| `gallery/Samples.tsx` | Una composición sintética por receta, para verla en Studio. |
| `recipes/SfxTrack.tsx` | Efectos de sonido por frame (candidata). |
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

## Enrutamiento por EDIT_TYPE

La columna `edit_types` sale de la matriz de la RAÍZ (motion: edit-1 HIGH, edit-2 MEDIUM, edit-3 LOW, edit-4 HIGH). `si` = uso normal, `condicional` = solo bajo la condición de `nota`, `no` = no encaja. Es un punto de partida: la orden decide.

## Estado de verificación (lo que se comprobó y lo que no)

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
- Ninguna receta está probada en una orden VIDEO-XXX: por eso todas son `candidata`.

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

- Colores y tipografías reales de ZevenPRO.
- Herramienta de recorte con alfa para `TextBehindSubject`.
- Si el campo `recursos_biblioteca` entra en el esquema de las órdenes VIDEO-XXX (cambio de política: requiere aprobación, no se hizo).
