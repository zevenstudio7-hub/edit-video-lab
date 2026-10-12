// Apoyos de la zona superior de VIDEO-001, reproducibles desde fuentes declaradas:
//  1. recortes limpios de la grabación de pantalla del usuario (pizarra de Canva), sin barras ni cursor;
//  2. imágenes libres de Wikimedia Commons (CC BY-SA 4.0, con atribución);
//  3. capturas de páginas públicas de prensa como cita del hecho que se comenta.
// Salida: public/video-001/support/ (ignorado por git) + analysis/video-001-support-assets.json (procedencia).
//
// Uso: node src/videoAnalysis/prepareSupportAssets.mjs [--refresh-web]
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {execFile, spawn} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(root, 'public/video-001/support');
const cache = path.join(root, '.whisper/web-cache'); // capturas completas sin recortar (ignorado por git)
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const chrome = path.join(root, 'node_modules/.remotion/chrome-headless-shell/mac-x64/chrome-headless-shell-mac-x64/chrome-headless-shell');
const screen = path.join(root, 'raw-material/video-001/grabacion-pantalla.mov');
const UA = 'gemini-video-lab/0.1 (zevenpro.estrategia@gmail.com)';
const refreshWeb = process.argv.includes('--refresh-web');

// Coordenadas en píxeles del original 2048×1266. Tiempos elegidos por fotograma limpio (sin selección ni cursor encima).
const board = [
  {id: 'board-battery', t: 3, crop: [579, 662, 216, 338], content: 'Página de Apple «Servicio y reparación de la batería del iPhone»: iPhone 17 Pro Max, reparación de la batería 135 €, con flechas rojas del usuario.'},
  {id: 'board-duo', t: 27, crop: [790, 535, 590, 505], content: 'iPhone Duo abierto (color blanco estelar); coincide con la imagen oficial de Apple Newsroom del 9-9-2026.'},
  {id: 'board-2026', t: 380, crop: [355, 182, 260, 90], content: 'Etiqueta amarilla «2026» de la pizarra.'},
  {id: 'board-post', t: 29.5, crop: [1053, 476, 377, 160], content: 'Post de @samsungmobilemx: «El mundo es de los que se atreven primero. Nosotros nos atrevimos hace 7 años», citando su post del 7-10-2019 sobre el Galaxy Fold.'},
  {id: 'board-fold', t: 380, crop: [960, 630, 1062, 540], content: 'Foto de un Samsung Galaxy Z Fold abierto en las manos (material de la pizarra, autor no identificado en la captura).'},
];

