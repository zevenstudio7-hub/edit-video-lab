import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { P } from "./ui";

// Iconos 3D propios de VIDEO-002 (pedido del usuario, 2026-10-05: «recrear los iconos en 3D… los que necesitamos
// según lo que se menciona, en 3D tal como lo hicieron en la referencia»). Se modelan aquí con primitivas de three.js
// (sin modelos ni texturas externas) y material afelpado: rugosidad alta, «sheen» de tela y un relieve de ruido fino,
// como los objetos de fieltro del video de referencia. Colores de la identidad video-zeven (ZevenPRO).
// Los iconos se renderizan en 3D (WebGL) una sola vez, «horneados» en hojas de fotogramas: 20 de entrada (t 0→1) y
// 120 de reposo en bucle (fase p 0→1). Las escenas reproducen esas hojas (<Icon3D>): crear varios lienzos WebGL a la vez
// congelaba el Studio (14 s al entrar en m8 con 4 iconos, compilando sombreadores en la GPU Intel del equipo).
// Hornear: node src/videoAnalysis/video002/buildIconSprites.mjs (composición «Video002Icono3D»).

export type Icon3DName = "clock" | "play" | "chart" | "eye" | "people" | "store" | "target" | "magnifier" | "cart" | "box" | "popcorn" | "gear" | "coins" | "checklist";
export const ICON3D_NAMES: Icon3DName[] = ["clock", "play", "chart", "eye", "people", "store", "target", "magnifier", "cart", "box", "popcorn", "gear", "coins", "checklist"];
/** t: entrada 0→1; p: fase del bucle de reposo 0→1 (todo movimiento de reposo da vueltas enteras en un bucle). */
interface ModelProps { t: number; p: number }

// ---------- materiales ----------

/** Relieve de fieltro: ruido de valor determinista (dos octavas + grano) en una textura que se repite. */
let felt: THREE.DataTexture | null = null;
const feltMap = () => {
  if (felt) return felt;
  let seed = 20261005;
  const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const N = 128, grid = (g: number) => Array.from({ length: g * g }, rnd);
  const g1 = grid(16), g2 = grid(32);
  const sample = (g: number[], n: number, x: number, y: number) => {
    const gx = (x / N) * n, gy = (y / N) * n, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const at = (i: number, j: number) => g[((j % n) + n) % n * n + ((i % n) + n) % n];
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy;
  };
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = 0.45 * sample(g1, 16, x, y) + 0.35 * sample(g2, 32, x, y) + 0.2 * rnd();
    const i = (y * N + x) * 4; data[i] = data[i + 1] = data[i + 2] = Math.round(v * 255); data[i + 3] = 255;
  }
  felt = new THREE.DataTexture(data, N, N);
  felt.wrapS = felt.wrapT = THREE.RepeatWrapping;
  felt.repeat.set(4, 4);
  felt.magFilter = THREE.LinearFilter;
  felt.needsUpdate = true;
  return felt;
};

/** Fieltro: mate, con brillo de tela en los bordes. */
const Felt: React.FC<{ color: string; fuzz?: number }> = ({ color, fuzz = 1 }) => {
  const c = useMemo(() => new THREE.Color(color), [color]);
  const sheen = useMemo(() => c.clone().lerp(new THREE.Color("#ffffff"), 0.38), [c]);
  return <meshPhysicalMaterial color={c} roughness={0.88} sheen={1} sheenRoughness={0.45} sheenColor={sheen} bumpMap={feltMap()} bumpScale={1.1 * fuzz} />;
};
/** Plástico brillante (cristal del ojo, centro del reloj, monedas). */
const Gloss: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.2 }) => <meshPhysicalMaterial color={color} roughness={rough} clearcoat={1} clearcoatRoughness={0.12} />;

const rbox = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 6, r);
const extrude = (shape: THREE.Shape, depth: number, bevel: number) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 48 }); g.center(); return g; };

// ---------- modelos (caben en un cubo de ±1,1 unidades) ----------

