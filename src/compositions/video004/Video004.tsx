/**
 * VIDEO-004 · #edit-3-organico · variante 3C (horizontal 16:9) · subtítulos S8 · look cine-sobrio 100 %.
 * Contrato: video-orders/VIDEO-004.json (audio, planos y subtítulos se leen de ahí).
 * Unidades: trimBefore/trimAfter y timeline_f en frames de 25 fps (fuente y composición a 25 fps);
 * subtítulos en segundos de la línea de tiempo montada.
 *
 * El color ya viene en el proxy (LUT aplicada solo al metraje con FFmpeg); aquí no se gradúa nada,
 * así los subtítulos conservan su color.
 */
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { FloatingCaptions, type FloatingPhrase } from "../../../library/recipes/FloatingCaptions";

const INTER = loadInter("normal", { weights: ["300", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

type Span = { id: string; trimBefore_f: number; trimAfter_f: number; timeline_f: [number, number] };
type Encuadre = { zoom: number; origen: [number, number] };

export type Video004Props = {
  audio: Span[];
  planos: { encuadres: Record<string, Encuadre>; lista: (Span & { plano: string })[] };
  frases: FloatingPhrase[];
  reviewNotice?: string;
};

const SOURCE = staticFile("video-004/hq/fuente-cine-sobrio.mp4");
// Fundido cruzado en los cortes de audio: el tramo anterior se alarga OVERLAP_F frames bajo el siguiente.
// Un fundido a cero en ambos lados dejaba ~80 ms de silencio digital (-87 dB) bajo el ruido de sala (-32 dB).
const OVERLAP_F = 3;

export const Video004: React.FC<Video004Props> = ({ audio, planos, frases, reviewNotice }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {planos.lista.map((p) => {
      const e = planos.encuadres[p.plano];
      return (
        <Sequence key={p.id} name={`${p.id} · ${p.plano}`} from={p.timeline_f[0]} durationInFrames={p.timeline_f[1] - p.timeline_f[0]} premountFor={25}>
          <OffthreadVideo
            src={SOURCE}
            muted
            trimBefore={p.trimBefore_f}
            trimAfter={p.trimAfter_f}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${e.zoom})`,
              transformOrigin: `${e.origen[0]}% ${e.origen[1]}%`,
            }}
          />
        </Sequence>
      );
    })}

    {audio.map((a, i) => {
      const first = i === 0;
      const last = i === audio.length - 1;
      const dur = a.timeline_f[1] - a.timeline_f[0] + (last ? 0 : OVERLAP_F);
      return (
        <Sequence key={a.id} name={`audio ${a.id}`} from={a.timeline_f[0]} durationInFrames={dur} layout="none">
          <Audio
            src={SOURCE}
            trimBefore={a.trimBefore_f}
            trimAfter={a.trimAfter_f + (last ? 0 : OVERLAP_F)}
            volume={(f) =>
              interpolate(f, [0, OVERLAP_F, dur - OVERLAP_F, dur], [first ? 1 : 0, 1, 1, last ? 1 : 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      );
    })}

    <FloatingCaptions frases={frases} fontFamily={INTER} fontSize={44} />

    {reviewNotice ? (
      <div style={{ position: "absolute", top: 24, left: 24, padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,.55)", color: "#fff", fontFamily: INTER, fontSize: 18, fontWeight: 700 }}>
        {reviewNotice}
      </div>
    ) : null}
  </AbsoluteFill>
);
