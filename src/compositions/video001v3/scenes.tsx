import React from "react";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FocusPanImage, type FocusKey, type ImageMark } from "../../../library/recipes/FocusPanImage";
import {
  Battery, Canvas, Card, ChargerBrick, Cube, Earbuds, Gem, Hourglass, Medal, OpenBox, type Palette, Person, PhoneFront, ShadowDef, Tag, clamp, ramp, sp, useSvgId,
} from "./kit";

// Escenas de la zona superior (identidad ZevenPRO, fondo claro). El fondo lo pinta la composición; cada escena
// dibuja solo su contenido dentro del rectángulo seguro (w×h) que recibe.

export interface SceneProps {
  beats: Record<string, number>;
  props: Record<string, unknown>;
  palette: Palette;
  font: string;
  /** Rectángulo de contenido (ya dentro del área segura de Instagram). */
  w: number;
  h: number;
  durationInFrames: number;
}

const useF = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps };
};

// ---------------------------------------------------------------- 1 · Apple «muy arriba» de otras marcas
const Altura: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const clip = useSvgId("duo");
  const r1 = sp(frame, fps, beats.rise1, { damping: 14, stiffness: 120 });
  const r2 = sp(frame, fps, beats.rise2, { damping: 14, stiffness: 120 });
  const r3 = sp(frame, fps, beats.rise3, { damping: 12, stiffness: 110 });
  const dim = ramp(frame, beats.others ?? 9999, (beats.others ?? 9999) + 12, 1, 0.45);
  const enter = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const baseY = 650;
  const lift = 60 * r1 + 120 * r2 + 110 * r3; // máx. 290: la tarjeta no pasa de y≈103 (zona útil desde 80)
  const duoW = 380, duoH = 257;
  const duoTop = baseY - duoH - lift;
  const others = [170, 300, 780, 910];
  return (
    <Canvas w={w} h={h}>
      <defs>
        <ShadowDef id={shadow} />
        <clipPath id={clip}><rect x={540 - duoW / 2} y={duoTop} width={duoW} height={duoH} rx={18} /></clipPath>
      </defs>
      <line x1={90} y1={baseY} x2={990} y2={baseY} stroke={p.ink2} strokeOpacity={0.35} strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={i} x1={74} x2={i % 2 ? 90 : 104} y1={baseY - i * 62} y2={baseY - i * 62} stroke={p.ink2} strokeOpacity={0.45} strokeWidth={3} />
      ))}
      <line x1={89} y1={baseY} x2={89} y2={baseY - 520} stroke={p.ink2} strokeOpacity={0.25} strokeWidth={3} />
      <line x1={89} y1={baseY} x2={89} y2={duoTop + duoH * 0.5} stroke={p.yellow} strokeWidth={9} strokeLinecap="round" />
      <line x1={96} y1={duoTop + duoH * 0.5} x2={540 - duoW / 2 - 14} y2={duoTop + duoH * 0.5} stroke={p.ink2} strokeWidth={2} strokeDasharray="8 8" opacity={r1 * 0.8} />
      {others.map((x, i) => (
        <g key={i} opacity={dim * enter} transform={`translate(0 ${(1 - enter) * 40})`}>
          <PhoneFront x={x} y={baseY - 150} w={74} h={150} body={p.card} screen={p.border} stroke={p.border} />
        </g>
      ))}
      <circle cx={540} cy={duoTop + duoH / 2} r={190 + 30 * r3} fill={p.yellowSoft} opacity={0.55 + 0.35 * r3} />
      <rect x={540 - duoW / 2} y={duoTop} width={duoW} height={duoH} rx={18} fill={p.card} stroke={p.border} strokeWidth={2} filter={`url(#${shadow})`} opacity={enter} />
      <image href={staticFile("video-001/support/board-duo.png")} x={540 - duoW / 2} y={duoTop} width={duoW} height={duoH} opacity={enter} clipPath={`url(#${clip})`} />
      <g opacity={r1}>
        <Tag x={540 + duoW / 2 + 70} y={duoTop + 40} text="Apple" font={font} fill={p.ink} color={p.card} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 2 · Cantidad vs. valor (balanza)
