import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FocusPanImage } from "../../../library/recipes/FocusPanImage";
import { CTA } from "../../components/CTA";
import { HighlightWord } from "../../components/HighlightWord";
import type { ChipsSupport, CtaSupport, ImageSupport, ListSupport, StatementSupport, TimelineSupport, VersusSupport } from "./types";

// Zona superior de VIDEO-001 (#edit-2-pantalla-dividida). Los ~140 px de arriba quedan bajo la interfaz de las
// plataformas: ahí no va texto crítico. La columna derecha (128 px) solo se ocupa con imagen, nunca con texto clave.
const SAFE_TOP = 150;
const SIDE = 64;
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 160, mass: 0.8 } });
};

const Kicker: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const e = useEnter(2, 16);
  return (
    <div
      style={{
        position: "absolute", left: SIDE, top: SAFE_TOP - 6, zIndex: 5,
        padding: "8px 18px", borderRadius: 6, background: accent, color: "#111",
        fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
        transform: `translateY(${interpolate(e, [0, 1], [-14, 0])}px) scale(${interpolate(e, [0, 1], [0.9, 1])})`,
        opacity: interpolate(e, [0, 1], [0, 1]), boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {text}
    </div>
  );
};

const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute", right: 28, bottom: 14, zIndex: 5, maxWidth: 760, textAlign: "right",
      fontFamily: FONT, fontSize: 19, fontWeight: 500, color: "rgba(255,255,255,0.62)",
      textShadow: "0 1px 3px rgba(0,0,0,0.8)",
    }}
  >
    {text}
  </div>
);

