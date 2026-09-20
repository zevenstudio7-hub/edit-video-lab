import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { usePresetTheme } from "../presets";

export interface HighlightWordProps {
  children: React.ReactNode;
  variant?: "pill" | "marker" | "glow" | "box";
  color?: string;
  textColor?: string;
  active?: boolean;
  delayFrames?: number;
  style?: React.CSSProperties;
}

export const HighlightWord: React.FC<HighlightWordProps> = ({
  children,
  variant = "pill",
  color,
  textColor,
  active = true,
  delayFrames = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const highlightColor = color || theme.colors.highlightBg;
  const highlightTextColor = textColor || theme.colors.highlightText;

  const currentDelayFrame = Math.max(0, frame - delayFrames);

  const entrance = spring({
    frame: currentDelayFrame,
    fps,
    config: theme.motion.springConfig,
  });

  if (!active) {
    return <span style={style}>{children}</span>;
  }

  if (variant === "marker") {
    const widthPercent = interpolate(entrance, [0, 1], [0, 100], {
      extrapolateRight: "clamp",
    });

    return (
      <span
        style={{
          position: "relative",
          display: "inline-block",
          padding: "0 6px",
          color: "inherit",
          ...style,
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: "8%",
            height: "40%",
            width: `${widthPercent}%`,
            backgroundColor: highlightColor,
            opacity: 0.85,
            borderRadius: "4px",
            zIndex: 0,
          }}
        />
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      </span>
    );
  }

  if (variant === "glow") {
    const scale = interpolate(entrance, [0, 1], [0.92, 1]);
    const glowOpacity = interpolate(entrance, [0, 1], [0, 1]);

    return (
      <span
        style={{
          display: "inline-block",
          color: highlightColor,
          transform: `scale(${scale})`,
          textShadow: `0 0 24px ${highlightColor}`,
          fontWeight: 700,
          opacity: glowOpacity,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  if (variant === "box") {
    const scale = interpolate(entrance, [0, 1], [0.85, 1]);
    return (
      <span
        style={{
          display: "inline-block",
          border: `2px solid ${highlightColor}`,
          padding: "4px 14px",
          borderRadius: `${theme.styling.borderRadius}px`,
          color: highlightColor,
          transform: `scale(${scale})`,
          backgroundColor: `${highlightColor}18`,
          fontWeight: 600,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  // Default: "pill"
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: highlightColor,
        color: highlightTextColor,
        padding: "4px 16px",
        borderRadius: "9999px",
        transform: `scale(${scale})`,
        fontWeight: 700,
        boxShadow: `0 4px 18px ${highlightColor}44`,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
