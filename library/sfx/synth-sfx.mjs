// Sintetizador de efectos de sonido de interfaz (paleta «zp-», ZevenPRO). Sonidos propios, generados aquí por
// síntesis determinista: sin descargas ni licencias de terceros. Cada sonido es corto, suave y con un sentido
// concreto (aparecer, tocar madera, subir, caer, encajar, marcar…), para acompañar motion sin tapar la voz.
//
// Uso: node library/sfx/synth-sfx.mjs [--list]
//   escribe public/sfx/zp-*.wav (48 kHz, mono, 24 bit, pico −3 dBFS) y actualiza library/sfx/sfx.json → sintetizados
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const SR = 48000;
const N = (s) => Math.max(1, Math.round(s * SR));

// ---------- utilidades DSP ----------
let seed = 1;
const rand = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; };
const noise = (d, s = 7) => { seed = s; return Float32Array.from({length: N(d)}, rand); };
/** Oscilador con frecuencia variable f(t) (Hz) y forma: suma de armónicos [ [mult, amp], … ]. */
const osc = (d, f, harmonics = [[1, 1]]) => {
  const out = new Float32Array(N(d));
  let ph = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * f(t)) / SR;
    let v = 0;
    for (const [m, a] of harmonics) v += a * Math.sin(ph * m);
    out[i] = v;
  }
  return out;
};
/** Envolvente: ataque lineal (s) y caída exponencial (constante de tiempo, s). */
const env = (x, attack, decay, hold = 0) => {
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] *= t < attack ? t / attack : t < attack + hold ? 1 : Math.exp(-(t - attack - hold) / decay);
  }
  return x;
};
/** Envolvente de «trazo»: sube en a, se mantiene, baja en r (fracciones de la duración). */
const shape = (x, a = 0.3, r = 0.4) => {
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    x[i] *= u < a ? Math.sin((Math.PI / 2) * (u / a)) : u > 1 - r ? Math.sin((Math.PI / 2) * ((1 - u) / r)) : 1;
  }
  return x;
};
/** Biquad RBJ con frecuencia variable f(t) (lowpass, highpass, bandpass). */
const filt = (x, type, f, Q = 0.707) => {
  const out = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0, b1, b2, a1, a2;
  const coef = (fc) => {
    const w0 = (2 * Math.PI * Math.min(fc, SR * 0.45)) / SR, cw = Math.cos(w0), al = Math.sin(w0) / (2 * Q);
    let B0, B1, B2;
    if (type === 'lp') { B0 = (1 - cw) / 2; B1 = 1 - cw; B2 = (1 - cw) / 2; }
    else if (type === 'hp') { B0 = (1 + cw) / 2; B1 = -(1 + cw); B2 = (1 + cw) / 2; }
    else { B0 = al; B1 = 0; B2 = -al; }
    const A0 = 1 + al;
    b0 = B0 / A0; b1 = B1 / A0; b2 = B2 / A0; a1 = (-2 * cw) / A0; a2 = (1 - al) / A0;
  };
  const fixed = typeof f === 'number';
  if (fixed) coef(f);
  for (let i = 0; i < x.length; i++) {
    if (!fixed && i % 32 === 0) coef(f(i / SR));
    const y = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y;
    out[i] = y;
  }
  return out;
};
const gain = (x, g) => x.map((v) => v * g);
/** Mezcla: [señal, desfase en s, ganancia]. */
const mix = (d, ...parts) => {
  const out = new Float32Array(N(d));
  for (const [x, at = 0, g = 1] of parts) {
    const o = N(at);
    for (let i = 0; i < x.length && i + o < out.length; i++) out[i + o] += x[i] * g;
  }
  return out;
};
/** Sala pequeña (Schroeder): da cuerpo sin cola larga. */
const room = (x, wet = 0.14, tail = 0.35) => {
  const out = new Float32Array(x.length + N(tail));
  out.set(x);
  const combs = [0.0297, 0.0371, 0.0411, 0.0437].map((d) => ({d: N(d), buf: new Float32Array(N(d)), i: 0, lp: 0}));
  const aps = [0.005, 0.0017].map((d) => ({d: N(d), buf: new Float32Array(N(d)), i: 0}));
  for (let n = 0; n < out.length; n++) {
    const inp = n < x.length ? x[n] : 0;
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.6 + c.lp * 0.4;
      c.buf[c.i] = inp + c.lp * 0.62;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    s /= combs.length;
    for (const a of aps) {
      const b = a.buf[a.i];
      const y = -0.7 * s + b;
      a.buf[a.i] = s + 0.7 * y;
      a.i = (a.i + 1) % a.d;
      s = y;
    }
    out[n] = (n < x.length ? x[n] : 0) + wet * s;
  }
  return out;
};
const fadeEdges = (x, inS = 0.002, outS = 0.02) => {
  const a = N(inS), b = N(outS);
  for (let i = 0; i < a && i < x.length; i++) x[i] *= i / a;
  for (let i = 0; i < b && i < x.length; i++) x[x.length - 1 - i] *= i / b;
  return x;
};
const normalize = (x, peakDb = -3) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  const g = m > 0 ? 10 ** (peakDb / 20) / m : 1;
  return x.map((v) => v * g);
};
const expGlide = (f0, f1, tau) => (t) => f1 + (f0 - f1) * Math.exp(-t / tau);
const sweep = (f0, f1, d) => (t) => f0 * (f1 / f0) ** Math.min(1, t / d);

