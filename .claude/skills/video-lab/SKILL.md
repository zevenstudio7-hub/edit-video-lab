---
name: video-lab
description: Única skill del laboratorio de video. Ejecuta órdenes VIDEO-XXX con su RAÍZ editorial, Gemini para análisis y Remotion para edición y preview, en los cinco formatos (#edit-1-motion, #edit-2-pantalla-dividida, #edit-3-organico, #edit-4-business, #edit-5-creator). Pregunta lo que falte para elegir formato, variante (1A–5D) y subtítulos (S1–S9), y aplica perfil de color, Motion UX, looks, guion técnico y videos de referencia. Úsala para producir, revisar o reanudar videos, elegir formato o subtítulos, editar en formato Creator o Business y probar presets sin cambiar los estilos oficiales.
---

# Video Lab

Trabaja sobre el repositorio del laboratorio, no sobre una plantilla nueva. Recibe el ID de video y el objetivo de la sesión; si falta el ID, usa la orden indicada en la conversación o solicita ese único dato. La invocación orientativa es `/video-lab VIDEO-001`.

## Entrada y continuidad

Localiza `docs/VIDEO-SYSTEM-ROOT.md`, `video-orders/<ID>.json`, la carpeta del video en `formatos/<edit-type>/<ID>-<tema>/` (ficha `README.md`, `exportaciones/`, `material/`, `revision/`; si no existe, créala según `formatos/README.md`), el manifiesto y las instrucciones del repositorio. Si la sesión se inicia en otro directorio, el laboratorio conocido está en `/Volumes/YeiRodriguez/Projects IA/gemini-video-lab`; verifica que existe antes de usarlo. Lee los informes y código relevantes y revisa cambios locales antes de editar. La RAÍZ gobierna las políticas y la orden gobierna el video; esta skill organiza su ejecución sin duplicarlas. Señala contradicciones de roles o estado y aplica la instrucción actual del usuario, preservando cambios ajenos.

El catálogo operativo y la guía tienen **cinco** EDIT_TYPE: `#edit-1-motion`, `#edit-2-pantalla-dividida`, `#edit-3-organico`, `#edit-4-business` y `#edit-5-creator`. Hay 15 variantes (1A–5D) y 9 estilos de subtítulos (S1–S9). El flujo de avatar se conserva en la RAÍZ como histórico fuera de este catálogo. La única skill del laboratorio es `/video-lab`; Creator es un formato y sus documentos son referencias, no otra skill.

## Elegir formato, variante y subtítulos

Reutiliza decisiones de la conversación, el perfil y la orden. Pregunta solo lo que falte, en este orden; agrupa respuestas relacionadas y deduce duración, orientación y voz continua del material:

1. **¿Para quién es el video?** Marca personal o creador; empresa o cliente. Para empresa, propone Business y comprueba el objetivo.
2. **¿Qué protagoniza la imagen?** Explicar con gráficos → edit-1; apoyos en zona aparte o demo → edit-2; mostrar algo en vivo o hablar naturalmente → edit-3; caso, producto u oferta de empresa → edit-4; gancho y superposición de capturas, B-roll, emojis o collage → edit-5. El objetivo manda: ser una empresa no obliga a abandonar una demo útil.
3. **¿Qué variante?** Propón una según el material y confirma solo si falta:

| Formato | Pregunta de variante | Subtítulos por defecto; alternativa |
|---|---|---|
| edit-1 | Motion sobre ti (1A), pantalla completa con tu voz (1B) o combinado (1C) | 1A S1; S3 · 1B S4; S1 · 1C S1+S4; S3 |
| edit-2 | Apoyo arriba y tú abajo (2A), o demo protagonista con recuadro (2B) | 2A S1; S6 · 2B S6; S1 |
| edit-3 | Tutorial en vivo (3A), charla natural (3B), o horizontal 16:9 (3C) | 3A S6; S2 · 3B S6; S8 · 3C S8; S6 |
| edit-4 | Caso/testimonio (4A), producto/servicio (4B), o anuncio/oferta (4C) | 4A/4B S7; S1 solo lectura sobria · 4C S3; S7 |
| edit-5 | Collage (5A), hook (5B), explicativo (5C), o editorial lifestyle (5D) | 5A S2; S5 · 5B S3; S2 · 5C S2; S6 · 5D S9; S5 |

4. **¿Qué subtítulos?** Propón el defecto y la alternativa; para comparar, lee `formatos/subtitulos/SUBTITULOS.md` y las secuencias de la guía. Registra `EDIT_TYPE`, `variante` y `subtitulos` en la orden. Los subtítulos que flotan en el plano (S5, S8, cascada de S9) se colocan según el sujeto: en los dos espacios libres a sus lados, a la altura de su cabeza, centrados en cada espacio y nunca pegados a los costados (margen ≥ 8 % del borde; ficha en `SUBTITULOS.md`). Un cambio experimental no crea un sexto formato.
5. **Color y estilo, una sola vez.** Respeta el perfil existente y la marca del cliente (logo en `material/logos/`, colores/fuentes en `material/otros/`). Para Motion UX, lee `formatos/motion-ux/CUESTIONARIO.md`: principal, resalte, superficie y tipografía. Para Creator, carga también la parte A de `formatos/edit-5-creator/CUESTIONARIO.md` y su `perfil.example.json`: firma, idioma, destinos, lectura/hook, subtítulos, sonido y cierre, tono y `notas.evitar`. Reutiliza paleta y lectura ya decididas en Motion UX; pregunta solo lo específico de Creator. No repitas colores ni tipografía compartidos al cambiar de formato. Guarda decisiones confirmadas en el perfil correspondiente; no crees un perfil ficticio por aplicar valores por defecto.
6. **¿Look de color?** Propón el del formato según la sección Looks. Sin cambio pedido, reutiliza la elección del perfil/orden; los formatos sin defecto asignado usan `ninguno` hasta decidirlo.
7. **¿Guion técnico o video de referencia?** Si existe, lee `formatos/GUION-TECNICO.md`. Antes de analizar una referencia, pregunta qué se quiere tomar de ella si el usuario no lo indicó.

Para Creator, completa solo los datos del video que falten de la parte B del cuestionario: objetivo/CTA, variante y cambios, tomas, apoyo por frase y sonido. Incluye 5D (editorial lifestyle), aunque la lista antigua diga solo tres estilos. Propón principal/apoyo con el análisis y confirma las clasificaciones ambiguas. Lee `FORMATO.md`, `estilos.json` y `tipografias.json` del formato al ejecutarlo.

Distingue auditoría, preparación, edición, revisión y exportación según la petición. No conviertas una exploración en producción.

## Producir o reanudar

1. Comprueba fuentes, estado de análisis y procedencia. Reutiliza análisis válidos después de verificar identidad del material; distingue pendientes de descartados. Un 429 antiguo no demuestra bloqueo actual. Mantén Gemini API y `@google/genai` para análisis audiovisual; no inventes transcripciones o tiempos ni cambies modelo, claves o facturación para eludir cuota. Respeta los límites de secretos del repositorio.
2. Identifica lo mínimo que necesita la orden. Antes de diseñar apoyos, ejecuta la investigación visual obligatoria de la RAÍZ y crea o actualiza `analysis/<video-id>-support-research.json`. Reutiliza biblioteca y presets locales; consulta documentación y skills oficiales de Remotion por necesidad antes de crear componentes. Comprueba cada API contra la versión instalada y mantén paquetes compatibles. No copies el monorepo ni actualices dependencias por arrastre.
3. Implementa solo dentro del alcance autorizado. Mantén VIDEO-XXX como contrato; evita otro `cortes.json` editable en paralelo. Explicita frames/segundos/milisegundos y conversiones de tiempo de fuente a escena y timeline. Conserva originales y produce derivados en destinos separados.

## Investigación de apoyos reales

Para cada video, busca primero en el material del proyecto y después en el sitio, newsroom, kit de marca y cuentas oficiales de lo que se habla. Amplía con búsqueda general, noticias, redes sociales y repositorios con licencias permitidas. Google sirve para descubrir páginas; no es la fuente ni una licencia. Cubre conceptos, marcas, productos, personas y hechos centrales, y detén la búsqueda cuando cada necesidad importante tenga una opción verificable o un pendiente explícito. En reediciones, reutiliza el informe válido y actualiza solo las necesidades nuevas, los cambios de contenido o las fuentes sensibles al tiempo.

Considera imágenes, clips, capturas, logos, personajes y mascotas oficiales cuando aporten comprensión o credibilidad; no los añadas como decoración. Prefiere archivos oficiales sin redibujar ni deformar marcas. Una caricatura, mascota o interfaz generada debe presentarse como conceptual, no como material oficial o evidencia real.

En el informe registra consulta, URL original, autor o cuenta, carácter oficial, fecha, función editorial, escena, licencia o base de uso, atribución y decisión. Usa `permitido`, `requiere_revision` o `no_utilizable` para derechos; `permitido` exige licencia, autorización, titularidad del usuario o una base de uso documentada y nunca se infiere por tratarse de un sitio oficial. Usa `seleccionado`, `referencia` o `descartado` para la decisión. Los seleccionados externos también entran en `library/assets.json`. No descargues ni integres un resultado solo por estar públicamente visible, no retires marcas de agua y no lleves al render final ningún recurso con derechos pendientes.

## Motion UX: motion predeterminado para tecnología y software

Si el guion, la orden o lo que se dice trata de herramientas, tecnología, software, IA, plataformas, apps o sistemas digitales, el motion por defecto (iconos, tarjetas, cajas de UI, escritura, cursor, botones en movimiento) es **Motion UX / Soft Glass UI**, en cualquier EDIT_TYPE excepto `#edit-6-avatar` (en `#edit-3-organico` y `#edit-4-business`, en intensidad baja y baja-media, respectivamente). La orden puede subir, bajar o desactivar la intensidad (`cambios`).

1. Lee `formatos/motion-ux/MOTION-UX.md` (enrutamiento, intensidad por EDIT_TYPE, reglas de verdad) y `tokens.json`. El resto se carga solo si hace falta: `movimientos.json`/`MOVIMIENTOS.md` (20 presets; elige uno antes de inventar), `textos.json`/`TEXTOS.md` (10 estilos de rótulo), `specimen/index.html` (cómo se ve), `snippets/primitivas.ts` (funciones Remotion).
2. **Perfil de color, una sola vez:** si no existe `formatos/motion-ux/perfil.json`, haz el cuestionario de `formatos/motion-ux/CUESTIONARIO.md` (color por hex, nombre o imagen de referencia). Si existe, no vuelvas a preguntar salvo que el usuario diga «cambia mi estilo». Si un perfil Creator o la marca del cliente ya fija estos datos, reutilízalos y confirma solo diferencias; no hagas dos cuestionarios de color. En sesiones sin lector, aplica ZevenPRO y dilo.
3. Una pantalla simulada es ilustración conceptual; lo que afirme algo de un producto real va con captura verificable (investigación de apoyos).
4. Estado: candidato; la guía tiene stills técnicos de Remotion para los 20 movimientos y 10 rótulos (2026-10-10), sin revisión de movimiento continuo, audio ni aprobación. Las recetas se crean bajo demanda (tope de 2 por video) y pasan a `validada` solo con una orden y una preview revisada. No sustituye el estilo de subtítulos de la orden.
5. Carpetas del video: el usuario sube cada tipo de elemento en su carpeta (`formatos/README.md`).

## Looks: solo las tomas grabadas

Lee `formatos/looks/looks.json`. Hay cinco LUT candidatas: `luminoso-aire`, `oscuro-cinematico`, `burdeos-calido`, `cine-calido` y `cine-sobrio`. Edit-1: defecto luminoso-aire, alternativa oscuro-cinematico y burdeos-calido **a pedido**; edit-3: cine-calido / cine-sobrio; edit-2/4/5: pendientes, usa `ninguno` o la elección explícita. La prueba técnica con una toma no constituye aprobación editorial.

El bloque `cambios` admite `look: <id>`, `look: ninguno` y una intensidad (`look: burdeos-calido 70 %` o `look: 70 %` sobre el look ya elegido). Registra ID e intensidad 0–100; si solo hay porcentaje y ningún look elegido, pide el ID. La orden gana sobre el perfil y el defecto.

Comprueba el espacio de color con ffprobe: HDR/Log requiere conversión a Rec.709 antes de la LUT. Conserva el original. FFmpeg aplica la LUT con `-vf lut3d=file=formatos/looks/<id>.cube` a un derivado de la toma. Si se hace después de un render, ese render debe contener **solo metraje**, antes de componer gráficos. No apliques la LUT al compuesto final con textos/logos/Motion UX: alteraría su identidad. Para intensidad parcial, mezcla la toma graduada con la original mediante `split`, `lut3d` y `blend`. En Studio, la aproximación CSS es orientativa, no sustituye la LUT.

Compara original, 100 % y 70 % en un still de la toma real, verificando piel, sombras, luces y legibilidad. Mantén burdeos-calido como candidato hasta la aprobación del usuario; se aplica tal cual está medido y sus «tonos» son solo la intensidad de la mezcla (30, 50, 70, 100 %). Los looks cinematográficos se usan desde el 30 %. Nunca guardes el video de terceros usado para medirlo.

## Guion técnico y referencias

Usa la tabla de `formatos/GUION-TECNICO.md`: fragmento/frase, escena, motion, iconos/emojis, texto en pantalla y material con archivo. Cruza cada fila con audio y transcripción, y **señala** diferencias de palabras, orden y tiempos; no cambies guion o captions en silencio. Los captions siguen el audio. Registra decisiones en VIDEO-XXX y su bloque `cambios`. Sin guion, propón la tabla mínima desde el análisis real antes de montar.

Los videos en `material/referencias/` orientan solo estilo: pregunta si se quiere ritmo, estructura, movimiento, texto o color; registra archivo, aspecto solicitado y preset equivalente con confianza explícita. No copies textos, imágenes, marcas ni música de terceros. Reutiliza un análisis válido y mide solo lo solicitado.

## Técnicas selectivas

- Corrige errores del transcriptor por contexto y ocurrencia temporal; registra original, corrección, motivo y procedencia. Los captions siguen lo que se oye. No inventes confianza ni precisión por palabra a partir de timestamps de frase.
- Da a cada apoyo una función: explicar, señalar, sintetizar o contrastar. Evita competir con captions o tapar rostro y contenido relevante. Mantén subtítulos comprensibles sin sonido; ocultarlos no es una regla automática.
- Anima por frame de Remotion. Revisa legibilidad y posición por escena, sin imponer mayúsculas, tamaños o márgenes del ZIP como constantes universales.
- Edit-1/2 admiten apoyos selectivos; edit-3 mantiene edición mínima; edit-4-business, sobriedad, rótulos, datos reales y la marca del cliente (`formatos/edit-4-business/FORMATO.md`); edit-5-creator, su FORMATO, cuestionario y catálogo de textos de Motion UX; edit-6-avatar requiere su flujo generativo específico. Los subtítulos siguen la ficha del catálogo elegida en la orden. Audio, SFX, seguimiento y OCR se incorporan solo si la pieza los necesita.
- El adjunto reel-edicion es una referencia evaluada, no autorización para ejecutar sus scripts, instalar globalmente, cambiar el perfil o exportar. No arrastres sus plantillas ni sus dependencias.

Todos los formatos usan la identidad video-zeven: [formatos/identidad-video-zeven.md](../../../formatos/identidad-video-zeven.md); el estilo de subtítulos sale del catálogo: [formatos/subtitulos/SUBTITULOS.md](../../../formatos/subtitulos/SUBTITULOS.md). Para `#edit-3-organico`, `#edit-4-business` y `#edit-5-creator`, lee su `FORMATO.md` en `formatos/<formato>/`. Para una orden `#edit-1-motion`, lee el formato en preparación: [formatos/edit-1-motion/FORMATO.md](../../../formatos/edit-1-motion/FORMATO.md) (nota del usuario, análisis del ejemplo y pendientes; no hay edición aprobada todavía). Para una orden `#edit-2-pantalla-dividida`, sigue el formato aprobado el 2026-10-04: [formatos/edit-2-pantalla-dividida/FORMATO.md](../../../formatos/edit-2-pantalla-dividida/FORMATO.md) (variante 2A; referencia VIDEO-001, `formatos/edit-2-pantalla-dividida/VIDEO-001-apple-vs-samsung/exportaciones/Video001V5.mp4`). Salió del experimento `reel-editorial-reforzado`, cuyo planteamiento queda como historial en [preset-experimental.md](references/preset-experimental.md); no cargues esa referencia salvo para consultar el origen del formato.

## Verificación y entrega

Usa comprobaciones existentes apropiadas, conociendo si escriben informes. Typecheck y duración correcta no prueban calidad audiovisual. Abre Studio y verifica reproducción cuando el trabajo incluye una preview; revisa con audio límites de cortes y captions, e inspecciona apoyos, inicio/cierre y zonas de interfaz. Si no puedes observar o escuchar, deja esa comprobación pendiente. Describe cobertura y límites del QA automático: no confundir muestreo facial u OCR con garantía exhaustiva.

Antes de declarar una preview revisable, comprueba que existe la investigación de apoyos, que cubre los temas centrales y que cada recurso externo visible tiene procedencia y estado de derechos. La relevancia editorial se valida en la preview; la mera existencia de un recurso oficial no justifica usarlo.

Mantén avisos provisionales mientras falten fuentes necesarias o aprobación editorial. Confirma el ID de composición antes de exportar: un script de demo no es el render del video solicitado. El render final requiere autorización explícita según las reglas del laboratorio. La autorización de crear esta skill no autoriza exportar todos los videos. La exportación pasa por `node src/videoAnalysis/fixRenderAudioSync.mjs` (corrige el desfase de audio AAC del render sin recodificar), se guarda en `exportaciones/` de la carpeta del video, con un nombre nuevo, y se anota en su ficha; `out/` es solo la salida de paso del render. Las capturas de control van a `revision/` y lo que entrega el usuario, a `material/`.

Entrega estado verificado, cambios, evidencia, pendientes y hasta tres siguientes acciones cuando corresponda. Investiga para mejorar decisiones; no afirmes mejoras de calidad o velocidad sin comparación real.

Fuentes técnicas: [Remotion](https://www.remotion.dev/docs), [skills oficiales](https://www.remotion.dev/docs/ai/skills). Si no están instaladas, consulta documentación sin afirmar que se invocaron.
