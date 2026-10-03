import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { SAFE_AREAS } from "../../src/lib/tokens";
import { usePresetTheme } from "../../src/presets";
import "../../src/styles/global.css";
import { BrandProvider } from "../brand/BrandProfile";
import { zevenpro } from "../brand/zevenpro";
import { ChunkCaptions, CaptionChunk } from "../recipes/ChunkCaptions";
import { CutSequence, CutShot, shotsFromSeconds, totalShotFrames } from "../recipes/CutSequence";
import { KeywordTint } from "../recipes/KeywordTint";
import { TextBehindSubject } from "../recipes/TextBehindSubject";

/**
 * Muestras SINTÉTICAS de las recetas: formas y texto inventados para la muestra, sin personas,
 * sin marcas ajenas y sin material de referencia. Sirven para ver el comportamiento de cada receta,
 * no para decidir si funciona en un video real (eso lo decide una orden VIDEO-XXX).
 */

const FPS = 30;

const Tag: React.FC<{ id: string }> = ({ id }) => {
  const theme = usePresetTheme();
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_AREAS.top - 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <span
        style={{
          padding: "6px 18px",
          borderRadius: 9999,
          border: `1px solid ${theme.colors.surfaceBorder}`,
          background: theme.colors.surface,
          color: theme.colors.textSecondary,
          fontFamily: theme.typography.fontFamily,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {id} · candidata · muestra sintética
      </span>
    </div>
  );
};

const Stage: React.FC<{ hue?: number; children?: React.ReactNode }> = ({ hue = 215, children }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(160deg, hsl(${hue} 35% 16%) 0%, hsl(${hue + 30} 40% 7%) 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

// ---------- ChunkCaptions ----------

const CHUNKS: CaptionChunk[] = [
  { text: "Esto es una muestra", startFrame: 0, endFrame: 24, emphasis: ["muestra"] },
  { text: "de subtítulos por bloques", startFrame: 24, endFrame: 48, emphasis: ["bloques"] },
  { text: "con una palabra que pesa", startFrame: 48, endFrame: 72, emphasis: ["pesa"] },
  { text: "y cambio duro", startFrame: 72, endFrame: 90, emphasis: ["duro"] },
];

export const ChunkCaptionsSample: React.FC = () => (
  <BrandProvider brand={zevenpro}>
    <Stage>
      <Tag id="ChunkCaptions" />
      <ChunkCaptions chunks={CHUNKS} />
    </Stage>
  </BrandProvider>
);
export const CHUNK_CAPTIONS_SAMPLE_FRAMES = 90;

// ---------- CutSequence ----------

const SHOT_SECONDS = [1.5, 1.5, 1.5];
const SHOTS: CutShot[] = shotsFromSeconds(SHOT_SECONDS, FPS);
const SHOT_HUES = [215, 160, 30];

const ShotScene: React.FC<{ shot: CutShot; index: number }> = ({ shot, index }) => {
  const frame = useCurrentFrame();
  const theme = usePresetTheme();
  return (
    <Stage hue={SHOT_HUES[index % SHOT_HUES.length]}>
      {/* Cuadrícula: hace visible el empuje (las líneas se separan al acercar). */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.10) 2px, transparent 2px)",
          backgroundSize: "180px 180px",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: theme.typography.headingFontFamily,
            fontSize: 220,
            fontWeight: 900,
            color: theme.colors.textPrimary,
          }}
        >
          {shot.id}
        </div>
        <div style={{ fontFamily: theme.typography.fontFamily, fontSize: 36, color: theme.colors.textSecondary }}>
          frame local {frame} / {shot.durationInFrames}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

export const CutSequenceSample: React.FC = () => (
  <BrandProvider brand={zevenpro}>
    <AbsoluteFill>
      <CutSequence shots={SHOTS} renderShot={(shot, i) => <ShotScene shot={shot} index={i} />} />
      <Tag id="CutSequence" />
    </AbsoluteFill>
  </BrandProvider>
);
export const CUT_SEQUENCE_SAMPLE_FRAMES = totalShotFrames(SHOTS);

// ---------- TextBehindSubject ----------

const SubjectPlaceholder: React.FC = () => (
  // Silueta genérica con alfa (SVG): hace de "recorte" para mostrar el orden de capas.
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <circle cx="540" cy="900" r="170" fill="#0b0d12" />
    <path d="M140 1920 C140 1380 330 1170 540 1170 C750 1170 940 1380 940 1920 Z" fill="#0b0d12" />
  </svg>
);

export const TextBehindSubjectSample: React.FC = () => (
  <BrandProvider brand={zevenpro}>
    <TextBehindSubject
      background={
        <Stage hue={200}>
          <Tag id="TextBehindSubject" />
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 520,
              width: 800,
              height: 800,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0))",
            }}
          />
        </Stage>
      }
      foreground={<SubjectPlaceholder />}
      text="DETRÁS"
      centerY={690}
      delayFrames={6}
    />
  </BrandProvider>
);
export const TEXT_BEHIND_SUBJECT_SAMPLE_FRAMES = 75;

// ---------- KeywordTint ----------

export const KeywordTintSample: React.FC = () => {
  const theme = usePresetTheme();
  return (
    <BrandProvider brand={zevenpro}>
      <Stage hue={250}>
        <Tag id="KeywordTint" />
        <Sequence from={24} durationInFrames={24} layout="none">
          <KeywordTint durationInFrames={24} color="#38bdf8" peak={0.35} />
        </Sequence>
        <Sequence from={60} durationInFrames={24} layout="none">
          <KeywordTint durationInFrames={24} color="#f59e0b" peak={0.35} />
        </Sequence>
        {/* El texto va encima del lavado (zIndex 40 > 30), como irían los subtítulos. */}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 40 }}>
          <div
            style={{
              fontFamily: theme.typography.headingFontFamily,
              fontSize: 96,
              fontWeight: 800,
              color: "#fff",
              textAlign: "center",
              padding: "0 60px",
            }}
          >
            El lavado marca la palabra clave
          </div>
        </AbsoluteFill>
      </Stage>
    </BrandProvider>
  );
};
export const KEYWORD_TINT_SAMPLE_FRAMES = 90;
