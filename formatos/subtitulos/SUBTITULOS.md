# Catálogo de estilos de subtítulos (S1–S9)

Estado: **acordado con el usuario el 2026-10-09**. Solo **S1** está aprobado en un video (VIDEO-001). Los demás son **candidatos**: sus medidas son puntos de partida hasta que un video los apruebe. Datos para el código: `subtitulos.json`. Muestras propias (secuencias de fotogramas sobre tomas del usuario): `formatos/guia/muestras/` y la guía `docs/Guia-de-uso-sistema-de-edicion-ZEVEN.pdf` (v2).

## Cómo se usa

1. La orden declara `EDIT_TYPE`, `variante` (p. ej. `1C`) y `subtitulos` (p. ej. `S1`). Si no declara `subtitulos`, rige el **por defecto de la variante** (tabla de abajo).
2. Un video puede combinar dos estilos solo si la variante lo dice (`1C` = S1 en el presentador + S4 en el motion; `S3` incluye S2 como lectura).
3. El bloque `cambios` de la orden manda sobre la ficha: tamaño, color, posición o fuente se cambian ahí, con su motivo.
4. En `#edit-5-creator` la tipografía y los colores pueden salir del perfil (`formatos/edit-5-creator/perfil.json`); la **forma** del estilo (bloques, entrada, posición, cómo se marca la clave) no cambia con el perfil.

## Relación con `formatos/motion-ux/TEXTOS.md`

`TEXTOS.md` es el catálogo de **rótulos y titulares** (10 estilos). Este catálogo define **cómo se subtitula la voz** de principio a fin. No se duplican: cuando un subtítulo usa un rótulo, la ficha lo enlaza por su id.

| Subtítulo | Usa de TEXTOS.md |
|---|---|
| S2 | `caption-palabra` (es la misma lectura, aquí con la regla de la palabra clave) |
| S3 | `gancho-apilado` (primeros 1–3 s) + `caption-palabra` + `titular-mixto` |
| S5 | `cursiva-editorial` |
| S6 | `caption-pequeno-negrita` |
| S1, S4, S7, S8, S9 | ninguno (son propios) |

Los rótulos sueltos que no son subtítulos (`nota-mono`, `negacion-gigante`, `titular-ui`, `etiquetas-pildora`, `palabra-grande-sans-serif`) siguen en `TEXTOS.md` y pueden acompañar a cualquier estilo.

## Reglas comunes

- **Siguen a la voz:** tiempos por palabra reales (`refineWordTimesV3.mjs` o equivalente). Sin ellos, bloques por frase y sin énfasis. No se inventan transcripciones ni tiempos.
- **Una sola cosa que leer a la vez.** Ningún estilo duplica la frase en dos sitios.
- **Nunca sobre el rostro ni sobre la acción de pantalla:** se mide la zona libre de cada plano.
- **Posición según el sujeto:** el sujeto fija dónde va el texto, no los bordes ni el centro del cuadro. En cada plano se miden los **dos espacios libres** a los lados del sujeto, a la altura de su cabeza, y cada bloque se centra dentro de uno de ellos: a ≥ 3 % del ancho del sujeto y ≥ 8 % del borde del cuadro, **nunca pegado a los costados**. Los dos bloques de una frase partida van a la misma altura, uno en cada espacio; si el sujeto está descentrado, el texto se descentra con él, y al cambiar de encuadre se vuelven a medir los espacios. Se aplica a los estilos que flotan en el plano (S5, S8 y la cascada de S9); no a los de zona fija (S1, S2, S4, S6, S7), ni a la pantalla llena de S9 ni al gancho de S3.
- **Área segura** (identidad video-zeven): Reels orgánico x 65–1015, y 250–1500, nada a la derecha de x = 940 por debajo de y = 1000. Anuncios (Meta): 14 % arriba, 35 % abajo, 6 % a los lados → en 1080×1920, y 269–1248 y x 65–1015.
- **Palabra clave:** una por frase, y cambia **una** cosa (peso, familia o color).
- Medidas a 1080×1920 (9:16) salvo S8, a 1920×1080 (16:9).

