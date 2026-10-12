import React from "react";
// Diálogo y efectos con Html5Audio (núcleo de Remotion, un <audio> por pista): con <Audio> de @remotion/media la
// vista previa del Studio programaba la pista larga dos veces y la voz se oía duplicada.
import { AbsoluteFill, getRemotionEnvironment, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/InterTight";
import { PresenterCamera } from "../../../library/recipes/PresenterCamera";
import { TypeCaptions, type EmphasisBlock, type ReadChunk } from "../../../library/recipes/TypeCaptions";
import { cameraScaleAt, topHeightAt, type CameraEvent, type LayoutEvent, type LayoutMode } from "../../../library/recipes/tracks";
import { brandBackground, type Palette } from "./kit";
import { SCENES } from "./scenes";

// VIDEO-001 · candidata V3 (preset experimental «reel-editorial-reforzado», #edit-2) con identidad ZevenPRO. Todo
// sale de video-orders/VIDEO-001.json → candidatoV3.timeline (src/videoAnalysis/buildEditV3.mjs). La v2 no cambia.
const { fontFamily } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] });

/**
 * Área segura de Instagram Reels (orgánico, 1080×1920): fuera de ella van solo fondos y video.
 *  - arriba 250 px (cabecera «Reels», cámara, nombre de la cuenta);
 *  - abajo 420 px (usuario, pie de foto, audio);
 *  - lados 65 px (6 %);
 *  - columna de iconos a la derecha: nada a la derecha de x = 940 por debajo de y = 1000.
 * Meta solo publica márgenes para anuncios (14 % arriba, 35 % abajo, 6 % lados): más estrictos que estos.
 */
export const SAFE = { top: 250, bottom: 1500, left: 65, right: 1015, railX: 940, railFromY: 1000 } as const;

/** Colores de los subtítulos de la versión anterior (no siguen la paleta de marca de los gráficos). */
const CAPTION_COLORS = { pink: "#f4c0ca", red: "#ff4b2e" };

