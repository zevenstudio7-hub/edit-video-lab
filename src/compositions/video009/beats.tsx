/**
 * VIDEO-009 · bloques del guion (Google Doc «Guion Video Lab · Showreel #edit-5-creator · 0:58»).
 * Cada bloque es una escena sobre la toma principal (proxy continuo con los cortes de la orden). Los frames son de la
 * composición a 25 fps y salen de analysis/video-009-timeline.json (video-orders/VIDEO-009.json).
 */
import React from "react";
import { Seguir } from "./Seguir";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  ANTON, BottomShade, C, Chip, Cursor, Flash, Giant, Glass, INTER, Icon, MONO, S1Layer, S2Layer, S5Layer, S6Layer, S8Layer, S9Layer, SCRIPT, SERIF,
  ease, shadow, takeWords, tk, useIn, type Block,
} from "./kit";

const PROXY = staticFile("video-009/proxy.mp4");
const CUTOUT = staticFile("video-009/cutout.webm");
const sup = (n: string) => staticFile(`video-009/support/${n}.mp4`);

const span = (a: string, b: string = a) => [tk(a).from_f, tk(b).to_f] as const;
/** Rango [desde, hasta) de cada bloque del guion, en frames de la composición, tomado de la línea de tiempo de la orden. */
export const BEATS = {
  b1: span("T01"), b2: span("T02"), b3: span("T03"), b4: span("T04"), b5a: span("T05"), b5b: span("T06"),
  b6a: span("T07a", "T07b"), b6c: span("T08"), b6d: span("T09"), b7a: span("T10"), b7b: span("T11"), b8: span("T12"), b9: span("T13"), b10: span("T14"),
} as const;
const dur = (k: keyof typeof BEATS) => BEATS[k][1] - BEATS[k][0];

// ───────── presentador (proxy continuo) con cámara virtual por plano ─────────
const Presenter: React.FC<{ start: number; dur: number; z0?: number; z1?: number; ox?: number; oy?: number; blur?: number; dim?: number; x?: number; y?: number; w?: number; h?: number; radius?: number; shift?: number }> = ({ start, dur, z0 = 1.2, z1, ox = 44, oy = 28, blur = 0, dim = 0, x = 0, y = 0, w = 1080, h = 1920, radius = 0, shift = 0 }) => {
  const f = useCurrentFrame();
  const z = z0 + ((z1 ?? z0 * 1.06) - z0) * (f / dur);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: radius, overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={PROXY} muted trimBefore={start} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transformOrigin: `${ox}% ${oy}%`, transform: `scale(${z}) translateX(${shift}px)`, filter: blur ? `blur(${blur}px)` : undefined }} />
      {dim ? <AbsoluteFill style={{ background: `rgba(8,10,24,${dim})` }} /> : null}
    </div>
  );
};

/** Persona + escritorio + computador recortados (matte de Vision + polígonos estáticos; src/videoAnalysis/video009/buildCutout.mjs). */
const Cutout: React.FC<{ start: number; scale?: number; ox?: number; oy?: number; dx?: number; dy?: number; clip?: string }> = ({ start, scale = 1, ox = 44, oy = 31, dx = 0, dy = 0, clip }) => (
  <OffthreadVideo
    src={CUTOUT}
    transparent
    muted
    trimBefore={start}
    style={{ position: "absolute", left: dx, top: dy, width: 1080, height: 1920, transformOrigin: `${ox}% ${oy}%`, transform: `scale(${scale})`, clipPath: clip, filter: "drop-shadow(0 20px 40px rgba(0,0,0,.35))" }}
  />
);

