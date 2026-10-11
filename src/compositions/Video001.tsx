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

interface Support {
  label: string;
  image: string;
  inS: number;
  outS: number;
}

// Tiempos tomados del video real (ver video-orders/VIDEO-001.json)
export const SUPPORTS: Support[] = [
  { label: "Trípode NEEWER", image: "video-001/support/tripod.jpg", inS: 4.5, outS: 9.2 },
  { label: "Luz RGB portátil", image: "video-001/support/rgb-light.jpg", inS: 9.4, outS: 14.0 },
  { label: "Cable USB-C 10ft", image: "video-001/support/usbc-cable.jpg", inS: 14.5, outS: 16.8 },
  { label: "Kit de luz + softbox", image: "video-001/support/softbox-kit.jpg", inS: 17.5, outS: 29.5 },
];

export const VIDEO_001_FRAMES = s(32.625);

// Layout del boceto: recuadro pequeño a la derecha, a media altura, texto debajo.
const SupportCard: React.FC<{ label: string; image: string; duration: number }> = ({
  label,
  image,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const enter = spring({ frame, fps, config: theme.motion.springConfig });
  const exit = interpolate(frame, [duration - 8, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  return (
    <div
      style={{
        position: "absolute",
        right: 90,
        top: 620,
        width: 300,
        opacity,
        transform: `translateX(${interpolate(enter, [0, 1], [60, 0])}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: 24,
          overflow: "hidden",
          background: "#ffffff",
          border: `3px solid ${theme.colors.surfaceBorder}`,
          boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
        }}
      >
        <Img src={staticFile(image)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div
        style={{
          padding: "8px 18px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.65)",
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.headingFontFamily,
          fontSize: 30,
          fontWeight: 800,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Video001: React.FC = () => (
  <PresetProvider preset="editorial-dynamic">
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile("video-001/unboxin.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {SUPPORTS.map((sp) => (
        <Sequence key={sp.label} from={s(sp.inS)} durationInFrames={s(sp.outS - sp.inS)} layout="none">
          <SupportCard label={sp.label} image={sp.image} duration={s(sp.outS - sp.inS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  </PresetProvider>
);
