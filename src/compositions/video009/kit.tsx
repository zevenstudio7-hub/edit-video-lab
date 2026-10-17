/**
 * VIDEO-009 · kit visual del showreel (#edit-5-creator 5A): tipografías, paleta del perfil Motion UX, palabras con tiempos
 * y los estilos de subtítulos S1–S9 como capas pequeñas. Tiempos en frames de la composición (25 fps).
 * Las medidas son puntos de partida de formatos/subtitulos/SUBTITULOS.md; nada de esto está aprobado todavía.
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadScript } from "@remotion/google-fonts/PinyonScript";
import rawWords from "./words.json";
import timelineJson from "../../../analysis/video-009-timeline.json";

export const INTER = loadInterTight("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const ANTON = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const SERIF = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
loadSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });
export const SCRIPT = loadScript("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

// paleta del perfil Motion UX (formatos/motion-ux/perfil.json)
export const C = { ui: "#0057FF", gold: "#F5C518", red: "#E1062C", ink: "#17171D", cream: "#F4EFC8", pink: "#f4c0ca", soft: "#F4F1EA" };

export const TL = timelineJson as { fps: number; total_f: number; timeline: Array<{ id: string; from_f: number; to_f: number; dur_f: number; src: string }> };
export const tk = (id: string) => {
  const t = TL.timeline.find((x) => x.id === id);
  if (!t) throw new Error(`corte ${id} no está en analysis/video-009-timeline.json`);
  return t;
};

export type W = { take: string; beat: number; text: string; from: number; to: number };
export const ALL_WORDS = (rawWords as Array<W & { marker?: string }>).filter((w) => !w.marker && w.text) as W[];
export const takeWords = (id: string): W[] => ALL_WORDS.filter((w) => w.take === id);
/** Palabras de una toma sin puntuación final, para comparar claves. */
export const clean = (s: string) => s.toLowerCase().replace(/[.,:;¿?¡!]/g, "");

export const shadow = (a = 0.5) => `0 4px 20px rgba(0,0,0,${a})`;

/** Entrada con muelle: 0→1 desde `at`. */
export const useIn = (at: number, damping = 14, stiffness = 140) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness, mass: 0.7 } });
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

// ───────────────────────── S1 · lectura + énfasis ─────────────────────────
export type Block = { w0: number; w1: number; emph?: boolean; tone?: "white" | "pink" | "gold" };
/** Bloques de una toma por índices de palabra [w0,w1]; cada bloque dura hasta el inicio del siguiente. */
const blockWindow = (ws: W[], blocks: Block[], i: number, takeEnd: number) => {
  const b = blocks[i];
  const start = ws[b.w0].from;
  const end = i + 1 < blocks.length ? ws[blocks[i + 1].w0].from : takeEnd;
  return { start, end, text: ws.slice(b.w0, b.w1 + 1).map((w) => w.text).join(" ") };
};
export const activeBlock = (take: string, blocks: Block[], absF: number, takeEnd: number) => {
  const ws = takeWords(take);
  for (let i = 0; i < blocks.length; i++) {
    const { start, end, text } = blockWindow(ws, blocks, i, takeEnd);
    if (absF >= start && absF < end) return { block: blocks[i], text, start, end };
  }
  return null;
};

