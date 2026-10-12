# VIDEO-001 — verificación de Studio

Estado editorial: **PROVISIONAL / análisis incompleto (8 de 12 MP4)**.

## Verificado en navegador

- URL: http://localhost:3000/Video001
- Composición visible: `Video001`, 1080×1920, 30 FPS, 3867 fotogramas (128,9 segundos).
- Reproducción real del presentador: `currentTime` avanza; video H.264 decodificado a 1280×720 y sin error de medios.
- Reproducción simultánea en escena de pantalla: grabación superior y presentador inferior, ambos con `paused: false`, `readyState: 4` y sin error de medios.
- Apoyo superior silenciado; voz del presentador activa.
- Inspección visual de título, presentador orientado, subtítulos, publicación capturada y concepto visual etiquetado.
- Sin errores registrados por el navegador ni overlay de error.
- Se reutilizan BigStatement, DynamicCaptions, MediaFrame, SoftZoom y PresetProvider de la biblioteca existente.
- TypeScript y validación del plan provisional pasan. La validación estricta de 12 análisis sigue pendiente.
- No se ejecutó render final. Las 13 copias H.264 son medios de preview, no el video final editado.

La reproducción técnica no equivale a aprobación editorial ni a haber comparado las cuatro tomas restantes. Los timestamps interpretados por Gemini requieren revisión fina de oído antes de un render final. El cierre actual utiliza un CTA grabado fuera del guion y está identificado como provisional.

## Bloqueo externo

Gemini respondió 429, `GenerateRequestsPerDayPerProjectPerModel-FreeTier`, cuota 20, modelo `gemini-3.6-flash`. Evidencia en `video-001-api-status.json`. No se cambiaron claves, facturación ni modelo para eludir la cuota.

Pendientes: `ac101fa5da344fc3b1c2f135b14ff93c.MP4`, `b1eb53d64406404f95a673182fe597fd.MP4`, `e7648b9b117b45218bd4bac13da69698.MP4`, `ffe3314cd47f4f4293b8bfc328054b4b.MP4`.

## Reanudación

Cuando la cuota vuelva a estar disponible, `pnpm analyze-video` reutiliza los resultados y uploads guardados y continúa los pendientes con el modelo fijado. Después hay que volver a finalizar y validar el plan completo, retirar el aviso provisional solamente si se completaron los 12 análisis, y repetir la revisión de Studio. No ejecutar el generador provisional sobre un plan completo aprobado.

Studio: `pnpm dev --port 3000 --no-open`.