## Qué estilo va en cada variante

| Variante | Por defecto | Alternativas |
|---|---|---|
| 1A Motion sobre el presentador | S1 | S3 |
| 1B Motion a pantalla completa | S4 | S1 |
| 1C Combinado | S1 + S4 | S3 |
| 2A Apoyo arriba, presentador abajo | S1 | S6 |
| 2B Demo protagonista | S6 | S1 |
| 3A Tutorial en vivo | S6 | S2 |
| 3B Charla natural | S6 | S8 |
| 3C Orgánico horizontal 16:9 | S8 | S6 |
| 4A Caso o testimonio | S7 | S1 |
| 4B Producto o servicio | S7 | S1 |
| 4C Anuncio u oferta | S3 | S7 |
| 5A Collage | S2 | S5 |
| 5B Hook | S3 | S2 |
| 5C Explicativo | S2 | S6 |
| 5D Editorial lifestyle | S9 | S5 |

---

## S1 · Lectura + énfasis — **aprobado** (VIDEO-001)

Receta `TypeCaptions`, variante `texture` (`library/recipes/TypeCaptions.tsx`). Identidad video-zeven.

| Campo | Valor |
|---|---|
| Tipografía | Inter Tight 800 (lectura) · 900 (énfasis) |
| Tamaño | lectura 66 px, interlineado 1,08, tracking −0,015 em · énfasis 96 / 128 / 160 px, interlineado 0,9, tracking −0,045 em (se reduce si la línea no cabe) |
| Color y sombra | lectura blanca, sombra `0 2px 3px rgba(0,0,0,.55), 0 6px 22px rgba(0,0,0,.5)` · énfasis blanco o con textura rosa `#f4c0ca` / roja `#ff4b2e` (`public/video-001/v3/texture-*.jpg`), sombra `drop-shadow(0 6px 16px rgba(0,0,0,.45))` |
| Posición | lectura centrada en y = 1438, x 65–940 · énfasis apoyado por la base en y = 1480, x 65–940 |
| Palabras por bloque | lectura 2–4, cortadas en la puntuación · énfasis 1–3 líneas de 1–3 palabras |
| Entrada / salida | lectura: aparición corta (6 f) y corte duro al siguiente bloque · énfasis: cada línea sube 34 px con muelle, escalonada 3 f; sale con corte |
| Palabra clave | el énfasis **sustituye** a la lectura en sus palabras (≈ uno cada 12 s, ~14 en 2:43) |
| Variaciones | énfasis de 1, 2 o 3 líneas; tonos blanco / rosa / rojo; alineación izquierda o escalonada |
| Cuándo | formatos de la identidad: 1A, 1C, 2A; alternativa en 1B, 2B, 4A, 4B |
| Cuándo no | 16:9; tutoriales donde la pantalla es protagonista (tapa la zona baja); piezas de marca de un cliente (usa S7) |

## S2 · Palabra a palabra — candidato

Rótulo `caption-palabra` de `TEXTOS.md`. Referencia: `creator-1` (video 3).

| Campo | Valor |
|---|---|
| Tipografía | Inter Tight 700 (o la de lectura del perfil) |
| Tamaño | 64–84 px (partida 76), tracking −0,02 em, sin mayúsculas forzadas |
| Color y sombra | blanco, sin caja, sombra `0 4px 20px rgba(0,0,0,.5)` |
| Posición | centrado, y ≈ 1000–1100 (justo sobre el pecho); nunca bajo y = 1500 |
| Palabras por bloque | 1–3 |
| Entrada / salida | corte duro entre bloques, sin fundido; cada bloque dura lo que tarda en decirse (mínimo 6 f) |
| Palabra clave | la misma palabra en el color de acento del perfil (por defecto amarillo `#F5C518`) |
| Variaciones | 1 palabra (ritmo alto) · 2–3 palabras (ritmo medio) |
| Cuándo | 5A, 5C; alternativa en 3A y 5B |
| Cuándo no | cuando hay motion o captura en el centro del cuadro; videos largos de explicación lenta (cansa) |

