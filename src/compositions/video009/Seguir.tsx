/**
 * VIDEO-009 · cierre «Seguir» con el perfil de la cuenta zevenpro.estrategia.
 * Mismo movimiento que VIDEO-005/008 (avatar en arco que se estira y se aplasta → la tarjeta se expande desde él → el cursor pulsa
 * «Seguir» → «Siguiendo»; src/compositions/video005/scenes.tsx · Esc9), pero parametrizado con otra cuenta y más pequeño.
 * Se diseña a 900×304 px y se escala (`scale`) alrededor del centro de la tarjeta. Tiempos en frames a 30 fps (como en 005/008).
 */
import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { Cursor, INTER, C } from "./kit";

const EASE_IO = Easing.bezier(0.45, 0, 0.2, 1);
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const pr = (f: number, start: number, dur: number, easing: (x: number) => number = EASE_OUT) =>
  interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

const BEATS = { sigueme: 0, expande: 12, clic: 34 };

export const Seguir: React.FC<{
  f30: number;
  usuario: string;
  nombre: string;
  avatar: string;
  /** escala de la tarjeta (0,7 ≈ 630 px de ancho) */
  scale?: number;
  /** centro de la tarjeta en el lienzo 1080×1920 */
  cx?: number;
  cy?: number;
}> = ({ f30: f, usuario, nombre, avatar, scale = 0.7, cx = 540, cy = 1190 }) => {
  const b = BEATS;
  const CARD = { w: 900, h: 304 };
  const BTN = { x: 36, y: 196, w: 380, h: 78 };
  // coordenadas locales de la tarjeta (0,0 = esquina superior izquierda); el avatar vuela desde abajo a la izquierda
  const A0 = { x: 20, y: 640 }, A1 = { x: 36 + 65, y: 34 + 65 }, CTRL = { x: 10, y: 120 };
  const vuelo = pr(f, b.sigueme, b.expande - b.sigueme, EASE_IO);
  const ax = (1 - vuelo) ** 2 * A0.x + 2 * (1 - vuelo) * vuelo * CTRL.x + vuelo ** 2 * A1.x;
  const ay = (1 - vuelo) ** 2 * A0.y + 2 * (1 - vuelo) * vuelo * CTRL.y + vuelo ** 2 * A1.y;
  const estira = Math.sin(Math.PI * vuelo);
  const aplasta = f >= b.expande ? Math.sin(Math.PI * pr(f, b.expande, 6, (x) => x)) : 0;
  const sx = 1 - 0.18 * estira + 0.15 * aplasta, sy = 1 + 0.25 * estira - 0.12 * aplasta;
  const abre = pr(f, b.expande, 11);
  const contenido = (k: number) => {
    const t = pr(f, b.expande + 4 + k * 2, 9);
    return { opacity: t, filter: `blur(${(1 - t) * 10}px)`, transform: `translateX(${(1 - t) * -24}px)` };
  };
  const objetivo = { x: BTN.x + BTN.w * 0.8, y: BTN.y + BTN.h * 0.55 };
  const viaje = pr(f, b.expande + 6, b.clic - b.expande - 8, EASE_IO);
  const cur = { x: 760 + (objetivo.x - 760) * viaje, y: 560 + (objetivo.y - 560) * viaje };
  const pulsado = f >= b.clic && f < b.clic + 5;
  const sigue = f >= b.clic + 3;
  const anillo = pr(f, b.clic, 14);
  const txt = (size: number, w: number, style?: React.CSSProperties): React.CSSProperties => ({ fontFamily: INTER, fontSize: size, fontWeight: w, color: C.ink, whiteSpace: "nowrap", ...style });
  return (
    <div style={{ position: "absolute", left: cx - CARD.w / 2, top: cy - CARD.h / 2, width: CARD.w, height: CARD.h, transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
      {abre > 0 ? (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - abre) * 72}% 0 0 round 44px)` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: "#fff", boxShadow: "0 40px 80px -24px rgba(0,0,0,.55)" }} />
          <div style={{ position: "absolute", left: 196, top: 48, ...txt(40, 800, { letterSpacing: "-0.01em" }), ...contenido(0) }}>{usuario}</div>
          <div style={{ position: "absolute", right: 36, top: 30, display: "flex", gap: 26, alignItems: "center", ...contenido(0) }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></svg>
            <div style={txt(40, 900, { letterSpacing: "0.05em", lineHeight: 0.6 })}>···</div>
          </div>
          <div style={{ position: "absolute", left: 196, top: 112, ...txt(32, 700), ...contenido(1) }}>{nombre}</div>
          <div style={{ position: "absolute", left: 36, top: 196, display: "flex", gap: 14, ...contenido(2) }}>
            <div style={{ width: BTN.w, height: BTN.h, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: sigue ? "#EFEFF2" : C.ui, transform: `scale(${pulsado ? 0.96 : 1})`, fontFamily: INTER, fontWeight: 800, fontSize: 32, color: sigue ? C.ink : "#fff" }}>
              {sigue ? <>Siguiendo <svg width={24} height={24} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg></> : "Seguir"}
            </div>
            <div style={{ width: 350, height: BTN.h, borderRadius: 22, background: "#EFEFF2", display: "grid", placeItems: "center", ...txt(32, 800) }}>Mensaje</div>
            <div style={{ width: 92, height: BTN.h, borderRadius: 22, background: "#EFEFF2", display: "grid", placeItems: "center" }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill={C.ink}><circle cx={9} cy={8} r={4} /><path d="M2 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5z" /><path d="M19 8v6M16 11h6" stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" /></svg>
            </div>
          </div>
        </div>
      ) : null}
      {vuelo > 0 ? (
        <div style={{ position: "absolute", left: ax - 65, top: ay - 65, transform: `scale(${sx}, ${sy})`, filter: estira > 0.3 && vuelo < 1 ? `blur(${estira * 2}px)` : undefined }}>
          <Img src={staticFile(avatar)} style={{ width: 130, height: 130, borderRadius: 999, objectFit: "cover", display: "block", boxShadow: "0 16px 30px -10px rgba(0,0,0,.5)" }} />
        </div>
      ) : null}
      {anillo > 0 && anillo < 1 ? <div style={{ position: "absolute", left: objetivo.x - 10 - 60 * anillo, top: objetivo.y - 10 - 60 * anillo, width: 20 + 120 * anillo, height: 20 + 120 * anillo, borderRadius: 999, border: "4px solid #6aa2ff", opacity: 1 - anillo }} /> : null}
      {f >= b.expande + 4 ? <div style={{ position: "absolute", left: cur.x - 6, top: cur.y - 6, opacity: pr(f, b.expande + 4, 6), transform: pulsado ? "scale(0.9)" : undefined }}><Cursor size={64} /></div> : null}
    </div>
  );
};
