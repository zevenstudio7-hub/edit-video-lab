# Directriz para Code — Guía v3.0 (producto Hotmart)

Ya están escritos: `formatos/guia/guia.html` (v3.0) y `formatos/guia/pantallas/pantalla-1…6.png`. NO reescribas el texto. Tareas pendientes, en orden:

## 1. Imágenes de muestra con material nuevo (solo imágenes, el texto no cambia)
- Material vertical 1080×1920: `IMG_2722.MOV` (23,7 s) + foto selfie (usar como still con Ken Burns). Ponlos en `GUIA_TOMAS_DIR` (~/Downloads), no en el repo.
- Actualiza `src/compositions/guia/clipSpecs.json` para usar estas tomas en las muestras verticales.
- Para las muestras horizontales (IMG_0001) conserva el color de los nuevos archivos. Paletas medidas:
  - Video: estudio frío azul/violeta, luma p1/10/50/90/99 = .059/.162/.262/.564/.718, sat .269, RGB medio (.32,.307,.357).
  - Foto: terracota cálida, luma p50 .471, sat .438, RGB medio (.562,.419,.301).
- Control de aceptación en horizontales: saturación ≥ 0,9 × original y desvío de tono ≤ 10°. Si falla, baja la intensidad del look o no lo apliques.
- Regenera: `prepareClips.mjs`, `renderSamples.mjs`, `renderLooks.mjs`. Verifica que `build-pdf.mjs` pasa (ids en `muestras.json`, sin "avatar").

## 2. Enlace de descarga
- Rellena `<meta name="skill-url" content="">` en `guia.html` con la URL pública del repo (ZIP). Mientras esté vacío la guía muestra una nota provisional: haz que `build-pdf.mjs` falle si sigue vacío.

## 3. Coherencia de looks
- La guía generaliza los looks (cualquier formato, el usuario puede añadir). `looks.json` (`por_formato`), la RAÍZ y SKILL.md aún tienen looks por defecto por formato. SKILL.md está aprobado: no lo edites; señala la contradicción a Yeison y propón el cambio en `looks.json`/RAÍZ.

## 4. Verificaciones
- Comprueba el comando de Codex (`mkdir -p .agents/skills && cp -R .claude/skills/video-lab .agents/skills/`) y el paso "Prepara el laboratorio" contra el README del repo.
- Reconstruye el PDF: `node formatos/guia/build-pdf.mjs`. Revisa barra lateral (oculta en impresión), pie y saltos de página.
- Opcional: animar las 6 pantallas en Remotion. Actualiza `formatos/guia/README.md`.
- No hagas commit/push sin que Yeison lo pida.