## S3 · Gancho + lectura — candidato

Rótulos `gancho-apilado` → `caption-palabra` → `titular-mixto` de `TEXTOS.md`. Referencia: `texto-1-captions-grandes` (video 3).

| Campo | Valor |
|---|---|
| Tipografía | gancho: sans 900 en mayúsculas (Inter Tight 900, Anton o la de hook del perfil) + última línea en serif (Instrument Serif) · lectura: la de S2 · titular: sans 600 / sans 900 / serif cursiva |
| Tamaño | gancho 150–190 px, interlineado 0,95, tracking −0,04 em, justificado al ancho útil · titular: contexto 64 px, clave 130–160 px, matiz 52 px |
| Color y sombra | blanco; la clave del titular en crema `#F4EFC8`; sombra `0 8px 30px rgba(0,0,0,.45)` |
| Posición | gancho a la izquierda, tercio medio (y 700–1300) · lectura como S2 · titular centrado, y ≈ 1000–1200 |
| Palabras por bloque | gancho 2–4 líneas de 1–2 palabras · lectura 1–3 · titular 3 niveles |
| Entrada / salida | gancho: las líneas se apilan una a una con desenfoque (10 f) y salen juntas a los 1–3 s · lectura: corte duro · titular: contexto → clave con pop (+4 f) → matiz (+10 f) |
| Palabra clave | en el gancho, la línea en serif; en el resto, el titular de tres niveles (p. ej., con una frase de VIDEO-003: contexto «se trata de» / clave «VELOCIDAD» / matiz «y adaptación») |
| Variaciones | gancho en 2, 3 o 4 líneas; última línea en serif redonda o cursiva |
| Cuándo | 4C, 5B; alternativa en 1A, 1C y 5A |
| Cuándo no | tutoriales y piezas sobrias; más de un gancho por video |

## S4 · Titular de escena — candidato (VIDEO-002)

Énfasis de `TypeCaptions` dentro de la franja negra (`src/compositions/video002/band.tsx`).

| Campo | Valor |
|---|---|
| Tipografía | Inter Tight 900 (titular) · 800 (lectura breve si hace falta) |
| Tamaño | 96 / 128 / 160 px como el énfasis de S1 |
| Color y sombra | blanco o textura rosa / roja sobre la franja negra sólida (ink de la identidad), sin sombra extra |
| Posición | dentro de la franja negra, cuyo borde está en y = 1180; titular apoyado en y = 1480, lectura en y = 1438 |
| Palabras por bloque | 1–3 líneas, la idea de la escena |
| Entrada / salida | sale de la franja con ella; al cambiar de escena se hunde en la franja con desenfoque de movimiento y el siguiente sale de ella |
| Palabra clave | el propio titular es la clave; **sin lectura duplicada** debajo |
| Variaciones | titular solo · titular + lectura breve cuando la frase no cabe en el titular |
| Cuándo | 1B y la parte de motion de 1C |
| Cuándo no | sobre el presentador (ahí va S1) |

## S5 · Cursiva editorial — candidato

Rótulo `cursiva-editorial` de `TEXTOS.md`. Referencia: `texto-2-cursiva-editorial`.

