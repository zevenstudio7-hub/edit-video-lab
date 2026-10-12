# Gemini Video Lab

## Objetivo

Construir un sistema de edición y producción audiovisual asistido por IA para transformar material grabado por el usuario en contenido listo para publicar, usando principalmente Gemini para análisis e interpretación y Remotion para composición, motion graphics y render.

El sistema debe reducir al mínimo la búsqueda manual de recursos y convertir estrategia, guion o material bruto en una orden de edición reproducible.

## Flujo operativo

Google Drive / material grabado / guion cuando exista
→ ChatGPT organiza estrategia y plan de edición
→ GitHub recibe una orden VIDEO-XXX
→ Antigravity consulta esta RAÍZ + la orden
→ Gemini analiza cuando corresponda
→ Remotion ejecuta composición y motion graphics
→ render
→ revisión
→ video final

Cuando sea necesario:

Gemini / modelos de imagen / modelos de video / otras herramientas IA
→ generan recursos de apoyo
→ Remotion los integra

## Roles

### ChatGPT
- revisar guion, material y objetivo;
- definir estructura narrativa;
- decidir cortes, apoyos visuales, subtítulos, motion graphics, B-roll y CTA;
- crear y actualizar órdenes VIDEO-XXX en GitHub;
- mantener la dirección del sistema.

### GitHub
- fuente de verdad del proyecto;
- almacenar RAÍZ, componentes, presets y órdenes de video;
- registrar evolución y cambios.

### Antigravity
- agente ejecutor;
- consultar siempre esta RAÍZ antes de ejecutar una orden;
- leer VIDEO-XXX;
- reutilizar componentes existentes;
- crear componentes nuevos solo cuando un caso real lo requiera;
- validar y renderizar.

### Remotion
- motor de composición;
- timeline programático;
- subtítulos;
- motion graphics;
- overlays;
- reencuadres;
- transiciones;
- integración de imágenes, video, audio y recursos generados;
- render final.

### Gemini
- análisis e interpretación del contenido;
- comprensión de video, audio, guion y material;
- apoyo para estructurar planes de edición;
- generación de instrucciones estructuradas;
- futura automatización del flujo.

## Principios

- editar primero material grabado por el usuario;
- priorizar control, calidad y reproducibilidad;
- reutilizar componentes antes de crear nuevos;
- evitar código distinto para cada video cuando pueda resolverse con componentes o presets;
- evitar sobreconstrucción;
- mantener separados edición de material existente y producción audiovisual generativa;
- el usuario no debe tener que buscar manualmente material de apoyo salvo que sea estrictamente necesario.

## Regla de recursos de apoyo

La investigación visual es obligatoria para **cada VIDEO-XXX**, después de comprender la narración y antes de diseñar los apoyos. Investigar no obliga a llenar el video de recursos externos: solo se integran los que expliquen, demuestren, contextualicen o hagan reconocible lo que se dice.

### Orden mínimo de investigación

1. **Material del proyecto:** tomas, capturas, documentos y recursos ya entregados.
2. **Fuentes oficiales del tema:** sitio del producto u organización, newsroom, centro de prensa, kit de marca y cuentas sociales oficiales. Aquí se buscan primero imágenes, videos, capturas, logos, personajes y mascotas.
3. **Búsqueda general:** Google y buscadores de noticias para descubrir contexto, antecedentes y fuentes independientes. El buscador no es la fuente ni concede licencia; se registra la página original.
4. **Redes sociales:** publicaciones de cuentas oficiales y, cuando aporten evidencia o contexto, publicaciones públicas de terceros cuya autoría y URL puedan identificarse.
5. **Repositorios permitidos:** bancos de stock, dominio público o licencias abiertas, comprobando la licencia de cada archivo.
6. **Síntesis propia:** texto, formas, gráficos y componentes de Remotion cuando comuniquen mejor o cuando no exista un recurso externo utilizable.
7. **Generación con IA:** solo como ilustración o apoyo conceptual, nunca presentada como captura, hecho, producto, persona, interfaz, logo o evidencia real.

