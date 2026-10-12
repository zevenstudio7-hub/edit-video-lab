import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/InterTight";
import { zevenproPalette } from "../../../library/brand/zevenpro";

// Kit de interfaz de VIDEO-002 (#edit-1-motion) con la identidad video-zeven (formatos/identidad-video-zeven.md):
// fondo crema → azul, tarjetas blancas flotantes con borde suave y sombra ligera, amarillo para lo activo y lo
// destacado, azul solo para lo digital (conexiones), rojo solo para alertas. Tipografía Inter Tight.
// Todo se anima por frame (orden §4): entrada 10 f (opacidad, desplazamiento corto, escala 0,96→1), salida 7 f,
// pulsación 1→0,97→1 en 6 f, énfasis 1→1,06→1 en 9 f. Las interfaces son conceptuales: no imitan la de Muse.

export const { fontFamily: FONT } = loadFont("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
export const P = zevenproPalette;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.2, 1);

/** Progreso 0→1 de una entrada que empieza en `at` (10 frames por defecto). */
export const inT = (f: number, at: number | undefined, dur = 10) => (at === undefined ? 0 : interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: easeOut }));
/** Progreso 1→0 de una salida que empieza en `at` (7 frames por defecto). */
export const outT = (f: number, at: number | undefined, dur = 7) => (at === undefined ? 1 : interpolate(f, [at, at + dur], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) }));
/** Rampa suavizada entre dos frames. */
export const ramp = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, Math.max(a + 1, b)], [from, to], { ...clamp, easing: easeInOut });
/** Pulsación de un botón: 1 → 0,97 → 1 en 6 frames. */
export const press = (f: number, at: number | undefined) => (at === undefined || f < at || f > at + 6 ? 1 : interpolate(f, [at, at + 3, at + 6], [1, 0.97, 1]));
/** Énfasis: 1 → 1,06 → 1 en 9 frames. */
export const pulse = (f: number, at: number | undefined, peak = 1.06) => (at === undefined || f < at || f > at + 9 ? 1 : interpolate(f, [at, at + 4, at + 9], [1, peak, 1]));
/** Estilo de entrada (y salida opcional) de una tarjeta. */
export const enterStyle = (f: number, at: number | undefined, opts: { exit?: number; dy?: number; dx?: number; dur?: number } = {}): React.CSSProperties => {
  const t = inT(f, at, opts.dur ?? 10) * outT(f, opts.exit);
  return { opacity: t, transform: `translate(${(1 - t) * (opts.dx ?? 0)}px, ${(1 - t) * (opts.dy ?? 26)}px) scale(${0.96 + 0.04 * t})` };
};
/** Flotación suave de las tarjetas (profundidad), en px. */
export const bob = (f: number, phase = 0, amp = 3) => Math.sin((f / 30) * Math.PI * 0.5 + phase) * amp;

