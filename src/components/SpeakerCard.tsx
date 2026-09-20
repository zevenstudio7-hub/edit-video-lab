import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS, TYPOGRAPHY } from "../lib/tokens";
import { usePresetTheme } from "../presets";

export interface SpeakerCardProps {
  name: string;
  role?: string;
  handle?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  position?: "bottom-left" | "bottom-right" | "top-left";
  entryFrame?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({
  name,
  role,
  handle,
  avatarUrl,
  avatarInitials,
  position = "bottom-left",
  entryFrame = 0,
  durationInFrames,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const activeFrame = Math.max(0, frame - entryFrame);

  // Entrance spring
  const entrance = spring({
    frame: activeFrame,
    fps,
    config: theme.motion.springConfig,
  });

  // Exit animation if duration is specified
  let exitProgress = 1;
  if (durationInFrames) {
    const exitStart = durationInFrames - 15;
    if (activeFrame >= exitStart) {
      exitProgress = interpolate(
        activeFrame,
        [exitStart, durationInFrames],
        [1, 0],
        { extrapolateRight: "clamp" }
      );
    }
  }

  const opacity = interpolate(entrance, [0, 1], [0, 1]) * exitProgress;
  const translateX = interpolate(entrance, [0, 1], [-50, 0]);
  const scale = interpolate(entrance, [0, 1], [0.92, 1]);

  const initials =
    avatarInitials ||
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case "bottom-right":
        return {
          bottom: `${SAFE_AREAS.bottom + 10}px`,
          right: `${SAFE_AREAS.right}px`,
        };
      case "top-left":
        return {
          top: `${SAFE_AREAS.top + 10}px`,
          left: `${SAFE_AREAS.left}px`,
        };
      case "bottom-left":
      default:
        return {
          bottom: `${SAFE_AREAS.bottom + 10}px`,
          left: `${SAFE_AREAS.left}px`,
        };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 50,
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "16px 24px",
        borderRadius: `${theme.styling.cardRadius}px`,
        backgroundColor: theme.colors.surfaceElevated,
        backdropFilter: `blur(${theme.styling.backdropBlur}px)`,
        border: `${theme.styling.cardBorderWidth}px solid ${theme.colors.surfaceBorder}`,
        boxShadow: theme.styling.shadow,
        ...getPositionStyles(),
        ...style,
      }}
    >
      {/* Avatar or Monogram */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: theme.colors.surface,
          border: `2px solid ${theme.colors.accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow: `0 0 14px ${theme.colors.accent}44`,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              color: theme.colors.accent,
              fontSize: "22px",
              fontWeight: 800,
              fontFamily: theme.typography.monoFontFamily,
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Info Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            color: theme.colors.textPrimary,
            fontSize: `${TYPOGRAPHY.sizes.md}px`,
            fontWeight: 800,
            fontFamily: theme.typography.headingFontFamily,
            lineHeight: 1.1,
            letterSpacing: theme.typography.titleLetterSpacing,
          }}
        >
          {name}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {role && (
            <span
              style={{
                color: theme.colors.textSecondary,
                fontSize: `${TYPOGRAPHY.sizes.xs}px`,
                fontWeight: 500,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {role}
            </span>
          )}

          {role && handle && (
            <span style={{ color: theme.colors.textMuted, fontSize: "14px" }}>
              •
            </span>
          )}

          {handle && (
            <span
              style={{
                color: theme.colors.accent,
                fontSize: `${TYPOGRAPHY.sizes.xs}px`,
                fontWeight: 600,
                fontFamily: theme.typography.monoFontFamily,
              }}
            >
              {handle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