La búsqueda debe cubrir los conceptos, marcas, productos, personas y hechos centrales del video. No se investiga por cantidad: se detiene cuando cada necesidad visual importante tiene una opción verídica y utilizable o queda marcada como pendiente. En una reedición se reutiliza la investigación válida; solo se actualiza si cambia el contenido, aparece una necesidad nueva o la información puede haber quedado obsoleta.

### Selección y uso

- Priorizar el recurso oficial para mostrar identidad, producto, interfaz, logo, personaje o mascota oficial. Usar el archivo original del kit o fuente oficial cuando exista; no redibujar ni deformar logos.
- Las caricaturas, ilustraciones y mascotas se usan solo si tienen relación real con el tema y una función editorial. Si son generadas o conceptuales, deben poder distinguirse de una pieza oficial y no atribuirse a la marca.
- Una página pública, un resultado de Google o una publicación social no equivalen a permiso de reutilización. Antes de integrar un recurso hay que comprobar autor, origen, licencia o base de uso, atribución requerida y restricciones de la plataforma.
- El estado `permitido` exige evidencia documentada de licencia, autorización, titularidad del usuario o una base de uso aceptada para ese caso. Si falta esa evidencia, se marca `requiere_revision`; no se infiere permiso porque la cuenta o el sitio sean oficiales.
- Las referencias sin permiso claro pueden orientar la edición, pero no entran al video final como si fueran recursos autorizados. Las capturas o fragmentos usados como cita o evidencia requieren fuente visible y una decisión documentada para ese caso.
- No descargar, recortar marcas de agua, borrar créditos ni reutilizar contenido de terceros de forma que cambie su sentido.
- Solicitar material al usuario solo cuando sea privado, no esté públicamente disponible, requiera autorización del titular o deba probar una cuenta, resultado o caso exacto.

### Evidencia obligatoria

Cada edición crea o actualiza `analysis/<video-id>-support-research.json` con:

- consultas y canales revisados;
- candidatos encontrados y URL original;
- autor, cuenta o entidad responsable y si es oficial;
- tipo de recurso: imagen, video, captura, logo, personaje, mascota o referencia de estilo;
- escena y función editorial propuesta;
- estado de derechos: `permitido`, `requiere_revision` o `no_utilizable`;
- decisión: `seleccionado`, `referencia` o `descartado`, con motivo;
- fecha de consulta, atribución y ruta local cuando corresponda.

Todo recurso externo finalmente usado también se registra en `library/assets.json`. Una edición no pasa a preview revisable si faltan la investigación de los temas centrales o la procedencia de un apoyo visible. Un recurso con derechos `requiere_revision` no pasa al render final hasta resolverlo.

## Identidad video-zeven

Todos los formatos comparten la identidad video-zeven: colores ZevenPRO en los gráficos, tipografía Inter Tight, subtítulos de lectura con énfasis tipográficos con textura, efectos de sonido propios, CTA y área segura de Instagram Reels. Es una decisión del usuario del 2026-10-04 y nace del formato aprobado de `#edit-2-pantalla-dividida`. Detalle: `formatos/identidad-video-zeven.md`. Excepción (2026-10-05): en `#edit-5-creator` el usuario puede elegir tipografía, colores y estilo de subtítulos mediante un perfil; sin perfil rige video-zeven.

## Subtítulos: variantes, catálogo y posición

Decisión del usuario del 2026-10-09 (candidato; solo S1 y la variante 2A están aprobadas en un video): cada EDIT_TYPE tiene variantes `<número><letra>` (1A…5D, 15 en total) y los subtítulos se eligen de un catálogo de nueve estilos, S1–S9 (`formatos/subtitulos/SUBTITULOS.md`, datos en `subtitulos.json`). La orden declara `EDIT_TYPE`, `variante` y `subtitulos`; sin `subtitulos` rige el por defecto de la variante, y el bloque `cambios` manda sobre todo.

