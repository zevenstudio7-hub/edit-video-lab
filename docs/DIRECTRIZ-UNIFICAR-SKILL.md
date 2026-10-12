# Directriz para Code: una sola skill `/video-lab` con los 5 formatos

Fecha: 2026-10-09 · Orden del usuario (Yeison): **una sola skill con todos los formatos; sin una segunda skill.** El catálogo y la guía llevan **5** tipos (sin avatar). No hacer commit ni push; sin render final.

## Qué pasó (léelo antes de tocar nada)

Dos sesiones trabajaron en paralelo y yo (sesión Work/Cowork) sobrescribí con copias viejas algunos archivos tuyos sin commit (no hay copia en git). Ya reparé lo que pude desde tu versión actual (catálogo, validate, RAÍZ, formatos/README, guía, looks). **Lo que no pude reparar ni escribir, porque las herramientas remotas no escriben en `.claude/`, te toca a ti.** Revisa `git status` y `git diff` y no reviertas lo ajeno.

Archivos que pisé y cuyo contenido original tuyo se perdió (reconstruye desde tu memoria de sesión o desde `formatos/guia/guia.html`/`FORMATO.md`):
- `formatos/edit-5-creator/SKILL.md`: tu **sección 1** (preguntas de formato, variante y subtítulos). Mi versión actual no la tiene.
- `docs/Guia-de-uso-sistema-de-edicion-ZEVEN.pdf` (tu v2): hoy es mi v1.2 de 12 páginas. Hay que regenerarlo desde `guia.html`.
- Posibles cambios tuyos sin commit en la RAÍZ, `formatos/README.md` y `library/catalog.json` posteriores a tu último guardado. Ya los rehice a partir de tus FORMATO.md y la guía; compáralos con lo que recuerdes.

## Hecho por mí (verifica)

1. `library/catalog.json`: `edit_types` = `#edit-1-motion, #edit-2-pantalla-dividida, #edit-3-organico, #edit-4-business, #edit-5-creator`. 38 entradas. La columna `#edit-4-business` es **provisional** (copia de edit-3; ver `enrutamiento`); nuevas entradas `motion-ux`, `looks-color`, `formato-edit-4-business`.
2. `library/validate.mjs`: lista de 5 tipos (quité `#edit-6-avatar`) y mensajes «5 EDIT_TYPE».
3. `docs/VIDEO-SYSTEM-ROOT.md`: sección `#edit-4-business`, avatar renombrado `#edit-6-avatar` (fuera de guía), párrafos Motion UX y «Looks de color y guión técnico» con los looks por formato.
4. `formatos/README.md`: árbol y tabla de variantes 1A–5D con subtítulos.
5. `formatos/guia/guia.html` (v2.1): nueva sección 11 «Looks de color»; guion técnico pasa a 12; «Pedir cambios» a 13; línea de look en edit-1 y edit-3; ítem de look en la lista de revisión.
6. `formatos/looks/looks.json`: `por_formato` con los 5 + avatar «no aplica».

## Lo que debes hacer tú, en este orden

1. **Una sola skill.** Trabaja sobre `.claude/skills/video-lab/SKILL.md` (tu versión; no uses `formatos/edit-5-creator/video-lab-SKILL.md.nuevo`: es una base vieja de 5 tipos con avatar). Integra en ella:
   - las preguntas de **formato, variante y subtítulos** (árbol de la guía, sección 2) y el cuestionario de perfil de Creator (`formatos/edit-5-creator/CUESTIONARIO.md`);
   - **Motion UX** (`formatos/motion-ux/`): cuándo se activa solo (tema tecnología/software/IA), intensidad por formato, perfil de color que se pregunta **una sola vez** (`CUESTIONARIO.md`, `perfil.json`; color por hex, nombre o imagen de referencia);
   - **Looks** (`formatos/looks/looks.json`): se aplican solo a las tomas grabadas, con `ffmpeg -vf lut3d=file=…` tras el render; el bloque `cambios` elige `look: <id> | ninguno | NN %`; por defecto/alternativo por formato; los de edit-2/4/5 están pendientes;
   - **Guion técnico y video de referencia** (`formatos/GUION-TECNICO.md`): tabla por fragmento (frase, escena, motion, iconos/emojis, texto en pantalla, material); cruzar guion y audio y **señalar** diferencias; videos de referencia en `material/referencias/` solo como referencia de estilo (preguntar qué se quiere de ellos; no copiar contenido de terceros).
