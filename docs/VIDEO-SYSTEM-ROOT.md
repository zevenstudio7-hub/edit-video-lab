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

## Tipos oficiales de edición y enrutamiento

Cada VIDEO-XXX debe declarar un EDIT_TYPE.

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

Preset base:
- screen-tutorial;
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

### #edit-4-avatar — Producción IA / Avatar

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

## Matriz de enrutamiento

| EDIT_TYPE | Remotion/FFmpeg | Material real | Motion | IA imágenes | IA video |
|---|---|---|---|---|---|
| #edit-1-motion | ON | PRIORIDAD | HIGH | NORMAL | CONDITIONAL |
| #edit-2-pantalla-dividida | ON | FIRST | MEDIUM | CONDITIONAL | EXCEPTIONAL |
| #edit-3-organico | ON | ONLY por defecto | LOW | OFF | OFF |
| #edit-4-avatar | ON | SEGÚN CASO | HIGH | ON | ON |

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

La biblioteca no se construirá completa de antemano.

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
