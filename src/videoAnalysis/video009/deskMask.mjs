// VIDEO-009: máscara estática del escritorio y el computador (la cámara está fija en trípode): polígonos medidos sobre un fotograma
// con rejilla del 10 %. Se une (máximo) al matte de la persona para que el recorte conserve persona + escritorio + computador.
// Uso: node src/videoAnalysis/video009/deskMask.mjs <salida.pgm> [ancho alto]
import fs from 'node:fs';

const W = Number(process.argv[3] ?? 1080), H = Number(process.argv[4] ?? 1920);
// coordenadas normalizadas (x, y) sobre el cuadro retrato completo
export const POLYS = {
  computador: [[0.742, 0.388], [1.0, 0.39], [1.0, 0.69], [0.628, 0.712], [0.597, 0.707], [0.403, 0.66], [0.458, 0.648], [0.643, 0.642]],
  escritorio: [[0, 0.668], [0.4, 0.655], [1.0, 0.655], [1.0, 1.0], [0, 1.0]],
};
const inside = (px, py, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const buf = Buffer.alloc(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const px = (x + 0.5) / W, py = (y + 0.5) / H;
  if (Object.values(POLYS).some((p) => inside(px, py, p))) buf[y * W + x] = 255;
}
fs.writeFileSync(process.argv[2], Buffer.concat([Buffer.from(`P5\n${W} ${H}\n255\n`), buf]));
