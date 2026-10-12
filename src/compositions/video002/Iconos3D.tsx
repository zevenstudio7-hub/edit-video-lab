import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ICON3D_NAMES, Icon3D } from "./icons3d";
import { brandBg, FONT, P } from "./ui";
import { PuffyAvatar, PuffyCheck, PuffyChip, PuffyHeart, ReliefDefs } from "./relief";
import { Icon } from "./ui";

// Hoja de revisión de los iconos 3D de VIDEO-002 (composición «Video002Iconos»): todos los modelos con su entrada.
const LABEL: Record<string, string> = { clock: "Tiempo", play: "Contenido", chart: "Datos", eye: "Atención", people: "Audiencia", store: "Negocio", target: "Objetivo", magnifier: "Buscar clientes", cart: "Ventas", box: "Producto", popcorn: "Entretenimiento", gear: "Automatizar", coins: "Oportunidades", checklist: "Tareas" };

export const Iconos3D: React.FC = () => {
  const f = useCurrentFrame();
  const S = 300;
  return (
    <AbsoluteFill style={brandBg}>
      <ReliefDefs />
      {ICON3D_NAMES.map((name, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        return (
          <div key={name} style={{ position: "absolute", left: 45 + col * 335, top: 60 + row * 370, width: S }}>
            <Icon3D name={name} size={S} f={f} at={8 + i * 3} dur={22} />
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: P.ink, textAlign: "center", marginTop: -6 }}>{LABEL[name]}</div>
          </div>
        );
      })}
      {/* relieve SVG (opción 2): público, fichas e insignias */}
      <div style={{ position: "absolute", left: 720, top: 1560, width: 320, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
        {(["ink", "blue", "yellow", "red"] as const).map((tone) => <PuffyAvatar key={tone} size={92} tone={tone} />)}
        <PuffyChip size={92} ring={P.blue}><Icon name="play" size={44} /></PuffyChip>
        <PuffyCheck size={92} />
        <PuffyHeart size={92} />
      </div>
      <div style={{ position: "absolute", left: 720, top: 1852, width: 320, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: P.ink, textAlign: "center" }}>Relieve (SVG)</div>
    </AbsoluteFill>
  );
};
