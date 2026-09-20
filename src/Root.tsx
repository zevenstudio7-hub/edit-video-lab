import React from "react";
import { Composition } from "remotion";
import { GeminiVideoLab } from "./compositions/GeminiVideoLab";
import { VIDEO_CONFIG } from "./lib/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeminiVideoLab"
        component={GeminiVideoLab}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
    </>
  );
};
