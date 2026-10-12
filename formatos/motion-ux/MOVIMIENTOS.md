# Estilos de movimiento — catálogo

Estado: **candidato** (2026-10-09). Datos en `movimientos.json`; funciones de Remotion en `snippets/primitivas.ts`; versión ejecutable en `specimen/index.html`. Referencias de origen: `img/frames/` (hojas con tiempo y detalles cuadro a cuadro).

> Regla de oro: cuando se crea una animación, se **elige primero un preset de esta lista** y se ajusta solo lo que la escena pida. Si ningún preset sirve, se crea uno nuevo con el mismo formato (de → a, frames, easing o spring, origen, sonido) y se añade aquí.

## Cómo se usa

1. La orden o la skill dice *qué* debe pasar («aparece la tarjeta del prompt, se escribe, se pulsa enviar»).
2. Cada acción se asigna a un preset: `subida-tarjeta` → `escritura-con-tinte` → `cursor-clic`.
3. Los frames salen del audio (la acción empieza cuando se dice, no antes) y se solapan 4 frames entre acciones consecutivas.
4. Cada preset tiene su sonido sugerido (`zp-*`); máximo un efecto por beat.

## Los 20 presets

| Familia | Preset | Qué hace | Frames @30 | Origen |
|---|---|---|---|---|
| **Entradas** | `entrada-desenfoque` | opacidad + desenfoque 14→0 + subida de 14 px | 10 | mov-2 3,85 s |
| | `subida-tarjeta` | tarjeta sube 110 px con escala .95→1 | 18 | mov-1 1,38 s |
| | `revelado-lineas` | cada línea sube desde una máscara, en cascada | 12 + 3/línea | mov-2 4,6 s |
| | `cortina-central` | tarjeta se abre desde una línea central | 12 | mov-2 5,35 s |
| | `asentado-con-halo` | escala .94→1 con resplandor de color debajo | 24 | mov-2 5,6 s |
| | `pop-insignia` | insignia o número con spring pop | spring | mov-2 4,1 s |
| | `stickers-escalonados` | objetos aparecen uno a uno con rebote | 4 entre cada uno | creator-1 27,9 s |
| **Cambios de escena** | `cruce-desenfoque` | sale con desenfoque y entra la siguiente con solape de 4 f | 10 | mov-1 1,0 s |
| | `mosaico-disolver` | baldosas de una cuadrícula desaparecen en cascada | 8 por baldosa | mov-3 7,2 s |
| | `baraja-3d` | tarjetas apiladas; la del frente sale hacia abajo con desenfoque vertical | 44 + 10 | mov-3 9,1 s |
| | `logo-expandir` | icono centrado, luego el wordmark se abre hacia la izquierda | ≈ 52 | mov-3 15,6 s |
| **Interacción** | `escritura-con-tinte` | tecleo ≈ 17 car/s con palabras clave resaltadas y chips que se activan | según texto | mov-1 1,9 s |
| | `cursor-clic` | cursor viaja, pulsa, anillo y botón cambian | 26 + 14 | mov-1 2,0 s |
| | `tachado` | línea que tacha lo que no hay que hacer | 12 | mov-1 0 s |
| **Profundidad** | `inclinacion-3d` | panel entra inclinado y asienta; deriva lenta | 22 | mov-4 26 s |
| | `foco-lista` | el foco salta de fila a fila con borde y halo de color | 26 | mov-4 26 s |
| | `presentador-en-marco` | el presentador pasa a recuadro con borde glass | 14 | texto-2 1,8 s |
| **Énfasis** | `palabra-grande` | una palabra grande al centro, sans o serif cursiva | 16 | mov-4 29 s |
| **Ambiente** | `flotar` | deriva en reposo de stickers e iconos | continuo | creator-1 28 s |
| | `borde-aurora` | borde iridiscente que gira (un elemento por plano) | continuo | ref-01, 06, 12 |

Parámetros exactos (de→a, easing, spring, sonido, confianza): `movimientos.json`.

## Easings y springs

| Nombre | Valor | Para |
|---|---|---|
| `salida-expo` | `cubic-bezier(.16,1,.3,1)` | todo lo que aparece |
| `entrada-salida` | `cubic-bezier(.65,0,.35,1)` | cursor, cortinas, cruces |
| `suave` | `cubic-bezier(.4,0,.2,1)` | color y sombra |
| spring `suave` | `damping 200` | sin rebote |
| spring `pop` | `damping 14, stiffness 180, mass .8` | insignias, palabras, chips |
| spring `rebote` | `damping 8, stiffness 140` | stickers |
| spring `firme` | `damping 20, stiffness 300` | foco de lista |

## Remotion

```ts
import { useCurrentFrame } from "remotion";
import { entradaDesenfoque, subidaTarjeta, calendarioTecleo, caracteresVisibles } from "formatos/motion-ux/snippets/primitivas"; // copiar a src/ o library/recipes/ al usarlo

const frame = useCurrentFrame();
<h1 style={entradaDesenfoque(frame, 0)}>Dale <span>contexto</span>.</h1>
<div style={subidaTarjeta(frame, 8)}>…tarjeta…</div>
```

Reglas de implementación: animar por frame (nunca CSS transitions ni `setTimeout`); `backdrop-filter` funciona en el render de Remotion (Chromium) pero se limita a 3 capas por fotograma; las baldosas del mosaico usan un retardo fijo por índice (no `Math.random`) para que el render sea reproducible.

## Cómo quedan en la guía de uso

La guía en PDF incluye este catálogo con una muestra de cada familia, y el repositorio guarda las fuentes: `movimientos.json` (datos), `specimen/index.html` (ver y copiar) y `img/frames/` (referencias con tiempo). Los videos originales de referencia **no se versionan** (pesan ~400 MB): viven en la carpeta `Referencias de edición motión` del usuario y, si se quiere, en `formatos/motion-ux/referencias/` (ignorada por git).

## Añadir un movimiento nuevo

1. Grabar o encontrar la referencia y apuntar el origen (archivo y segundo).
2. Medir con fotogramas cada 0,1–0,2 s: de→a, duración, easing.
3. Añadirlo a `movimientos.json` y a la tabla de arriba; si se puede expresar como función pura, agregarlo a `snippets/primitivas.ts`; si es visible, a una escena del specimen.
4. Marcar la confianza (alta / media / baja) y lo que falte por confirmar.
