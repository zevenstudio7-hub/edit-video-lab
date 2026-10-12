# VIDEO-001 — Apple vs. Samsung

- **Formato:** `#edit-2-pantalla-dividida`. Este video es la referencia del formato aprobado (`../FORMATO.md`).
- **Objetivo:** explicar con el caso Apple vs. Samsung que posicionar no es llegar primero ni dar más, sino construir valor, confianza y suficientes razones de compra.
- **Estado:** aprobado por el usuario y exportado el 2026-10-04.
- **Exportación vigente:** `exportaciones/Video001V5.mp4`. Dura 2:43 (4885 frames) a 1080×1920 y 30 fps.
  - Imagen: motion con la paleta ZevenPRO, subtítulos con textura, área segura de Reels y velocidad 1.1x.
  - Sonido: la voz mejorada que entregó el usuario más los efectos, con el audio sincronizado (corrección del desfase AAC) a −14,7 LUFS.

## Versiones (`exportaciones/`)

| Archivo | Versión | Qué tiene | Fecha |
|---|---|---|---|
| `Video001.mp4` | v2 (composición `Video001`) | primera versión completa, 3:00 | 2026-10-03 |
| `Video001V3.mp4` | V3 a 1x | motion con los colores anteriores, subtítulos con textura y aviso de revisión grabado en la imagen; 2:59 | 2026-10-04 07:17 |
| `Video001V4.mp4` | V3 a 1.1x con la marca en todo | motion ZevenPRO pero con los subtítulos en tarjetas (descartados) y la voz limpiada con RNNoise; 2:43 | 2026-10-04 08:18 |
| `Video001V5.mp4` | **final** | motion ZevenPRO, subtítulos con textura, voz entregada y efectos, audio sincronizado; 2:43 | 2026-10-04 21:42 |

Las versiones anteriores a la V5 llevan la voz unos 43 ms por detrás de la imagen (el desfase del render de Remotion, que solo se corrigió en la V5).

## Material (`material/`)

- `audio samsum aaple-enhanced-v2.mp3`: la voz mejorada (sin ruido) que entregó el usuario. La composición no lo lee directamente: usa su versión alineada (−78 ms) y normalizada, `public/video-001/v3/dialogue.wav`, que genera `src/videoAnalysis/buildDialogueTrack.mjs`.

## Revisión (`revision/`)

| Carpeta | Qué contiene |
|---|---|
| `qa-v2`, `qa-v4` | fotogramas de control de la etapa v2 (2026-10-03) |
| `qa-v3`, `qa-v3-final` | V3 a 1x |
| `qa-v3-11x` | paso a 1.1x |
| `qa-v3-brand`, `qa-v3-clean` | prueba con la marca en todo y los subtítulos en tarjetas (la que se exportó como V4) |
| `qa-v3-final2` | aspecto final (`hoja-final.jpg`) |
| `qa-v3-safe` | guía del área segura (`hoja-area-segura.jpg`) |
| `qa-v3-comparacion` | V3, V4 y la versión final, lado a lado |

## Archivos técnicos

No se mueven de su sitio: las herramientas los leen ahí.

- **Orden:** `video-orders/VIDEO-001.json`. La v2 está en `edl`/`timeline`; la versión final, en `candidatoV3` (`estado: aprobada-exportada`).
- **Composiciones:**
  - `src/compositions/video001v3/`: `Video001V3`, la final.
  - `src/compositions/VIDEO-001.tsx` y `video001/`: la v2.
  - `src/compositions/Video001Motion.tsx`: experimento anterior, sin registrar.
- **Tomas originales:** `raw-material/video-001/`, con 12 tomas y la grabación de pantalla de la pizarra.
- **Recursos de Remotion:** `public/video-001/` (proxies, capturas, voz `v3/dialogue.wav`, efectos `v3/sfx.wav` y texturas).
- **Análisis y resumen:** `analysis/video-001-summary.md` y `analysis/video-001-*` (tiempos por palabra, revisión de cortes, voz y efectos).
- **Herramientas:** `src/videoAnalysis/`: `refineWordTimesV3.mjs`, `buildEditV3.mjs`, `buildDialogueTrack.mjs`, `buildSfxBed.mjs` y `qaEditAudio.mjs`.
- **Studio:** `pnpm dev` → http://localhost:3000/Video001V3
