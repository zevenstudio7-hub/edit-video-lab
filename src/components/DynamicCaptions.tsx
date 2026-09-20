import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS } from "../lib/tokens";
import { usePresetTheme } from "../presets";

export interface CaptionWord {
  text: string;
  startFrame: number;
  endFrame: number;
  isHighlight?: boolean;
}

export interface DynamicCaptionsProps {
  words: CaptionWord[];
  mode?: "simple" | "editorial" | "dynamic";
  position?: "bottom" | "center" | "top";
  fontSize?: number;
  style?: React.CSSProperties;
}

export const DynamicCaptions: React.FC<DynamicCaptionsProps> = ({
  words,
  mode = "dynamic",
  position = "bottom",
  fontSize,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  // Encontrar palabras visibles en el frame actual (o segmento activo)
  const currentWordIndex = words.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame
  );

  // Determinar ventana visible de palabras (3-5 palabras alrededor)
  // Si no hay palabra activa pero estamos en el rango general, mostrar la más cercana
  const activeIndex =
    currentWordIndex !== -1
      ? currentWordIndex
      : words.findIndex((w) => frame < w.startFrame) !== -1
      ? Math.max(0, words.findIndex((w) => frame < w.startFrame) - 1)
      : words.length - 1;

  // Calculamos la ventana de palabras para que no desborde la pantalla vertical
  const windowSize = mode === "simple" ? 6 : 4;
  const windowStart = Math.floor(activeIndex / windowSize) * windowSize;
  const visibleWords = words.slice(windowStart, windowStart + windowSize);

  // Posicionamiento en safe areas
  const getVerticalPosition = (): React.CSSProperties => {
    switch (position) {
      case "top":
        return { top: `${SAFE_AREAS.top + 40}px` };
      case "center":
        return { top: "50%", transform: "translate(-50%, -50%)" };
      case "bottom":
      default:
        return { bottom: `${SAFE_AREAS.bottom + 20}px` };
    }
  };

  const resolvedFontSize = fontSize || (mode === "dynamic" ? 44 : 36);

  if (mode === "simple") {
    // MODO SIMPLE: Subtítulos claros, limpios, legibles con fondo oscuro sutil
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: position === "center" ? "translate(-50%, -50%)" : "translateX(-50%)",
          maxWidth: `${SAFE_AREAS.safeWidth}px`,
          width: "90%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          zIndex: 40,
          ...getVerticalPosition(),
          ...style,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            padding: "16px 28px",
            borderRadius: "16px",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#ffffff",
            fontFamily: theme.typography.fontFamily,
            fontSize: `${resolvedFontSize}px`,
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: theme.typography.letterSpacing,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          {visibleWords.map((word, i) => {
            const isCurrent = frame >= word.startFrame && frame <= word.endFrame;
            return (
              <span
                key={`${word.text}-${i}`}
                style={{
                  margin: "0 6px",
                  color: isCurrent ? theme.colors.accent : "#ffffff",
                  transition: "color 0.15s ease",
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === "editorial") {
    // MODO EDITORIAL: Tipografía estilizada, pill sutil, tracking refinado
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: position === "center" ? "translate(-50%, -50%)" : "translateX(-50%)",
          maxWidth: `${SAFE_AREAS.safeWidth}px`,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 40,
          ...getVerticalPosition(),
          ...style,
        }}
      >
        <div
          style={{
            background: "rgba(18, 20, 29, 0.7)",
            border: `1px solid ${theme.colors.surfaceBorder}`,
            borderRadius: "24px",
            padding: "20px 36px",
            backdropFilter: `blur(${theme.styling.backdropBlur}px)`,
            boxShadow: theme.styling.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px 12px",
              fontFamily: theme.typography.headingFontFamily,
              fontSize: `${resolvedFontSize}px`,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: theme.typography.letterSpacing,
            }}
          >
            {visibleWords.map((word, idx) => {
              const globalIdx = windowStart + idx;
              const isCurrent = globalIdx === activeIndex;
              const isPast = globalIdx < activeIndex;

              return (
                <span
                  key={`${word.text}-${idx}`}
                  style={{
                    color: isCurrent
                      ? theme.colors.accent
                      : isPast
                      ? theme.colors.textPrimary
                      : theme.colors.textMuted,
                    borderBottom: isCurrent ? `3px solid ${theme.colors.accent}` : "3px solid transparent",
                    paddingBottom: "2px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {word.text}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // MODO DINÁMICO: Estilo karaoke / punchy con spring pop en cada palabra activa
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: position === "center" ? "translate(-50%, -50%)" : "translateX(-50%)",
        maxWidth: `${SAFE_AREAS.safeWidth}px`,
        width: "90%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px 16px",
        zIndex: 40,
        textAlign: "center",
        ...getVerticalPosition(),
        ...style,
      }}
    >
      {visibleWords.map((word, idx) => {
        const isCurrent = frame >= word.startFrame && frame <= word.endFrame;
        const isPast = frame > word.endFrame;

        // Rebote elástico al activarse la palabra
        const wordFrame = Math.max(0, frame - word.startFrame);
        const pop = isCurrent
          ? spring({
              frame: wordFrame,
              fps,
              config: theme.motion.springConfig,
            })
          : 0;

        const scale = isCurrent ? interpolate(pop, [0, 1], [0.92, 1.14]) : 1.0;

        return (
          <span
            key={`${word.text}-${idx}`}
            style={{
              display: "inline-block",
              fontFamily: theme.typography.headingFontFamily,
              fontSize: `${resolvedFontSize}px`,
              fontWeight: isCurrent || word.isHighlight ? 800 : 700,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              transform: `scale(${scale})`,
              transformOrigin: "center bottom",
              padding: isCurrent ? "6px 16px" : "6px 8px",
              borderRadius: isCurrent ? "12px" : "0px",
              backgroundColor: isCurrent
                ? theme.colors.highlightBg
                : "transparent",
              color: isCurrent
                ? theme.colors.highlightText
                : isPast
                ? theme.colors.textPrimary
                : "rgba(255, 255, 255, 0.4)",
              boxShadow: isCurrent ? theme.colors.accentGlow : "none",
              transition: "color 0.1s ease, background-color 0.1s ease",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