const Clock: React.FC<ModelProps> = ({ p }) => {
  const minute = -p * Math.PI * 2, hour = -1.1;
  return (
    <group position={[0, 0.02, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.56 * s, 0.84, -0.04]} rotation={[0, 0, -0.55 * s]}><sphereGeometry args={[0.3, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><Felt color={P.red} /></mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.92, 0.92, 0.5, 96]} /><Felt color={P.yellow} /></mesh>
      <mesh position={[0, 0, 0.25]}><torusGeometry args={[0.8, 0.09, 24, 96]} /><Felt color={P.yellow} /></mesh>
      <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.06, 96]} /><meshStandardMaterial color="#FFFDF6" roughness={0.75} /></mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <mesh key={i} position={[Math.sin(a) * 0.63, Math.cos(a) * 0.63, 0.26]} rotation={[0, 0, -a]}><boxGeometry args={[0.045, i % 3 === 0 ? 0.15 : 0.08, 0.02]} /><meshStandardMaterial color={P.ink} /></mesh>;
      })}
      <group position={[0, 0, 0.27]} rotation={[0, 0, hour]}><mesh position={[0, 0.19, 0]}><boxGeometry args={[0.075, 0.42, 0.03]} /><meshStandardMaterial color={P.ink} /></mesh></group>
      <group position={[0, 0, 0.29]} rotation={[0, 0, minute]}><mesh position={[0, 0.27, 0]}><boxGeometry args={[0.05, 0.6, 0.03]} /><meshStandardMaterial color={P.ink} /></mesh></group>
      <mesh position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.075, 0.075, 0.05, 32]} /><Gloss color={P.red} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.52 * s, -0.9, 0]} rotation={[0, 0, 0.5 * s]}><capsuleGeometry args={[0.075, 0.2, 8, 16]} /><Felt color={P.ink} /></mesh>
      ))}
    </group>
  );
};

const Play: React.FC<ModelProps> = () => {
  const tile = useMemo(() => rbox(1.8, 1.36, 0.42, 0.34), []);
  const tri = useMemo(() => { const s = new THREE.Shape(); s.moveTo(-0.3, -0.38); s.lineTo(0.44, 0); s.lineTo(-0.3, 0.38); s.closePath(); return extrude(s, 0.1, 0.08); }, []);
  return (
    <group>
      <mesh geometry={tile}><Felt color={P.red} /></mesh>
      <mesh geometry={tri} position={[0.05, 0, 0.3]}><Felt color="#FFFFFF" /></mesh>
    </group>
  );
};

const Chart: React.FC<ModelProps> = ({ t }) => {
  const hs = [0.62, 1.0, 0.82, 1.42];
  const bars = useMemo(() => hs.map((h) => rbox(0.34, h, 0.34, 0.1)), []);
  const base = useMemo(() => rbox(2.1, 0.16, 0.9, 0.07), []);
  return (
    <group position={[0, -0.62, 0]}>
      <mesh geometry={base} position={[0, -0.08, 0]}><Felt color="#FFFFFF" /></mesh>
      {hs.map((h, i) => {
        const grow = interpolate(t, [0.15 + i * 0.12, 0.55 + i * 0.12], [0.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
        return <mesh key={i} geometry={bars[i]} position={[-0.72 + i * 0.48, (h * grow) / 2, 0]} scale={[1, grow, 1]}><Felt color={i === 3 ? P.yellow : P.blue} /></mesh>;
      })}
    </group>
  );
};

const Eye: React.FC<ModelProps> = ({ p }) => {
  const look = Math.sin(p * Math.PI * 4) * 0.22, blink = p > 0.86 && p < 0.93 ? Math.sin(((p - 0.86) / 0.07) * Math.PI) : 0;
  return (
    <group>
      <mesh><sphereGeometry args={[0.95, 96, 64]} /><Gloss color="#FFFFFF" rough={0.3} /></mesh>
      <group rotation={[0.05, look, 0]}>
        <mesh position={[0, 0, 0.78]} scale={[1, 1, 0.42]}><sphereGeometry args={[0.46, 64, 32]} /><Gloss color={P.blue} /></mesh>
        <mesh position={[0, 0, 0.93]} scale={[1, 1, 0.4]}><sphereGeometry args={[0.22, 48, 24]} /><Gloss color={P.ink} /></mesh>
        <mesh position={[0.13, 0.14, 1.0]}><sphereGeometry args={[0.07, 24, 12]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>
      {/* párpado de fieltro amarillo (parpadea una vez por bucle) */}
      <mesh rotation={[-0.62 + blink * 1.15, 0, 0]}><sphereGeometry args={[1.0, 96, 48, 0, Math.PI * 2, 0, Math.PI * 0.42]} /><Felt color={P.yellow} /></mesh>
    </group>
  );
};

const torsoGeometry = () => {
  const curve = new THREE.CatmullRomCurve3([[0.0, 0], [0.6, 0.0], [0.66, 0.08], [0.6, 0.32], [0.46, 0.56], [0.26, 0.7], [0.0, 0.74]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  return new THREE.LatheGeometry(curve.getPoints(40).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y)), 72);
};
const Bust: React.FC<{ color: string; x?: number; y?: number; z?: number; s?: number }> = ({ color, x = 0, y = 0, z = 0, s = 1 }) => {
  const torso = useMemo(torsoGeometry, []);
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 0.44, 0]}><sphereGeometry args={[0.34, 64, 48]} /><Felt color={color} /></mesh>
      <mesh geometry={torso} position={[0, -0.76, 0]}><Felt color={color} /></mesh>
    </group>
  );
};
const People: React.FC<ModelProps> = ({ p }) => (
  <group position={[0, 0.02, 0]}>
    <Bust color={P.yellow} x={-0.66} y={0.04 + Math.sin(p * Math.PI * 4) * 0.02} z={-0.35} s={0.8} />
    <Bust color={P.red} x={0.66} y={0.04 + Math.sin(p * Math.PI * 4 + 2) * 0.02} z={-0.35} s={0.8} />
    <Bust color={P.blue} y={Math.sin(p * Math.PI * 4 + 1) * 0.02} z={0.12} />
  </group>
);

