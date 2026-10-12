import React, { createContext, useContext } from "react";
import { Easing, interpolate } from "remotion";
import { evolvePath } from "@remotion/paths";
import { FONT, P, clamp } from "../video002/ui";

// Primitivas de VIDEO-003 (#edit-1-motion, «La guerra de la IA empezó»): gráficos de datos integrados en el plano
// (líneas, curvas, nodos, ejes, rótulos), con la paleta video-zeven: amarillo para las líneas y lo destacado, azul solo
// para lo digital (IA, modelos), rojo solo para tachar, rótulos en píldoras blancas con texto ink.
// Dos capas: «detrás» (SVG dentro del mundo de cámara, por debajo del presentador recortado) y «delante» (rótulos fuera
// del mundo: su posición sigue a la cámara, su tamaño no; así ningún rótulo se sale del área segura en un acercamiento).

export { FONT, P, clamp };
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.2, 1);

/** Progreso 0→1 entre dos frames (suavizado). */
export const prog = (f: number, a: number, b: number, easing = easeInOut) => interpolate(f, [a, Math.max(a + 1, b)], [0, 1], { ...clamp, easing });
/** Entrada (0→1) en `dur` frames desde `at` y salida opcional (1→0) desde `exit`. */
export const vis = (f: number, at: number, exit?: number, dur = 9, exitDur = 7) =>
  prog(f, at, at + dur, easeOut) * (exit === undefined ? 1 : 1 - prog(f, exit, exit + exitDur, Easing.in(Easing.cubic)));

/** Cámara del mundo: escala alrededor del foco (px del lienzo). */
export interface Cam { scale: number; fx: number; fy: number }
export const CamCtx = createContext<Cam>({ scale: 1, fx: 540, fy: 518 });
export const useCam = () => useContext(CamCtx);
/** Posición en pantalla de un punto del mundo con la cámara actual. */
export const toScreen = (c: Cam, x: number, y: number) => ({ x: c.fx + (x - c.fx) * c.scale, y: c.fy + (y - c.fy) * c.scale });

/** Zonas libres del encuadre (medidas con la máscara de persona): a los lados de la cabeza, sobre los hombros. */
export const ZONA = { izq: { x0: 70, x1: 300 }, der: { x0: 775, x1: 1010 }, arriba: 330, abajo: 950 } as const;

// ---------- capa «detrás» (SVG 1080×1920) ----------

