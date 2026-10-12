# VIDEO-003 — La guerra de la IA empezó

- **Formato:** `#edit-1-motion`. Base de estilo: VIDEO-002 (subtítulos, tipografía, colores y posición sin cambios).
- **Objetivo:** pieza editorial de análisis sobre la carrera de la IA. El presentador está en plano toda la pieza y los gráficos de datos (líneas, curvas, nodos, contadores) evolucionan con el argumento, detrás y alrededor de él.
- **Estado:** preview v1 pendiente de revisión (2026-10-06). Sin MP4: el render final requiere autorización.
- **Preview:** composición `Video003` en el Studio (`pnpm dev` → http://localhost:3000/Video003). Dura 43,4 s (1302 frames, 1080×1920, 30 fps). El Studio usa proxies de 540×960 (`previewLigero`, activado por defecto) para reproducir a tiempo real; el render usa siempre los de 1080p.
- **Orden del usuario:** `guion-tecnico-usuario.md` (resumen de sus reglas). La grabación manda sobre el guion: los subtítulos y los rótulos siguen lo que se oye.
- **Orden técnica:** `video-orders/VIDEO-003.json` (`edl` = cortes con motivo; `timeline` = resuelto a frames, con el motivo de cada escena).

## Edición

- **Un solo corte:** se quita el falso arranque «tu compañía, tu empresa o más bien» (36,97–39,50 s de la toma). Queda «antes de que tu competencia lo haga por ti». El corte se comprobó con Gemini y con whisper. Al reanudar, la imagen cambia de escala (1,00 → 1,05) para disimular el salto.
- **Silencios:** la grabación ya venía montada sin pausas largas. No se quitó nada más.
- **Cierre:** el plano llega hasta 45,93 s de la toma. La mano que para la grabación sale de cuadro en 45,2 s, así que el final queda limpio.
- **Capas:** plano original → gráficos detrás → presentador recortado con alfa → rótulos → subtítulos.
  - El recorte es la máscara de persona de Apple Vision (`segment.swift`, calidad «balanced», 1104 fotogramas), codificada en VP9 con alfa.
  - Ningún gráfico baja de y ≈ 960. Los subtítulos (lectura en y = 1438, énfasis apoyado en y = 1480) no se cruzan con el motion.
- **Escenas:** 16 tramos del guion en 5 bloques continuos (`src/compositions/video003/scenes.tsx`):
  - línea temporal → dos líneas que convergen;
  - curva de velocidad → límite (CONTROL, SEGURIDAD) → medidor y acelerador;
  - días → ANTHROPIC (OPUS 5.5, SONNET 5.5) → OPENAI (GPT-6 ASTRA, 6.1 SOL) → RAZONAR, PLANIFICAR, EJECUTAR, HERRAMIENTAS;
  - una sola línea → ¿DOMINAR? y ¿REEMPLAZAR? tachados;
  - (pausa) → desde HOY → TU NEGOCIO frente a COMPETENCIA → la carrera → VENTAJA ↑ → queda solo una flecha.
- **Cámara:** acercamientos discretos en la entrada, en «acelerador», en «bastante claro» y en «la pregunta debería ser».
- **Sonido:**
  - voz de la toma a −14,2 LUFS / −1,9 dBFS;
  - efectos `zp-` por beat (38);
  - música propia (síntesis) a −31 LUFS, que baja bajo la voz (`analysis/video-003-audio.json`).

## Diferencias con el guion técnico, por lo que se oye

- «Mientras líderes y empresas hablan de controlar su avance **por seguridad**». Los indicadores son CONTROL y SEGURIDAD; no se usan REGULACIÓN ni PRECAUCIÓN, que no se dicen.
- Se dice «Anthropic lanzó **Opus 5.5** y Sonnet 5.5» (sin «Claude») y «acaba de presentar **6.1 Sol**» (sin «GPT»). Los rótulos lo reflejan tal cual. Los nombres coinciden con lanzamientos reales de septiembre de 2026 (`analysis/video-003-support-research.json`).
- «Para mí esto **es** algo bastante claro». Whisper y Gemini oyen «es» al analizar el fragmento; el guion dice «deja».

## Recursos externos

Ninguno, por decisión del usuario. Todo el motion se genera con código. Solo se usan la toma, las texturas de subtítulos de VIDEO-001 y los efectos `zp-` propios.

## Archivos

- `tomas/`: copia de la toma (el original sigue en `formatos/edit-1-motion/`).
- `public/video-003/`:
  - `hq/fuente-1080.mp4` y `hq/presentador-alfa.webm`, más sus versiones `-540` para el Studio;
  - `dialogue.wav`, `sfx.wav` y `music.wav`.
- Herramientas en `src/videoAnalysis/video003/`:
  - `verifySnippets.mjs` (Gemini);
  - `segment.swift` (Apple Vision);
  - `buildTimeline.mjs`;
  - `buildAudioBeds.mjs`.
- Composición: `src/compositions/video003/`.
- `revision/`: `hoja-v1.jpg` (19 fotogramas renderizados desde la composición) y `v1/`.

## Pendiente de oído (usuario)

- La unión del corte: «antes de que | tu competencia».
- «esto es / esto deja algo bastante claro».
- Nivel de efectos y música en el teléfono.
