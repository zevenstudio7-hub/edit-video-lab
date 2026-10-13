import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PresetProvider, usePresetTheme } from "../presets";
import "../styles/global.css";

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

interface Beat {
  es: string;
  en: string;
  image: string;
  inS: number;
  outS: number;
}

// Imagenes CC0, fuentes en video-orders/VIDEO-002.json
const BEATS: Beat[] = [
  { es: "Graba", en: "Record", image: "video-002/support/camera.jpg", inS: 0.2, outS: 1.7 },
  { es: "Edita", en: "Edit", image: "video-002/support/editing.jpg", inS: 1.7, outS: 3.2 },
  { es: "Conecta", en: "Connect", image: "video-002/support/podcast.jpg", inS: 3.2, outS: 4.7 },
];

export const VIDEO_002_FRAMES = s(4.833);

const BeatCard: React.FC<{ beat: Beat; duration: number }> = ({ beat, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const enter = spring({ frame, fps, config: theme.motion.springConfig });
  const exit = interpolate(frame, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <div
        style={{
          width: 480,
          height: 320,
          borderRadius: 28,
          overflow: "hidden",
          border: `3px solid ${theme.colors.surfaceBorder}`,
          boxShadow: "0 16px 44px rgba(0,0,0,0.5)",
        }}
      >
        <Img src={staticFile(beat.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div
        style={{
          padding: "10px 26px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.7)",
          fontFamily: theme.typography.headingFontFamily,
          color: theme.colors.textPrimary,
          fontSize: 38,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        {beat.es}
        <span style={{ fontWeight: 500, opacity: 0.7, fontSize: 28 }}> · {beat.en}</span>
      </div>
    </div>
  );
};

const TopChip: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = usePresetTheme();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", opacity }}>
      <div
        style={{
          padding: "12px 30px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.6)",
          border: `2px solid ${theme.colors.surfaceBorder}`,
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.headingFontFamily,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        CREACIÓN DE CONTENIDO
        <span style={{ fontWeight: 500, opacity: 0.7, fontSize: 24 }}> · Content creation</span>
      </div>
    </div>
  );
};

export const Video002: React.FC = () => (
  <PresetProvider preset="editorial-dynamic">
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile("video-002/escribenos.mp4")}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <TopChip />
      {BEATS.map((b) => (
        <Sequence key={b.es} from={s(b.inS)} durationInFrames={s(b.outS - b.inS)} layout="none">
          <BeatCard beat={b} duration={s(b.outS - b.inS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  </PresetProvider>
);
