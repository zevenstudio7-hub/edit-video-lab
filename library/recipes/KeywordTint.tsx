import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { usePresetTheme } from "../../src/presets";

/**
 * KeywordTint — lavado de color de todo el cuadro que marca una palabra clave (REF-2).
 * Úsalo dentro de un <Sequence from durationInFrames>: el pulso se mide en frames locales.
 * Estado: candidata. No toca el contenido: es una capa encima, con pointerEvents desactivados.
 *
 * Capas: zIndex 30, por debajo de los subtítulos de la biblioteca (zIndex 40), para que el lavado
 * no tiña el texto de los captions.
 * Contraste: un lavado alto sobre un rostro cambia su color de piel; dejar `peak` bajo
 * cuando el sujeto está en cuadro y revisar el resultado con audio y a tamaño real.
 */

export interface KeywordTintProps {
  /** Por defecto, el acento del preset. */
  color?: string;
  /** Opacidad máxima del lavado (0–1). */
  peak?: number;
  /** Frames de subida hasta `peak`. */
  inFrames?: number;
  /** Frames de bajada hasta 0, contados hacia atrás desde el final de la secuencia. */
  outFrames?: number;
  durationInFrames: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
}

export const KeywordTint: React.FC<KeywordTintProps> = ({
  color,
  peak = 0.3,
  inFrames = 4,
  outFrames = 10,
  durationInFrames,
  blendMode = "normal",
}) => {
  const frame = useCurrentFrame();
  const theme = usePresetTheme();

  const opacity = interpolate(
    frame,
    [0, inFrames, Math.max(inFrames, durationInFrames - outFrames), durationInFrames],
    [0, peak, peak, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color ?? theme.colors.accent,
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: "none",
        zIndex: 30,
      }}
    />
  );
};
