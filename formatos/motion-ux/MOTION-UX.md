# Motion UX — estilo de movimiento predeterminado para tecnología y software

Estado: **definido por el usuario el 2026-10-09; sin aprobación audiovisual.** Los valores son de partida, leídos de las referencias; se validan con un still y la preview. Referencias: `img/` (14 imágenes + hojas de fotogramas con tiempo). Implementación de referencia ejecutable: `specimen/index.html`.

## 1. ¿Cómo se llama este estilo?

«Glassmorphism» acierta en la mitad de las referencias. El conjunto reúne **tres familias** que conviven en la misma interfaz y que aquí se tratan como un solo sistema, **Soft Glass UI** (`soft-glass-ui`):

| Familia | Qué es | Dónde se ve | Superficie en el sistema |
|---|---|---|---|
| **Glassmorphism → «Liquid Glass»** | Paneles translúcidos con desenfoque del fondo, borde luminoso (la arista superior brilla más) y capas superpuestas sobre un degradado vivo. «Liquid Glass» es el nombre que Apple dio en 2025 a su evolución más suave y refractiva | ref-04, 05, 07 (nav, tarjeta de perfil y menú sobre azul/verde agua) | `glass` |
| **Soft UI (neumorfismo moderno, claro)** | Gris-blanco, volumen por sombras difusas y luz interior, botones en píldora, interruptores y steppers «de plástico suave» | ref-02, 03, 09, 14 y los videos mov-1/mov-2 | `soft` (**defecto**) |
| **AI glow (borde iridiscente)** | Píldora o caja con borde de degradado de colores y resplandor: marca de «esto es inteligencia artificial» | ref-01, 06, 11, 12 | componente `borde-aurora` |
| **Variante oscura** | El mismo glass sobre fondo casi negro con luz de color por fila | ref-08, 10 y mov-4 | `dark` |

Y lo que se **anima** sobre ese estilo se llama **UI motion / product motion** (movimiento de interfaz de producto): pantallas simuladas que se escriben, se pulsan, se apilan y se inclinan en 3D.

## 2. Cuándo se usa (enrutamiento por tema)

**Es el estilo predeterminado de motion** cuando el guion, la orden o lo que se dice trata de:
herramientas, tecnología, software, apps, plataformas, IA y prompts, sistemas digitales, automatización, interfaces, dashboards, configuraciones y «cómo se usa X» paso a paso.

Detección: mirar la transcripción y la orden; si aparece un producto, una pantalla, un botón, un menú, un flujo o un resultado digital → Motion UX. Si el tema es una persona, una emoción, un lugar, una historia o un hecho sin pantalla → **no** se fuerza: manda la identidad video-zeven y el formato.

| EDIT_TYPE | Intensidad de Motion UX | Cómo entra |
|---|---|---|
| `#edit-1-motion` | alta | UI a pantalla completa mientras la voz sigue debajo; objetos y paneles alrededor del presentador. Variante `dark` sobre la franja negra (decisión del 2026-10-05) |
| `#edit-2-pantalla-dividida` | media | zona superior de apoyo: tarjetas, escritura, cursor y baraja; presentador abajo |
| `#edit-3-organico` | baja | solo señaladores mínimos (anillo, flecha) y un rótulo; sin tarjetas flotantes ni cruces |
| `#edit-4-business` | baja-media | tarjetas y UI simulada sobrias con la marca del cliente si la entrega; solo si el producto es digital |
| `#edit-5-creator` | media | overlays flotantes, recuadros de UI, stickers y captions al estilo creador |
| `#edit-6-avatar` (antes `#edit-4-avatar`) | no aplica aquí | se rige por la RAÍZ (uso personal) |

La orden puede subir, bajar o desactivar la intensidad en su bloque `cambios`; la orden gana.

## 3. Reglas de verdad (RAÍZ)

- Una pantalla **simulada** es una ilustración conceptual: usa chrome de interfaz **genérico** («Asistente IA»), no la marca de un tercero imitada. Nunca se presenta como captura real, evidencia ni resultado.
- Cuando el video afirme algo sobre un producto real (qué hace, qué cuesta, qué responde), esa parte va con **captura o grabación verificable** (RAÍZ → investigación de apoyos) y con su fuente en `analysis/<video-id>-support-research.json`.
- Logos, iconos de marca y mascotas: el archivo oficial, entero; no se redibujan ni se pasan a 3D.
- Las referencias de `img/` son diseños de otros autores usados **solo como referencia de estilo**: no se reutilizan sus textos, marcas ni imágenes.

## 4. Perfil de color (una sola vez)

Antes del primer video con Motion UX, la skill hace **una** vez las preguntas de `CUESTIONARIO.md` y guarda `formatos/motion-ux/perfil.json`. El usuario elige el color escribiéndolo (hex o nombre) o con una imagen de referencia, y todo el sistema se deriva de esa tinta (`tokens.json → paleta.derivacion_desde_ui`). Sin perfil rige ZevenPRO (azul `#0057FF` para lo digital, amarillo `#F5C518` como resalte). No se vuelve a preguntar salvo «cambia mi estilo».

## 5. Anatomía: superficies y componentes

Valores completos en `tokens.json`; el aspecto, en `specimen/index.html` (escena E) y en `img/`.