/** Línea con «carcasa» oscura suave para leerse sobre la pared clara y sobre la cortina oscura. */
export const Trazo: React.FC<{ d: string; p?: number; color?: string; w?: number; opacity?: number; dash?: string; glow?: boolean }> = ({ d, p = 1, color = P.yellow, w = 6, opacity = 1, dash, glow = true }) => {
  if (p <= 0 || opacity <= 0) return null;
  const ev = dash ? { strokeDasharray: dash } : evolvePath(Math.min(1, p), d);
  return (
    <g opacity={opacity}>
      {glow ? <path d={d} fill="none" stroke="rgba(23,23,29,0.28)" strokeWidth={w + 7} strokeLinecap="round" strokeLinejoin="round" {...(dash ? {} : ev)} /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" {...ev} />
    </g>
  );
};

/** Nodo: círculo blanco con anillo de color; entra con escala 0,85→1; pulso opcional. */
export const Nodo: React.FC<{ x: number; y: number; t: number; color?: string; r?: number; pulso?: number }> = ({ x, y, t, color = P.yellow, r = 13, pulso = 0 }) => {
  if (t <= 0) return null;
  const s = 0.85 + 0.15 * t;
  return (
    <g opacity={t} transform={`translate(${x} ${y}) scale(${s})`}>
      {pulso > 0 && pulso < 1 ? <circle r={r + 8 + 34 * pulso} fill="none" stroke={color} strokeWidth={4} opacity={1 - pulso} /> : null}
      <circle r={r + 5} fill="rgba(23,23,29,0.30)" />
      <circle r={r} fill={P.card} stroke={color} strokeWidth={6} />
    </g>
  );
};

/** Punta de flecha en el extremo (x, y) con dirección `ang` (radianes). */
export const Punta: React.FC<{ x: number; y: number; ang: number; color?: string; s?: number; opacity?: number }> = ({ x, y, ang, color = P.yellow, s = 26, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI})`} opacity={opacity}>
    <path d={`M ${-s} ${-s * 0.62} L 2 0 L ${-s} ${s * 0.62}`} fill="none" stroke="rgba(23,23,29,0.28)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M ${-s} ${-s * 0.62} L 2 0 L ${-s} ${s * 0.62}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Retícula editorial muy sutil (líneas horizontales punteadas). */
export const Reticula: React.FC<{ o: number; ys?: number[] }> = ({ o, ys = [330, 480, 630, 780, 930] }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      {ys.map((y) => <line key={y} x1={60} x2={1020} y1={y} y2={y} stroke="rgba(255,255,255,0.55)" strokeWidth={2} strokeDasharray="2 14" strokeLinecap="round" />)}
    </g>
  );

/** Punto de una curva y = f(x) como path SVG (muestreo cada `step` px). */
export const curvaPath = (x0: number, x1: number, f: (x: number) => number, step = 10) => {
  let d = `M ${x0} ${f(x0).toFixed(1)}`;
  for (let x = x0 + step; x < x1; x += step) d += ` L ${x} ${f(x).toFixed(1)}`;
  return d + ` L ${x1} ${f(x1).toFixed(1)}`;
};
/** Camino suave (Catmull-Rom) por puntos. */
export const suave = (pts: [number, number][]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

// ---------- capa «delante» (HTML) ----------

export type Tono = "blanco" | "azul" | "amarillo" | "tenue";
const TONOS: Record<Tono, { bg: string; fg: string; border: string }> = {
  blanco: { bg: P.card, fg: P.ink, border: P.border },
  azul: { bg: P.blue, fg: "#FFFFFF", border: P.blue },
  amarillo: { bg: P.yellow, fg: P.ink, border: P.yellow },
  tenue: { bg: "rgba(255,255,255,0.86)", fg: P.ink2, border: P.border },
};

/**
 * Rótulo en píldora anclado a un punto del mundo (sigue a la cámara). `ax`/`ay`: anclaje del rótulo respecto al punto
 * (0 = izquierda/arriba, 0,5 = centro, 1 = derecha/abajo). `t`: visibilidad 0→1 (entra subiendo 14 px).
 */
export const Rotulo: React.FC<{
  x: number; y: number; t: number; children: React.ReactNode; tono?: Tono; size?: number; ax?: number; ay?: number;
  tachado?: number; escala?: number; style?: React.CSSProperties;
}> = ({ x, y, t, children, tono = "blanco", size = 30, ax = 0, ay = 0.5, tachado = 0, escala = 1, style }) => {
  const cam = useCam();
  if (t <= 0) return null;
  const s = toScreen(cam, x, y);
  const c = TONOS[tono];
  return (
    <div
      style={{
        position: "absolute", left: s.x, top: s.y, opacity: t,
        transform: `translate(${-ax * 100}%, ${-ay * 100}%) translateY(${(1 - t) * 14}px) scale(${(0.92 + 0.08 * t) * escala})`,
        transformOrigin: `${ax * 100}% ${ay * 100}%`,
        fontFamily: FONT, fontSize: size, fontWeight: 800, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap",
        color: c.fg, background: c.bg, border: `2px solid ${c.border}`, borderRadius: 999, padding: `${size * 0.32}px ${size * 0.6}px`,
        boxShadow: "0 10px 26px rgba(23,23,29,0.22), 0 3px 8px rgba(23,23,29,0.12)",
        ...style,
      }}
    >
      <span style={{ position: "relative" }}>
        {children}
        {tachado > 0 ? <span style={{ position: "absolute", left: -6, top: "52%", height: Math.max(4, size * 0.13), width: `calc(${tachado * 100}% + 12px)`, background: P.red, borderRadius: 4, transform: "rotate(-4deg)" }} /> : null}
      </span>
    </div>
  );
};

/** Texto suelto (microtipografía) anclado al mundo. */
export const Micro: React.FC<{ x: number; y: number; t: number; children: React.ReactNode; size?: number; color?: string; ax?: number; ay?: number; weight?: number; style?: React.CSSProperties }> = ({ x, y, t, children, size = 24, color = "#FFFFFF", ax = 0, ay = 0.5, weight = 800, style }) => {
  const cam = useCam();
  if (t <= 0) return null;
  const s = toScreen(cam, x, y);
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, opacity: t, transform: `translate(${-ax * 100}%, ${-ay * 100}%) translateY(${(1 - t) * 10}px)`, fontFamily: FONT, fontSize: size, fontWeight: weight, color, letterSpacing: "0.08em", lineHeight: 1.1, textShadow: "0 2px 10px rgba(23,23,29,0.55)", whiteSpace: "nowrap", ...style }}>
      {children}
    </div>
  );
};

/** Flecha ↑ tipográfica para indicadores. */
export const Sube: React.FC<{ color?: string }> = ({ color }) => <span style={{ color, marginLeft: "0.25em" }}>↑</span>;
