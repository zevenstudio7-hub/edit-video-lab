import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS } from "../lib/tokens";
import { usePresetTheme } from "../presets";

export interface ScreenFrameProps {
  children: React.ReactNode;
  title?: string;
  url?: string;
  type?: "browser" | "terminal" | "window";
  width?: number | string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16" | "auto";
  entryFrame?: number;
  style?: React.CSSProperties;
}

export const ScreenFrame: React.FC<ScreenFrameProps> = ({
  children,
  title,
  url,
  type = "browser",
  width = "100%",
  aspectRatio = "16/9",
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
  const translateY = interpolate(entrance, [0, 1], [50, 0]);
  const scale = interpolate(entrance, [0, 1], [0.95, 1]);

  const getAspectRatioValue = () => {
    switch (aspectRatio) {
      case "9/16":
        return "9 / 16";
      case "1/1":
        return "1 / 1";
      case "4/3":
        return "4 / 3";
      case "auto":
        return undefined;
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
        borderRadius: `${theme.styling.cardRadius}px`,
        overflow: "hidden",
        backgroundColor: "#0d111a",
        border: `${theme.styling.cardBorderWidth}px solid ${theme.colors.surfaceBorder}`,
        boxShadow: `${theme.styling.shadow}, 0 20px 60px rgba(0, 0, 0, 0.6)`,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Window Header */}
      <div
        style={{
          height: "48px",
          backgroundColor: "rgba(20, 26, 38, 0.95)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: "14px",
        }}
      >
        {/* macOS window control dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#ff5f56",
              boxShadow: "0 0 8px rgba(255, 95, 86, 0.5)",
            }}
          />
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#ffbd2e",
              boxShadow: "0 0 8px rgba(255, 189, 46, 0.5)",
            }}
          />
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#27c93f",
              boxShadow: "0 0 8px rgba(39, 201, 63, 0.5)",
            }}
          />
        </div>

        {/* Browser Address Bar or Terminal Title */}
        {type === "browser" && (url || title) && (
          <div
            style={{
              flex: 1,
              maxWidth: "75%",
              margin: "0 auto",
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "4px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.monoFontFamily,
              fontSize: "14px",
              letterSpacing: "0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: theme.colors.accent, marginRight: "6px" }}>
              🔒
            </span>
            {url || title}
          </div>
        )}

        {type === "terminal" && (title || url) && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: theme.colors.textMuted,
              fontFamily: theme.typography.monoFontFamily,
              fontSize: "13px",
              letterSpacing: "0.04em",
            }}
          >
            {title || url || "terminal — zsh"}
          </div>
        )}

        {type === "window" && title && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamily,
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {title}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          aspectRatio: getAspectRatioValue(),
          position: "relative",
          overflow: "hidden",
          backgroundColor: type === "terminal" ? "#07090e" : "#0f172a",
        }}
      >
        {children}
      </div>
    </div>
  );
};
