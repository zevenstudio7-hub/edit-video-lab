# Identidad video-zeven

Decisión del usuario (2026-10-04): todos los formatos de video comparten la identidad que quedó aprobada con `#edit-2-pantalla-dividida` (referencia VIDEO-001, `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`): los mismos colores, tipografías, subtítulos, sonido y demás. Cada formato decide su estructura y su motion; la identidad no cambia de un formato a otro. **Excepción (2026-10-05):** `#edit-5-creator` permite elegir tipografía, colores y estilo de subtítulos mediante un perfil (`formatos/edit-5-creator/CUESTIONARIO.md`); sin perfil rige esta identidad. **Excepción (2026-10-09):** los elementos de Motion UX (tarjetas, UI simulada, stickers) toman sus colores del perfil de `formatos/motion-ux/` (se pregunta una vez); sin perfil rige esta identidad. Los subtítulos de lectura aprobados no cambian. **Cambio (2026-10-09):** los subtítulos ya no son uno solo: cada variante elige su estilo dentro del catálogo S1–S9 (`formatos/subtitulos/SUBTITULOS.md`). Los de esta identidad son **S1**, el único aprobado, y siguen siendo el por defecto de 1A, 1C y 2A.

## Colores (paleta ZevenPRO, `library/brand/zevenpro.ts`)

| Uso | Color |
|---|---|
| Fondo de los gráficos | crema `#F4F1EA` → azul claro `#E8EDF1` / `#DCE7F2`. Los gráficos no llevan fondo oscuro de base |
| Tarjetas | blanco `#FFFFFF`, borde `#E4E1DA`, sombra ligera |
| Texto de los gráficos | `#17171D`; secundario `#6F7280` |
| Énfasis, botones, líneas y marcadores | amarillo `#F5C518`; suave `#FFF3B8` |
| Lo digital (pantallas, tecnología, IA, datos) | azul `#0057FF`, solo para eso |
| Alertas | rojo `#E1062C`, con moderación |

La paleta se aplica a los gráficos en movimiento. **Los subtítulos no la usan.**

## Tipografía

- **Inter Tight** (`@remotion/google-fonts/InterTight`): 800 en la lectura, 900 en los énfasis y 700–900 en las etiquetas de los gráficos.
- La tipografía de marca oficial y el logo siguen pendientes en el perfil ZevenPRO. Cuando se definan, sustituyen a Inter Tight en los gráficos; los subtítulos se revisarán aparte.

## Subtítulos

Desde el 2026-10-09 hay un catálogo de nueve estilos (`formatos/subtitulos/SUBTITULOS.md`, datos en `subtitulos.json`). La orden declara `subtitulos`; sin él rige el por defecto de su variante. Lo que sigue es **S1**, el estilo de la identidad y el único aprobado:

Receta `TypeCaptions`, variante `texture` (`library/recipes/TypeCaptions.tsx`):
- **Lectura:** bloques de 2–4 palabras cortados en la puntuación, blancos, sin caja y con sombra.
- **Énfasis:** bloques grandes apilados de 1–3 líneas, de tamaños mixtos, con textura rosa `#f4c0ca` o roja `#ff4b2e` en las ideas clave. **Sustituyen** a la lectura en sus palabras.
- Tiempos por palabra reales; sin ellos no se activan los énfasis.
- Posición de referencia en 9:16: lectura centrada en y = 1438 (66 px) y énfasis apoyado en y = 1480 (96 / 128 / 160 px), entre x 65 y 940.

Reglas comunes a todos los estilos (área segura, una sola cosa que leer, nada sobre el rostro, tiempos reales): las del catálogo. En `#edit-4-business` la marca del cliente puede sustituir a ZevenPRO en los gráficos y en el acento de S7.

## Sonido

- **Voz:** una sola pista continua, limpia, a −14 LUFS y −1,5 dBTP. El audio de los planos de cámara va silenciado. Si el usuario entrega su voz mejorada, sustituye a la generada.
- **Efectos:** sonidos propios `zp-` (`library/sfx/synth-sfx.mjs`), uno por aparición, movimiento y énfasis, elegidos por lo que se dice. Suenan unos 6 dB por debajo de la voz.

## Pantalla y salida

- **Área segura de Instagram Reels (orgánico):** x 65–1015, y 250–1500; nada a la derecha de x = 940 por debajo de y = 1000. Si el video se pauta como anuncio, aplicar los márgenes de Meta (14 % arriba, 35 % abajo, 6 % a los lados).
- **CTA:** botón amarillo con un cursor que lo pulsa en la palabra de cierre («Seguir» en la referencia). La acción cambia según el objetivo del video.
- **Exportación:** H.264, 1080×1920, 30 fps (1920×1080 en 3C), con la corrección del desfase de audio AAC del render (`src/videoAnalysis/fixRenderAudioSync.mjs`). El procedimiento está en `formatos/edit-2-pantalla-dividida/FORMATO.md` → «Exportación».

## Pendiente

- Tipografía de marca y logo.
- Reglas para fondos oscuros, si algún formato los necesita: la referencia de `#edit-1-motion` usa tarjetas oscuras, y en video-zeven serían blancas salvo que se apruebe otra cosa.
