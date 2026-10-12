import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * FloatingCaptions — subtítulo S8 «Flotante cinematográfico» (formatos/subtitulos/SUBTITULOS.md).
 * Sans fina sin caja, blanca con sombra suave. La posición la fija el sujeto: cada pieza va centrada en un
 * espacio libre a su lado, a la altura de su cabeza, y se recalcula en cada plano (la colocación llega
 * medida por frase y plano; ver src/videoAnalysis/video004/placeS8.mjs).
 * Acumulativa: cada palabra aparece al decirse (fundido de 3 f) hasta completar la frase; con la
 * frase siguiente el bloque se reinicia, sin transición. La palabra clave va en 700, misma familia y tamaño.
 * Primera receta real de S8: VIDEO-004 (#edit-3-organico 3C). La capa de la guía
 * (src/compositions/guia/estilos.tsx · S8Layer) solo ilustra el estilo.
 *
 * Necesita tiempos por palabra reales (DTW o alineación): no los infiere de tiempos por frase.
 * Tiempos en segundos de la composición.
 */

export interface FloatingWord {
  texto: string;
  t: number;
  negrita?: boolean;
}

export interface FloatingPiece {
  /** Índice de la primera palabra de la pieza (partido = 2 piezas). */
  desde: number;
  /** Centro horizontal del espacio libre, en px. */
  cx: number;
  /** Ancho máximo: si la pieza no cabe en una línea pasa a dos (apilado). */
  ancho: number;
}

export interface FloatingPlacement {
  desde_s: number;
  hasta_s: number;
  /** Centro vertical (altura de la cabeza en ese plano), en px. */
  cy: number;
  piezas: FloatingPiece[];
}

export interface FloatingPhrase {
  texto: string;
  palabras: FloatingWord[];
  hasta_s: number;
  /** Una colocación por plano que atraviesa la frase. */
  colocacion: FloatingPlacement[];
}

export interface FloatingCaptionsProps {
  frases: FloatingPhrase[];
  /** Familia con pesos 300 y 700 cargados. */
  fontFamily: string;
  fontSize?: number;
}

const FADE_FRAMES = 3;

export const FloatingCaptions: React.FC<FloatingCaptionsProps> = ({ frases, fontFamily, fontSize = 44 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  const fr = frases.find((f) => now >= f.palabras[0].t && now < f.hasta_s);
  if (!fr) return null;

  const col = fr.colocacion.find((c) => now >= c.desde_s && now < c.hasta_s) ?? fr.colocacion[0];

  return (
    <>
      {col.piezas.map((p, pi) => {
        const end = col.piezas[pi + 1]?.desde ?? fr.palabras.length;
        return (
          <div
            key={pi}
            style={{
              position: "absolute",
              left: p.cx - p.ancho / 2,
              top: col.cy,
              width: p.ancho,
              transform: "translateY(-50%)",
              textAlign: "center",
              fontFamily,
              fontSize,
              fontWeight: 300,
              lineHeight: 1.12,
              color: "#fff",
              textShadow: "0 2px 14px rgba(0,0,0,.45)",
            }}
          >
            {fr.palabras.slice(p.desde, end).map((w, i) => {
              // las palabras aún no dichas ocupan su sitio (opacidad 0): la frase no se recoloca al crecer
              const o = interpolate(frame, [w.t * fps, w.t * fps + FADE_FRAMES], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <React.Fragment key={i}>
                  {i ? " " : ""}
                  <span style={{ opacity: o, fontWeight: w.negrita ? 700 : 300 }}>{w.texto}</span>
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </>
  );
};
