import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";

/**
 * PresenterCamera — encuadre de un plano de presentador grabado en horizontal dentro de una zona vertical.
 * Hace «cover» de la fuente sobre la zona y mueve una cámara virtual: escala, punto de foco, empuje lento
 * (zoom in/out a lo largo del plano) y golpes de zoom sincronizados con palabras concretas.
 * Estado: validada en VIDEO-001 (formato #edit-2-pantalla-dividida, 2026-10-04). Reutiliza <Video> de @remotion/media (fotograma exacto).
 *
 * La cámara nunca deja ver bordes: la traslación se limita para que la fuente cubra siempre la zona.
 * Alternar escala entre planos consecutivos de la misma toma disimula el salto de un corte por pausa.
 */

export interface PresenterPunch {
  /** Frame dentro del plano en que empieza el golpe. */
  frame: number;
  /** Incremento de escala (p. ej. 0.08 = +8 %). */
  add: number;
}

export interface PresenterShot {
  src: string;
  /** Recorte de la fuente en frames (trimBefore/trimAfter de @remotion/media). */
  trimBefore: number;
  trimAfter: number;
  durationInFrames: number;
  /** Escala relativa al «cover» (1 = plano base). */
  scale: number;
  /** Punto de la fuente que la cámara mantiene en el objetivo (px de la fuente). */
  focus: { x: number; y: number };
  /** Variación de escala a lo largo del plano: >0 acerca (zoom in), <0 aleja (zoom out). */
  push?: number;
  /** Entrada con alejamiento rápido (p. ej. 0.12 entra 12 % más cerca y se abre con spring). */
  revealFrom?: number;
  punches?: PresenterPunch[];
  /** Frames de rampa de volumen en cada extremo (evita clics; los cortes ya caen en pausas). */
  fadeFrames?: number;
  /** Escala impuesta desde fuera (pista de cámara global): ignora push, revealFrom y punches. */
  scaleOverride?: number;
  /** Sin audio (cuando la voz va en una pista de diálogo continua). */
  muted?: boolean;
  /** Velocidad de reproducción de la fuente (p. ej. 1.1); durationInFrames ya debe venir dividido por ella. */
  playbackRate?: number;
}

export interface PresenterCameraProps {
  shot: PresenterShot;
  sourceWidth: number;
  sourceHeight: number;
  zoneWidth: number;
  zoneHeight: number;
  /** Dónde cae el foco dentro de la zona, en fracción (0–1). */
  target?: { x: number; y: number };
}

export const PresenterCamera: React.FC<PresenterCameraProps> = ({
  shot,
  sourceWidth,
  sourceHeight,
  zoneWidth,
  zoneHeight,
  target = { x: 0.5, y: 0.4 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cover = Math.max(zoneWidth / sourceWidth, zoneHeight / sourceHeight);

  const progress = interpolate(frame, [0, Math.max(1, shot.durationInFrames - 1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const reveal = shot.revealFrom
    ? interpolate(spring({ frame, fps, config: { damping: 200, stiffness: 120, mass: 0.9 }, durationInFrames: 16 }), [0, 1], [shot.revealFrom, 0])
    : 0;
  const punch = (shot.punches ?? []).reduce(
    (acc, p) => acc + p.add * spring({ frame: frame - p.frame, fps, config: { damping: 18, stiffness: 220, mass: 0.6 }, durationInFrames: 9 }),
    0
  );
  const s = cover * Math.max(1, shot.scaleOverride ?? shot.scale * (1 + (shot.push ?? 0) * progress) + reveal + punch);

  const w = sourceWidth * s;
  const h = sourceHeight * s;
  const left = Math.min(0, Math.max(zoneWidth - w, target.x * zoneWidth - shot.focus.x * s));
  const top = Math.min(0, Math.max(zoneHeight - h, target.y * zoneHeight - shot.focus.y * s));

  const fade = shot.fadeFrames ?? 1;
  const volume = (f: number) =>
    interpolate(f, [0, fade, shot.durationInFrames - 1 - fade, shot.durationInFrames - 1], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left, top, width: w, height: h }}>
        <Video
          src={shot.src}
          trimBefore={shot.trimBefore}
          trimAfter={shot.trimAfter}
          volume={shot.muted ? 0 : volume}
          muted={shot.muted}
          playbackRate={shot.playbackRate ?? 1}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
};
