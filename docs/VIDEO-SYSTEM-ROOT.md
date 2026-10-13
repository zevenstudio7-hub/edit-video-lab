# Gemini Video Lab

## Objetivo

Construir un sistema de edición y producción audiovisual asistido por IA para transformar material grabado por el usuario en contenido listo para publicar.

El sistema debe:

- reducir al mínimo la búsqueda manual de recursos;
- convertir estrategia, guion y material bruto en una orden de edición reproducible;
- reutilizar componentes y presets antes de crear infraestructura nueva;
- activar IA generativa solo cuando el tipo de video o una necesidad visual real lo justifique;
- mantener una separación clara entre dirección editorial, ejecución técnica, generación de assets y render.

El nombre histórico del repositorio se mantiene, pero Gemini deja de ser una dependencia obligatoria del pipeline. Las herramientas generativas se consideran proveedores opcionales según el EDIT_TYPE y la necesidad real.

## Directriz obligatoria: investigar antes de decidir

Este sistema no debe validar automáticamente las ideas del usuario. Debe mejorarlas.

Antes de definir, modificar o ampliar cualquier decisión importante sobre edición, arquitectura, agentes, herramientas, renders, motion graphics, captions, captura, generación de assets o automatización, el responsable debe:

1. estudiar primero las capacidades y prácticas vigentes de las herramientas relevantes;
2. revisar documentación oficial, repositorios de referencia, Agent Skills, ejemplos y casos de uso aplicables;
3. comprobar si ya existe una solución técnica madura antes de diseñar una propia;
4. comparar al menos las alternativas razonables cuando la decisión pueda afectar calidad, tiempo, costo o complejidad;
5. distinguir evidencia, experiencia observada e hipótesis;
6. proponer una opción superior aunque contradiga la idea inicial del usuario;
7. evitar construir infraestructura propia cuando una solución existente resuelva mejor el problema;
8. probar en material real antes de convertir una preferencia en regla permanente.

La conversación estratégica, ChatGPT / Work y los agentes ejecutores deben actuar como sistema de investigación + propuesta, no como mecanismo de aprobación de ideas.

Las preferencias de herramienta no se convierten en arquitectura sin prueba. Por ejemplo, Claude Code, Codex, Hermes u otros agentes deben evaluarse por resultados reales en el flujo audiovisual: precisión de cortes, cumplimiento de orden, calidad visual, uso correcto de Remotion, velocidad, costo, número de correcciones y estabilidad.

## Referencia técnica upstream

Remotion oficial es referencia técnica upstream del sistema.

Antes de desarrollar una solución propia con React/Remotion, el agente debe comprobar si el ecosistema oficial ya proporciona:

- componente;
- API;
- paquete;
- effect;
- transition;
- captions;
- template;
- Agent Skill;
- ejemplo;
- patrón recomendado;
- herramienta de render;
- integración aplicable.

La jerarquía es:

VIDEO-SYSTEM-ROOT.md
→ política conceptual/editorial

video-orders/VIDEO-XXX.json
→ contrato operativo del video

Remotion oficial + documentación + Agent Skills
→ referencia técnica de implementación

Código local
→ implementación específica solo cuando sea necesaria

No copiar el repositorio de Remotion ni reconstruir sus capacidades. Trabajar sobre su ecosistema y extender únicamente lo que el caso real requiera.

## Evaluación de orquestación y agentes

El sistema puede usar una capa de orquestación separada del agente editor.

Arquitectura candidata a validar:

TÚ / WORK
→ dirección e investigación
→ ORQUESTADOR
→ agente editor principal
→ agentes de apoyo / revisión
→ Remotion + FFmpeg + proveedores de assets
→ QA
→ Preview
→ corrección
→ render final.

Hermes es candidato a la capa de orquestación, pero no debe adoptarse hasta identificar y evaluar la implementación exacta que se utilizará.

Claude Code es candidato a agente editor principal para Remotion. Codex puede mantenerse como ejecutor, revisor, QA o fallback. Esta distribución debe validarse mediante pruebas comparables sobre material real antes de declararse definitiva.

## Flujo operativo general