**Posición según el sujeto (decisión del usuario, 2026-10-10).** En los subtítulos que flotan en el plano (S5, S8 y la cascada de S9) el sujeto fija dónde va el texto, no los bordes ni el centro del cuadro: en cada plano se miden los dos espacios libres a los lados del sujeto, a la altura de su cabeza, y cada bloque se centra dentro de uno de ellos, a ≥ 3 % del ancho del sujeto y ≥ 8 % del borde del cuadro. **Nunca pegado a los costados.** Una frase partida va a la misma altura en los dos espacios; si el sujeto está descentrado, el texto se descentra con él; al cambiar de encuadre se vuelven a medir. No aplica a los estilos de zona fija (S1, S2, S4, S6, S7), ni a la pantalla llena de S9 ni al gancho de S3.

## Motion UX — motion predeterminado para tecnología y software

Decisión del usuario del 2026-10-09 (propuesta pendiente de aprobación audiovisual): cuando lo que se dice trata de herramientas, tecnología, software, IA, plataformas o sistemas digitales, el motion por defecto de **todos** los EDIT_TYPE (salvo `#edit-6-avatar`) es **Motion UX / Soft Glass UI** (soft UI + glassmorphism + borde AI glow; iconos, tarjetas, cajas de UI, escritura, cursor, botones en movimiento). Intensidad por tipo, 20 movimientos, 10 estilos de texto, paleta y sonidos: `formatos/motion-ux/MOTION-UX.md`. La orden (bloque `cambios`) puede subirla, bajarla o desactivarla. Los colores salen de un perfil que se pregunta **una sola vez** (`formatos/motion-ux/CUESTIONARIO.md`); sin perfil rigen los de ZevenPRO. Las interfaces simuladas son ilustración conceptual; una afirmación sobre un producto real exige captura verificable. Convive con la identidad video-zeven y no sustituye los subtítulos aprobados de `#edit-2-pantalla-dividida`.

## Looks de color y guión técnico

Decisión del usuario del 2026-10-09 (candidato): cada formato puede tener un **look de color** por defecto y uno alternativo, aplicados solo a las tomas grabadas (`formatos/looks/`; la orden elige ID e intensidad con `cambios`, incluyendo `look: ninguno` o `look: burdeos-calido 70 %`). La LUT se aplica con FFmpeg al derivado de metraje; si se aplica tras un render, ese pase contiene solo tomas antes de componer gráficos. Nunca se gradúa el compuesto final con textos, logos o Motion UX. Por defecto / alternativo: `#edit-1-motion` luminoso-aire / oscuro-cinematico (y burdeos-calido a pedido); `#edit-3-organico` cine-calido / cine-sobrio (la variante 3C, horizontal, es el caso principal); `#edit-2`, `#edit-4-business` y `#edit-5-creator` sin look asignado (pendiente de decisión del usuario). Para el mejor resultado el usuario entrega un **guión técnico** (escenas, motion, iconos o emojis por fragmento) y, si quiere, un **video de referencia** con lo que desea de él (`formatos/GUION-TECNICO.md`). Un video de referencia de terceros es solo referencia de estilo, no se copia su contenido.

## Tipos oficiales de edición

Cada VIDEO-XXX debe declarar un EDIT_TYPE.

### #edit-1-motion — Motion Editorial

Talking head / estilo podcast con imágenes, recortes, textos y apoyos visuales animados alrededor del discurso.

Características:
- usuario hablando como eje principal;
- imágenes de apoyo generadas o reutilizadas;
- motion graphics editoriales;
- palabras y conceptos destacados;
- puede usar presets editorial-dynamic, kinetic-infographic o editorial-minimal.

Formato principal:
- 9:16.

Formato en preparación (nota del usuario del 2026-10-04, con un video de ejemplo):
- motion encima del personaje, alrededor de él y detrás, recortándolo;
- imágenes de apoyo con textos grandes;
- motion a pantalla completa con la voz en off debajo;
- subtítulos de `#edit-2-pantalla-dividida`;
- identidad video-zeven.

