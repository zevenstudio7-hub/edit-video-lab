import React, { useId } from "react";
import { Easing, interpolate, spring } from "remotion";

// Kit visual de los gráficos en movimiento (zona superior) de VIDEO-001 V3 con la identidad ZevenPRO (2026-10-04):
// fondo claro crema → azul, tarjetas blancas con borde suave y sombra ligera, amarillo como énfasis, azul solo para lo
// digital y rojo solo para alertas. Los subtítulos NO usan esta paleta (conservan su estilo; ver TypeCaptions).
// Escenario lógico de 1080×760 que se escala dentro del rectángulo seguro de Instagram (Video001V3 → SAFE).
// Ilustraciones planas y reconocibles como ilustración (no imitan interfaces ni fotos reales).

export interface Palette {
  /** Fondo crema claro. */
  bg: string;
  /** Fondo azul suave. */
  bgBlue: string;
  /** Fondo azul claro. */
  bgBlueLight: string;
  /** Tarjetas y bloques. */
  card: string;
  /** Texto principal. */
  ink: string;
  /** Texto secundario. */
  ink2: string;
  /** Bordes suaves. */
  border: string;
  /** Amarillo principal: énfasis, botones, líneas, marcadores, palabras clave. */
  yellow: string;
  yellowSoft: string;
  /** Azul fuerte: tecnología, IA, datos (acento adicional). */
  blue: string;
  /** Rojo: alertas y puntos críticos (con moderación). */
  red: string;
}

export const STAGE_W = 1080;
export const STAGE_H = 760;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** Progreso con muelle a partir de un beat (0 antes del beat). */
export const sp = (frame: number, fps: number, at: number | undefined, cfg?: { damping?: number; stiffness?: number; mass?: number }) =>
  at === undefined ? 0 : spring({ frame: frame - at, fps, config: { damping: cfg?.damping ?? 16, stiffness: cfg?.stiffness ?? 170, mass: cfg?.mass ?? 0.7 } });

/** Rampa lineal suavizada entre dos frames. */
export const ramp = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [from, to], { ...clamp, easing: ease });

/** Fondo de marca: crema que pasa suavemente a azul, con una retícula de puntos muy tenue. */
export const brandBackground = (p: Palette): React.CSSProperties => ({
  backgroundColor: p.bg,
  backgroundImage: `radial-gradient(${p.border} 1.6px, transparent 1.7px), linear-gradient(172deg, ${p.bg} 0%, ${p.bg} 38%, ${p.bgBlue} 74%, ${p.bgBlueLight} 100%)`,
  backgroundSize: "36px 36px, 100% 100%",
});

/** Id único y válido dentro de url(#…) para filtros y recortes SVG (varias escenas conviven en el DOM). */
export const useSvgId = (name: string) => `${name}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

/** Sombra ligera de tarjeta (SVG). */
export const ShadowDef: React.FC<{ id: string; strength?: number }> = ({ id, strength = 1 }) => (
  <filter id={id} x="-30%" y="-30%" width="160%" height="170%">
    <feDropShadow dx={0} dy={10 * strength} stdDeviation={14 * strength} floodColor="#17171D" floodOpacity={0.13} />
  </filter>
);

// Zona útil del escenario: las ilustraciones viven en x 40–1040, y 80–700; encuadrar solo esa zona las agranda ~23 %
// dentro del rectángulo seguro (ninguna escena dibuja fuera de ella).
const VIEW = { x: 40, y: 80, w: 1000, h: 620 };

/**
 * Lienzo SVG del escenario escalado para caber en el rectángulo de contenido (w×h, ya dentro del área segura de
 * Instagram) y centrado en él. Recorta lo que salga de la zona útil.
 */
export const Canvas: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => {
  const scale = Math.max(0.01, Math.min(w / VIEW.w, h / VIEW.h));
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      width={VIEW.w * scale}
      height={VIEW.h * scale}
      style={{ position: "absolute", left: (w - VIEW.w * scale) / 2, top: (h - VIEW.h * scale) / 2, overflow: "hidden" }}
    >
      {children}
    </svg>
  );
};

/** Etiqueta tipo chip. */
export const Tag: React.FC<{ x: number; y: number; text: string; font: string; fill: string; color: string; size?: number; anchor?: "start" | "middle" | "end"; opacity?: number; stroke?: string }> = ({ x, y, text, font, fill, color, size = 26, anchor = "middle", opacity = 1, stroke }) => {
  const w = text.length * size * 0.62 + size * 1.2;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return (
    <g opacity={opacity}>
      <rect x={x0} y={y - size * 0.95} width={w} height={size * 1.6} rx={size * 0.8} fill={fill} stroke={stroke} strokeWidth={stroke ? 2 : 0} />
      <text x={x0 + w / 2} y={y + size * 0.12} textAnchor="middle" dominantBaseline="middle" fontFamily={font} fontWeight={800} fontSize={size} fill={color} letterSpacing="0.02em">
        {text}
      </text>
    </g>
  );
};

/** Tarjeta blanca con borde suave (y sombra si se pasa el id del filtro). */
export const Card: React.FC<{ x: number; y: number; w: number; h: number; p: Palette; r?: number; shadow?: string; fill?: string; stroke?: string; opacity?: number }> = ({ x, y, w, h, p, r = 22, shadow, fill, stroke, opacity = 1 }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={fill ?? p.card} stroke={stroke ?? p.border} strokeWidth={2} filter={shadow ? `url(#${shadow})` : undefined} opacity={opacity} />
);

