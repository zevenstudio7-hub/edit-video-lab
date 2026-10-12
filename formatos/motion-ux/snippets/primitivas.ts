/**
 * Primitivas de movimiento de Motion UX (Soft Glass UI) para Remotion.
 * Son funciones PURAS del frame que devuelven estilos: no son componentes ni entran al catálogo de library/.
 * Fuente de los números: formatos/motion-ux/movimientos.json (puntos de partida; stills técnicos en la guía el 2026-10-10, sin aprobación audiovisual).
 * Equivalente HTML ejecutable: formatos/motion-ux/specimen/index.html (misma matemática).
 *
 * Uso típico dentro de un componente:
 *   const frame = useCurrentFrame();
 *   <h1 style={entradaDesenfoque(frame, 0)}>Dale contexto.</h1>
 *
 * Copiar a src/ o library/recipes/ solo cuando un VIDEO-XXX real lo use (regla de alta de library/README.md).
 */
import { Easing, interpolate, spring } from "remotion";
import type { CSSProperties } from "react";

export const FPS = 30;

export const EASE = {
  salidaExpo: Easing.bezier(0.16, 1, 0.3, 1),
  entradaSalida: Easing.bezier(0.65, 0, 0.35, 1),
  suave: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const SPRING = {
  suave: { damping: 200 },
  pop: { damping: 14, stiffness: 180, mass: 0.8 },
  rebote: { damping: 8, stiffness: 140 },
  firme: { damping: 20, stiffness: 300 },
} as const;

const prog = (frame: number, from: number, to: number, easing: (t: number) => number = EASE.salidaExpo) =>
  interpolate(frame, [from, to], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** entrada-desenfoque: opacity 0→1, blur 14→0 px, translateY 14→0 (10 f, salida-expo). */
export const entradaDesenfoque = (frame: number, delay = 0, dur = 10): CSSProperties => {
  const p = prog(frame, delay, delay + dur);
  return { opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 14}px)` };
};

/** cruce-desenfoque (parte saliente): opacity 1→0, blur 0→18 px, scale 1→1.02 (10 f, entrada-salida). */
export const salidaDesenfoque = (frame: number, start: number, dur = 10): CSSProperties => {
  const p = prog(frame, start, start + dur, EASE.entradaSalida);
  return { opacity: 1 - p, filter: `blur(${p * 18}px)`, transform: `scale(${1 + p * 0.02})` };
};

/** subida-tarjeta: translateY 110→0, scale .95→1, la opacidad llega a 1 al 60 % (18 f, salida-expo). */
export const subidaTarjeta = (frame: number, delay = 0, dur = 18): CSSProperties => {
  const p = prog(frame, delay, delay + dur);
  return { opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 110}px) scale(${0.95 + 0.05 * p})` };
};

/** revelado-lineas: estilo de CADA línea; el contenedor de la línea lleva overflow:hidden. Retardo de 3 f por línea. */
export const revelarLinea = (frame: number, indice: number, delay = 10): CSSProperties => {
  const p = prog(frame, delay + indice * 3, delay + indice * 3 + 12);
  return { transform: `translateY(${(1 - p) * 110}%)`, opacity: p };
};

/** cortina-central + asentado-con-halo: tarjeta que se abre desde una línea y asienta con resplandor de color. */
export const cortinaCentral = (frame: number, delay: number, radio: number, colorUi: string): CSSProperties => {
  const abre = prog(frame, delay, delay + 12, EASE.entradaSalida);
  const asienta = prog(frame, delay + 12, delay + 36);
  return {
    opacity: frame >= delay ? 1 : 0,
    clipPath: `inset(${(1 - abre) * 50}% 0 ${(1 - abre) * 50}% 0 round ${radio}px)`,
    transform: `scale(${0.94 + 0.06 * asienta})`,
    boxShadow: `0 ${70 * asienta}px 120px -50px color-mix(in srgb, ${colorUi} ${Math.round(55 * asienta)}%, transparent)`,
  };
};

/** pop-insignia: escala 0→1 con spring pop, 4 f después de su titular. */
export const popInsignia = (frame: number, delay = 4, fps = FPS): CSSProperties => ({
  transform: `scale(${frame >= delay ? spring({ frame: frame - delay, fps, config: SPRING.pop }) : 0})`,
});

