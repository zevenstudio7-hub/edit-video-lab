/**
 * Gemini Video Lab — Design Tokens
 * 
 * Tokens visuales reutilizables y configurables para composiciones de video vertical 9:16 (1080x1920).
 * Incluye safe areas para plataformas móviles (TikTok, Instagram Reels, YouTube Shorts),
 * tipografía, escalas de espaciado, radios, sombras y configuraciones de animación.
 */

export const CANVAS = {
  width: 1080,
  height: 1920,
  fps: 30,
  aspectRatio: "9:16",
} as const;

/**
 * Safe Areas para video vertical (1080x1920)
 * Evita elementos críticos en las zonas tapadas por UI de TikTok, Reels y Shorts:
 * - Superior: barra de estado, tabs de navegación (~120px)
 * - Inferior: descripción, botones de interacción, barra de progreso (~220px)
 * - Lateral derecho: botones de like, comentario, compartir (~120px)
 * - Lateral izquierdo: margen de seguridad estándar (~60px)
 */
export const SAFE_AREAS = {
  top: 140,
  bottom: 240,
  left: 64,
  right: 128,
  // Área segura central calculada
  safeWidth: 1080 - 64 - 128, // 888px
  safeHeight: 1920 - 140 - 240, // 1540px
} as const;

export const TYPOGRAPHY = {
  fontFamilies: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  sizes: {
    xs: 20,
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
    "2xl": 60,
    "3xl": 76,
    "4xl": 96,
    display: 120,
  },
  lineHeights: {
    tight: 1.05,
    snug: 1.2,
    normal: 1.35,
    relaxed: 1.5,
  },
  letterSpacings: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0em",
    wide: "0.04em",
    wider: "0.08em",
    widest: "0.15em",
  },
} as const;

export const SPACING = {
  xxs: 6,
  xs: 12,
  sm: 18,
  md: 24,
  lg: 36,
  xl: 48,
  "2xl": 64,
  "3xl": 80,
  "4xl": 112,
} as const;

export const RADII = {
  none: 0,
  sm: 10,
  md: 18,
  lg: 28,
  xl: 40,
  "2xl": 56,
  full: 9999,
} as const;

export const SHADOWS = {
  subtle: "0 4px 20px rgba(0, 0, 0, 0.25)",
  medium: "0 12px 36px rgba(0, 0, 0, 0.4)",
  heavy: "0 24px 64px rgba(0, 0, 0, 0.6)",
  glowCyan: "0 0 32px rgba(56, 189, 248, 0.45)",
  glowAmber: "0 0 32px rgba(245, 158, 11, 0.45)",
  glowViolet: "0 0 32px rgba(168, 85, 247, 0.45)",
  glowEmerald: "0 0 32px rgba(16, 185, 129, 0.45)",
} as const;

export const ANIMATION_SPRINGS = {
  // Rápido y con rebote contenido: ideal para palabras clave y badges
  snappy: {
    damping: 14,
    stiffness: 160,
    mass: 0.7,
  },
  // Suave y elegante: ideal para transiciones editoriales y zoom
  smooth: {
    damping: 22,
    stiffness: 90,
    mass: 1.0,
  },
  // Rebote dinámico: ideal para elementos kinetic y stickers
  bouncier: {
    damping: 11,
    stiffness: 140,
    mass: 0.8,
  },
  // Sutil y desacelerado: ideal para fondos y paneles grandes
  gentle: {
    damping: 28,
    stiffness: 70,
    mass: 1.2,
  },
} as const;
