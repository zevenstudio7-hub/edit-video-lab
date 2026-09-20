import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS } from "../lib/tokens";
import { usePresetTheme } from "../presets";

export interface PictureInPictureProps {
  children: React.ReactNode;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  width?: number;
  aspectRatio?: "16/9" | "9/16" | "1/1" | "4/3";
  label?: string;
  badge?: string;
  entryFrame?: number;
  style?: React.CSSProperties;
}

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  children,
  position = "bottom-right",
  width = 340,
  aspectRatio = "9/16",
  label,
  badge = "LIVE",
  entryFrame = 0,
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
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case "bottom-left":
        return {
          bottom: `${SAFE_AREAS.bottom + 10}px`,
          left: `${SAFE_AREAS.left}px`,
        };
      case "top-right":
        return {
          top: `${SAFE_AREAS.top + 10}px`,
          right: `${SAFE_AREAS.right}px`,
        };
      case "top-left":
        return {
          top: `${SAFE_AREAS.top + 10}px`,
          left: `${SAFE_AREAS.left}px`,
        };
      case "bottom-right":
      default:
        return {
          bottom: `${SAFE_AREAS.bottom + 10}px`,
          right: `${SAFE_AREAS.right}px`,
        };
    }
  };

  const getAspectRatioValue = () => {
    switch (aspectRatio) {
      case "16/9":
        return "16 / 9";
      case "1/1":
        return "1 / 1";
      case "4/3":
        return "4 / 3";
      case "9/16":
      default:
        return "9 / 16";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 45,
        width: `${width}px`,
        aspectRatio: getAspectRatioValue(),
        opacity,
        transform: `scale(${scale})`,
        borderRadius: `${theme.styling.cardRadius}px`,
        overflow: "hidden",
        border: `${theme.styling.cardBorderWidth + 1}px solid ${theme.colors.surfaceBorder}`,
        boxShadow: `${theme.styling.shadow}, 0 20px 50px rgba(0, 0, 0, 0.7)`,
        backgroundColor: "#000000",
        ...getPositionStyles(),
        ...style,
      }}
    >
      {/* Content wrapper */}
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {children}

        {/* Optional Label / Badge overlay */}
        {(label || badge) && (
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 10,
            }}
          >
            {badge && (
              <span
                style={{
                  backgroundColor: theme.colors.accent,
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.08em",
                }}
              >
                {badge}
              </span>
            )}
            {label && (
              <span
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.65)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "6px",
                  backdropFilter: "blur(6px)",
                }}
              >
                {label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