const ImageView: React.FC<{ s: ImageSupport; zoneWidth: number; zoneHeight: number; accent: string }> = ({ s, zoneWidth, zoneHeight, accent }) => {
  const frame = useCurrentFrame();
  const cover = s.fit === "cover";
  // Las capturas con texto se encuadran por debajo de la franja de interfaz; las fotos llenan la zona.
  const top = cover ? 0 : s.kicker ? SAFE_TOP + 44 : SAFE_TOP - 40;
  const bottom = cover ? 0 : 34;
  const titleOn = s.title && frame >= s.title.frame;
  const t = useEnter(s.title?.frame ?? 0, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top, bottom }}>
        <FocusPanImage
          src={staticFile(s.src)} imageWidth={s.width} imageHeight={s.height}
          zoneWidth={zoneWidth} zoneHeight={zoneHeight - top - bottom}
          keys={s.keys} marks={s.marks} fit={s.fit ?? "contain"} padding={s.padding ?? 28}
          card={s.card} drift={s.drift} accent={accent}
        />
      </div>
      {cover ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,8,14,0.55) 0%, rgba(5,8,14,0) 32%, rgba(5,8,14,0) 70%, rgba(5,8,14,0.6) 100%)" }} /> : null}
      {titleOn && s.title ? (
        <div
          style={{
            position: "absolute", left: SIDE, right: SIDE, zIndex: 4,
            ...(s.title.position === "top" ? { top: SAFE_TOP + 50 } : { bottom: 70 }),
            fontFamily: FONT, fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#fff",
            textShadow: "0 4px 24px rgba(0,0,0,0.7)",
            transform: `translateY(${interpolate(t, [0, 1], [24, 0])}px)`, opacity: interpolate(t, [0, 1], [0, 1]),
          }}
        >
          {s.title.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const ICONS: Record<ListSupport["icon"], string> = { check: "✓", plus: "+", cross: "✕", arrow: "→" };

const ListView: React.FC<{ s: ListSupport; accent: string }> = ({ s, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = s.strikeAt === undefined ? 0 : interpolate(frame, [s.strikeAt, s.strikeAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const size = s.items.length > 4 ? 50 : 58;
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP + (s.kicker ? 70 : 20)}px ${SIDE + 8}px 40px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: s.items.length > 4 ? 14 : 22 }}>
      {s.items.map((it, i) => {
        const e = spring({ frame: frame - it.frame, fps, config: { damping: 15, stiffness: 170, mass: 0.7 } });
        if (frame < it.frame) return <div key={i} style={{ height: size * 1.15 }} />;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: interpolate(e, [0, 1], [0, 1]) * (1 - 0.45 * strike), transform: `translateX(${interpolate(e, [0, 1], [-40, 0])}px)` }}>
            <div style={{ width: size * 0.95, height: size * 0.95, borderRadius: "50%", background: accent, color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: size * 0.55, fontWeight: 900, flexShrink: 0 }}>
              {ICONS[s.icon]}
            </div>
            <div style={{ position: "relative", fontFamily: FONT, fontSize: size, fontWeight: 800, color: "#fff", letterSpacing: "-0.015em", lineHeight: 1.1 }}>
              {it.text}
              <div style={{ position: "absolute", left: -6, top: "54%", height: 7, width: `${strike * 104}%`, background: "#ff4d4d", borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
      {s.footer && frame >= s.footer.frame ? (
        <div style={{ marginTop: 14, fontFamily: FONT, fontSize: 54, fontWeight: 900, color: accent, transform: `scale(${interpolate(spring({ frame: frame - s.footer.frame, fps, config: { damping: 12, stiffness: 180 } }), [0, 1], [0.6, 1])})`, transformOrigin: "left center" }}>
          {s.footer.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]/gu, "");

const StatementView: React.FC<{ s: StatementSupport; accent: string }> = ({ s, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const longest = Math.max(...s.lines.map((l) => l.text.length));
  const size = longest > 26 ? 66 : longest > 16 ? 80 : 104;
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP + (s.kicker ? 60 : 0)}px ${SIDE}px 40px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
      {s.lines.map((l, i) => {
        if (frame < l.frame) return null;
        const hl = new Set((l.highlight ?? []).map(norm));
        return (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", fontFamily: FONT, fontSize: size, fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.025em", color: "#fff" }}>
            {l.text.split(" ").map((w, j) => {
              const e = spring({ frame: frame - l.frame - j * 2, fps, config: { damping: 14, stiffness: 190, mass: 0.6 } });
              return (
                <span key={j} style={{ display: "inline-block", marginRight: "0.26em", opacity: interpolate(e, [0, 1], [0, 1]), transform: `translateY(${interpolate(e, [0, 1], [36, 0])}px)` }}>
                  {hl.has(norm(w)) ? <HighlightWord variant="marker" color={accent} delayFrames={l.frame + j * 2 + 6} style={{ padding: "0 4px" }}>{w}</HighlightWord> : w}
                </span>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const VersusCard: React.FC<{ side: VersusSupport["left"]; dir: 1 | -1; accent: string }> = ({ side, dir, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < side.frame) return <div style={{ flex: 1 }} />;
  const e = spring({ frame: frame - side.frame, fps, config: { damping: 16, stiffness: 150, mass: 0.8 } });
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: interpolate(e, [0, 1], [0, 1]), transform: `translateX(${interpolate(e, [0, 1], [60 * dir, 0])}px)` }}>
      <div style={{ padding: "6px 16px", borderRadius: 6, background: accent, color: "#111", fontFamily: FONT, fontSize: 24, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>{side.label}</div>
      <div style={{ width: 440, height: 300, borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 18px 48px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile(side.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {side.quote ? <div style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', fontStyle: "italic", fontSize: 34, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.15, maxWidth: 440 }}>“{side.quote}”</div> : null}
    </div>
  );
};

const VersusView: React.FC<{ s: VersusSupport; accent: string }> = ({ s, accent }) => (
  <AbsoluteFill style={{ padding: `${SAFE_TOP + 20}px 40px 40px`, display: "flex", flexDirection: "row", alignItems: "center", gap: 28 }}>
    <VersusCard side={s.left} dir={-1} accent={accent} />
    <VersusCard side={s.right} dir={1} accent={accent} />
  </AbsoluteFill>
);

const ChipsView: React.FC<{ s: ChipsSupport; accent: string }> = ({ s, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP + 20}px ${SIDE}px 40px`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
      {s.title ? <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{s.title}</div> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {s.chips.map((c, i) => {
          if (frame < c.frame) return null;
          const e = spring({ frame: frame - c.frame, fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
          return (
            <div key={i} style={{ padding: "16px 30px", borderRadius: 999, background: i % 2 ? "rgba(255,255,255,0.1)" : accent, color: i % 2 ? "#fff" : "#111", border: `2px solid ${accent}`, fontFamily: FONT, fontSize: 46, fontWeight: 800, transform: `scale(${interpolate(e, [0, 1], [0.5, 1])})`, opacity: interpolate(e, [0, 1], [0, 1]) }}>
              {c.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CtaView: React.FC<{ s: CtaSupport }> = ({ s }) => (
  <AbsoluteFill style={{ paddingTop: SAFE_TOP - 10, alignItems: "center", justifyContent: "center" }}>
    <CTA headline={s.headline} subline={s.subline} buttonText={s.buttonText} arrow={false} buttonTextColor="#111" style={{ padding: "30px 28px" }} />
  </AbsoluteFill>
);

export const SupportView: React.FC<{ support: TimelineSupport; zoneWidth: number; zoneHeight: number; accent: string }> = ({ support, zoneWidth, zoneHeight, accent }) => {
  const frame = useCurrentFrame();
  // Unión entre apoyos: entra desde el fondo en 6 frames (sin fundido a negro de la composición).
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {support.kind === "image" ? <ImageView s={support} zoneWidth={zoneWidth} zoneHeight={zoneHeight} accent={accent} /> : null}
      {support.kind === "list" ? <ListView s={support} accent={accent} /> : null}
      {support.kind === "statement" ? <StatementView s={support} accent={accent} /> : null}
      {support.kind === "versus" ? <VersusView s={support} accent={accent} /> : null}
      {support.kind === "chips" ? <ChipsView s={support} accent={accent} /> : null}
      {support.kind === "cta" ? <CtaView s={support} /> : null}
      {support.kicker ? <Kicker text={support.kicker} accent={accent} /> : null}
      {support.credit ? <Credit text={support.credit} /> : null}
    </AbsoluteFill>
  );
};
