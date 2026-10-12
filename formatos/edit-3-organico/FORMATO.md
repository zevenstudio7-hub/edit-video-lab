# #edit-3-organico — variantes (2026-10-09)

Estado: **definido, sin video ni aprobación audiovisual**. Rige la definición de la RAÍZ (`docs/VIDEO-SYSTEM-ROOT.md`): contenido natural, cortes limpios, subtítulos sencillos, edición mínima y nada de motion que compita con lo que se muestra (preset `organic-iphone-demo`). Identidad: `../identidad-video-zeven.md`. Subtítulos: `../subtitulos/SUBTITULOS.md`.

## Variantes

| Variante | Qué es | Cuándo usarla | Subtítulos (defecto · alternativa) | Proporción |
|---|---|---|---|---|
| **3A Tutorial en vivo** | iPhone Duo o pantalla, paso a paso | enseñar a usar algo mostrándolo de verdad | S6 · S2 | 9:16 |
| **3B Charla natural** | Solo cortes limpios y subtítulos | opinión, reflexión o noticia contada a cámara, sin adornos | S6 · S8 | 9:16 |
| **3C Orgánico horizontal 16:9** | Varias cámaras de la misma escena, cinematográfico (video 1) | historias personales y reflexiones con imagen cuidada, para YouTube o reels horizontales | S8 · S6 | 16:9 |

### 3A Tutorial en vivo
- Toma del iPhone en modo Duo (cámara frontal + trasera) o grabación de pantalla con la cara del usuario.
- Cortes en las pausas y en los tiempos muertos del proceso (cargas, esperas), sin perder ningún paso.
- Zoom suave solo para que se lea algo pequeño; ningún motion decorativo.
- Subtítulos S6 abajo, sin tapar la pantalla ni las manos.

### 3B Charla natural
- Una sola toma o varias del mismo plano; se quitan silencios largos y muletillas, y se conservan las pausas naturales (≤ 0,49 s, como en edit-2).
- Sin motion, sin stickers, sin música salvo que la orden la pida.
- Subtítulos S6; S8 si el plano deja un hueco claro.

### 3C Orgánico horizontal 16:9
Referencia interna (reel de otro autor, solo estilo; no se reutiliza): `referencias/analisis/v1-organico-h.jpg` (cada 0,5 s) y `v1-zoom.png` (0,7 / 3,1 / 7,1 / 9,6 s).
- **Varias cámaras de la misma escena:** plano medio a cámara, de espalda frente a la ventana, escritorio de noche, terraza… La voz sigue continua y los planos cambian en las pausas.
- **Gradación cálida natural**, sin looks fuertes; sin motion ni stickers.
- **Subtítulos S8:** sans fina construida palabra a palabra, con la palabra clave en negrita. **La posición la fija el sujeto** (decisión del usuario, 2026-10-10): el texto va en los dos espacios libres a los lados del sujeto, a la altura de su cabeza, centrado dentro de cada espacio y con margen al borde (≥ 8 % del ancho): nunca pegado a los costados. Al cambiar de encuadre (general, medio, cerrado) se vuelven a medir los espacios. Variaciones: en el hueco (frase entera en un espacio), partido (una pieza en cada espacio) y apilado (2 líneas dentro de un solo espacio, no en una esquina). Detalle: `../subtitulos/SUBTITULOS.md`.
- **Salida:** 1920×1080, 30 fps. Si se publica también en 9:16, se reencuadra cada plano por separado (no se escala el 16:9 entero).
- La muestra de la guía usa las tomas de VIDEO-001, que son horizontales (1920×1080); los «otros planos» son reencuadres de la misma cámara. Con varias cámaras reales el efecto es más claro.

## Qué sube el usuario

`tomas/principal/` (la toma con la voz), `tomas/apoyo/` (otras cámaras de la misma escena, en 3C), `material/capturas/` (en 3A, si hay grabación de pantalla aparte).

## Prompt base

```
VIDEO-XXX · EDIT_TYPE #edit-3-organico · variante 3C · subtitulos S8
Tomas: tomas/principal (voz) + tomas/apoyo (otras cámaras)
Objetivo y CTA: <…>
Destino: YouTube 16:9 | Reels
cambios: <…>
```

## Referencias registradas

| Video | Archivo original (sin versionar) | Análisis | Qué se tomó |
|---|---|---|---|
| video 1 (2026-10-09) | `~/Downloads/ScreenRecording_10-09-2026 19-32-05_1.mov` (11,6 s; grabación de pantalla de un reel horizontal; los iconos de Instagram no son parte del estilo) | `referencias/analisis/v1-organico-h.jpg`, `v1-zoom.png` | variante 3C y subtítulo S8 |
