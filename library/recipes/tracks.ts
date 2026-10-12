import { Easing, interpolate } from "remotion";

/**
 * Pistas de cámara y de layout independientes de los cortes (dirección V3 de VIDEO-001).
 * Funciones puras: dado el frame global devuelven escala de cámara o altura de la zona superior.
 * Estado: validada en VIDEO-001 (formato #edit-2-pantalla-dividida, 2026-10-04).
 *
 * Cámara: estable por defecto. Cada evento tiene motivo, entrada, permanencia y salida intencionada:
 *  - push: acerca en `inFrames`, sostiene hasta `holdEnd`, vuelve en `outFrames`;
 *  - drift: acercamiento lento y lineal entre `startFrame` y `holdEnd` (detalle), vuelve en `outFrames`.
 * Los eventos no se acumulan: fuera de un evento la escala es la base.
 * `inFrames: 0` / `outFrames: 0` = cambio instantáneo, para hacerlo coincidir con un corte (acercar o abrir
 * justo en el empalme que comprime una pausa dentro de la misma toma).
 */

export interface CameraEvent {
  id: string;
  type: "push" | "drift";
  startFrame: number;
  inFrames: number;
  toScale: number;
  holdEnd: number;
  outFrames: number;
}

const smooth = Easing.bezier(0.45, 0, 0.2, 1);

export const cameraScaleAt = (frame: number, baseScale: number, events: CameraEvent[]): number => {
  for (const e of events) {
    if (frame < e.startFrame || frame >= e.holdEnd + e.outFrames) continue;
    if (frame >= e.holdEnd) {
      return interpolate(frame, [e.holdEnd, e.holdEnd + e.outFrames], [e.toScale, baseScale], { easing: smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }
    if (e.type === "drift") {
      return interpolate(frame, [e.startFrame, e.holdEnd], [baseScale, e.toScale], { easing: Easing.inOut(Easing.sin), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    }
    if (e.inFrames <= 0) return e.toScale;
    return interpolate(frame, [e.startFrame, e.startFrame + e.inFrames], [baseScale, e.toScale], { easing: smooth, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }
  return baseScale;
};

/**
 * Layout por función narrativa: split (apoyo arriba + presentador), presenter (presentador a pantalla completa)
 * o graphic (apoyo a pantalla completa). Devuelve la altura de la zona superior en px.
 */
export type LayoutMode = "split" | "presenter" | "graphic";
export interface LayoutEvent {
  frame: number;
  mode: LayoutMode;
  transitionFrames: number;
}

const heightOf = (mode: LayoutMode, splitHeight: number, canvasHeight: number) =>
  mode === "split" ? splitHeight : mode === "presenter" ? 0 : canvasHeight;

export const topHeightAt = (
  frame: number,
  base: { mode: LayoutMode; topHeight: number },
  events: LayoutEvent[],
  canvasHeight = 1920
): number => {
  let current = heightOf(base.mode, base.topHeight, canvasHeight);
  for (const e of events) {
    if (frame < e.frame) break;
    const target = heightOf(e.mode, base.topHeight, canvasHeight);
    current = interpolate(frame, [e.frame, e.frame + e.transitionFrames], [current, target], {
      easing: Easing.bezier(0.7, 0, 0.2, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return current;
};

/** Modo vigente en un frame (el del último evento alcanzado). */
export const layoutModeAt = (frame: number, base: { mode: LayoutMode }, events: LayoutEvent[]): LayoutMode => {
  let mode = base.mode;
  for (const e of events) if (frame >= e.frame) mode = e.mode;
  return mode;
};
