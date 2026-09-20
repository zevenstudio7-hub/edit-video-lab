import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS, TYPOGRAPHY } from "../lib/tokens";
import { usePresetTheme } from "../presets";

export interface MediaFrameProps {
  children?: React.ReactNode;
  src?: string;
  type?: "image" | "video";
  title?: string;
  caption?: string;
  aspectRatio?: "16/9" | "9/16" | "1/1" | "4/3";
  glow?: boolean;
  entryFrame?: number;
  width?: number | string;
  style?: React.CSSProperties;
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  children,
  src,
  type = "image",
  title,
  caption,
  aspectRatio = "16/9",
  glow = true,
  entryFrame = 0,
  width = "100%",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const activeFrame = Math.max(0, frame - entryFrame);
  const entrance = spring({
    frame: activeFrame,
    fps,
    config: theme.motion.springConfig,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const scale = interpolate(entrance, [0, 1], [0.94, 1]);

  const getAspectRatioValue = () => {
    switch (aspectRatio) {
      case "9/16":
        return "9 / 16";
      case "1/1":
        return "1 / 1";
      case "4/3":
        return "4 / 3";
      case "16/9":
      default:
        return "16 / 9";
    }
  };

  return (
    <div
      style={{
        maxWidth: `${SAFE_AREAS.safeWidth}px`,
        width: typeof width === "number" ? `${width}px` : width,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: getAspectRatioValue(),
          borderRadius: `${theme.styling.cardRadius}px`,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#0d1117",
          border: `${theme.styling.cardBorderWidth}px solid ${theme.colors.surfaceBorder}`,
          boxShadow: glow ? theme.styling.shadow : "0 12px 36px rgba(0, 0, 0, 0.5)",
        }}
      >
        {src ? (
          type === "image" ? (
            <img
              src={src}
              alt={title || "media"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <video
              src={src}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
            />
          )
        ) : (
          children
        )}
      </div>

      {(title || caption) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "0 8px",
          }}
        >
          {title && (
            <div
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.headingFontFamily,
                fontSize: `${TYPOGRAPHY.sizes.sm}px`,
                fontWeight: 700,
                letterSpacing: theme.typography.letterSpacing,
              }}
            >
              {title}
            </div>
          )}
          {caption && (
            <div
              style={{
                color: theme.colors.textMuted,
                fontFamily: theme.typography.fontFamily,
                fontSize: `${TYPOGRAPHY.sizes.xs}px`,
                fontWeight: 500,
              }}
            >
              {caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
