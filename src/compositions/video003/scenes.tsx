import React from "react";
import { Easing, interpolate } from "remotion";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { clamp, curvaPath, easeInOut, easeOut, FONT, Micro, Nodo, P, prog, Punta, Reticula, Rotulo, Sube, suave, Trazo, toScreen, useCam, vis } from "./kit";

// Escenas de VIDEO-003 agrupadas en bloques continuos: los datos visuales evolucionan con el argumento en lugar de
// cambiar de pantalla en cada frase (guion técnico del usuario). Cada bloque dibuja dos capas:
//  - «detrás»: SVG del mundo de cámara, por debajo del presentador recortado (líneas, ejes, nodos);
//  - «delante»: rótulos y microtipografía en las zonas libres (a los lados de la cabeza), nunca en la franja de
//    subtítulos (y > 1150).
// Todo se calcula con el frame global `f` y los beats globales de video-orders/VIDEO-003.json → timeline.scenes.

export type Capa = "detras" | "delante";
export interface Escena { id: string; startFrame: number; durationInFrames: number; beats: Record<string, number> }
export interface BloqueProps { f: number; S: Record<string, Escena>; capa: Capa; total: number }

const punto = (d: string, p: number) => { const L = getLength(d); const q = getPointAtLength(d, Math.max(0, Math.min(1, p)) * L); const t = getTangentAtLength(d, Math.max(0.5, Math.min(L - 0.5, p * L))); return { x: q.x, y: q.y, ang: Math.atan2(t.y, t.x) }; };
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</svg>
);

// ---------- B1 · s01–s02: línea temporal → dos líneas enfrentadas ----------
const B1: React.FC<BloqueProps> = ({ f, S, capa }) => {
  const { s01, s02, s03 } = S;
  if (f > s03.startFrame + 14) return null;
  const Y = 600;
  const p = prog(f, s01.startFrame + 2, s01.startFrame + 30, easeOut); // la línea entra de inmediato
  const salidaLinea = 1 - prog(f, s02.beats.lineas - 4, s02.beats.lineas + 6);
  const xs = [110, 215, 835, 960];
  const reach = (x: number) => s01.startFrame + 2 + Math.round(28 * Math.pow((x - 40) / 1000, 0.6)); // cuándo pasa la línea
  const iaT = vis(f, s01.beats.ia);
  const pulso = interpolate(f, [s01.beats.pulso, s01.beats.pulso + 14], [0, 1], clamp);
  // dos líneas que convergen hacia el centro (detrás del presentador)
  const cv = prog(f, s02.beats.lineas, s02.beats.lineas + 22, easeInOut);
  const salida = 1 - prog(f, s03.startFrame, s03.startFrame + 10);
  const dA = `M 40 ${Y - 90} C 260 ${Y - 90}, 420 ${Y}, 540 ${Y}`;
  const dB = `M 1040 ${Y + 90} C 820 ${Y + 90}, 660 ${Y}, 540 ${Y}`;
  if (capa === "detras") {
    return (
      <Svg>
        <g opacity={salidaLinea}>
          <Trazo d={`M 40 ${Y} L 1040 ${Y}`} p={p} color="#FFFFFF" w={4} />
          {xs.map((x, i) => <Nodo key={x} x={x} y={Y} t={vis(f, reach(x), undefined, 6)} color={i === xs.length - 1 && iaT > 0 ? P.blue : P.yellow} r={i === xs.length - 1 ? 15 : 11} pulso={i === xs.length - 1 ? pulso : 0} />)}
        </g>
        <g opacity={salida}>
          <Trazo d={dA} p={cv} color={P.yellow} w={5} />
          <Trazo d={dB} p={cv} color="#FFFFFF" w={5} />
          {cv > 0 && cv < 1 ? (() => { const a = punto(dA, cv), b = punto(dB, cv); return <><Nodo x={a.x} y={a.y} t={1} r={9} /><Nodo x={b.x} y={b.y} t={1} r={9} color="#FFFFFF" /></>; })() : null}
        </g>
      </Svg>
    );
  }
  const textoT = vis(f, s02.beats.texto, s02.beats.texto + 24, 6, 8);
  return (
    <>
      <Rotulo x={960} y={Y - 34} t={iaT * salidaLinea} tono="azul" ax={0.5} ay={1} size={30} escala={1 + 0.12 * Math.sin(Math.PI * pulso)}>IA</Rotulo>
      <Rotulo x={78} y={430} t={textoT} tono="blanco" size={26} ax={0} style={{ borderRadius: 18, lineHeight: 1.15, whiteSpace: "pre" }}>{"NO ES UNA\nGUERRA MILITAR"}</Rotulo>
    </>
  );
};