/** Silueta frontal de teléfono genérico. */
export const PhoneFront: React.FC<{ x: number; y: number; w: number; h: number; body: string; screen: string; stroke: string; home?: boolean; shadow?: string }> = ({ x, y, w, h, body, screen, stroke, home, shadow }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={w * 0.16} fill={body} stroke={stroke} strokeWidth={2} filter={shadow ? `url(#${shadow})` : undefined} />
    <rect x={x + w * 0.07} y={y + h * (home ? 0.11 : 0.04)} width={w * 0.86} height={h * (home ? 0.74 : 0.92)} rx={w * (home ? 0.03 : 0.11)} fill={screen} />
    {home ? <circle cx={x + w / 2} cy={y + h * 0.92} r={w * 0.08} fill="none" stroke={stroke} strokeWidth={2} /> : null}
  </g>
);

export const Battery: React.FC<{ x: number; y: number; w: number; h: number; p: Palette; font: string }> = ({ x, y, w, h, p, font }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={12} fill={p.yellow} stroke={p.ink} strokeWidth={3} />
    <rect x={x + w * 0.12} y={y - 12} width={w * 0.22} height={14} rx={3} fill={p.ink} />
    <rect x={x + w * 0.66} y={y - 12} width={w * 0.22} height={14} rx={3} fill={p.ink} />
    <text x={x + w / 2} y={y + h * 0.42} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={w * 0.34} fill={p.ink}>+</text>
    <rect x={x + w * 0.18} y={y + h * 0.62} width={w * 0.64} height={h * 0.05} rx={3} fill={p.ink} opacity={0.35} />
    <rect x={x + w * 0.18} y={y + h * 0.72} width={w * 0.42} height={h * 0.05} rx={3} fill={p.ink} opacity={0.25} />
  </g>
);

export const ChargerBrick: React.FC<{ x: number; y: number; s: number; p: Palette; dashed?: boolean; fill?: string }> = ({ x, y, s, p, dashed, fill }) => (
  <g>
    <rect x={x} y={y} width={s} height={s} rx={s * 0.16} fill={dashed ? "none" : fill ?? p.card} stroke={dashed ? p.ink2 : p.ink} strokeWidth={dashed ? 3 : 2.5} strokeDasharray={dashed ? "10 8" : undefined} opacity={dashed ? 0.7 : 1} />
    {!dashed ? (
      <>
        <rect x={x + s * 0.28} y={y - s * 0.22} width={s * 0.1} height={s * 0.24} rx={3} fill={p.ink2} />
        <rect x={x + s * 0.62} y={y - s * 0.22} width={s * 0.1} height={s * 0.24} rx={3} fill={p.ink2} />
        <rect x={x + s * 0.4} y={y + s * 0.38} width={s * 0.2} height={s * 0.1} rx={4} fill={p.border} />
      </>
    ) : null}
  </g>
);

export const Earbuds: React.FC<{ x: number; y: number; s: number; p: Palette }> = ({ x, y, s, p }) => (
  <g>
    {[0, 0.75].map((dx) => (
      <g key={dx}>
        <path d={`M ${x + s * dx} ${y + s * 0.2} q ${s * 0.25} ${-s * 0.35} ${s * 0.5} 0 l 0 ${s * 0.7}`} stroke={p.ink} strokeWidth={s * 0.2} strokeLinecap="round" fill="none" />
        <path d={`M ${x + s * dx} ${y + s * 0.2} q ${s * 0.25} ${-s * 0.35} ${s * 0.5} 0 l 0 ${s * 0.7}`} stroke={p.card} strokeWidth={s * 0.12} strokeLinecap="round" fill="none" />
      </g>
    ))}
  </g>
);

/** Caja de producto abierta (vista frontal) con tapa elevada. */
export const OpenBox: React.FC<{ x: number; y: number; w: number; h: number; body: string; lid: string; stroke: string; lidLift: number; shadow?: string }> = ({ x, y, w, h, body, lid, stroke, lidLift, shadow }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill={body} stroke={stroke} strokeWidth={2} filter={shadow ? `url(#${shadow})` : undefined} />
    <rect x={x + 10} y={y - 22 - lidLift} width={w - 20} height={26} rx={9} fill={lid} stroke={stroke} strokeWidth={2} />
  </g>
);