/** Cámara interna de una escena: claves [frame, escala, focoX, focoY] (foco en px del lienzo 1080×1920). */
export const camera = (f: number, keys: [number, number, number, number][]): React.CSSProperties => {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  let s = ks[0][1], x = ks[0][2], y = ks[0][3];
  for (let i = 1; i < ks.length; i++) {
    const [f0, s0, x0, y0] = ks[i - 1], [f1, s1, x1, y1] = ks[i];
    if (f >= f1) { s = s1; x = x1; y = y1; continue; }
    if (f > f0) { const t = ramp(f, f0, f1); s = s0 + (s1 - s0) * t; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; }
    break;
  }
  // el foco (x, y) queda en el centro del área de contenido (540, 690) y se escala alrededor de él
  return { position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${540 - x * s}px, ${690 - y * s}px) scale(${s})` };
};

export const shadow = "0 22px 48px rgba(23,23,29,0.10), 0 6px 14px rgba(23,23,29,0.06)";
export const brandBg: React.CSSProperties = {
  backgroundColor: P.bg,
  backgroundImage: `radial-gradient(${P.border} 1.6px, transparent 1.7px), linear-gradient(172deg, ${P.bg} 0%, ${P.bg} 36%, ${P.bgBlue} 72%, ${P.bgBlueLight} 100%)`,
  backgroundSize: "36px 36px, 100% 100%",
};

export const Card: React.FC<{ x: number; y: number; w: number; h: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode; active?: boolean }> = ({ x, y, w, h, r = 28, style, children, active }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: P.card, border: `2px solid ${active ? P.yellow : P.border}`, boxShadow: active ? `${shadow}, 0 0 0 6px ${P.yellowSoft}` : shadow, overflow: "hidden", fontFamily: FONT, color: P.ink, ...style }}>
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; size?: number; weight?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 30, weight = 800, color = P.ink, style }) => (
  <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight: 1.1, letterSpacing: "-0.01em", ...style }}>{children}</div>
);

/** Etiqueta discreta para interfaces conceptuales (orden §7). */
export const Ilustrativo: React.FC<{ x: number; y: number; opacity?: number; size?: number }> = ({ x, y, opacity = 1, size = 22 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, fontFamily: FONT, fontSize: size, fontWeight: 700, color: P.ink2, background: "rgba(255,255,255,0.85)", border: `1.5px solid ${P.border}`, borderRadius: 999, padding: "6px 16px", letterSpacing: "0.02em" }}>Ejemplo ilustrativo</div>
);

/** Píldora de estado: «Pendiente» → «Preparada». */
export const Status: React.FC<{ done: number; labels?: [string, string]; size?: number }> = ({ done, labels = ["Pendiente", "Preparada"], size = 22 }) => (
  <div style={{ position: "relative", height: size * 1.9, minWidth: size * 6.2 }}>
    {[0, 1].map((i) => (
      <div key={i} style={{ position: "absolute", inset: 0, opacity: i ? done : 1 - done, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 999, fontFamily: FONT, fontWeight: 800, fontSize: size, background: i ? P.yellowSoft : "#EFEDE7", color: i ? P.ink : P.ink2, border: `1.5px solid ${i ? P.yellow : P.border}` }}>
        {i ? <Check size={size * 0.9} /> : null}
        {labels[i]}
      </div>
    ))}
  </div>
);

export const Check: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = P.ink }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** Casilla que se marca con progreso `t` (0–1). */
export const Checkbox: React.FC<{ t: number; size?: number }> = ({ t, size = 40 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, border: `3px solid ${t > 0.5 ? P.yellow : P.ink2}`, background: t > 0.5 ? P.yellow : P.card, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.12 * Math.sin(Math.PI * t)})` }}>
    <div style={{ opacity: t, transform: `scale(${0.6 + 0.4 * t})` }}><Check size={size * 0.72} /></div>
  </div>
);

/** Logo oficial (public/video-002/logos). Los glifos monocromos se tiñen con el color de la marca. */
export type Brand = "facebook" | "instagram" | "tiktok" | "meta" | "shopify" | "canva" | "notion";
const BRAND_COLOR: Record<Exclude<Brand, "canva">, string> = { facebook: "#0866FF", instagram: "#FFFFFF", tiktok: "#FFFFFF", meta: "#0467DF", shopify: "#7AB55C", notion: "#000000" };
export const BRAND_NAME: Record<Brand, string> = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", meta: "Meta", shopify: "Shopify", canva: "Canva", notion: "Notion" };
export const Logo: React.FC<{ brand: Brand; size: number }> = ({ brand, size }) => {
  const src = staticFile(`video-002/logos/${brand}.svg`);
  if (brand === "canva") return <Img src={src} style={{ width: size * 1.6, height: size * 0.6, objectFit: "contain" }} />;
  const glyph = (s: number, color: string) => (
    <div style={{ width: s, height: s, backgroundColor: color, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} />
  );
  // Instagram y TikTok: glifo blanco sobre su icono de aplicación oficial (degradado / negro)
  if (brand === "instagram")
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.26, background: "radial-gradient(circle at 30% 107%, #FDF497 0%, #FDF497 5%, #FD5949 45%, #D6249F 60%, #285AEB 90%)", display: "flex", alignItems: "center", justifyContent: "center" }}>{glyph(size * 0.62, BRAND_COLOR.instagram)}</div>
    );
  if (brand === "tiktok")
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.26, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", transform: `translate(${-size * 0.025}px, ${-size * 0.02}px)` }}>{glyph(size * 0.58, "#25F4EE")}</div>
        <div style={{ position: "absolute", transform: `translate(${size * 0.025}px, ${size * 0.02}px)` }}>{glyph(size * 0.58, "#FE2C55")}</div>
        <div style={{ position: "absolute" }}>{glyph(size * 0.58, BRAND_COLOR.tiktok)}</div>
      </div>
    );
  return glyph(size, BRAND_COLOR[brand]);
};

/** Tarjeta de marca: logo oficial y nombre. */
export const LogoCard: React.FC<{ brand: Brand; x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; name?: boolean; active?: boolean }> = ({ brand, x, y, w = 220, h = 220, style, name = true, active }) => (
  <Card x={x} y={y} w={w} h={h} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, ...style }} active={active}>
    <Logo brand={brand} size={brand === "canva" ? w * 0.42 : Math.min(w, h) * 0.42} />
    {name && brand !== "canva" ? <Label size={Math.round(Math.min(w, h) * 0.13)} weight={800}>{BRAND_NAME[brand]}</Label> : null}
  </Card>
);

