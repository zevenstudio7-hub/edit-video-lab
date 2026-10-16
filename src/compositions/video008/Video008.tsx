/**
 * VIDEO-008 · #edit-2-pantalla-dividida (2A con el reparto invertido) · subtítulos S6 sin palabra clave.
 * Contrato: video-orders/VIDEO-008.json → timeline (src/videoAnalysis/video008/buildEdit.mjs). Todo en frames de 24 fps.
 *  - Presentador arriba (y 0–950); a pantalla completa en el gancho y en el cierre.
 *  - Franja oscura (y 950–1070) con los subtítulos: una sola línea de lectura, sin resaltar palabras (pedido del usuario).
 *  - Tomas de apoyo abajo (y 1070–1920): la grabación del dashboard recortada en la zona de la que se habla
 *    (oficina, lista de cargos, sala de juntas, avances, aprobación), con un acercamiento lento y fundido de 5 frames.
 *  - Una sola voz (la montada, normalizada); los planos van en silencio. Un efecto suave en cada cambio de toma.
 */
import React from "react";
import { AbsoluteFill, Easing, getRemotionEnvironment, Html5Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/InterTight";
// CTA «Seguir» de VIDEO-005 (avatar en arco → tarjeta de perfil → clic en «Seguir»), reutilizado sin cambios
import { ESCENAS as V005 } from "../video005/scenes";

const { fontFamily: FONT } = loadFont("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
const INK = "#17171D", YELLOW = "#F5C518";
const SPLIT = 950, STRIP = 120, SRC_W = 2674, SRC_H = 1878;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Rect = { x: number; y: number; w: number; h: number };
export interface V008Timeline {
  fps: number;
  durationInFrames: number;
  audio: { dialogue: string; sfx?: string };
  presentador: string;
  dashboard: string;
  shots: { id: string; startFrame: number; durationInFrames: number; trimBefore: number }[];
  layout: { modo: "presentador" | "dividida"; startFrame: number }[];
  apoyo: { startFrame: number; endFrame: number; fuente: number; zona: string; recorte: Rect; motivo: string }[];
  captions: { read: { text: string; startFrame: number; endFrame: number }[] };
  cta?: { startFrame: number };
}

/** La escena de cierre de VIDEO-005 con solo la parte «sígueme» (el comentario y el rótulo quedan fuera de tiempo). */
const SEGUIR_BEATS = { guia: 1e6, comenta: 1e6, google: 1e6, sigueme: 0, expande: 12, clic: 34 };
const SeguirCTA: React.FC<{ f30: number }> = ({ f30 }) => {
  const Cierre = V005.cierre;
  return <Cierre f={f30} s={{ id: "cta", modo: "presentador", tipo: "cierre", startFrame: 0, durationInFrames: 1e6, beats: SEGUIR_BEATS }} />;
};

/** Altura de la zona del presentador en el frame f: 1920 a pantalla completa, 950 dividida (transición de 10 f). */
const presenterHeight = (f: number, layout: V008Timeline["layout"]) => {
  let h = 1920;
  for (let i = 0; i < layout.length; i++) {
    const l = layout[i], prev = i ? layout[i - 1] : null;
    if (f < l.startFrame) break;
    const from = prev ? (prev.modo === "dividida" ? SPLIT : 1920) : 1920, to = l.modo === "dividida" ? SPLIT : 1920;
    h = interpolate(f, [l.startFrame, l.startFrame + 10], [from, to], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  }
  return h;
};

const SupportShot: React.FC<{ src: string; a: V008Timeline["apoyo"][number]; fps: number; h: number }> = ({ src, a, fps, h }) => {
  const f = useCurrentFrame();
  const len = a.endFrame - a.startFrame;
  const fade = interpolate(f, [0, 5], [0, 1], clamp);
  const push = interpolate(f, [0, len + 5], [1, 1.06], clamp);
  const r = a.recorte, s = (1080 / r.w) * push;
  // acercamiento alrededor del centro del recorte
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return (
    <AbsoluteFill style={{ opacity: fade, overflow: "hidden", width: 1080, height: h }}>
      <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(a.fuente * fps)} muted style={{ position: "absolute", width: SRC_W * s, height: SRC_H * s, maxWidth: "none", left: 540 - cx * s, top: h / 2 - cy * s }} />
    </AbsoluteFill>
  );
};

const CtaLayer: React.FC<{ fps: number }> = ({ fps }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none" }}><SeguirCTA f30={(f * 30) / fps} /></AbsoluteFill>;
};

export const Video008: React.FC<{ timeline: V008Timeline; reviewNotice?: string }> = ({ timeline, reviewNotice }) => {
  const f = useCurrentFrame();
  const { isStudio } = getRemotionEnvironment();
  const H = presenterHeight(f, timeline.layout);
  const split = H < 1919; // la franja y las tomas aparecen en cuanto empieza la transición
  const supportTop = H + STRIP, supportH = 1920 - SPLIT - STRIP;
  // en pantalla dividida el presentador sube 30 px para que la cabeza quede dentro de su zona
  const lift = interpolate(H, [SPLIT, 1920], [-30, 0], clamp);
  const chunk = timeline.captions.read.find((c) => f >= c.startFrame && f < c.endFrame);
  // a pantalla completa el subtítulo cae sobre el micrófono y el portátil claro: lleva un fondo oscuro translúcido
  // durante la tarjeta de «Seguir» (y 1060–1364) el subtítulo baja a y = 1450
  const ctaOn = timeline.cta !== undefined && f >= timeline.cta.startFrame;
  const capY = split ? H + STRIP / 2 : ctaOn ? 1450 : 1330;
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* presentador */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: H, overflow: "hidden" }}>
        {timeline.shots.map((s) => (
          <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames} premountFor={24} name={`presentador · ${s.id}`}>
            <OffthreadVideo src={staticFile(timeline.presentador)} trimBefore={s.trimBefore} muted style={{ position: "absolute", left: 0, top: lift, width: 1080, height: 1920 }} />
          </Sequence>
        ))}
      </div>
      {/* tomas de apoyo (abajo) */}
      {split ? (
        <div style={{ position: "absolute", left: 0, top: supportTop, width: 1080, height: supportH, overflow: "hidden", background: "#F4F1EA" }}>
          {timeline.apoyo.map((a, i) => (
            <Sequence key={i} from={a.startFrame} durationInFrames={a.endFrame - a.startFrame + 5} premountFor={24} name={`apoyo · ${a.zona}`}>
              <SupportShot src={timeline.dashboard} a={a} fps={timeline.fps} h={supportH} />
            </Sequence>
          ))}
        </div>
      ) : null}
      {/* franja de los subtítulos */}
      {split ? (
        <div style={{ position: "absolute", left: 0, top: H, width: 1080, height: STRIP, background: INK, borderTop: `4px solid ${YELLOW}`, boxSizing: "border-box" }} />
      ) : null}
      {/* subtítulos S6 sin píldora: lectura sencilla, sin palabra clave */}
      {chunk ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: capY, transform: "translateY(-50%)", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 46, lineHeight: 1.12, color: "#FFFFFF", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
          <span style={split ? undefined : { background: "rgba(23,23,29,0.62)", borderRadius: 14, padding: "6px 18px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{chunk.text}</span>
        </div>
      ) : null}
      {/* CTA «Seguir» al final (VIDEO-005 va a 30 fps: su tiempo se convierte desde los 24 fps de este video) */}
      {timeline.cta ? (
        <Sequence from={timeline.cta.startFrame} name="CTA · Seguir (VIDEO-005)">
          <CtaLayer fps={timeline.fps} />
        </Sequence>
      ) : null}
      {timeline.cta ? (
        <>
          <Sequence from={timeline.cta.startFrame} durationInFrames={24} name="efecto · avatar"><Html5Audio src={staticFile("sfx/zp-swish-up.wav")} volume={0.25} /></Sequence>
          <Sequence from={timeline.cta.startFrame + Math.round((12 * timeline.fps) / 30)} durationInFrames={24} name="efecto · tarjeta"><Html5Audio src={staticFile("sfx/zp-pop.wav")} volume={0.3} /></Sequence>
          <Sequence from={timeline.cta.startFrame + Math.round((34 * timeline.fps) / 30)} durationInFrames={24} name="efecto · clic Seguir"><Html5Audio src={staticFile("sfx/mouse-click.wav")} volume={0.45} /></Sequence>
        </>
      ) : null}
      <Html5Audio src={staticFile(timeline.audio.dialogue)} />
      {/* efecto suave en cada cambio de toma de apoyo, por debajo de la voz */}
      {timeline.apoyo.map((a, i) => (
        <Sequence key={`sfx-${i}`} from={a.startFrame} durationInFrames={24} name={`efecto · ${a.zona}`}>
          <Html5Audio src={staticFile(i === 0 ? "sfx/zp-swish-up.wav" : "sfx/zp-swish.wav")} volume={0.22} />
        </Sequence>
      ))}
      {timeline.audio.sfx ? <Html5Audio src={staticFile(timeline.audio.sfx)} /> : null}
      {reviewNotice && isStudio ? (
        <div style={{ position: "absolute", top: 18, left: 24, right: 24, textAlign: "center", fontFamily: FONT, fontSize: 20, fontWeight: 800, color: INK, background: "#FFF3B8", border: `1px solid ${YELLOW}`, padding: "8px 18px", borderRadius: 8 }}>{reviewNotice}</div>
      ) : null}
    </AbsoluteFill>
  );
};
