import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { brandBg, clamp, FONT, P } from "./ui";

// Franja negra de VIDEO-002 (corrección del usuario, 2026-10-05: «en la referencia esa franja negra se integra
// perfectamente, de ahí salen textos, salen cuadros de él, y el flujo en seguido, continuo»; no quiere el degradado).
// La franja es el suelo del motion: negro sólido con borde nítido, siempre a la misma altura mientras se encadenan
// escenas de motion. Al entrar desde el presentador sube desde abajo; el contenido de cada escena sale de ella y, si
// la siguiente también es motion, se hunde en ella al terminar (con desenfoque de movimiento vertical). Las tarjetas
// oscuras nacen de la franja (mismo negro, sin borde inferior) y los objetos se apoyan en su borde como en una mesa.
// Los subtítulos viven dentro de la franja (Video002 los recorta a ella).

/** Borde superior de la franja en las escenas de motion (px del lienzo 1080×1920). */
export const EDGE = 1180;
/** Foco vertical de cámara que mantiene fijo el borde de la franja al acercar con escala `s` (ver ui.camera). */
export const anchorY = (s: number) => EDGE - (EDGE - 690) / s;

export interface BandInfo {
  /** Borde de la franja en un frame local de la escena. */
  edgeAt: (f: number) => number;
  /** La escena siguiente también es motion: el contenido se hunde en la franja al final. */
  sink: boolean;
  dur: number;
}
export const BandCtx = createContext<BandInfo>({ edgeAt: () => EDGE, sink: false, dur: 1 });

const RISE = 9, SINK = 7, DIST = 1000;
/** Recorrido vertical de la capa de contenido: sube desde la franja al empezar y se hunde en ella al acabar. */
const travel = (f: number, dur: number, sink: boolean) => {
  const up = 1 - interpolate(f, [0, RISE], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const down = sink ? interpolate(f, [dur - SINK, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (up + down) * DIST;
};

/**
 * Escenario de motion: fondo de marca, franja y capas.
 *  - children: contenido principal (con la cámara `cam`), recortado en el borde de la franja: lo que baja de él
 *    queda dentro de la franja y lo que sube parece salir de ella;
 *  - front: lo que puede pisar la franja (cursor…);
 *  - fixed: etiquetas que no se mueven con la cámara (notas, «Ejemplo ilustrativo»).
 */
export const Stage: React.FC<{ children: React.ReactNode; cam?: React.CSSProperties; fixed?: React.ReactNode; front?: React.ReactNode }> = ({ children, cam, fixed, front }) => {
  const f = useCurrentFrame();
  const { edgeAt, sink, dur } = useContext(BandCtx);
  const edge = edgeAt(f);
  const y = travel(f, dur, sink), speed = Math.abs(y - travel(f - 1, dur, sink));
  const blur = speed > 110 ? 3 : speed > 50 ? 2 : speed > 12 ? 1 : 0;
  const fade = 1 - Math.min(1, y / 300);
  const camStyle: React.CSSProperties = cam ?? { position: "absolute", inset: 0 };
  return (
    <AbsoluteFill style={brandBg}>
      <div style={{ position: "absolute", left: 0, right: 0, top: edge, bottom: 0, background: P.ink }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${Math.max(0, 1920 - edge)}px 0)` }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${y}px)`, filter: blur ? `url(#v002-mb${blur})` : undefined }}>
          <div style={camStyle}>{children}</div>
        </div>
      </div>
      {front ? <div style={{ position: "absolute", inset: 0, transform: `translateY(${y}px)`, opacity: fade }}><div style={camStyle}>{front}</div></div> : null}
      {fixed ? <div style={{ position: "absolute", inset: 0, opacity: fade }}>{fixed}</div> : null}
    </AbsoluteFill>
  );
};

/** Tarjeta oscura que nace de la franja: con `t` 0→1 su borde superior sube del borde de la franja hasta `y`; por
 *  debajo se alarga hasta perderse en ella (mismo negro), también con la cámara acercada. */
export const BandCard: React.FC<{ x: number; y: number; w: number; t: number; r?: number; dots?: boolean; children?: React.ReactNode }> = ({ x, y, w, t, r = 44, dots = true, children }) => (
  <div style={{ position: "absolute", left: x, top: EDGE + (y - EDGE) * t, width: w, height: 3200, background: P.ink, borderRadius: `${r}px ${r}px 0 0`, boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.07), 0 -16px 40px rgba(23,23,29,0.16)", overflow: "hidden", fontFamily: FONT }}>
    {dots ? <div style={{ position: "absolute", left: 34, top: 30, display: "flex", gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 99, background: "rgba(255,255,255,0.28)" }} />)}</div> : null}
    {children}
  </div>
);

/** Nota de fuente dentro de la franja, sobre el negro (arriba de los subtítulos). */
export const BandNote: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = EDGE + 26 }) => (
  <div style={{ position: "absolute", left: 65, top: y, fontFamily: FONT, fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.66)", letterSpacing: "0.01em" }}>{children}</div>
);
