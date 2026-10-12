# Formatos y proyectos

Una carpeta por formato (los `EDIT_TYPE` de la RAÍZ, `docs/VIDEO-SYSTEM-ROOT.md`) y, dentro de cada formato, una carpeta por cada video realizado.

```text
formatos/
  identidad-video-zeven.md          identidad común a todos los formatos
  SUBTITULOS.md / subtitulos/       catálogo de subtítulos S1–S9
  edit-1-motion/                    FORMATO.md · referencias/ · variantes 1A–1C
    RSS - Entretenimiento/          VIDEO-002: ficha, tomas, exportaciones, material y revisión
    VIDEO-003-guerra-de-la-ia/      VIDEO-003: ficha, tomas, exportaciones, material y revisión
  edit-2-pantalla-dividida/         FORMATO.md (2A aprobado) · variantes 2A–2B
    VIDEO-001-apple-vs-samsung/     ficha, exportaciones, material y revisión
  edit-3-organico/                  FORMATO.md (definido) · variantes 3A–3C
  edit-4-business/                  FORMATO.md (definido) · variantes 4A–4C
  edit-5-creator/                   FORMATO.md · estilos.json · tipografias.json · CUESTIONARIO.md · variantes 5A–5D
  edit-6-avatar/                    fuera de la guía mientras no se use (antes #edit-4-avatar)
  edit-creator/                     aviso de redirección (carpeta antigua; se puede borrar)
  motion-ux/                        estilo de motion predeterminado para tecnología y software (candidato)
  looks/                            colorización por formato (LUT .cube + looks.json)
  GUION-TECNICO.md                  plantilla de guión técnico y reglas del video de referencia
  guia/                             guía de uso (guia.html → PDF en docs/)
```

| Formato | Estado | Variantes (subtítulos defecto · alternativa) | Videos |
|---|---|---|---|
| `#edit-1-motion` | en preparación | 1A (S1·S3) · 1B (S4·S1) · 1C (S1+S4·S3) | VIDEO-002 (preview v3), VIDEO-003 (preview v1) |
| `#edit-2-pantalla-dividida` | 2A aprobado (2026-10-04) | 2A (S1·S6) · 2B (S6·S1) | VIDEO-001 |
| `#edit-3-organico` | definido, sin video | 3A (S6·S2) · 3B (S6·S8) · 3C (S8·S6) | — |
| `#edit-4-business` | definido (2026-10-09), sin video | 4A (S7·S1) · 4B (S7·S1) · 4C (S3·S7) | — |
| `#edit-5-creator` | definido, sin video | 5A (S2·S5) · 5B (S3·S2) · 5C (S2·S6) · 5D (S9·S5) | — |
| `#edit-6-avatar` | fuera de la guía | — | — |

Looks de color por defecto y alternativo: `formatos/looks/README.md`. Una sola skill para todos los formatos: `/video-lab`.

## Carpeta de cada formato

- `README.md`: estado del formato y lista de sus videos.
- `FORMATO.md`: definición del formato (cuando existe).
- `referencias/`: videos de ejemplo y su análisis (cuando los hay).

## Carpeta de cada video: `formatos/<formato>/<VIDEO-XXX-tema>/`

El nombre puede ser el que elija el usuario (por ejemplo, `RSS - Entretenimiento`); el ID `VIDEO-XXX` va siempre en la ficha y en la orden.

- `tomas/`: las tomas originales, cuando el usuario las deja en la carpeta del video; si hay varias cámaras, `tomas/principal/` y `tomas/apoyo/`. En VIDEO-001 están en `raw-material/video-001/`.
- `README.md`: la ficha del video. Recoge tema, estado, versiones, la exportación vigente y dónde están sus archivos técnicos.
- `exportaciones/`: los videos exportados, el vigente y los anteriores.
- `material/`: lo que entrega el usuario para ese video, **una carpeta por tipo de elemento**: `capturas/`, `b-roll/`, `fotos/`, `logos/`, `emojis-iconos/`, `voz/`, `musica/`, `referencias/` (videos de referencia; con una nota de qué se quiere de cada uno), `otros/` (créalas solo las que uses). Así cada archivo se cataloga en la orden y se asigna a una frase sin ambigüedad.
- `revision/`: fotogramas y hojas de control.

Los medios (`tomas/`, `exportaciones/`, `material/`, `revision/`, `referencias/`) no se versionan en git (`.gitignore`). Las fichas y los documentos sí.

## Lo que sigue en su sitio técnico

Remotion y las herramientas leen estas rutas, así que no se mueven. La ficha de cada video las enlaza.

| Qué | Dónde |
|---|---|
| Orden del video (contrato: decisiones y timeline) | `video-orders/VIDEO-XXX.json` |
| Tomas originales | `raw-material/video-xxx/` |
| Composiciones de Remotion | `src/compositions/…` |
| Recursos que sirve Remotion (proxies, voz, efectos) | `public/video-xxx/` |
| Análisis y resumen | `analysis/video-xxx-*` |
| Render recién hecho | `out/` (archivo de paso; la exportación final va a `exportaciones/`) |

## Nuevo video

1. Elegir el formato y crear `formatos/<formato>/<VIDEO-XXX-tema>/`, con su `README.md` (la ficha de VIDEO-001 sirve de plantilla) y sus carpetas.
2. Crear la orden `video-orders/VIDEO-XXX.json`, con su `EDIT_TYPE`.
3. Editar según el `FORMATO.md` del formato y con la identidad video-zeven.
4. Exportar a `exportaciones/` y anotar la versión en la ficha.
