import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface SoftZoomProps {
  children: React.ReactNode;
  fromScale?: number;
  toScale?: number;
  durationInFrames?: number;
  origin?: "center" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  easing?: "linear" | "ease-out" | "ease-in-out";
  style?: React.CSSProperties;
}

export const SoftZoom: React.FC<SoftZoomProps> = ({
  children,
  fromScale = 1.0,
  toScale = 1.08,
  durationInFrames,
  origin = "center",
  easing = "ease-out",
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: videoDuration } = useVideoConfig();

  const totalFrames = durationInFrames || videoDuration;

  let easingFunction = Easing.out(Easing.cubic);
  if (easing === "linear") {
    easingFunction = Easing.linear;
  } else if (easing === "ease-in-out") {
    easingFunction = Easing.inOut(Easing.cubic);
  }

  const scale = interpolate(frame, [0, totalFrames], [fromScale, toScale], {
    easing: easingFunction,
    extrapolateRight: "clamp",
  });

  const getOriginValue = () => {
    switch (origin) {
      case "top":
        return "center top";
      case "bottom":
        return "center bottom";
      case "top-left":
        return "left top";
      case "top-right":
        return "right top";
      case "bottom-left":
        return "left bottom";
      case "bottom-right":
        return "right bottom";
      case "center":
      default:
        return "center center";
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: getOriginValue(),
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};
