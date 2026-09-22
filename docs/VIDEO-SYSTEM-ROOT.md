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

## Flujo operativo general

TÚ
→ ChatGPT / Work: estrategia, guion, objetivo, referencias y tipo de edición
→ Codex: agente de producción local
→ Codex consulta esta RAÍZ + órdenes existentes relevantes + materiales del VIDEO-XXX
→ Codex crea o actualiza video-orders/VIDEO-XXX.json
→ Codex ejecuta el pipeline definido por EDIT_TYPE
→ Remotion Studio: preview y revisión
→ Codex aplica correcciones
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
- revisar objetivo, guion, referencias y material disponible;
- definir estructura narrativa;
- decidir qué debe ser material real, motion graphic o asset generativo;
- formular instrucciones claras para Codex;
- ayudar a evaluar el preview y convertir feedback en correcciones concretas.

### Codex
- agente principal de producción local;
- consultar siempre esta RAÍZ antes de crear o ejecutar una orden;
- consultar órdenes VIDEO-XXX existentes del mismo EDIT_TYPE o de estructura similar antes de generar una nueva orden;
- revisar el estado real del repositorio antes de modificarlo;
- crear o actualizar video-orders/VIDEO-XXX.json antes de montar o corregir una edición;
- ejecutar FFmpeg, Remotion, scripts y tareas locales;
- reutilizar componentes existentes;
- crear componentes nuevos solo cuando un caso real lo requiera;
- integrar assets reales y generativos;
- abrir preview en Remotion Studio;
- detenerse antes del render final salvo autorización explícita.

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
- Codex: ON;
- Remotion / FFmpeg: ON;
- material real: PRIORIDAD;
- motion graphics: HIGH;
- IA de imágenes: ON cuando aporte valor;
- IA de video/B-roll: ON cuando aporte valor;
- generación visual forma parte normal del flujo, pero no debe sustituir assets reales útiles.

Flujo:
TÚ + GUION
→ ChatGPT / Work
→ Codex
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
- Codex: ON;
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
- Codex: ON;
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
→ Codex
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
- Codex: ON;
- Remotion / FFmpeg: ON;
- IA generativa: FULL;
- IA de imágenes: ON;
- IA de video: ON;
- personajes/avatar: ON cuando el concepto lo requiera;
- motion graphics: HIGH.

Flujo:
idea / problema
→ ChatGPT / Work: concepto + guion + storyboard
→ Codex
→ generación de personajes / imágenes / escenarios / video / audio
→ Remotion + FFmpeg
→ Preview
→ correcciones
→ render final.

## Matriz de enrutamiento

| EDIT_TYPE | Codex | Remotion/FFmpeg | Material real | Motion | IA imágenes | IA video |
|---|---|---|---|---|---|---|
| #edit-1-motion | ON | ON | PRIORIDAD | HIGH | NORMAL | CONDITIONAL |
| #edit-2-pantalla-dividida | ON | ON | FIRST | MEDIUM | CONDITIONAL | EXCEPTIONAL |
| #edit-3-organico | ON | ON | ONLY por defecto | LOW | OFF | OFF |
| #edit-4-avatar | ON | ON | SEGÚN CASO | HIGH | ON | ON |

Codex debe usar esta matriz como regla de enrutamiento. No debe activar proveedores generativos por rutina.

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
→ reutilizar componente existente
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

Antes de crear o modificar cualquier video-orders/VIDEO-XXX.json, Codex debe:

1. leer docs/VIDEO-SYSTEM-ROOT.md;
2. revisar git status;
3. revisar el material disponible del VIDEO-XXX;
4. leer el guion si existe;
5. revisar las órdenes VIDEO-XXX existentes;
6. identificar al menos una orden previa del mismo EDIT_TYPE si existe;
7. reutilizar estructura y convenciones válidas de órdenes anteriores sin copiar decisiones editoriales específicas;
8. aplicar la matriz de enrutamiento del EDIT_TYPE;
9. generar o actualizar la orden;
10. mostrar un resumen breve de lo que hará antes de ejecutar la edición.

Codex no debe comenzar el montaje sin una orden VIDEO-XXX válida, salvo correcciones puntuales sobre una edición ya existente. En ese caso debe actualizar primero la orden para reflejar los cambios relevantes.

## Política de autonomía de Codex

Codex puede ejecutar sin pedir autorización repetitiva:
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
