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
- construir la biblioteca audiovisual a partir de casos reales;
- evitar sobreconstrucción;
- mantener separados edición de material existente y producción audiovisual generativa;
- el usuario no debe tener que buscar manualmente material de apoyo salvo que sea estrictamente necesario.

## Regla de recursos de apoyo

Ante una necesidad visual, seguir este orden:

1. reutilizar material ya disponible del proyecto;
2. resolver con texto, formas, gráficos o componentes de Remotion;
3. generar imagen mediante IA;
4. generar video/B-roll mediante IA;
5. solicitar material externo al usuario solo cuando deba ser real, exacto o verificable.

Ejemplos donde sí puede requerirse material real:
- interfaz específica de un producto;
- captura de una cuenta o resultado real;
- persona concreta;
- evidencia de un caso;
- producto físico que deba mostrarse fielmente.

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

Preset base:
- screen-tutorial;
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

### #edit-4-avatar — Producción IA / Avatar

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

## Biblioteca Remotion

La biblioteca no se construirá completa de antemano.

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
- CTA cuando corresponda;
- salida esperada.

Antigravity debe consultar esta RAÍZ antes de ejecutar cualquier VIDEO-XXX.

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

Validar el flujo completo con VIDEO-001 real:
Drive
→ análisis
→ edit plan
→ recursos de apoyo
→ Remotion
→ render.
