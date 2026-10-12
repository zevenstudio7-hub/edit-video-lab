# Cuestionario de #edit-5-creator

> Colores: si ya existe `formatos/motion-ux/perfil.json`, la pregunta 4 (paleta) se omite y se reutilizan esos colores; se consulta solo si el usuario pide cambiarlos. En la pregunta 4 el usuario puede escribir cualquier hex, nombre de color o dar una imagen de referencia (ver `formatos/motion-ux/CUESTIONARIO.md`). El perfil se pregunta una sola vez.


Adaptado de la skill `reel-edicion` (referencia evaluada; no se copian sus scripts ni plantillas). Dos partes: el **perfil** (una vez) y las **preguntas del video** (cada orden, máximo 5). Se usa `AskUserQuestion`; el usuario siempre puede escribir otra respuesta (un hex, otra Google Font). No se pregunta lo que ya se sabe de la conversación, del perfil o de la memoria.

## A. Perfil (solo si no existe `formatos/edit-5-creator/perfil.json` o el usuario dice «cambia mi estilo»)

El resultado se guarda en `formatos/edit-5-creator/perfil.json` (formato: `perfil.example.json`). Sin perfil: valores de video-zeven y se ofrece hacer el perfil después.

**Ronda 1 — quién y dónde**
1. ¿Qué @ va como firma? (texto libre; vacío = sin firma)
2. ¿Idioma de tus videos? Español · Inglés · Portugués · Otro
3. ¿Dónde publicas? (multi) Instagram Reels · TikTok · YouTube Shorts · LinkedIn

**Ronda 2 — cómo se ve**
4. ¿Paleta? **ZevenPRO** (amarillo `#F5C518`, rojo `#FF4B2E`; por defecto) · Eléctrico (acento `#3DD6F5`) · Coral (acento `#FF5A36`, resalte `#FFD23F`) · Lima (acento `#C6F432`) · Violeta (acento `#A78BFA`, resalte `#F0ABFC`) · Otro: tu hex. Si el hex es muy oscuro para leerse sobre video, se avisa y se propone uno más claro.
5. ¿Tipografía de **lectura**? Inter Tight (por defecto) · Montserrat · Poppins · Plus Jakarta Sans · Otra Google Font
6. ¿Tipografía de **hook** (la que genera gancho)? Anton (condensada) · Bebas Neue (mayúsculas) · Archivo Black (ancha) · Bowlby One (cómic) · Inter Tight 900 · Otra. Ver `tipografias.json`. Se ofrece un still comparativo con una frase tuya antes de decidir.
7. ¿Subtítulos? Frase normal sin caja · MAYÚSCULAS sin caja · Frase en píldora · MAYÚSCULAS en píldora

**Ronda 3 — sonido y cierre**
8. ¿Efectos de sonido y música? Efectos sutiles, sin música · Efectos y música · Solo música · Solo mi voz
9. ¿Micro? De solapa o cerca de la boca · El del móvil o de sala
10. ¿Cómo cierras? Pregunta abierta · «Comenta PALABRA» (solo si hay un recurso que entregar) · «Sígueme» · Sin CTA

**En el chat (abiertas):** ¿Hay algo que NUNCA quieras ver (p. ej. «nada de emojis», «no tapes el producto»)? → `notas.evitar`. ¿Cómo es tu tono? → `notas.tono`.

Al terminar se muestra el resumen del perfil en una tabla. Cada corrección de estilo posterior («subtítulos más pequeños», «no pongas X nunca») se ofrece guardar en el perfil.

## B. Preguntas de cada video (máximo 5, con opción recomendada)

1. **Objetivo y CTA exacto:** ¿qué debe hacer quien lo vea?
2. **Estilo base:** collage (5A) · hook (5B) · explicativo (5C) · editorial lifestyle (5D); y qué cambios o agregados quieres encima.
3. **Tomas y carpetas:** el usuario sube cada elemento en su carpeta (`README.md`). **Tomas:** el agente propone cuáles son principales y cuáles de apoyo (con transcripción); tú confirmas o corriges.
4. **Material de apoyo:** capturas, B-roll, logos o emojis que deben aparecer y en qué frase. Si debe ser real y exacto y no lo entregaste, se te pide.
5. **Sonido:** efectos sí/no, música sí/no y de dónde sale (archivo o plataforma, con su licencia).

Lo medible se deduce sin preguntar: duración, resolución, ritmo de voz, silencios, zona libre del cuadro.
