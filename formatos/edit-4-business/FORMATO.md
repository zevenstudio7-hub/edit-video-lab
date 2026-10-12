# #edit-4-business — definición

Estado: **definido el 2026-10-09, sin video ni aprobación audiovisual**. Las medidas son puntos de partida. El formato se aprueba con su primer video.

## Para quién y qué hace

Para **empresas y marcas**: una persona de la empresa (o su cliente) habla a cámara y la edición le da credibilidad y orden. Sobria, con la marca del cliente, con rótulos de nombre y cargo, datos reales y un cierre claro. A diferencia de `#edit-5-creator`, aquí no se busca una edición visible y llamativa; a diferencia de `#edit-3-organico`, sí lleva rótulos, datos y la marca.

## Variantes

| Variante | Qué es | Cuándo usarla | Subtítulos (defecto · alternativa) |
|---|---|---|---|
| **4A Caso o testimonio** | Un cliente o la empresa cuenta un resultado: problema → solución → cifra | prueba social, casos de éxito, reseñas en video | S7 · S1 |
| **4B Producto o servicio** | Presentación de la marca o de lo que vende, con rótulos y tomas del producto | página de servicio, lanzamiento, presentación corporativa | S7 · S1 |
| **4C Anuncio u oferta** | Pieza pautada con gancho, beneficio, prueba y CTA | campañas de Meta (Reels / Stories pagados) | S3 · S7 |

### 4A Caso o testimonio
- Estructura: gancho con el resultado → quién es (rótulo) → problema → qué hicieron → cifra → cierre.
- Rótulo de nombre y cargo en la primera aparición de cada persona (S7).
- La cifra va en un **dato en caja** (recuadro blanco con el número real) cuando aparece; nunca se inventan cifras.
- Tomas de apoyo del lugar, el equipo o el producto si existen; si no, se queda en la persona.

### 4B Producto o servicio
- Estructura: qué es → para quién → 2–3 beneficios → cómo se pide.
- Tomas del producto o capturas reales de la interfaz como evidencia (RAÍZ: material verificable).
- Logo del cliente en una esquina o en el cierre, archivo oficial sin redibujar.
- Motion UX si el producto es digital, en intensidad baja-media.

### 4C Anuncio u oferta
- Estructura: gancho (1–3 s, S3) → beneficio → prueba → oferta → CTA.
- **Márgenes de anuncios de Meta:** 14 % arriba, 35 % abajo, 6 % a los lados (en 1080×1920: y 269–1248, x 65–1015). Nada importante fuera.
- Duración 15–30 s. CTA con la acción exacta del anuncio (botón o texto).

## Identidad y marca del cliente

- Si el cliente entrega su marca (logo, colores, tipografía con licencia), **sustituye** a la paleta ZevenPRO en los gráficos y en el acento de S7. Se registra en la orden.
- Sin marca del cliente rige video-zeven en los gráficos, y S7 usa el azul `#0057FF` como acento.
- Los subtítulos de lectura nunca llevan textura en Business.

## Qué sube el cliente

| Carpeta | Qué |
|---|---|
| `tomas/principal/` | la persona hablando a cámara |
| `tomas/apoyo/` | producto, lugar, equipo |
| `material/logos/` | logo oficial (SVG o PNG) |
| `material/capturas/` | capturas reales de la interfaz o del resultado |
| `material/otros/` | manual de marca, colores, tipografía, cifras con su fuente |

## Qué obtiene

Un video 9:16 (y 1:1 o 16:9 si se pide) con cortes limpios, rótulos, datos reales en caja, la marca del cliente, subtítulos sobrios y CTA. Exportación con el procedimiento de la identidad (corrección del desfase de audio incluida).

## Política de producción

| Remotion/FFmpeg | Material real | Motion | IA imágenes | IA video |
|---|---|---|---|---|
| ON | PRIORIDAD | LOW-MEDIUM (rótulos, dato en caja, logo, Motion UX en baja si es digital) | OFF | OFF |

## Prompt base (para pedir un video)

```
VIDEO-XXX · EDIT_TYPE #edit-4-business · variante 4A · subtitulos S7
Cliente: <empresa> · marca: material/logos + colores <hex>
Objetivo y CTA: <qué debe hacer quien lo vea>
Personas y rótulos: <nombre — cargo>
Cifras reales y su fuente: <…>
Destino: Reels orgánico | anuncio Meta
cambios: <lo que quieras distinto>
```

## Pendiente

- Diseñar S7 en un still sobre una toma real y aprobarlo con el primer video.
- Receta de rótulo (lower third) y de dato en caja: no existen en la biblioteca; se crean como candidatas cuando el primer video las pida (tope de 2 recetas nuevas por video).