2. **Retirar la segunda skill:** quita `formatos/edit-5-creator/SKILL.md` y `video-lab-SKILL.md.nuevo` (o déjalos como notas sin vocación de skill; **no** como skill invocable). Busca y corrige toda mención de `/edit-5-creator` como skill: `grep -rn "edit-5-creator" --include=*.md --include=*.json .` (RAÍZ, READMEs, `catalog.json`, `.claude/`). Debe quedar una sola entrada de skill: `/video-lab`. Compruébalo con `ls .claude/skills .claude/commands` y `.claude/worktrees/*` (la sesión de feedback tiene una copia aislada; no la borres sin permiso).
3. **Carpeta antigua:** `formatos/edit-creator/` solo contiene un aviso de redirección; bórrala si el usuario lo autoriza (yo no puedo borrar).
4. **Revisa mis cambios** con `node library/validate.mjs` (debe ejecutarse limpio sobre el repo real; en mi copia parcial salían 71 errores de archivos ausentes, que no son del catálogo) y corrige lo que difiera de tu criterio. Confirma o corrige la columna provisional de `#edit-4-business`.
5. **Regenera el PDF:** `node formatos/guia/build-pdf.mjs` (hace copia de seguridad `-v1.pdf` del anterior). Lee el PDF página a página: portada, TOC completo, la imagen de la sección 11 (`../looks/comparacion-motion.jpg`) y que Motion UX/colores/guion/referencia estén completos. No hay avatar en ninguna parte.
6. **Pendientes que no puedo cerrar:** `looks` probados solo en cartas de prueba y fotogramas sintéticos (falta una toma real del usuario); `formatos/motion-ux/snippets/primitivas.ts` sin typecheck (no pude instalar dependencias); Motion UX no renderizado en Remotion; looks de edit-2/4/5 sin decidir.

## Guía única (orden del usuario, 2026-10-10)

Debe quedar **una sola guía**: `formatos/guia/guia.html` → `docs/Guia-de-uso-sistema-de-edicion-ZEVEN.pdf`. Sin segunda guía ni PDF paralelo. Cambios obligatorios:

1. **Imágenes mías dentro de la guía.** Las 10 muestras de Motion UX de mi versión v1.2 están en `formatos/guia/img-motion-ux/` (JPG). Incorpóralas a `guia.html` (rutas relativas `img-motion-ux/…`, mismo estilo que tus `muestras/`) y añade `formatos/guia/img-motion-ux/` a lo que `build-pdf.mjs` necesite leer:
   - portada o apertura de Motion UX: `a120.jpg`, `c40.jpg`, `d60.jpg`, `f100.jpg`;
   - sección de colores (el mismo diseño con un solo color cambiado: azul por defecto, verde, rojo): `e30.jpg`, `e30g.jpg`, `e30r.jpg`;
   - sección Motion UX: `b80.jpg` (aspecto general), `a40.jpg` (titular de UI + caja de prompt), `f100.jpg` (gancho apilado + serif), `c20v.jpg` (entrada de lista, oscuro).
   Las imágenes de looks ya están en la sección 11 (`../looks/comparacion-motion.jpg`; añade también `comparacion-carta-de-prueba.jpg` para edit-3). Si alguna no encaja en el diseño, dilo; no la descartes en silencio.
2. **Primera sección = «Empieza aquí» (1–2 páginas, antes de todo lo demás).** Reemplaza o precede a la sección 1 actual. Debe resolver, sin jerga y con pasos numerados, estas tres cosas, y nada más:
   - **A. Cómo instalar la skill.** Qué es `/video-lab`, dónde vive (`.claude/skills/video-lab/SKILL.md` del repo), cómo comprobar que está activa (por ejemplo, que aparezca al escribir `/video-lab`), cómo invocarla en Claude Code y qué carpeta abrir. Verifica cada paso contra el repo real antes de escribirlo; no inventes comandos. Hay **una sola** skill.
   - **B. Qué preguntas responderá el usuario.** Lista corta y en orden: ¿para quién es el video (marca personal o empresa)?, ¿qué protagoniza la imagen?, ¿qué variante?, ¿qué subtítulos?, color y estilo (una sola vez: color principal, resalte, superficie, tipografía), ¿look de color?, ¿guion técnico o video de referencia? Indica cuáles se preguntan **solo una vez** y cuáles en cada video.
   - **C. Qué formato elegir según el objetivo.** Una tabla de una pantalla: objetivo → formato → variante → subtítulos por defecto (p. ej. «vender o dar credibilidad a una empresa» → edit-4-business; «enseñar con gráficos» → edit-1; «mostrar una demo» → edit-2; «cercano y natural» → edit-3; «gancho y collage» → edit-5). **Con la identidad de su marca:** explica en una frase que el video usa la identidad ZevenPRO, o la marca del cliente si la entrega (logo, colores, tipografía), y dónde se sube (`material/logos/`, `material/otros/`).
   Remata con un recuadro «Después de esto, la guía tiene…» y el índice de secciones, para que se sepa qué hay de ahí en adelante. El resto de la guía es referencia: no debe ser necesario leerla entera para empezar.