const Store: React.FC<ModelProps> = () => {
  const body = useMemo(() => rbox(1.7, 1.06, 1.1, 0.12), []);
  const roof = useMemo(() => rbox(1.95, 0.2, 1.3, 0.08), []);
  const stripe = useMemo(() => rbox(0.3, 0.44, 0.12, 0.05), []);
  const door = useMemo(() => rbox(0.44, 0.7, 0.08, 0.06), []);
  const win = useMemo(() => rbox(0.64, 0.42, 0.06, 0.05), []);
  return (
    <group position={[0, -0.12, 0]}>
      <mesh geometry={body} position={[0, -0.3, 0]}><Felt color="#FFF6E2" /></mesh>
      <mesh geometry={roof} position={[0, 0.44, 0]}><Felt color={P.ink} /></mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[-0.8 + i * 0.32, 0.24, 0.66]} rotation={[0.55, 0, 0]}>
          <mesh geometry={stripe}><Felt color={i % 2 ? "#FFFFFF" : P.red} /></mesh>
          <mesh position={[0, -0.22, 0]}><sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><Felt color={i % 2 ? "#FFFFFF" : P.red} /></mesh>
        </group>
      ))}
      <mesh geometry={door} position={[0.46, -0.46, 0.56]}><Felt color={P.blue} /></mesh>
      <mesh geometry={win} position={[-0.34, -0.3, 0.56]}><Gloss color="#C9DAFF" /></mesh>
    </group>
  );
};

const Target: React.FC<ModelProps> = ({ t }) => {
  const hit = interpolate(t, [0.45, 0.8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const wobble = t >= 0.8 ? Math.sin((t - 0.8) * 60) * 0.06 * (1 - t) : 0;
  return (
    <group>
      {[{ r: 1.0, c: P.red }, { r: 0.76, c: "#FFFFFF" }, { r: 0.52, c: P.red }, { r: 0.28, c: "#FFFFFF" }].map((ring, i) => (
        <mesh key={i} position={[0, 0, i * 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[ring.r, ring.r, 0.2, 96]} /><Felt color={ring.c} /></mesh>
      ))}
      {/* dardo: llega desde delante y se clava en el centro */}
      <group position={[0.04 + hit * 0.9, 0.04 + hit * 0.9, 0.32 + hit * 2.2]} rotation={[-0.55 + wobble, 0.55, 0]}>
        <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 0.85, 16]} /><Gloss color={P.ink} /></mesh>
        <mesh position={[0, 0, 0.02]} rotation={[-Math.PI / 2, 0, 0]}><coneGeometry args={[0.08, 0.24, 24]} /><Gloss color="#D7D7DE" /></mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0, 0.88]} rotation={[0, 0, (k * Math.PI * 2) / 3]}><boxGeometry args={[0.02, 0.3, 0.26]} /><Felt color={P.yellow} /></mesh>
        ))}
      </group>
    </group>
  );
};

