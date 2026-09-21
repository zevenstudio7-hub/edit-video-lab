export type PresetId =
  | "editorial-dynamic"
  | "kinetic-infographic"
  | "editorial-minimal"
  | "screen-tutorial"
  | "organic-iphone-demo";

export type MotionIntensity = "subtle" | "balanced" | "energetic";

export interface PresetTheme {
  id: PresetId;
  name: string;
  description: string;
  colors: {
    background: string;
    backgroundGradient?: string;
    surface: string;
    surfaceElevated: string;
    surfaceBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentSecondary?: string;
    accentGlow: string;
    highlightBg: string;
    highlightText: string;
    tagBg: string;
    tagText: string;
  };
  typography: {
    fontFamily: string;
    headingFontFamily: string;
    monoFontFamily: string;
    serifFontFamily?: string;
    useSerifHeading?: boolean;
    letterSpacing: string;
    titleLetterSpacing: string;
  };
  styling: {
    borderRadius: number;
    cardRadius: number;
    badgeRadius: number;
    shadow: string;
    cardBorderWidth: number;
    backdropBlur: number;
  };
  motion: {
    intensity: MotionIntensity;
    springConfig: {
      damping: number;
      stiffness: number;
      mass: number;
    };
    staggerFrames: number;
  };
}

export interface PresetOverrides {
  accentColor?: string;
  accentSecondary?: string;
  useSerifHeading?: boolean;
  background?: string;
}