/** Conector (línea azul que se dibuja con progreso t). Coordenadas en px del lienzo. */
export const Connector: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; color?: string; width?: number; dashed?: boolean; glow?: number }> = ({ x1, y1, x2, y2, t, color = P.blue, width = 5, dashed, glow = 0 }) => {
  // sin progreso no se pinta nada: una línea de longitud cero con extremo redondeado se vería como un punto suelto
  if (t <= 0.001) return null;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1920}>
      {glow > 0 ? <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={0.18 * glow} strokeWidth={width * 4} strokeLinecap="round" /> : null}
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? "2 14" : undefined} />
      {t > 0.02 ? <circle cx={x1} cy={y1} r={width * 1.4} fill={color} /> : null}
      {t > 0.98 ? <circle cx={x2} cy={y2} r={width * 1.4} fill={color} /> : null}
    </svg>
  );
};

/** Cursor de ratón (punta en x, y). */
export const Cursor: React.FC<{ x: number; y: number; scale?: number; opacity?: number }> = ({ x, y, scale = 1, opacity = 1 }) => (
  <svg style={{ position: "absolute", left: x - 4, top: y - 2, transform: `scale(${scale})`, transformOrigin: "4px 2px", opacity, filter: "drop-shadow(0 6px 10px rgba(23,23,29,0.25))" }} width={44} height={58} viewBox="0 0 44 58">
    <path d="M4 2 L4 46 L15 35 L23 54 L31 50 L23 32 L39 32 Z" fill={P.ink} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
  </svg>
);

/** Perfil (cabeza y hombros) — sin rasgos ni datos personales. */
export const Avatar: React.FC<{ size: number; tone?: "ink" | "blue" | "yellow"; style?: React.CSSProperties }> = ({ size, tone = "ink", style }) => {
  const bg = tone === "blue" ? "#DCE7FF" : tone === "yellow" ? P.yellowSoft : "#ECEAE4";
  const fg = tone === "blue" ? P.blue : tone === "yellow" ? "#B8900A" : P.ink2;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
      <circle cx={20} cy={20} r={19} fill={bg} stroke="#fff" strokeWidth={2} />
      <circle cx={20} cy={15.5} r={6.4} fill={fg} />
      <path d="M8.5 33.5c1.8-6.2 6.2-9.3 11.5-9.3s9.7 3.1 11.5 9.3" fill={fg} />
    </svg>
  );
};

/** Iconos de trazo (ink) del kit. */
export type IconName = "eye" | "store" | "doc" | "chart" | "mail" | "calendar" | "cart" | "play" | "heart" | "comment" | "share" | "clock" | "people" | "box" | "spark" | "send" | "target";
export const Icon: React.FC<{ name: IconName; size?: number; color?: string; fill?: string; strokeWidth?: number }> = ({ name, size = 48, color = P.ink, fill = "none", strokeWidth = 2.4 }) => {
  const s = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    eye: (<><path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" {...s} fill={fill} /><circle cx={12} cy={12} r={3.4} fill={P.yellow} stroke={color} strokeWidth={strokeWidth} /></>),
    store: (<><path d="M4 9.5V20h16V9.5" {...s} /><path d="M3 9.5L5 4h14l2 5.5c0 1.5-1.3 2.5-3 2.5s-3-1-3-2.5c0 1.5-1.3 2.5-3 2.5s-3-1-3-2.5c0 1.5-1.3 2.5-3 2.5S3 11 3 9.5z" {...s} fill={fill} /><path d="M10 20v-5h4v5" {...s} /></>),
    doc: (<><path d="M6 3h8l4 4v14H6z" {...s} fill={fill} /><path d="M14 3v4h4M9 12h6M9 16h6" {...s} /></>),
    chart: (<><path d="M4 20h16" {...s} /><path d="M7 20v-6M12 20V8M17 20v-9" {...s} strokeWidth={strokeWidth * 1.6} /></>),
    mail: (<><rect x={3} y={5.5} width={18} height={13} rx={2} {...s} fill={fill} /><path d="M3.5 7l8.5 6 8.5-6" {...s} /></>),
    calendar: (<><rect x={3.5} y={5} width={17} height={15} rx={2} {...s} fill={fill} /><path d="M3.5 10h17M8 3v4M16 3v4" {...s} /></>),
    cart: (<><path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H6.6" {...s} /><circle cx={9.5} cy={19} r={1.6} {...s} /><circle cx={17} cy={19} r={1.6} {...s} /></>),
    play: (<path d="M8 5.5v13l10.5-6.5z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />),
    heart: (<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" {...s} fill={fill} />),
    comment: (<path d="M4 5h16v11H9l-5 4z" {...s} fill={fill} />),
    share: (<path d="M20 4L3.5 11l6.5 2.6L12.6 20z" {...s} fill={fill} />),
    clock: (<><circle cx={12} cy={12} r={9} {...s} fill={fill} /><path d="M12 7v5l3.4 2" {...s} /></>),
    people: (<><circle cx={9} cy={8.5} r={3.2} {...s} /><path d="M3 19c.8-3.4 3-5.2 6-5.2s5.2 1.8 6 5.2" {...s} /><circle cx={16.5} cy={9.5} r={2.6} {...s} /><path d="M16 13.9c2.6.2 4.2 1.9 5 4.6" {...s} /></>),
    box: (<><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" {...s} fill={fill} /><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" {...s} /></>),
    spark: (<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" {...s} />),
    send: (<path d="M4 12l16-8-6 16-2.6-6.4z" {...s} fill={fill} />),
    target: (<><circle cx={12} cy={12} r={9} {...s} /><circle cx={12} cy={12} r={4.5} {...s} /><circle cx={12} cy={12} r={1.2} fill={color} /></>),
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
};

/** Teléfono con pantalla clara; el contenido de la pantalla va como hijo (recortado). */
export const Phone: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, children, style }) => {
  const r = w * 0.15, b = Math.max(8, w * 0.035);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: P.ink, padding: b, boxShadow: shadow, boxSizing: "border-box", ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - b, overflow: "hidden", background: P.bg }}>
        {children}
        <div style={{ position: "absolute", top: b * 0.9, left: "50%", width: w * 0.28, height: b * 2.1, marginLeft: -w * 0.14, borderRadius: 999, background: P.ink }} />
      </div>
    </div>
  );
};

