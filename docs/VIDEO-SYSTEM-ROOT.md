# Gemini Video Lab

## Objetivo

Construir un sistema de edición y producción audiovisual asistido por IA para transformar material grabado por el usuario en contenido listo para publicar, usando principalmente Gemini para análisis e interpretación y Remotion para composición, motion graphics y render.

El sistema debe reducir al mínimo la búsqueda manual de recursos y convertir estrategia, guion y material bruto en una orden de edición reproducible.

## Flujo operativo

Google Drive / material grabado / guion
→ ChatGPT organiza estrategia y plan de edición
→ GitHub recibe una orden VIDEO-XXX
→ Antigravity consulta esta RAÍZ + la orden
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
- crear órdenes VIDEO-XXX en GitHub;
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
- comprensión de guion y material;
- apoyo para estructurar planes de edición;
- generación de instrucciones estructuradas;
- participación futura en automatización del flujo.

## Principios

- editar primero material grabado por el usuario;
- priorizar control, calidad y reproducibilidad;
- reutilizar componentes antes de crear nuevos;
- evitar código distinto para cada video cuando pueda resolverse con componentes o presets;
- construir la biblioteca audiovisual a partir de casos reales;
- evitar sobreconstrucción;
- no añadir infraestructura que todavía no sea necesaria;
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

La meta es evitar el flujo manual de buscar, descargar y organizar B-roll o imágenes genéricas.

## Categorías de contenido

### 01 — Motion Graphic

Contenido donde la edición y los elementos gráficos enriquecen o conducen la narrativa.

Presets definidos:

#### editorial-dynamic
- persona en cámara;
- composiciones editoriales;
- imágenes recortadas;
- titulares grandes;
- palabras destacadas;
- movimiento visual dinámico.

#### kinetic-infographic
- texto como protagonista;
- escenas rápidas;
- formas;
- palabras animadas;
- tarjetas;
- elementos gráficos e imágenes de apoyo;
- puede funcionar con voz en off.

#### editorial-minimal
- talking head predominante;
- estética sobria;
- subtítulos editoriales;
- placas blancas o limpias;
- imágenes y titulares;
- motion discreto.

Formato principal:
- vertical 9:16.

### 02 — Demo / Screen Explainer

Contenido para enseñar herramientas, procesos, IA, automatizaciones, productos o resultados.

Presets definidos:

#### demo-quick
- explicación rápida;
- persona + pantalla;
- textos breves;
- producto o herramienta como evidencia.

#### screen-tutorial
- captura de pantalla como protagonista;
- picture-in-picture;
- zooms sobre interfaz;
- highlights;
- prompts;
- resultados;
- CTA.

#### ai-workflow-demo
- referencia;
- herramienta;
- prompt;
- proceso;
- variaciones;
- resultado;
- comparación visual.

Formato principal:
- vertical 9:16.

### 03 — Organic / iPhone

Contenido grabado directamente por el usuario donde la prioridad es mantener sensación natural y orgánica.

Preset:

#### organic-iphone-demo
- usuario en cámara;
- grabación con iPhone;
- mostrar pantalla, producto o ambiente;
- cortes limpios;
- eliminación de silencios cuando sea necesario;
- subtítulos sencillos y discretos;
- edición mínima;
- sin motion graphics que compitan con lo mostrado.

Formato:
- vertical 9:16.

Objetivo:
que parezca contenido auténtico y natural, no una pieza excesivamente producida.

### 04 — AI Cinematic Marketing

Capítulo especial separado de la edición cotidiana.

Objetivo:
crear videos horizontales de alta producción generados total o parcialmente con IA para atacar dolores de marketing, enseñar conceptos, dramatizar problemas empresariales y crear historias con personajes o avatares.

Características:
- formato horizontal 16:9;
- guion actuado;
- personajes o avatares;
- escenas generadas;
- diferentes planos;
- narrativa;
- diálogos;
- ambientación;
- producción de audio y voz;
- montaje final;
- motion graphics cuando aporten valor.

Posibles formatos:
- acted-business-pain;
- educational-story;
- ai-commercial;
- brand-story;
- cinematic-explainer.

Este capítulo puede utilizar Gemini, Veo y otras herramientas de IA cuando sean necesarias para lograr la calidad deseada.

## Biblioteca Remotion

La biblioteca no se construirá completa de antemano.

Regla:

CASO REAL
→ identificar necesidad
→ reutilizar componente existente
→ si no existe, crear componente
→ validar
→ incorporar a biblioteca
→ reutilizar en próximos videos

La biblioteca debe servir a varias categorías y evitar duplicaciones.

## Órdenes VIDEO-XXX

Cada video real debe tener una orden en GitHub con, como mínimo:

- objetivo;
- fuentes en Drive;
- categoría;
- preset;
- formato;
- duración objetivo;
- estructura narrativa;
- cortes;
- subtítulos;
- motion graphics;
- recursos de apoyo;
- CTA;
- salida esperada.

Antigravity debe consultar esta RAÍZ antes de ejecutar cualquier VIDEO-XXX.

## Estado del proyecto

### FASE 01 — COMPLETADA

Base Remotion funcional:
- React + TypeScript;
- Remotion Studio;
- composición vertical de prueba;
- preview;
- render MP4 local;
- validación de TypeScript;
- repositorio conectado y operativo.

### FASE 02 — SIGUIENTE

Coordinar y construir la primera biblioteca mínima de componentes Remotion basada en las categorías y referencias ya definidas.

No conectar todavía infraestructura adicional hasta que la biblioteca mínima y el primer video real validen el flujo.
