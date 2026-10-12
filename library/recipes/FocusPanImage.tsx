import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * FocusPanImage — cámara sobre una imagen o captura: encuadra regiones concretas (zoom in / zoom out / paneo)
 * en frames dados y dibuja marcas sobre lo que está escrito (subrayador, recuadro, subrayado, foco).
 * Las marcas viven en coordenadas de la imagen, así que acompañan a la cámara.
 * Estado: validada en VIDEO-001 (formato #edit-2-pantalla-dividida, 2026-10-04: capturas de la pizarra y de prensa en la zona superior).
 *
 * Diferencia con lo existente: SoftZoom solo empuja hacia un origen fijo; FocusHighlight señala en
 * coordenadas de pantalla y no sigue un zoom. Aquí la cámara se mueve entre regiones de la imagen.
 */

export interface FocusRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FocusKey {
  /** Frame (local) en que la cámara empieza a ir hacia `rect`. El primero debería ser 0. */
  frame: number;
  rect: FocusRect;
  /** Frames de transición hasta `rect`. */
  duration?: number;
}

export interface ImageMark {
  frame: number;
  rect: FocusRect;
  style: "marker" | "box" | "underline" | "spotlight";
  color?: string;
  /** Frame (local) en que la marca desaparece; si falta, dura hasta el final. */
  until?: number;
}

export interface FocusPanImageProps {
  src: string;
  imageWidth: number;
  imageHeight: number;
  zoneWidth: number;
  zoneHeight: number;
  keys?: FocusKey[];
  marks?: ImageMark[];
  /** Margen libre alrededor de la región encuadrada (px de zona). */
  padding?: number;
  /** contain = la región entera a la vista; cover = la región llena la zona. */
  fit?: "contain" | "cover";
  /** Acercamiento continuo por segundo mientras la cámara está quieta (0.01 = +1 %/s). */
  drift?: number;
  /** Tope del acercamiento continuo: evita que un apoyo largo acabe recortando la imagen por los lados. */
  maxDrift?: number;
  /** Captura tratada como tarjeta: esquinas redondeadas y sombra. */
  card?: boolean;
  /** Color de la sombra de la tarjeta (sobre fondos claros conviene una sombra ligera). */
  shadowColor?: string;
  accent?: string;
  /** Entrada: escala inicial del conjunto (1 = sin animación). */
  enterFrom?: number;
}

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const FocusPanImage: React.FC<FocusPanImageProps> = ({
  src,
  imageWidth,
  imageHeight,
  zoneWidth,
  zoneHeight,
  keys,
  marks = [],
  padding = 36,
  fit = "contain",
  drift = 0.012,
  maxDrift = 0.05,
  card = false,
  shadowColor = "rgba(0,0,0,0.55)",
  accent = "#ffe234",
  enterFrom = 0.94,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const full: FocusRect = { x: 0, y: 0, w: imageWidth, h: imageHeight };
  const ks = keys && keys.length ? keys : [{ frame: 0, rect: full }];

  const frameRect = (r: FocusRect) => {
    const sx = (zoneWidth - 2 * padding) / r.w;
    const sy = (zoneHeight - 2 * padding) / r.h;
    return { k: fit === "contain" ? Math.min(sx, sy) : Math.max(sx, sy), cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
  };

  // Estado de cámara: interpolación entre la clave previa y la vigente (escala en log, centro lineal).
  let cam = frameRect(ks[0].rect);
  let settledAt = ks[0].frame;
  for (let i = 1; i < ks.length; i++) {
    if (frame < ks[i].frame) break;
    const from = cam;
    const to = frameRect(ks[i].rect);
    const dur = ks[i].duration ?? 18;
    const p = interpolate(frame, [ks[i].frame, ks[i].frame + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    cam = {
      k: Math.exp(interpolate(p, [0, 1], [Math.log(from.k), Math.log(to.k)])),
      cx: interpolate(p, [0, 1], [from.cx, to.cx]),
      cy: interpolate(p, [0, 1], [from.cy, to.cy]),
    };
    settledAt = ks[i].frame + dur;
  }
  const still = Math.max(0, frame - settledAt) / fps;
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 140 }, durationInFrames: 14 });
  const k = cam.k * (1 + Math.min(maxDrift, drift * still)) * interpolate(enter, [0, 1], [enterFrom, 1]);
  const left = zoneWidth / 2 - cam.cx * k;
  const top = zoneHeight / 2 - cam.cy * k;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: imageWidth,
          height: imageHeight,
          transform: `scale(${k})`,
          transformOrigin: "0 0",
          opacity: interpolate(enter, [0, 1], [0, 1]),
        }}
      >
        <Img
          src={src}
          style={{
            width: imageWidth,
            height: imageHeight,
            display: "block",
            borderRadius: card ? 18 / k : 0,
            boxShadow: card ? `0 ${24 / k}px ${64 / k}px ${shadowColor}` : undefined,
          }}
        />
        {marks.map((m, i) => {
          if (frame < m.frame || (m.until !== undefined && frame >= m.until)) return null;
          const t = frame - m.frame;
          const color = m.color ?? accent;
          const grow = interpolate(t, [0, 9], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          const pop = spring({ frame: t, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
          const line = 4 / k;
          if (m.style === "marker") {
            return (
              <div key={i} style={{ position: "absolute", left: m.rect.x, top: m.rect.y, width: m.rect.w * grow, height: m.rect.h, background: color, opacity: 0.42, mixBlendMode: "multiply", borderRadius: 6 / k }} />
            );
          }
          if (m.style === "underline") {
            return (
              <div key={i} style={{ position: "absolute", left: m.rect.x, top: m.rect.y + m.rect.h - line, width: m.rect.w * grow, height: line * 1.6, background: color, borderRadius: line }} />
            );
          }
          if (m.style === "spotlight") {
            return (
              <div key={i} style={{ position: "absolute", left: m.rect.x, top: m.rect.y, width: m.rect.w, height: m.rect.h, borderRadius: 10 / k, boxShadow: `0 0 0 ${9999}px rgba(5,8,14,${0.55 * grow})` }} />
            );
          }
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: m.rect.x - 6 / k,
                top: m.rect.y - 6 / k,
                width: m.rect.w + 12 / k,
                height: m.rect.h + 12 / k,
                border: `${line}px solid ${color}`,
                borderRadius: 12 / k,
                boxShadow: `0 0 ${24 / k}px ${color}88`,
                transform: `scale(${interpolate(pop, [0, 1], [1.08, 1])})`,
                opacity: interpolate(pop, [0, 1], [0, 1]),
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
