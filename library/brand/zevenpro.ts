import { BrandProfile } from "./BrandProfile";

/**
 * ZevenPRO — identidad visual definida por el usuario el 2026-10-04 (estética clara, moderna y estratégica:
 * estrategia, marketing, tecnología e implementación).
 * Reglas:
 *  1. No usar fondo oscuro como base: fondo claro crema con transición suave hacia azul.
 *  2. Amarillo como color principal de énfasis: botones, líneas, marcadores y palabras clave.
 *  3. Azul fuerte solo como acento adicional para tecnología, IA, análisis o elementos digitales.
 *  4. Rojo con moderación: advertencias, problemas o llamadas de atención.
 *  5. Composición limpia y aireada; tarjetas blancas, bordes suaves y sombras ligeras.
 * Primera aplicación: VIDEO-001 candidata V3 (src/compositions/video001v3).
 */
export const zevenproPalette = {
  /** Fondo crema claro. */
  bg: "#F4F1EA",
  /** Fondo azul suave. */
  bgBlue: "#E8EDF1",
  /** Fondo azul claro. */
  bgBlueLight: "#DCE7F2",
  /** Tarjetas o bloques. */
  card: "#FFFFFF",
  /** Texto principal. */
  ink: "#17171D",
  /** Texto secundario. */
  ink2: "#6F7280",
  /** Bordes suaves. */
  border: "#E4E1DA",
  /** Amarillo principal ZevenPRO. */
  yellow: "#F5C518",
  /** Amarillo suave. */
  yellowSoft: "#FFF3B8",
  /** Azul fuerte: tecnología, IA, datos, énfasis digital. */
  blue: "#0057FF",
  /** Rojo: alertas, errores, urgencia, puntos críticos. */
  red: "#E1062C",
} as const;

export const zevenpro: BrandProfile = {
  id: "zevenpro",
  name: "ZevenPRO",
  preset: "editorial-dynamic", // fallback del repo (getPreset); no es una decisión de marca
  overrides: {
    accentColor: zevenproPalette.yellow,
    accentSecondary: zevenproPalette.blue,
    background: zevenproPalette.bg,
  },
  logo: undefined,
  pendiente: [
    "tipografía de marca (titulares y texto): VIDEO-001 V3 usa Inter Tight 800/900 provisionalmente",
    "logo en /public y su versión clara/oscura",
  ],
};
