import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { usePresetTheme } from "../../src/presets";

/**
 * TextBehindSubject — texto ENTRE el fondo y el sujeto recortado (REF-2).
 * Orden de capas: background → texto → foreground (recorte con alfa).
 * Estado: candidata. Necesita un recorte con canal alfa alineado 1:1 con el fondo
 * (PNG/WebM transparente). Generar ese recorte es un paso aparte: ver library/README.md
 * (restricciones de licencia y de hardware de las herramientas de recorte).
 *
 * `background` y `foreground` son nodos React: <OffthreadVideo>, <Img>, SVG, etc.
 * Si el recorte es un vídeo con alfa, usar <OffthreadVideo transparent …/> en foreground.
 */

export interface TextBehindSubjectProps {
  background: React.ReactNode;
  foreground: React.ReactNode;
  text: string;
  /** Centro vertical del texto en px desde arriba. Medir sobre el sujeto real. */
  centerY?: number;
  fontSize?: number;
  delayFrames?: number;
  reveal?: "wipe-up" | "fade" | "scale";
  color?: string;
  uppercase?: boolean;
}

export const TextBehindSubject: React.FC<TextBehindSubjectProps> = ({
  background,
  foreground,
  text,
  centerY = 760,
  fontSize = 220,
  delayFrames = 0,
  reveal = "wipe-up",
  color,
  uppercase = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const p = spring({
    frame: frame - delayFrames,
    fps,
    config: theme.motion.springConfig,
    durationInFrames: 18,
  });

  // El borde superior del recorte termina en -30 % (no en 0 %) para no cortar tildes ni ascendentes
  // que sobresalen de la caja de línea.
  const wipeTop = interpolate(p, [0, 1], [100, -30]);
  const textStyle: React.CSSProperties =
    reveal === "wipe-up"
      ? {
          clipPath: `inset(${wipeTop}% -2% -10% -2%)`,
          transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
        }
      : reveal === "scale"
      ? { opacity: p, transform: `scale(${interpolate(p, [0, 1], [1.12, 1])})` }
      : { opacity: p };

  return (
    <AbsoluteFill>
      <AbsoluteFill>{background}</AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: centerY,
            transform: "translateY(-50%)",
            textAlign: "center",
            fontFamily: theme.typography.headingFontFamily,
            fontSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: theme.typography.titleLetterSpacing,
            textTransform: uppercase ? "uppercase" : "none",
            color: color ?? theme.colors.textPrimary,
            padding: "0 40px",
            ...textStyle,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
      <AbsoluteFill>{foreground}</AbsoluteFill>
    </AbsoluteFill>
  );
};
