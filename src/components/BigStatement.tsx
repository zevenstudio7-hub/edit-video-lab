import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS, TYPOGRAPHY } from "../lib/tokens";
import { usePresetTheme } from "../presets";
import { HighlightWord } from "./HighlightWord";

export interface BigStatementProps {
  kicker?: string;
  statement: string;
  highlightWords?: string[];
  align?: "left" | "center";
  fontSize?: number;
  highlightVariant?: "pill" | "marker" | "glow" | "box";
  style?: React.CSSProperties;
}

export const BigStatement: React.FC<BigStatementProps> = ({
  kicker,
  statement,
  highlightWords = [],
  align = "center",
  fontSize = 76,
  highlightVariant = "pill",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const entrance = spring({
    frame,
    fps,
    config: theme.motion.springConfig,
  });

  const kickerEntrance = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: theme.motion.springConfig,
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [45, 0]);
  const scale = interpolate(entrance, [0, 1], [0.94, 1]);

  // Dividir el statement para envolver las highlightWords si coinciden
  const words = statement.split(" ");

  return (
    <div
      style={{
        maxWidth: `${SAFE_AREAS.safeWidth}px`,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        padding: "0 20px",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        ...style,
      }}
    >
      {kicker && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 20px",
            borderRadius: `${theme.styling.badgeRadius}px`,
            backgroundColor: theme.colors.tagBg,
            border: `1px solid ${theme.colors.surfaceBorder}`,
            color: theme.colors.tagText,
            fontSize: `${TYPOGRAPHY.sizes.sm}px`,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "24px",
            opacity: interpolate(kickerEntrance, [0, 1], [0, 1]),
            transform: `scale(${interpolate(kickerEntrance, [0, 1], [0.85, 1])})`,
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: theme.colors.accent,
              boxShadow: `0 0 10px ${theme.colors.accent}`,
            }}
          />
          {kicker}
        </div>
      )}

      <h1
        style={{
          fontFamily: theme.typography.headingFontFamily,
          fontSize: `${fontSize}px`,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: theme.typography.titleLetterSpacing,
          color: theme.colors.textPrimary,
          margin: 0,
          textShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        {words.map((word, idx) => {
          // Limpiar signos de puntuación para comparar
          const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
          const isHighlight = highlightWords.some(
            (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
          );

          if (isHighlight) {
            return (
              <React.Fragment key={`${word}-${idx}`}>
                <HighlightWord
                  variant={highlightVariant}
                  delayFrames={6 + idx * 2}
                >
                  {word}
                </HighlightWord>{" "}
              </React.Fragment>
            );
          }

          return <span key={`${word}-${idx}`}>{word} </span>;
        })}
      </h1>
    </div>
  );
};
