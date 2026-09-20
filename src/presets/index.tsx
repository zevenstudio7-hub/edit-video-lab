import React, { createContext, useContext } from "react";
import { ANIMATION_SPRINGS, RADII, SHADOWS, TYPOGRAPHY } from "../lib/tokens";
import { PresetId, PresetTheme } from "./types";

export * from "./types";

export const editorialDynamicPreset: PresetTheme = {
  id: "editorial-dynamic",
  name: "Editorial Dynamic",
  description: "Estilo editorial contemporáneo de alto contraste con acentos cyan y motion enérgico.",
  colors: {
    background: "#07090e",
    backgroundGradient: "radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.12) 0%, rgba(7, 9, 14, 0.95) 75%)",
    surface: "rgba(255, 255, 255, 0.05)",
    surfaceElevated: "rgba(255, 255, 255, 0.09)",
    surfaceBorder: "rgba(56, 189, 248, 0.25)",
    textPrimary: "#ffffff",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",
    accent: "#38bdf8",
    accentSecondary: "#3b82f6",
    accentGlow: "0 0 28px rgba(56, 189, 248, 0.5)",
    highlightBg: "#38bdf8",
    highlightText: "#07090e",
    tagBg: "rgba(56, 189, 248, 0.15)",
    tagText: "#7dd3fc",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.mono,
    letterSpacing: TYPOGRAPHY.letterSpacings.tight,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tighter,
  },
  styling: {
    borderRadius: RADII.lg,
    cardRadius: RADII.xl,
    badgeRadius: RADII.full,
    shadow: SHADOWS.glowCyan,
    cardBorderWidth: 1.5,
    backdropBlur: 16,
  },
  motion: {
    intensity: "energetic",
    springConfig: ANIMATION_SPRINGS.snappy,
    staggerFrames: 3,
  },
};

export const kineticInfographicPreset: PresetTheme = {
  id: "kinetic-infographic",
  name: "Kinetic Infographic",
  description: "Estilo técnico con acentos ámbar y tipografía de precisión para datos y conceptos clave.",
  colors: {
    background: "#0c0d12",
    backgroundGradient: "radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.10) 0%, rgba(12, 13, 18, 0.98) 70%)",
    surface: "rgba(24, 26, 36, 0.7)",
    surfaceElevated: "rgba(35, 38, 52, 0.85)",
    surfaceBorder: "rgba(245, 158, 11, 0.3)",
    textPrimary: "#ffffff",
    textSecondary: "#e2e8f0",
    textMuted: "#94a3b8",
    accent: "#f59e0b",
    accentSecondary: "#fbbf24",
    accentGlow: "0 0 28px rgba(245, 158, 11, 0.5)",
    highlightBg: "#fbbf24",
    highlightText: "#18181b",
    tagBg: "rgba(245, 158, 11, 0.18)",
    tagText: "#fde68a",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.mono,
    letterSpacing: TYPOGRAPHY.letterSpacings.normal,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tight,
  },
  styling: {
    borderRadius: RADII.md,
    cardRadius: RADII.lg,
    badgeRadius: RADII.sm,
    shadow: SHADOWS.glowAmber,
    cardBorderWidth: 2,
    backdropBlur: 12,
  },
  motion: {
    intensity: "energetic",
    springConfig: ANIMATION_SPRINGS.bouncier,
    staggerFrames: 2,
  },
};

export const editorialMinimalPreset: PresetTheme = {
  id: "editorial-minimal",
  name: "Editorial Minimal",
  description: "Estilo sobrio, elegante y de ritmo pausado con paleta neutra y acento champaña.",
  colors: {
    background: "#09090b",
    backgroundGradient: "radial-gradient(circle at 50% 50%, rgba(226, 217, 204, 0.05) 0%, #09090b 80%)",
    surface: "rgba(255, 255, 255, 0.03)",
    surfaceElevated: "rgba(255, 255, 255, 0.06)",
    surfaceBorder: "rgba(255, 255, 255, 0.12)",
    textPrimary: "#fafafa",
    textSecondary: "#d4d4d8",
    textMuted: "#71717a",
    accent: "#e2d9cc",
    accentSecondary: "#f5f5f4",
    accentGlow: "0 0 20px rgba(226, 217, 204, 0.2)",
    highlightBg: "rgba(226, 217, 204, 0.2)",
    highlightText: "#ffffff",
    tagBg: "rgba(255, 255, 255, 0.08)",
    tagText: "#e4e4e7",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.sans,
    monoFontFamily: TYPOGRAPHY.fontFamilies.mono,
    letterSpacing: TYPOGRAPHY.letterSpacings.wide,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.normal,
  },
  styling: {
    borderRadius: RADII.sm,
    cardRadius: RADII.md,
    badgeRadius: RADII.full,
    shadow: SHADOWS.subtle,
    cardBorderWidth: 1,
    backdropBlur: 20,
  },
  motion: {
    intensity: "subtle",
    springConfig: ANIMATION_SPRINGS.gentle,
    staggerFrames: 4,
  },
};

