# #edit-5-creator — definición (antes `#edit-creator`)

Estado: **definido el 2026-10-05, sin aprobación audiovisual**. Primero se prueba con un video real; hasta entonces las piezas marcadas «por construir» no existen. **Actualizado el 2026-10-09:** renombrado a `#edit-5-creator`, ampliado con la referencia de creador (abajo) y con cuatro variantes 5A–5D y su estilo de subtítulos.

## Para quién y qué hace

Para creadores que **unen tomas y las visten encima**: cortes precisos sobre la toma principal, tomas de apoyo, capturas de pantalla, B-roll, emojis, subtítulos con tipografía que genere gancho y efectos de sonido. A diferencia de `#edit-3-organico` (edición mínima, discreta), aquí la edición es visible y buscada; a diferencia de `#edit-2-pantalla-dividida`, el apoyo va **superpuesto** o a pantalla completa, no en una zona fija.

## Qué es «creator» (referencia del 2026-10-09)

Edición de **creador**: la voz (a cámara o en off) lleva el video y se **viste encima** con iconos, emojis, stickers, fotos superpuestas, texto y sonido. No es un estilo de texto: el texto es solo una de las capas. Lo que se observa en la grabación de referencia (`creator-1`, ver `formatos/motion-ux/img/INDICE.md`):

- Presentador a pantalla completa; **captions de 1–3 palabras** al centro, justo sobre el pecho, sin caja, con corte duro.
- **Stickers e iconos** (objetos 3D de color suave, emojis) que aparecen uno a uno con rebote y luego flotan; uno por concepto.
- **Fotos o recuadros superpuestos** con borde glass cuando el presentador pasa a segundo plano.
- Una **nota técnica en mono** con etiqueta rotada para errores o datos (`nota-mono`).
- Sonido de apoyo en cada aparición (muy bajo la voz).

## Motion UX y estilos de texto dentro de edit-5

- Cuando el contenido trata de herramientas, tecnología, software o sistemas digitales, **Motion UX es el motion por defecto** (`formatos/motion-ux/MOTION-UX.md`), con intensidad media: recuadros de UI, tarjetas, escritura y cursor como **overlays**, no a pantalla completa por rutina.
- Los 10 estilos de texto (`formatos/motion-ux/TEXTOS.md`) son el catálogo de rótulos de este formato: `caption-palabra` para lectura continua, `gancho-apilado` para los primeros 1–3 s, `titular-mixto`, `cursiva-editorial` y `palabra-grande-sans-serif` para énfasis, `nota-mono` para datos técnicos. Cada estilo base de `estilos.json` indica cuáles usa.
- Stickers, flotar y aparición escalonada: presets `stickers-escalonados` y `flotar` de `formatos/motion-ux/MOVIMIENTOS.md`.
- Colores: `perfil.json` de este formato manda sobre el de Motion UX en los textos; el de Motion UX manda en la UI simulada. Si solo existe uno, se usa para ambos.
- Estado: **candidato**. Ningún preset se ha renderizado con Remotion ni aprobado audiovisualmente.

## Material por carpeta

El usuario sube cada tipo de elemento en su carpeta (`README.md`). El agente cataloga cada archivo en la orden (archivo, rango útil, qué muestra, procedencia) y lo asigna a una frase.

## Política de producción (matriz de enrutamiento)

| Remotion/FFmpeg | Material real | Motion | IA imágenes | IA video |
|---|---|---|---|---|
| ON | PRIORIDAD | MEDIUM (overlays y texto; sin motion a pantalla completa por rutina; Motion UX por defecto si el tema es digital) | OFF por defecto | OFF |

IA solo con decisión explícita y justificada en la orden. Emojis, iconos y texto se resuelven con Remotion antes que con cualquier proveedor.

## Cómo se pide un video

La orden declara `EDIT_TYPE: #edit-5-creator`, una **variante** (5A–5D = estilo base de `estilos.json`), un estilo de **subtítulos** (S1–S9) y un bloque **`cambios`** en texto libre. Regla: el estilo base fija los valores por defecto; el bloque `cambios` prevalece sobre ellos y se registra en la orden con su motivo. Ejemplo: «variante 5A (collage), subtítulos S2; hook en Anton amarillo; emoji 🔥 al decir "precio"; captura de la factura entre 12 s y 15 s».

## Tomas: principal y apoyo

1. Tomas con voz hablada continua = **principal**; sin voz, grabaciones de pantalla, B-roll y capturas = **apoyo**. Es un criterio inicial: el agente lo propone con la transcripción y **el usuario confirma** antes de montar.
2. Las de apoyo se catalogan en la orden (archivo, rango útil, qué muestran, procedencia) y se asignan a frases, no a segundos sueltos.
3. Una captura o interfaz se muestra con material real y verificable (RAÍZ). Si el usuario no la entrega y debe ser exacta, se le pide.

## Identidad

Por defecto rige la identidad video-zeven (`formatos/identidad-video-zeven.md`). **Excepción pedida por el usuario el 2026-10-05:** en este formato tipografía, colores y estilo de subtítulos pueden elegirse mediante el perfil (`CUESTIONARIO.md`). Sin perfil, se usa video-zeven tal cual. Los cambios por video van en el bloque `cambios`. Área segura: la de Instagram Reels orgánico de la identidad (x 65–1015, y 250–1500; nada a la derecha de x = 940 por debajo de y = 1000).

## Piezas

