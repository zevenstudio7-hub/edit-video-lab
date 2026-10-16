import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { FONT, P } from "../video002/ui";
import { EASE, SPRING, anguloAurora } from "../../../formatos/motion-ux/snippets/primitivas";

// Kit Soft UI de VIDEO-005 (Motion UX, superficie `soft`, perfil ZevenPRO: formatos/motion-ux/perfil.json).
// Valores de formatos/motion-ux/tokens.json: tarjeta radio 48 con degradado blanco → #F4F5F7, sombra larga y difusa,
// luz interior; azul ui solo para lo digital, amarillo de resalte, verde solo para «listo» (guion: checks en verde).
// Los iconos de Gmail, Drive y Sheets se RECREAN en SVG por decisión del usuario (2026-10-13); son marcas de Google:
// derechos `requiere_revision` (video-orders/VIDEO-005.json → cambios). PDF, carpeta, repositorio, etc. son genéricos.

export { FONT, P };
export const SERIF = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
export const UI = { ui: "#0057FF", ui600: "#0046CC", ui300: "#6E9BFF", ui100: "#EAF1FF", ok: "#1E9E5A", okSoft: "#E3F5EA" } as const;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Progreso 0→1 (salida-expo por defecto). */
export const pr = (f: number, a: number, dur = 10, easing = EASE.salidaExpo) => interpolate(f, [a, a + Math.max(1, dur)], [0, 1], { ...clamp, easing });
/** Entrada 8–12 f (guion §3.3) y salida 6–8 f. */
export const vis = (f: number, at: number, exit?: number, dur = 10, exitDur = 7) => pr(f, at, dur) * (exit === undefined ? 1 : 1 - pr(f, exit, exitDur, Easing.in(Easing.cubic)));
export const pop = (f: number, at: number, fps = 30) => (f < at ? 0 : spring({ frame: f - at, fps, config: SPRING.pop }));
/** Estilo de entrada con desenfoque (entrada-desenfoque de Motion UX) + salida. */
export const entra = (f: number, at: number, exit?: number, dy = 26): React.CSSProperties => {
  const t = vis(f, at, exit);
  return { opacity: t, filter: t < 1 ? `blur(${(1 - t) * 12}px)` : undefined, transform: `translateY(${(1 - t) * dy}px) scale(${0.96 + 0.04 * t})` };
};

export const SOMBRA = "0 60px 110px -40px rgba(20,30,60,.28), 0 4px 14px rgba(20,30,60,.07)";
export const RELIEVE = "inset 0 2px 0 #FFF, inset 0 -2px 0 rgba(0,0,0,.04)";

/** Fondo soft (claro, nunca gris puro) con retícula de puntos muy suave. */
export const FondoSoft: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(rgba(23,23,29,0.07) 1.6px, transparent 1.7px) 0 0 / 36px 36px, linear-gradient(180deg, #FBFCFD 0%, hsl(220,14%,95%) 55%, ${UI.ui100} 100%)` }} />
);

