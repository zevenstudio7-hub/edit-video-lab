// VIDEO-009: tiempos por palabra por «sílabas + energía» (sin DTW, que se descuadra al final de cada frase).
// Para cada corte de la orden: región con voz = energía sobre el umbral dentro de in..out; las pausas internas ≥ 0,10 s
// no reciben palabras; el tiempo con voz se reparte entre las palabras según su número de sílabas.
// Escribe src/compositions/video009/words.json (frames de la composición a 25 fps). Los textos son los oídos (con las
// correcciones registradas en la orden); no se inventa nada que no se oiga.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const tl = JSON.parse(fs.readFileSync(path.join(root, 'analysis/video-009-timeline.json'), 'utf8'));
const order = JSON.parse(fs.readFileSync(path.join(root, 'video-orders/VIDEO-009.json'), 'utf8'));
const FPS = tl.fps;
const TEXT = {
  T01: 'Estos videos los editó una IA. Ninguno se parece al otro.',
  T02: 'El primero: pantalla dividida con subtítulos de marca.',
  T03: 'Este es motion con pantalla completa. Yo solo aparezco en cámara en momentos claves.',
  T04: 'Cámara al frente, look de cine y subtítulos que se mueven según donde estoy.',
  T05: 'Y este explica con diagramas,',
  T06: 'pero este esconde los datos sensibles.',
  T07a: 'Nueve estilos de subtítulos.',
  T07b: 'Cinco looks de colores.',
  T08: 'Veinte movimientos.',
  T09: 'Tú eliges, o la skill lo hace por ti.',
  T10: 'Tú grabas, la skill analiza, corta, subtítulos y arma todo el video.',
  T11: 'Lo he llamado Video Lab.',
  T12: 'No te cuesta lo que te cobraría un editor común.',
  T14: 'Y sígueme para más contenido.',
  T13: 'Si quieres la skill para editar tus videos, solamente escribe la palabra VIDEO y te la envío.',
};
// audio mono 16 kHz de cada fuente, energía en ventanas de 20 ms
const SR = 16000, WIN = 320;
const envs = {};
for (const src of order.fuentes.tomas) {
  const wav = fs.readFileSync(path.join(root, src.wav));
  const pcm = new Int16Array(wav.buffer, wav.byteOffset + 44, (wav.length - 44) >> 1);
  const env = [];
  for (let i = 0; i + WIN <= pcm.length; i += WIN) {
    let s2 = 0;
    for (let k = 0; k < WIN; k++) s2 += pcm[i + k] * pcm[i + k];
    env.push(20 * Math.log10(Math.sqrt(s2 / WIN) + 1) - 90.3);
  }
  envs[src.id] = {env, thr: -27};
}
const syl = (w) => Math.max(1, (w.toLowerCase().match(/[aeiouáéíóúü]+/g) ?? ['a']).length);
const out = [];
for (const t of tl.timeline) {
  const {env, thr: THR} = envs[t.src];
  const a = Math.round(t.in_s / 0.02), b = Math.round(t.out_s / 0.02);
  // voz: tramos con energía > THR; se descartan huecos < 0,10 s (consonantes) y se cierran los extremos
  let first = a, last = b;
  while (first < b && env[first] < THR) first++;
  while (last > a && env[last] < THR) last--;
  // pausas internas ≥ 5 ventanas (0,10 s)
  const gaps = [];
  let st = null;
  for (let i = first; i <= last; i++) {
    if (env[i] < THR) { if (st === null) st = i; }
    else { if (st !== null && i - st >= 5) gaps.push([st, i]); st = null; }
  }
  const isGap = (i) => gaps.some(([g0, g1]) => i >= g0 && i < g1);
  const idx = [];
  for (let i = first; i <= last; i++) if (!isGap(i)) idx.push(i);
  const words = TEXT[t.id].split(/\s+/);
  const wts = words.map(syl);
  const tot = wts.reduce((x, y) => x + y, 0);
  let acc = 0;
  for (let w = 0; w < words.length; w++) {
    const i0 = idx[Math.min(idx.length - 1, Math.floor((acc / tot) * idx.length))];
    acc += wts[w];
    const i1 = idx[Math.min(idx.length - 1, Math.max(0, Math.ceil((acc / tot) * idx.length) - 1))];
    const f = (i) => t.from_f + ((i * 0.02 - t.in_s) * FPS);
    out.push({take: t.id, beat: t.beat, text: words[w], from: +f(i0).toFixed(1), to: +f(i1 + 1).toFixed(1)});
  }
  out.push({take: t.id, marker: 'take-end', at: t.to_f});
}
fs.writeFileSync(path.join(root, 'src/compositions/video009/words.json'), JSON.stringify(out, null, 1));
for (const t of tl.timeline) console.log(t.id, out.filter((w) => w.take === t.id && w.text).map((w) => `${w.text}@${w.from}`).join(' '));
