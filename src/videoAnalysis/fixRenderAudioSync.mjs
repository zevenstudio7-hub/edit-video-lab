#!/usr/bin/env node
// Paso tras el render de Remotion: deja el audio del MP4 en sincronía con la imagen.
//
// El render local codifica el audio con libfdk_aac en ADTS (@remotion/renderer → compress-audio.js, `-f adts`) y luego
// lo copia al MP4. ADTS no guarda el cebado del codificador (2048 muestras en fdk-aac LC): la lista de edición del audio
// queda con media_time 0, los reproductores suenan el cebado y el audio va 42,7 ms por detrás de la imagen.
//
//   node src/videoAnalysis/fixRenderAudioSync.mjs <render.mp4> [opciones]
//
// Por defecto, sin pérdida: copia el MP4 y solo reescribe la lista de edición del audio (salto = cebado, fin = el del
// vídeo) y las duraciones de tkhd/mvhd. Los paquetes de vídeo y de audio quedan idénticos (es lo que habría escrito
// ffmpeg si el AAC hubiera ido directo al MP4). Con --reencode decodifica el audio, quita el cebado y lo vuelve a
// codificar en AAC 320k con -cutoff 18000, copiando el vídeo.
//
// El cebado se mide, no se supone: una señal de prueba pasa por los mismos comandos de Remotion (su ffmpeg, libfdk_aac
// → ADTS → MP4) y el retraso medido tiene que coincidir con el media_time que ese codificador declara al escribir MP4.
// Antes de tocar nada se comprueba que el tramo que se va a saltar es relleno (silencio o pre-eco) y, con --ref, el
// desfase real contra las pistas de la composición. Después se verifica la copia: MD5 de los paquetes de vídeo (y de
// audio, sin pérdida), audio decodificado = original desplazado, sonoridad igual y desfase 0 contra las pistas.
// Escribe en <destino>.partial y solo lo renombra si todo pasa.
//
// Opciones:
//   --out <archivo>   destino (por defecto <render>.sync.mp4). Nunca escribe sobre el render.
//   --ref <audio>     pista de la composición, repetible (se suman), p. ej. public/video-001/v3/dialogue.wav
//   --reencode        recodifica el audio en vez de corregir la lista de edición
//   --priming <n>     cebado en muestras, si el ffmpeg de Remotion no está para medirlo
//   --report <json>   guarda el informe completo
//   --force           sobrescribe el destino si ya existe
//
// FFmpeg para decodificar y medir: VIDEO_FFMPEG o /usr/local/bin/ffmpeg (usa ebur128 y el muxer hash).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const run = promisify(execFile);
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const withValue = ['--out', '--ref', '--priming', '--report'];
const flag = (n) => argv.includes(n);
const values = (n) => argv.flatMap((a, i) => (a === n && argv[i + 1] !== undefined ? [argv[i + 1]] : []));
const input = argv.find((a, i) => !a.startsWith('--') && !withValue.includes(argv[i - 1]));
if (!input || flag('--help') || flag('-h')) {
  const lines = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1);
  console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith('//'))).map((l) => l.slice(3)).join('\n'));
  process.exit(input ? 0 : 1);
}
const fail = (m) => {
  console.error(`ERROR  ${m}`);
  process.exit(1);
};
const show = (p) => (path.relative(process.cwd(), p).startsWith('..') ? p : path.relative(process.cwd(), p));
const src = path.resolve(input);
if (!fs.existsSync(src)) fail(`no existe el render: ${src}`);
const out = path.resolve(values('--out')[0] ?? src.replace(/(\.[^./]+)?$/, '.sync.mp4'));
const partial = `${out}.partial`;
process.on('exit', (code) => { if (code !== 0) fs.rmSync(partial, {force: true}); }); // nunca queda una copia a medias
const sameFile = (a, b) => { const x = fs.statSync(a), y = fs.statSync(b); return x.dev === y.dev && x.ino === y.ino; };
if (out === src || (fs.existsSync(out) && sameFile(out, src))) fail('el destino no puede ser el propio render');
if (fs.existsSync(out) && !flag('--force')) fail(`ya existe ${out} (usa --force para sobrescribirlo)`);
const refs = values('--ref').map((r) => path.resolve(r));
for (const r of refs) if (!fs.existsSync(r)) fail(`no existe la pista: ${r}`);
const reencode = flag('--reencode');
await run(ffmpeg, ['-hide_banner', '-version']).catch(() => fail(`no encuentro FFmpeg en ${ffmpeg} (define VIDEO_FFMPEG)`));