export interface V3Timeline {
  fps: number;
  durationInFrames: number;
  source: { width: number; height: number };
  palette: Palette;
  cuts: { id: string; block: string; source: string; startFrame: number; durationInFrames: number; trimBefore: number; trimAfter: number; text: string; playbackRate?: number }[];
  /** Velocidad global (1.1 = 10 % más rápido); los frames de la timeline ya están en la velocidad final. */
  speed?: number;
  camera: { base: { scale: number; focus: { x: number; y: number } }; events: CameraEvent[] };
  layout: { base: { mode: LayoutMode; topHeight: number }; events: LayoutEvent[] };
  scenes: { id: string; scene: string; startFrame: number; durationInFrames: number; beats: Record<string, number>; props: Record<string, unknown> }[];
  captions: { read: ReadChunk[]; emphasis: EmphasisBlock[] };
  audio: { dialogue?: string; dialogueVolume?: number; sfxBed?: string; sfxVolume?: number };
  cta?: { startFrame: number; clickFrame: number; label: string };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

const Cta: React.FC<{ cta: NonNullable<V3Timeline["cta"]>; p: Palette }> = ({ cta, p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < cta.startFrame) return null;
  const enter = spring({ frame: frame - cta.startFrame, fps, config: { damping: 14, stiffness: 160 } });
  const press = spring({ frame: frame - cta.clickFrame, fps, config: { damping: 10, stiffness: 260 } });
  const pressed = frame >= cta.clickFrame;
  const cursor = interpolate(frame, [cta.startFrame + 6, cta.clickFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    // en el pecho, entre la barbilla y el subtítulo: a pantalla completa la cabeza ocupa la parte alta del área segura
    <div style={{ position: "absolute", left: SAFE.left, width: SAFE.railX - SAFE.left, top: 1170, display: "flex", justifyContent: "center", zIndex: 45, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
      <div style={{ position: "relative" }}>
        <div
          style={{
            fontFamily, fontWeight: 900, fontSize: 50, padding: "16px 52px", borderRadius: 999,
            background: pressed ? p.ink : p.yellow, color: pressed ? p.yellow : p.ink, border: `2px solid ${p.ink}`,
            transform: `scale(${pressed ? 1 - 0.08 * (1 - press) : 1})`, boxShadow: "0 12px 30px rgba(23,23,29,0.22)",
          }}
        >
          {pressed ? `${cta.label} ✓` : cta.label}
        </div>
        <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: "absolute", left: interpolate(cursor, [0, 1], [250, 150]), top: interpolate(cursor, [0, 1], [120, 40]), opacity: cursor > 0 ? 1 : 0 }}>
          <path d="M4 2 L4 19 L8.5 14.8 L11.6 21.5 L14.3 20.3 L11.2 13.7 L17.5 13.5 Z" fill={p.ink} stroke={p.card} strokeWidth={1.2} />
        </svg>
      </div>
    </div>
  );
};

/** Guía de revisión: zonas que Instagram tapa (solo con showSafeArea). */
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

export const Video001V3: React.FC<{ timeline: V3Timeline; reviewNotice?: string; showSafeArea?: boolean }> = ({ timeline, reviewNotice, showSafeArea }) => {
  const frame = useCurrentFrame();
  const { palette: p } = timeline;
  const top = topHeightAt(frame, timeline.layout.base, timeline.layout.events);
  const presenterH = 1920 - top;
  const scale = cameraScaleAt(frame, timeline.camera.base.scale, timeline.camera.events);
  const split = timeline.layout.base.topHeight;
  // rectángulo de contenido gráfico: dentro del área segura y por encima de la franja de subtítulos
  const contentBottom = Math.min(top - 24, 1250);
  const content = { x: SAFE.left, y: SAFE.top, w: SAFE.right - SAFE.left, h: Math.max(0, contentBottom - SAFE.top) };
  // encuadre del presentador: a pantalla completa la cara queda a ~0,42 del alto; en split sube (~0,25 de su zona)
  // para que la barbilla quede por encima de la franja de subtítulos (≈1250–1480)
  const targetY = lerp(0.42, 0.25, top / split);
  const dialogue = timeline.audio.dialogue;
  const sfxBed = timeline.audio.sfxBed;
  const { isStudio } = getRemotionEnvironment();
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: top, overflow: "hidden", ...brandBackground(p) }}>
        <div style={{ position: "absolute", left: content.x, top: content.y, width: content.w, height: content.h }}>
          {content.h > 40
            ? timeline.scenes.map((s) => {
                const Scene = SCENES[s.scene];
                if (!Scene) return null;
                return (
                  <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames} premountFor={30} name={`Escena ${s.id} · ${s.scene}`}>
                    <AbsoluteFill style={{ opacity: interpolate(frame - s.startFrame, [0, 5], [0, 1], { extrapolateRight: "clamp" }) }}>
                      <Scene beats={s.beats} props={s.props} palette={p} font={fontFamily} w={content.w} h={content.h} durationInFrames={s.durationInFrames} />
                    </AbsoluteFill>
                  </Sequence>
                );
              })
            : null}
        </div>
        {/* gráfico a pantalla completa: sombra inferior bajo la franja de subtítulos (los subtítulos blancos de la
            versión anterior necesitan contraste sobre el fondo claro); solo aparece cuando la zona gráfica la cubre */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1150, height: 770, background: "linear-gradient(transparent, rgba(17,18,22,0.62) 55%, rgba(17,18,22,0.7))", opacity: interpolate(top, [1250, 1600], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), pointerEvents: "none" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top, width: 1080, height: presenterH, overflow: "hidden", background: p.ink }}>
        {presenterH > 1
          ? timeline.cuts.map((c) => (
              <Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationInFrames} premountFor={45} name={`${c.id} · ${c.block}`}>
                <PresenterCamera
                  shot={{ src: staticFile(c.source), trimBefore: c.trimBefore, trimAfter: c.trimAfter + 2, durationInFrames: c.durationInFrames, scale: 1, focus: timeline.camera.base.focus, scaleOverride: scale, muted: true, playbackRate: c.playbackRate ?? 1 }}
                  sourceWidth={timeline.source.width} sourceHeight={timeline.source.height} zoneWidth={1080} zoneHeight={presenterH}
                  target={{ x: 0.5, y: targetY }}
                />
              </Sequence>
            ))
          : null}
        {/* degradado inferior de la versión anterior: da contraste a los subtítulos blancos */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 55%, rgba(0,0,0,0.55))", pointerEvents: "none" }} />
      </div>
      {top > 2 && top < 1918 ? <div style={{ position: "absolute", left: 0, right: 0, top: top - 2, height: 5, background: p.yellow }} /> : null}
      {/* subtítulos con su estilo anterior (lectura blanca sin caja; énfasis con textura rosa/roja), sin la paleta de
          marca; solo se recolocan dentro del área segura: lectura centrada en 1438, énfasis apoyado en 1480, ancho hasta x = 940 */}
      <TypeCaptions
        variant="texture"
        read={timeline.captions.read} emphasis={timeline.captions.emphasis} fontFamily={fontFamily}
        readY={1438} emphasisY={1480} emphasisAnchor="bottom" left={SAFE.left} width={SAFE.railX - SAFE.left}
        sizes={{ s: 66, m: 96, l: 128, xl: 160 }}
        textures={{ pink: staticFile("video-001/v3/texture-pink.jpg"), red: staticFile("video-001/v3/texture-red.jpg") }}
        colors={CAPTION_COLORS}
      />
      {timeline.cta ? <Cta cta={timeline.cta} p={p} /> : null}
      {dialogue ? <Html5Audio src={staticFile(dialogue)} volume={timeline.audio.dialogueVolume ?? 1} /> : null}
      {sfxBed ? <Html5Audio src={staticFile(sfxBed)} volume={timeline.audio.sfxVolume ?? 1} /> : null}
      {showSafeArea ? <SafeAreaGuide /> : null}
      {reviewNotice && isStudio ? (
        <div style={{ position: "absolute", top: 18, left: 24, right: 24, textAlign: "center", fontFamily: "Arial, sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: 1, color: p.ink, background: p.yellowSoft, border: `1px solid ${p.yellow}`, padding: "8px 18px", borderRadius: 8, pointerEvents: "none", zIndex: 60 }}>{reviewNotice}</div>
      ) : null}
    </AbsoluteFill>
  );
};