const Balanza: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const cubes = ["c1", "c2", "c3", "c4"].map((k) => sp(frame, fps, beats[k], { damping: 13, stiffness: 160 }));
  const gem = sp(frame, fps, beats.gem, { damping: 12, stiffness: 150 });
  const tip = sp(frame, fps, beats.tip, { damping: 9, stiffness: 90, mass: 0.9 });
  const angle = -3.5 * cubes.reduce((a, b) => a + b, 0) + 30 * tip; // en grados; positivo baja la derecha
  const pivot = { x: 540, y: 300 };
  const arm = 300;
  const rad = (angle * Math.PI) / 180;
  const L = { x: pivot.x - arm * Math.cos(rad), y: pivot.y - arm * Math.sin(rad) };
  const R = { x: pivot.x + arm * Math.cos(rad), y: pivot.y + arm * Math.sin(rad) };
  const pan = (q: { x: number; y: number }, children: React.ReactNode) => (
    <g>
      <line x1={q.x - 80} y1={q.y + 150} x2={q.x} y2={q.y} stroke={p.ink2} strokeWidth={2} />
      <line x1={q.x + 80} y1={q.y + 150} x2={q.x} y2={q.y} stroke={p.ink2} strokeWidth={2} />
      <path d={`M ${q.x - 110} ${q.y + 150} Q ${q.x} ${q.y + 205} ${q.x + 110} ${q.y + 150} Z`} fill={p.ink} />
      {children}
    </g>
  );
  return (
    <Canvas w={w} h={h}>
      <polygon points={`${pivot.x - 70},620 ${pivot.x + 70},620 ${pivot.x},${pivot.y + 6}`} fill={p.ink} />
      <rect x={pivot.x - 120} y={616} width={240} height={14} rx={7} fill={p.ink} />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={p.ink} strokeWidth={12} strokeLinecap="round" />
      <circle cx={pivot.x} cy={pivot.y} r={15} fill={p.yellow} stroke={p.ink} strokeWidth={3} />
      {pan(L, cubes.map((c, i) => (
        <g key={i} opacity={c} transform={`translate(0 ${(1 - c) * -160})`}>
          <Cube x={L.x - 92 + (i % 2) * 96} y={L.y + 92 - Math.floor(i / 2) * 64} s={58} p={p} />
        </g>
      )))}
      {pan(R, (
        <g opacity={gem} transform={`translate(0 ${(1 - gem) * -170})`}>
          <Gem cx={R.x} cy={R.y + 112} s={52} fill={p.yellow} light={p.card} stroke={p.ink} />
        </g>
      ))}
      <text x={L.x} y={L.y + 250} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill={p.ink2} opacity={cubes[0]}>más</text>
      <g opacity={gem}>
        <rect x={R.x - 62} y={R.y + 222} width={124} height={40} rx={8} fill={p.yellow} />
        <text x={R.x} y={R.y + 250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={p.ink}>valor</text>
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 3 · 2014: Apple frente a Samsung
const Rivales: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 15, stiffness: 140 });
  const year = sp(frame, fps, beats.year, { damping: 11, stiffness: 180 });
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g transform={`translate(${(1 - a) * -260} 0)`} opacity={a}>
        <PhoneFront x={250} y={150} w={190} h={390} body={p.card} screen={p.ink} stroke={p.border} home shadow={shadow} />
      </g>
      <g transform={`translate(${(1 - a) * 260} 0)`} opacity={a}>
        <PhoneFront x={640} y={140} w={200} h={410} body={p.ink} screen={p.bgBlueLight} stroke={p.ink} home shadow={shadow} />
      </g>
      <text x={540} y={350} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={p.ink2} opacity={a}>vs</text>
      <g transform={`translate(540 640) scale(${0.6 + 0.4 * year}) translate(-540 -640)`} opacity={year}>
        <Tag x={540} y={640} text="2014" font={font} fill={p.yellow} color={p.ink} size={40} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 5 · La batería se cambia (sale de la carcasa)
