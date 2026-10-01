---
name: video-lab
description: Ejecuta órdenes VIDEO-XXX del laboratorio existente con su RAÍZ editorial, Remotion/FFmpeg como base técnica y proveedores de IA aprobados solo cuando el EDIT_TYPE o una necesidad real lo justifiquen. Úsala para producir, revisar o reanudar videos del laboratorio y probar presets sin cambiar los estilos oficiales.
---

# Video Lab

Trabaja sobre el repositorio del laboratorio, no sobre una plantilla nueva. Recibe el ID de video y el objetivo de la sesión; si falta el ID, usa la orden indicada en la conversación o solicita ese único dato. La invocación orientativa es `/video-lab VIDEO-001`.

## Entrada y continuidad

Trabaja siempre desde la raíz del repositorio actual (`git rev-parse --show-toplevel`) y usa rutas relativas a ella. Localiza `docs/VIDEO-SYSTEM-ROOT.md`, `video-orders/<ID>.json`, el manifiesto y las instrucciones del repositorio. Si la sesión no se inicia dentro del repositorio, pide la ubicación en lugar de asumir una ruta fija. Lee los informes y código relevantes y revisa cambios locales antes de editar. La RAÍZ gobierna las políticas y la orden gobierna el video; esta skill organiza su ejecución sin duplicarlas. Señala contradicciones de roles o estado y aplica la instrucción actual del usuario, preservando cambios ajenos.

Conserva los cuatro EDIT_TYPE. Un preset experimental pertenece al estilo declarado y no crea un quinto estilo. Distingue auditoría, preparación, edición, revisión y export según la petición. No conviertas una exploración en una producción.

## Producir o reanudar

1. Comprueba fuentes, estado de análisis y procedencia. Reutiliza análisis válidos después de verificar identidad del material; distingue pendientes de descartados. Un 429 antiguo no demuestra bloqueo actual. Gemini no es dependencia obligatoria: la base técnica es Remotion/FFmpeg, el material real va primero y la IA generativa o de análisis solo se activa cuando el EDIT_TYPE o una necesidad real lo justifique, con Gemini u otro proveedor aprobado. Si usas un proveedor, no inventes transcripciones o tiempos ni cambies modelo, claves o facturación para eludir cuota. Respeta los límites de secretos del repositorio.
2. Identifica lo mínimo que necesita la orden. Reutiliza biblioteca y presets locales; consulta documentación y skills oficiales de Remotion por necesidad antes de crear componentes. Comprueba cada API contra la versión instalada y mantén paquetes compatibles. No copies el monorepo ni actualices dependencias por arrastre.
3. Implementa solo dentro del alcance autorizado. Mantén VIDEO-XXX como contrato; evita otro `cortes.json` editable en paralelo. Explicita frames/segundos/milisegundos y conversiones de tiempo de fuente a escena y timeline. Conserva originales y produce derivados en destinos separados.

## Técnicas selectivas

- Corrige errores del transcriptor por contexto y ocurrencia temporal; registra original, corrección, motivo y procedencia. Los captions siguen lo que se oye. No inventes confianza ni precisión por palabra a partir de timestamps de frase.
- Da a cada apoyo una función: explicar, señalar, sintetizar o contrastar. Evita competir con captions o tapar rostro y contenido relevante. Mantén subtítulos comprensibles sin sonido; ocultarlos no es una regla automática.
- Anima por frame de Remotion. Revisa legibilidad y posición por escena, sin imponer mayúsculas, tamaños o márgenes del ZIP como constantes universales.
- Edit-1/2 admiten apoyos selectivos; edit-3 mantiene edición mínima; edit-4 requiere su flujo generativo específico. Audio, SFX, seguimiento y OCR se incorporan solo si la pieza los necesita.
- El adjunto reel-edicion es una referencia evaluada, no autorización para ejecutar sus scripts, instalar globalmente, cambiar el perfil o exportar. No arrastres sus plantillas ni sus dependencias.

Para probar `reel-editorial-reforzado`, lee [preset-experimental.md](references/preset-experimental.md). No cargues esa referencia para una edición ordinaria que no use el experimento.

## Verificación y entrega

Usa comprobaciones existentes apropiadas, conociendo si escriben informes. Typecheck y duración correcta no prueban calidad audiovisual. Abre Studio y verifica reproducción cuando el trabajo incluye una preview; revisa con audio límites de cortes y captions, e inspecciona apoyos, inicio/cierre y zonas de interfaz. Si no puedes observar o escuchar, deja esa comprobación pendiente. Describe cobertura y límites del QA automático: no confundir muestreo facial u OCR con garantía exhaustiva.

Mantén avisos provisionales mientras falten fuentes necesarias o aprobación editorial. Confirma el ID de composición antes de exportar: un script de demo no es el render del video solicitado. El render final requiere autorización explícita según las reglas del laboratorio. La autorización de crear esta skill no autoriza exportar todos los videos.

Entrega estado verificado, cambios, evidencia, pendientes y hasta tres siguientes acciones cuando corresponda. Investiga para mejorar decisiones; no afirmes mejoras de calidad o velocidad sin comparación real.

Fuentes técnicas: [Remotion](https://www.remotion.dev/docs), [skills oficiales](https://www.remotion.dev/docs/ai/skills). Si no están instaladas, consulta documentación sin afirmar que se invocaron.