export const Gem: React.FC<{ cx: number; cy: number; s: number; fill: string; light: string; stroke: string }> = ({ cx, cy, s, fill, light, stroke }) => (
  <g>
    <polygon points={`${cx - s},${cy - s * 0.35} ${cx - s * 0.55},${cy - s * 0.8} ${cx + s * 0.55},${cy - s * 0.8} ${cx + s},${cy - s * 0.35} ${cx},${cy + s * 0.85}`} fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />
    <polygon points={`${cx - s * 0.55},${cy - s * 0.8} ${cx - s * 0.2},${cy - s * 0.35} ${cx},${cy + s * 0.85} ${cx - s},${cy - s * 0.35}`} fill={light} opacity={0.55} />
    <polyline points={`${cx - s},${cy - s * 0.35} ${cx + s},${cy - s * 0.35}`} stroke={stroke} strokeWidth={2.5} opacity={0.7} />
  </g>
);

export const Cube: React.FC<{ x: number; y: number; s: number; p: Palette }> = ({ x, y, s, p }) => (
  <g>
    <rect x={x} y={y} width={s} height={s} rx={9} fill={p.card} stroke={p.ink2} strokeWidth={2.5} />
    <rect x={x + s * 0.2} y={y + s * 0.2} width={s * 0.6} height={s * 0.12} rx={3} fill={p.border} />
  </g>
);

export const Medal: React.FC<{ cx: number; cy: number; r: number; font: string; p: Palette; dim?: number }> = ({ cx, cy, r, font, p, dim = 1 }) => (
  <g opacity={dim}>
    <polygon points={`${cx - r * 0.75},${cy - r * 2.1} ${cx - r * 0.1},${cy - r * 0.6} ${cx - r * 0.55},${cy - r * 0.5} ${cx - r * 1.2},${cy - r * 1.9}`} fill={p.ink} />
    <polygon points={`${cx + r * 0.75},${cy - r * 2.1} ${cx + r * 0.1},${cy - r * 0.6} ${cx + r * 0.55},${cy - r * 0.5} ${cx + r * 1.2},${cy - r * 1.9}`} fill={p.ink2} />
    <circle cx={cx} cy={cy} r={r} fill={p.yellow} stroke={p.ink} strokeWidth={3} />
    <circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke={p.ink} strokeWidth={2} opacity={0.25} />
    <text x={cx} y={cy + r * 0.08} textAnchor="middle" dominantBaseline="middle" fontFamily={font} fontWeight={900} fontSize={r * 0.95} fill={p.ink}>1º</text>
  </g>
);

export const Person: React.FC<{ cx: number; base: number; s: number; fill: string }> = ({ cx, base, s, fill }) => (
  <g>
    <circle cx={cx} cy={base - s * 1.55} r={s * 0.34} fill={fill} />
    <path d={`M ${cx - s * 0.55} ${base} q 0 ${-s * 1.05} ${s * 0.55} ${-s * 1.05} q ${s * 0.55} 0 ${s * 0.55} ${s * 1.05} z`} fill={fill} />
  </g>
);

export const Hourglass: React.FC<{ cx: number; cy: number; s: number; frame: number; flipAt: number; fps: number; p: Palette }> = ({ cx, cy, s, frame, flipAt, fps, p }) => {
  const flip = sp(frame, fps, flipAt, { damping: 13, stiffness: 120 });
  const flow = interpolate(frame, [flipAt + 8, flipAt + 70], [0, 1], clamp);
  const top = (1 - flow) * 0.9;
  return (
    <g transform={`rotate(${180 * flip} ${cx} ${cy})`}>
      <rect x={cx - s * 0.62} y={cy - s * 1.06} width={s * 1.24} height={s * 0.12} rx={6} fill={p.ink} />
      <rect x={cx - s * 0.62} y={cy + s * 0.94} width={s * 1.24} height={s * 0.12} rx={6} fill={p.ink} />
      <path d={`M ${cx - s * 0.5} ${cy - s * 0.94} L ${cx + s * 0.5} ${cy - s * 0.94} L ${cx + s * 0.06} ${cy} L ${cx + s * 0.5} ${cy + s * 0.94} L ${cx - s * 0.5} ${cy + s * 0.94} L ${cx - s * 0.06} ${cy} Z`} fill={p.card} stroke={p.ink} strokeWidth={4} />
      {/* arena: tras girar, la mitad superior (abajo antes del giro) se vacía hacia la otra */}
      <path d={`M ${cx - s * 0.44 * top} ${cy + s * 0.92 - s * 0.86 * top} L ${cx + s * 0.44 * top} ${cy + s * 0.92 - s * 0.86 * top} L ${cx + s * 0.44} ${cy + s * 0.92} L ${cx - s * 0.44} ${cy + s * 0.92} Z`} fill={p.yellow} />
      <path d={`M ${cx - s * 0.4 * flow} ${cy - s * 0.92 + s * 0.8 * (1 - flow)} L ${cx + s * 0.4 * flow} ${cy - s * 0.92 + s * 0.8 * (1 - flow)} L ${cx + s * 0.4} ${cy - s * 0.92} L ${cx - s * 0.4} ${cy - s * 0.92} Z`} fill={p.yellow} />
    </g>
  );
};
