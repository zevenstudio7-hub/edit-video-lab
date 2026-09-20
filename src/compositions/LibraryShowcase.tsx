import React from "react";
import { AbsoluteFill, Series } from "remotion";
import {
  BigStatement,
  CTA,
  DynamicCaptions,
  FocusHighlight,
  HighlightWord,
  KineticText,
  MediaFrame,
  PictureInPicture,
  SceneTransition,
  ScreenFrame,
  SoftZoom,
  SpeakerCard,
} from "../components";
import { SAFE_AREAS } from "../lib/tokens";
import { PresetProvider, usePresetTheme } from "../presets";
import "../styles/global.css";

// Helper para el indicador de preset en la parte superior
const PresetBadge: React.FC<{ label: string; number: string }> = ({ label, number }) => {
  const theme = usePresetTheme();
  return (
    <div
      style={{
        position: "absolute",
        top: `${SAFE_AREAS.top - 50}px`,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 20px",
        borderRadius: "9999px",
        backgroundColor: theme.colors.surfaceElevated,
        border: `1px solid ${theme.colors.surfaceBorder}`,
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}
    >
      <span
        style={{
          color: theme.colors.accent,
          fontFamily: theme.typography.monoFontFamily,
          fontSize: "14px",
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        {number}
      </span>
      <span style={{ color: theme.colors.textMuted, fontSize: "14px" }}>•</span>
      <span
        style={{
          color: theme.colors.textSecondary,
          fontFamily: theme.typography.fontFamily,
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ==========================================
// SCENE 1: Editorial-Dynamic
// Demuestra: SoftZoom, BigStatement, HighlightWord, KineticText, SceneTransition
// ==========================================
const SceneEditorialDynamic: React.FC = () => {
  const theme = usePresetTheme();

  return (
    <SceneTransition type="zoom" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          background: theme.colors.backgroundGradient || theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 01" label="editorial-dynamic" />

        <SoftZoom fromScale={1.0} toScale={1.08} durationInFrames={90}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Background ambient glow */}
            <div
              style={{
                position: "absolute",
                width: "800px",
                height: "800px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%)",
                filter: "blur(80px)",
                pointerEvents: "none",
              }}
            />

            <BigStatement
              kicker="Gemini Video Lab"
              statement="CONSTRUYE VIDEOS CON IA"
              highlightWords={["VIDEOS", "IA"]}
              highlightVariant="pill"
              fontSize={74}
            />

            <div style={{ marginTop: "44px", maxWidth: "800px" }}>
              <KineticText
                text="Composición modular y determinística con Remotion"
                animation="slide-up"
                fontSize={34}
                delayFrames={14}
                color={theme.colors.textSecondary}
              />
            </div>
          </div>
        </SoftZoom>
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 2: Kinetic-Infographic
// Demuestra: SpeakerCard, DynamicCaptions (dynamic karaoke mode), HighlightWord (box)
// ==========================================
const SceneKineticInfographic: React.FC = () => {
  const theme = usePresetTheme();

  const captionWords = [
    { text: "GEMINI", startFrame: 10, endFrame: 22, isHighlight: true },
    { text: "ANALIZA", startFrame: 23, endFrame: 35 },
    { text: "EL", startFrame: 36, endFrame: 44 },
    { text: "CONTENIDO", startFrame: 45, endFrame: 60 },
    { text: "Y", startFrame: 61, endFrame: 68 },
    { text: "REMOTION", startFrame: 69, endFrame: 84, isHighlight: true },
  ];

  return (
    <SceneTransition type="slide-left" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          background: theme.colors.backgroundGradient || theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 02" label="kinetic-infographic" />

        {/* Lower third SpeakerCard */}
        <SpeakerCard
          name="Yei Rodríguez"
          role="Creative Technologist"
          handle="@zevenstudio"
          position="bottom-left"
          entryFrame={5}
        />

        {/* Infographic tech stats / card */}
        <div
          style={{
            maxWidth: `${SAFE_AREAS.safeWidth}px`,
            width: "90%",
            backgroundColor: theme.colors.surfaceElevated,
            border: `2px solid ${theme.colors.surfaceBorder}`,
            borderRadius: `${theme.styling.cardRadius}px`,
            padding: "48px 40px",
            boxShadow: theme.styling.shadow,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginBottom: "120px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: theme.typography.monoFontFamily,
                color: theme.colors.accent,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              [SYSTEM_PIPELINE]
            </span>
            <HighlightWord variant="box" color={theme.colors.accent}>
              100% REPRODUCIBLE
            </HighlightWord>
          </div>

          <h2
            style={{
              fontFamily: theme.typography.headingFontFamily,
              fontSize: "48px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Edición inteligente guiada por modelos multimodales
          </h2>
        </div>

        {/* Dynamic Captions in karaoke mode */}
        <DynamicCaptions words={captionWords} mode="dynamic" position="bottom" />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 3: Screen-Tutorial
// Demuestra: ScreenFrame, FocusHighlight, DynamicCaptions (editorial mode)
// ==========================================
const SceneScreenTutorial: React.FC = () => {
  const theme = usePresetTheme();

  const editorialWords = [
    { text: "Enfoca", startFrame: 5, endFrame: 22 },
    { text: "elementos", startFrame: 23, endFrame: 40 },
    { text: "clave", startFrame: 41, endFrame: 58 },
    { text: "automáticamente", startFrame: 59, endFrame: 85 },
  ];

  return (
    <SceneTransition type="slide-up" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          background: theme.colors.backgroundGradient || theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <PresetBadge number="PRESET 03" label="screen-tutorial" />

        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "-60px" }}>
          <ScreenFrame
            type="browser"
            url="gemini-video-lab.internal/editor"
            aspectRatio="16/9"
            width={880}
            entryFrame={0}
          >
            {/* Simulated app interface inside ScreenFrame */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#0b101b",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>⚡</span>
                  <span
                    style={{
                      fontFamily: theme.typography.headingFontFamily,
                      color: "#ffffff",
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    Gemini Auto-Cuts Engine
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    color: "#10b981",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  ACTIVE
                </span>
              </div>

              {/* Target highlighted box */}
              <div
                id="target-pipeline-box"
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  border: "1px solid rgba(51, 65, 85, 0.6)",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700 }}>
                    Análisis de tomas & silencias
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                    Cortes limpios basados en semántica del audio
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "#10b981",
                    color: "#052e16",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  OPTIMIZAR
                </div>
              </div>

              {/* Timeline preview bar */}
              <div
                style={{
                  height: "36px",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "8px",
                  border: "1px dashed rgba(51, 65, 85, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  gap: "10px",
                }}
              >
                <div style={{ width: "35%", height: "16px", backgroundColor: "#38bdf8", borderRadius: "4px" }} />
                <div style={{ width: "25%", height: "16px", backgroundColor: "#10b981", borderRadius: "4px" }} />
                <div style={{ width: "30%", height: "16px", backgroundColor: "#a855f7", borderRadius: "4px" }} />
              </div>
            </div>
          </ScreenFrame>
        </div>

        {/* Focus Highlight halo over the target pipeline box */}
        <FocusHighlight
          target={{
            x: 140,
            y: 770,
            width: 800,
            height: 120,
            borderRadius: 16,
          }}
          dimOpacity={0.4}
          pulse={true}
          entryFrame={20}
        />

        {/* Editorial Captions */}
        <DynamicCaptions words={editorialWords} mode="editorial" position="bottom" />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 4: Organic-iPhone-Demo
// Demuestra: MediaFrame, PictureInPicture, DynamicCaptions (simple mode)
// ==========================================
const SceneOrganicIphoneDemo: React.FC = () => {
  const theme = usePresetTheme();

  const simpleWords = [
    { text: "Integra", startFrame: 5, endFrame: 22 },
    { text: "B-Roll", startFrame: 23, endFrame: 40 },
    { text: "y", startFrame: 41, endFrame: 48 },
    { text: "cámara", startFrame: 49, endFrame: 66 },
    { text: "secundaria", startFrame: 67, endFrame: 85 },
  ];

  return (
    <SceneTransition type="fade" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          background: theme.colors.backgroundGradient || theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 04" label="organic-iphone-demo" />

        {/* Media Frame con simulación de B-Roll */}
        <div style={{ marginTop: "-80px" }}>
          <MediaFrame
            aspectRatio="16/9"
            width={880}
            title="B-ROLL AUTOMATIZADO"
            caption="Enriquecimiento visual generado dinámicamente con Remotion"
            glow={true}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #2e1065 0%, #1e1b4b 60%, #030712 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(168, 85, 247, 0.3)",
                  border: "2px solid #c084fc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 24px rgba(192, 132, 252, 0.6)",
                }}
              >
                <span style={{ fontSize: "32px" }}>▶</span>
              </div>

              <span
                style={{
                  color: "#e9d5ff",
                  fontFamily: theme.typography.monoFontFamily,
                  fontSize: "16px",
                  letterSpacing: "0.1em",
                }}
              >
                PRODUCCIÓN B-ROLL • 4K
              </span>
            </div>
          </MediaFrame>
        </div>

        {/* Picture-in-Picture window for speaker */}
        <PictureInPicture
          position="bottom-right"
          width={300}
          aspectRatio="9/16"
          label="Speaker Cam"
          badge="REC"
          entryFrame={10}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #a855f7 0%, #6b21a8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              YR
            </div>
            <span style={{ color: "#a1a1aa", fontSize: "14px", fontWeight: 600 }}>
              Yei Rodríguez
            </span>
          </div>
        </PictureInPicture>

        {/* Simple mode captions */}
        <DynamicCaptions words={simpleWords} mode="simple" position="bottom" />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 5: Editorial-Minimal
// Demuestra: CTA, Preset editorial-minimal, cierre con métricas y enlaces
// ==========================================
const SceneEditorialMinimal: React.FC = () => {
  const theme = usePresetTheme();

  return (
    <SceneTransition type="fade" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          background: theme.colors.backgroundGradient || theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 05" label="editorial-minimal" />

        <CTA
          badge="LIB-001 • FASE 01"
          headline="Biblioteca base lista para producción"
          subline="12 componentes modulares y 5 presets listos para construir el primer video real."
          buttonText="Explorar Gemini Video Lab"
          channelHandle="github.com/zevenstudio7-hub/gemini-video-lab"
          arrow={true}
          entryFrame={0}
        />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// COMPOSICIÓN PRINCIPAL: LibraryShowcase
// 450 frames (15 segundos a 30 FPS), 1080x1920
// ==========================================
export const LibraryShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080c" }}>
      <Series>
        {/* Escena 1: Editorial Dynamic (Frames 0 a 90) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="editorial-dynamic">
            <SceneEditorialDynamic />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 2: Kinetic Infographic (Frames 90 a 180) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="kinetic-infographic">
            <SceneKineticInfographic />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 3: Screen Tutorial (Frames 180 a 270) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="screen-tutorial">
            <SceneScreenTutorial />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 4: Organic iPhone Demo (Frames 270 a 360) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="organic-iphone-demo">
            <SceneOrganicIphoneDemo />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 5: Editorial Minimal (Frames 360 a 450) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="editorial-minimal">
            <SceneEditorialMinimal />
          </PresetProvider>
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