export const Tarjeta: React.FC<{ x: number; y: number; w: number; h?: number; r?: number; activa?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, r = 48, activa = 0, style, children }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, fontFamily: FONT, color: P.ink,
      background: "linear-gradient(180deg, #FFFFFF, #F4F5F7)",
      boxShadow: `${SOMBRA}, ${RELIEVE}${activa > 0 ? `, 0 0 0 ${5 * activa}px ${UI.ui300}, 0 30px 80px -30px rgba(0,87,255,${0.5 * activa})` : ""}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pildora: React.FC<{ children: React.ReactNode; tono?: "ui" | "suave" | "resalte" | "ok" | "ink"; size?: number; style?: React.CSSProperties }> = ({ children, tono = "suave", size = 30, style }) => {
  const t = { ui: [UI.ui, "#FFF"], suave: ["#FFFFFF", P.ink], resalte: [P.yellow, P.ink], ok: [UI.ok, "#FFF"], ink: [P.ink, "#FFF"] }[tono];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.35, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", padding: `${size * 0.42}px ${size * 0.7}px`, borderRadius: 999, background: t[0], color: t[1], border: tono === "suave" ? `2px solid ${P.border}` : "none", boxShadow: tono === "suave" ? `0 10px 24px -8px rgba(20,30,60,.18), ${RELIEVE}` : `0 14px 30px -10px ${t[0]}`, ...style }}>
      {children}
    </div>
  );
};

/** Check en círculo; `t` 0→1 lo rellena de verde. */
export const Check: React.FC<{ t: number; size?: number }> = ({ t, size = 44 }) => (
  <div style={{ width: size, height: size, borderRadius: 999, flex: "none", display: "grid", placeItems: "center", background: t > 0.5 ? UI.ok : "#EFF1F4", border: `2px solid ${t > 0.5 ? UI.ok : P.border}`, transform: `scale(${t > 0 && t < 1 ? 1 + 0.15 * Math.sin(Math.PI * t) : 1})` }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke={t > 0.5 ? "#FFF" : "#C7CBD3"} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={26} strokeDashoffset={26 * (1 - Math.min(1, t * 1.4))} /></svg>
  </div>
);

/** Etiqueta «SIMULACIÓN» (guion §3.6): esquina superior derecha, dentro del área segura. */
export const Simulacion: React.FC<{ t: number }> = ({ t }) =>
  t <= 0 ? null : (
    <div style={{ position: "absolute", right: 1080 - 1010, top: 262, opacity: t, fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: "0.14em", color: P.ink, background: P.yellowSoft, border: `2px solid ${P.yellow}`, borderRadius: 999, padding: "8px 18px" }}>SIMULACIÓN</div>
  );

/**
 * Titular de escena (S4 sobre superficie soft → rótulo `titular-ui` de Motion UX): etiqueta superior «01 | …» y
 * titular sans 800 con la palabra clave en azul ui. Va arriba (y ≈ 300) para no competir con la lectura (y = 1438).
 */
export const Titular: React.FC<{ f: number; at: number; exit?: number; etiqueta?: string; partes: (React.ReactNode | { clave: string })[]; size?: number }> = ({ f, at, exit, etiqueta, partes, size = 92 }) => {
  const t = vis(f, at, exit, 10, 6);
  if (t <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 292, opacity: t, filter: t < 1 ? `blur(${(1 - t) * 12}px)` : undefined, transform: `translateY(${(1 - t) * 18}px)`, fontFamily: FONT }}>
      {etiqueta ? (
        <div style={{ fontSize: 32, fontWeight: 700, color: P.ink2, letterSpacing: "0.02em", marginBottom: 14, transform: `scale(${0.85 + 0.15 * pop(f, at + 4)})`, transformOrigin: "left center" }}>{etiqueta}</div>
      ) : null}
      <div style={{ fontSize: size, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.045em", color: P.ink }}>
        {partes.map((p, i) => (p && typeof p === "object" && "clave" in p ? <span key={i} style={{ color: UI.ui }}>{p.clave}</span> : <span key={i}>{p as React.ReactNode}</span>))}
      </div>
    </div>
  );
};

/** Cursor (flecha negra con borde blanco). */
export const Cursor: React.FC<{ x: number; y: number; t?: number; pulsado?: boolean }> = ({ x, y, t = 1, pulsado }) =>
  t <= 0 ? null : (
    <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, opacity: t, transform: `scale(${pulsado ? 0.86 : 1})`, transformOrigin: "10% 10%", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.3))" }}>
      <path d="M3 2l15 11-6.5 1.2L15 21l-3 1.4-3.6-6.9L3 19z" fill={P.ink} stroke="#FFF" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );

/** Borde aurora (marca «IA»): anillo con degradado cónico que gira 3°/frame. */
export const Aurora: React.FC<{ f: number; size: number; grosor?: number; children?: React.ReactNode; glow?: number }> = ({ f, size, grosor = 7, children, glow = 0.6 }) => (
  <div style={{ width: size, height: size, borderRadius: 999, padding: grosor, background: `conic-gradient(from ${anguloAurora(f)}deg, ${UI.ui}, #ff5db1, #ffb340, #5fe08a, ${UI.ui300}, ${UI.ui})`, boxShadow: `0 0 ${60 * glow}px ${18 * glow}px rgba(0,87,255,${0.28 * glow})` }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 999, background: "linear-gradient(180deg,#FFFFFF,#F2F5FB)", display: "grid", placeItems: "center", boxShadow: RELIEVE }}>{children}</div>
  </div>
);

// ---------- iconos ----------
/** Contenedor de icono de app (cuadrado blanco suave). */
export const App: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 140, children, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "linear-gradient(180deg,#FFFFFF,#F3F4F7)", boxShadow: `0 24px 50px -18px rgba(20,30,60,.30), ${RELIEVE}`, display: "grid", placeItems: "center", ...style }}>{children}</div>
);

