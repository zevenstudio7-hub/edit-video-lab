import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_AREAS } from "../../src/lib/tokens";
import { usePresetTheme } from "../../src/presets";

/**
 * ChunkCaptions — subtítulos por bloques cortos (2–4 palabras), sin caja,
 * tipografía serif y cambio duro entre bloques (sin salida animada).
 * Referencia: REF-1. Estado: candidata (sin validar en una orden real).
 *
 * Diferencia con lo que ya existe:
 *  - DynamicCaptions: ventana de 4 palabras con karaoke por palabra → exige tiempos por palabra.
 *  - PhraseCaptions (VIDEO-002, sin versionar): frase completa dentro de una caja.
 *  - ChunkCaptions: bloques ya partidos por quien edita, con énfasis opcional por palabra.
 *    Solo necesita tiempos por bloque, igual que PhraseCaptions.
 */

export interface CaptionChunk {
  text: string;
  startFrame: number;
  endFrame: number;
  /** Palabras del bloque que reciben el acento (coincidencia exacta, sin distinguir mayúsculas ni signos). */
  emphasis?: string[];
}

export interface ChunkCaptionsProps {
  chunks: CaptionChunk[];
  /** Centro vertical del bloque en px desde arriba. Medir en la composición final: no heredar de otra grabación. */
  centerY?: number;
  fontSize?: number;
  uppercase?: boolean;
  /** true usa la serif del preset; false usa la tipografía de titulares del preset. */
  serif?: boolean;
  emphasisStyle?: "color" | "italic" | "color-italic";
  style?: React.CSSProperties;
}

const normalize = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");

export const ChunkCaptions: React.FC<ChunkCaptionsProps> = ({
  chunks,
  centerY = 1120,
  fontSize = 72,
  uppercase = false,
  serif = true,
  emphasisStyle = "color-italic",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const active = chunks.find((c) => frame >= c.startFrame && frame < c.endFrame);
  if (!active) return null;

  const enter = spring({
    frame: frame - active.startFrame,
    fps,
    config: theme.motion.springConfig,
    durationInFrames: 7,
  });

  const emphasized = new Set((active.emphasis ?? []).map(normalize));
  const family =
    serif && theme.typography.serifFontFamily
      ? theme.typography.serifFontFamily
      : theme.typography.headingFontFamily;

  const words = active.text.split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: centerY,
        width: SAFE_AREAS.safeWidth,
        transform: `translate(-50%, -50%) translateY(${interpolate(enter, [0, 1], [14, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.96, 1]
        )})`,
        opacity: interpolate(enter, [0, 1], [0, 1]),
        textAlign: "center",
        zIndex: 40,
        fontFamily: family,
        fontSize,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: theme.typography.titleLetterSpacing,
        textTransform: uppercase ? "uppercase" : "none",
        color: theme.colors.textPrimary,
        // Sin caja: la legibilidad la da la sombra, no un fondo.
        textShadow: "0 2px 4px rgba(0,0,0,0.45), 0 6px 28px rgba(0,0,0,0.55)",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const on = emphasized.has(normalize(w));
        const color = on && emphasisStyle !== "italic" ? theme.colors.accent : undefined;
        const italic = on && emphasisStyle !== "color";
        return (
          <React.Fragment key={`${w}-${i}`}>
            {i > 0 ? " " : null}
            <span style={{ color, fontStyle: italic ? "italic" : "normal" }}>{w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};