// ---------- B2 · s03–s05: curva de velocidad → límite → acelerador ----------
const CURVA = curvaPath(90, 1000, (x) => 920 - 590 * Math.pow((x - 90) / 910, 2.4));
const P_LIMITE = 0.74;
const B2: React.FC<BloqueProps> = ({ f, S, capa }) => {
  const { s03, s04, s05, s06 } = S;
  if (f < s03.startFrame - 2 || f > s06.startFrame + 12) return null;
  const entra = vis(f, s03.startFrame, s06.startFrame, 8, 9);
  // la curva se dibuja y acelera; desacelera ante el límite; vuelve a acelerar al liberarse
  const p =
    f < s04.beats.limite ? interpolate(f, [s03.startFrame + 2, s04.beats.limite], [0, P_LIMITE - 0.06], { ...clamp, easing: Easing.in(Easing.quad) })
    : f < s05.beats.libera ? interpolate(f, [s04.beats.limite, s05.beats.libera], [P_LIMITE - 0.06, P_LIMITE - 0.01], { ...clamp, easing: Easing.out(Easing.quad) })
    : interpolate(f, [s05.beats.libera, s05.beats.acelerador], [P_LIMITE - 0.01, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const head = punto(CURVA, p);
  const lim = punto(CURVA, P_LIMITE);
  const limT = vis(f, s04.beats.limite - 4, undefined, 8);
  const libera = prog(f, s05.beats.libera, s05.beats.libera + 10, Easing.in(Easing.cubic));
  const golpe = interpolate(f, [s05.beats.acelerador, s05.beats.acelerador + 5, s05.beats.acelerador + 16], [0, 1, 0], clamp);
  if (capa === "detras") {
    return (
      <Svg>
        <g opacity={entra}>
          <Reticula o={0.9} />
          <Trazo d="M 80 935 L 1010 935" color="#FFFFFF" w={3} opacity={0.75} glow={false} />
          <Trazo d={CURVA} p={p} color={P.yellow} w={7 + 3 * golpe} />
          {limT > 0 && libera < 1 ? (
            <g opacity={limT * (1 - libera)} transform={`translate(0 ${libera * 60})`}>
              <line x1={lim.x + 18} x2={lim.x + 18} y1={300} y2={940} stroke="rgba(23,23,29,0.35)" strokeWidth={10} />
              <line x1={lim.x + 18} x2={lim.x + 18} y1={300} y2={940} stroke="#FFFFFF" strokeWidth={5} strokeDasharray="18 12" />
            </g>
          ) : null}
          {p > 0.02 && p < 0.999 ? <Nodo x={head.x} y={head.y} t={1} r={10 + 4 * golpe} /> : null}
          {p >= 0.999 ? <Punta x={head.x} y={head.y} ang={head.ang} s={30 + 8 * golpe} /> : null}
        </g>
      </Svg>
    );
  }
  // medidor abstracto de velocidad de desarrollo (sin cifras)
  const medT = vis(f, s05.beats.contador, s06.startFrame, 8, 8);
  const lleno = interpolate(f, [s05.beats.contador, s05.beats.acelerador + 4], [0.12, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const cam = useCam();
  const m = toScreen(cam, 80, 380);
  return (
    <>
      <Rotulo x={78} y={378} t={vis(f, s03.beats.v, s04.startFrame + 4) * entra} tono="amarillo" size={26}>VELOCIDAD<Sube /></Rotulo>
      <Rotulo x={78} y={448} t={vis(f, s03.beats.a, s04.startFrame + 8) * entra} tono="amarillo" size={26}>ADAPTACIÓN<Sube /></Rotulo>
      <Rotulo x={1006} y={378} t={vis(f, s04.beats.control, s05.beats.libera) * entra} tono="blanco" size={26} ax={1}>CONTROL</Rotulo>
      <Rotulo x={1006} y={448} t={vis(f, s04.beats.seguridad, s05.beats.libera + 3) * entra} tono="blanco" size={26} ax={1}>SEGURIDAD</Rotulo>
      {medT > 0 ? (
        <div style={{ position: "absolute", left: m.x, top: m.y - 40, width: 230, opacity: medT, transform: `translateY(${(1 - medT) * 12}px)`, fontFamily: FONT }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.06em", color: P.ink, background: "rgba(255,255,255,0.9)", borderRadius: 10, padding: "6px 10px", lineHeight: 1.15, boxShadow: "0 8px 20px rgba(23,23,29,0.18)" }}>
            VELOCIDAD DE<br />DESARROLLO
            <div style={{ marginTop: 8, height: 16, borderRadius: 8, background: "#EFEDE7", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, width: `${lleno * 100}%`, background: `repeating-linear-gradient(110deg, ${P.yellow} 0 14px, #FFD84D 14px 22px)`, backgroundPosition: `${f * 6}px 0`, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

// ---------- B3 · s06–s09: días → lanzamientos → agentes ----------
const B3: React.FC<BloqueProps> = ({ f, S, capa }) => {
  const { s06, s07, s08, s09, s10 } = S;
  if (f < s06.startFrame - 2 || f > s10.startFrame + 12) return null;
  const sale = 1 - prog(f, s10.startFrame, s10.startFrame + 10);
  const XL = 95, XR = 985, TOP = 345;
  const a = { marca: TOP, opus: 440, sonnet: 525 };
  const o = { marca: TOP, astra: 440, sol: 500 }; // separación menor: lanzamientos más seguidos
  const linkP = prog(f, s07.startFrame, s07.startFrame + 18, easeOut);
  const izqHasta = interpolate(f, [s07.beats.opus - 6, s07.beats.opus, s07.beats.sonnet - 6, s07.beats.sonnet], [TOP, a.opus, a.opus, a.sonnet], clamp);
  const derHasta = interpolate(f, [s08.beats.astra - 6, s08.beats.astra, s08.beats.sol - 5, s08.beats.sol], [TOP, o.astra, o.astra, o.sol], clamp);
  const ag = (k: number) => s09.beats.capacidad - 6 + k * 6; // RAZONAR → PLANIFICAR → EJECUTAR → HERRAMIENTAS
  const bajaIzq = interpolate(f, [ag(0) - 4, ag(1)], [a.sonnet, 720], clamp);
  const cruce = prog(f, ag(1), ag(2) + 2, easeInOut);
  const bajaDer = interpolate(f, [ag(2), ag(3)], [640, 720], clamp);
  if (capa === "detras") {
    return (
      <Svg>
        <g opacity={sale}>
          <Trazo d={`M ${XL} ${TOP} L ${XR} ${TOP}`} p={linkP} color="#FFFFFF" w={4} />
          {izqHasta > TOP ? <Trazo d={`M ${XL} ${TOP} L ${XL} ${izqHasta}`} color="#FFFFFF" w={4} /> : null}
          {derHasta > TOP ? <Trazo d={`M ${XR} ${TOP} L ${XR} ${derHasta}`} color="#FFFFFF" w={4} /> : null}
          {bajaIzq > a.sonnet ? <Trazo d={`M ${XL} ${a.sonnet} L ${XL} ${bajaIzq}`} color={P.blue} w={4} /> : null}
          <Trazo d={`M ${XL} 720 C 400 720, 680 640, ${XR} 640`} p={cruce} color={P.blue} w={4} />
          {f >= ag(2) ? <Trazo d={`M ${XR} 640 L ${XR} ${bajaDer}`} color={P.blue} w={4} /> : null}
          <Nodo x={XL} y={a.marca} t={vis(f, s07.beats.marca, undefined, 7)} r={12} color="#FFFFFF" />
          <Nodo x={XL} y={a.opus} t={vis(f, s07.beats.opus, undefined, 7)} color={P.blue} />
          <Nodo x={XL} y={a.sonnet} t={vis(f, s07.beats.sonnet, undefined, 7)} color={P.blue} />
          <Nodo x={XR} y={o.marca} t={vis(f, s08.beats.marca, undefined, 7)} r={12} color="#FFFFFF" />
          <Nodo x={XR} y={o.astra} t={vis(f, s08.beats.astra, undefined, 7)} color={P.blue} />
          <Nodo x={XR} y={o.sol} t={vis(f, s08.beats.sol, undefined, 7)} color={P.blue} />
          {[[XL, 640, 0], [XL, 720, 1], [XR, 640, 2], [XR, 720, 3]].map(([x, y, k]) => <Nodo key={k} x={x} y={y} t={vis(f, ag(k), undefined, 6)} r={9} color={P.yellow} />)}
        </g>
      </Svg>
    );
  }
  // contador de días acelerado (cicla; no afirma una cifra) y marcas de calendario
  const dT = vis(f, s06.startFrame + 2, s07.beats.marca + 4, 6, 7);
  const n = f < s06.startFrame ? 1 : 1 + Math.floor(Math.pow((f - s06.startFrame) / 2.2, 1.35));
  const dia = String(((n - 1) % 31) + 1).padStart(2, "0");
  const marcas = Math.max(0, Math.min(15, Math.floor(Math.pow(Math.max(0, f - s06.startFrame) / 1.6, 1.25))));
  const cam = useCam();
  const cal = toScreen(cam, 80, 360);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: sale }}>
      {dT > 0 ? (
        <>
          <div style={{ position: "absolute", left: cal.x, top: cal.y, opacity: dT, display: "grid", gridTemplateColumns: "repeat(5, 34px)", gap: 9, transform: `translateY(${(1 - dT) * 12}px)` }}>
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: i < marcas ? P.yellow : "rgba(255,255,255,0.88)", border: `2px solid ${i < marcas ? P.yellow : P.border}`, boxShadow: "0 4px 10px rgba(23,23,29,0.18)" }} />
            ))}
          </div>
          <Rotulo x={1006} y={360} t={dT} tono="blanco" size={24} ax={1}>DÍAS</Rotulo>
          <Micro x={1006} y={450} t={dT} ax={1} size={92} weight={900} style={{ letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums", filter: `blur(${Math.min(2.5, (n % 2) * 1.2)}px)` }}>{dia}</Micro>
        </>
      ) : null}
      <Rotulo x={XL + 28} y={a.marca} t={vis(f, s07.beats.marca)} tono="blanco" size={26}>ANTHROPIC</Rotulo>
      <Rotulo x={XL + 30} y={a.opus} t={vis(f, s07.beats.opus)} tono="azul" size={26}>OPUS 5.5</Rotulo>
      <Rotulo x={XL + 30} y={a.sonnet} t={vis(f, s07.beats.sonnet)} tono="azul" size={26}>SONNET 5.5</Rotulo>
      <Rotulo x={XR - 28} y={o.marca} t={vis(f, s08.beats.marca)} tono="blanco" size={26} ax={1}>OPENAI</Rotulo>
      <Rotulo x={XR - 30} y={o.astra} t={vis(f, s08.beats.astra)} tono="azul" size={26} ax={1}>GPT-6 ASTRA</Rotulo>
      <Rotulo x={XR - 30} y={o.sol} t={vis(f, s08.beats.sol)} tono="azul" size={26} ax={1}>6.1 SOL</Rotulo>
      <Rotulo x={XL + 26} y={640} t={vis(f, ag(0))} tono="tenue" size={22}>RAZONAR</Rotulo>
      <Rotulo x={XL + 26} y={720} t={vis(f, ag(1))} tono="tenue" size={22}>PLANIFICAR</Rotulo>
      <Rotulo x={XR - 26} y={640} t={vis(f, ag(2))} tono="tenue" size={22} ax={1}>EJECUTAR</Rotulo>
      <Rotulo x={XR - 26} y={720} t={vis(f, ag(3))} tono="tenue" size={22} ax={1}>HERRAMIENTAS</Rotulo>
    </div>
  );
};

// ---------- B4 · s10–s11: una sola línea ascendente; ¿dominar? / ¿reemplazar? tachados ----------
const B4: React.FC<BloqueProps> = ({ f, S, capa }) => {
  const { s10, s11, s12 } = S;
  if (f < s10.startFrame - 2 || f > s12.startFrame + 12) return null;
  const sale = 1 - prog(f, s12.startFrame, s12.startFrame + 9);
  const crece = prog(f, s11.startFrame, s12.startFrame, Easing.inOut(Easing.quad));
  const base: [number, number][] = [[80, 930], [300, 830], [540, 660], [800, 480], [1000, 345]];
  const pts = base.map(([x, y]) => [x, 930 - (930 - y) * (1 + 0.14 * crece)] as [number, number]);
  const d = suave(pts);
  const p = prog(f, s10.startFrame + 6, s10.startFrame + 46, easeInOut);
  if (capa === "detras") {
    const h = punto(d, p);
    return (
      <Svg>
        <g opacity={sale}>
          <Trazo d={d} p={p} color={P.yellow} w={6} />
          {p >= 0.995 ? <Punta x={h.x} y={h.y} ang={h.ang} /> : <Nodo x={h.x} y={h.y} t={p > 0.01 ? 1 : 0} r={9} />}
        </g>
      </Svg>
    );
  }
  const t1 = prog(f, s11.beats.tacha1, s11.beats.tacha1 + 8, easeOut);
  const t2 = prog(f, s11.beats.tacha2, s11.beats.tacha2 + 8, easeOut);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: sale }}>
      <Rotulo x={78} y={410} t={vis(f, s11.beats.dominar) * (1 - 0.4 * t1)} tono="blanco" size={28} tachado={t1} escala={1 - 0.08 * t1}>¿DOMINAR?</Rotulo>
      <Rotulo x={1006} y={410} t={vis(f, s11.beats.reemplazar) * (1 - 0.4 * t2)} tono="blanco" size={26} ax={1} tachado={t2} escala={1 - 0.08 * t2}>¿REEMPLAZAR?</Rotulo>
    </div>
  );
};

// ---------- B6 · s13–s16: desde HOY → dos trayectorias → carrera → ventaja ----------
const HOY_PTS: [number, number][] = [[100, 905], [200, 792], [262, 645], [540, 505], [835, 440], [985, 340]];
const HOY_D = suave(HOY_PTS);
const HOY_P = HOY_PTS.map((_, i) => (i === 0 ? 0 : getLength(suave(HOY_PTS.slice(0, i + 1))) / getLength(HOY_D)));
const A0: [number, number][] = [[100, 905], [300, 830], [540, 770], [800, 715], [985, 680]];
const A1: [number, number][] = [[100, 905], [300, 800], [540, 600], [800, 420], [985, 270]];
const B_PTS: [number, number][] = [[100, 905], [300, 800], [540, 620], [800, 470], [985, 360]];
const B6: React.FC<BloqueProps> = ({ f, S, capa, total }) => {
  const { s13, s14, s15, s16 } = S;
  if (f < s13.startFrame - 2) return null;
  const hoySale = 1 - prog(f, s14.startFrame, s14.startFrame + 8);
  const hp = interpolate(f, [s13.beats.hoy, s13.beats.ia, s13.beats.agentes, s13.beats.auto, s13.beats.prod], [0, HOY_P[1], HOY_P[2], HOY_P[4], 1], { ...clamp, easing: easeInOut });
  // dos trayectorias
  const aP = prog(f, s14.startFrame + 2, s14.beats.tu + 12, easeOut);
  const bP = prog(f, s14.beats.comp, s14.beats.comp + 20, easeOut);
  const supera = prog(f, s16.beats.supera - 6, s16.beats.ventaja, Easing.inOut(Easing.cubic));
  const A = suave(A0.map(([x, y], i) => [x, y + (A1[i][1] - y) * supera] as [number, number]));
  const B = suave(B_PTS);
  const simple = prog(f, s16.beats.flecha, s16.beats.flecha + 10);
  const bOp = (1 - 0.5 * supera) * (1 - simple);
  const aHead = punto(A, aP);
  const bHead = punto(B, bP);
  const dec = punto(A, 0.9); // tramo visible a la derecha del presentador
  const decT = vis(f, s14.beats.decision, s16.beats.supera, 6, 8);
  const pul = f < s14.beats.decision ? 0 : ((f - s14.beats.decision) % 20) / 20;
  // eje con marcas que pasan cada vez más rápido (s15)
  const t15 = Math.max(0, f - s15.startFrame);
  const desplaza = 0.9 * t15 * t15 * 0.12 + t15 * 2;
  const ejeT = vis(f, s14.startFrame, s16.beats.flecha, 8, 8);
  if (capa === "detras") {
    const ticks = [];
    for (let x = 80 - (desplaza % 60); x <= 1010; x += 60) if (x >= 80) ticks.push(x);
    return (
      <Svg>
        <g opacity={hoySale}>
          <Trazo d="M 80 935 L 1010 935" color="#FFFFFF" w={3} opacity={0.7 * vis(f, s13.startFrame)} glow={false} />
          <Trazo d={HOY_D} p={hp} color={P.yellow} w={6} />
          {HOY_PTS.map(([x, y], i) => (i === 3 ? null : <Nodo key={i} x={x} y={y} t={hp >= HOY_P[i] - 0.001 && f >= s13.beats.hoy ? 1 : 0} color={i === 1 ? P.blue : P.yellow} r={i === 5 ? 13 : 11} />))}
        </g>
        {f >= s14.startFrame ? (
          <g>
            <g opacity={ejeT}>
              <line x1={80} x2={1010} y1={935} y2={935} stroke="rgba(255,255,255,0.7)" strokeWidth={3} />
              {ticks.map((x) => <line key={x} x1={x} x2={x} y1={927} y2={943} stroke="#FFFFFF" strokeWidth={3} opacity={0.85} />)}
            </g>
            <Trazo d={B} p={bP} color="#FFFFFF" w={5} opacity={bOp} />
            {bP > 0.98 ? <Punta x={bHead.x} y={bHead.y} ang={bHead.ang} color="#FFFFFF" s={22} opacity={bOp} /> : null}
            <Trazo d={A} p={aP} color={P.yellow} w={6 + 2 * supera} />
            {aP > 0.98 ? <Punta x={aHead.x} y={aHead.y} ang={aHead.ang} s={26 + 6 * supera} /> : null}
            {decT > 0 ? <Nodo x={dec.x} y={dec.y} t={decT} r={11} pulso={pul} /> : null}
          </g>
        ) : null}
      </Svg>
    );
  }
  const hoyT = (k: string) => vis(f, s13.beats[k], s14.startFrame, 7, 7);
  return (
    <>
      <Rotulo x={92} y={862} t={hoyT("hoy")} tono="amarillo" size={24} ay={1}>HOY</Rotulo>
      <Rotulo x={228} y={792} t={hoyT("ia")} tono="azul" size={24}>IA</Rotulo>
      <Rotulo x={236} y={645} t={hoyT("agentes")} tono="blanco" size={24} ax={1}>AGENTES</Rotulo>
      <Rotulo x={1006} y={474} t={hoyT("auto")} tono="blanco" size={22} ax={1} ay={0}>AUTOMATIZACIÓN</Rotulo>
      <Rotulo x={1006} y={372} t={hoyT("prod")} tono="amarillo" size={22} ax={1} ay={0}>PRODUCTIVIDAD</Rotulo>
      <Rotulo x={1006} y={bHead.y + 34} t={vis(f, s14.beats.comp + 10, s16.beats.supera + 10) * (bP > 0.9 ? 1 : 0)} tono="blanco" size={22} ax={1} ay={0}>COMPETENCIA</Rotulo>
      <Rotulo x={1006} y={aHead.y + 34} t={vis(f, s14.beats.tu + 8, s16.beats.ventaja - 4) * (aP > 0.9 ? 1 : 0)} tono="amarillo" size={22} ax={1} ay={0}>TU NEGOCIO</Rotulo>
      <Rotulo x={1006} y={aHead.y + 34} t={vis(f, s16.beats.ventaja, s16.beats.flecha + 6, 7, 10)} tono="amarillo" size={28} ax={1} ay={0}>VENTAJA<Sube /></Rotulo>
    </>
  );
};

export const BLOQUES: React.FC<BloqueProps>[] = [B1, B2, B3, B4, B6];
