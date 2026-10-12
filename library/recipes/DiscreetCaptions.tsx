import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * DiscreetCaptions — subtítulo S6 «Discreto» (formatos/subtitulos/SUBTITULOS.md).
 * Bloques de 3–6 palabras en negrita, blancos con sombra, centrados abajo; corte duro entre bloques.
 * La palabra clave aparece en una píldora blanca con un pop corto (6 f) cuando se dice.
 * Primera receta real de S6: VIDEO-004 (#edit-3-organico 3C, 16:9). La capa de la guía
 * (src/compositions/guia/estilos.tsx · S6Layer) solo ilustra el estilo en 9:16.
 *
 * Tiempos en segundos de la composición; solo necesita tiempos por bloque y el de la palabra clave.
 */

export interface DiscreetBlock {
  texto: string;
  desde_s: number;
  hasta_s: number;
  /** Índice de la palabra clave dentro del bloque (null = sin píldora). */
  clave: number | null;
  /** Segundo en que se dice la palabra clave: la píldora aparece entonces. */
  clave_s: number | null;
}

export interface DiscreetCaptionsProps {
  blocks: DiscreetBlock[];
  fontFamily: string;
  /** Centro vertical del bloque en px. Medir en la composición final: no heredar de otro formato. */
  centerY: number;
  width: number;
  fontSize?: number;
  inkColor?: string;
}

const POP_FRAMES = 6;

export const DiscreetCaptions: React.FC<DiscreetCaptionsProps> = ({
  blocks,
  fontFamily,
  centerY,
  width,
  fontSize = 44,
  inkColor = "#17171D",
}) => {
  const frame = useCurrentFrame();
  const { fps, width: compWidth } = useVideoConfig();
  const now = frame / fps;
  const b = blocks.find((x) => now >= x.desde_s && now < x.hasta_s);
  if (!b) return null;
  const words = b.texto.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        left: (compWidth - width) / 2,
        width,
        top: centerY,
        transform: "translateY(-50%)",
        textAlign: "center",
        fontFamily,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.3,
        color: "#fff",
        textShadow: "0 2px 10px rgba(0,0,0,.6)",
      }}
    >
      {words.map((w, i) => {
        const isKey = i === b.clave;
        const keyFrame = Math.round((b.clave_s ?? b.desde_s) * fps);
        const shown = isKey && frame >= keyFrame;
        const pop = shown
          ? interpolate(frame - keyFrame, [0, POP_FRAMES * 0.6, POP_FRAMES], [0.6, 1.08, 1], {
              extrapolateRight: "clamp",
            })
          : 1;
        return (
          <span key={i}>
            {i ? " " : ""}
            {shown ? (
              <span
                style={{
                  display: "inline-block",
                  background: "#fff",
                  color: inkColor,
                  borderRadius: 12,
                  padding: "0 14px",
                  textShadow: "none",
                  transform: `scale(${pop})`,
                }}
              >
                {w}
              </span>
            ) : (
              <span>{w}</span>
            )}
          </span>
        );
      })}
    </div>
  );
};
