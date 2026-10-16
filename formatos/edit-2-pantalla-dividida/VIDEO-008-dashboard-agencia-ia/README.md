# VIDEO-008 · Dashboard de la agencia con agentes de IA

| Campo | Valor |
|---|---|
| Formato | `#edit-2-pantalla-dividida` · variante **2A con el reparto invertido**: presentador arriba (y 0–950) y tomas de apoyo abajo (y 1070–1920), como pidió el usuario |
| Subtítulos | **S6 sin píldora** (sencillos, sin resaltar palabras): Inter Tight 700 a 46 px, en una franja oscura entre las dos zonas; a pantalla completa, con fondo translúcido |
| Apoyo | grabación del dashboard (`Apoyo/Grabación … 7.13.22 p.m..mov`), recortada en la zona de la que se habla: oficina, lista de cargos, sala de juntas, avances y aprobación |
| Audio | voz original recortada y normalizada (−14 LUFS) + un efecto suave en cada cambio de toma |
| Duración | **1:18,1** (la toma dura 1:58,0) · 1080×1920 · 24 fps |
| Orden | `video-orders/VIDEO-008.json` · composición `Video008` · montaje: `src/videoAnalysis/video008/buildEdit.mjs` |
| Estado | **exportado v2** (2026-10-16): `exportaciones/Video008V2.mp4` (v1 + animación «Seguir» de VIDEO-005 al final) |

## Qué se quitó y qué se conserva

Criterio del usuario: que se entienda **para qué es, qué resuelve y cómo funciona**.

| Tramo | Principio | Decisión |
|---|---|---|
| k1 | qué es | Gancho y qué es: un dashboard para organizar la agencia Zeven con agentes de IA. |
| k2 | cómo funciona | «Cada uno de ellos con una tarea». Se quita antes «decidí adelantarme a la estructura y la maquetación…» (proceso, no producto). |
| k3 | cómo funciona | La oficina se mueve y él da las directrices. Se quita «En este básicamente están las responsabilidades» (repite la idea anterior). |
| k4 | cómo funciona | La sala de juntas: hace un llamado y todos vienen a revisar las estrategias. |
| k5 | qué resuelve | Tener mapeado el trabajo de cada uno: porcentaje, aprobada, en ejecución, qué le falta. Se quita antes la enumeración de cargos (se ven en pantalla). |
| k6 | cómo funciona | La orden por Telegram y que nada se haga sin su revisión. Se quita antes «es muy interactivo…» (opinión) y después los ejemplos de campaña y anuncio. |
| k7 | estado | «Hasta el momento solamente tengo activo investigación». Se quita la explicación larga de por qué empieza por ahí. |
| k8 | resumen y cierre | Cargos, avances y aprobación en una frase, y el cierre (seguirá contando el proceso). |

Además, las pausas de más de 0,45 s dentro de cada tramo se acortan a unos 0,3 s.

## Archivos
- Tomas: `~/Downloads/YeiRodriguez Contenido/edicion-de-video-skill/dashboard/` (no se copiaron). La segunda grabación (con ChatGPT y el escritorio) queda de reserva.
- Proxies y voz: `public/video-008/` (`presentador.mp4`, `dashboard.mp4`, `dialogue.wav`).
- Revisión: `revision/hoja-preview-v1.jpg`.

## Comprobaciones
- Voz montada transcrita por tramos: no falta ninguna frase conservada ni quedan restos de las quitadas (los tiempos por palabra salen de whisper con DTW).
- Studio: una sola voz, sin errores. `pnpm typecheck` pasa.

## Pendiente
- Escucha del usuario: empalmes y ritmo.
- Dudoso: «cómo ir a ir avanzando» (cierre). Los subtítulos dicen «cómo ir avanzando».

## Versiones
| Versión | Fecha | Archivo | Nota |
|---|---|---|---|
| v1 | 2026-10-16 | `exportaciones/Video008V1.mp4` | 1080×1920, 24 fps, 78,3 s, H.264 + AAC, −14,8 LUFS; audio sincronizado con fixRenderAudioSync (cebado de 2048 muestras corregido sin recodificar; desfase 0 contra la voz). Informe: `analysis/video-008-export-sync.json` |
| v2 | 2026-10-16 | `exportaciones/Video008V2.mp4` (**vigente**) | + CTA «Seguir» de VIDEO-005 (`ESCENAS.cierre`, solo la parte «sígueme»: avatar en arco → tarjeta yeirodriguez.co → clic en «Seguir» → «Siguiendo») desde «aplicarlo…», con efectos; el subtítulo baja a y = 1450 durante la tarjeta; duración ajustada al final de la toma. 78,1 s, −14,8 LUFS, audio sincronizado (informe `analysis/video-008-export-sync-v2.json`) |