export const S1Layer: React.FC<{ take: string; blocks: Block[]; takeEnd: number; offset: number; y?: number }> = ({ take, blocks, takeEnd, offset, y = 1438 }) => {
  const f = useCurrentFrame() + offset;
  const a = activeBlock(take, blocks, f, takeEnd);
  if (!a) return null;
  const local = f - a.start;
  if (!a.block.emph) {
    const op = interpolate(local, [0, 4], [0, 1], { extrapolateRight: "clamp" });
    return (
      <div style={{ position: "absolute", left: 65, right: 140, top: y - 50, height: 100, display: "flex", justifyContent: "center", alignItems: "center", opacity: op }}>
        <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 66, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textAlign: "center", textShadow: "0 2px 3px rgba(0,0,0,.55), 0 6px 22px rgba(0,0,0,.5)" }}>{a.text}</span>
      </div>
    );
  }
  // énfasis: líneas de 1–2 palabras que suben 34 px con muelle, escalonadas 3 f; apoyado por su base en y = 1480
  const lines = a.text.split(" ").reduce<string[]>((acc, w, i) => { if (i % 2 === 0) acc.push(w); else acc[acc.length - 1] += " " + w; return acc; }, []);
  const sizes = [160, 128, 96];
  return (
    <div style={{ position: "absolute", left: 65, width: 875, bottom: 1920 - 1480, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {lines.map((ln, i) => {
        const t = interpolate(local - i * 3, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const color = a.block.tone === "gold" ? C.gold : a.block.tone === "pink" || i % 2 === 1 ? C.pink : "#fff";
        return (
          <div key={i} style={{ fontFamily: INTER, fontWeight: 900, fontSize: sizes[Math.min(i, 2)], lineHeight: 0.9, letterSpacing: "-0.045em", color, opacity: t, transform: `translateY(${(1 - t) * 34}px)`, filter: "drop-shadow(0 6px 16px rgba(0,0,0,.45))", paddingLeft: i * 38 }}>
            {ln}
          </div>
        );
      })}
    </div>
  );
};

// ───────────────────────── S2 · palabra a palabra ─────────────────────────
export const S2Layer: React.FC<{ takes: string[]; offset: number; keys?: string[]; y?: number; size?: number }> = ({ takes, offset, keys = [], y = 1440, size = 84 }) => {
  const f = useCurrentFrame() + offset;
  const ws = takes.flatMap(takeWords);
  const cur = ws.find((w, i) => f >= w.from && f < Math.max(w.to, ws[i + 1]?.from ?? w.to));
  if (!cur) return null;
  const isKey = keys.includes(clean(cur.text));
  const pop = interpolate(f - cur.from, [0, 4], [0.86, 1], { extrapolateRight: "clamp", easing: ease });
  return (
    <div style={{ position: "absolute", left: 65, right: 140, top: y - 60, height: 120, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: size, letterSpacing: "-0.02em", color: isKey ? C.gold : "#fff", textShadow: shadow(0.5), transform: `scale(${pop})` }}>{cur.text}</span>
    </div>
  );
};

// ───────────────────────── S5 · cursiva editorial ─────────────────────────
export const S5Layer: React.FC<{ take: string; offset: number; keyWord: string; top?: number; left?: number; width?: number; align?: "left" | "center"; keySize?: number }> = ({ take, offset, keyWord, top = 300, left = 90, width = 850, align = "left", keySize = 210 }) => {
  const f = useCurrentFrame() + offset;
  const ws = takeWords(take).filter((w) => f >= w.from);
  return (
    <div style={{ position: "absolute", top, left, width, display: "flex", flexWrap: "wrap", gap: "0 26px", alignItems: "baseline", justifyContent: align === "center" ? "center" : "flex-start" }}>
      {ws.map((w, i) => {
        const key = clean(w.text) === keyWord;
        const t = interpolate(f - w.from, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: ease });
        return (
          <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: key ? keySize : 74, lineHeight: key ? 0.95 : 1.2, color: "#fff", opacity: t, filter: `blur(${(1 - t) * 14}px)`, transform: `translateY(${key ? (1 - t) * 60 : 0}px)`, textShadow: "0 4px 24px rgba(0,0,0,.35)", backgroundImage: key ? "linear-gradient(180deg,#FFFFFF,#C9CDD3)" : undefined, WebkitBackgroundClip: key ? "text" : undefined, WebkitTextFillColor: key ? "transparent" : undefined, flexBasis: key ? "100%" : undefined }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ───────────────────────── S6 · discreto con píldora ─────────────────────────
export const S6Layer: React.FC<{ take: string; blocks: Block[]; takeEnd: number; offset: number; pill: string; y?: number }> = ({ take, blocks, takeEnd, offset, pill, y = 1420 }) => {
  const f = useCurrentFrame() + offset;
  const a = activeBlock(take, blocks, f, takeEnd);
  if (!a) return null;
  const pop = interpolate(f - a.start, [0, 6], [0.7, 1], { extrapolateRight: "clamp", easing: ease });
  const parts = a.text.split(" ");
  return (
    <div style={{ position: "absolute", left: 65, right: 140, top: y - 40, height: 80, display: "flex", justifyContent: "center", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
      {parts.map((p, i) => {
        const hit = pill.split(" ").includes(clean(p));
        return hit ? (
          <span key={i} style={{ fontFamily: INTER, fontWeight: 700, fontSize: 46, color: C.ink, background: "#fff", borderRadius: 12, padding: "0 14px", transform: `scale(${pop})` }}>{p}</span>
        ) : (
          <span key={i} style={{ fontFamily: INTER, fontWeight: 700, fontSize: 46, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{p}</span>
        );
      })}
    </div>
  );
};

// ───────────────────────── S8 · flotante hacia el sujeto ─────────────────────────
export const S8Layer: React.FC<{ take: string; offset: number; x: number; y: number; width: number; align: "left" | "right"; keys?: string[]; size?: number }> = ({ take, offset, x, y, width, align, keys = [], size = 54 }) => {
  const f = useCurrentFrame() + offset;
  const ws = takeWords(take).filter((w) => f >= w.from);
  return (
    <div style={{ position: "absolute", left: x, top: y, width, textAlign: align, fontFamily: INTER, fontWeight: 300, fontSize: size, lineHeight: 1.18, color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.45)" }}>
      {ws.map((w, i) => {
        const t = interpolate(f - w.from, [0, 3], [0, 1], { extrapolateRight: "clamp" });
        const key = keys.includes(clean(w.text));
        return <span key={i} style={{ opacity: t, fontWeight: key ? 700 : 300 }}>{i === 0 ? w.text : ` ${w.text}`}</span>;
      })}
    </div>
  );
};

// ───────────────────────── S9 · serif editorial ─────────────────────────
export const S9Layer: React.FC<{ take: string; offset: number; keys: string[]; top?: number; size?: number }> = ({ take, offset, keys, top = 230, size = 124 }) => {
  const f = useCurrentFrame() + offset;
  const ws = takeWords(take).filter((w) => f >= w.from);
  return (
    <div style={{ position: "absolute", top, left: 70, width: 870, fontFamily: SERIF, fontSize: size, lineHeight: 0.8, color: C.cream, textShadow: "0 4px 24px rgba(0,0,0,.25)", letterSpacing: "-0.02em" }}>
      {ws.map((w, i) => {
        const t = interpolate(f - w.from, [0, 3], [0, 1], { extrapolateRight: "clamp" });
        const key = keys.includes(clean(w.text));
        return <span key={i} style={{ opacity: t, fontStyle: key ? "italic" : "normal" }}>{i === 0 ? "" : " "}{w.text}</span>;
      })}
    </div>
  );
};

// ───────────────────────── piezas comunes ─────────────────────────
export const Chip: React.FC<{ children: React.ReactNode; at: number; x: number; y: number; tone?: "gold" | "ui" | "dark" | "white"; rot?: number; size?: number }> = ({ children, at, x, y, tone = "white", rot = 0, size = 30 }) => {
  const t = useIn(at, 12, 170);
  const bg = tone === "gold" ? C.gold : tone === "ui" ? C.ui : tone === "dark" ? "rgba(23,23,29,.88)" : "#fff";
  const fg = tone === "ui" || tone === "dark" ? "#fff" : C.ink;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${t}) rotate(${rot}deg)`, background: bg, color: fg, fontFamily: INTER, fontWeight: 800, fontSize: size, letterSpacing: "-0.01em", padding: "12px 24px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,.28)", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

export const Giant: React.FC<{ lines: string[]; size?: number; top: number; color?: string; at?: number; opacity?: number; align?: "center" | "left" }> = ({ lines, size = 300, top, color = "#fff", at = 0, opacity = 1, align = "center" }) => {
  const t = useIn(at, 16, 120);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: align, paddingLeft: align === "left" ? 60 : 0, fontFamily: ANTON, fontSize: size, lineHeight: 0.92, color, textTransform: "uppercase", opacity: opacity * Math.min(1, t * 1.4), transform: `scale(${0.88 + 0.12 * t})`, textShadow: "0 10px 40px rgba(0,0,0,.35)", letterSpacing: "-0.01em" }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
};

/** Destello blanco de corte (flash) con rebote de escala en el contenido que entra. */
export const Flash: React.FC<{ frames?: number }> = ({ frames = 6 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 1, frames], [0.0, 0.85, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none", zIndex: 90 }} />;
};

export const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: "rgba(255,255,255,.14)", border: "1.5px solid rgba(255,255,255,.35)", backdropFilter: "blur(14px)", borderRadius: 40, boxShadow: "0 24px 70px rgba(0,0,0,.35)", ...style }}>{children}</div>
);

export const BottomShade: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

// ───────── iconos propios (SVG) y cursor: sin glifos de emoji de terceros ─────────
const ico = (children: React.ReactNode, color: string) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
export const Icon: React.FC<{ name: "camera" | "wave" | "scissors" | "captions" | "clapper"; color?: string }> = ({ name, color = "currentColor" }) => {
  switch (name) {
    case "camera": return ico(<><rect x="2" y="6" width="14" height="12" rx="3" /><path d="M16 10l6-3v10l-6-3z" /></>, color);
    case "wave": return ico(<><path d="M3 12h2M7 7v10M11 3v18M15 8v8M19 10v4M22 12h-1" /></>, color);
    case "scissors": return ico(<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 7.5L21 19M8.5 16.5L21 5" /></>, color);
    case "captions": return ico(<><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 11h5M13 11h5M6 15h3M12 15h6" /></>, color);
    default: return ico(<><path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1z" /><path d="M3 9l2-5 4 1-2 4M9 9l2-5 4 1-2 4M15 9l2-5 4 1-1 4" /></>, color);
  }
};
export const Cursor: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,.5))" }}>
    <path d="M5 3l14 8-6 2 4 7-3 1.5-4-7-5 4z" fill="#fff" stroke="#17171D" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);
