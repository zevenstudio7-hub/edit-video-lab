@./docs/VIDEO-SYSTEM-ROOT.md

# Gemini Video Lab - Instrucciones del Repositorio

Este archivo establece las directrices y reglas permanentes para el desarrollo y la operación en este repositorio.

## Reglas Permanentes

- **Agente Principal**: Gemini CLI es el agente principal de Gemini Video Lab.
- **Análisis de Contenido**: Gemini API analiza video y audio.
- **Render y Composición**: Remotion ejecuta composición, preview y render.
- **Librería Oficial de IA**: Usar exclusivamente `@google/genai` y la clase `GoogleGenAI`.
- **Análisis Real**: Prohibido usar mocks, fakeTranscript, análisis simulados o placeholders como resultados reales. Todo análisis debe ser real y fiel al material.
- **Seguridad y Secretos**: No imprimir `GEMINI_API_KEY`. No inspeccionar `~/.gemini`, Keychain ni tokens del sistema.
- **Archivos Locales e Ignorados**: `.env.local` y `raw-material/` nunca deben versionarse en Git.
- **Reutilización**: Reutilizar componentes Remotion antes de crear nuevos. Evitar la duplicación de código.
- **Investigación Visual Obligatoria**: En cada VIDEO-XXX, investigar apoyos después de comprender la narración y antes de diseñar escenas: material del proyecto, fuentes y cuentas oficiales, búsqueda general, noticias, redes sociales y repositorios permitidos. Seguir el orden, límites y registro definidos en la RAÍZ.
- **Procedencia y Derechos**: Google es un canal de descubrimiento, no una fuente ni una licencia. Registrar la investigación en `analysis/<video-id>-support-research.json` y todo recurso externo usado en `library/assets.json`; no llevar al render final recursos con derechos pendientes.
- **Identidad Real**: Priorizar logos, personajes y mascotas desde fuentes oficiales; no deformarlos ni presentar caricaturas, interfaces o assets generados como material oficial o evidencia real.
- **Infraestructura**: No instalar infraestructura o dependencias adicionales si ya existe una solución local que cumpla el propósito.
- **Acciones Críticas**: No ejecutar acciones destructivas sin confirmación explícita del usuario.
- **Render Final**: No hacer render final de producción sin autorización explícita del usuario.