/** Gmail recreado (sobre con «M» en cuatro colores). */
export const Gmail: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 48 36">
    <path d="M3.3 36h7.7V17.3L0 9v23.7C0 34.5 1.5 36 3.3 36z" fill="#4285F4" />
    <path d="M37 36h7.7c1.8 0 3.3-1.5 3.3-3.3V9l-11 8.3z" fill="#34A853" />
    <path d="M37 3v14.3L48 9V4.6c0-4.1-4.7-6.4-7.9-4z" fill="#FBBC04" />
    <path d="M11 17.3V3l13 9.8L37 3v14.3l-13 9.8z" fill="#EA4335" />
    <path d="M0 4.6V9l11 8.3V3L7.9.6C4.7-1.8 0 .5 0 4.6z" fill="#C5221F" />
  </svg>
);

/** Drive recreado (triángulo en tres franjas). */
export const Drive: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size * 0.88} viewBox="0 0 88 77">
    <path d="M29 1h30l29 50H58z" fill="#FFBA00" />
    <path d="M29 1l15 26L15 76 0 51z" fill="#00AC47" />
    <path d="M15 76l14.5-25H88L73.5 76z" fill="#2684FC" />
  </svg>
);

/** Sheets recreado (hoja verde con esquina doblada y tabla blanca). */
export const Sheets: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size * 0.74} height={size} viewBox="0 0 37 50">
    <path d="M4 0h21l12 12v34a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#0F9D58" />
    <path d="M25 0l12 12H29a4 4 0 0 1-4-4z" fill="#87CEAC" />
    <path d="M8 22h21v17H8z" fill="#FFF" />
    <path d="M8 27.5h21M8 33h21M17 22v17" stroke="#0F9D58" strokeWidth={2} />
  </svg>
);

/** Documento PDF genérico. */
export const Pdf: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 40 50">
    <path d="M4 0h22l14 14v32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#FFF" stroke="#D9DCE3" strokeWidth={2} />
    <path d="M26 0l14 14H30a4 4 0 0 1-4-4z" fill="#E4E7EC" />
    <rect x={4} y={28} width={26} height={13} rx={3} fill={P.red} />
    <text x={17} y={38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={9.5} fill="#FFF">PDF</text>
  </svg>
);

/** Carpeta genérica. */
export const Carpeta: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = UI.ui }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 50 40">
    <path d="M0 6a4 4 0 0 1 4-4h13l5 5h24a4 4 0 0 1 4 4v25a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z" fill={color} opacity={0.9} />
    <path d="M0 13h50v23a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z" fill={color} />
  </svg>
);

/** Repositorio genérico (libro con rama), sin logos de terceros. */
export const Repo: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = P.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5v-16z" />
    <path d="M5 20.5A2.5 2.5 0 0 0 7.5 23H20v-5" />
    <path d="M9 7h7M9 11h5" />
  </svg>
);

/** Borrador (documento con lápiz). */
export const Borrador: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x={6} y={4} width={30} height={40} rx={5} fill="#FFF" stroke="#D9DCE3" strokeWidth={2} />
    <path d="M12 14h18M12 21h18M12 28h10" stroke="#C7CBD3" strokeWidth={2.5} strokeLinecap="round" />
    <path d="M30 40l2-7 11-11 5 5-11 11z" fill={P.yellow} stroke={P.ink} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

/** Nodo «IA» con borde aurora. */
export const NodoIA: React.FC<{ f: number; size?: number; glow?: number }> = ({ f, size = 220, glow }) => (
  <Aurora f={f} size={size} glow={glow}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size * 0.3, letterSpacing: "-0.04em", color: UI.ui }}>IA</div>
  </Aurora>
);

/** Conector SVG entre dos puntos con trazo progresivo y pulso que viaja. */
export const Conector: React.FC<{ a: [number, number]; b: [number, number]; p: number; color?: string; w?: number; pulso?: number; curva?: number }> = ({ a, b, p, color = UI.ui300, w = 6, pulso, curva = 0 }) => {
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2 + curva, my = (a[1] + b[1]) / 2 - Math.abs(curva) * 0.2;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.15 + Math.abs(curva);
  const q = (t: number) => ({ x: (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mx + t * t * b[0], y: (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * my + t * t * b[1] });
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - Math.min(1, p))} />
      {pulso !== undefined && pulso > 0 && pulso < 1 ? <circle cx={q(pulso).x} cy={q(pulso).y} r={w * 1.6} fill={P.yellow} stroke="#FFF" strokeWidth={3} /> : null}
    </g>
  );
};

export { EASE, interpolate };