// ---------- MP4: lectura de cajas ----------
const readBoxes = (fd, start, end) => {
  const list = [];
  const head = Buffer.alloc(16);
  for (let pos = start; pos + 8 <= end; ) {
    fs.readSync(fd, head, 0, 16, pos);
    let size = head.readUInt32BE(0), header = 8;
    if (size === 1) { size = Number(head.readBigUInt64BE(8)); header = 16; } else if (size === 0) size = end - pos;
    if (size < header || pos + size > end) break;
    list.push({type: head.toString('latin1', 4, 8), data: pos + header, end: pos + size});
    pos += size;
  }
  return list;
};
const find = (fd, parent, ...types) => types.reduce((b, t) => b && readBoxes(fd, b.data, b.end).find((c) => c.type === t), parent);
const bytes = (fd, b, offset = 0, length = b.end - b.data - offset) => {
  const buf = Buffer.alloc(length);
  fs.readSync(fd, buf, 0, length, b.data + offset);
  return buf;
};
// Lista de edición: posición del primer registro (para reescribirlo) y sus valores en la versión de la caja.
const parseElst = (b, data) => {
  const v = b[0], size = v ? 20 : 12;
  const entries = Array.from({length: b.readUInt32BE(4)}, (_, i) => {
    const o = 8 + i * size;
    return v ? {segment: Number(b.readBigUInt64BE(o)), mediaTime: Number(b.readBigInt64BE(o + 8)), rate: b.readInt16BE(o + 16)} : {segment: b.readUInt32BE(o), mediaTime: b.readInt32BE(o + 4), rate: b.readInt16BE(o + 8)};
  });
  return {version: v, entryPos: data + 8, entrySize: size, entries};
};
// esds → AudioSpecificConfig (tipo de objeto, tamaño de trama).
const parseEsds = (b) => {
  let o = 4, objectType = null;
  const len = () => { let n = 0; for (let i = 0; i < 4; i++) { const c = b[o++]; n = (n << 7) | (c & 0x7f); if (!(c & 0x80)) break; } return n; };
  while (o < b.length) {
    const tag = b[o++], n = len();
    if (tag === 3) { const f = b[o + 2]; o += 3 + (f & 0x80 ? 2 : 0) + (f & 0x40 ? 1 + b[o + 3] : 0) + (f & 0x20 ? 2 : 0); continue; }
    if (tag === 4) { objectType = b[o]; o += 13; continue; }
    if (tag === 5) return {objectType, audioObjectType: b[o] >> 3, frameLength: (b[o + 1] >> 2) & 1 ? 960 : 1024};
    o += n;
  }
  return {objectType};
};
const readMp4 = (file) => {
  const fd = fs.openSync(file, 'r');
  try {
    const moov = readBoxes(fd, 0, fs.fstatSync(fd).size).find((b) => b.type === 'moov');
    if (!moov) throw new Error(`${file}: sin caja moov`);
    const mvhd = find(fd, moov, 'mvhd');
    const mv = bytes(fd, mvhd, 0, 32);
    const movie = {version: mv[0], timescale: mv.readUInt32BE(mv[0] ? 20 : 12), duration: mv[0] ? Number(mv.readBigUInt64BE(24)) : mv.readUInt32BE(16), durationPos: mvhd.data + (mv[0] ? 24 : 16)};
    const tracks = readBoxes(fd, moov.data, moov.end).filter((b) => b.type === 'trak').map((trak) => {
      const tkhd = find(fd, trak, 'tkhd');
      const th = bytes(fd, tkhd, 0, 36);
      const mdhd = bytes(fd, find(fd, trak, 'mdia', 'mdhd'), 0, 32);
      const stbl = find(fd, trak, 'mdia', 'minf', 'stbl');
      const stts = bytes(fd, find(fd, stbl, 'stts'));
      const runs = Array.from({length: stts.readUInt32BE(4)}, (_, i) => ({count: stts.readUInt32BE(8 + i * 8), delta: stts.readUInt32BE(12 + i * 8)}));
      const elst = find(fd, trak, 'edts', 'elst');
      const stsd = find(fd, stbl, 'stsd');
      const entry = readBoxes(fd, stsd.data + 8, stsd.end)[0];
      const t = {
        handler: bytes(fd, find(fd, trak, 'mdia', 'hdlr'), 8, 4).toString('latin1'),
        codec: entry?.type,
        tkhd: {version: th[0], duration: th[0] ? Number(th.readBigUInt64BE(28)) : th.readUInt32BE(20), durationPos: tkhd.data + (th[0] ? 28 : 20)},
        timescale: mdhd.readUInt32BE(mdhd[0] ? 20 : 12),
        duration: mdhd[0] ? Number(mdhd.readBigUInt64BE(24)) : mdhd.readUInt32BE(16),
        frames: runs.reduce((a, r) => a + r.count, 0),
        frameDeltas: [...new Set(runs.map((r) => r.delta))],
        elst: elst ? parseElst(bytes(fd, elst), elst.data) : null,
      };
      if (entry?.type === 'mp4a') {
        const e = bytes(fd, entry, 0, 28);
        t.channels = e.readUInt16BE(16);
        t.sampleRate = e.readUInt32BE(24) >>> 16;
        const extra = [0, 16, 36][e.readUInt16BE(8)] ?? 0; // descripción de sonido QuickTime v1/v2
        const esds = readBoxes(fd, entry.data + 28 + extra, entry.end).find((b) => b.type === 'esds');
        if (esds) Object.assign(t, parseEsds(bytes(fd, esds)));
      }
      return t;
    });
    return {movie, tracks};
  } finally {
    fs.closeSync(fd);
  }
};
const writeField = (fd, pos, version, value) => {
  const b = Buffer.alloc(version ? 8 : 4);
  if (version) b.writeBigInt64BE(BigInt(value)); else b.writeInt32BE(value);
  fs.writeSync(fd, b, 0, b.length, pos);
};