TÚ
→ ChatGPT / Work: estrategia, guion, objetivo, referencias y tipo de edición
→ agente de producción seleccionado según evaluación vigente
→ el agente consulta esta RAÍZ + órdenes existentes relevantes + materiales del VIDEO-XXX
→ crea o actualiza video-orders/VIDEO-XXX.json
→ ejecuta el pipeline definido por EDIT_TYPE
→ Remotion Studio: preview y revisión
→ aplica correcciones
→ render final autorizado
→ VIDEO FINAL

El render final no debe ejecutarse antes de la revisión del preview, salvo orden explícita del usuario.

## Roles

### Usuario
- define objetivo, material, referencias y resultado esperado;
- elige o confirma EDIT_TYPE cuando corresponda;
- revisa preview;
- aprueba render final.

### ChatGPT / Work
- dirección estratégica y editorial;
- investigar antes de recomendar;
- revisar objetivo, guion, referencias y material disponible;
- definir estructura narrativa;
- comparar herramientas y alternativas cuando corresponda;
- decidir qué debe ser material real, motion graphic o asset generativo;
- formular instrucciones claras para el agente ejecutor;
- ayudar a evaluar el preview y convertir feedback en correcciones concretas.

### Agente ejecutor
Puede ser Claude Code, Codex u otro agente aprobado después de pruebas.

Debe:
- consultar siempre esta RAÍZ antes de crear o ejecutar una orden;
- consultar órdenes VIDEO-XXX existentes del mismo EDIT_TYPE o de estructura similar;
- revisar el estado real del repositorio antes de modificarlo;
- revisar Remotion oficial y sus Agent Skills antes de implementar una capacidad nueva;
- crear o actualizar video-orders/VIDEO-XXX.json antes de montar o corregir una edición;
- ejecutar FFmpeg, Remotion, scripts y tareas locales;
- reutilizar componentes oficiales y locales existentes;
- crear componentes nuevos solo cuando un caso real lo requiera;
- integrar assets reales y generativos;
- abrir preview en Remotion Studio;
- detenerse antes del render final salvo autorización explícita.

### Orquestador
Puede ser Hermes u otra solución validada.

Responsabilidades potenciales:
- clasificar la tarea;
- delegar a agentes especializados;
- separar planificación, implementación y revisión;
- coordinar estados;
- limitar bucles;
- mantener trazabilidad;
- solicitar intervención humana solo cuando sea necesaria.

No sustituye la RAÍZ ni la orden VIDEO-XXX.

### GitHub
- fuente de verdad del sistema;
- almacenar esta RAÍZ, componentes, presets, órdenes y evolución técnica;
- conservar historial de decisiones.

### Remotion
- motor de composición;
- timeline programático;
- subtítulos;
- motion graphics;
- overlays;
- reencuadres;
- transiciones;
- layouts;
- integración de imágenes, video, audio y assets generados;
- render final.

### FFmpeg
- inspección técnica de clips;
- cortes y trims;
- audio;
- formatos;
- extracción de frames cuando sea útil;
- procesamiento auxiliar.

### Proveedores de IA generativa
No forman parte obligatoria de todos los videos.

Se activan únicamente cuando el EDIT_TYPE o una necesidad visual real lo justifique.

Pueden incluir:
- modelos de imagen;
- modelos de video como Veo u otros;
- generación de B-roll;
- fondos;
- personajes o avatares;
- otros proveedores aprobados posteriormente.

## Principios

- editar primero el material real del usuario;
- material real antes que material generado cuando ambos resuelven la misma necesidad;
- Remotion antes que IA generativa cuando el recurso puede resolverse con texto, formas, gráficos, layout o motion;
- no generar algo que ya existe como asset real útil;
- reutilizar componentes antes de crear nuevos;
- evitar código distinto para cada video cuando pueda resolverse con componentes, datos o presets;
- construir la biblioteca audiovisual a partir de casos reales;
- evitar sobreconstrucción;
- no añadir infraestructura que no acerque el video actual al preview;
- el usuario no debe buscar manualmente B-roll o imágenes salvo que el recurso deba ser real, exacto o verificable;
- una orden VIDEO-XXX es el contrato operativo de cada edición.

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

### Prioridad por defecto ante una necesidad visual

Ante una necesidad visual, seguir este orden por defecto:

1. material real ya disponible del proyecto;
2. captura o screen recording real;
3. imagen real suministrada;
4. texto, formas, gráficos, layout o motion con Remotion;
5. imagen generada por IA;
6. video/B-roll generado por IA;
7. solicitar material adicional al usuario solo cuando deba ser real, exacto o verificable.