| Campo | Valor |
|---|---|
| Tipografía | serif cursiva ligera (Instrument Serif italic) o sans 300 cursiva |
| Tamaño | 70–210 px, proporción 1 : 3 entre la palabra menor y la mayor |
| Color y sombra | blanco; la palabra mayor con degradado metálico blanco → gris claro (`#FFFFFF` → `#C9CDD3`); sombra `0 4px 24px rgba(0,0,0,.35)` |
| Posición | alrededor del rostro, en los espacios libres a sus lados (regla «Posición según el sujeto»), con margen ≥ 8 % del borde: nunca pegadas a los costados |
| Palabras por bloque | hasta 3 palabras compuestas a la vez |
| Entrada / salida | cada palabra entra con desenfoque (14 f); la mayor sube desde abajo (60 px → 0); salen juntas |
| Palabra clave | la mayor y con degradado |
| Variaciones | 2 o 3 palabras; composición en diagonal o en marco |
| Cuándo | anuncios y marca personal; alternativa en 5A y 5D |
| Cuándo no | lectura continua (no es una lectura: son palabras sueltas); tutoriales |

## S6 · Discreto — candidato

Rótulo `caption-pequeno-negrita` de `TEXTOS.md`.

| Campo | Valor |
|---|---|
| Tipografía | Inter Tight 700 |
| Tamaño | 40–46 px (partida 44) |
| Color y sombra | blanco, sombra `0 2px 10px rgba(0,0,0,.6)`; la palabra clave en una píldora blanca (radio 12 px) con texto `#17171D` |
| Posición | centrado abajo, y ≈ 1380–1440 en presentador a pantalla completa; entre la UI y la cabeza (y ≈ 1000–1110) en formato partido; recuadro del presentador libre |
| Palabras por bloque | 3–6 (una línea; dos como máximo) |
| Entrada / salida | corte duro; la píldora aparece con un pop corto (6 f) |
| Palabra clave | píldora blanca |
| Variaciones | con píldora · sin píldora (charla sin énfasis) |
| Cuándo | 2B, 3A, 3B; alternativa en 2A, 3C y 5C |
| Cuándo no | ganchos y anuncios (se pierde el impacto) |

## S7 · Corporativo — candidato nuevo (Business)

Diseñado para `#edit-4-business`. Sin referencia externa.

| Campo | Valor |
|---|---|
| Tipografía | la de la marca del cliente; sin ella, Inter Tight 600 (lectura) y 700 / 500 (rótulo) |
| Tamaño | lectura 54 px, interlineado 1,15 · rótulo de nombre 44 px y cargo 32 px |
| Color y sombra | lectura blanca sin textura, sombra suave `0 2px 12px rgba(0,0,0,.45)`; el acento (barra del rótulo y palabra clave) en el color primario del cliente (por defecto azul `#0057FF`) |
| Posición | lectura centrada en y ≈ 1400 (anuncios: y ≤ 1240) · rótulo abajo a la izquierda, x 65, y ≈ 1180–1300, con una barra vertical de 6 px en el color del cliente |
| Palabras por bloque | 3–6, una o dos líneas, cortadas en la puntuación |
| Entrada / salida | lectura con fundido corto (4 f); el rótulo entra deslizando 40 px desde la izquierda (12 f), se queda 3–4 s y sale igual |
| Palabra clave | en el color de la marca, mismo peso; sin cambiar de familia |
| Variaciones | con rótulo (primera aparición de cada persona) · solo lectura · lectura + logo del cliente en una esquina |
| Cuándo | 4A, 4B; alternativa en 4C |
| Cuándo no | marca personal y creator (resulta frío) |

## S8 · Flotante cinematográfico — candidato nuevo (video 1, 16:9)

Referencia interna: `formatos/edit-3-organico/referencias/analisis/v1-organico-h.jpg` y `v1-zoom.png`.

