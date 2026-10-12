# Guión técnico y video de referencia (borrador, 2026-10-09)

Estado: **borrador** pendiente de la prueba del usuario con otra cuenta y una serie de videos. La documentación puede actualizarse; la aprobación del flujo con otra cuenta sigue pendiente. Una guía regenerada no prueba esa experiencia de uso.

## 1. Guión técnico: la entrada que más mejora el resultado

Para el mejor resultado, el usuario entrega un guión técnico: qué pasa en cada fragmento, qué motion lleva y qué iconos o emojis aparecen. Sin él, la IA decide por sí sola y el resultado es más genérico.

Plantilla (una fila por fragmento):

| # | Frase / fragmento (o tiempos) | Escena (qué se ve) | Motion (preset de `motion-ux/MOVIMIENTOS.md` o descripción) | Iconos / emojis / stickers | Texto en pantalla (estilo de `TEXTOS.md`) | Material (carpeta y archivo) |
|---|---|---|---|---|---|---|
| 1 | «¿Es posible crecer tu negocio?» | presentador + gancho | entrada-desenfoque | 📈 | gancho-apilado | tomas/principal/ |

Reglas:
- La IA trabaja sobre este guión: transcribe, lo cruza con lo que realmente se dice y **señala** diferencias en lugar de corregirlas en silencio.
- Lo que el guión no especifique lo decide la IA según el formato y Motion UX, y lo anota en la orden.
- Los cambios del guión van al bloque `cambios` de la orden; la orden manda.
- Si falta el guión, la IA propone uno a partir de la transcripción y lo muestra antes de montar.

## 2. Video de referencia del usuario

El usuario puede subir un video de referencia (en `material/referencias/`, no se versiona) y explicar qué quiere de él: ritmo, tipo de movimiento, textos, colores, estructura.

Reglas:
- Se analiza como **referencia de estilo**, no se copia: no se reutilizan sus textos, marcas, imágenes ni música (RAÍZ: derechos y procedencia).
- La IA mide lo que el usuario señala (movimiento, tiempos, tamaños, posiciones) con fotogramas, como hizo con las referencias de Motion UX, y propone el preset equivalente o uno nuevo con su confianza (alta/media/baja).
- Registra en la orden: archivo, qué se pidió tomar de él y qué preset resultó.
- Si el usuario no explica qué quiere de la referencia, la IA hace una pregunta antes de analizar.

## 3. Integración y validación

- Integrado en la skill única `/video-lab` y en la guía v2.2, sección 12.
- `material/referencias/` forma parte de la convención de `formatos/README.md`.
- Pendiente: prueba del usuario con otra cuenta y ajuste del flujo según su resultado.
