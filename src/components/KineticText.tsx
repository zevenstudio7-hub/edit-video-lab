import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { usePresetTheme } from "../presets";

export interface KineticTextProps {
  text: string;
  animation?: "slide-up" | "pop" | "blur-in" | "fade";
  splitBy?: "words" | "chars";
  delayFrames?: number;
  staggerFrames?: number;
  fontSize?: number;
  color?: string;
  gradient?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  style?: React.CSSProperties;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  animation = "slide-up",
  splitBy = "words",
  delayFrames = 0,
  staggerFrames,
  fontSize = 54,
  color,
  gradient,
  align = "center",
  lineHeight = 1.15,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const stagger = staggerFrames ?? theme.motion.staggerFrames;
  const elements = splitBy === "words" ? text.split(" ") : text.split("");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        alignItems: "center",
        textAlign: align,
        fontFamily: theme.typography.headingFontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        lineHeight,
        letterSpacing: theme.typography.titleLetterSpacing,
        color: color || theme.colors.textPrimary,
        ...style,
      }}
    >
      {elements.map((el, i) => {
        const itemDelay = delayFrames + i * stagger;
        const currentFrame = Math.max(0, frame - itemDelay);

        const progress = spring({
          frame: currentFrame,
          fps,
          config: theme.motion.springConfig,
        });

        let transform = "";
        let opacity = 1;
        let filter = "none";

        switch (animation) {
          case "slide-up": {
            const translateY = interpolate(progress, [0, 1], [60, 0]);
            opacity = interpolate(progress, [0, 1], [0, 1]);
            transform = `translateY(${translateY}px)`;
            break;
          }
          case "pop": {
            const scale = interpolate(progress, [0, 1], [0.4, 1]);
            opacity = interpolate(progress, [0, 1], [0, 1]);
            transform = `scale(${scale})`;
            break;
          }
          case "blur-in": {
            const blur = interpolate(progress, [0, 1], [16, 0]);
            opacity = interpolate(progress, [0, 1], [0, 1]);
            const scale = interpolate(progress, [0, 1], [1.15, 1]);
            transform = `scale(${scale})`;
            filter = `blur(${blur}px)`;
            break;
          }
          case "fade":
          default: {
            opacity = interpolate(progress, [0, 1], [0, 1]);
            break;
          }
        }

        const isWord = splitBy === "words";

        return (
          <span
            key={`${el}-${i}`}
            style={{
              display: "inline-block",
              opacity,
              transform,
              filter,
              marginRight: isWord ? "0.28em" : "0.01em",
              background: gradient || undefined,
              WebkitBackgroundClip: gradient ? "text" : undefined,
              WebkitTextFillColor: gradient ? "transparent" : undefined,
              willChange: "transform, opacity",
            }}
          >
            {el === " " ? "\u00A0" : el}
          </span>
        );
      })}
    </div>
  );
};