| Campo | Valor |
|---|---|
| Tipografía | sans de trazo fino: Inter 300 (equivalente abierto de Helvetica Neue Light); mayúscula inicial solo al empezar frase |
| Tamaño | 3–4 % de la altura del cuadro: **44 px a 1920×1080** (partida; medir en la muestra) |
| Color y sombra | blanco, sin caja, sombra suave `0 2px 14px rgba(0,0,0,.45)` |
| Posición | **la fija el sujeto**: en los dos espacios libres a sus lados, a la altura de su cabeza (centro del bloque a la altura de la frente o los ojos: ≈ 24 % de la altura en plano general, ≈ 37–39 % en plano medio o cerrado, a 1080 p). Cada bloque centrado dentro de su espacio, a ≥ 3 % del sujeto y ≥ 8 % del borde del cuadro; nunca pegado a los costados ni sobre la cara |
| Palabras por bloque | la frase entera se construye palabra a palabra (2–6 palabras); máximo 2 líneas |
| Entrada / salida | **acumulativa**: cada palabra aparece al decirse (fundido de 3 f) hasta completar la frase; con la frase nueva el bloque se reinicia, sin transición vistosa |
| Palabra clave | misma familia y tamaño en **700** («transformación», «crecimiento»); ocasionalmente una palabra en un tratamiento más pesado |
| Variaciones | **En el hueco**: la frase entera centrada en uno de los dos espacios (el más amplio) · **Partido**: el inicio en el espacio de un lado y el final en el del otro, a la misma altura · **Apilado**: la frase en 2 líneas dentro de un solo espacio, centrada en él (no en una esquina) |
| Cuándo | 3C; alternativa en 3B |
| Cuándo no | 9:16 con el presentador llenando el cuadro (no hay espacios libres a los lados); contenido con ritmo alto |

## S9 · Serif editorial — candidato nuevo (video 2)

Referencia interna: `formatos/edit-5-creator/referencias/analisis/v2-creator_0-24.jpg`, `v2-creator_24-44.jpg` y `v2-zoom.png`.

| Campo | Valor |
|---|---|
| Tipografía | serif alta y estrecha de alto contraste: Instrument Serif (redonda + cursiva) · palabra caligráfica: Pinyon Script. Licencias esperadas OFL, a comprobar al integrar (`formatos/edit-5-creator/tipografias.json`) |
| Tamaño | pantalla llena 240–420 px (llena el ancho, interlineado 0,78) · cascada 72–96 px · bloque apretado 110–150 px, interlineado 0,72 · palabra caligráfica 200–260 px · lectura entre medias 56–64 px |
| Color y sombra | crema `#F4EFC8` o blanco; sombra muy suave `0 4px 24px rgba(0,0,0,.25)`; ninguna caja |
| Posición | pantalla llena: todo el ancho (x 40–1040), puede tapar la imagen · cascada: diagonal descendente de arriba-izquierda a abajo-derecha en la zona libre · bloque apretado: tercio superior o el hueco del plano · palabra caligráfica: arriba (y 300–600) |
| Palabras por bloque | pantalla llena 4–7 · cascada 1 por vez, hasta 6 · bloque apretado 2–5 · caligráfica 1 · lectura 1–2 |
| Entrada / salida | pantalla llena: aparece de golpe y se queda la frase · cascada: cada palabra aparece al decirse en su posición y se quedan todas hasta el final de la frase · bloque: líneas con fundido escalonado 3 f · caligráfica: fundido 8 f · todo sale con corte al terminar la frase |
| Palabra clave | en **cursiva** de la misma familia; la palabra-emoción, en caligráfica |
| Variaciones | 1 Pantalla llena (gancho y remate) · 2 Cascada · 3 Bloque apretado · 4 Palabra caligráfica |
| Cuándo | 5D; alternativa en 5A |
| Cuándo no | tutoriales, demostraciones, Business; cuando el fondo es claro y crema no contrasta (pasar a blanco con sombra) |

## Pendiente

- Aprobar S2–S9 con un video real cada uno; hasta entonces son candidatos.
- Medir S8 y S9 en un still sobre una toma real del usuario con palabras largas y tildes (las muestras de la guía son el primer paso).
- Licencias de Instrument Serif y Pinyon Script: comprobar la ficha antes del render final.
