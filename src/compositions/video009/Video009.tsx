/**
 * VIDEO-009 · #edit-5-creator · 5A (collage) · showreel de Video Lab con los estilos de subtítulos, looks y movimientos.
 * Contrato: video-orders/VIDEO-009.json (cortes) y analysis/video-009-timeline.json (frames). 1080×1920 a 24 fps.
 * Audio: voz de la toma principal (proxy continuo con los cortes, sin tocar su nivel) + efectos de public/sfx muy bajos.
 * Sin música. No hay precio en ningún texto (decisión del usuario, 2026-10-16).
 */
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { BEATS, Beats } from "./beats";
import { INTER, TL, takeWords } from "./kit";

export type Video009Props = { reviewNotice?: string; showSafeArea?: boolean };

const w = (take: string, i: number) => takeWords(take)[i].from;
const SFX: Array<{ f: number; s: string; v: number }> = [
  { f: 2, s: "zp-thud", v: 0.35 },
  ...(["b2", "b3", "b4", "b5a", "b5b", "b6a", "b8", "b9"] as const).map((k) => ({ f: BEATS[k][0], s: "whip", v: 0.4 })),
  { f: w("T03", 6), s: "zp-pop", v: 0.3 }, { f: w("T03", 11), s: "whoosh", v: 0.3 },
  { f: w("T07b", 0), s: "zp-pop-hi", v: 0.3 }, { f: BEATS.b6c[0], s: "zp-tick", v: 0.35 }, { f: BEATS.b6d[0], s: "zp-snap", v: 0.35 },
  { f: BEATS.b7a[0], s: "whoosh", v: 0.3 },
  ...[0, 4, 5, 6].map((i) => ({ f: w("T10", i), s: "zp-pop", v: 0.25 })), { f: w("T10", 8), s: "zp-assemble", v: 0.3 },
  { f: BEATS.b7b[0] + 2, s: "zp-keys", v: 0.3 }, { f: w("T11", 3), s: "zp-stamp", v: 0.35 },
  { f: BEATS.b8[0] + 10, s: "zp-drop", v: 0.3 },
  { f: w("T13", 12), s: "zp-keys", v: 0.3 }, { f: w("T13", 12) + 24, s: "zp-confirm", v: 0.35 },
  // «Seguir» de VIDEO-005/008: avatar, tarjeta y clic (a 30 fps en su escena → 24 fps aquí)
  { f: BEATS.b10[0], s: "zp-swish-up", v: 0.25 }, { f: BEATS.b10[0] + Math.round((12 * 24) / 30), s: "zp-pop", v: 0.3 }, { f: BEATS.b10[0] + Math.round((34 * 24) / 30), s: "mouse-click", v: 0.45 },
];

export const VIDEO009_FRAMES = TL.total_f;
export const VIDEO009_FPS = TL.fps;

export const Video009: React.FC<Video009Props> = ({ reviewNotice, showSafeArea }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Html5Audio src={staticFile("video-009/voice.m4a")} />
    {SFX.map((e, i) => (
      <Sequence key={i} from={e.f} durationInFrames={50} layout="none">
        <Html5Audio src={staticFile(`sfx/${e.s}.wav`)} volume={e.v} />
      </Sequence>
    ))}
    <Beats />
    {showSafeArea ? (
      <AbsoluteFill style={{ pointerEvents: "none", zIndex: 98 }}>
        {/* área segura de Reels: x 65–1015, y 250–1500; nada a la derecha de x = 940 por debajo de y = 1000 */}
        <div style={{ position: "absolute", left: 65, top: 250, width: 950, height: 1250, border: "3px dashed #ff2d95" }} />
        <div style={{ position: "absolute", left: 940, top: 1000, width: 3, height: 500, background: "#ff2d95" }} />
      </AbsoluteFill>
    ) : null}
    {reviewNotice ? (
      <div style={{ position: "absolute", top: 24, left: 24, padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,.55)", color: "#fff", fontFamily: INTER, fontSize: 20, fontWeight: 700, zIndex: 99 }}>{reviewNotice}</div>
    ) : null}
  </AbsoluteFill>
);