Ejemplos donde sí puede requerirse material real:
- interfaz específica de un producto;
- captura de una cuenta o resultado real;
- persona concreta;
- evidencia de un caso;
- producto físico que deba mostrarse fielmente;
- anuncio, interfaz o hecho histórico que deba ser verificable.

## Identidad video-zeven

Todos los formatos comparten la identidad video-zeven: colores ZevenPRO en los gráficos, tipografía Inter Tight, subtítulos de lectura con énfasis tipográficos con textura, efectos de sonido propios, CTA y área segura de Instagram Reels. Es una decisión del usuario del 2026-10-04 y nace del formato aprobado de `#edit-2-pantalla-dividida`. Detalle: `formatos/identidad-video-zeven.md`. Excepción (2026-10-05): en `#edit-5-creator` el usuario puede elegir tipografía, colores y estilo de subtítulos mediante un perfil; sin perfil rige video-zeven.

## Subtítulos: variantes, catálogo y posición

Decisión del usuario del 2026-10-09 (candidato; solo S1 y la variante 2A están aprobadas en un video): cada EDIT_TYPE tiene variantes `<número><letra>` (1A…5D, 15 en total) y los subtítulos se eligen de un catálogo de nueve estilos, S1–S9 (`formatos/subtitulos/SUBTITULOS.md`, datos en `subtitulos.json`). La orden declara `EDIT_TYPE`, `variante` y `subtitulos`; sin `subtitulos` rige el por defecto de la variante, y el bloque `cambios` manda sobre todo.

**Posición según el sujeto (decisión del usuario, 2026-10-10).** En los subtítulos que flotan en el plano (S5, S8 y la cascada de S9) el sujeto fija dónde va el texto, no los bordes ni el centro del cuadro: en cada plano se miden los dos espacios libres a los lados del sujeto, a la altura de su cabeza, y cada bloque se centra dentro de uno de ellos, a ≥ 3 % del ancho del sujeto y ≥ 8 % del borde del cuadro. **Nunca pegado a los costados.** Una frase partida va a la misma altura en los dos espacios; si el sujeto está descentrado, el texto se descentra con él; al cambiar de encuadre se vuelven a medir. No aplica a los estilos de zona fija (S1, S2, S4, S6, S7), ni a la pantalla llena de S9 ni al gancho de S3.

## Motion UX — motion predeterminado para tecnología y software

Decisión del usuario del 2026-10-09 (propuesta pendiente de aprobación audiovisual): cuando lo que se dice trata de herramientas, tecnología, software, IA, plataformas o sistemas digitales, el motion por defecto de **todos** los EDIT_TYPE (salvo `#edit-6-avatar`) es **Motion UX / Soft Glass UI** (soft UI + glassmorphism + borde AI glow; iconos, tarjetas, cajas de UI, escritura, cursor, botones en movimiento). Intensidad por tipo, 20 movimientos, 10 estilos de texto, paleta y sonidos: `formatos/motion-ux/MOTION-UX.md`. La orden (bloque `cambios`) puede subirla, bajarla o desactivarla. Los colores salen de un perfil que se pregunta **una sola vez** (`formatos/motion-ux/CUESTIONARIO.md`); sin perfil rigen los de ZevenPRO. Las interfaces simuladas son ilustración conceptual; una afirmación sobre un producto real exige captura verificable. Convive con la identidad video-zeven y no sustituye los subtítulos aprobados de `#edit-2-pantalla-dividida`.

## Looks de color y guión técnico

Decisión del usuario del 2026-10-09 (candidato): cada formato puede tener un **look de color** por defecto y uno alternativo, aplicados solo a las tomas grabadas (`formatos/looks/`; la orden elige ID e intensidad con `cambios`, incluyendo `look: ninguno` o `look: burdeos-calido 70 %`). La LUT se aplica con FFmpeg al derivado de metraje; si se aplica tras un render, ese pase contiene solo tomas antes de componer gráficos. Nunca se gradúa el compuesto final con textos, logos o Motion UX. Por defecto / alternativo: `#edit-1-motion` luminoso-aire / oscuro-cinematico (y burdeos-calido a pedido); `#edit-3-organico` cine-calido / cine-sobrio (la variante 3C, horizontal, es el caso principal); `#edit-2`, `#edit-4-business` y `#edit-5-creator` sin look asignado (pendiente de decisión del usuario). Para el mejor resultado el usuario entrega un **guión técnico** (escenas, motion, iconos o emojis por fragmento) y, si quiere, un **video de referencia** con lo que desea de él (`formatos/GUION-TECNICO.md`). Un video de referencia de terceros es solo referencia de estilo, no se copia su contenido.

