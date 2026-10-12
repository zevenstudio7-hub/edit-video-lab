# VIDEO-002 — Muse for Small Business («RSS - Entretenimiento»)

- **Formato:** `#edit-1-motion`. Es el primer video del formato (`../FORMATO.md`).
- **Objetivo:** explicar, con las palabras que el presentador dice en sus dos tomas, cómo las redes pasaron de entretenimiento a atención, audiencias y ejecución, y qué cambia para los negocios con Muse for Small Business de Meta.
- **Estado:** preview v3 pendiente de revisión (2026-10-05). Sin MP4: hay recursos con derechos `requiere_revision` (ver «Recursos externos y derechos»).
- **Versiones:**
  - **v2:** velocidad 1.1x e imagen oficial de Muse con la mascota Jolly.
  - **v3:**
    - voz mejorada del usuario;
    - franja negra integrada con el motion, sin degradado;
    - iconos 3D propios y relieve SVG;
    - @yeirodriguez.co en las cuentas de redes.
- **Preview:** composición `Video002` en el Studio (`pnpm dev` → http://localhost:3000/Video002). Dura 1:14,3 a 1.1x (2230 frames, 1080×1920, 30 fps; a 1x eran 1:21,8).
- **Si el Studio muestra «Musa», «Tienda» o «Noción»:** es el traductor automático del navegador. La composición va marcada como «no traducir» y el render no se ve afectado.
- **Orden del usuario:** `direccion.md`, tal cual la entregó. La grabación manda sobre el guion orientativo.
- **Orden técnica:** `video-orders/VIDEO-002.json` (`edl` = decisiones con motivo; `timeline` = resuelto a frames).

## Entregables

1. **Mapa de cortes:** `mapa-de-cortes.md`, con versión `mapa-de-cortes.csv`. 15 cortes con archivo, entrada, salida, posición en la pista y frase.
2. **Guion técnico:** `guion-tecnico.md`. 14 tramos con la voz real, la imagen, la cámara, los énfasis y el sonido, más las diferencias con el guion orientativo.
3. **Preview:** `Video002` en el Studio, con motion, subtítulos, música y efectos.

## Material

- `tomas/`: las dos tomas del usuario, 4K vertical a 60 fps, sin versionar.
  - **A** `FBF4A159…`: ideas 1–8.
  - **B** `B0B164E0…`: ideas 9–12 y la pregunta final.
- `public/video-002/`:
  - proxies 1080p30 (`hq/`);
  - voz:
    - `dialogue.wav`: la voz mejorada del usuario, colocada a la muestra;
    - `dialogue-original.wav`: el montaje propio a 1.1x, que sirve de referencia;
    - `dialogue-1x.wav`: el montaje a 1x;
  - efectos (`sfx.wav`) y música (`music.wav`);
  - iconos 3D horneados (`iconos3d/*.webp`) y relieve en PNG (`relieve/*.png`), generados con `buildIconSprites.mjs` y `buildRelief.mjs`;
  - logos de marca (`logos/`, de Simple Icons 16.34.0; Canva, de canva.com/newsroom);
  - captura verificada del anuncio (`support/meta-anuncio-titulo.jpg`, de about.fb.com);
  - imagen oficial de Muse con la mascota Jolly (`support/meta-muse-oficial.png`, de about.fb.com), sin alterar.
- `exportaciones/Video002-v2-render-studio.mp4`: render de la preview v2 que hizo el usuario desde el Studio (2026-10-05 15:33; estaba en `out/`). Lleva la voz original y el audio llega 42,7 ms tarde, el cebado AAC conocido de los renders de Remotion. De ese audio salió la voz mejorada. **No es la exportación final:** hay derechos pendientes, y la exportación final se hará con la corrección AAC (`../../edit-2-pantalla-dividida/FORMATO.md`).
- `material/audio muse-enhanced-v2.mp3`: la voz mejorada que entregó el usuario el 2026-10-05. Se copió desde `../referencias/`, donde sigue el original.
- `revision/`: hojas de fotogramas de cada versión del preview y de las tomas.

## Recursos externos y derechos (RAÍZ, «Regla de recursos de apoyo»)

Investigación completa en `analysis/video-002-support-research.json`; los recursos usados están dados de alta en `library/assets.json`.

| Recurso | Fuente | Derechos |
|---|---|---|
| Captura del anuncio (título y fecha) | about.fb.com (Meta) | `permitido`: cita con fuente visible |
| Imagen oficial de Muse: logotipo, mascota Jolly y conectores | about.fb.com (Meta), portada del anuncio | `requiere_revision`: sin licencia escrita. El paquete de prensa de Meta exige uso editorial no comercial y prohíbe alterar las imágenes (se muestra completa, sin recortes) |
| Logos de Facebook, Instagram, TikTok, Meta, Shopify y Notion | Simple Icons 16.34.0 (CC0; marcas de sus titulares) | `requiere_revision`: la RAÍZ prefiere el archivo oficial del kit. El kit de Meta exige aceptar sus términos para descargarlo |
| Logo de Canva | canva.com/newsroom (cabecera oficial) | `requiere_revision`: licencia no revisada |
| Iconos 3D (reloj, ojo, personas, tienda, diana, lupa, carrito, caja, palomitas…) y relieve SVG | creación propia del laboratorio (three.js y SVG) | `permitido` |

Antes del render final hay que decidir sobre los recursos `requiere_revision`: confirmar el uso, aceptar los términos de los kits oficiales o pedir permiso.

## Verificación del anuncio (2026-10-05)

- **Fuente oficial:** Meta, «The Future Is for Everyone: Muse for Small Business», 29 de septiembre de 2026 (https://about.fb.com/news/2026/09/introducing-muse-small-business/).
- **Conectores:** Meta nombra, entre otros, Shopify, Canva y Notion, además de las cuentas comerciales de Facebook e Instagram. También confirma el ejemplo de dar un objetivo como «encontrar nuevos clientes».
- **Disponibilidad:** Muse está disponible en EE. UU. y Canadá. Aparece en el video como nota secundaria, no como subtítulo.
- **Interfaz:** la página no muestra capturas de la interfaz de Muse. Las pantallas dibujadas son conceptuales y llevan «Ejemplo ilustrativo».

## Comprobaciones hechas

- **Voz mejorada (v3)** (`analysis/video-002-voz-mejorada.json`):
  - **Alineación:** el MP3 del usuario es la voz montada a 1.1x, pero llegaba 67,7 ms tarde (3251 muestras), un desfase constante en toda la pista (dispersión de 3 muestras). Se adelantó a la muestra; el desfase residual frente al montaje es de 0 a 3 muestras.
  - **Contenido:** no trae restos de música ni de efectos.
  - **Nivel:** el original estaba 10 dB por debajo. Se igualó a −14,5 LUFS / −1,5 dBTP con ganancia fija y un limitador de picos (más de 1 dB de reducción solo el 8 % del tiempo), sin otro proceso.
  - **Transcripción:** whisper la transcribe completa.
- **Franja y motion (v3):**
  - fotogramas de control de las 14 escenas y de las transiciones;
  - las piezas de m1, m6, m8 y m9 se movieron para no invadir el carril derecho de Reels (x > 940 bajo y = 1000);
  - Studio, con los iconos horneados y sin WebGL en la vista previa: de m8 a m10 avanza al 93 % del tiempo real en el navegador integrado de la app (11,2 s en 12,1 s). El audio va a 38 ms de la imagen y no hay errores en reproducción normal. Con los iconos en 3D en vivo, el Studio se congelaba 14 s al entrar en m8;
  - hoja de control de la v3: `revision/hoja-preview-v3.jpg` (19 fotogramas renderizados desde la composición real).

- **Narración:**
  - transcrita con whisper; las dudas se resolvieron con Gemini y análisis de señal;
  - sin falsos arranques («las»), muletillas («eh») ni el intento fallido;
  - la pista montada se volvió a transcribir completa: no falta ni sobra ninguna palabra.
- **Pausas:** ninguna supera los 450 ms. A 1.1x la mayor es de 410 ms, la expresiva tras «ventas».
- **Velocidad 1.1x:** la voz se acelera con Rubber Band conservando tono y formantes y después se normaliza (−14,5 LUFS). La pista acelerada se transcribió completa. Las animaciones no se aceleran.
- **Voz:**
  - las dos tomas igualadas (±1,1 dB); la voz final a 1.1x queda en −14,5 LUFS / −1,4 dBTP;
  - la música (−31 LUFS) queda 16,5 LUFS por debajo de la voz;
  - los efectos tienen un máximo momentáneo de −27,6 LUFS.
- **Imagen:**
  - las 14 escenas son contiguas y ningún plano se sale de su toma: cero fotogramas sin imagen;
  - las tarjetas junto al presentador se colocaron midiendo la cara en cada toma;
  - todo queda dentro del área segura de Reels.
- **Studio:** suenan tres pistas (voz, efectos y música), con 0 ms de diferencia en reproducción estable, sin audio de los planos y sin errores. `pnpm typecheck` y `pnpm library:check` pasan.

## Pendiente de oído (usuario)

- Las dos uniones dentro de una frase: «…del tiempo y | el avance…» y «…Canva, | Notion…».
- «Muse» en «Meta acaba de lanzar Muse for Small Business»: se dice rápido. La señal confirma la sílaba, pero los dos transcriptores la fundieron con «for».
- «TikTok» (whisper oye «y todo»).
- En la voz mejorada, whisper entiende peor que en la original tres frases: «sí compiten por entretenerte», «Meta acaba de lanzar» y «ayúdame a buscar». Puede venir del mejorador; hay que escucharlas.
- Escucha en el altavoz de un teléfono (orden §6).
