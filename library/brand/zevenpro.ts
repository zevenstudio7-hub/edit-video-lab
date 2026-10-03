import { BrandProfile } from "./BrandProfile";

/**
 * ZevenPRO — perfil de marca INCOMPLETO a propósito.
 * El repo no contiene colores ni tipografías de marca de ZevenPRO y no se inventan:
 * mientras `overrides` esté vacío, el resultado es el preset base tal cual (acento neutro).
 * Completar `overrides` con los valores reales (accentColor, accentSecondary, background, useSerifHeading)
 * y vaciar `pendiente` cuando estén confirmados.
 */
export const zevenpro: BrandProfile = {
  id: "zevenpro",
  name: "ZevenPRO",
  preset: "editorial-dynamic", // fallback del repo (getPreset); no es una decisión de marca
  overrides: undefined,
  logo: undefined,
  pendiente: [
    "color de acento (accentColor)",
    "color secundario (accentSecondary)",
    "fondo de marca (background), si difiere del preset",
    "tipografía de titulares: ¿serif de marca? (useSerifHeading) y fuente concreta",
    "logo en /public y su versión clara/oscura",
  ],
};
