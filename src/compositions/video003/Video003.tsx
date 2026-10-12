import React from "react";
// Voz, efectos y música con Html5Audio (un <audio> por pista), como VIDEO-002.
import { AbsoluteFill, Easing, getRemotionEnvironment, Html5Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TypeCaptions, type EmphasisBlock, type ReadChunk } from "../../../library/recipes/TypeCaptions";
import { FONT, P } from "../video002/ui";
import { SAFE } from "../video002/Video002";
import { CamCtx, type Cam } from "./kit";
import { BLOQUES, type Escena } from "./scenes";

// VIDEO-003 · #edit-1-motion («La guerra de la IA empezó»). Todo sale de video-orders/VIDEO-003.json → timeline
// (src/videoAnalysis/video003/buildTimeline.mjs). El presentador es el plano principal durante toda la pieza: no hay
// pantalla dividida, paneles ni B-roll. Capas, de atrás hacia delante:
//   plano original → gráficos «detrás» → presentador recortado (alfa, Apple Vision) → rótulos «delante» → subtítulos.
// Los subtítulos conservan exactamente la receta y la posición de VIDEO-002 (TypeCaptions «texture», lectura en
// y = 1438, énfasis apoyado en y = 1480); ningún gráfico baja de y ≈ 960.

export interface V003Timeline {
  fps: number;
  durationInFrames: number;
  source: { width: number; height: number; fps: number };
  audio: { dialogue: string; sfx?: string; music?: string };
  cuts: { id: string; source: string; alpha: string; startFrame: number; durationInFrames: number; trimBefore: number }[];
  scenes: (Escena & { tipo: string })[];
  camera: { foco: { x: number; y: number }; claves: (number | string)[][] };
  captions: { read: ReadChunk[]; emphasis: EmphasisBlock[] };
}

const CAPTION_COLORS = { pink: "#f4c0ca", red: "#ff4b2e" };

/** Escala de cámara en un frame: claves [frame, escala, 'corte'?]; 'corte' = salto seco en ese frame. */
const escalaEn = (f: number, claves: (number | string)[][]) => {
  const ks = claves.map((k) => ({ f: k[0] as number, s: k[1] as number, corte: k[2] === "corte" }));
  let s = ks[0].s;
  for (let i = 1; i < ks.length; i++) {
    const a = ks[i - 1], b = ks[i];
    if (f >= b.f) { s = b.s; continue; }
    s = b.corte ? a.s : interpolate(f, [a.f, b.f], [a.s, b.s], { easing: Easing.bezier(0.45, 0, 0.2, 1) });
    break;
  }
  return s;
};

const SafeAreaGuide: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 70 }}>
    <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, border: "3px dashed #E1062C" }} />
    <div style={{ position: "absolute", left: SAFE.railX, top: SAFE.railFromY, right: 0, height: SAFE.bottom - SAFE.railFromY, background: "rgba(225,6,44,0.25)" }} />
  </AbsoluteFill>
);

/** Proxies de 540×960 para la vista previa del Studio (dos videos a 1080p, uno VP9 con alfa, iban a la mitad del
 * tiempo real). El render usa siempre los de 1080p. */
const ligero = (src: string) => src.replace("fuente-1080.mp4", "fuente-540.mp4").replace("presentador-alfa.webm", "presentador-alfa-540.webm");

export const Video003: React.FC<{ timeline: V003Timeline; reviewNotice?: string; showSafeArea?: boolean; previewLigero?: boolean }> = ({ timeline, reviewNotice, showSafeArea, previewLigero = true }) => {
  const f = useCurrentFrame();
  const { isStudio } = getRemotionEnvironment();
  const S = Object.fromEntries(timeline.scenes.map((s) => [s.id, s]));
  const cam: Cam = { scale: escalaEn(f, timeline.camera.claves), fx: timeline.camera.foco.x * 1080, fy: timeline.camera.foco.y * 1920 };
  const mundo: React.CSSProperties = { position: "absolute", inset: 0, transformOrigin: `${cam.fx}px ${cam.fy}px`, transform: `scale(${cam.scale})` };
  const planos = (alpha: boolean) =>
    timeline.cuts.map((c) => (
      <Sequence key={`${c.id}-${alpha ? "a" : "v"}`} from={c.startFrame} durationInFrames={c.durationInFrames} premountFor={30} name={`${alpha ? "recorte" : "plano"} ${c.id}`}>
        <OffthreadVideo src={staticFile(isStudio && previewLigero ? ligero(alpha ? c.alpha : c.source) : alpha ? c.alpha : c.source)} trimBefore={c.trimBefore} muted transparent={alpha} style={{ width: 1080, height: 1920 }} />
      </Sequence>
    ));
  return (
    <AbsoluteFill translate="no" className="notranslate" style={{ backgroundColor: P.ink }}>
      <CamCtx.Provider value={cam}>
        <div style={mundo}>
          {planos(false)}
          {BLOQUES.map((B, i) => <B key={i} f={f} S={S} capa="detras" total={timeline.durationInFrames} />)}
          {planos(true)}
        </div>
        {/* contraste de subtítulos sobre el presentador (como VIDEO-002) */}
        <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,0.55))", pointerEvents: "none" }} />
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {BLOQUES.map((B, i) => <B key={i} f={f} S={S} capa="delante" total={timeline.durationInFrames} />)}
        </AbsoluteFill>
      </CamCtx.Provider>
      <TypeCaptions
        variant="texture"
        read={timeline.captions.read}
        emphasis={timeline.captions.emphasis}
        fontFamily={FONT}
        readY={1438}
        emphasisY={1480}
        emphasisAnchor="bottom"
        left={SAFE.left}
        width={SAFE.railX - SAFE.left}
        sizes={{ s: 66, m: 96, l: 128, xl: 160 }}
        textures={{ pink: staticFile("video-001/v3/texture-pink.jpg"), red: staticFile("video-001/v3/texture-red.jpg") }}
        colors={CAPTION_COLORS}
      />
      <Html5Audio src={staticFile(timeline.audio.dialogue)} />
      {timeline.audio.sfx ? <Html5Audio src={staticFile(timeline.audio.sfx)} /> : null}
      {timeline.audio.music ? <Html5Audio src={staticFile(timeline.audio.music)} /> : null}
      {showSafeArea ? <SafeAreaGuide /> : null}
      {reviewNotice && isStudio ? (
        <div style={{ position: "absolute", top: 18, left: 24, right: 24, textAlign: "center", fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 1, color: P.ink, background: P.yellowSoft, border: `1px solid ${P.yellow}`, padding: "8px 18px", borderRadius: 8, pointerEvents: "none", zIndex: 60 }}>{reviewNotice}</div>
      ) : null}
    </AbsoluteFill>
  );
};