const Bateria: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const arrow = useSvgId("arrow");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const cover = sp(frame, fps, beats.cover, { damping: 15, stiffness: 140 });
  const out = sp(frame, fps, beats.out, { damping: 12, stiffness: 120 });
  const px = 300, py = 120, pw = 250, ph = 520;
  return (
    <Canvas w={w} h={h}>
      <defs>
        <ShadowDef id={shadow} />
        <marker id={arrow} markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={p.ink} /></marker>
      </defs>
      <g opacity={a}>
        <rect x={px} y={py} width={pw} height={ph} rx={36} fill={p.card} stroke={p.border} strokeWidth={2} filter={`url(#${shadow})`} />
        <rect x={px + 22} y={py + 30} width={pw - 44} height={ph - 60} rx={22} fill={p.bg} />
        <circle cx={px + pw / 2} cy={py + 70} r={22} fill={p.card} stroke={p.ink2} strokeWidth={3} />
        <rect x={px + 50} y={py + 150} width={pw - 100} height={290} rx={12} fill="none" stroke={p.ink2} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
      </g>
      {/* tapa trasera que se retira */}
      <g transform={`translate(${-cover * 210} ${cover * 40}) rotate(${-cover * 10} ${px + pw / 2} ${py + ph / 2})`} opacity={(1 - cover * 0.55) * a}>
        <rect x={px} y={py} width={pw} height={ph} rx={36} fill={p.border} stroke={p.ink2} strokeWidth={2} />
        <circle cx={px + pw / 2} cy={py + 70} r={24} fill={p.card} stroke={p.ink2} strokeWidth={2} />
      </g>
      <g transform={`translate(${out * 330} ${-out * 30}) rotate(${out * 9} ${px + pw / 2} ${py + 300})`} opacity={a * Math.min(1, cover * 1.6)}>
        <Battery x={px + 52} y={py + 152} w={pw - 104} h={286} p={p} font={font} />
      </g>
      <g opacity={out}>
        <path d="M 590 330 C 640 300 690 300 740 330" stroke={p.ink} strokeWidth={6} fill="none" strokeLinecap="round" markerEnd={`url(#${arrow})`} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 7 · 2016: el conector de audífonos desaparece
const Puerto: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const gone = sp(frame, fps, beats.gone, { damping: 14, stiffness: 150 });
  const year = sp(frame, fps, beats.year, { damping: 11, stiffness: 180 });
  const ring = interpolate(frame, [beats.gone ?? 9999, (beats.gone ?? 9999) + 18], [0, 1], clamp);
  const jx = 830, jy = 300;
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g opacity={a}>
        <rect x={120} y={230} width={840} height={140} rx={70} fill={p.card} stroke={p.border} strokeWidth={2} filter={`url(#${shadow})`} />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={210 + i * 34} cy={300} r={9} fill={p.ink2} />)}
        <rect x={470} y={286} width={140} height={30} rx={15} fill={p.ink} />
        <circle cx={700} cy={300} r={7} fill={p.ink2} />
        {/* conector 3,5 mm */}
        <circle cx={jx} cy={jy} r={26 * (1 - gone)} fill={p.ink} />
        <circle cx={jx} cy={jy} r={30} fill="none" stroke={p.ink2} strokeWidth={3} strokeDasharray="7 7" opacity={gone} />
        <circle cx={jx} cy={jy} r={30 + 70 * ring} fill="none" stroke={p.yellow} strokeWidth={6} opacity={1 - ring} />
      </g>
      {/* auriculares con clavija que se desconecta */}
      <g opacity={a} transform={`translate(${gone * 60} ${gone * 150})`}>
        <path d={`M ${jx} ${jy + 92} C ${jx} ${jy + 200} ${jx - 220} ${jy + 230} ${jx - 330} ${jy + 330}`} stroke={p.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={jx - 10} y={jy + 40} width={20} height={56} rx={6} fill={p.ink} />
        <rect x={jx - 4} y={jy + 26} width={8} height={18} rx={3} fill={p.ink2} />
      </g>
      <g transform={`translate(540 600) scale(${0.6 + 0.4 * year}) translate(-540 -600)`} opacity={year}>
        <Tag x={540} y={600} text="2016" font={font} fill={p.yellow} color={p.ink} size={40} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 8 · 2020: el cargador sale de la caja del iPhone
const Cargador: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const gone = sp(frame, fps, beats.gone, { damping: 14, stiffness: 120 });
  const other = sp(frame, fps, beats.samsung, { damping: 15, stiffness: 140 });
  const check = sp(frame, fps, (beats.samsung ?? 9999) + 10, { damping: 10, stiffness: 200 });
  const ax = other > 0 ? 300 - 130 * other : 300;
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g opacity={a} transform={`translate(${ax - 300} 0)`}>
        <OpenBox x={300} y={260} w={420} h={330} body={p.card} lid={p.card} stroke={p.border} lidLift={30 * a} shadow={shadow} />
        <PhoneFront x={340} y={300} w={120} h={250} body={p.card} screen={p.ink} stroke={p.ink2} />
        <path d="M 500 520 q 40 -60 80 0 q 40 60 80 0" stroke={p.ink2} strokeWidth={8} fill="none" strokeLinecap="round" />
        <ChargerBrick x={560} y={330} s={110} p={p} dashed />
        <g opacity={1 - gone} transform={`translate(0 ${-gone * 140})`}>
          <ChargerBrick x={560} y={330} s={110} p={p} />
        </g>
        <text x={510} y={640} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={28} fill={p.ink2}>iPhone 12 · 2020</text>
      </g>
      <g opacity={other} transform={`translate(${(1 - other) * 300} 0)`}>
        <OpenBox x={620} y={260} w={360} h={330} body={p.card} lid={p.ink} stroke={p.border} lidLift={30} shadow={shadow} />
        <PhoneFront x={650} y={300} w={110} h={240} body={p.ink} screen={p.bgBlueLight} stroke={p.ink} />
        <ChargerBrick x={790} y={350} s={110} p={p} />
        <g transform={`translate(905 300) scale(${check})`} opacity={check}>
          <circle r={34} fill={p.yellow} stroke={p.ink} strokeWidth={3} />
          <path d="M -15 0 L -4 12 L 17 -12" stroke={p.ink} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x={800} y={640} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={28} fill={p.ink2}>Galaxy</text>
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 10 · Samsung también retira auriculares y cargador
const Retirada: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const ear = sp(frame, fps, beats.earbuds, { damping: 14, stiffness: 120 });
  const chg = sp(frame, fps, beats.charger, { damping: 14, stiffness: 120 });
  const year = sp(frame, fps, beats.year, { damping: 11, stiffness: 180 });
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g opacity={a}>
        <OpenBox x={250} y={250} w={580} h={340} body={p.card} lid={p.ink} stroke={p.border} lidLift={30} shadow={shadow} />
        <PhoneFront x={290} y={290} w={120} h={260} body={p.ink} screen={p.bgBlueLight} stroke={p.ink} />
        <path d="M 440 520 q 40 -60 80 0 q 40 60 80 0" stroke={p.ink2} strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={540} y={300} width={110} height={110} rx={18} fill="none" stroke={p.ink2} strokeWidth={3} strokeDasharray="10 8" opacity={0.7 * ear} />
        <ChargerBrick x={680} y={330} s={110} p={p} dashed />
      </g>
      <g opacity={a * (1 - ear)} transform={`translate(0 ${-ear * 150})`}>
        <Earbuds x={560} y={320} s={70} p={p} />
      </g>
      <g opacity={a * (1 - chg)} transform={`translate(0 ${-chg * 150})`}>
        <ChargerBrick x={680} y={330} s={110} p={p} />
      </g>
      <text x={540} y={655} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={28} fill={p.ink2} opacity={a}>Galaxy S21</text>
      <g transform={`translate(880 220) scale(${0.6 + 0.4 * year}) translate(-880 -220)`} opacity={year}>
        <Tag x={880} y={220} text="2021" font={font} fill={p.yellow} color={p.ink} size={40} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 11 · Lo que Apple quitó, Samsung lo copió
const Copias: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const head = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const rows = [
    { y: 250, apple: "2007", samsung: "2015", icon: "battery" },
    { y: 400, apple: "2016", samsung: "2019", icon: "jack" },
    { y: 550, apple: "2020", samsung: "2021", icon: "charger" },
  ];
  const appleIn = sp(frame, fps, beats.apple, { damping: 15, stiffness: 150 });
  const copies = ["copy1", "copy2", "copy3"].map((k) => sp(frame, fps, beats[k], { damping: 15, stiffness: 120 }));
  const equal = sp(frame, fps, beats.equal, { damping: 9, stiffness: 160 });
  const icon = (kind: string, x: number, y: number) => {
    if (kind === "battery") return <g><rect x={x - 34} y={y - 22} width={68} height={44} rx={8} fill={p.card} stroke={p.ink} strokeWidth={3} /><rect x={x + 34} y={y - 9} width={8} height={18} rx={2} fill={p.ink} /><path d={`M ${x - 10} ${y - 3} v -8 a 10 10 0 0 1 20 0 v 8`} stroke={p.ink} strokeWidth={4} fill="none" /><rect x={x - 14} y={y - 3} width={28} height={18} rx={4} fill={p.ink} /></g>;
    if (kind === "jack") return <g><circle cx={x} cy={y} r={22} fill="none" stroke={p.ink} strokeWidth={6} /><line x1={x - 30} y1={y + 30} x2={x + 30} y2={y - 30} stroke={p.ink} strokeWidth={7} strokeLinecap="round" /></g>;
    return <g><rect x={x - 26} y={y - 24} width={52} height={52} rx={9} fill={p.card} stroke={p.ink} strokeWidth={3} /><rect x={x - 14} y={y - 36} width={7} height={14} rx={2} fill={p.ink2} /><rect x={x + 7} y={y - 36} width={7} height={14} rx={2} fill={p.ink2} /><line x1={x - 34} y1={y + 34} x2={x + 34} y2={y - 34} stroke={p.ink} strokeWidth={7} strokeLinecap="round" /></g>;
  };
  return (
    <Canvas w={w} h={h}>
      <g opacity={head}>
        <Tag x={300} y={140} text="Apple" font={font} fill={p.card} color={p.ink} size={34} stroke={p.border} />
        <Tag x={780} y={140} text="Samsung" font={font} fill={p.ink} color={p.card} size={34} />
        <line x1={540} y1={190} x2={540} y2={620} stroke={p.ink2} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="6 10" />
      </g>
      {rows.map((r, i) => (
        <g key={i}>
          <g opacity={appleIn} transform={`translate(${(1 - appleIn) * -40} 0)`}>
            {icon(r.icon, 270, r.y)}
            <text x={340} y={r.y + 10} fontFamily={font} fontWeight={800} fontSize={30} fill={p.ink2}>{r.apple}</text>
          </g>
          <g opacity={copies[i]} transform={`translate(${(1 - copies[i]) * -480} 0)`}>
            {icon(r.icon, 750, r.y)}
            <text x={820} y={r.y + 10} fontFamily={font} fontWeight={800} fontSize={30} fill={p.ink2}>{r.samsung}</text>
          </g>
        </g>
      ))}
      {/* «=» en rojo: el punto crítico del argumento (la copia) */}
      <g transform={`translate(540 400) scale(${equal})`} opacity={equal}>
        <circle r={58} fill={p.red} />
        <rect x={-28} y={-16} width={56} height={10} rx={4} fill={p.card} />
        <rect x={-28} y={6} width={56} height={10} rx={4} fill={p.card} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 13 · Galaxy Fold (2019): «estuvimos primero»
const FotoMedalla: React.FC<SceneProps> = ({ beats, props, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const clip = useSvgId("ph");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const medal = sp(frame, fps, beats.medal, { damping: 10, stiffness: 170 });
  return (
    <>
      <Canvas w={w} h={h}>
        <defs>
          <ShadowDef id={shadow} />
          <clipPath id={clip}><rect x={310} y={110} width={460} height={560} rx={16} /></clipPath>
        </defs>
        <g opacity={a} transform={`translate(540 390) scale(${0.94 + 0.06 * a}) translate(-540 -390)`}>
          <rect x={296} y={96} width={488} height={588} rx={24} fill={p.card} stroke={p.border} strokeWidth={2} filter={`url(#${shadow})`} />
          <image href={staticFile(String(props.src))} x={310} y={110} width={460} height={560} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`} />
        </g>
        <g transform={`translate(800 210) scale(${medal}) translate(-800 -210)`} opacity={medal}>
          <Medal cx={800} cy={210} r={62} font={font} p={p} />
        </g>
      </Canvas>
      {props.credit ? <Credit text={String(props.credit)} p={p} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 15 · Llegar primero frente a resolver de otra manera
const Recorridos: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const sRun = ramp(frame, beats.samsung ?? 0, (beats.samsung ?? 0) + 30);
  const aRun = ramp(frame, beats.apple ?? 9999, beats.arrive ?? 9999);
  const glow = sp(frame, fps, beats.arrive, { damping: 10, stiffness: 140 });
  const len = 1300;
  const sx = 140 + 470 * sRun;
  const route = "M 140 480 C 330 480 420 600 560 560 S 760 260 930 170";
  return (
    <Canvas w={w} h={h}>
      <g opacity={a}>
        <text x={140} y={190} fontFamily={font} fontWeight={800} fontSize={28} fill={p.ink2}>Samsung</text>
        <line x1={140} y1={240} x2={620} y2={240} stroke={p.border} strokeWidth={8} strokeLinecap="round" />
        <line x1={140} y1={240} x2={sx} y2={240} stroke={p.ink} strokeWidth={8} strokeLinecap="round" />
        <circle cx={sx} cy={240} r={17} fill={p.ink} />
        <g transform="translate(640 240)">
          <line x1={0} y1={30} x2={0} y2={-60} stroke={p.ink2} strokeWidth={4} />
          <polygon points="0,-60 52,-46 0,-32" fill={p.ink} />
          <text x={14} y={70} fontFamily={font} fontWeight={900} fontSize={30} fill={p.ink}>1º</text>
        </g>
        <text x={140} y={430} fontFamily={font} fontWeight={800} fontSize={28} fill={p.ink2}>Apple</text>
        <path d={route} stroke={p.ink2} strokeOpacity={0.35} strokeWidth={6} fill="none" strokeDasharray="10 12" />
        <path d={route} stroke={p.yellow} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - aRun)} />
        <g transform={`translate(930 170) scale(${0.6 + 0.6 * glow})`} opacity={0.35 + 0.65 * glow}>
          <circle r={72} fill={p.yellowSoft} opacity={0.9 * glow} />
          <polygon points="0,-34 9,-11 34,-11 14,4 21,29 0,14 -21,29 -14,4 -34,-11 -9,-11" fill={p.yellow} stroke={p.ink} strokeWidth={3} strokeLinejoin="round" />
        </g>
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 16 · Bisagra: piezas que ensamblan y pantallas proporcionales
const Bisagra: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const asm = ramp(frame, beats.assemble ?? 0, (beats.assemble ?? 0) + 34);
  const open = sp(frame, fps, beats.open, { damping: 15, stiffness: 110 });
  const ratio = sp(frame, fps, beats.ratio, { damping: 15, stiffness: 120 });
  const tag = sp(frame, fps, beats.tag, { damping: 12, stiffness: 170 });
  const parts = Array.from({ length: 18 }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const rx = (seed - Math.floor(seed)) * 900 + 90;
    const ry = (Math.sin(i * 78.233) * 0.5 + 0.5) * 520 + 110;
    return { from: { x: rx, y: ry, r: (i * 47) % 180 }, to: { x: 540, y: 190 + i * 21, r: 0 } };
  });
  const panelW = 220 * open;
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      {/* paneles que se despliegan desde la bisagra; la pantalla (azul: lo digital) mantiene la proporción */}
      <g opacity={open}>
        <rect x={540 - 14 - panelW} y={175} width={panelW} height={400} rx={20} fill={p.card} stroke={p.ink} strokeWidth={3} filter={`url(#${shadow})`} />
        <rect x={540 + 14} y={175} width={panelW} height={400} rx={20} fill={p.card} stroke={p.ink} strokeWidth={3} filter={`url(#${shadow})`} />
        <rect x={540 - 14 - panelW + 18} y={195 + (1 - ratio) * 120} width={(panelW - 36) * (1 - ratio) + (panelW * 2 - 8) * ratio} height={120 + 240 * ratio} rx={10} fill={p.blue} opacity={0.9} />
      </g>
      {parts.map((q, i) => {
        const t = Math.min(1, Math.max(0, asm * 1.25 - i * 0.012));
        const x = interpolate(t, [0, 1], [q.from.x, q.to.x]);
        const y = interpolate(t, [0, 1], [q.from.y, q.to.y]);
        const r = interpolate(t, [0, 1], [q.from.r, 0]);
        return <rect key={i} x={x - 16} y={y - 8} width={32} height={16} rx={5} fill={i % 3 === 0 ? p.yellow : p.ink2} stroke={p.ink} strokeWidth={i % 3 === 0 ? 1.5 : 0} transform={`rotate(${r} ${x} ${y})`} />;
      })}
      <g transform={`translate(800 640) scale(${0.6 + 0.4 * tag}) translate(-800 -640)`} opacity={tag}>
        <Tag x={800} y={640} text="+100 piezas" font={font} fill={p.yellow} color={p.ink} size={30} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 17 · La carrera por ser primero
const Carrera: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame } = useF();
  const a = ramp(frame, 0, 10);
  const lanes = [200, 290, 380, 470, 560];
  const go = beats.go ?? 0;
  const bursts = [beats.b1, beats.b2].filter((b) => b !== undefined) as number[];
  const pos = (i: number) => {
    const t = Math.max(0, frame - go);
    const base = t * (2.2 + (i % 3) * 0.35);
    const extra = bursts.reduce((acc, b) => acc + Math.max(0, Math.min(1, (frame - b) / 14)) * (60 + i * 14), 0);
    const wobble = Math.sin((frame + i * 13) / 6) * 6;
    return Math.min(860, 150 + base + extra + wobble);
  };
  return (
    <Canvas w={w} h={h}>
      <g opacity={a}>
        {lanes.map((y, i) => (
          <g key={i}>
            <line x1={130} y1={y} x2={900} y2={y} stroke={p.border} strokeWidth={5} strokeLinecap="round" />
            <line x1={130} y1={y} x2={pos(i) - 12} y2={y} stroke={i === 2 ? p.yellow : p.ink2} strokeOpacity={i === 2 ? 1 : 0.45} strokeWidth={i === 2 ? 7 : 4} strokeLinecap="round" />
            <circle cx={pos(i)} cy={y} r={18} fill={i === 2 ? p.yellow : p.ink} stroke={p.ink} strokeWidth={i === 2 ? 3 : 0} />
          </g>
        ))}
        <line x1={900} y1={160} x2={900} y2={600} stroke={p.ink} strokeWidth={6} strokeDasharray="14 10" />
        <text x={930} y={400} fontFamily={font} fontWeight={900} fontSize={56} fill={p.ink}>1º</text>
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 18 · Acumular funciones no sube el valor
const Acumulacion: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const adds = ["a1", "a2", "a3", "a4"].map((k) => sp(frame, fps, beats[k], { damping: 12, stiffness: 160 }));
  const pulse = sp(frame, fps, beats.meter, { damping: 8, stiffness: 160 });
  const drop = sp(frame, fps, beats.drop, { damping: 16, stiffness: 90 });
  const wob = Math.sin(frame / 7) * 2.5 * adds[3] * (1 - drop);
  const level = 0.22 + 0.04 * Math.sin(frame / 9) * pulse;
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g opacity={a} transform={`rotate(${wob} 420 600)`}>
        <rect x={290} y={520} width={260} height={90} rx={16} fill={p.ink} filter={`url(#${shadow})`} />
        <text x={420} y={575} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={p.card}>producto</text>
        {adds.map((v, i) => (
          <g key={i} opacity={v * (1 - drop)} transform={`translate(${drop * (i % 2 ? 260 : -260)} ${(1 - v) * -200 + drop * 260}) rotate(${drop * (i % 2 ? 25 : -25)} 420 ${460 - i * 78})`}>
            <rect x={310 + (i % 2) * 20} y={440 - i * 78} width={220} height={70} rx={14} fill={p.card} stroke={p.ink2} strokeWidth={2.5} />
            <text x={420 + (i % 2) * 20} y={485 - i * 78} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={p.ink}>+</text>
          </g>
        ))}
      </g>
      <g opacity={a}>
        <rect x={760} y={170} width={90} height={440} rx={45} fill={p.card} stroke={p.border} strokeWidth={3} />
        <rect x={760} y={170 + 440 * (1 - level)} width={90} height={440 * level} rx={45} fill={p.yellow} stroke={p.ink} strokeWidth={2} />
        <text x={805} y={660} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={p.ink}>valor</text>
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 19 · El cliente cruza por confianza, valor, percepción y experiencia
const Puente: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const first = sp(frame, fps, beats.first, { damping: 12, stiffness: 160 });
  const firstFade = ramp(frame, (beats.first ?? 0) + 24, (beats.first ?? 0) + 40, 1, 0.3);
  const planks = ["p1", "p2", "p3", "p4"].map((k) => sp(frame, fps, beats[k], { damping: 11, stiffness: 170 }));
  const walk = ramp(frame, beats.p4 ?? 9999, (beats.p4 ?? 9999) + 22);
  const icons = [
    (x: number, y: number) => <path d={`M ${x} ${y - 26} l 24 9 v 14 c 0 16 -11 27 -24 32 c -13 -5 -24 -16 -24 -32 v -14 z`} fill={p.blue} />,
    (x: number, y: number) => <Gem cx={x} cy={y} s={24} fill={p.yellow} light={p.card} stroke={p.ink} />,
    (x: number, y: number) => <g><ellipse cx={x} cy={y} rx={28} ry={16} fill="none" stroke={p.ink} strokeWidth={5} /><circle cx={x} cy={y} r={8} fill={p.ink} /></g>,
    (x: number, y: number) => <polygon points={`${x},${y - 26} ${x + 7},${y - 8} ${x + 26},${y - 8} ${x + 11},${y + 4} ${x + 16},${y + 23} ${x},${y + 12} ${x - 16},${y + 23} ${x - 11},${y + 4} ${x - 26},${y - 8} ${x - 7},${y - 8}`} fill={p.yellow} stroke={p.ink} strokeWidth={2.5} strokeLinejoin="round" />,
  ];
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g opacity={a}>
        <Card x={60} y={470} w={230} h={200} p={p} r={18} shadow={shadow} />
        <Card x={790} y={470} w={230} h={200} p={p} r={18} shadow={shadow} />
        <rect x={845} y={350} width={120} height={120} rx={18} fill={p.yellow} stroke={p.ink} strokeWidth={3} />
        <path d="M 870 380 h 70 M 870 410 h 70 M 870 440 h 40" stroke={p.ink} strokeWidth={8} strokeLinecap="round" />
      </g>
      <g transform={`translate(540 230) scale(${first})`} opacity={first * firstFade}>
        <Medal cx={0} cy={0} r={44} font={font} p={p} />
      </g>
      {planks.map((v, i) => (
        <g key={i} opacity={v} transform={`translate(0 ${(1 - v) * 60})`}>
          <rect x={300 + i * 122} y={470} width={112} height={30} rx={7} fill={p.card} stroke={p.ink2} strokeWidth={2} />
          <rect x={300 + i * 122} y={470} width={112} height={8} rx={4} fill={p.yellow} />
          {icons[i](356 + i * 122, 410)}
        </g>
      ))}
      <g transform={`translate(${walk * 640} 0)`} opacity={a}>
        <Person cx={175} base={470} s={70} fill={p.ink} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 20 · ¿Primeros o con una solución real?
const Solucion: React.FC<SceneProps> = ({ beats, palette: p, font, w, h }) => {
  const { frame, fps } = useF();
  const shadow = useSvgId("sh");
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  const dim = ramp(frame, beats.dim ?? 9999, (beats.dim ?? 9999) + 14, 1, 0.35);
  const fit = sp(frame, fps, beats.fit, { damping: 13, stiffness: 120 });
  const glow = sp(frame, fps, beats.glow, { damping: 10, stiffness: 140 });
  const piece = "M 640 290 h 70 a 22 22 0 1 1 44 0 h 70 v 70 a 22 22 0 1 0 0 44 v 70 h -184 z";
  return (
    <Canvas w={w} h={h}>
      <defs><ShadowDef id={shadow} /></defs>
      <g opacity={a * dim} transform="translate(230 380)">
        <Medal cx={0} cy={0} r={70} font={font} p={p} />
      </g>
      <g opacity={a}>
        <Card x={520} y={200} w={420} h={400} p={p} r={26} shadow={shadow} />
        <path d={piece} fill={p.bg} stroke={p.ink2} strokeWidth={3} strokeDasharray="8 8" />
      </g>
      <circle cx={732} cy={400} r={150 + 40 * glow} fill={p.yellowSoft} opacity={0.75 * glow} />
      {/* la pieza entra desde fuera del encuadre al decir «solución» (antes no se ve) */}
      <g transform={`translate(${(1 - fit) * 420} ${(1 - fit) * -380})`} opacity={a * Math.min(1, fit * 4)}>
        <path d={piece} fill={p.yellow} stroke={p.ink} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- 21 · Tomarnos nuestro tiempo
const Tiempo: React.FC<SceneProps> = ({ beats, palette: p, w, h }) => {
  const { frame, fps } = useF();
  const a = sp(frame, fps, 0, { damping: 200, stiffness: 140 });
  return (
    <Canvas w={w} h={h}>
      <g opacity={a}>
        <circle cx={540} cy={390} r={250} fill={p.yellowSoft} opacity={0.6} />
        <Hourglass cx={540} cy={390} s={200} frame={frame} flipAt={beats.flip ?? 10} fps={fps} p={p} />
      </g>
    </Canvas>
  );
};

// ---------------------------------------------------------------- evidencia real (capturas)
const Credit: React.FC<{ text: string; p: Palette }> = ({ text, p }) => (
  <div style={{ position: "absolute", right: 6, bottom: 0, fontFamily: "Arial, sans-serif", fontSize: 18, color: p.ink2, zIndex: 5, maxWidth: "90%", textAlign: "right" }}>{text}</div>
);

const Evidencia: React.FC<SceneProps> = ({ props, palette: p, w, h }) => {
  const bottom = 30;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: Math.max(10, h - bottom) }}>
        <FocusPanImage
          src={staticFile(String(props.src))}
          imageWidth={Number(props.width)}
          imageHeight={Number(props.height)}
          zoneWidth={w}
          zoneHeight={Math.max(10, h - bottom)}
          keys={props.keys as FocusKey[] | undefined}
          marks={props.marks as ImageMark[] | undefined}
          fit={(props.fit as "contain" | "cover") ?? "contain"}
          padding={Number(props.padding ?? 24)}
          card={props.card !== false}
          drift={0.006}
          maxDrift={0.02}
          accent={p.yellow}
          shadowColor="rgba(23,23,29,0.16)"
        />
      </div>
      {props.credit ? <Credit text={String(props.credit)} p={p} /> : null}
    </>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  altura: Altura, balanza: Balanza, rivales: Rivales, bateria: Bateria, puerto: Puerto, cargador: Cargador, retirada: Retirada,
  copias: Copias, fotoMedalla: FotoMedalla, recorridos: Recorridos, bisagra: Bisagra, carrera: Carrera, acumulacion: Acumulacion,
  puente: Puente, solucion: Solucion, tiempo: Tiempo, evidencia: Evidencia,
};