Intención, análisis del ejemplo, piezas y pendientes: `formatos/edit-1-motion/FORMATO.md`. La edición empieza cuando el usuario entregue el contenido.

### #edit-2-pantalla-dividida — Pantalla Dividida

Similar a #edit-1-motion, pero el apoyo visual ocupa una zona separada de la composición.

Características:
- usuario hablando;
- apoyo visual arriba o en zona secundaria;
- imágenes, screenshots, video, gráficos o recursos generados según lo expresado;
- pantalla o demostración debe ser protagonista cuando el contenido lo requiera;
- subtítulos limpios y no invasivos.

Formatos:
- 9:16;
- 1:1;
- seleccionar según el contenido suministrado.

Formato aprobado (2026-10-04; referencia: VIDEO-001, `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`, 9:16):
- dos zonas: apoyo arriba y presentador abajo; presentador a pantalla completa en el gancho y el cierre, y gráfico a pantalla completa solo para evidencias puntuales;
- motion semántico que representa lo que se dice, y capturas reales como evidencia; sin frases ni listas;
- subtítulos en dos capas: lectura blanca sin caja y énfasis tipográficos con textura en las ideas clave;
- efectos de sonido en cada aparición, movimiento y énfasis, elegidos por lo que se dice;
- identidad de marca solo en los gráficos, no en los subtítulos;
- todo dentro del área segura de Instagram Reels;
- una sola pista de voz limpia y CTA «Seguir» al final.

Medidas, piezas, proceso y exportación: `formatos/edit-2-pantalla-dividida/FORMATO.md`.

Presets de la biblioteca:
- screen-tutorial cuando una grabación de pantalla sea la protagonista;
- apoyo editorial-dynamic cuando corresponda.

### #edit-3-organico — Tutorial Orgánico / iPhone Duo

Contenido natural grabado por el usuario mostrando en vivo una pantalla, producto, lugar o proceso.

Características:
- cámara Duo / iPhone cuando aplique;
- casi tutorial paso a paso;
- cortes limpios;
- eliminación de silencios cuando ayude;
- subtítulos sencillos y discretos;
- edición mínima;
- evitar motion graphics que compitan con lo mostrado.

Formato principal:
- 9:16.

Preset:
- organic-iphone-demo.

Variantes (2026-10-09): 3A tutorial en vivo (S6), 3B charla natural (S6) y 3C orgánico horizontal 16:9 con varios encuadres de la misma escena (S8). En 3C el subtítulo S8 sigue al sujeto (ver «Subtítulos: variantes, catálogo y posición»). Detalle: `formatos/edit-3-organico/FORMATO.md`.

### #edit-4-business — Business

Videos para empresas y marcas (definido por Code el 2026-10-09; sin video ni aprobación audiovisual todavía). Una persona de la empresa o su cliente habla a cámara y la edición le da credibilidad y orden.

Características:
- cortes limpios, rótulos de nombre y cargo, datos reales en caja y cierre claro;
- la marca del cliente (logo, colores, tipografía) sustituye a la paleta ZevenPRO cuando la entrega;
- subtítulos sobrios (S7 por defecto), sin textura de lectura;
- variantes: 4A caso o testimonio, 4B producto o servicio, 4C anuncio u oferta (márgenes de Meta: y 269–1248, x 65–1015);
- nunca se inventan cifras: toda cifra lleva su fuente.

Formato principal:
- 9:16 (1:1 o 16:9 si se pide).

Política de producción:
- Remotion / FFmpeg: ON;
- material real: PRIORIDAD;
- motion graphics: LOW-MEDIUM;
- IA de imágenes: OFF;
- IA de video: OFF.

Definición, variantes y prompt base: `formatos/edit-4-business/FORMATO.md`.

### #edit-6-avatar — Producción IA / Avatar

> Renombrado de `#edit-4-avatar` el 2026-10-09. Fuera de la guía de uso y del catálogo de recursos mientras no se use.

Capítulo especial de producción audiovisual generativa.