## Tipos oficiales de edición y enrutamiento

Cada VIDEO-XXX debe declarar un EDIT_TYPE, una variante (1A…5D) y un estilo de subtítulos (S1–S9; ver «Subtítulos: variantes, catálogo y posición»). Desde el 2026-10-09 hay seis EDIT_TYPE: `#edit-1-motion`, `#edit-2-pantalla-dividida`, `#edit-3-organico`, `#edit-4-business` (nuevo), `#edit-5-creator` y `#edit-6-avatar` (antes `#edit-4-avatar`; fuera de la guía mientras no se use).

El EDIT_TYPE determina automáticamente qué herramientas están permitidas, cuáles son prioritarias y cuáles deben permanecer desactivadas por defecto.

### #edit-1-motion — Motion Editorial

Talking head / estilo podcast con imágenes, recortes, textos y apoyos visuales animados alrededor del discurso.

Características:
- usuario hablando como eje principal;
- motion graphics editoriales;
- palabras y conceptos destacados;
- imágenes de apoyo generadas o reutilizadas;
- B-roll cuando aporte contexto;
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

Política de producción:
- Remotion / FFmpeg: ON;
- material real: PRIORIDAD;
- motion graphics: HIGH;
- IA de imágenes: ON cuando aporte valor;
- IA de video/B-roll: ON cuando aporte valor;
- generación visual forma parte normal del flujo, pero no debe sustituir assets reales útiles.

Flujo:
TÚ + GUION
→ ChatGPT / Work
→ agente ejecutor
→ analiza qué necesita cada frase
→ material real / Remotion / imagen IA / video IA
→ Remotion + FFmpeg
→ Preview
→ correcciones
→ render final.

### #edit-2-pantalla-dividida — Pantalla Dividida

Usuario hablando con un apoyo visual separado de la composición.

Características:
- presentador en zona principal o inferior;
- apoyo visual arriba o en zona secundaria;
- imágenes, screenshots, screen recordings, video, gráficos o recursos generados;
- pantalla o demostración debe ser protagonista cuando el contenido lo requiera;
- subtítulos limpios y no invasivos.

Formatos:
- 9:16;
- 1:1 cuando el contenido lo requiera.

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

Política de producción:
- Remotion / FFmpeg: ON;
- material real: FIRST;
- motion graphics: MEDIUM;
- IA de imágenes: CONDITIONAL;
- IA de video: EXCEPTIONAL;
- no generar apoyo si captura, screen recording, imagen real o Remotion ya lo resuelven.

Orden de apoyo específico:
1. captura real;
2. screen recording real;
3. imagen real suministrada;
4. gráfico/motion Remotion;
5. imagen IA;
6. video IA.

### #edit-3-organico — Tutorial Orgánico / iPhone Duo

Contenido natural grabado por el usuario mostrando en vivo una pantalla, producto, lugar o proceso.

Características:
- cámara Duo / iPhone cuando aplique;
- tutorial paso a paso;
- cortes limpios;
- eliminación de silencios solo cuando ayude;
- subtítulos sencillos y discretos;
- edición mínima;
- evitar motion graphics que compitan con lo mostrado.

Formato principal:
- 9:16.

Preset:
- organic-iphone-demo.

Variantes (2026-10-09): 3A tutorial en vivo (S6), 3B charla natural (S6) y 3C orgánico horizontal 16:9 con varios encuadres de la misma escena (S8). En 3C el subtítulo S8 sigue al sujeto (ver «Subtítulos: variantes, catálogo y posición»). Detalle: `formatos/edit-3-organico/FORMATO.md`.

Política de producción:
- Remotion / FFmpeg: ON;
- assets reales: ONLY por defecto;
- motion graphics: LOW;
- IA de imágenes: OFF por defecto;
- IA de video: OFF;
- generación generativa solo puede activarse mediante una decisión explícita y justificada.

