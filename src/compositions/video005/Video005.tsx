import React from "react";
// Voz, efectos y música con Html5Audio (un <audio> por pista), como VIDEO-002/003.
import { AbsoluteFill, getRemotionEnvironment, Html5Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TypeCaptions, type EmphasisBlock } from "../../../library/recipes/TypeCaptions";
import { SAFE } from "../video002/Video002";
import { ESCENAS, ListoBadge, type Escena } from "./scenes";
import { clamp, FondoSoft, FONT, P } from "./ui";

// VIDEO-005 · #edit-1-motion · 1C · S1+S4 («Google + IA para contadores»). Todo sale de video-orders/VIDEO-005.json →
// timeline (src/videoAnalysis/video005/buildTimeline.mjs). La timeline va 1:1 con la toma: la voz es la pista original sin
// tocar (decisión del usuario). Presentador en ESC 1, 5 y 9 (la toma tiene imagen); el resto es Motion UX `soft` a
// pantalla completa (la toma está en negro). Look cine-calido al 10 % ya aplicado en el proxy (solo metraje).

export interface LecturaBloque { text: string; startFrame: number; endFrame: number; palabras: { text: string; frame: number }[] }
export interface V005Timeline {
  fps: number;
  durationInFrames: number;
  vozFrames: number;
  source: { width: number; height: number; fps: number; video: string };
  audio: { dialogue: string; sfx?: string; music?: string };
  scenes: Escena[];
  captions: { read: LecturaBloque[]; emphasis: EmphasisBlock[] };
}

/**
 * Lectura S1 con palabra activa (cambio de la orden): 66 px, Inter Tight 800, centrada en y = 1438, x 65–940.
 * Sobre el presentador: blanca con sombra y la palabra que se dice en amarillo. Sobre el motion claro: ink, y la palabra
 * activa con marcador amarillo. Un bloque a la vez (2–4 palabras, una línea).
 */
const LecturaActiva: React.FC<{ f: number; read: LecturaBloque[]; claro: boolean }> = ({ f, read, claro }) => {
  const b = read.find((r) => f >= r.startFrame && f < r.endFrame);
  if (!b) return null;
  const t = interpolate(f, [b.startFrame, b.startFrame + 6], [0, 1], clamp);
  const activa = [...b.palabras].reverse().find((w) => f >= w.frame);
  return (
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.railX - SAFE.left, top: 1438, transform: `translateY(-50%) translateY(${(1 - t) * 8}px)`, opacity: t, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.08, letterSpacing: "-0.015em", color: claro ? P.ink : "#FFFFFF", textShadow: claro ? "none" : "0 2px 3px rgba(0,0,0,.55), 0 6px 22px rgba(0,0,0,.5)" }}>
      {b.palabras.map((w, i) => {
        const on = w === activa;
        return (
          <React.Fragment key={i}>
            {i ? " " : ""}
            <span style={on ? (claro ? { background: P.yellow, borderRadius: 10, padding: "0 8px", boxDecorationBreak: "clone" } : { color: P.yellow }) : undefined}>{w.text}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Video005: React.FC<{ timeline: V005Timeline; reviewNotice?: string; showSafeArea?: boolean }> = ({ timeline, reviewNotice, showSafeArea }) => {
  const f = useCurrentFrame();
  const { isStudio } = getRemotionEnvironment();
  const escena = timeline.scenes.find((s) => f >= s.startFrame && f < s.startFrame + s.durationInFrames) ?? timeline.scenes[timeline.scenes.length - 1];
  const claro = escena.modo === "motion";
  const cli = timeline.scenes.find((s) => s.tipo === "cli");
  return (
    <AbsoluteFill translate="no" className="notranslate" style={{ backgroundColor: P.ink }}>
      {timeline.scenes.map((s) => {
        const Comp = ESCENAS[s.tipo];
        const dur = s.durationInFrames;
        return (
          <Sequence key={s.id} from={s.startFrame} durationInFrames={dur} premountFor={30} name={`${s.id} · ${s.tipo}`}>
            {s.modo === "presentador" ? (
              // plano medio de la toma; empuje muy lento (1 → 1,035) centrado en la cara
              <AbsoluteFill style={{ transformOrigin: "540px 660px", transform: `scale(${interpolate(f, [s.startFrame, s.startFrame + dur], [1, 1.035], clamp)})` }}>
                <OffthreadVideo src={staticFile(timeline.source.video)} trimBefore={s.startFrame} muted style={{ width: 1080, height: 1920 }} />
              </AbsoluteFill>
            ) : (
              <FondoSoft />
            )}
            {s.modo === "presentador" ? <AbsoluteFill style={{ background: "linear-gradient(transparent 58%, rgba(0,0,0,0.5))" }} /> : null}
            {/* corte seco con desenfoque corto (≤ 6 f, guion §3.3) al entrar en cada escena de motion */}
            <AbsoluteFill style={s.modo === "motion" ? { filter: `blur(${interpolate(f - s.startFrame, [0, 6], [10, 0], clamp)}px)`, opacity: interpolate(f - s.startFrame, [0, 4], [0.4, 1], clamp) } : undefined}>
              {Comp ? <Comp f={f} s={s} /> : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {cli ? <ListoBadge f={f} at={cli.beats.listo} /> : null}
      <LecturaActiva f={f} read={timeline.captions.read} claro={claro} />
      <TypeCaptions
        variant="texture"
        read={[]}
        emphasis={timeline.captions.emphasis}
        fontFamily={FONT}
        readY={1438}
        emphasisY={1480}
        emphasisAnchor="bottom"
        left={SAFE.left}
        width={SAFE.railX - SAFE.left}
        sizes={{ s: 66, m: 96, l: 128, xl: 160 }}
        textures={{ pink: staticFile("video-001/v3/texture-pink.jpg"), red: staticFile("video-001/v3/texture-red.jpg") }}
        colors={{ pink: "#f4c0ca", red: "#ff4b2e" }}
      />
      <Html5Audio src={staticFile(timeline.audio.dialogue)} />
      {timeline.audio.sfx ? <Html5Audio src={staticFile(timeline.audio.sfx)} /> : null}
      {timeline.audio.music ? <Html5Audio src={staticFile(timeline.audio.music)} /> : null}
      {showSafeArea ? (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 70 }}>
          <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, border: "3px dashed #E1062C" }} />
          <div style={{ position: "absolute", left: SAFE.railX, top: SAFE.railFromY, right: 0, height: SAFE.bottom - SAFE.railFromY, background: "rgba(225,6,44,0.25)" }} />
        </AbsoluteFill>
      ) : null}
      {reviewNotice && isStudio ? (
        <div style={{ position: "absolute", top: 18, left: 24, right: 24, textAlign: "center", fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 1, color: P.ink, background: P.yellowSoft, border: `1px solid ${P.yellow}`, padding: "8px 18px", borderRadius: 8, pointerEvents: "none", zIndex: 60 }}>{reviewNotice}</div>
      ) : null}
    </AbsoluteFill>
  );
};
