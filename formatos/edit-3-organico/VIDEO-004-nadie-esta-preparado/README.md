# VIDEO-004 · Nadie está preparado

| Campo | Valor |
|---|---|
| Formato | `#edit-3-organico` · variante **3C** (orgánico horizontal 16:9) |
| Para | marca personal |
| Subtítulos | **S8** Flotante cinematográfico, colocado según el sujeto (v3; v2 columna fija; v1 S6) |
| Look | **cine-sobrio 100 %** (elegido; el defecto de edit-3 es cine-calido) |
| Motion / CTA / música | ninguno / solo el grabado / no |
| Salida | 1920×1080, 25 fps |
| Orden | `video-orders/VIDEO-004.json` |
| Composición | `Video004` (`src/compositions/video004/Video004.tsx`) |
| Estado | **exportado v3** (2026-10-10): `exportaciones/Video004V3.mp4`. Prueba del proceso completo desde cero. |

## Archivos

- Toma: `~/Downloads/IMG_0001.mov` (no copiada; 4K HEVC Rec.709, 25 fps, 117,4 s).
- Proxy graduado (solo metraje): `public/video-004/hq/fuente-cine-sobrio.mp4`.
- Transcripción: `analysis/video-004-whisper/`.
- Comparación de color (original / 100 % / 70 %): `revision/look-cine-sobrio-original-100-70.jpg`.

## Montaje v1

67,36 s. Se usa el segundo intento del arranque (desde 35,55 s); se descartan el primer intento, dos falsos arranques y el silencio final. Dos cortes de audio en pausas largas; 8 planos (general, medio, cercano) reencuadrados de la misma cámara y cambiados solo en pausas.

## Versiones

| Versión | Fecha | Archivo | Nota |
|---|---|---|---|
| v1 | 2026-10-10 | — (preview en Studio) | S6; hueco de audio en los cortes |
| v2 | 2026-10-10 | — (preview en Studio) | S8 en columna fija; fundido cruzado de 3 f en los cortes de audio |
| v3 | 2026-10-10 | `exportaciones/Video004V3.mp4` (**vigente**) | S8 según el sujeto; 1920×1080, 25 fps, 67,36 s, -16,4 LUFS; audio sincronizado con fixRenderAudioSync |