| Componente | Anatomía mínima | Superficie | Ref. |
|---|---|---|---|
| Tarjeta / ventana | radio 48, sombra larga y difusa, luz interior superior | soft / glass / dark | 02, 05, 09 |
| Píldora de botón | radio 999, altura 112–150, degradado ui→ui-600, sombra de color | soft | 02, 03 |
| Botón AI glow | píldora blanca con borde iridiscente que gira y halo | soft | 01, 12 |
| Botón aurora interior | píldora gris-blanco con manchas de color desenfocadas dentro | soft | 06 |
| Botón glossy | píldora azul con centro claro, borde blanco grueso | soft | 13 |
| Caja de prompt | tarjeta con texto, chips de contexto, botón de envío circular | soft | 12 + mov-1 |
| Chips y etiquetas | píldora pequeña; activa = ui-100 + check | soft | mov-1 |
| Stepper | círculos con degradado, conector, el paso activo con anillo y brillo | soft | 03 |
| Interruptor / selector | pista hundida, perilla blanca con sombra | soft | 03 |
| Barra de navegación | píldora glass con 5 iconos de línea y etiqueta; el activo con relleno | glass / soft | 04, 09 |
| Lista / menú | filas con icono, separadores finos, la activa con relleno | glass / dark | 07, 08, 10 |
| Tarjeta de perfil | avatar, cifras en baldosas glass, botón blanco | glass | 05 |
| Notificación | fila con icono de color, título, hora y borde de color | dark | 08, 10 |
| Insignia numérica | círculo con degradado y número en 800 | todas | 08, 10 |
| Ventana de app | marco blanco con tres puntos y contenido | soft | mov-2 |
| Cursor | flecha negra con borde blanco y sombra | todas | mov-1 |
| Sticker 3D | objeto de color suave con ojos/brillo, flotando | — | creator-1 |

## 6. Composición para 9:16

- Ancho máximo de tarjeta 960 px (márgenes 60); una tarjeta protagonista por plano.
- **Ampliar la UI**: las referencias usan texto de 9–14 px en tarjetas de 400 px. En 1080×1920 el texto de interfaz va a ≥ 30 px y el de lectura a ≥ 42 px.
- Dentro del área segura de Reels (x 65–1015, y 250–1500; nada a la derecha de x = 940 bajo y = 1000).
- Una acción por vez; el cursor o el foco guían. Si el presentador está en cuadro, la UI ocupa la mitad superior (ver `presentador-en-marco`).
- Contraste ≥ 4,5:1 en texto de interfaz; velo `rgba(0,0,0,.18)` bajo el glass sobre foto o video.
- Coste de render: como máximo 3 capas con `backdrop-filter` por fotograma; el resto, sombras y degradados.

## 7. Movimiento, texto y sonido

- Movimientos: `MOVIMIENTOS.md` y `movimientos.json` (20 presets con parámetros).
- Textos: `TEXTOS.md` y `textos.json` (10 estilos).
- Sonido: mapa evento → efecto en `tokens.json → sonido` (efectos sintetizados `zp-*` de `library/sfx`).

## 8. Cómo recrearlo (cualquier IA)

El estilo está escrito en texto plano y datos (Markdown + JSON + un HTML sin dependencias) para que no dependa de una herramienta concreta:

1. Leer el perfil (`perfil.json`) o aplicar los valores por defecto; derivar la paleta con la fórmula de `tokens.json`.
2. Elegir superficie (`soft` por defecto; `glass` para lanzamientos o IA; `dark` solo si el perfil o la orden lo piden).
3. Armar la escena con los componentes de §5 y los movimientos de `movimientos.json`; los rótulos con `textos.json`.
4. Para el aspecto exacto de cada componente y de cada movimiento, abrir `specimen/index.html` (sus escenas A–F reproducen los movimientos de las referencias) y copiar la matemática.
5. En Remotion: cada escena es una función pura de `useCurrentFrame()`. `snippets/primitivas.ts` ya trae los movimientos como funciones (`entradaDesenfoque`, `subidaTarjeta`, `baraja3d`, `cursorClic`, …). No usar transiciones CSS ni `setTimeout`.
6. Un still por componente nuevo y comparación con `img/` antes de la preview.

**Orden de resolución** (RAÍZ y `library/README.md`): catálogo → `src/components` → Remotion oficial → crear receta como `candidata`. Este estilo es una **definición**, no una receta construida: la primera orden que lo use crea las recetas mínimas que necesite (tope de 2 por video sin aprobación) a partir del specimen y de las primitivas.

## 9. Pendiente / no verificado

- El 2026-10-10 se generaron stills de Remotion para los 20 movimientos y 10 rótulos en `src/compositions/guia/motionUx.tsx`; `snippets/primitivas.ts` quedó incluido en el typecheck al importarse desde esa entrada. Son ilustraciones propias del sistema, no recetas aprobadas. Falta revisar movimiento continuo y audio en Studio. El specimen conserva sus capturas de tres paletas.
- Tiempos y desenfoques leídos a ojo de grabaciones de pantalla (error esperado ±2 frames).
- Tipografías exactas de las referencias sin identificar; se usan equivalentes OFL.
- **Decisión abierta:** la variante `dark` y la franja negra de `#edit-1-motion` (2026-10-05) coexisten por propuesta; la identidad video-zeven dice «sin fondo oscuro de base» y deja las reglas de fondos oscuros como pendiente. Confirmar con VIDEO-002/003.
- **Decisión abierta:** si Motion UX sustituye también a los iconos 3D de fieltro de VIDEO-002/003 o convive con ellos. Por ahora conviven: Motion UX manda en pantallas, interfaces y objetos digitales; el fieltro, en conceptos y objetos físicos.