// ---------- audio: decodificar, medir ----------
const decode = async (file, {mono = false, rate = null, extra = []} = {}) => {
  const {stdout} = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...extra, '-i', file, '-map', '0:a:0', ...(mono ? ['-ac', '1'] : []), ...(rate ? ['-ar', String(rate)] : []), '-f', 'f32le', '-'], {encoding: 'buffer', maxBuffer: 1 << 30});
  const pcm = stdout.byteOffset % 4 ? new Uint8Array(stdout) : stdout; // Float32Array exige alineación a 4 bytes
  return new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
};
const toMono = (x, ch) => {
  if (ch === 1) return x;
  const m = new Float32Array(x.length / ch);
  for (let i = 0; i < m.length; i++) { let s = 0; for (let c = 0; c < ch; c++) s += x[i * ch + c]; m[i] = s / ch; }
  return m;
};
const peakDb = (x, a, b) => {
  let p = 0;
  for (let i = Math.max(0, a); i < Math.min(b, x.length); i++) p = Math.max(p, Math.abs(x[i]));
  return +(20 * Math.log10(p || 1e-12)).toFixed(1);
};
const fft = (re, im, inverse) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
};
// Correlación cruzada de una ventana: desfase (en muestras) con el que x va por detrás de y.
const lagAt = (x, y, start, win, maxLag) => {
  const size = win * 2;
  const xr = new Float64Array(size), xi = new Float64Array(size), yr = new Float64Array(size), yi = new Float64Array(size);
  let ex = 0, ey = 0;
  for (let i = 0; i < win; i++) { xr[i] = x[start + i] ?? 0; yr[i] = y[start + i] ?? 0; ex += xr[i] ** 2; ey += yr[i] ** 2; }
  if (ex < 1e-6 || ey < 1e-6) return null;
  fft(xr, xi, false); fft(yr, yi, false);
  for (let i = 0; i < size; i++) { const r = xr[i] * yr[i] + xi[i] * yi[i]; xi[i] = xi[i] * yr[i] - xr[i] * yi[i]; xr[i] = r; }
  fft(xr, xi, true);
  let lag = 0, best = -Infinity;
  for (let l = -maxLag; l <= maxLag; l++) { const v = xr[(l + size) % size]; if (v > best) { best = v; lag = l; } }
  return {lag, corr: best / size / Math.sqrt(ex * ey)};
};
// Hasta 24 ventanas repartidas por el archivo: el desfase es el que más se repite (±1 muestra).
const measureLag = (x, y, {win = 1 << 17, maxLag = 24000} = {}) => {
  const n = Math.min(x.length, y.length), count = Math.max(1, Math.min(24, Math.floor(n / win)));
  const found = [];
  for (let w = 0; w < count; w++) {
    const r = lagAt(x, y, count === 1 ? 0 : Math.floor(((n - win) * w) / (count - 1)), win, maxLag);
    if (r) found.push(r);
  }
  if (!found.length) return {lag: null, agree: 0, windows: 0, conclusive: false};
  const near = (l) => found.filter((f) => Math.abs(f.lag - l) <= 1);
  const lag = found.map((f) => f.lag).sort((a, b) => near(b).length - near(a).length)[0];
  const agree = near(lag), corr = agree.map((f) => f.corr).sort((a, b) => a - b)[Math.floor(agree.length / 2)];
  return {lag, agree: agree.length, windows: found.length, conclusive: agree.length >= Math.min(3, found.length) && agree.length >= 0.6 * found.length, corr: +corr.toFixed(4)};
};
const loudness = async (file) => {
  const {stderr} = await run(ffmpeg, ['-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'], {maxBuffer: 1 << 26}).catch((e) => e);
  // el resumen va al final de la salida: se toma la última coincidencia
  const last = (re) => { const all = [...stderr.matchAll(re)]; return all.length ? +all[all.length - 1][1] : null; };
  return {I: last(/I:\s+(-?[\d.]+) LUFS/g), LRA: last(/LRA:\s+(-?[\d.]+) LU/g), TP: last(/Peak:\s+(-?[\d.]+) dBFS/g)};
};
const packetsMd5 = async (file, map, extra = []) => {
  const {stdout} = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...extra, '-i', file, '-map', map, '-c', 'copy', '-f', 'hash', '-hash', 'md5', '-'], {maxBuffer: 1 << 20});
  return stdout.trim().replace(/^MD5=/, '');
};
// Bytes que difieren entre dos archivos del mismo tamaño (se deja de contar pasados 1000).
const diffBytes = (a, b) => {
  const fa = fs.openSync(a, 'r'), fb = fs.openSync(b, 'r'), size = fs.fstatSync(fa).size;
  const ba = Buffer.alloc(1 << 23), bb = Buffer.alloc(1 << 23), offsets = [];
  try {
    if (fs.fstatSync(fb).size !== size) return null;
    for (let pos = 0; pos < size && offsets.length <= 1000; pos += ba.length) {
      const n = fs.readSync(fa, ba, 0, ba.length, pos);
      fs.readSync(fb, bb, 0, n, pos);
      if (ba.subarray(0, n).equals(bb.subarray(0, n))) continue;
      for (let i = 0; i < n; i++) if (ba[i] !== bb[i]) offsets.push(pos + i);
    }
  } finally {
    fs.closeSync(fa); fs.closeSync(fb);
  }
  return offsets;
};

