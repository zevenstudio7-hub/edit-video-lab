# Estilos de texto — catálogo

Estado: **candidato** (2026-10-09). Datos en `movimientos.json`/`textos.json`; referencias con tiempo en `img/frames/texto-*` y `img/frames/creator-*`.

## Alcance (importante)

Estos estilos son para **titulares, rótulos y subtítulos de estilo creator**. **No reemplazan** los subtítulos aprobados de `#edit-2-pantalla-dividida` (lectura blanca sin caja + énfasis con textura; `formatos/identidad-video-zeven.md`), que siguen rigiendo en `#edit-1-motion` y `#edit-2`. Si quieres que alguno de los de abajo sustituya a esos subtítulos, es una decisión nueva y se anota en la RAÍZ.

**Desde el 2026-10-09** los estilos de subtítulos (cómo se subtitula la voz de principio a fin) están en `formatos/subtitulos/SUBTITULOS.md` (S1–S9). Este archivo sigue siendo el catálogo de **rótulos**; S2, S3, S5 y S6 enlazan aquí los rótulos que usan (`caption-palabra`, `gancho-apilado`, `titular-mixto`, `cursiva-editorial`, `caption-pequeno-negrita`) sin duplicarlos.

## Los 10 estilos

| # | Estilo | Para qué | Rasgo | Se aplica en |
|---|---|---|---|---|
| 1 | `gancho-apilado` | primeros 1–3 s | 2–4 líneas de sans 900 mayúsculas que llenan el ancho; última línea en serif | edit-5, edit-1 |
| 2 | `caption-palabra` | lectura continua | 1–3 palabras al centro (y ≈ 1000–1100), blancas, sin caja, corte duro | edit-5 |
| 3 | `titular-mixto` | idea clave de una frase | tres niveles: contexto pequeño, **clave grande en crema**, matiz en serif cursiva | edit-5, edit-1 |
| 4 | `cursiva-editorial` | anuncios y marca | palabras sueltas en cursiva ligera alrededor del rostro, tamaños 1 : 3, la mayor con degradado metálico | edit-5 |
| 5 | `caption-pequeno-negrita` | UI arriba, presentador abajo | 40–46 px negrita, palabra clave en píldora blanca | edit-2 (si la orden lo pide), edit-5 |
| 6 | `palabra-grande-sans-serif` | énfasis | una palabra grande, alterna sans 800 y serif cursiva | edit-5, edit-1 |
| 7 | `titular-ui` | pantalla de interfaz | etiqueta + titular con palabra clave en color ui + descripción | Motion UX |
| 8 | `negacion-gigante` | «jamás», «nunca», «tampoco» | 220–260 px sans 900 + subtítulo con el sujeto en color | Motion UX, edit-1, edit-5 |
| 9 | `etiquetas-pildora` | marcas y hashtags | cada palabra en su píldora; mono con tecleo como apoyo | Motion UX |
| 10 | `nota-mono` | error o dato técnico | tarjeta con texto mono + etiqueta rotada en color de alerta | edit-5, Motion UX |

Tamaños, tipografías, posiciones, animaciones y límites de cada uno: `textos.json`.

## Reglas comunes

- Una idea por bloque; máximo 3 palabras en los captions de lectura.
- Nunca sobre el rostro ni sobre la acción de pantalla: se mide la zona libre de cada plano.
- Dentro del área segura de Reels; nada a la derecha de x = 940 bajo y = 1000.
- Una sola palabra de énfasis por frase, y cambia **una** cosa (peso, familia o color).
- Tiempos por palabra reales; sin ellos, bloques por frase. No se inventan transcripciones ni tiempos.
- Tipografías y colores salen del perfil (`formatos/motion-ux/perfil.json` y, en edit-5, `formatos/edit-5-creator/perfil.json`).

## Movimiento del texto

Cada estilo declara qué preset de `MOVIMIENTOS.md` usa. Los más frecuentes: `entrada-desenfoque` (titulares), `pop-insignia` (palabra clave), `revelado-lineas` (descripciones) y `escritura-con-tinte` (texto en campos de UI). Los captions de lectura **no se animan**: cambian con corte duro para no competir con la voz.

## Tipografías

Equivalentes abiertos (OFL), a verificar con un still con tildes y palabras largas: **Inter Tight** (lectura y titulares), **Anton / Archivo Black / Bebas Neue** (gancho), **Instrument Serif / Playfair Display** (serif cursiva), **SF Mono / ui-monospace** (notas técnicas). El catálogo completo está en `formatos/edit-5-creator/tipografias.json`.