const Magnifier: React.FC<ModelProps> = ({ p }) => (
  <group rotation={[0, 0, 0.2 + Math.sin(p * Math.PI * 4) * 0.06]}>
    <Bust color={P.blue} x={-0.2} y={0.18} z={-0.12} s={0.42} />
    <mesh position={[-0.2, 0.24, 0]}><torusGeometry args={[0.62, 0.14, 32, 96]} /><Felt color={P.ink} /></mesh>
    <mesh position={[-0.2, 0.24, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.6, 0.6, 0.05, 64]} /><meshPhysicalMaterial color="#DCE7FF" roughness={0.05} clearcoat={1} transparent opacity={0.35} /></mesh>
    <mesh position={[0.5, -0.56, 0]} rotation={[0, 0, 0.78]}><capsuleGeometry args={[0.15, 0.6, 12, 24]} /><Felt color={P.yellow} /></mesh>
  </group>
);

const Cart: React.FC<ModelProps> = () => {
  const basket = useMemo(() => { const s = new THREE.Shape(); s.moveTo(-0.82, 0.42); s.lineTo(0.82, 0.42); s.lineTo(0.6, -0.42); s.lineTo(-0.6, -0.42); s.closePath(); return extrude(s, 0.62, 0.12); }, []);
  const handle = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.92, 0.5, 0), new THREE.Vector3(-1.05, 0.88, 0), new THREE.Vector3(-1.32, 0.96, 0)]), 32, 0.075, 16), []);
  const groove = useMemo(() => rbox(1.2, 0.07, 0.04, 0.03), []);
  return (
    <group position={[0.12, 0.05, 0]}>
      <mesh geometry={basket}><Felt color={P.yellow} /></mesh>
      {[0.16, -0.08, -0.3].map((y, i) => <mesh key={i} geometry={groove} position={[0, y, 0.44]} scale={[1 - i * 0.12, 1, 1]}><meshStandardMaterial color="#C99A06" roughness={0.9} /></mesh>)}
      <mesh geometry={handle}><Felt color={P.ink} /></mesh>
      {[-0.44, 0.44].map((x) => <mesh key={x} position={[x, -0.74, 0.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.14, 32]} /><Felt color={P.ink} /></mesh>)}
    </group>
  );
};

const Box: React.FC<ModelProps> = () => {
  const body = useMemo(() => rbox(1.34, 1.04, 1.34, 0.1), []);
  return (
    <group rotation={[0.18, 0.62, 0]} position={[0, -0.05, 0]}>
      <mesh geometry={body}><Felt color="#E9AE2E" /></mesh>
      <mesh position={[0, 0.525, 0]}><boxGeometry args={[0.34, 0.02, 1.36]} /><Felt color="#FFFFFF" /></mesh>
      <mesh position={[0, 0.22, 0.675]}><boxGeometry args={[0.34, 0.62, 0.02]} /><Felt color="#FFFFFF" /></mesh>
      <mesh position={[0, 0.22, -0.675]}><boxGeometry args={[0.34, 0.62, 0.02]} /><Felt color="#FFFFFF" /></mesh>
    </group>
  );
};

const Popcorn: React.FC<ModelProps> = ({ p }) => {
  const N = 12;
  const segments = useMemo(() => {
    const prof = [[0.46, -0.78], [0.5, -0.76], [0.7, 0.36], [0.76, 0.42], [0.74, 0.47]].map(([x, y]) => new THREE.Vector2(x, y));
    return Array.from({ length: N }, (_, i) => new THREE.LatheGeometry(prof, 6, (i / N) * Math.PI * 2, (Math.PI * 2) / N));
  }, []);
  const kernels = useMemo(() => {
    let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    return Array.from({ length: 22 }, (_, i) => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.62; return { x: Math.cos(a) * d, z: Math.sin(a) * d * 0.9, y: 0.48 + (0.62 - d) * 0.55 + r() * 0.12, rad: 0.15 + r() * 0.09, c: ["#FFFDF5", "#FFF3C4", "#FFFFFF"][i % 3] }; });
  }, []);
  return (
    <group position={[0, -0.12, 0]}>
      {segments.map((g, i) => <mesh key={i} geometry={g}><Felt color={i % 2 ? "#FFFFFF" : P.red} /></mesh>)}
      {kernels.map((k, i) => <mesh key={i} position={[k.x, k.y + (i === 5 ? Math.max(0, Math.sin(p * Math.PI * 6)) * 0.12 : 0), k.z]}><icosahedronGeometry args={[k.rad, 3]} /><Felt color={k.c} fuzz={1.4} /></mesh>)}
    </group>
  );
};