| Pieza | Fuente | Estado |
|---|---|---|
| Cortes precisos sin voz cortada | `CutSequence`, `qaEditAudio.mjs` | validada |
| Subtítulos de lectura y énfasis | `TypeCaptions` (`texture`), `ChunkCaptions` | validadas |
| Tipografía de hook por palabra | por construir (receta `HookCaptions`, solo si el video la pide) | candidata a crear |
| Emojis | `@remotion/animated-emoji` 4.0.438 (ya instalado) | por probar en un still |
| Overlay de captura o B-roll (entrada, salida, marco) | `FocusPanImage`, `MediaFrame`, `PictureInPicture` | por probar; falta receta de overlay si no basta |
| Punch-in y cámara | `PresenterCamera`, `SoftZoom` | validada / disponible |
| Efectos de sonido | `synth-sfx`, `SfxTrack`, `cues.ts` | validada / candidata |
| Voz | `clean-voice` | candidata |
| Palabra clave con tinte | `KeywordTint` | candidata |

La lista no se construye por adelantado: se crea solo lo que el primer video pida y no resuelva nada existente.

## Cuando el pedido incluye algo que no existe

Orden de resolución, sin saltarse pasos: 1) `library/catalog.json`; 2) `src/components`; 3) Remotion oficial y los paquetes `@remotion/*` ya instalados; 4) crear la receta nueva como `candidata` en `library/recipes`, con muestra en la galería y entrada en el catálogo (regla de alta). Tope inicial: **2 recetas nuevas por video** sin aprobación del usuario (valor de partida, a revisar con el primer video).

## Variantes (estilos base, acordadas el 2026-10-09)

Cada variante es un estilo base de `estilos.json` (datos, no código distinto). La orden declara `variante` (o el id del estilo) y `subtitulos` (catálogo: `formatos/subtitulos/SUBTITULOS.md`).

| Variante | Estilo | Qué es | Cuándo usarla | Subtítulos (defecto · alternativa) |
|---|---|---|---|---|
| **5A Collage** (por defecto) | `collage` | Unir tomas y superponer capturas, B-roll, emojis y mosaico 2×2 | el creador cuenta algo y lo viste con pruebas y apoyos | S2 · S5 |
| **5B Hook** | `hook` | Gancho agresivo, ritmo alto, tipografía protagonista | piezas cortas para captar atención | S3 · S2 |
| **5C Explicativo** | `explicativo` | La captura es la prueba; nota mono y dato en caja | tutoriales y demos donde nada debe competir con la evidencia | S2 · S6 |
| **5D Editorial lifestyle** | `editorial` | Muchas tomas de apoyo de la vida diaria + voz en off, poco presentador | reflexiones y marca personal con imagen cuidada (video 2) | S9 · S5 |

Recursos de Creator registrados a partir del video 3 (2026-10-09), además de stickers escalonados y nota mono:
- **Dato en caja:** recuadro blanco con un dato real (p. ej. un total de usuarios). Solo con cifras verificables.
- **Mosaico 2×2:** cuatro tomas de apoyo a la vez, para enumerar o mostrar variedad.

### 5D Editorial lifestyle
- Tomas de apoyo de la vida diaria (cocina, oficina, café, calle, atardecer), gran angular y de mano; el presentador entra poco.
- Cortes con el ritmo de la frase; gradación cálida natural; sin emojis ni stickers.
- Subtítulos S9: serif condensada en crema con cuatro usos (pantalla llena, cascada, bloque apretado, palabra caligráfica) y lectura breve entre medias.
- Referencia interna (reel de otro autor, solo estilo): `referencias/analisis/v2-creator_0-24.jpg`, `v2-creator_24-44.jpg` y `v2-zoom.png`.

## Referencias registradas

| Video | Archivo original (sin versionar) | Análisis | Qué se tomó |
|---|---|---|---|
| video 2 (2026-10-09) | `~/Downloads/ScreenRecording_10-09-2026 08-29-07_1.MP4` (43,5 s, 1206×2622; los subtítulos pequeños de abajo son la traducción de Instagram, no forman parte del estilo) | `referencias/analisis/v2-*` | variante 5D y subtítulo S9 |
| video 3 (2026-10-09) | `~/Downloads/ScreenRecording_10-08-2026 24.mov` (el mismo reel que `creator-1` / `texto-1`) | `referencias/analisis/v3-creator.jpg` y `formatos/motion-ux/img/INDICE.md` | S2 + S3, dato en caja, mosaico 2×2 |

## Medidas y límites sin verificar

- Tipografías, tamaños y densidad de SFX/emojis de `estilos.json` son **puntos de partida**; no se han visto en un render. Se validan con un still por receta y la preview.
- Las licencias de emojis animados y de cada tipografía se comprueban al integrarlas; `tipografias.json` indica la licencia esperada, no verificada.
- El catálogo enruta `#edit-5-creator` con los mismos valores que `#edit-1-motion` como propuesta de partida.

## Proceso

1. Perfil (una vez) y 5 preguntas del video (`CUESTIONARIO.md`).
2. Tomas y transcripción con tiempos por palabra; clasificar principal y apoyo; usuario confirma.
3. Orden `video-orders/VIDEO-XXX.json`: EDL, estilo base, `cambios`, apoyos asignados a frases.
4. Un still por receta nueva y por tipografía elegida; luego preview.
5. Comprobaciones, exportación y aprobación como en `formatos/edit-2-pantalla-dividida/FORMATO.md` (incluida la corrección del desfase de audio AAC). Render final solo con autorización expresa.
