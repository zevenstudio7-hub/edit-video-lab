# VIDEO-005 — Google + IA para contadores y asistentes administrativos

- **Formato:** `#edit-1-motion`, variante **1C** (presentador en las escenas 1, 5 y 9; Motion UX a pantalla completa en el resto). Subtítulos **S1 + S4** con palabra activa resaltada (cambio de la orden).
- **Objetivo (estrategia del usuario):** conversaciones con contadores y asistentes que usan Gmail, Drive y Sheets. Señal: comentarios con la palabra GOOGLE.
- **Estado:** exportada v1 (2026-10-13, a petición del usuario), pendiente de su revisión. Las marcas de Google recreadas (`requiere_revision`) siguen sin confirmar.
- **Exportación vigente:** `exportaciones/YR_GoogleIA_v1_9x16.mp4` (H.264, 1080×1920, 30 fps, bt709, ~3,6 Mbps; AAC 48 kHz ~190 kbps; 74,1 s) con la corrección de audio AAC (sin pérdida, desfase 0 contra las pistas; informe en `analysis/video-005-export-sync.json`). Junto a ella, `YR_GoogleIA_v1_9x16.srt` (84 bloques) y `YR_GoogleIA_v1_portada.png`.
- **Preview:** composición `Video005` en el Studio (`pnpm dev` → http://localhost:3000/Video005). Dura 74,1 s (2222 frames, 1080×1920, 30 fps): 72,6 s de toma y 1,5 s de tarjetas finales sin voz.
- **Guion del usuario:** `material/raiz-contenido-yeirodriguez.md`.
- **Orden técnica:** `video-orders/VIDEO-005.json`. Incluye `cambios` con su motivo, `diferencias` con el guion y `timeline` con el motivo de cada escena.

## Decisiones del usuario (2026-10-13)

- **Audio:** la voz queda intacta: la pista original de la toma, sin normalizar, sin comprimir y sin quitar pausas (≈ −16,1 LUFS). Los efectos y la música (−38,5 LUFS, unos 22 dB por debajo de la voz, con ducking y casi a cero en los últimos 2 s) van en pistas aparte.
- **Look:** `cine-calido` al **10 %**, solo en el metraje, mezclado en el proxy. `looks.json` dice que los looks cinematográficos se ven a partir del 30 %; se aplica al 10 % por petición expresa.
- **Motion UX:** perfil ZevenPRO con superficie `soft` claro. Es el primer `formatos/motion-ux/perfil.json`: no se vuelve a preguntar.
- **Iconos de Gmail, Drive y Sheets:** oficiales, recreados en motion (SVG). La RAÍZ y Motion UX piden no redibujar logos; se aplica la instrucción del usuario y queda señalado. Derechos: `requiere_revision`.
- **Subtítulos:**
  - lectura S1 a 66 px en y = 1438, con la palabra activa en amarillo sobre el presentador y con marcador amarillo sobre el motion claro;
  - S4 sobre superficie soft: titular de escena arriba (`titular-ui`), no en la franja negra;
  - un énfasis S1 («esto te interesa.»).

## Escenas

| # | Tiempo | Qué se ve |
|---|---|---|
| 1 | 0,0–8,0 | Yeison; aparecen Drive, Gmail y Sheets al nombrarlos; rótulo «¿Gmail + Drive + Sheets a diario?» |
| 2 | 8,0–13,9 | «Tu Google + IA»: los tres iconos orbitan el nodo IA; las líneas se encienden en «mucho más fácil» |
| 3 | 13,9–20,7 | Tres tarjetas, cada una con su frase: adjunto a la carpeta, hoja a PDF, solicitudes con check |
| 4 | 20,7–27,7 | «3 repositorios»: 01, 02 y 03 se iluminan con su función |
| 5 | 27,7–32,4 | Yeison; «Recibir → Organizar → Enviar» y tres checks |
| 5b | 32,4–38,5 | **Frase que no está en el guion** («La IA busca el correo… tú solo revisas»), con los pasos 2–5 de la demo. SIMULACIÓN |
| 6 | 38,5–47,1 | 01 Google Workspace CLI: el prompt se teclea al decirlo; «1. Pides»; «Listo para enviar». SIMULACIÓN |
| 7 | 47,1–57,1 | 02 clasp: tarjeta → código genérico desenfocado en «Apps Script» → Sheets → PDF → Drive → Gmail |
| 8 | 57,1–64,5 | 03 n8n-MCP: «El MCP diseña · n8n ejecuta»; Solicitud → Registro → Borrador en cadena |
| 9 | 64,5–72,6 | Yeison; «Guía: 3 repositorios»; píldora oscura de comentario: se escribe GOOGLE y la cruza un barrido de luz; el avatar entra en arco y se expande en la **tarjeta de perfil** recreada (yeirodriguez.co, «Yeirodriguez \| Estratega», sin cifras); el cursor pulsa «Seguir» (azul) → «Siguiendo» |
| fin | 72,6–74,1 | Las 3 tarjetas apiladas, «Comenta GOOGLE» y @yeirodriguez.co |

## Cierre: referencia del usuario (2026-10-13)

- La referencia está en `material/referencias/referencia-comenta-seguir.mov`. Es el reel de otro creador: de él solo se toma el movimiento. La medición está en la orden (`referencias`).
- Tu captura de perfil está en `material/captura-perfil-instagram.png`. La foto se recortó a `public/video-005/perfil-avatar.png`.
- Fotogramas de control: `revision/hoja-v2-cierre.jpg` y `revision/cmp-perfil.jpg`.

## Diferencias con el guion (la grabación manda)

En `video-orders/VIDEO-005.json → diferencias`. Las principales:
- el texto 1 («…Google Drive, Gmail, Google Sheets y todo el ecosistema de Google, quédate…»);
- el texto 5 («tarea completa… dejarlo listo para enviar»);
- la frase nueva de la escena 5b;
- «trabajas con instrucciones».

Con la voz sin tocar, el video dura 72,6 s más el cierre, no 60–65 s.

## Archivos

- `tomas/google workspace.mp4`: copia; el original sigue en Descargas.
- `material/raiz-contenido-yeirodriguez.md`.
- `public/video-005/`:
  - `hq/fuente-cine-calido-10.mp4`;
  - `voz-original.wav`, `sfx.wav` y `music.wav`.
- Herramientas en `src/videoAnalysis/video005/`:
  - `verifySnippets.mjs` (Gemini);
  - `buildTimeline.mjs`;
  - `buildAudioBeds.mjs`.
- Composición: `src/compositions/video005/`.
- `revision/`:
  - `hoja-v1.jpg` (25 fotogramas renderizados);
  - `comparacion-look-10.jpg` (original frente a look al 10 %).

## Pendiente

- **De oído:** «trabajas con / por instrucciones», «lleguen / llegan», nivel de música y efectos, y que la palabra activa vaya a tiempo.
- **Marcas de Google** recreadas: confirmar el uso antes del render final.
- **Entregables del guion:** portada PNG, `.srt` y el nombre `YR_GoogleIA_v1_9x16.mp4`. Se preparan con la exportación autorizada.
- **Studio:** reproduce a ~0,9× del tiempo real en el navegador integrado.

## Guía asociada (2026-10-13)

`formatos/guia-contadores/Guia-Conecta-tu-Google-con-IA-ZEVEN.pdf`: PDF de 10 páginas con portada Zeven, pasos, capturas y los tres enlaces (ver su README). Pendiente: alojarla y publicar el enlace de descarga; probar el flujo comentario GOOGLE → mensaje directo.