const Gear: React.FC<ModelProps> = ({ p }) => {
  const geo = useMemo(() => {
    const teeth = 9, ro = 0.98, ri = 0.78, s = new THREE.Shape();
    for (let i = 0; i < teeth * 4; i++) { const a = (i / (teeth * 4)) * Math.PI * 2, r = i % 4 < 2 ? ro : ri; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); }
    s.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true); s.holes.push(hole);
    return extrude(s, 0.3, 0.07);
  }, []);
  // tres dientes por bucle (simetría de 9): el giro es continuo al repetir
  return <mesh geometry={geo} rotation={[0, 0, (-p * Math.PI * 2) / 3]}><Felt color={P.blue} /></mesh>;
};

const Coins: React.FC<ModelProps> = ({ t }) => {
  const drop = (k: number) => interpolate(t, [0.2 + k * 0.12, 0.5 + k * 0.12], [1.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.bounce) });
  return (
    <group position={[0, -0.35, 0]}>
      {[0, 1, 2].map((k) => (
        <group key={k} position={[-0.32, -0.38 + k * 0.2 + drop(k), 0]}>
          <mesh><cylinderGeometry args={[0.62, 0.62, 0.17, 64]} /><Gloss color={P.yellow} rough={0.3} /></mesh>
        </group>
      ))}
      <group position={[0.45, 0.34, 0.2]} rotation={[Math.PI / 2, 0, -0.25]}>
        <mesh><cylinderGeometry args={[0.6, 0.6, 0.18, 64]} /><Gloss color={P.yellow} rough={0.3} /></mesh>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.42, 0.05, 16, 64]} /><Gloss color="#E2B205" rough={0.3} /></mesh>
      </group>
    </group>
  );
};

const Checklist: React.FC<ModelProps> = ({ t }) => {
  const board = useMemo(() => rbox(1.46, 1.86, 0.16, 0.12), []);
  const clip = useMemo(() => rbox(0.62, 0.22, 0.22, 0.08), []);
  const tick = useMemo(() => rbox(0.26, 0.26, 0.1, 0.06), []);
  const bar = useMemo(() => rbox(0.66, 0.11, 0.05, 0.04), []);
  const check = useMemo(() => { const s = new THREE.Shape(); s.moveTo(-0.11, 0.0); s.lineTo(-0.04, -0.08); s.lineTo(0.12, 0.1); s.lineTo(0.09, 0.13); s.lineTo(-0.04, -0.02); s.lineTo(-0.08, 0.03); s.closePath(); return extrude(s, 0.03, 0.015); }, []);
  return (
    <group rotation={[0, 0, -0.06]}>
      <mesh geometry={board}><Felt color="#FFFFFF" /></mesh>
      <mesh geometry={clip} position={[0, 0.92, 0.06]}><Felt color={P.ink} /></mesh>
      {[0.42, 0.0, -0.42].map((y, i) => {
        const done = interpolate(t, [0.3 + i * 0.18, 0.45 + i * 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <group key={i} position={[0, y, 0.1]}>
            <mesh geometry={tick} position={[-0.42, 0, 0]}><Felt color={done > 0.5 ? P.yellow : "#ECE9E2"} /></mesh>
            <mesh geometry={check} position={[-0.42, 0, 0.08]} scale={0.0001 + done}><meshStandardMaterial color={P.ink} /></mesh>
            <mesh geometry={bar} position={[0.18, 0, 0]}><meshStandardMaterial color="#DAD6CD" roughness={0.9} /></mesh>
          </group>
        );
      })}
    </group>
  );
};

const MODELS: Record<Icon3DName, React.FC<ModelProps>> = { clock: Clock, play: Play, chart: Chart, eye: Eye, people: People, store: Store, target: Target, magnifier: Magnifier, cart: Cart, box: Box, popcorn: Popcorn, gear: Gear, coins: Coins, checklist: Checklist };

// ---------- escena 3D en vivo (solo para hornear) ----------

/** Luz de estudio: entorno de sala (procedural, sin archivos) + luz principal con sombra suave. */
const StudioLight: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NeutralToneMapping;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.7;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[-2.6, 4.6, 4]} intensity={1.7} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-2.4} shadow-camera-right={2.4} shadow-camera-top={2.4} shadow-camera-bottom={-2.4} shadow-radius={8} shadow-bias={-0.0006} />
      <directionalLight position={[3, 0.5, 2.5]} intensity={0.35} />
    </>
  );
};

