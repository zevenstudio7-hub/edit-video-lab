import React from "react";
import { Composition } from "remotion";
import { CANVAS } from "../src/lib/tokens";
import {
  CHUNK_CAPTIONS_SAMPLE_FRAMES,
  ChunkCaptionsSample,
  CUT_SEQUENCE_SAMPLE_FRAMES,
  CutSequenceSample,
  KEYWORD_TINT_SAMPLE_FRAMES,
  KeywordTintSample,
  TEXT_BEHIND_SUBJECT_SAMPLE_FRAMES,
  TextBehindSubjectSample,
} from "./gallery/Samples";

const common = { fps: CANVAS.fps, width: CANVAS.width, height: CANVAS.height } as const;

/** Una composición por receta, con prefijo LIB- para no confundirlas con composiciones de video. */
export const LibraryRoot: React.FC = () => (
  <>
    <Composition
      id="LIB-ChunkCaptions"
      component={ChunkCaptionsSample}
      durationInFrames={CHUNK_CAPTIONS_SAMPLE_FRAMES}
      {...common}
    />
    <Composition
      id="LIB-CutSequence"
      component={CutSequenceSample}
      durationInFrames={CUT_SEQUENCE_SAMPLE_FRAMES}
      {...common}
    />
    <Composition
      id="LIB-TextBehindSubject"
      component={TextBehindSubjectSample}
      durationInFrames={TEXT_BEHIND_SUBJECT_SAMPLE_FRAMES}
      {...common}
    />
    <Composition
      id="LIB-KeywordTint"
      component={KeywordTintSample}
      durationInFrames={KEYWORD_TINT_SAMPLE_FRAMES}
      {...common}
    />
  </>
);