// ---------- paleta ----------
const SOUNDS = {
  'zp-pop': {uso: 'Aparece una tarjeta u objeto (suave, redondo).', volumen: 0.24, make: () => room(mix(0.16,
    [env(osc(0.16, expGlide(420, 760, 0.02), [[1, 1], [2, 0.18]]), 0.002, 0.045)],
    [env(filt(noise(0.006, 3), 'hp', 3000), 0.0005, 0.002), 0, 0.25]), 0.12)},
  'zp-pop-hi': {uso: 'Aparece un elemento pequeño: etiqueta, año, chip.', volumen: 0.2, make: () => room(mix(0.12,
    [env(osc(0.12, expGlide(860, 1420, 0.015), [[1, 1], [2, 0.12]]), 0.0015, 0.035)]), 0.1)},
  'zp-tick': {uso: 'Movimiento mínimo: un ajuste, un paso de aguja.', volumen: 0.16, make: () => mix(0.05,
    [env(osc(0.05, () => 2600), 0.0005, 0.008)], [env(filt(noise(0.004, 5), 'hp', 4000), 0.0003, 0.0015), 0, 0.3])},
  'zp-tap': {uso: 'Se apoya un bloque, un cubo o una tabla (madera).', volumen: 0.26, make: () => room(mix(0.12,
    [env(filt(noise(0.08, 11), 'bp', 900, 3), 0.0008, 0.018)], [env(osc(0.1, () => 230), 0.001, 0.03), 0, 0.55], [env(osc(0.06, () => 640), 0.001, 0.02), 0, 0.25]), 0.1)},
  'zp-swish': {uso: 'Algo se desliza o entra de lado.', volumen: 0.2, make: () => fadeEdges(shape(filt(noise(0.3, 13), 'bp', sweep(700, 2400, 0.3), 1.2), 0.45, 0.55), 0.005, 0.03)},
  'zp-swish-up': {uso: 'Algo sale hacia arriba o se retira (cargador, auriculares).', volumen: 0.2, make: () => fadeEdges(mix(0.36,
    [shape(filt(noise(0.36, 17), 'bp', sweep(500, 3800, 0.36), 1.5), 0.6, 0.4)],
    [shape(osc(0.36, sweep(300, 700, 0.36)), 0.6, 0.4), 0, 0.12]), 0.005, 0.03)},
  'zp-rise': {uso: 'Subir: crecer, ponerse por encima («arriba»).', volumen: 0.18, make: () => room(fadeEdges(mix(0.5,
    [shape(osc(0.5, sweep(330, 990, 0.42), [[1, 1], [2, 0.2]]), 0.25, 0.3)],
    [shape(filt(noise(0.5, 19), 'bp', sweep(800, 3000, 0.45), 1), 0.4, 0.3), 0, 0.12]), 0.01, 0.06), 0.12)},
  'zp-drop': {uso: 'Caer o perder peso (se apaga, se derrumba).', volumen: 0.17, make: () => fadeEdges(mix(0.34,
    [env(osc(0.34, sweep(880, 250, 0.3), [[1, 1], [2, 0.15]]), 0.004, 0.12)]), 0.003, 0.04)},
  'zp-thud': {uso: 'Peso que aterriza o se vence (balanza, pared).', volumen: 0.32, make: () => room(mix(0.3,
    [env(osc(0.3, expGlide(120, 55, 0.06)), 0.002, 0.07)], [env(filt(noise(0.06, 23), 'lp', 260), 0.001, 0.025), 0, 0.5]), 0.08)},
  'zp-chime': {uso: 'Valor, logro, algo positivo (gema, medalla, confianza).', volumen: 0.18, make: () => {
    const bell = (f, at, g) => [mix(0.9, [env(osc(0.9, () => f), 0.002, 0.55)], [env(osc(0.9, () => f * 2.0), 0.002, 0.3), 0, 0.45], [env(osc(0.6, () => f * 2.76), 0.002, 0.16), 0, 0.22], [env(osc(0.3, () => f * 5.4), 0.001, 0.06), 0, 0.08]), at, g];
    return room(mix(1.0, bell(1046.5, 0, 1), bell(1568, 0.07, 0.7)), 0.16, 0.5);
  }},
  'zp-sparkle': {uso: 'Brillo, llegada, estrella.', volumen: 0.15, make: () => room(mix(0.4,
    ...[2093, 2637, 3136, 3520, 4186].map((f, i) => [env(osc(0.12, () => f), 0.001, 0.045), i * 0.045, 1 - i * 0.12])), 0.18, 0.4)},
  'zp-snap': {uso: 'Encaja en su sitio (pieza de puzle).', volumen: 0.28, make: () => mix(0.1,
    [env(filt(noise(0.004, 29), 'hp', 2500), 0.0002, 0.0015)], [env(osc(0.08, () => 180), 0.0005, 0.025), 0, 0.7], [env(osc(0.03, () => 1200), 0.0005, 0.01), 0, 0.35])},
  'zp-unplug': {uso: 'Desconectar un cable, desaparece un conector.', volumen: 0.26, make: () => room(mix(0.16,
    [env(filt(noise(0.005, 31), 'hp', 2000), 0.0003, 0.0015), 0, 0.6], [env(osc(0.14, expGlide(520, 140, 0.04)), 0.001, 0.05), 0.004, 1]), 0.08)},
  'zp-clunk': {uso: 'Pieza mecánica que sale (batería).', volumen: 0.28, make: () => {
    const hit = (s) => mix(0.08, [env(filt(noise(0.008, s), 'bp', 1500, 2), 0.0004, 0.004)], [env(osc(0.08, () => 140), 0.001, 0.035), 0, 0.8]);
    return room(mix(0.18, [hit(37), 0, 1], [hit(41), 0.065, 0.7]), 0.08);
  }},
  'zp-marker': {uso: 'Rotulador que subraya o resalta texto.', volumen: 0.16, make: () => {
    const x = filt(noise(0.28, 43), 'bp', 2200, 1.0);
    for (let i = 0; i < x.length; i++) x[i] *= 0.75 + 0.25 * Math.sin((2 * Math.PI * 18 * i) / SR);
    return fadeEdges(shape(x, 0.15, 0.25), 0.004, 0.02);
  }},
  'zp-stamp': {uso: 'Sello: algo queda marcado como igual o copiado.', volumen: 0.3, make: () => room(mix(0.24,
    [env(osc(0.24, expGlide(95, 60, 0.08)), 0.001, 0.06)], [env(filt(noise(0.08, 47), 'bp', 600, 1), 0.0005, 0.04), 0, 0.6], [env(filt(noise(0.004, 53), 'hp', 3000), 0.0002, 0.0015), 0, 0.4]), 0.1)},
  'zp-alert': {uso: 'Punto crítico o problema (dos tonos que bajan).', volumen: 0.17, make: () => room(mix(0.32,
    [env(osc(0.12, () => 660, [[1, 1], [3, 0.18]]), 0.003, 0.06)], [env(osc(0.16, () => 494, [[1, 1], [3, 0.18]]), 0.003, 0.08), 0.13, 1]), 0.12)},
  'zp-tock': {uso: 'Tiempo: tic-tac.', volumen: 0.22, make: () => room(mix(0.42,
    [env(osc(0.05, () => 1350), 0.0005, 0.018)], [env(filt(noise(0.004, 59), 'hp', 3000), 0.0002, 0.0015), 0, 0.3], [env(osc(0.06, () => 980), 0.0005, 0.022), 0.3, 1]), 0.1)},
  'zp-step': {uso: 'Paso suave (alguien avanza).', volumen: 0.14, make: () => mix(0.09,
    [env(filt(noise(0.07, 61), 'bp', 350, 1), 0.001, 0.02)], [env(osc(0.06, () => 90), 0.001, 0.03), 0, 0.6])},
  'zp-text': {uso: 'Entra un texto grande destacado.', volumen: 0.2, make: () => fadeEdges(mix(0.3,
    [shape(filt(noise(0.22, 67), 'bp', sweep(300, 1200, 0.22), 0.8), 0.7, 0.3)], [env(osc(0.08, expGlide(200, 320, 0.02)), 0.001, 0.035), 0.19, 0.9]), 0.004, 0.03)},
  'zp-confirm': {uso: 'Confirmación: ok, check, decisión correcta.', volumen: 0.18, make: () => room(mix(0.42,
    [env(osc(0.14, () => 784, [[1, 1], [2, 0.25]]), 0.002, 0.07)], [env(osc(0.3, () => 1175, [[1, 1], [2, 0.25]]), 0.002, 0.16), 0.09, 1]), 0.14)},
  'zp-assemble': {uso: 'Piezas que ensamblan (varios clics mecánicos).', volumen: 0.18, make: () => mix(0.6,
    ...Array.from({length: 8}, (_, i) => [mix(0.04, [env(osc(0.04, () => (i % 2 ? 1800 : 2200) * (1 + 0.03 * Math.sin(i * 7))), 0.0004, 0.009)], [env(filt(noise(0.003, 70 + i), 'hp', 3500), 0.0002, 0.001), 0, 0.3]), i * 0.065 + 0.004 * Math.sin(i * 3.1), 0.6 + 0.05 * i]))},
  // VIDEO-002 (#edit-1-motion): teclado, pulso de concepto y notificación
  'zp-keys': {uso: 'Ráfaga breve de teclado: se escribe un texto en un campo.', volumen: 0.16, make: () => mix(0.62,
    ...Array.from({length: 9}, (_, i) => [mix(0.05, [env(filt(noise(0.012, 80 + i), 'bp', 2600 + 300 * Math.sin(i * 1.7), 2.2), 0.0003, 0.004)], [env(osc(0.03, () => 260 + 30 * Math.sin(i)), 0.0006, 0.008), 0, 0.35]), i * 0.062 + 0.012 * Math.sin(i * 2.3), 0.75 + 0.2 * Math.sin(i * 1.3)]))},
  'zp-pulse': {uso: 'Se activa un concepto o una tarjeta (pulso suave).', volumen: 0.2, make: () => room(mix(0.3,
    [env(osc(0.3, expGlide(560, 520, 0.05), [[1, 1], [2, 0.3], [3, 0.08]]), 0.004, 0.09)], [env(osc(0.2, () => 130), 0.004, 0.06), 0, 0.45]), 0.12)},
  'zp-notify': {uso: 'Notificación de teléfono (dos notas cortas y suaves).', volumen: 0.14, make: () => room(mix(0.3,
    [env(osc(0.09, () => 1318.5, [[1, 1], [2, 0.12]]), 0.002, 0.035)], [env(osc(0.14, () => 1760, [[1, 1], [2, 0.1]]), 0.002, 0.05), 0.075, 0.85]), 0.12)},
};