Regla editorial:
Si el resultado parece excesivamente editado, el formato perdió su objetivo.

Flujo:
video real
→ ChatGPT / Work
→ agente ejecutor
→ FFmpeg: selección, silencios, cortes, audio
→ Remotion: captions y ajustes mínimos
→ Preview
→ correcciones
→ render final.

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

Producción audiovisual generativa de mayor elaboración.

Objetivo:
crear videos usando IA para enseñar conceptos, dramatizar situaciones, representar dolores de marketing, crear personajes y construir historias.

Características:
- avatar o personajes;
- guion actuado;
- storyboard;
- escenas generadas;
- diferentes planos;
- voz / audio;
- montaje;
- motion graphics;
- imágenes y video IA como parte estructural de la producción.

Formato principal:
- 16:9;
- adaptable cuando el proyecto lo requiera.

Política de producción:
- Remotion / FFmpeg: ON;
- IA generativa: FULL;
- IA de imágenes: ON;
- IA de video: ON;
- personajes/avatar: ON cuando el concepto lo requiera;
- motion graphics: HIGH.

Flujo:
idea / problema
→ ChatGPT / Work: concepto + guion + storyboard
→ agente ejecutor
→ generación de personajes / imágenes / escenarios / video / audio
→ Remotion + FFmpeg
→ Preview
→ correcciones
→ render final.

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

## Matriz de enrutamiento

| EDIT_TYPE | Remotion/FFmpeg | Material real | Motion | IA imágenes | IA video |
|---|---|---|---|---|---|
| #edit-1-motion | ON | PRIORIDAD | HIGH | NORMAL | CONDITIONAL |
| #edit-2-pantalla-dividida | ON | FIRST | MEDIUM | CONDITIONAL | EXCEPTIONAL |
| #edit-3-organico | ON | ONLY por defecto | LOW | OFF | OFF |
| #edit-4-business | ON | PRIORIDAD | LOW-MEDIUM | OFF | OFF |
| #edit-5-creator | ON | PRIORIDAD | MEDIUM | OFF por defecto | OFF |
| #edit-6-avatar | ON | SEGÚN CASO | HIGH | ON | ON |

La matriz tiene seis filas desde el 2026-10-09 (`#edit-4-business` y `#edit-5-creator` se añadieron y `#edit-4-avatar` pasó a `#edit-6-avatar`); los valores de las filas nuevas salen de sus FORMATO.md y son un punto de partida: la orden manda.

El agente ejecutor debe usar esta matriz como regla de enrutamiento. No debe activar proveedores generativos por rutina.

## Motion graphics vs IA generativa

Motion graphics se resuelven preferentemente con Remotion:
- texto animado;
- gráficos;
- barras;
- números;
- zoom;
- máscaras;
- subtítulos;
- transiciones;
- layouts;
- pantalla dividida;
- highlights;
- overlays.

IA generativa se usa cuando hay que crear contenido que no existe:
- imagen nueva;
- B-roll nuevo;
- personaje;
- avatar;
- escenario;
- fondo;
- clip cinematográfico;
- producto conceptual;
- recurso visual imposible o ineficiente de construir con Remotion.

## Biblioteca Remotion

CASO REAL
→ identificar necesidad
→ comprobar Remotion oficial / Agent Skills / ejemplos
→ reutilizar componente oficial o local existente
→ si no existe, crear componente
→ validar
→ incorporar a biblioteca
→ reutilizar en próximos videos.

## Órdenes VIDEO-XXX

Cada video real debe tener una orden en:

video-orders/VIDEO-XXX.json

La orden es el contrato operativo del video.

Debe incluir como mínimo:
- VIDEO_ID;
- EDIT_TYPE;
- variante (1A…5D);
- estilo de subtítulos (S1–S9; sin él, el por defecto de la variante);
- objetivo;
- fuentes;
- guion si existe;
- indicar explícitamente si NO existe guion;
- formato;
- duración objetivo;
- estructura narrativa;
- clips/tomas seleccionadas;
- rangos in/out cuando estén definidos;
- cortes;
- subtítulos;
- motion graphics;
- recursos de apoyo;
- resultado de investigación visual o enlace a `analysis/<video-id>-support-research.json`;
- política de IA generativa;
- CTA cuando corresponda;
- salida esperada;
- estado de preview/render.