3. **Menos texto, más orientación.** Cada sección posterior abre con una línea «cuándo usar» y una imagen; el detalle va después. Si algo del «Empieza aquí» se repite más abajo, deja una referencia («ver sección N») en lugar de copiarlo.
4. Tras reordenar, actualiza el TOC, la numeración, las referencias cruzadas y la versión (v2.2), regenera el PDF y revísalo página a página (portada, «Empieza aquí», imágenes cargadas, sin avatar).
5. **Imágenes que faltan: Code las crea.** Haz un inventario de la guía y genera todas las imágenes que falten, con prioridad en la sección de subtítulos:
   - **Subtítulos S1–S9:** cada estilo debe tener su secuencia de fotogramas (inicio, palabra clave, cierre) y su caja de prompt; si alguno solo tiene texto o una muestra débil, rehazlo. Incluye un cuadro comparativo de los 9 en una sola página para elegir de un vistazo.
   - **Variantes 1A–5D:** una imagen por variante; las que hoy son esquemas o no existen se hacen con stills reales de Remotion sobre tomas del usuario (`remotion still`, 1080×1920, o 1920×1080 para 3C).
   - **«Empieza aquí»:** un diagrama simple del flujo (instalar → responder preguntas → elegir formato → preview).
   - **Looks:** una imagen por look (los 5) sobre un fotograma de una toma real del usuario, original frente a look, cuando haya una toma disponible; hasta entonces, la carta de prueba actual, rotulada como tal.
   - **Motion UX y colores:** las del punto 1 más las que falten para los 20 movimientos y 10 rótulos que no tengan ejemplo.
   Reglas: cada imagen lleva su pie («muestra propia del sistema», qué toma usó); las interfaces simuladas se rotulan como ilustración, no como producto real; no uses material de terceros ni inventes pantallas de productos reales; las imágenes pesadas no se versionan en git si el `.gitignore` lo prohíbe (se guardan en `formatos/guia/muestras/`). No hagas render final de video: solo stills.

## Look adicional en `#edit-1-motion` (orden del usuario, 2026-10-10)

El usuario aportó un tercer video de colorización (grabación de pantalla `ScreenRecording_10-09-2026_23-54-49`, clave muy baja, interior con cortinas burdeos y madera). Ya creé el look **`burdeos-calido`**: `formatos/looks/burdeos-calido.cube` + entrada en `looks.json` (parámetros, aproximación CSS y comando FFmpeg) + `formatos/looks/comparacion-edit1-3looks.jpg` + README de looks + sección 11 de la guía + párrafo de la RAÍZ. Code debe:
1. Dejarlo registrado en `#edit-1-motion` como **tercer look a pedido** (`look: burdeos-calido`); no cambia el defecto (luminoso-aire) ni la alternativa (oscuro-cinematico), salvo que el usuario lo pida.
2. Reflejarlo en `.claude/skills/video-lab/SKILL.md` (lista de looks de edit-1) y en la guía final («Empieza aquí» y sección de looks: **cinco** looks en total).
3. Validarlo en una toma real de edit-1 (comparar con y sin look; bajar al 70 % si pesa). Está medido sobre un video de otro creador ya graduado y probado solo en carta de prueba: **sin validar**. No guardar ni copiar el video de referencia (interfaz de Instagram incluida); solo se usaron sus medidas.
4. Comprobar con `ffmpeg -vf lut3d=file=formatos/looks/burdeos-calido.cube` sobre una toma del usuario antes de dar el look por bueno.

## Criterio de cierre

Una skill (`/video-lab`), una guía con «Empieza aquí» e imágenes incluidas, cinco tipos en RAÍZ+catálogo+validate+guía, validate limpio, PDF regenerado y revisado, sin commit ni push y sin tocar lo ajeno. Reporta lo que no pudiste comprobar.
