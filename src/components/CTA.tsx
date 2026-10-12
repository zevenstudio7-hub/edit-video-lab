import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS, TYPOGRAPHY } from "../lib/tokens";
import { usePresetTheme } from "../presets";

export interface CTAProps {
  headline: string;
  subline?: string;
  buttonText?: string;
  channelHandle?: string;
  badge?: string;
  arrow?: boolean;
  entryFrame?: number;
  /** Color del texto del botón. Por defecto highlightText del preset; pásalo si el acento lo deja sin contraste. */
  buttonTextColor?: string;
  style?: React.CSSProperties;
}

export const CTA: React.FC<CTAProps> = ({
  headline,
  subline,
  buttonText = "Síguenos para más",
  channelHandle,
  badge,
  arrow = true,
  entryFrame = 0,
  buttonTextColor,
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

  const buttonSpring = spring({
    frame: Math.max(0, activeFrame - 6),
    fps,
    config: theme.motion.springConfig,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const scale = interpolate(entrance, [0, 1], [0.93, 1]);

  // Subtle breathing animation on button
  const pulsePhase = (activeFrame % 60) / 60;
  const buttonPulse = interpolate(
    Math.sin(pulsePhase * Math.PI * 2),
    [-1, 1],
    [0.99, 1.03]
  );

  return (
    <div
      style={{
        maxWidth: `${SAFE_AREAS.safeWidth}px`,
        width: "90%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        padding: "40px 32px",
        borderRadius: `${theme.styling.cardRadius}px`,
        backgroundColor: theme.colors.surfaceElevated,
        backdropFilter: `blur(${theme.styling.backdropBlur}px)`,
        border: `${theme.styling.cardBorderWidth}px solid ${theme.colors.surfaceBorder}`,
        boxShadow: `${theme.styling.shadow}, 0 20px 60px rgba(0, 0, 0, 0.5)`,
        ...style,
      }}
    >
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 18px",
            borderRadius: `${theme.styling.badgeRadius}px`,
            backgroundColor: theme.colors.tagBg,
            border: `1px solid ${theme.colors.surfaceBorder}`,
            color: theme.colors.tagText,
            fontSize: `${TYPOGRAPHY.sizes.xs}px`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "20px",
          }}
        >
          {badge}
        </div>
      )}

      <h2
        style={{
          fontFamily: theme.typography.headingFontFamily,
          fontSize: `${TYPOGRAPHY.sizes["2xl"]}px`,
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: theme.typography.titleLetterSpacing,
          color: theme.colors.textPrimary,
          margin: "0 0 14px 0",
        }}
      >
        {headline}
      </h2>

      {subline && (
        <p
          style={{
            fontFamily: theme.typography.fontFamily,
            fontSize: `${TYPOGRAPHY.sizes.sm}px`,
            color: theme.colors.textSecondary,
            lineHeight: 1.4,
            margin: "0 0 32px 0",
            maxWidth: "600px",
          }}
        >
          {subline}
        </p>
      )}

      {/* Action Button */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          padding: "18px 40px",
          borderRadius: "9999px",
          backgroundColor: theme.colors.accent,
          color: buttonTextColor ?? theme.colors.highlightText,
          fontFamily: theme.typography.headingFontFamily,
          fontSize: `${TYPOGRAPHY.sizes.md}px`,
          fontWeight: 800,
          letterSpacing: "0.02em",
          boxShadow: theme.colors.accentGlow,
          transform: `scale(${interpolate(buttonSpring, [0, 1], [0.8, 1]) * buttonPulse})`,
          opacity: interpolate(buttonSpring, [0, 1], [0, 1]),
          cursor: "pointer",
        }}
      >
        <span>{buttonText}</span>
        {arrow && (
          <span
            style={{
              fontSize: "26px",
              lineHeight: 1,
              transform: "translateX(2px)",
            }}
          >
            →
          </span>
        )}
      </div>

      {channelHandle && (
        <div
          style={{
            marginTop: "24px",
            color: theme.colors.accent,
            fontFamily: theme.typography.monoFontFamily,
            fontSize: `${TYPOGRAPHY.sizes.sm}px`,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          {channelHandle}
        </div>
      )}
    </div>
  );
};
