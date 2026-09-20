import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { usePresetTheme } from "../presets";

export interface SceneTransitionProps {
  children: React.ReactNode;
  type?: "fade" | "slide-left" | "slide-up" | "zoom" | "wipe";
  timing?: "in" | "out" | "both";
  durationInFrames?: number;
  totalSceneFrames?: number;
  style?: React.CSSProperties;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  type = "fade",
  timing = "in",
  durationInFrames = 15,
  totalSceneFrames,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: videoDuration } = useVideoConfig();
  const theme = usePresetTheme();

  const sceneDuration = totalSceneFrames || videoDuration;

  // In-transition
  const inSpring = spring({
    frame,
    fps,
    config: theme.motion.springConfig,
    durationInFrames,
  });

  // Out-transition
  const outStart = sceneDuration - durationInFrames;
  const isOutPhase = frame >= outStart;
  const outFrame = Math.max(0, frame - outStart);
  const outSpring = spring({
    frame: outFrame,
    fps,
    config: theme.motion.springConfig,
    durationInFrames,
  });

  let opacity = 1;
  let transform = "";

  // Handle Entrance
  if (timing === "in" || timing === "both") {
    switch (type) {
      case "fade":
        opacity = interpolate(inSpring, [0, 1], [0, 1]);
        break;
      case "slide-left":
        transform = `translateX(${interpolate(inSpring, [0, 1], [120, 0])}px)`;
        opacity = interpolate(inSpring, [0, 1], [0, 1]);
        break;
      case "slide-up":
        transform = `translateY(${interpolate(inSpring, [0, 1], [100, 0])}px)`;
        opacity = interpolate(inSpring, [0, 1], [0, 1]);
        break;
      case "zoom":
        transform = `scale(${interpolate(inSpring, [0, 1], [0.88, 1])})`;
        opacity = interpolate(inSpring, [0, 1], [0, 1]);
        break;
      case "wipe":
        opacity = interpolate(inSpring, [0, 1], [0, 1]);
        transform = `scale(${interpolate(inSpring, [0, 1], [0.95, 1])})`;
        break;
    }
  }

  // Handle Exit
  if ((timing === "out" || timing === "both") && isOutPhase) {
    switch (type) {
      case "fade":
        opacity = interpolate(outSpring, [0, 1], [1, 0]);
        break;
      case "slide-left":
        transform = `translateX(${interpolate(outSpring, [0, 1], [0, -120])}px)`;
        opacity = interpolate(outSpring, [0, 1], [1, 0]);
        break;
      case "slide-up":
        transform = `translateY(${interpolate(outSpring, [0, 1], [0, -100])}px)`;
        opacity = interpolate(outSpring, [0, 1], [1, 0]);
        break;
      case "zoom":
        transform = `scale(${interpolate(outSpring, [0, 1], [1, 1.1])})`;
        opacity = interpolate(outSpring, [0, 1], [1, 0]);
        break;
      case "wipe":
        opacity = interpolate(outSpring, [0, 1], [1, 0]);
        break;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity,
        transform,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