/** Publicación conceptual de un feed (vídeo o imagen), sin marcas ni datos reales. */
export const FeedPost: React.FC<{ w: number; video?: boolean; liked?: number; tint?: "yellow" | "blue" | "cream" }> = ({ w, video, liked = 0, tint = "yellow" }) => {
  const media = tint === "yellow" ? `linear-gradient(150deg, ${P.yellowSoft}, ${P.yellow})` : tint === "blue" ? `linear-gradient(150deg, ${P.bgBlueLight}, #9FB9F5)` : `linear-gradient(150deg, ${P.bg}, ${P.bgBlue})`;
  const u = w / 100;
  return (
    <div style={{ width: w, background: P.card, borderRadius: 4 * u, overflow: "hidden", boxShadow: "0 4px 10px rgba(23,23,29,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3 * u, padding: `${3 * u}px ${4 * u}px` }}>
        <div style={{ width: 9 * u, height: 9 * u, borderRadius: 999, background: P.border }} />
        <div style={{ width: 34 * u, height: 3.2 * u, borderRadius: 999, background: P.border }} />
      </div>
      <div style={{ height: 78 * u, background: media, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {video ? <div style={{ width: 22 * u, height: 22 * u, borderRadius: 999, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="play" size={12 * u} /></div> : null}
      </div>
      <div style={{ display: "flex", gap: 5 * u, padding: `${3.5 * u}px ${4 * u}px`, alignItems: "center" }}>
        <div style={{ transform: `scale(${1 + 0.35 * Math.sin(Math.PI * liked)})` }}><Icon name="heart" size={10 * u} fill={liked > 0.5 ? P.yellow : "none"} color={liked > 0.5 ? "#B8900A" : P.ink} /></div>
        <Icon name="comment" size={10 * u} />
        <Icon name="share" size={10 * u} />
      </div>
    </div>
  );
};

/** Retícula de enfoque (cuatro esquinas amarillas) alrededor de un rectángulo. */
export const Reticle: React.FC<{ x: number; y: number; w: number; h: number; opacity?: number; thick?: number }> = ({ x, y, w, h, opacity = 1, thick = 7 }) => {
  const l = Math.min(w, h) * 0.22;
  const c = (sx: number, sy: number) => <path d={`M${sx ? x + w : x} ${sy ? y + h - l : y + l} L${sx ? x + w : x} ${sy ? y + h : y} L${sx ? x + w - l : x + l} ${sy ? y + h : y}`} fill="none" stroke={P.yellow} strokeWidth={thick} strokeLinecap="round" strokeLinejoin="round" />;
  return <svg style={{ position: "absolute", left: 0, top: 0, opacity, overflow: "visible" }} width={1080} height={1920}>{c(0, 0)}{c(1, 0)}{c(0, 1)}{c(1, 1)}</svg>;
};

/** Barras grises de texto (relleno de interfaz sin contenido inventado). */
export const Bars: React.FC<{ widths: number[]; h?: number; gap?: number; color?: string }> = ({ widths, h = 14, gap = 10, color = "#E7E4DD" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>{widths.map((w, i) => <div key={i} style={{ width: w, height: h, borderRadius: 999, background: color }} />)}</div>
);