// ---------- cebado medido con el ffmpeg de Remotion ----------
const remotionFfmpeg = () => {
  const names = {darwin: [`darwin-${process.arch}`], linux: [`linux-${process.arch}-gnu`, `linux-${process.arch}-musl`], win32: [`win32-${process.arch}-msvc`]}[process.platform] ?? [];
  for (const base of [path.join(process.cwd(), 'package.json'), fileURLToPath(import.meta.url)]) {
    try {
      const fromCli = createRequire(createRequire(base).resolve('@remotion/cli/package.json'));
      const fromRenderer = createRequire(fromCli.resolve('@remotion/renderer/package.json'));
      for (const n of names) {
        try {
          const dir = path.dirname(fromRenderer.resolve(`@remotion/compositor-${n}/package.json`));
          return {bin: path.join(dir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'), dir, version: JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version};
        } catch {}
      }
    } catch {}
  }
  return null;
};
const wav16 = (x, rate, ch) => {
  const data = Buffer.alloc(x.length * ch * 2);
  for (let i = 0; i < x.length; i++) for (let c = 0; c < ch; c++) data.writeInt16LE(Math.round(x[i] * 32767), (i * ch + c) * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};
// 1 s de prueba (ráfaga de ruido determinista a 0,1 s) por los comandos de compress-audio.js y del mux final.
const calibrate = async (rf, rate, ch) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-sync-'));
  const ff = (args) => run(rf.bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {cwd: rf.dir, env: process.platform === 'darwin' ? {...process.env, DYLD_LIBRARY_PATH: rf.dir} : process.env});
  try {
    const signal = new Float32Array(rate);
    let seed = 1;
    for (let i = rate / 10; i < (rate * 4) / 10; i++) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; signal[i] = (seed / 2 ** 32 - 0.5) * 0.8; }
    const [wav, adts, viaAdts, direct] = ['prueba.wav', 'prueba.aac', 'via-adts.mp4', 'directo.mp4'].map((f) => path.join(dir, f));
    fs.writeFileSync(wav, wav16(signal, rate, ch));
    await ff(['-i', wav, '-c:a', 'libfdk_aac', '-f', 'adts', '-b:a', '320k', '-cutoff', '18000', adts]);
    await ff(['-i', adts, '-c:a', 'copy', '-movflags', 'faststart', viaAdts]);
    await ff(['-i', wav, '-c:a', 'libfdk_aac', '-b:a', '320k', '-cutoff', '18000', direct]);
    const skipOf = (f) => readMp4(f).tracks.find((t) => t.handler === 'soun').elst?.entries[0]?.mediaTime ?? 0;
    const measured = lagAt(await decode(viaAdts, {mono: true}), signal, 0, 1 << 16, 8192);
    return {measured: measured?.lag ?? null, declared: skipOf(direct), adtsSkip: skipOf(viaAdts)};
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
};

// ---------- 1. leer el render ----------
const info = (() => { try { return readMp4(src); } catch (e) { return fail(`no se puede leer como MP4: ${e.message}`); } })();
const audios = info.tracks.filter((t) => t.handler === 'soun');
if (audios.length !== 1) fail(`se esperaba una pista de audio y hay ${audios.length}`);
const a = audios[0];
const video = info.tracks.find((t) => t.handler === 'vide');
if (a.codec !== 'mp4a' || a.objectType !== 0x40 || a.audioObjectType !== 2) fail(`el audio no es AAC-LC (${a.codec}, objeto ${a.objectType}/${a.audioObjectType}): este paso corrige el AAC del render de Remotion`);
if (a.timescale !== a.sampleRate) fail(`escala de tiempo del audio (${a.timescale}) distinta de su frecuencia (${a.sampleRate})`);
if (!a.elst || a.elst.entries.length !== 1 || a.elst.entries[0].rate !== 1) fail(`lista de edición del audio inesperada: ${JSON.stringify(a.elst?.entries ?? null)}`);
if (a.elst.entries[0].mediaTime !== 0) fail(`la lista de edición del audio ya salta ${a.elst.entries[0].mediaTime} muestras: no hay nada que corregir`);
if (a.frameLength !== 1024 || a.frameDeltas.some((d) => d !== 1024)) fail(`tramas de ${a.frameDeltas.join('/')} muestras: no tiene la forma de un AAC copiado desde ADTS`);
const ch = a.channels, rate = a.sampleRate;
console.log(`render: ${show(src)} · AAC-LC ${rate} Hz ${ch} canales · ${a.frames} tramas de 1024 · lista de edición del audio sin salto (media_time 0)`);

// ---------- 2. cebado ----------
let priming;
if (values('--priming')[0] !== undefined) {
  const n = Number(values('--priming')[0]);
  if (!Number.isInteger(n) || n <= 0) fail('--priming debe ser un entero positivo (muestras)');
  priming = {muestras: n, metodo: 'indicado con --priming'};
} else {
  const rf = remotionFfmpeg();
  if (!rf) fail('no encuentro el ffmpeg de Remotion (@remotion/compositor-*) para medir el cebado: instala las dependencias o usa --priming <muestras>');
  const cal = await calibrate(rf, rate, ch);
  if (cal.adtsSkip !== 0) fail(`con el ffmpeg de Remotion ${rf.version} el paso por ADTS ya escribe un salto de ${cal.adtsSkip}: este render no se hizo con ese Remotion`);
  if (cal.measured === null || cal.measured !== cal.declared) fail(`calibración incoherente: el paso por ADTS retrasa ${cal.measured} muestras y libfdk_aac declara ${cal.declared}`);
  if (cal.measured === 0) fail(`con el ffmpeg de Remotion ${rf.version} el paso por ADTS no retrasa el audio: no hay nada que corregir`);
  priming = {muestras: cal.measured, metodo: `ffmpeg de Remotion ${rf.version}: libfdk_aac → ADTS → MP4 retrasa ${cal.measured} muestras; libfdk_aac directo a MP4 escribe media_time ${cal.declared}`, ffmpeg: rf.bin};
}
const L = priming.muestras;
if (L >= a.duration) fail(`el cebado (${L}) no cabe en el audio (${a.duration} muestras)`);
console.log(`cebado: ${L} muestras (${((L / rate) * 1000).toFixed(2)} ms) — ${priming.metodo}`);

// ---------- 3. comprobar antes de tocar ----------
const inPcm = await decode(src);
const inMono = toMono(inPcm, ch);
const region = {pico_dBFS: peakDb(inPcm, 0, L * ch), siguientes100ms_dBFS: peakDb(inPcm, L * ch, (L + rate / 10) * ch)};
region.relleno = region.pico_dBFS <= Math.max(-60, region.siguientes100ms_dBFS - 18);
console.log(`tramo a saltar: pico ${region.pico_dBFS} dBFS (100 ms siguientes: ${region.siguientes100ms_dBFS} dBFS) → ${region.relleno ? 'relleno' : 'TIENE SEÑAL'}`);
let refMix = null, before = null;
if (refs.length) {
  const tracks = await Promise.all(refs.map((r) => decode(r, {mono: true, rate})));
  refMix = new Float32Array(Math.max(...tracks.map((t) => t.length)));
  for (const t of tracks) for (let i = 0; i < t.length; i++) refMix[i] += t[i];
  before = measureLag(inMono, refMix);
  console.log(`contra las pistas (${refs.map((r) => path.basename(r)).join(' + ')}): desfase ${before.lag} muestras (${before.agree}/${before.windows} ventanas, correlación ${before.corr})`);
  if (!before.conclusive) fail('las pistas no dan un desfase claro: ¿son las de este render?');
  if (before.lag !== L) fail(`las pistas dan ${before.lag} muestras de desfase y el cebado es ${L}: no se corrige a ciegas`);
}
if (!region.relleno && before?.lag !== L) fail(`las primeras ${L} muestras tienen señal: no parecen cebado del codificador (pasa --ref con las pistas de la composición para medirlo)`);

// ---------- 4. escribir la copia ----------
// Fin del audio = el del vídeo (Remotion mezcla el audio a la duración exacta de la composición); lo que sobra es relleno de trama.
const videoSamples = video ? Math.round((video.duration / video.timescale) * rate) : Infinity;
const presented = Math.min(a.duration - L, videoSamples);
const segment = Math.ceil((presented * info.movie.timescale) / a.timescale);
if (fs.existsSync(partial)) fs.rmSync(partial);
if (reencode) {
  const layout = ch === 1 ? 'mono' : 'stereo';
  await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-map', '0:v:0?', '-map', '0:a:0', '-map_metadata', '0', '-c:v', 'copy',
    '-af', `atrim=start_sample=${L}:end_sample=${L + presented},asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=${rate}:channel_layouts=${layout}`,
    '-c:a', 'aac', '-b:a', '320k', '-cutoff', '18000', '-movflags', '+faststart', '-f', 'mp4', partial], {maxBuffer: 1 << 26});
} else {
  fs.copyFileSync(src, partial);
  const fd = fs.openSync(partial, 'r+');
  try {
    writeField(fd, a.elst.entryPos, a.elst.version, segment);
    writeField(fd, a.elst.entryPos + (a.elst.version ? 8 : 4), a.elst.version, L);
    writeField(fd, a.tkhd.durationPos, a.tkhd.version, segment);
    writeField(fd, info.movie.durationPos, info.movie.version, Math.max(segment, ...info.tracks.filter((t) => t !== a).map((t) => t.tkhd.duration)));
  } finally {
    fs.closeSync(fd);
  }
}