// ---------- WAV 24 bit ----------
const wav24 = (x) => {
  const data = Buffer.alloc(x.length * 3);
  for (let i = 0; i < x.length; i++) data.writeIntLE(Math.max(-8388608, Math.min(8388607, Math.round(x[i] * 8388607))), i * 3, 3);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 3, 28); h.writeUInt16LE(3, 32); h.writeUInt16LE(24, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};

if (process.argv.includes('--list')) {
  for (const [id, s] of Object.entries(SOUNDS)) console.log(id.padEnd(13), s.uso);
  process.exit(0);
}
const sfxPath = path.join(root, 'library/sfx/sfx.json');
const registry = JSON.parse(fs.readFileSync(sfxPath, 'utf8'));
const dir = path.join(root, registry.carpeta_publica);
fs.mkdirSync(dir, {recursive: true});
const entries = [];
for (const [id, s] of Object.entries(SOUNDS)) {
  const x = normalize(fadeEdges(s.make()), -3);
  const file = `${registry.carpeta_publica}/${id}.wav`;
  fs.writeFileSync(path.join(root, file), wav24(x));
  entries.push({id, archivo: file, generador: 'library/sfx/synth-sfx.mjs', licencia: 'propia (síntesis en el repo, sin material de terceros)', duracion_s: +(x.length / SR).toFixed(3), volumen: s.volumen, uso: s.uso});
}
registry.sintetizados = entries;
fs.writeFileSync(sfxPath, JSON.stringify(registry, null, 2) + '\n');
console.log(`${entries.length} sonidos → ${registry.carpeta_publica}/zp-*.wav · registrados en library/sfx/sfx.json (sintetizados)`);
