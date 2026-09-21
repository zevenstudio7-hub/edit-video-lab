import React, { createContext, useContext } from "react";
import { ANIMATION_SPRINGS, RADII, SHADOWS, TYPOGRAPHY } from "../lib/tokens";
import { PresetId, PresetOverrides, PresetTheme } from "./types";

export * from "./types";

/**
 * 1. editorial-dynamic
 * Estilo editorial de alto impacto para creadores y talking heads.
 * Colores neutralizados para que el énfasis provenga del proyecto o video.
 */
export const editorialDynamicPreset: PresetTheme = {
  id: "editorial-dynamic",
  name: "Editorial Dynamic",
  description: "Composiciones editoriales sobrias y dinámicas con acento configurable por proyecto.",
  colors: {
    background: "#08090b",
    backgroundGradient: undefined,
    surface: "rgba(255, 255, 255, 0.04)",
    surfaceElevated: "rgba(255, 255, 255, 0.08)",
    surfaceBorder: "rgba(255, 255, 255, 0.14)",
    textPrimary: "#ffffff",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",
    accent: "#ffffff", // Color neutro base; configurable por video/proyecto
    accentSecondary: "#94a3b8",
    accentGlow: "none",
    highlightBg: "#ffffff",
    highlightText: "#000000",
    tagBg: "rgba(255, 255, 255, 0.10)",
    tagText: "#f1f5f9",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.sans,
    serifFontFamily: TYPOGRAPHY.fontFamilies.serif,
    letterSpacing: TYPOGRAPHY.letterSpacings.tight,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tighter,
  },
  styling: {
    borderRadius: RADII.md,
    cardRadius: RADII.lg,
    badgeRadius: RADII.full,
    shadow: SHADOWS.subtle,
    cardBorderWidth: 1.5,
    backdropBlur: 10,
  },
  motion: {
    intensity: "energetic",
    springConfig: ANIMATION_SPRINGS.snappy,
    staggerFrames: 2,
  },
};

/**
 * 2. kinetic-infographic
 * Lenguaje social/editorial con tipografía contemporánea (no estética de terminal/hacker).
 * Texto, tarjetas nítidas y formas gráficas como protagonistas.
 */
export const kineticInfographicPreset: PresetTheme = {
  id: "kinetic-infographic",
  name: "Kinetic Infographic",
  description: "Lenguaje social y editorial moderno donde el texto y las formas son protagonistas.",
  colors: {
    background: "#0c0e12",
    backgroundGradient: undefined,
    surface: "#14171f",
    surfaceElevated: "#1c202b",
    surfaceBorder: "rgba(255, 255, 255, 0.12)",
    textPrimary: "#ffffff",
    textSecondary: "#e2e8f0",
    textMuted: "#94a3b8",
    accent: "#facc15", // Amarillo editorial moderno de alto impacto visual
    accentSecondary: "#ffffff",
    accentGlow: "none",
    highlightBg: "#facc15",
    highlightText: "#000000",
    tagBg: "rgba(250, 204, 21, 0.15)",
    tagText: "#fef08a",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.sans,
    serifFontFamily: TYPOGRAPHY.fontFamilies.serif,
    letterSpacing: TYPOGRAPHY.letterSpacings.normal,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tight,
  },
  styling: {
    borderRadius: RADII.md,
    cardRadius: RADII.lg,
    badgeRadius: RADII.sm,
    shadow: SHADOWS.medium,
    cardBorderWidth: 1.5,
    backdropBlur: 0,
  },
  motion: {
    intensity: "energetic",
    springConfig: ANIMATION_SPRINGS.snappy,
    staggerFrames: 2,
  },
};

/**
 * 3. editorial-minimal
 * Sobrio, pausado, placas limpias y motion suave.
 * Soporta tipografía serif opcional para elegancia editorial.
 */
export const editorialMinimalPreset: PresetTheme = {
  id: "editorial-minimal",
  name: "Editorial Minimal",
  description: "Estética sobria, placas limpias, motion suave y tipografía serif opcional.",
  colors: {
    background: "#09090b",
    backgroundGradient: undefined,
    surface: "rgba(255, 255, 255, 0.03)",
    surfaceElevated: "rgba(255, 255, 255, 0.06)",
    surfaceBorder: "rgba(255, 255, 255, 0.12)",
    textPrimary: "#fafafa",
    textSecondary: "#d4d4d8",
    textMuted: "#71717a",
    accent: "#e5e5e5",
    accentSecondary: "#a1a1aa",
    accentGlow: "none",
    highlightBg: "rgba(255, 255, 255, 0.14)",
    highlightText: "#ffffff",
    tagBg: "rgba(255, 255, 255, 0.08)",
    tagText: "#e4e4e7",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.serif, // Serif por defecto para titulares sobrios
    monoFontFamily: TYPOGRAPHY.fontFamilies.sans,
    serifFontFamily: TYPOGRAPHY.fontFamilies.serif,
    useSerifHeading: true,
    letterSpacing: TYPOGRAPHY.letterSpacings.wide,
    titleLetterSpacing: "0.01em",
  },
  styling: {
    borderRadius: RADII.sm,
    cardRadius: RADII.md,
    badgeRadius: RADII.full,
    shadow: SHADOWS.subtle,
    cardBorderWidth: 1,
    backdropBlur: 0,
  },
  motion: {
    intensity: "subtle",
    springConfig: ANIMATION_SPRINGS.gentle,
    staggerFrames: 4,
  },
};

