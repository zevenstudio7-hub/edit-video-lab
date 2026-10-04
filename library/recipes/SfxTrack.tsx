import React from "react";
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import sfx from "../sfx/sfx.json";
import type { SfxCue } from "../sfx/cues";

/**
 * SfxTrack — efectos de sonido colocados por frame.
 * Estado: candidata. Los archivos aún no están en el repo: `node library/sfx/fetch-sfx.mjs` los baja a public/sfx.
 *
 * Uso:
 *   const { kept } = buildCues({ events, words }, sfx.reglas, sfx.limites);
 *   <SfxTrack cues={kept} master={0.9} />
 *
 * Usa <Audio> de @remotion/media (ya instalado en el repo, igual que <Video> en PresenterCamera).
 * Un id de sonido que no esté en library/sfx/sfx.json lanza un error: mejor fallar que callar un sonido.
 * Volumen: parte del `volumen` del sonido; `master` lo escala. Ajustar escuchando con la voz limpia.
 */

export interface SfxTrackProps {
  cues: SfxCue[];
  /** Factor global 0–1 sobre todos los efectos. */
  master?: number;
}

const byId = new Map(sfx.sonidos.map((s) => [s.id, s]));

export const SfxTrack: React.FC<SfxTrackProps> = ({ cues, master = 1 }) => (
  <>
    {cues.map((cue, i) => {
      const sound = byId.get(cue.sound);
      if (!sound) {
        throw new Error(`SfxTrack: el sonido '${cue.sound}' no existe en library/sfx/sfx.json`);
      }
      return (
        <Sequence key={`${cue.sound}-${cue.frame}-${i}`} from={cue.frame} layout="none" name={`sfx:${cue.sound}`}>
          <Audio src={staticFile(sound.archivo.replace(/^public\//, ""))} volume={(cue.volume ?? sound.volumen) * master} />
        </Sequence>
      );
    })}
  </>
);
