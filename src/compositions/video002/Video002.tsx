import React from "react";
// Voz, efectos y música con Html5Audio (un <audio> por pista): con <Audio> de @remotion/media el Studio programaba las
// pistas largas dos veces (ver formatos/edit-2-pantalla-dividida/FORMATO.md).
import { AbsoluteFill, Easing, getRemotionEnvironment, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { PresenterCamera } from "../../../library/recipes/PresenterCamera";
import { TypeCaptions, type EmphasisBlock, type ReadChunk } from "../../../library/recipes/TypeCaptions";
import { clamp, FONT, P } from "./ui";
import { SCENES } from "./scenes";
import { BandCtx, EDGE } from "./band";
import { ReliefDefs } from "./relief";

// VIDEO-002 · #edit-1-motion («RSS - Entretenimiento», Muse for Small Business). Todo sale de
// video-orders/VIDEO-002.json → timeline (src/videoAnalysis/video002/buildTimeline.mjs): el presentador se alterna con
// motion a pantalla completa mientras la voz montada (una sola pista continua) sigue debajo. El motion vive sobre una
// franja negra sólida (band.tsx) que aparece al entrar desde el presentador y se mantiene mientras se encadenan escenas
// de motion; los subtítulos van dentro de ella.

/** Área segura de Instagram Reels (orgánico): ver formatos/identidad-video-zeven.md. */
export const SAFE = { top: 250, bottom: 1500, left: 65, right: 1015, railX: 940, railFromY: 1000 } as const;
/** Subtítulos con el estilo de la identidad (lectura blanca; énfasis con textura rosa/roja). */
const CAPTION_COLORS = { pink: "#f4c0ca", red: "#ff4b2e" };

export interface V002Timeline {
  fps: number;
  durationInFrames: number;
  source: { width: number; height: number };
  audio: { dialogue: string; sfx?: string; music?: string; finalFrame: number };
  cuts: { id: string; toma: string; source: string; startFrame: number; durationInFrames: number; trimBefore: number; playbackRate?: number }[];
  /** Velocidad global (1.1 = 10 % más rápido); los frames de la timeline ya están en la velocidad final. */
  speed?: number;
  scenes: { id: string; modo: "presentador" | "motion"; tipo: string; startFrame: number; durationInFrames: number; beats: Record<string, number> }[];
  camera: { foco: { x: number; y: number }; presentador: Record<string, { de: number; a: number; desde: number; hasta: number }> };
  captions: { read: ReadChunk[]; emphasis: EmphasisBlock[] };
}

const SafeAreaGuide: React.FC = () => {
  const band = (style: React.CSSProperties, key: string) => <div key={key} style={{ position: "absolute", background: "rgba(225,6,44,0.28)", ...style }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 70 }}>
      {band({ left: 0, right: 0, top: 0, height: SAFE.top }, "t")}
      {band({ left: 0, right: 0, top: SAFE.bottom, bottom: 0 }, "b")}
      {band({ left: 0, width: SAFE.left, top: SAFE.top, height: SAFE.bottom - SAFE.top }, "l")}
      {band({ left: SAFE.right, right: 0, top: SAFE.top, height: SAFE.railFromY - SAFE.top }, "r")}
      {band({ left: SAFE.railX, right: 0, top: SAFE.railFromY, height: SAFE.bottom - SAFE.railFromY }, "rail")}
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, border: "3px dashed #E1062C" }} />
    </AbsoluteFill>
  );
};