/**
 * 4. screen-tutorial
 * Captura de pantalla y producto con interfaz limpia, sin apariencia excesivamente developer.
 */
export const screenTutorialPreset: PresetTheme = {
  id: "screen-tutorial",
  name: "Screen Tutorial",
  description: "Tutorial y demo de producto con interfaz SaaS moderna y limpia.",
  colors: {
    background: "#0a0c10",
    backgroundGradient: undefined,
    surface: "#11141b",
    surfaceElevated: "#181c26",
    surfaceBorder: "rgba(255, 255, 255, 0.1)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    accent: "#3b82f6", // Azul profesional y universal
    accentSecondary: "#60a5fa",
    accentGlow: "none",
    highlightBg: "rgba(59, 130, 246, 0.18)",
    highlightText: "#93c5fd",
    tagBg: "rgba(59, 130, 246, 0.14)",
    tagText: "#bfdbfe",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.mono,
    serifFontFamily: TYPOGRAPHY.fontFamilies.serif,
    letterSpacing: TYPOGRAPHY.letterSpacings.normal,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tight,
  },
  styling: {
    borderRadius: RADII.md,
    cardRadius: RADII.lg,
    badgeRadius: RADII.sm,
    shadow: SHADOWS.medium,
    cardBorderWidth: 1,
    backdropBlur: 0,
  },
  motion: {
    intensity: "balanced",
    springConfig: ANIMATION_SPRINGS.smooth,
    staggerFrames: 3,
  },
};

/**
 * 5. organic-iphone-demo
 * Apariencia natural de video iPhone sin glassmorphism, sin gradientes llamativos
 * y con subtítulos discretos que no compiten con lo grabado.
 */
export const organicIphoneDemoPreset: PresetTheme = {
  id: "organic-iphone-demo",
  name: "Organic iPhone Demo",
  description: "Estilo crudo y natural para grabaciones de iPhone sin distracciones visuales.",
  colors: {
    background: "#000000",
    backgroundGradient: undefined,
    surface: "rgba(24, 24, 27, 0.9)",
    surfaceElevated: "rgba(39, 39, 42, 0.95)",
    surfaceBorder: "rgba(255, 255, 255, 0.08)",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    accent: "#ffffff", // Neutro natural
    accentSecondary: "#e4e4e7",
    accentGlow: "none",
    highlightBg: "#ffffff",
    highlightText: "#000000",
    tagBg: "rgba(255, 255, 255, 0.12)",
    tagText: "#f4f4f5",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.sans,
    serifFontFamily: TYPOGRAPHY.fontFamilies.serif,
    letterSpacing: TYPOGRAPHY.letterSpacings.tight,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tighter,
  },
  styling: {
    borderRadius: RADII.md,
    cardRadius: RADII.lg,
    badgeRadius: RADII.full,
    shadow: "none",
    cardBorderWidth: 1,
    backdropBlur: 0,
  },
  motion: {
    intensity: "subtle",
    springConfig: ANIMATION_SPRINGS.smooth,
    staggerFrames: 2,
  },
};

export const PRESETS: Record<PresetId, PresetTheme> = {
  "editorial-dynamic": editorialDynamicPreset,
  "kinetic-infographic": kineticInfographicPreset,
  "editorial-minimal": editorialMinimalPreset,
  "screen-tutorial": screenTutorialPreset,
  "organic-iphone-demo": organicIphoneDemoPreset,
};

export const getPreset = (
  presetId?: PresetId,
  overrides?: PresetOverrides
): PresetTheme => {
  const base = (presetId && PRESETS[presetId]) ? PRESETS[presetId] : editorialDynamicPreset;
  if (!overrides) return base;

  const customAccent = overrides.accentColor || base.colors.accent;

  return {
    ...base,
    colors: {
      ...base.colors,
      ...(overrides.background ? { background: overrides.background } : {}),
      accent: customAccent,
      accentSecondary: overrides.accentSecondary || base.colors.accentSecondary,
      highlightBg: overrides.accentColor || base.colors.highlightBg,
      tagBg: overrides.accentColor ? `${overrides.accentColor}25` : base.colors.tagBg,
      tagText: overrides.accentColor || base.colors.tagText,
    },
    typography: {
      ...base.typography,
      headingFontFamily:
        overrides.useSerifHeading && base.typography.serifFontFamily
          ? base.typography.serifFontFamily
          : base.typography.headingFontFamily,
      useSerifHeading: overrides.useSerifHeading,
    },
  };
};

const PresetContext = createContext<PresetTheme>(editorialDynamicPreset);

export const PresetProvider: React.FC<{
  preset?: PresetId | PresetTheme;
  overrides?: PresetOverrides;
  children: React.ReactNode;
}> = ({ preset = "editorial-dynamic", overrides, children }) => {
  const resolvedPreset =
    typeof preset === "string"
      ? getPreset(preset, overrides)
      : overrides
      ? getPreset(preset.id, overrides)
      : preset;

  return <PresetContext.Provider value={resolvedPreset}>{children}</PresetContext.Provider>;
};

export const usePresetTheme = (): PresetTheme => {
  return useContext(PresetContext);
};
