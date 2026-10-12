// VIDEO-004 · coloca S8 según el sujeto (formatos/subtitulos/SUBTITULOS.md, «Posición según el sujeto»).
// Para cada frase y cada plano que atraviesa: mide los dos espacios libres a los lados del sujeto a la altura
// de su cabeza (analysis/video-004-subject.json, de measureSubject.swift), los pasa al encuadre del plano
// (zoom + origen) y centra cada pieza dentro de su espacio, a ≥ 8 % del borde y ≥ 3 % del sujeto.
// Escribe subtitulos_s8.frases[i].colocacion en la orden. Uso: node src/videoAnalysis/video004/placeS8.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const orderPath = path.join(root, 'video-orders/VIDEO-004.json');
const order = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const muestras = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-004-subject.json'), 'utf8')).muestras.filter((m) => m.cara && m.persona);

const W = order.formato.ancho;
const H = order.formato.alto;
const FPS = order.formato.fps;
const EDGE = 0.08 * W; // margen al borde del cuadro
const GAP = 0.03 * W; // separación mínima del sujeto
const MAX_W = 560; // ancho máximo del bloque: más largo pasa a 2 líneas (apilado)
const HEAD_Y = 0.2; // centro del bloque: frente/ojos = arriba de la caja de la cara + 20 % de su alto
// Partido (una pieza en cada espacio, misma altura): frases cortas con dos partes claras. Índice = palabra donde empieza la 2.ª pieza.
const MIN_SPACE = 320; // un espacio más estrecho no se usa (p. ej. brazo o taza a la altura de la cabeza en el plano cercano)
const PARTIDO = { 'explorando, aprendiendo': 1, 'es normal.': 1, 'seguirle dando.': 1 };

const { encuadres, lista: planos } = order.planos;
const quant = (arr, p) => {
  const a = [...arr].sort((x, y) => x - y);
  return a[Math.round(p * (a.length - 1))];
};

// toma (normalizada) → pantalla del plano
const toScreen = (e, nx, ny) => {
  const ox = (e.origen[0] / 100) * W;
  const oy = (e.origen[1] / 100) * H;
  return [ox + (nx * W - ox) * e.zoom, oy + (ny * H - oy) * e.zoom];
};

const tl = (p) => [p.timeline_f[0] / FPS, p.timeline_f[1] / FPS];

for (const frase of order.subtitulos_s8.frases) {
  const a = frase.palabras[0].t;
  const b = frase.hasta_s;
  const colocacion = [];
  for (const p of planos) {
    const [p0, p1] = tl(p);
    const desde = Math.max(a, p0);
    const hasta = Math.min(b, p1);
    if (hasta <= desde) continue;
    const s0 = p.in_s + (desde - p0);
    const s1 = p.in_s + (hasta - p0);
    let win = muestras.filter((m) => m.t >= s0 - 0.1 && m.t <= s1 + 0.1);
    if (!win.length) win = [...muestras].sort((x, y) => Math.abs(x.t - s0) - Math.abs(y.t - s0)).slice(0, 3);
    const e = encuadres[p.plano];
    // extremos prudentes del sujeto en la ventana (la mano o la taza pueden subir a la altura de la cabeza)
    const [sl] = toScreen(e, quant(win.map((m) => m.persona.x0), 0.1), 0);
    const [sr] = toScreen(e, quant(win.map((m) => m.persona.x1), 0.9), 0);
    const fy = quant(win.map((m) => m.cara.y), 0.5);
    const fh = quant(win.map((m) => m.cara.h), 0.5);
    const [, cy] = toScreen(e, 0, fy + HEAD_Y * fh);
    const izq = [EDGE, sl - GAP];
    const der = [sr + GAP, W - EDGE];
    const ancho = (s) => s[1] - s[0];
    const mayor = ancho(izq) >= ancho(der) ? izq : der;
    const centro = (s) => (s[0] + s[1]) / 2;
    // partido solo si los dos espacios existen en este plano; si no, la frase entera va al espacio que queda
    const corte = ancho(izq) >= MIN_SPACE && ancho(der) >= MIN_SPACE ? PARTIDO[frase.texto] : undefined;
    const piezas =
      corte !== undefined
        ? [
            { desde: 0, cx: centro(izq), ancho: Math.min(MAX_W, ancho(izq)) },
            { desde: corte, cx: centro(der), ancho: Math.min(MAX_W, ancho(der)) },
          ]
        : [{ desde: 0, cx: centro(mayor), ancho: Math.min(MAX_W, ancho(mayor)) }];
    colocacion.push({
      desde_s: +desde.toFixed(3),
      hasta_s: +hasta.toFixed(3),
      plano: `${p.id} ${p.plano}`,
      variacion: corte !== undefined ? 'partido' : 'en el hueco / apilado (2 líneas si no cabe en una)',
      cy: Math.round(cy),
      espacios: { izq: izq.map(Math.round), der: der.map(Math.round) },
      piezas: piezas.map((x) => ({ ...x, cx: Math.round(x.cx), ancho: Math.round(x.ancho) })),
    });
  }
  frase.colocacion = colocacion;
}

order.subtitulos_s8.posicion = {
  regla: 'según el sujeto (SUBTITULOS.md): bloque centrado en el espacio libre a su lado, a la altura de su cabeza; ≥ 8 % del borde y ≥ 3 % del sujeto; se recalcula en cada plano',
  medicion: 'analysis/video-004-subject.json (src/videoAnalysis/video004/measureSubject.swift, Apple Vision cada 0,2 s)',
  espacio_principal: 'izquierdo: el más amplio en los tres encuadres y el más oscuro a la altura de la cabeza (luma 16–86/255 frente a 94–127 del derecho)',
  ancho_max_px: MAX_W,
  centro_y: 'arriba de la caja de la cara + 20 % de su alto (frente/ojos)',
  tamano: 44,
};
fs.writeFileSync(orderPath, JSON.stringify(order, null, 2) + '\n');

const all = order.subtitulos_s8.frases.flatMap((f) => f.colocacion.map((c) => ({ f: f.texto, ...c })));
console.log('colocaciones', all.length);
for (const pl of ['W', 'M', 'C']) {
  const c = all.filter((x) => x.plano.endsWith(pl));
  if (c.length) console.log(pl, 'cy', Math.min(...c.map((x) => x.cy)), '–', Math.max(...c.map((x) => x.cy)), '| izq', c[0].espacios.izq, '| der', c[0].espacios.der);
}
