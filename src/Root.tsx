import React from "react";
import { Composition } from "remotion";
import { GeminiVideoLab } from "./compositions/GeminiVideoLab";
import { LibraryShowcase } from "./compositions/LibraryShowcase";
import { VIDEO_CONFIG } from "./lib/constants";
import { Video001, type Video001Timeline } from "./compositions/VIDEO-001";
import { Video001V3, type V3Timeline } from "./compositions/video001v3/Video001V3";
import { Video002, type V002Timeline } from "./compositions/video002/Video002";
import { Iconos3D } from "./compositions/video002/Iconos3D";
import { IconSpriteFrame, SPRITE } from "./compositions/video002/icons3d";
import { RELIEF_SIZE, ReliefSheet } from "./compositions/video002/relief";
import video001Order from "../video-orders/VIDEO-001.json";
import video002Order from "../video-orders/VIDEO-002.json";
import { Video003, type V003Timeline } from "./compositions/video003/Video003";
import video003Order from "../video-orders/VIDEO-003.json";
import { Video005, type V005Timeline } from "./compositions/video005/Video005";
import video005Order from "../video-orders/VIDEO-005.json";
import { Video004, type Video004Props } from "./compositions/video004/Video004";
import video004Order from "../video-orders/VIDEO-004.json";
import { Video008, type V008Timeline } from "./compositions/video008/Video008";
import video008Order from "../video-orders/VIDEO-008.json";

// La orden es el contrato: la composición lee su «timeline» ya resuelto a frames (src/videoAnalysis/buildEdit.mjs).
const video001 = video001Order as unknown as { timeline: Video001Timeline; reviewNotice?: string };
// Candidata V3 (preset experimental, composición aislada): candidatoV3.timeline (src/videoAnalysis/buildEditV3.mjs).
const video001V3 = (video001Order as unknown as { candidatoV3: { timeline: V3Timeline; reviewNotice?: string } }).candidatoV3;
// VIDEO-002 · #edit-1-motion: timeline resuelto por src/videoAnalysis/video002/buildTimeline.mjs.
const video002 = video002Order as unknown as { timeline: V002Timeline; reviewNotice?: string };
// VIDEO-003 · #edit-1-motion: timeline resuelto por src/videoAnalysis/video003/buildTimeline.mjs.
const video003 = video003Order as unknown as { timeline: V003Timeline; reviewNotice?: string };
// VIDEO-005 · #edit-1-motion · 1C: timeline resuelto por src/videoAnalysis/video005/buildTimeline.mjs.
const video005 = video005Order as unknown as { timeline: V005Timeline; reviewNotice?: string };

// VIDEO-004 · #edit-3-organico 3C: audio, planos y subtítulos leídos de la orden.
const video004 = video004Order as unknown as {
  edl: { audio: Video004Props["audio"]; duracion_f: number; fps: number };
  planos: Video004Props["planos"];
  subtitulos_s8: { frases: Video004Props["frases"] };
  formato: { ancho: number; alto: number; fps: number };
  reviewNotice?: string;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video001"
        component={Video001}
        durationInFrames={video001.timeline.durationInFrames}
        fps={video001.timeline.fps}
        width={1080}
        height={1920}
        defaultProps={{timeline: video001.timeline, reviewNotice: video001.reviewNotice}}
      />
      <Composition
        id="Video001V3"
        component={Video001V3}
        durationInFrames={video001V3.timeline.durationInFrames}
        fps={video001V3.timeline.fps}
        width={1080}
        height={1920}
        defaultProps={{timeline: video001V3.timeline, reviewNotice: video001V3.reviewNotice, showSafeArea: false}}
      />
      <Composition
        id="Video002"
        component={Video002}
        durationInFrames={video002.timeline.durationInFrames}
        fps={video002.timeline.fps}
        width={1080}
        height={1920}
        defaultProps={{timeline: video002.timeline, reviewNotice: video002.reviewNotice, showSafeArea: false}}
      />
      <Composition
        id="Video003"
        component={Video003}
        durationInFrames={video003.timeline.durationInFrames}
        fps={video003.timeline.fps}
        width={1080}
        height={1920}
        defaultProps={{timeline: video003.timeline, reviewNotice: video003.reviewNotice, showSafeArea: false, previewLigero: true}}
      />
      <Composition
        id="Video005"
        component={Video005}
        durationInFrames={video005.timeline.durationInFrames}
        fps={video005.timeline.fps}
        width={1080}
        height={1920}
        defaultProps={{timeline: video005.timeline, reviewNotice: video005.reviewNotice, showSafeArea: false}}
      />
      <Composition
        id="Video004"
        component={Video004}
        durationInFrames={video004.edl.duracion_f}
        fps={video004.formato.fps}
        width={video004.formato.ancho}
        height={video004.formato.alto}
        defaultProps={{audio: video004.edl.audio, planos: video004.planos, frases: video004.subtitulos_s8.frases, reviewNotice: video004.reviewNotice}}
      />
      {/* hoja de revisión de los iconos 3D de VIDEO-002 */}
      {/* VIDEO-008 · #edit-2-pantalla-dividida (2A, presentador arriba y apoyo abajo) · S6 sin palabra clave */}
      <Composition
        id="Video008"
        component={Video008}
        durationInFrames={(video008Order as unknown as { timeline: V008Timeline }).timeline.durationInFrames}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{ timeline: (video008Order as unknown as { timeline: V008Timeline }).timeline, reviewNotice: (video008Order as unknown as { reviewNotice: string }).reviewNotice }}
      />
      <Composition id="Video002Iconos" component={Iconos3D} durationInFrames={150} fps={30} width={1080} height={1920} />
      {/* iconos 3D de VIDEO-002 en vivo (WebGL), para hornear sus hojas (src/videoAnalysis/video002/buildIconSprites.mjs) */}
      <Composition id="Video002Icono3D" component={IconSpriteFrame} durationInFrames={SPRITE.entry + SPRITE.loop} fps={30} width={SPRITE.cell} height={SPRITE.cell} defaultProps={{name: "clock" as const}} />
      {/* relieve SVG de VIDEO-002 renderizado a PNG transparente (src/videoAnalysis/video002/buildRelief.mjs) */}
      <Composition id="Video002Relieve" component={ReliefSheet} durationInFrames={1} fps={30} width={RELIEF_SIZE} height={RELIEF_SIZE} defaultProps={{variant: "avatar-blue" as const}} />
      <Composition
        id="GeminiVideoLab"
        component={GeminiVideoLab}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
      <Composition
        id="LibraryShowcase"
        component={LibraryShowcase}
        durationInFrames={450}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
    </>
  );
};