/** baraja-3d: estilo de la tarjeta `i` (0..n-1) en el frame dado. Cada `hold` frames avanza una; el paso dura `paso` frames. */
export const baraja3d = (frame: number, i: number, n: number, hold = 44, paso = 10): CSSProperties => {
  const actual = Math.floor(frame / hold) % n;
  const t = interpolate(frame % hold, [hold - paso, hold], [0, 1], { easing: EASE.entradaSalida, extrapolateLeft: "clamp" });
  const pos = (((i - actual) % n) + n) % n; // 0 = frente
  if (pos === 0) {
    return { zIndex: 10, opacity: 1 - t, filter: `blur(${t * 16}px)`, transform: `translateY(${t * 420}px) scale(${1 + t * 0.03})` };
  }
  if (pos === n - 1) {
    // la última de la fila reaparece al fondo; su opacidad se resuelve en la composición (aquí queda oculta durante el paso)
    return { zIndex: 1, opacity: 0, transform: `translateY(${-(n - 1) * 58}px) scale(${1 - (n - 1) * 0.045})` };
  }
  const d = pos - t;
  return { zIndex: 10 - pos, opacity: 1, transform: `translateY(${-d * 58}px) scale(${1 - d * 0.045})` };
};

/** escritura-con-tinte: calendario de frames en que aparece cada carácter (1,7 f/car + 1,6 tras espacio + 5 tras coma). */
export const calendarioTecleo = (texto: string, inicio = 0): { frames: number[]; fin: number } => {
  const frames: number[] = [];
  let f = inicio;
  for (const c of texto) {
    frames.push(f);
    f += 1.7 + (c === " " ? 1.6 : 0) + (c === "," ? 5 : 0);
  }
  return { frames, fin: f };
};
export const caracteresVisibles = (frame: number, calendario: number[]): number => calendario.filter((f) => frame >= f).length;
/** caret: sólido mientras se teclea; después parpadea 8 f / 8 f. */
export const caretVisible = (frame: number, tecleando: boolean): boolean => tecleando || Math.floor(frame / 8) % 2 === 0;

/** cursor-clic: posición, escala y anillo. `inicio` = frame en que el cursor empieza a moverse. */
export const cursorClic = (
  frame: number, inicio: number, a: { x: number; y: number }, b: { x: number; y: number },
) => {
  const viaje = 26;
  const clic = inicio + viaje;
  const t = interpolate(frame, [inicio, clic], [0, 1], { easing: EASE.entradaSalida, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const anillo = prog(frame, clic, clic + 14);
  return {
    cursor: {
      opacity: prog(frame, inicio - 4, inicio + 2, (x) => x),
      left: a.x + (b.x - a.x) * t,
      top: a.y + (b.y - a.y) * t,
      transform: `scale(${frame >= clic && frame < clic + 5 ? 0.84 : 1})`,
    } as CSSProperties,
    anillo: {
      width: 20 + 140 * anillo, height: 20 + 140 * anillo,
      left: b.x - 10 - 70 * anillo, top: b.y - 10 - 70 * anillo,
      opacity: frame >= clic ? (1 - anillo) * 0.55 : 0,
    } as CSSProperties,
    pulsado: frame >= clic,
  };
};

/** borde-aurora: ángulo del conic-gradient (3° por frame). */
export const anguloAurora = (frame: number): number => (frame * 3) % 360;

/** inclinacion-3d: panel que entra inclinado y asienta; después deriva ±1,5°. */
export const inclinacion3d = (frame: number): CSSProperties => {
  const e = prog(frame, 0, 22);
  const rx = 24 - 8 * e + Math.sin(frame / 50) * 1.5;
  const ry = -16 + 6 * e + Math.cos(frame / 60) * 1.5;
  return { opacity: e, filter: `blur(${(1 - e) * 14}px)`, transform: `perspective(1500px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${(1 - e) * 80}px)` };
};

/** foco-lista: fila activa en el frame dado (cada 26 f) y su spring firme. */
export const focoLista = (frame: number, filas: number, cada = 26, fps = FPS) => {
  const activa = Math.floor(frame / cada) % filas;
  const s = spring({ frame: frame % cada, fps, config: SPRING.firme });
  return { activa, s };
};

/** flotar: deriva en reposo para stickers e iconos. */
export const flotar = (frame: number, fase = 0): CSSProperties => ({
  transform: `translateY(${Math.sin((2 * Math.PI * (frame + fase)) / 90) * 6}px) rotate(${Math.sin((2 * Math.PI * (frame + fase)) / 120) * 1.5}deg)`,
});

/** stickers-escalonados: escala y giro del sticker `i` (separación 4 f, spring rebote). */
export const stickerEscalonado = (frame: number, i: number, delay = 0, fps = FPS): CSSProperties => {
  const f0 = delay + i * 4;
  const s = frame >= f0 ? spring({ frame: frame - f0, fps, config: SPRING.rebote }) : 0;
  return { transform: `scale(${s}) rotate(${(1 - s) * -12}deg)` };
};
