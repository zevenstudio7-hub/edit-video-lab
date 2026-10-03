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
| `assets.json` | Manifiesto de procedencia de recursos externos. Vacío hasta que un video use uno. |
| `validate.mjs` | Comprueba que el catálogo y el manifiesto son coherentes (sin dependencias). |
| `index.ts`, `Root.tsx` | Entrada de Remotion propia de la biblioteca (independiente de `src/Root.tsx`). |
| `tsconfig.json` | Typecheck de `library/` (incluye `src/` porque lo importa). |

## Comandos

```bash
pnpm library            # Studio solo con las muestras LIB-*
pnpm library:check      # valida catalog.json y assets.json
pnpm typecheck:library  # tsc sobre library/ (el typecheck de src/ no cambia)
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

No comprobado:

- Ejecución con **Remotion real**: las pruebas usaron un sustituto mínimo de la API (npm no era accesible). Los tiempos del `spring` pueden diferir.
- `pnpm typecheck:library` con los tipos reales de React y Remotion 4.0.438.
- Reproducción en Studio, render con audio y comportamiento con material real.
- Ninguna receta está probada en una orden VIDEO-XXX: por eso todas son `candidata`.

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
