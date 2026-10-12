import React from "react";
import { PresetId, PresetOverrides, PresetProvider } from "../../src/presets";

/**
 * Perfil de marca = preset base + overrides que el repo ya soporta (acento, secundario,
 * fondo y serif en titulares). No duplica el sistema de presets: lo nombra y lo hace reutilizable.
 * Para otra marca: copiar brand/zevenpro.ts, cambiar los valores y envolver la composición con <BrandProvider>.
 */
export interface BrandProfile {
  id: string;
  name: string;
  preset: PresetId;
  overrides?: PresetOverrides;
  /** Ruta relativa a /public (p. ej. "brand/zevenpro/logo.svg"). Solo si el archivo existe. */
  logo?: string;
  /** Qué falta por confirmar de esta marca. Vacío cuando el perfil está completo. */
  pendiente: string[];
}

export const BrandProvider: React.FC<{ brand: BrandProfile; children: React.ReactNode }> = ({
  brand,
  children,
}) => (
  <PresetProvider preset={brand.preset} overrides={brand.overrides}>
    {children}
  </PresetProvider>
);