export const screenTutorialPreset: PresetTheme = {
  id: "screen-tutorial",
  name: "Screen Tutorial",
  description: "Estilo optimizado para capturas de pantalla, código y tutoriales paso a paso.",
  colors: {
    background: "#080c14",
    backgroundGradient: "radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.10) 0%, rgba(8, 12, 20, 0.98) 75%)",
    surface: "rgba(15, 23, 42, 0.8)",
    surfaceElevated: "rgba(30, 41, 59, 0.9)",
    surfaceBorder: "rgba(51, 65, 85, 0.7)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    accent: "#10b981",
    accentSecondary: "#06b6d4",
    accentGlow: "0 0 24px rgba(16, 185, 129, 0.4)",
    highlightBg: "rgba(16, 185, 129, 0.2)",
    highlightText: "#6ee7b7",
    tagBg: "rgba(16, 185, 129, 0.15)",
    tagText: "#a7f3d0",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.mono,
    letterSpacing: TYPOGRAPHY.letterSpacings.normal,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tight,
  },
  styling: {
    borderRadius: RADII.md,
    cardRadius: RADII.lg,
    badgeRadius: RADII.sm,
    shadow: SHADOWS.medium,
    cardBorderWidth: 1.5,
    backdropBlur: 14,
  },
  motion: {
    intensity: "balanced",
    springConfig: ANIMATION_SPRINGS.smooth,
    staggerFrames: 3,
  },
};

export const organicIphoneDemoPreset: PresetTheme = {
  id: "organic-iphone-demo",
  name: "Organic iPhone Demo",
  description: "Estilo dinámico con gradientes vivos, cristal suave y ritmo ágil para demos de producto.",
  colors: {
    background: "#0d0718",
    backgroundGradient: "radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.18) 0%, rgba(13, 7, 24, 0.98) 80%)",
    surface: "rgba(255, 255, 255, 0.07)",
    surfaceElevated: "rgba(255, 255, 255, 0.12)",
    surfaceBorder: "rgba(168, 85, 247, 0.35)",
    textPrimary: "#ffffff",
    textSecondary: "#f1f5f9",
    textMuted: "#a855f7",
    accent: "#c084fc",
    accentSecondary: "#ec4899",
    accentGlow: "0 0 32px rgba(192, 132, 252, 0.5)",
    highlightBg: "#ec4899",
    highlightText: "#ffffff",
    tagBg: "rgba(168, 85, 247, 0.2)",
    tagText: "#f5d0fe",
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamilies.sans,
    headingFontFamily: TYPOGRAPHY.fontFamilies.heading,
    monoFontFamily: TYPOGRAPHY.fontFamilies.mono,
    letterSpacing: TYPOGRAPHY.letterSpacings.tight,
    titleLetterSpacing: TYPOGRAPHY.letterSpacings.tighter,
  },
  styling: {
    borderRadius: RADII.lg,
    cardRadius: RADII["2xl"],
    badgeRadius: RADII.full,
    shadow: SHADOWS.glowViolet,
    cardBorderWidth: 1.5,
    backdropBlur: 20,
  },
  motion: {
    intensity: "energetic",
    springConfig: ANIMATION_SPRINGS.bouncier,
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

export const getPreset = (presetId?: PresetId): PresetTheme => {
  if (!presetId || !PRESETS[presetId]) {
    return editorialDynamicPreset;
  }
  return PRESETS[presetId];
};

const PresetContext = createContext<PresetTheme>(editorialDynamicPreset);

export const PresetProvider: React.FC<{
  preset?: PresetId | PresetTheme;
  children: React.ReactNode;
}> = ({ preset = "editorial-dynamic", children }) => {
  const resolvedPreset = typeof preset === "string" ? getPreset(preset) : preset;
  return <PresetContext.Provider value={resolvedPreset}>{children}</PresetContext.Provider>;
};

export const usePresetTheme = (): PresetTheme => {
  return useContext(PresetContext);
};
