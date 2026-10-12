# Notas históricas de procedimiento (no invocables)

La única entrada operativa es `.claude/skills/video-lab/SKILL.md` (`/video-lab`). Estas notas se conservan para consulta; la skill unificada y la RAÍZ gobiernan la ejecución.


# Edit 5 Creator

Skill del quinto EDIT_TYPE. Trabaja sobre el repositorio del laboratorio y **complementa** a `/video-lab`: la RAÍZ (`docs/VIDEO-SYSTEM-ROOT.md`) manda en políticas, la orden `video-orders/VIDEO-XXX.json` manda en el video, y esta skill organiza el procedimiento. No duplica políticas: si esta skill y la RAÍZ discrepan, gana la RAÍZ y se señala la contradicción.

## Antes de empezar

1. Lee `formatos/video-lab/FORMATO.md`, `estilos.json`, `tipografias.json` y `formatos/identidad-video-zeven.md`. Si el tema es tecnología/software, lee también `formatos/motion-ux/MOTION-UX.md`; para rótulos, `formatos/motion-ux/TEXTOS.md` (solo lo que necesites). Revisa `git status`.
2. Perfil: si existe `formatos/video-lab/perfil.json`, respétalo (`notas.evitar` es regla firme). Si no existe, haz la parte A de `CUESTIONARIO.md` o aplica video-zeven si el usuario tiene prisa.
3. Haz como máximo las 5 preguntas de la parte B de `CUESTIONARIO.md`, deduciendo lo medible. Si el usuario no está presente, toma la lectura más razonable, dilo arriba y sigue; solo para si una decisión no se puede deshacer.
4. Crea o actualiza la orden con `EDIT_TYPE: #edit-5-creator`, el estilo base, el bloque `cambios`, las tomas (principal / apoyo) y los apoyos asignados a frases. No montes sin orden válida.

## Reglas

- **Estilo base + cambios:** `estilos.json` fija valores de partida; el perfil los sobrescribe; el bloque `cambios` de la orden gana. Registra cada cambio con su motivo.
- **Tomas:** voz hablada continua = principal; el resto = apoyo. Propón la clasificación con la transcripción y espera confirmación del usuario.
- **Edición:** fidelidad al audio. Ningún corte recorta voz (`qaEditAudio.mjs`); las pausas naturales se conservan. Los subtítulos siguen lo que se oye; no inventes tiempos ni transcripciones.
- **Material:** real primero. Interfaces y evidencias, con material verificable. Motion, texto, emojis e iconos con Remotion antes que cualquier IA; IA de imagen o video solo con decisión explícita en la orden.
- **Investigación de apoyos:** la de la RAÍZ aplica a cada video (`analysis/<id>-support-research.json`); registra procedencia y derechos de todo recurso externo en `library/assets.json`.
- **Una sola cosa que leer a la vez** y nada tapa el rostro ni la demostración. Área segura de Reels orgánico.

## Cuando el usuario pide un motion o recurso (exista o no)

Orden de resolución, en este orden y sin saltarte pasos:
1. `library/catalog.json` (reutiliza; revisa el estado y el enrutamiento a `#edit-5-creator`).
2. `src/components`.
3. Remotion oficial y los paquetes `@remotion/*` ya instalados (compatibles con 4.0.438; no actualices por arrastre).
4. Si no existe: crea la receta como **candidata** en `library/recipes`, con muestra en la galería y entrada en el catálogo. Pasa a `validada` solo cuando una orden la use y la preview revisada lo confirme.

Aplica siempre el criterio de ZevenPRO: ¿resuelve algo concreto del video?, ¿lo cubre ya algo existente?, ¿cuánto cuesta en tiempo? Tope inicial de **2 recetas nuevas por video** sin aprobación. No construyas componentes por adelantado.

## Guión técnico, referencia y looks

Pide (o propón) el guión técnico por fragmento: escena, motion, iconos o emojis, texto en pantalla y material (`formatos/GUION-TECNICO.md`); señala las diferencias con lo que se dice. Un video de referencia del usuario (`material/referencias/`) es solo referencia de estilo: mide lo que pida y no copies su contenido. Looks de color: `formatos/looks/looks.json` (edit-5 aún sin look por defecto; pregunta o usa `ninguno`).

## Entrega

Un still por receta nueva y por tipografía elegida antes de la preview. Abre Studio y etiqueta la entrega: preview de trabajo, preview revisada o aprobación editorial. Typecheck, OCR o muestreo no equivalen a revisión audiovisual: si no puedes ver o escuchar, déjalo pendiente. Render final solo con autorización expresa; la exportación sigue el procedimiento de `formatos/edit-2-pantalla-dividida/FORMATO.md` (incluida la corrección del desfase de audio). No hagas commit ni push salvo que se pida.
