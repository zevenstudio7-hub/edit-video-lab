import React from "react";
import { AbsoluteFill, Series } from "remotion";
import {
  BigStatement,
  CTA,
  DynamicCaptions,
  FocusHighlight,
  HighlightWord,
  KineticText,
  PictureInPicture,
  SceneTransition,
  ScreenFrame,
  SoftZoom,
  SpeakerCard,
} from "../components";
import { SAFE_AREAS } from "../lib/tokens";
import { PresetProvider, usePresetTheme } from "../presets";
import "../styles/global.css";

// Indicador discreto de preset en la parte superior
const PresetBadge: React.FC<{ label: string; number: string }> = ({ label, number }) => {
  const theme = usePresetTheme();
  return (
    <div
      style={{
        position: "absolute",
        top: `${SAFE_AREAS.top - 60}px`,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 18px",
        borderRadius: "9999px",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 50,
      }}
    >
      <span
        style={{
          color: theme.colors.accent,
          fontFamily: theme.typography.fontFamily,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {number}
      </span>
      <span style={{ color: "rgba(255, 255, 255, 0.3)", fontSize: "12px" }}>•</span>
      <span
        style={{
          color: "rgba(255, 255, 255, 0.75)",
          fontFamily: theme.typography.fontFamily,
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.04em",
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
// LIB-002: Colores neutros; el color de énfasis proviene del proyecto/video.
// Demuestra: SoftZoom, BigStatement, HighlightWord, KineticText
// ==========================================
const SceneEditorialDynamic: React.FC = () => {
  const theme = usePresetTheme();

  return (
    <SceneTransition type="zoom" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          backgroundColor: theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 01" label="editorial-dynamic" />

        <SoftZoom fromScale={1.0} toScale={1.06} durationInFrames={90}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 40px",
            }}
          >
            <BigStatement
              kicker="Gemini Video Lab"
              statement="CONSTRUYE VIDEOS CON IA"
              highlightWords={["VIDEOS", "IA"]}
              highlightVariant="pill"
              fontSize={76}
            />

            <div style={{ marginTop: "44px", maxWidth: "800px" }}>
              <KineticText
                text="Composición modular y determinística con Remotion"
                animation="slide-up"
                fontSize={34}
                delayFrames={12}
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
// LIB-002: Lenguaje social/editorial, tipografía moderna (no terminal/hacker),
// texto, formas y recortes como protagonistas.
// ==========================================
const SceneKineticInfographic: React.FC = () => {
  const theme = usePresetTheme();

  const captionWords = [
    { text: "ESTRATEGIA", startFrame: 10, endFrame: 22, isHighlight: true },
    { text: "GUIADA", startFrame: 23, endFrame: 34 },
    { text: "POR", startFrame: 35, endFrame: 42 },
    { text: "MODELOS", startFrame: 43, endFrame: 56 },
    { text: "Y", startFrame: 57, endFrame: 64 },
    { text: "REMOTION", startFrame: 65, endFrame: 84, isHighlight: true },
  ];

  return (
    <SceneTransition type="slide-left" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          backgroundColor: theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 02" label="kinetic-infographic" />

        {/* Lower third SpeakerCard con estilo social/editorial */}
        <SpeakerCard
          name="Yei Rodríguez"
          role="Creative Director"
          handle="@zevenstudio"
          position="bottom-left"
          entryFrame={6}
        />

        {/* Tarjeta de impacto editorial con formas y datos protagonistas */}
        <div
          style={{
            maxWidth: `${SAFE_AREAS.safeWidth}px`,
            width: "90%",
            backgroundColor: theme.colors.surfaceElevated,
            border: `1.5px solid ${theme.colors.surfaceBorder}`,
            borderRadius: `${theme.styling.cardRadius}px`,
            padding: "48px 40px",
            boxShadow: theme.styling.shadow,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            marginBottom: "130px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: theme.typography.headingFontFamily,
                color: theme.colors.accent,
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              SISTEMA REUTILIZABLE
            </span>
            <HighlightWord variant="pill" color={theme.colors.accent} textColor="#000000">
              FASE 01
            </HighlightWord>
          </div>

          <h2
            style={{
              fontFamily: theme.typography.headingFontFamily,
              fontSize: "52px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              margin: 0,
            }}
          >
            El contenido del usuario conduce la narrativa
          </h2>

          {/* Formas gráficas limpias (recortes de datos visuales) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            {[
              { label: "Componentes", val: "12" },
              { label: "Presets", val: "5" },
              { label: "Resolución", val: "9:16" },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: theme.colors.accent,
                    fontSize: "32px",
                    fontWeight: 900,
                    fontFamily: theme.typography.headingFontFamily,
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    color: theme.colors.textMuted,
                    fontSize: "14px",
                    fontWeight: 600,
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Captions con ritmo social/editorial */}
        <DynamicCaptions words={captionWords} mode="dynamic" position="bottom" />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 3: Screen-Tutorial
// LIB-002: Conservar estructura (ScreenFrame, FocusHighlight, captions)
// pero evitar apariencia excesivamente "developer" con interfaz SaaS moderna.
// ==========================================
const SceneScreenTutorial: React.FC = () => {
  const theme = usePresetTheme();

  const tutorialCaptions = [
    { text: "Enfoca", startFrame: 5, endFrame: 22 },
    { text: "acciones", startFrame: 23, endFrame: 40 },
    { text: "clave", startFrame: 41, endFrame: 58 },
    { text: "automáticamente", startFrame: 59, endFrame: 85 },
  ];

  return (
    <SceneTransition type="slide-up" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          backgroundColor: theme.colors.background,
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
            url="app.geminivideolab.com/project/01"
            aspectRatio="16/9"
            width={880}
            entryFrame={0}
          >
            {/* Interfaz de software / producto digital moderno (estilo SaaS limpio, no terminal hacker) */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#0d1117",
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {/* Barra superior de app */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: theme.colors.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "16px",
                    }}
                  >
                    G
                  </div>
                  <span
                    style={{
                      fontFamily: theme.typography.headingFontFamily,
                      color: "#ffffff",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    Editor de Tomas Inteligente
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.15)",
                      color: "#60a5fa",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    Proyecto Activo
                  </span>
                </div>
              </div>

              {/* Panel de control de edición (elemento objetivo para highlight) */}
              <div
                style={{
                  backgroundColor: "#161b22",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ color: "#ffffff", fontSize: "17px", fontWeight: 700 }}>
                    Generar Cortes y Overlays
                  </div>
                  <div style={{ color: "#8b949e", fontSize: "13px", marginTop: "2px" }}>
                    Ajuste automático de ritmo según el guion del usuario
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: "#ffffff",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Procesar Video
                </div>
              </div>

              {/* Pista de timeline con bloques limpios */}
              <div
                style={{
                  height: "44px",
                  backgroundColor: "#161b22",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  gap: "10px",
                }}
              >
                <div style={{ width: "25%", height: "24px", backgroundColor: "#2563eb", borderRadius: "6px" }} />
                <div style={{ width: "35%", height: "24px", backgroundColor: "#3b82f6", borderRadius: "6px" }} />
                <div style={{ width: "20%", height: "24px", backgroundColor: "#60a5fa", borderRadius: "6px" }} />
                <div style={{ width: "15%", height: "24px", backgroundColor: "#93c5fd", borderRadius: "6px" }} />
              </div>
            </div>
          </ScreenFrame>
        </div>

        {/* Focus Highlight enfocado en el botón de procesamiento */}
        <FocusHighlight
          target={{
            x: 140,
            y: 770,
            width: 800,
            height: 110,
            borderRadius: 14,
          }}
          dimOpacity={0.4}
          pulse={true}
          entryFrame={18}
          color={theme.colors.accent}
        />

        {/* Dynamic Captions editoriales */}
        <DynamicCaptions words={tutorialCaptions} mode="editorial" position="bottom" />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 4: Organic-iPhone-Demo
// LIB-002: Eliminar glassmorphism y gradientes llamativos; subtítulos discretos;
// cero elementos que compitan con lo mostrado; mantener apariencia natural de video iPhone.
// ==========================================
const SceneOrganicIphoneDemo: React.FC = () => {
  const discreteCaptions = [
    { text: "Video", startFrame: 5, endFrame: 22 },
    { text: "grabado", startFrame: 23, endFrame: 40 },
    { text: "con", startFrame: 41, endFrame: 48 },
    { text: "iPhone,", startFrame: 49, endFrame: 66 },
    { text: "100%", startFrame: 67, endFrame: 74 },
    { text: "auténtico", startFrame: 75, endFrame: 86 },
  ];

  return (
    <SceneTransition type="fade" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          backgroundColor: "#000000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 04" label="organic-iphone-demo" />

        {/* Toma natural simulada de video iPhone: encuadre limpio sin bordes de fantasía ni neón */}
        <div
          style={{
            width: "880px",
            aspectRatio: "16 / 9",
            backgroundColor: "#121214",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginTop: "-80px",
          }}
        >
          {/* Simulación sobria de toma de cámara de smartphone */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              color: "#a1a1aa",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                color: "#ffffff",
              }}
            >
              📹
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}
            >
              Toma directa de usuario
            </span>
            <span style={{ fontSize: "14px", color: "#71717a" }}>
              4K 30 FPS • Micrófono integrado
            </span>
          </div>

          {/* Indicador discreto de cámara de iPhone en esquina superior derecha */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
              }}
            />
            00:14
          </div>
        </div>

        {/* Ventana PiP discreta y sin bordes llamativos */}
        <PictureInPicture
          position="bottom-right"
          width={280}
          aspectRatio="9/16"
          label="Cámara frontal"
          badge=""
          entryFrame={10}
          style={{
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#18181b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f4f4f5",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              YR
            </div>
            <span style={{ color: "#a1a1aa", fontSize: "13px", fontWeight: 500 }}>
              Yei Rodríguez
            </span>
          </div>
        </PictureInPicture>

        {/* Subtítulos discretos sin tapar la imagen */}
        <DynamicCaptions
          words={discreteCaptions}
          mode="simple"
          position="bottom"
          fontSize={32}
        />
      </AbsoluteFill>
    </SceneTransition>
  );
};

// ==========================================
// SCENE 5: Editorial-Minimal
// LIB-002: Mantener sobrio; serif opcional en titulares; placas limpias y motion suave.
// ==========================================
const SceneEditorialMinimal: React.FC = () => {
  const theme = usePresetTheme();

  return (
    <SceneTransition type="fade" timing="both" durationInFrames={15} totalSceneFrames={90}>
      <AbsoluteFill
        style={{
          backgroundColor: theme.colors.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PresetBadge number="PRESET 05" label="editorial-minimal" />

        {/* Placa limpia y sobria con tipografía serif refinada */}
        <CTA
          badge="LIB-002 • PRESETS REALES"
          headline="Biblioteca alineada a referencias reales"
          subline="Diseño sobrio, tipografía cuidada y motion determinístico para Gemini Video Lab."
          buttonText="Explorar Presets"
          channelHandle="zevenstudio7-hub/gemini-video-lab"
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
        {/* Escena 1: Editorial Dynamic con color de énfasis de proyecto (#38bdf8) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="editorial-dynamic" overrides={{ accentColor: "#38bdf8" }}>
            <SceneEditorialDynamic />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 2: Kinetic Infographic (Lenguaje social/editorial con tipografía moderna) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="kinetic-infographic">
            <SceneKineticInfographic />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 3: Screen Tutorial (Interfaz SaaS moderna, sin aspecto hacker) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="screen-tutorial">
            <SceneScreenTutorial />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 4: Organic iPhone Demo (Sin glassmorphism ni gradientes chillones, subtítulos discretos) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="organic-iphone-demo">
            <SceneOrganicIphoneDemo />
          </PresetProvider>
        </Series.Sequence>

        {/* Escena 5: Editorial Minimal (Sobrio, placas limpias, serif opcional) */}
        <Series.Sequence durationInFrames={90}>
          <PresetProvider preset="editorial-minimal" overrides={{ useSerifHeading: true }}>
            <SceneEditorialMinimal />
          </PresetProvider>
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