export const Video002: React.FC<{ timeline: V002Timeline; reviewNotice?: string; showSafeArea?: boolean }> = ({ timeline, reviewNotice, showSafeArea }) => {
  const frame = useCurrentFrame();
  const { isStudio } = getRemotionEnvironment();
  const W = timeline.source.width, H = timeline.source.height;
  const scene = timeline.scenes.find((s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames) ?? timeline.scenes[timeline.scenes.length - 1];
  const presenterScenes = timeline.scenes.filter((s) => s.modo === "presentador");
  // escala de cámara del presentador en el frame actual (100 % base; acercamientos a 108 %)
  const cam = timeline.camera.presentador[scene.id];
  const scale = cam ? interpolate(frame, [cam.desde, Math.max(cam.desde + 1, cam.hasta)], [cam.de, cam.a], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.2, 1) }) : 1;
  const motion = scene.modo === "motion";
  // borde de la franja en un frame global: sube desde abajo al entrar desde el presentador y luego queda fijo
  const bandEdge = (g: number) => {
    const i = timeline.scenes.findIndex((s) => g >= s.startFrame && g < s.startFrame + s.durationInFrames);
    const s = timeline.scenes[i];
    if (!s || s.modo !== "motion") return 1920;
    const prev = timeline.scenes[i - 1];
    if (prev && prev.modo === "motion") return EDGE;
    return interpolate(g - s.startFrame, [0, 8], [1920, EDGE], { ...clamp, easing: Easing.out(Easing.cubic) });
  };
  const edge = bandEdge(frame);
  return (
    // translate="no": el traductor automático del navegador cambiaba los textos de la vista previa del Studio
    // («Muse» → «Musa», «Shopify» → «Tienda», «Notion» → «Noción»); el render no se ve afectado
    <AbsoluteFill translate="no" className="notranslate" style={{ backgroundColor: P.ink }}>
      {/* presentador: solo los tramos de los planos que caen en escenas de presentador */}
      {presenterScenes.flatMap((s) =>
        timeline.cuts
          .filter((c) => c.startFrame < s.startFrame + s.durationInFrames && c.startFrame + c.durationInFrames > s.startFrame)
          .map((c) => {
            const from = Math.max(c.startFrame, s.startFrame);
            const to = Math.min(c.startFrame + c.durationInFrames, s.startFrame + s.durationInFrames);
            // la fuente avanza a la velocidad del plano: un frame de la timeline consume `rate` frames de la toma
            const rate = c.playbackRate ?? 1;
            const trimBefore = c.trimBefore + Math.round((from - c.startFrame) * rate);
            return (
              <Sequence key={`${s.id}-${c.id}`} from={from} durationInFrames={to - from} premountFor={30} name={`${s.id} · ${c.id} (toma ${c.toma})`}>
                <PresenterCamera
                  shot={{ src: staticFile(c.source), trimBefore, trimAfter: trimBefore + Math.ceil((to - from) * rate) + 2, durationInFrames: to - from, playbackRate: rate, scale: 1, focus: { x: timeline.camera.foco.x * W, y: timeline.camera.foco.y * H }, scaleOverride: scale, muted: true }}
                  sourceWidth={W} sourceHeight={H} zoneWidth={1080} zoneHeight={1920}
                  target={timeline.camera.foco}
                />
              </Sequence>
            );
          }),
      )}
      {/* contraste de subtítulos sobre el presentador */}
      {!motion ? <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,0.55))", pointerEvents: "none" }} /> : null}
      {/* escenas: lo que va junto al presentador y el motion a pantalla completa */}
      <ReliefDefs />
      {timeline.scenes.map((s, i) => {
        const Scene = SCENES[s.tipo];
        if (!Scene) return null;
        const b = Object.fromEntries(Object.entries(s.beats).map(([k, v]) => [k, v - s.startFrame]));
        const next = timeline.scenes[i + 1];
        return (
          <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames} premountFor={20} name={`${s.id} · ${s.tipo}`}>
            <BandCtx.Provider value={{ edgeAt: (lf) => bandEdge(s.startFrame + lf), sink: s.modo === "motion" && next?.modo === "motion", dur: s.durationInFrames }}>
              <Scene b={b} dur={s.durationInFrames} />
            </BandCtx.Provider>
          </Sequence>
        );
      })}
      {/* en el motion los subtítulos viven dentro de la franja: se recortan a ella y salen con ella cuando sube */}
      <div style={{ position: "absolute", inset: 0, clipPath: motion ? `inset(${edge}px 0 0 0)` : undefined, pointerEvents: "none" }}>
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
      </div>
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