Objetivo:
crear videos de mayor elaboración usando IA para atacar dolores de marketing, enseñar conceptos, dramatizar situaciones empresariales y construir historias.

Características:
- avatar o personajes;
- guion actuado;
- storyboard;
- escenas generadas;
- diferentes planos;
- voz / audio;
- montaje;
- motion graphics cuando aporten valor;
- puede utilizar Gemini, Veo y otras herramientas IA según la calidad requerida.

Formato principal:
- 16:9;
- adaptable cuando el proyecto lo requiera.

### #edit-5-creator — Creator

Formato para creadores que unen tomas y las visten encima con iconos, emojis, stickers, fotos superpuestas, texto y voz (definido por el usuario el 2026-10-05; renombrado de `#edit-creator` a `#edit-5-creator` el 2026-10-09; sin video ni aprobación audiovisual todavía).

Características:
- cortes precisos sobre la toma principal y tomas de apoyo separadas;
- capturas de pantalla, B-roll, emojis y otras tomas superpuestas;
- subtítulos con tipografía de gancho (tipografía, colores y estilo elegibles mediante un perfil);
- efectos de sonido;
- estilos base predefinidos (`collage`, `hook`, `explicativo`) más los cambios que pida cada orden;
- cualquier motion pedido se resuelve primero con la biblioteca y Remotion oficial, y si no existe se crea como receta candidata.

Formato principal:
- 9:16.

Política de producción:
- Remotion / FFmpeg: ON;
- material real: PRIORIDAD;
- motion graphics: MEDIUM;
- IA de imágenes: OFF por defecto;
- IA de video: OFF;
- IA solo con decisión explícita y justificada en la orden.

`#edit-3-organico` no cambia: sigue siendo la edición mínima.

Definición, estilos, tipografías y cuestionario: `formatos/edit-5-creator/`. Procedimiento: la skill única `/video-lab` (cuestionario de formato, variante y subtítulos).

## Biblioteca Remotion

CASO REAL
→ identificar necesidad
→ reutilizar componente existente
→ si no existe, crear componente
→ validar
→ incorporar a biblioteca
→ reutilizar en próximos videos

## Órdenes VIDEO-XXX

Cada video real debe tener como mínimo:

- EDIT_TYPE;
- objetivo;
- fuentes en Drive;
- guion si existe;
- indicar explícitamente si NO existe guion;
- formato;
- duración objetivo;
- estructura narrativa;
- cortes;
- subtítulos;
- motion graphics;
- recursos de apoyo;
- resultado de investigación visual o enlace a `analysis/<video-id>-support-research.json`;
- CTA cuando corresponda;
- salida esperada.

Antigravity debe consultar esta RAÍZ antes de ejecutar cualquier VIDEO-XXX.

## Organización por formatos y proyectos

Hay una carpeta por formato y, dentro, una por cada video. El detalle está en `formatos/README.md`.

- `formatos/<edit-type>/`: estado del formato (`README.md`), su definición (`FORMATO.md`) y sus referencias.
- `formatos/<edit-type>/<VIDEO-XXX-tema>/`: la ficha del video (`README.md`), `exportaciones/`, `material/` (lo que entrega el usuario) y `revision/`.
- `formatos/identidad-video-zeven.md`: la identidad común a todos los formatos.

La orden (`video-orders/`), las tomas (`raw-material/`), las composiciones (`src/compositions/`), los recursos de Remotion (`public/`) y los análisis (`analysis/`) siguen en su sitio técnico, enlazados desde la ficha. `out/` es solo la salida de paso del render: la exportación final se guarda en `exportaciones/` del video.

## Estado del proyecto

### FASE 01 — COMPLETADA

Base Remotion funcional:
- React + TypeScript;
- Remotion Studio;
- preview;
- render MP4 local;
- validación de TypeScript;
- repositorio conectado.

### FASE 02 — COMPLETADA

Biblioteca base Remotion:
- componentes reutilizables;
- presets alineados a referencias reales;
- LibraryShowcase;
- validaciones y renders.