## Regla obligatoria para generar una orden

Antes de crear o modificar cualquier video-orders/VIDEO-XXX.json, el agente debe:

1. leer docs/VIDEO-SYSTEM-ROOT.md;
2. revisar git status;
3. revisar el material disponible del VIDEO-XXX;
4. leer el guion si existe;
5. revisar las órdenes VIDEO-XXX existentes;
6. identificar al menos una orden previa del mismo EDIT_TYPE si existe;
7. revisar Remotion oficial y las Agent Skills aplicables;
8. reutilizar estructura y convenciones válidas de órdenes anteriores sin copiar decisiones editoriales específicas;
9. aplicar la matriz de enrutamiento del EDIT_TYPE;
10. generar o actualizar la orden;
11. mostrar un resumen breve de lo que hará antes de ejecutar la edición.

El agente no debe comenzar el montaje sin una orden VIDEO-XXX válida, salvo correcciones puntuales sobre una edición ya existente. En ese caso debe actualizar primero la orden para reflejar los cambios relevantes.

## Política de autonomía del agente

El agente puede ejecutar sin pedir autorización repetitiva:
- lectura y escritura dentro del repositorio;
- git status, log y diff;
- pnpm;
- node;
- scripts locales;
- FFmpeg;
- Remotion;
- creación y actualización de órdenes;
- apertura de Remotion Studio;
- correcciones de composición.

Debe detenerse antes de:
- acciones destructivas irreversibles;
- borrar material bruto;
- exponer o modificar credenciales;
- crear nuevas credenciales;
- activar un servicio de pago no autorizado;
- publicar o distribuir contenido;
- ejecutar render final cuando todavía se espera revisión.

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

### FASE 03 — ACTUAL

Validar y estabilizar el flujo completo con VIDEO-001 real:

material real
→ orden VIDEO-001
→ selección y cortes
→ recursos de apoyo según #edit-2-pantalla-dividida
→ Remotion
→ preview
→ correcciones
→ render final autorizado.

Objetivo de esta fase:
obtener un VIDEO-001 terminado y usar sus aprendizajes para simplificar los siguientes videos antes de añadir nueva infraestructura.

Estado (2026-10-11): VIDEO-001 quedó aprobado y exportado el 2026-10-04 (`#edit-2-pantalla-dividida`, `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`) y desde entonces se definieron los demás formatos; el cierre formal de esta fase lo decide el usuario.

### Estado comercial — 2026-10-13

El sistema se ofrece como el recurso de pago **Video Lab** de ZevenPRO: guía de uso y skill `/video-lab`, a **27 USD**, con venta automática por Hotmart (`https://pay.hotmart.com/O108003784V`) y landing en `https://zevenpro.co/recursos/video-lab` (repositorio `zevenstudio7-hub/zevenpro-web`; ficha en `lib/resources-config.ts`, contenido en `lib/video-lab-landing.ts`). Decisión del responsable: la venta ocurre sola en la web, sin botones ni CTA de WhatsApp.

Reglas:
- La landing solo promete lo que el producto entrega y muestra el estado real de cada formato (`formatos/README.md`). Si cambia el estado de un formato, el número de variantes o estilos, o el contenido de la guía, se actualiza la landing.
- El avatar (`#edit-6-avatar`) no se ofrece mientras esté fuera del catálogo.
- Las muestras de video de la landing son renders de `LibraryShowcase` con material de demostración. Pendiente: sustituirlas por exportaciones reales aprobadas (por ejemplo VIDEO-001).
- Entrega: el comprador recibe la guía de uso en PDF, que incluye el enlace de descarga de la skill `/video-lab`. El enlace debe funcionar para quien compra (este repositorio es privado).
- Estado en Hotmart (2026-10-13): producto en borrador, pendiente de aprobación; hasta entonces el checkout no está disponible para compradores.
- Videos de la landing: cuatro videos de prueba aportados por el responsable (2026-10-13): Pantalla dividida (`apple_002`, primeros 15 s), una etiquetada como Motion Graphics (`002`) y otra como Motion Editorial (`video 003`) y Creator (`video-002-preview`, un preview sin aprobación audiovisual). Se usan en el simulador del hero y en la galería de `zevenpro-web` y se actualizan cuando se trabaje otro video.