// ---------- 5. verificar la copia ----------
const checks = [];
const check = (nombre, ok, detalle) => {
  checks.push({nombre, ok, detalle});
  console.log(`${ok ? '  ok' : '  FALLA'}  ${nombre}: ${detalle}`);
};
const outInfo = readMp4(partial);
const oa = outInfo.tracks.find((t) => t.handler === 'soun');
const skip = oa.elst?.entries[0]?.mediaTime ?? 0;
check('lista de edición del audio con el salto de cebado', oa.elst?.entries.length === 1 && (reencode ? skip > 0 : skip === L), `media_time ${skip} muestras, ${oa.elst?.entries[0]?.segment} en la escala de la película (${outInfo.movie.timescale})`);
const [vIn, vOut] = await Promise.all([packetsMd5(src, '0:v:0'), packetsMd5(partial, '0:v:0')]);
check('paquetes de vídeo idénticos (MD5)', vIn === vOut, vOut);
if (!reencode) {
  const [aIn, aOut] = await Promise.all([packetsMd5(src, '0:a:0', ['-ignore_editlist', '1']), packetsMd5(partial, '0:a:0', ['-ignore_editlist', '1'])]);
  check('paquetes de audio idénticos (MD5)', aIn === aOut, aOut);
  const patched = [[a.elst.entryPos, a.elst.entryPos + a.elst.entrySize], [a.tkhd.durationPos, a.tkhd.durationPos + (a.tkhd.version ? 8 : 4)], [info.movie.durationPos, info.movie.durationPos + (info.movie.version ? 8 : 4)]];
  const changed = diffBytes(src, partial);
  check('solo cambian la lista de edición y las duraciones', changed !== null && changed.length > 0 && changed.every((o) => patched.some(([s, e]) => o >= s && o < e)), `${changed?.length ?? 'tamaño distinto'} bytes`);
}
const outPcm = await decode(partial);
const outMono = toMono(outPcm, ch);
if (!reencode) {
  let maxDiff = 0;
  const n = Math.min(outPcm.length, inPcm.length - L * ch);
  for (let i = 0; i < n; i++) maxDiff = Math.max(maxDiff, Math.abs(outPcm[i] - inPcm[i + L * ch]));
  check('audio decodificado = original adelantado el cebado', n > 0 && maxDiff === 0, `diferencia máxima ${maxDiff} en ${n / ch} muestras; dura ${(outPcm.length / ch / rate).toFixed(3)} s`);
} else {
  const r = measureLag(outMono, inMono.subarray(L));
  check('audio recodificado alineado con el original sin cebado', r.conclusive && r.lag === 0, `desfase ${r.lag} (${r.agree}/${r.windows} ventanas, correlación ${r.corr}); dura ${(outPcm.length / ch / rate).toFixed(3)} s`);
}
const [lIn, lOut] = await Promise.all([loudness(src), loudness(partial)]);
check('sonoridad igual', [lIn.I, lOut.I, lIn.TP, lOut.TP].every(Number.isFinite) && Math.abs(lIn.I - lOut.I) <= 0.1 && Math.abs(lIn.TP - lOut.TP) <= (reencode ? 0.5 : 0.1),`${lIn.I} → ${lOut.I} LUFS, LRA ${lIn.LRA} → ${lOut.LRA} LU, pico real ${lIn.TP} → ${lOut.TP} dBFS`);
let after = null;
if (refMix) {
  after = measureLag(outMono, refMix);
  check('desfase 0 contra las pistas', after.conclusive && after.lag === 0, `${after.lag} muestras (${after.agree}/${after.windows} ventanas, correlación ${after.corr})`);
}

// ---------- 6. resultado ----------
const ok = checks.every((c) => c.ok);
if (ok) fs.renameSync(partial, out); else fs.rmSync(partial, {force: true});
const report = {
  createdAt: new Date().toISOString(),
  render: src, destino: ok ? out : null, modo: reencode ? 'audio recodificado, AAC 320k -cutoff 18000' : 'sin pérdida, solo la lista de edición',
  audio: {codec: 'AAC-LC', frecuencia: rate, canales: ch, tramas: a.frames, muestras: a.duration, listaDeEdicionAntes: a.elst.entries},
  cebado: priming, tramoCebado: region, desfaseAntes: before,
  salida: {muestrasPresentadas: presented, listaDeEdicion: oa.elst?.entries ?? null, escalaPelicula: outInfo.movie.timescale},
  verificacion: checks, sonoridad: {antes: lIn, despues: lOut}, desfaseDespues: after, ok,
};
if (values('--report')[0]) fs.writeFileSync(path.resolve(values('--report')[0]), JSON.stringify(report, null, 2) + '\n');
if (!ok) fail('la verificación falló: no se escribe la copia');
console.log(`→ ${show(out)} (${report.modo})`);