/** Activa sombras en todos los objetos del icono (se proyectan entre sí). */
const Shadowed: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => { ref.current?.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } }); });
  return <group ref={ref}>{children}</group>;
};

const popIn = (t: number) => interpolate(t, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.7)) });

/** Icono 3D en vivo (WebGL, doble densidad de píxeles): crece y gira hasta quedar de frente con `t`; `p` es la fase de
 *  reposo (balanceo, flotación y los movimientos propios de cada modelo). */
export const Icon3DLive: React.FC<{ name: Icon3DName; size: number; t: number; p: number }> = ({ name, size, t, p }) => {
  const Model = MODELS[name];
  const s = 0.001 + popIn(t);
  const rotY = (1 - Math.min(1, t)) * -1.1 + Math.sin(p * Math.PI * 2) * 0.14;
  return (
    <ThreeCanvas width={size} height={size} dpr={2} shadows gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: 24, position: [0, 1.1, 7.4], near: 0.1, far: 40 }} onCreated={(state) => state.camera.lookAt(0, -0.05, 0)}>
      <StudioLight />
      <group scale={s} rotation={[0, rotY, 0]} position={[0, Math.sin(p * Math.PI * 4) * 0.04, 0]}>
        <Shadowed><Model t={t} p={p} /></Shadowed>
      </group>
    </ThreeCanvas>
  );
};

// ---------- hojas de fotogramas ----------

/** Hoja de cada icono: celdas de 300 px en 14 × 10; 20 fotogramas de entrada y 120 de reposo en bucle (4 s). */
export const SPRITE = { cell: 300, cols: 14, rows: 10, entry: 20, loop: 120 } as const;

/** Composición «Video002Icono3D» (300 × 300, 140 frames, fondo transparente): fotograma i de la hoja de `name`. */
export const IconSpriteFrame: React.FC<{ name: Icon3DName }> = ({ name }) => {
  const frame = useCurrentFrame();
  const t = frame < SPRITE.entry ? frame / (SPRITE.entry - 1) : 1;
  const p = frame < SPRITE.entry ? 0 : (frame - SPRITE.entry) / SPRITE.loop;
  return <Icon3DLive name={name} size={SPRITE.cell} t={t} p={p} />;
};

/** Icono 3D en escena: reproduce su hoja horneada (public/video-002/iconos3d/<nombre>.webp). Entra en el frame `at`
 *  durante `dur` frames y después sigue en reposo en bucle; `out` (1→0) lo encoge y lo apaga al salir. La hoja se
 *  carga desde el principio de la escena (oculta) para que no parpadee al aparecer. */
export const Icon3D: React.FC<{ name: Icon3DName; size: number; f: number; at: number; dur?: number; out?: number; style?: React.CSSProperties; contact?: boolean }> = ({ name, size, f, at, dur = 18, out = 1, style, contact = true }) => {
  const k = (f - at) / dur;
  const index = k <= 0 ? 0 : k < 1 ? Math.round(k * (SPRITE.entry - 1)) : SPRITE.entry + (Math.floor(f - at - dur) % SPRITE.loop);
  const col = index % SPRITE.cols, row = Math.floor(index / SPRITE.cols);
  const t = Math.max(0, Math.min(1, k));
  return (
    <div style={{ position: "relative", width: size, height: size, pointerEvents: "none", opacity: k <= 0 ? 0 : out, transform: out < 1 ? `scale(${0.6 + 0.4 * out})` : undefined, ...style }}>
      {contact ? <div style={{ position: "absolute", left: size * 0.2, width: size * 0.6, top: size * 0.83, height: size * 0.1, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(23,23,29,0.26), rgba(23,23,29,0))", transform: `scale(${0.4 + 0.6 * t})` }} /> : null}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img src={staticFile(`video-002/iconos3d/${name}.webp`)} style={{ position: "absolute", left: -col * size, top: -row * size, width: SPRITE.cols * size, height: SPRITE.rows * size, maxWidth: "none" }} />
      </div>
    </div>
  );
};