const commons = [
  {id: 'commons-s5-battery', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/SAMSUNG_Galaxy_S5_mini_open.jpg/1920px-SAMSUNG_Galaxy_S5_mini_open.jpg', page: 'https://commons.wikimedia.org/wiki/File:SAMSUNG_Galaxy_S5_mini_open.jpg', author: 'Andreas Franzkowiak', license: 'CC BY-SA 4.0', content: 'Galaxy S5 mini abierto: batería extraíble y tapa.'},
  {id: 'commons-galaxy-fold-2019', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Galaxy_Fold_-_1.jpg/1920px-Galaxy_Fold_-_1.jpg', page: 'https://commons.wikimedia.org/wiki/File:Galaxy_Fold_-_1.jpg', author: 'KKPCW', license: 'CC BY-SA 4.0', content: 'Galaxy Fold original (2019) en la mano.'},
  {id: 'commons-iphone-ports', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/IPhones_6%2C_7%2C_8%2C_SE2_black_-_bottom_view.jpg/1920px-IPhones_6%2C_7%2C_8%2C_SE2_black_-_bottom_view.jpg', page: 'https://commons.wikimedia.org/wiki/File:IPhones_6,_7,_8,_SE2_black_-_bottom_view.jpg', author: 'Thsdb', license: 'CC BY-SA 4.0', content: 'Base de iPhone 6 (con conector de audífonos) sobre iPhone 7, 8 y SE (sin él).'},
  {id: 'commons-headphone-adapter', url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Apple_iPhone_Lightning_to_3.5_mm_Headphone_Jack_Adapter.jpg/1920px-Apple_iPhone_Lightning_to_3.5_mm_Headphone_Jack_Adapter.jpg', page: 'https://commons.wikimedia.org/wiki/File:Apple_iPhone_Lightning_to_3.5_mm_Headphone_Jack_Adapter.jpg', author: 'Amin', license: 'CC BY-SA 4.0', content: 'Adaptador Lightning a 3,5 mm de Apple.'},
];

// Capturas a 2× (2200 px de ancho). crop = [w, h, x, y] sobre la captura completa.
const captures = [
  {id: 'web-wallhuggers-2014', url: 'https://www.iphoneincanada.ca/news/galaxy-s5-ad-iphone-wall-huggers/', height: 1300, crop: [1400, 940, 30, 930], content: 'Titular «New Samsung Galaxy S5 Ad Slams iPhone Users as ‘Wall Huggers’» con fotograma del anuncio (2014).'},
  {id: 'web-wallhuggers-airport-title', url: 'https://www.macrumors.com/2014/08/13/samsung-anti-apple-airport-ad/', height: 2100, crop: [1411, 210, 39, 572], content: 'Titular de MacRumors, 13-8-2014: Samsung lleva «Wall Huggers» a los aeropuertos.'},
  {id: 'web-wallhuggers-airport-photo', url: 'https://www.macrumors.com/2014/08/13/samsung-anti-apple-airport-ad/', height: 2100, crop: [1054, 831, 216, 1833], content: 'Foto del anuncio del Galaxy S5 junto a enchufes en un aeropuerto (vía MacRumors/CNET).'},
  {id: 'web-charger-2020', url: 'https://9to5mac.com/2020/12/07/samsung-ditch-power-adapters-after-mocking-apple/', height: 1300, crop: [1555, 375, 91, 860], content: 'Titular de 9to5Mac, 7-12-2020: Samsung quitará el cargador tres meses después de burlarse de Apple.'},
  {id: 'web-duo-2026-title', url: 'https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/', height: 1300, crop: [1320, 430, 440, 470], content: 'Nota de prensa de Apple, 9-9-2026: «Apple unveils iPhone Duo».'},
  {id: 'web-duo-2026-hero', url: 'https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/', height: 1300, crop: [858, 1106, 728, 1254], content: 'Imagen principal de la nota de Apple: iPhone Duo plegado en la mano.'},
];

const shot = (url, file, height) => new Promise((resolve, reject) => {
  const p = spawn(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--force-device-scale-factor=2', `--window-size=1100,${height}`, '--timeout=20000', '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', `--screenshot=${file}`, url], {stdio: 'ignore'});
  const timer = setTimeout(() => p.kill(), 60_000);
  p.on('exit', () => { clearTimeout(timer); existsSync(file) ? resolve() : reject(new Error('Sin captura: ' + url)); });
});
// -ss antes de -i: FFmpeg decodifica desde el keyframe previo y descarta hasta t (búsqueda exacta y rápida).
const cropTo = (input, output, [w, h, x, y], seek) => run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...(seek === undefined ? [] : ['-ss', String(seek)]), '-i', input, '-frames:v', '1', '-vf', `crop=${w}:${h}:${x}:${y}`, output]);

await fs.mkdir(out, {recursive: true});
await fs.mkdir(cache, {recursive: true});
const manifest = {videoId: 'VIDEO-001', createdAt: new Date().toISOString(), folder: 'public/video-001/support', items: []};

for (const b of board) {
  const file = path.join(out, b.id + '.png');
  await cropTo(screen, file, b.crop, b.t);
  manifest.items.push({id: b.id, file: 'video-001/support/' + b.id + '.png', origin: 'grabacion-pantalla.mov (material del usuario)', time: b.t, crop: b.crop, content: b.content});
}
for (const c of commons) {
  const file = path.join(out, c.id + '.jpg');
  if (!existsSync(file) || refreshWeb) {
    const res = await fetch(c.url, {headers: {'User-Agent': UA}});
    if (!res.ok) throw new Error(`${c.id}: HTTP ${res.status}`);
    await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  manifest.items.push({id: c.id, file: 'video-001/support/' + c.id + '.jpg', origin: 'Wikimedia Commons', url: c.page, author: c.author, license: c.license, attribution: `${c.author} / ${c.license} / Wikimedia Commons`, content: c.content});
}
for (const c of captures) {
  const full = path.join(cache, new URL(c.url).hostname + '-' + c.height + '.png');
  if (!existsSync(full) || refreshWeb) await shot(c.url, full, c.height);
  const file = path.join(out, c.id + '.png');
  await cropTo(full, file, c.crop);
  manifest.items.push({id: c.id, file: 'video-001/support/' + c.id + '.png', origin: 'captura de página pública', url: c.url, use: 'cita breve del hecho comentado; no sustituye a la fuente', capturedAt: manifest.createdAt, crop: c.crop, content: c.content});
}
await fs.writeFile(path.join(root, 'analysis/video-001-support-assets.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(manifest.items.length, 'apoyos en', path.relative(root, out));
