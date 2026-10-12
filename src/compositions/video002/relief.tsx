import React from "react";
import { Img, staticFile } from "remotion";
import { P } from "./ui";

// Relieve «inflado» de fieltro en SVG (opción 2 del usuario, 2026-10-05: para lo que no existe como icono y creamos
// nosotros: el público, las fichas de la cadena, las insignias). Cada forma se infla por separado: el desenfoque de su
// propia silueta hace de mapa de alturas, un ruido fino le da textura de tela y dos luces la sombrean. Sin paquetes
// ni archivos externos. Los filtros se definen una vez por documento (<ReliefDefs/> en Video002) y los usan por id.

/** Filtros compartidos: relieve de fieltro y desenfoques de movimiento vertical para las transiciones de la franja. */
export const ReliefDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
    <defs>
      <filter id="v002-puffy" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation={6} result="b" />
        <feTurbulence type="fractalNoise" baseFrequency={0.42} numOctaves={2} seed={11} result="n" />
        <feColorMatrix in="n" type="luminanceToAlpha" result="na" />
        <feComposite in="b" in2="na" operator="arithmetic" k2={1} k3={0.05} result="h" />
        <feDiffuseLighting in="h" surfaceScale={11} diffuseConstant={1.02} lightingColor="#ffffff" result="d">
          <feDistantLight azimuth={235} elevation={55} />
        </feDiffuseLighting>
        <feSpecularLighting in="h" surfaceScale={11} specularConstant={0.42} specularExponent={18} lightingColor="#ffffff" result="s">
          <feDistantLight azimuth={235} elevation={55} />
        </feSpecularLighting>
        <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1.14} result="lit" />
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
        <feComposite in="lit" in2="s2" operator="arithmetic" k2={1} k3={0.5} result="all" />
        <feComposite in="all" in2="SourceAlpha" operator="in" />
      </filter>
      {[6, 16, 30].map((d, i) => (
        <filter key={d} id={`v002-mb${i + 1}`} x="0" y="-20%" width="100%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={`0 ${d}`} />
        </filter>
      ))}
    </defs>
  </svg>
);

const puffy = "url(#v002-puffy)";
const shade = "drop-shadow(0 8px 12px rgba(23,23,29,0.16))";
export type Tone = "ink" | "blue" | "yellow" | "red";
const TONE: Record<Tone, { bg: string; fg: string }> = {
  ink: { bg: "#E9E6DF", fg: "#3A3A44" },
  blue: { bg: "#D7E3FF", fg: P.blue },
  yellow: { bg: P.yellowSoft, fg: "#E0A800" },
  red: { bg: "#FFD9DF", fg: P.red },
};

// ---------- originales SVG (fuente de las imágenes) ----------
// Los filtros de relieve son caros de recalcular en cada frame (el Studio iba a saltos con las 36 personas de m3), así
// que estas formas se renderizan una vez a PNG transparente (composición «Video002Relieve»,
// src/videoAnalysis/video002/buildRelief.mjs → public/video-002/relieve/) y las escenas usan esas imágenes.

/** Persona en relieve (disco, cabeza y hombros inflados por separado). Sin rasgos ni datos personales. */
export const PuffyAvatarSvg: React.FC<{ size: number; tone: Tone }> = ({ size, tone }) => {
  const c = TONE[tone];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: shade }}>
      <circle cx={50} cy={50} r={46} fill={c.bg} filter={puffy} />
      <circle cx={50} cy={39} r={16} fill={c.fg} filter={puffy} />
      <path d="M22 84c4-15 15-23 28-23s24 8 28 23c-8 6-18 9-28 9s-20-3-28-9z" fill={c.fg} filter={puffy} />
    </svg>
  );
};
/** Ficha redonda en relieve (con aro de color opcional). */
export const PuffyChipSvg: React.FC<{ size: number; ring?: string }> = ({ size, ring }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: shade }}>
    {ring ? <circle cx={50} cy={50} r={49} fill={ring} filter={puffy} /> : null}
    <circle cx={50} cy={50} r={ring ? 42 : 47} fill="#FFFFFF" filter={puffy} />
  </svg>
);
/** Insignia de hecho: disco amarillo y marca de verificación, ambos en relieve. */
export const PuffyCheckSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: shade }}>
    <circle cx={50} cy={50} r={46} fill={P.yellow} filter={puffy} />
    <path d="M28 52l14 14 30-32" fill="none" stroke={P.ink} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" filter={puffy} />
  </svg>
);
/** Corazón en relieve (me gusta). */
export const PuffyHeartSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: shade }}>
    <path d="M50 88S10 63 10 36a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 27-40 52-40 52z" fill={P.red} filter={puffy} />
  </svg>
);

export const RELIEF_VARIANTS = ["avatar-ink", "avatar-blue", "avatar-yellow", "avatar-red", "chip-plain", "chip-grey", "chip-blue", "check", "heart"] as const;
export type ReliefVariant = (typeof RELIEF_VARIANTS)[number];
/** La forma ocupa el centro (1/RELIEF_PAD) de la imagen; el resto es margen para la sombra y el desbordamiento del filtro. */
const RELIEF_PAD = 1.4;
export const RELIEF_SIZE = 280;

/** Composición «Video002Relieve»: una variante en un lienzo transparente de 280 px (forma de 200 px). */
export const ReliefSheet: React.FC<{ variant: ReliefVariant }> = ({ variant }) => {
  const s = RELIEF_SIZE / RELIEF_PAD;
  const shape = variant.startsWith("avatar-") ? <PuffyAvatarSvg size={s} tone={variant.slice(7) as Tone} />
    : variant === "chip-plain" ? <PuffyChipSvg size={s} />
    : variant === "chip-grey" ? <PuffyChipSvg size={s} ring="#E4E1DA" />
    : variant === "chip-blue" ? <PuffyChipSvg size={s} ring={P.blue} />
    : variant === "check" ? <PuffyCheckSvg size={s} /> : <PuffyHeartSvg size={s} />;
  return (
    <div style={{ width: RELIEF_SIZE, height: RELIEF_SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ReliefDefs />
      {shape}
    </div>
  );
};

// ---------- versiones de imagen (las que usan las escenas) ----------

const ReliefImg: React.FC<{ variant: ReliefVariant; size: number; style?: React.CSSProperties }> = ({ variant, size, style }) => {
  const box = size * RELIEF_PAD, off = (box - size) / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      <Img src={staticFile(`video-002/relieve/${variant}.png`)} style={{ position: "absolute", left: -off, top: -off, width: box, height: box }} />
    </div>
  );
};

/** Persona en relieve (imagen de PuffyAvatarSvg). */
export const PuffyAvatar: React.FC<{ size: number; tone?: Tone; style?: React.CSSProperties }> = ({ size, tone = "ink", style }) => <ReliefImg variant={`avatar-${tone}`} size={size} style={style} />;

/** Ficha en relieve con un icono plano encima (para la cadena de m9). Aro gris o azul (el azul marca la conexión). */
export const PuffyChip: React.FC<{ size: number; ring?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ size, ring, children, style }) => (
  <div style={{ position: "relative", width: size, height: size, ...style }}>
    <ReliefImg variant={!ring ? "chip-plain" : ring === P.blue ? "chip-blue" : "chip-grey"} size={size} style={{ position: "absolute", inset: 0 }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
  </div>
);

/** Insignia de hecho en relieve. */
export const PuffyCheck: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => <ReliefImg variant="check" size={size} style={style} />;

/** Corazón en relieve. */
export const PuffyHeart: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => <ReliefImg variant="heart" size={size} style={style} />;
