import React from "react";
import { Sequence } from "remotion";
import { SoftZoom, SoftZoomProps } from "../../src/components/SoftZoom";

/**
 * CutSequence — planos con corte duro (sin transición) y empuje lento opcional en cada plano.
 * Referencia: REF-3 (11 cortes duros en 61 s ≈ 5,5 s por plano; empujes medidos de +19 % a +23 % en
 * planos de 3,7–5,4 s y +81 % en una toma cenital de 7,7 s). Medido en UN solo video de referencia (n = 1):
 * los valores por defecto son un punto de partida, no una regla. Estado: candidata.
 *
 * Reutiliza SoftZoom (LIB-001); aquí solo se añade el reparto de planos en la línea de tiempo.
 * No incluye transiciones: para ellas existe SceneTransition.
 */

export interface CutShot {
  id: string;
  durationInFrames: number;
  /** false = plano fijo. Si se omite, usa `defaultPush`. */
  push?: false | { from?: number; to?: number; origin?: SoftZoomProps["origin"] };
}

export interface CutSequenceProps {
  shots: CutShot[];
  renderShot: (shot: CutShot, index: number) => React.ReactNode;
  defaultPush?: false | { from?: number; to?: number; origin?: SoftZoomProps["origin"] };
  easing?: SoftZoomProps["easing"];
}

export const DEFAULT_PUSH = { from: 1.0, to: 1.2, origin: "center" as const };

/** Convierte una lista de duraciones en segundos a planos con id correlativo. */
export const shotsFromSeconds = (seconds: number[], fps: number, prefix = "S"): CutShot[] =>
  seconds.map((s, i) => ({ id: `${prefix}${i + 1}`, durationInFrames: Math.round(s * fps) }));

/** Frames totales de una lista de planos. */
export const totalShotFrames = (shots: CutShot[]): number =>
  shots.reduce((acc, s) => acc + s.durationInFrames, 0);

export const CutSequence: React.FC<CutSequenceProps> = ({
  shots,
  renderShot,
  defaultPush = DEFAULT_PUSH,
  easing = "linear",
}) => {
  let cursor = 0;
  return (
    <>
      {shots.map((shot, i) => {
        const from = cursor;
        cursor += shot.durationInFrames;
        const push = shot.push === undefined ? defaultPush : shot.push;
        const content = renderShot(shot, i);
        return (
          <Sequence key={shot.id} from={from} durationInFrames={shot.durationInFrames} name={shot.id}>
            {push === false ? (
              content
            ) : (
              <SoftZoom
                fromScale={push.from ?? DEFAULT_PUSH.from}
                toScale={push.to ?? DEFAULT_PUSH.to}
                origin={push.origin ?? DEFAULT_PUSH.origin}
                durationInFrames={shot.durationInFrames}
                easing={easing}
              >
                {content}
              </SoftZoom>
            )}
          </Sequence>
        );
      })}
    </>
  );
};