/** Tarjeta con un clip de apoyo: entra con muelle desde un lado, flota y sale al final. */
const Card: React.FC<{ src: string; w: number; h: number; x: number; y: number; at?: number; from?: "right" | "left" | "bottom" | "top"; rot?: number; radius?: number; out?: number; z?: number; fit?: "cover" | "contain" }> = ({ src, w, h, x, y, at = 0, from = "right", rot = 0, radius = 36, out, z = 1, fit = "cover" }) => {
  const f = useCurrentFrame();
  const t = useIn(at, 15, 120);
  const o = out !== undefined ? interpolate(f, [out, out + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const d = (1 - t) * 900;
  const ox = from === "right" ? d : from === "left" ? -d : 0;
  const oy = from === "bottom" ? d : from === "top" ? -d : 0;
  const fl = Math.sin(f / 14) * 7;
  return (
    <div style={{ position: "absolute", left: x, top: y + fl, width: w, height: h, borderRadius: radius, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.45)", border: "6px solid rgba(255,255,255,.92)", transform: `translate(${ox}px,${oy}px) rotate(${rot + (1 - t) * 8}deg) scale(${0.9 + 0.1 * t})`, opacity: o, zIndex: z, background: "#000" }}>
      <OffthreadVideo src={src} muted style={{ width: "100%", height: "100%", objectFit: fit }} />
    </div>
  );
};

// ───────── B1 · SIN EDITOR (hook): cuatro videos borrosos detrás; tú, el escritorio y el computador recortados llenando el cuadro de abajo ─────────
export const B1: React.FC = () => {
  const f = useCurrentFrame();
  const bg = [
    { s: sup("s001"), x: 10, y: 40, r: -7 }, { s: sup("s005"), x: 560, y: 70, r: 6 },
    { s: sup("s008"), x: 0, y: 650, r: 5 }, { s: sup("s003"), x: 580, y: 680, r: -6 },
  ];
  return (
    <AbsoluteFill style={{ background: "#0b1230" }}>
      <div style={{ position: "absolute", inset: 0, filter: "blur(16px) brightness(.8) saturate(1.1)", transform: `translateY(${Math.sin(f / 30) * 14}px) scale(1.12)` }}>
        {bg.map((c, i) => (
          <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 480, height: 853, transform: `rotate(${c.r}deg)`, borderRadius: 40, overflow: "hidden" }}>
            <OffthreadVideo src={c.s} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <Giant lines={["SIN", "EDITOR"]} size={260} top={270} at={3} />
      <Cutout start={BEATS.b1[0]} scale={1.0} ox={50} oy={50} />
      <BottomShade strength={0.5} />
      <S2Layer takes={["T01"]} offset={0} keys={["ia"]} y={1440} />
    </AbsoluteFill>
  );
};

// ───────── B2 · VIDEO-001 · pantalla dividida (2A · S1) ─────────
export const B2: React.FC = () => {
  const blocks: Block[] = [{ w0: 0, w1: 1 }, { w0: 2, w1: 3 }, { w0: 4, w1: 7 }];
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b2[0]} dur={dur("b2")} z0={1.25} z1={1.34} blur={14} dim={0.45} />
      <Giant lines={["PANTALLA", "DIVIDIDA"]} size={170} top={255} at={2} />
      <Card src={sup("s001")} w={400} h={711} x={340} y={630} at={1} from="right" rot={-3} />
      <Chip at={10} x={540} y={1390} tone="gold">VIDEO-001 · 2A · S1</Chip>
      <Flash />
      <S1Layer take="T02" blocks={blocks} takeEnd={BEATS.b2[1]} offset={BEATS.b2[0]} y={1465} />
    </AbsoluteFill>
  );
};

// ───────── B3 · VIDEO-005 · motion a pantalla completa (1C · S1 + S4) ─────────
export const B3: React.FC = () => {
  const f = useCurrentFrame();
  const ws = takeWords("T03");
  const pipAt = ws[6].from - BEATS.b3[0]; // «Yo»
  const backAt = ws[11].from - BEATS.b3[0]; // «cámara»
  const inMotion = f < backAt;
  const readBlocks: Block[] = [{ w0: 0, w1: 1 }, { w0: 2, w1: 5, emph: true, tone: "gold" }, { w0: 6, w1: 8 }, { w0: 9, w1: 10 }, { w0: 11, w1: 13, emph: true, tone: "pink" }];
  const motionText = ["MOTION", "A PANTALLA COMPLETA"];
  const pip = useIn(pipAt, 14, 150);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {inMotion ? (
        <>
          <Presenter start={BEATS.b3[0]} dur={dur("b3")} z0={1.25} z1={1.3} blur={16} dim={0.5} />
          <Card src={sup("s005")} w={523} h={930} x={278} y={265} at={1} from="bottom" rot={-2} radius={36} />
          {/* S4 · titular de escena en un panel ink dentro del área segura */}
          <div style={{ position: "absolute", left: 65, top: 1290, width: 875, height: 210, borderRadius: 40, background: C.ink, boxShadow: "0 24px 60px rgba(0,0,0,.45)", padding: "26px 40px", fontFamily: INTER, fontWeight: 900, color: "#fff", letterSpacing: "-0.045em", lineHeight: 0.92 }}>
            {motionText.map((l, i) => {
              const t = interpolate(f - i * 3 - 2, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return <div key={i} style={{ fontSize: [112, 62][i], color: i === 1 ? C.pink : "#fff", opacity: t, transform: `translateY(${(1 - t) * 34}px)` }}>{l}</div>;
            })}
          </div>
          {f >= pipAt ? (
            <div style={{ position: "absolute", left: 70, top: 300, width: 250, height: 250, borderRadius: 999, overflow: "hidden", border: "8px solid #fff", boxShadow: "0 20px 60px rgba(0,0,0,.4)", transform: `scale(${pip})` }}>
              <OffthreadVideo src={PROXY} muted trimBefore={BEATS.b3[0]} style={{ position: "absolute", width: "230%", height: "230%", left: "-62%", top: "-30%", objectFit: "cover" }} />
            </div>
          ) : null}
          <Chip at={6} x={540} y={1245} tone="ui" size={26}>VIDEO-005 · 1C · S1+S4</Chip>
        </>
      ) : (
        <>
          <Presenter start={BEATS.b3[0] + backAt} dur={dur("b3") - backAt} z0={1.3} z1={1.42} oy={24} />
          <BottomShade strength={0.65} />
          <S1Layer take="T03" blocks={readBlocks} takeEnd={BEATS.b3[1]} offset={BEATS.b3[0]} y={1438} />
        </>
      )}
      <Flash />
    </AbsoluteFill>
  );
};

// ───────── B4 · look de cine + S8 hacia el sujeto ─────────
export const B4: React.FC = () => {
  const f = useCurrentFrame();
  const split = 540 + Math.sin(f / 18) * 250; // divisor del antes/después
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Presenter start={BEATS.b4[0]} dur={dur("b4")} z0={1.0} z1={1.08} ox={44} oy={20} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${split}px)` }}>
        <OffthreadVideo src={staticFile("video-009/look-t04.mp4")} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transformOrigin: "44% 20%", transform: `scale(${1.0 + 0.08 * (f / dur("b4"))})` }} />
      </div>
      <div style={{ position: "absolute", left: split - 2, top: 250, width: 4, height: 760, background: "#fff", boxShadow: "0 0 24px rgba(255,255,255,.8)" }} />
      <Chip at={4} x={190} y={290} tone="dark">ORIGINAL</Chip>
      <Chip at={8} x={840} y={290} tone="gold">LOOK DE CINE</Chip>
      <S8Layer take="T04" offset={BEATS.b4[0]} x={65} y={520} width={335} align="right" keys={["look", "mueven"]} size={56} />
      <Card src={sup("s004")} w={780} h={439} x={100} y={990} at={14} from="bottom" rot={-2} radius={28} />
      <Chip at={22} x={490} y={1465} tone="white">VIDEO-004 · 3C · S8</Chip>
      <Flash />
    </AbsoluteFill>
  );
};

// ───────── B5 · diagramas (VIDEO-007) y datos ocultos (VIDEO-006) ─────────
export const B5: React.FC = () => {
  const f = useCurrentFrame();
  const cutAt = dur("b5a");
  const second = f >= cutAt;
  const dataAt = takeWords("T06")[4].from - BEATS.b5a[0]; // «datos»
  const hide = interpolate(f, [dataAt, dataAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b5a[0]} dur={dur("b5a") + dur("b5b")} z0={1.15} z1={1.25} blur={second ? 18 : 10} dim={0.55} />
      {!second ? (
        <>
          <Giant lines={["DIAGRAMAS"]} size={190} top={255} at={1} />
          <Card src={sup("s007")} w={870} h={489} x={70} y={520} at={1} from="left" rot={-3} radius={30} />
          <Chip at={8} x={540} y={1130} tone="ui">VIDEO-007 · diagramas</Chip>
          <S5Layer take="T05" offset={BEATS.b5a[0]} keyWord="diagramas" top={1180} left={90} width={850} />
        </>
      ) : (
        <>
          <Giant lines={["DATOS", "OCULTOS"]} size={150} top={255} at={0} />
          <Card src={sup("s006")} w={380} h={676} x={350} y={545} at={0} from="right" rot={3} />
          {/* tapa de redacción que cruza la zona sensible */}
          <div style={{ position: "absolute", left: 390, top: 790, width: 300 * hide, height: 40, borderRadius: 12, background: C.ink, boxShadow: "0 0 0 4px rgba(255,255,255,.5)" }} />
          <Chip at={6} x={540} y={1250} tone="gold">VIDEO-006 · datos ocultos</Chip>
          <S5Layer take="T06" offset={BEATS.b5a[0]} keyWord="sensibles" top={1295} left={90} width={850} keySize={120} />
        </>
      )}
      {f === 0 || f === cutAt ? <Flash /> : null}
    </AbsoluteFill>
  );
};

// ───────── B6 · nueve estilos · cinco looks · veinte movimientos · tú eliges ─────────
const SAMPLES: Array<{ id: string; node: React.ReactNode }> = [
  { id: "S1", node: <div><div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, color: "#fff" }}>estilos de</div><div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 84, color: C.pink, letterSpacing: "-0.045em", lineHeight: 0.9 }}>nueve</div></div> },
  { id: "S2", node: <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 64, color: C.gold }}>nueve</div> },
  { id: "S3", node: <div style={{ fontFamily: ANTON, fontSize: 70, color: "#fff", lineHeight: 0.95 }}>NUEVE<div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54 }}>estilos</div></div> },
  { id: "S4", node: <div style={{ background: C.ink, padding: "14px 12px", fontFamily: INTER, fontWeight: 900, fontSize: 58, color: "#fff", letterSpacing: "-0.04em" }}>NUEVE</div> },
  { id: "S5", node: <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 108, backgroundImage: "linear-gradient(180deg,#fff,#C9CDD3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>nueve</div> },
  { id: "S6", node: <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: "#fff" }}>son <span style={{ background: "#fff", color: C.ink, borderRadius: 10, padding: "0 10px" }}>nueve</span></div> },
  { id: "S7", node: <div style={{ borderLeft: `6px solid ${C.ui}`, paddingLeft: 14, fontFamily: INTER, fontWeight: 600, fontSize: 36, color: "#fff" }}>Nueve <span style={{ color: "#6aa2ff" }}>estilos</span></div> },
  { id: "S8", node: <div style={{ fontFamily: INTER, fontWeight: 300, fontSize: 38, color: "#fff" }}>nueve <b style={{ fontWeight: 700 }}>estilos</b></div> },
  { id: "S9", node: <div style={{ fontFamily: SERIF, fontSize: 70, color: C.cream, lineHeight: 0.8 }}>nueve <i>estilos</i></div> },
];

export const B6a: React.FC = () => {
  const f = useCurrentFrame();
  const looksAt = takeWords("T07b")[0].from - BEATS.b6a[0]; // «Cinco»
  const nine = takeWords("T07a")[0].from - BEATS.b6a[0];
  const names = ["luminoso-aire", "oscuro-cinematico", "burdeos-calido", "cine-calido", "cine-sobrio"];
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b6a[0]} dur={dur("b6a")} z0={1.3} z1={1.38} blur={22} dim={0.72} />
      {f < looksAt ? (
        <>
          <Giant lines={["9"]} size={300} top={255} color={C.gold} at={nine} />
          <div style={{ position: "absolute", left: 65, top: 600, width: 875, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {SAMPLES.map((s, i) => {
              const at = nine + 2 + i * 5;
              const t = interpolate(f - at, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return (
                <Glass key={s.id} style={{ height: 240, borderRadius: 34, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", opacity: t, transform: `translateY(${(1 - t) * 60}px) scale(${0.85 + 0.15 * t})`, background: "rgba(10,14,40,.62)" }}>
                  <div style={{ position: "absolute", left: 18, top: 14, fontFamily: MONO, fontSize: 26, color: C.gold, fontWeight: 700 }}>{s.id}</div>
                  <div style={{ padding: 20 }}>{s.node}</div>
                </Glass>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <Giant lines={["5 LOOKS"]} size={190} top={255} color="#fff" at={looksAt} />
          <div style={{ position: "absolute", left: 65, top: 520, width: 875, display: "flex", justifyContent: "center" }}>
            {names.map((n, i) => {
              const at = looksAt + 3 + i * 6;
              const t = interpolate(f - at, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return (
                <div key={n} style={{ position: "relative", width: 175, height: 745, overflow: "hidden", clipPath: `inset(${(1 - t) * 100}% 0 0 0)` }}>
                  <Img src={staticFile(`video-009/looks/look${i}.jpg`)} style={{ position: "absolute", left: -i * 175, top: 0, width: 875, height: 745 }} />
                  <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 17, color: "#fff", fontWeight: 700, textShadow: shadow(0.8) }}>{n}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <Flash frames={5} />
      <S2Layer takes={["T07a", "T07b"]} offset={BEATS.b6a[0]} keys={["nueve", "cinco", "looks"]} y={1440} />
    </AbsoluteFill>
  );
};

const MOTIONS: Array<(t: number, f: number) => React.CSSProperties> = [
  (t) => ({ transform: `scale(${t})` }),
  (t) => ({ transform: `translateX(${(1 - t) * -80}px)`, opacity: t }),
  (t) => ({ transform: `translateY(${(1 - t) * 80}px)`, opacity: t }),
  (t) => ({ transform: `rotate(${(1 - t) * -180}deg) scale(${t})` }),
  (t) => ({ transform: `perspective(300px) rotateY(${(1 - t) * 90}deg)` }),
  (_t, f) => ({ transform: `translateY(${-Math.abs(Math.sin(f / 4)) * 30}px)` }),
  (_t, f) => ({ transform: `rotate(${f * 12}deg)` }),
  (_t, f) => ({ transform: `translateX(${Math.sin(f * 1.4) * 12}px)` }),
  (t) => ({ filter: `blur(${(1 - t) * 14}px)`, opacity: t }),
  (t) => ({ transform: `translateY(${(1 - t) * -90}px)`, opacity: t }),
  (t) => ({ transform: `scale(${2 - t})`, opacity: t }),
  (_t, f) => ({ transform: `rotate(${Math.sin(f / 5) * 25}deg)`, transformOrigin: "50% 0%" }),
  (_t, f) => ({ transform: `scale(${1 + Math.sin(f / 4) * 0.2})` }),
  (t) => ({ clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }),
  (t) => ({ transform: `scaleX(${t * 1.3}) scaleY(${2 - t})` }),
  (_t, f) => ({ transform: `translate(${Math.cos(f / 4) * 20}px,${Math.sin(f / 4) * 20}px)` }),
  (_t, f) => ({ transform: `skewX(${Math.sin(f / 5) * 18}deg)` }),
  (t) => ({ transform: `scale(${t > 0.8 ? 1 + (1 - t) * 3 : t * 1.2})` }),
  (t) => ({ transform: `translateX(${(1 - t) * 90}px) rotate(${(1 - t) * 90}deg)`, opacity: t }),
  (_t, f) => ({ opacity: 0.35 + 0.65 * Math.abs(Math.sin(f / 5)) }),
];

export const B6c: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.min(20, Math.round(interpolate(f, [2, 30], [0, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b6c[0]} dur={dur("b6c")} z0={1.4} z1={1.45} blur={22} dim={0.72} />
      <Giant lines={[String(n)]} size={320} top={255} color={C.gold} at={0} />
      <div style={{ position: "absolute", left: 65, top: 660, width: 875, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20 }}>
        {MOTIONS.map((m, i) => {
          const t = interpolate(f - i * 1.1, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          const st = m(t, f);
          return (
            <Glass key={i} style={{ height: 150, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,14,40,.6)" }}>
              <div style={{ width: 64, height: 64, borderRadius: i % 3 === 0 ? 999 : 16, background: i % 4 === 0 ? C.gold : C.ui, ...st }} />
            </Glass>
          );
        })}
      </div>
      <S2Layer takes={["T08"]} offset={BEATS.b6c[0]} keys={["veinte"]} y={1440} />
      <Flash frames={4} />
    </AbsoluteFill>
  );
};

export const B6d: React.FC = () => {
  const f = useCurrentFrame();
  const ws = takeWords("T09");
  const skillAt = ws[3].from - BEATS.b6d[0];
  const a = useIn(2, 14, 150);
  const b = useIn(skillAt, 14, 150);
  const cur = f < skillAt ? 0 : 1;
  const cx = cur === 0 ? 540 : 540;
  const cy = interpolate(f, [4, skillAt - 4, skillAt + 6], [1500, 700, 1150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b6d[0]} dur={dur("b6d")} z0={1.1} z1={1.18} blur={14} dim={0.5} />
      <div style={{ position: "absolute", left: 90, top: 560, width: 850, height: 220, borderRadius: 60, background: "#fff", color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 90, letterSpacing: "-0.04em", transform: `scale(${a})`, boxShadow: cur === 0 ? `0 0 0 10px ${C.gold}` : "none" }}>TÚ ELIGES</div>
      <div style={{ position: "absolute", left: 90, top: 840, width: 850, height: 220, borderRadius: 60, background: C.ui, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 900, fontSize: 90, letterSpacing: "-0.04em", transform: `scale(${b})`, boxShadow: cur === 1 ? `0 0 0 10px ${C.gold}` : "none" }}>LA SKILL ELIGE</div>
      <div style={{ position: "absolute", left: cx, top: cy }}><Cursor /></div>
      <S6Layer take="T09" blocks={[{ w0: 0, w1: 3 }, { w0: 4, w1: 9 }]} takeEnd={BEATS.b6d[1]} offset={BEATS.b6d[0]} pill="skill" y={1430} />
      <Flash frames={4} />
    </AbsoluteFill>
  );
};

// ───────── B7 · tú grabas → la skill analiza, corta, subtitula y arma ─────────
const STEPS = [
  { e: "camera", t: "GRABAS", c: "#fff", fg: C.ink, word: 0 },
  { e: "wave", t: "ANALIZA", c: C.ui, fg: "#fff", word: 4 },
  { e: "scissors", t: "CORTA", c: C.gold, fg: C.ink, word: 5 },
  { e: "captions", t: "SUBTÍTULOS", c: "#fff", fg: C.ink, word: 6 },
  { e: "clapper", t: "ARMA EL VIDEO", c: C.red, fg: "#fff", word: 8 },
];
export const B7a: React.FC = () => {
  const f = useCurrentFrame();
  const ws = takeWords("T10");
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b7a[0]} dur={dur("b7a")} z0={1.2} z1={1.3} blur={18} dim={0.6} />
      <S9Layer take="T10" offset={BEATS.b7a[0]} keys={["grabas", "analiza", "corta", "subtítulos", "arma"]} top={255} size={104} />
      <div style={{ position: "absolute", left: 90, top: 740, width: 850 }}>
        {STEPS.map((s, i) => {
          const at = ws[s.word].from - BEATS.b7a[0];
          const t = interpolate(f - at, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 16, height: 118, borderRadius: 59, background: s.c, color: s.fg, padding: "0 40px", opacity: t, transform: `translateX(${(1 - t) * (i % 2 ? 160 : -160)}px) scale(${0.9 + 0.1 * t})`, boxShadow: "0 18px 50px rgba(0,0,0,.35)" }}>
              <span style={{ fontSize: 80, display: "flex", transform: `rotate(${(1 - t) * -40}deg)` }}><Icon name={s.e as "camera"} /></span>
              <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 64, letterSpacing: "-0.03em" }}>{s.t}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const B7b: React.FC = () => {
  const f = useCurrentFrame();
  const ws = takeWords("T11");
  const typed = "/video-lab VIDEO-009".slice(0, Math.max(0, Math.floor((f - 2) / 1.6)));
  const logoAt = ws[3].from - BEATS.b7b[0];
  const lg = useIn(logoAt, 13, 150);
  return (
    <AbsoluteFill>
      <Presenter start={BEATS.b7b[0]} dur={dur("b7b")} z0={1.3} z1={1.36} blur={20} dim={0.65} />
      <div style={{ position: "absolute", left: 90, top: 330, width: 850, borderRadius: 36, background: "#0c0f1d", border: "2px solid rgba(255,255,255,.18)", boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 12, padding: "20px 24px", background: "#171b2e" }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <i key={c} style={{ width: 20, height: 20, borderRadius: 99, background: c }} />)}</div>
        <div style={{ padding: "34px 36px 44px", fontFamily: MONO, fontSize: 46, color: "#e6e9ff" }}>
          <span style={{ color: C.gold }}>❯ </span>{typed}<span style={{ opacity: f % 10 < 5 ? 1 : 0 }}>▌</span>
          <div style={{ marginTop: 24, fontSize: 30, color: "#8892c8" }}>Analizando · Cortando · Subtitulando · Armando…</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 65, width: 875, top: 920, textAlign: "center", transform: `scale(${lg})`, opacity: Math.min(1, lg * 1.4) }}>
        <div style={{ fontFamily: SCRIPT, fontSize: 190, color: C.cream, lineHeight: 0.9, textShadow: "0 8px 30px rgba(0,0,0,.4)" }}>Video</div>
        <div style={{ fontFamily: ANTON, fontSize: 330, color: "#fff", lineHeight: 0.9, letterSpacing: "0.02em" }}>LAB</div>
      </div>
      <Chip at={4} x={540} y={285} tone="dark" size={26}>ilustración del flujo · no es captura real</Chip>
    </AbsoluteFill>
  );
};

// ───────── B8 · dato en caja (sin precio) ─────────
export const B8: React.FC = () => {
  const f = useCurrentFrame();
  const box = useIn(10, 14, 130);
  const blocks: Block[] = [{ w0: 0, w1: 2 }, { w0: 3, w1: 5 }, { w0: 6, w1: 9 }];
  return (
    <AbsoluteFill style={{ background: "#0b1230" }}>
      <Presenter start={BEATS.b8[0]} dur={dur("b8")} z0={1.3} z1={1.4} blur={22} dim={0.5} />
      <Giant lines={["AHORRAS"]} size={230} top={290} at={0} />
      <Cutout start={BEATS.b8[0]} scale={1.15} ox={44} oy={40} />
      <div style={{ position: "absolute", left: 90, top: 900, width: 850, borderRadius: 40, background: "#fff", padding: "40px 44px", transform: `rotate(${-3 + (1 - box) * 6}deg) scale(${box})`, boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
        <div style={{ fontFamily: MONO, fontSize: 28, color: C.ui, fontWeight: 700, letterSpacing: "0.08em" }}>VIDEO LAB</div>
        <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 76, lineHeight: 0.98, letterSpacing: "-0.04em", color: C.ink, marginTop: 12 }}>
          pagas <span style={{ background: C.gold, padding: "0 10px", borderRadius: 10 }}>una vez</span>,<br />editas y adaptas a tu estilo
        </div>
      </div>
      <BottomShade strength={0.6} />
      <S6Layer take="T12" blocks={blocks} takeEnd={BEATS.b8[1]} offset={BEATS.b8[0]} pill="editor" y={1450} />
      {f < 3 ? <Flash /> : null}
    </AbsoluteFill>
  );
};

// ───────── B9 · escribe VIDEO ─────────
export const B9: React.FC = () => {
  const f = useCurrentFrame();
  const ws = takeWords("T13");
  const videoAt = ws[12].from - BEATS.b9[0];
  const typed = "VIDEO".slice(0, Math.max(0, Math.floor((f - videoAt) / 4)));
  const sent = f > videoAt + 24;
  const t = useIn(2, 14, 130);
  const click = interpolate(f, [videoAt + 20, videoAt + 24, videoAt + 30], [1, 0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.ui }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.14) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.14) 1.5px, transparent 1.5px)", backgroundSize: "70px 70px", backgroundPosition: `0 ${f * 0.8}px` }} />
      <Giant lines={["ESCRIBE", "VIDEO"]} size={260} top={255} color={C.gold} at={2} />
      <Cutout start={BEATS.b9[0]} scale={1.1} ox={50} oy={40} dy={60} />
      <div style={{ position: "absolute", left: 90, top: 940, width: 850, height: 150, borderRadius: 75, background: "#fff", display: "flex", alignItems: "center", padding: "0 26px 0 50px", gap: 20, transform: `scale(${t})`, boxShadow: "0 24px 70px rgba(0,0,30,.45)" }}>
        <div style={{ flex: 1, fontFamily: INTER, fontWeight: 800, fontSize: 70, color: C.ink, letterSpacing: "-0.02em" }}>{typed || <span style={{ color: "#aab" }}>Comenta…</span>}{!sent ? <span style={{ opacity: f % 10 < 5 ? 1 : 0, color: C.ui }}>|</span> : null}</div>
        <div style={{ width: 130, height: 100, borderRadius: 50, background: C.ui, color: "#fff", fontFamily: INTER, fontWeight: 800, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${click})` }}>{sent ? "✓" : "Enviar"}</div>
      </div>
      {typed.length === 5 ? <div style={{ position: "absolute", left: 790, top: 1050 }}><Cursor size={80} /></div> : null}
      <BottomShade strength={0.6} />
      <S2Layer takes={["T13"]} offset={BEATS.b9[0]} keys={["video", "skill"]} y={1450} />
    </AbsoluteFill>
  );
};

// ───────── B10 · «Y sígueme para más contenido»: negro + motion «Seguir» (el de VIDEO-005/008) con el perfil de zevenpro.estrategia ─────────
export const B10: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Seguir f30={(f * 30) / 24} usuario="zevenpro.estrategia" nombre="ZevenPRO | Marketing Estratégico." avatar="video-009/avatar-zevenpro.png" scale={0.7} cx={540} cy={1190} />
    </AbsoluteFill>
  );
};

export const Beats: React.FC = () => (
  <>
    {([["b1", B1], ["b2", B2], ["b3", B3], ["b4", B4], ["b5", B5], ["b6a", B6a], ["b6c", B6c], ["b6d", B6d], ["b7a", B7a], ["b7b", B7b], ["b8", B8], ["b9", B9], ["b10", B10]] as const).map(([k, C2]) => {
      const [a, b] = k === "b5" ? [BEATS.b5a[0], BEATS.b5b[1]] : BEATS[k as keyof typeof BEATS];
      return (
        <Sequence key={k} from={a} durationInFrames={b - a} name={k} premountFor={25}>
          <C2 />
        </Sequence>
      );
    })}
  </>
);
