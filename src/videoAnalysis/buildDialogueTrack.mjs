// Pista de diálogo continua de la candidata V3 (VIDEO-001): el audio de los planos se monta una sola vez, fuera
// de los <Video>, para que cada unión tenga una microrrampa controlada y la voz pase entera por la limpieza.
//  1. audio ORIGINAL de cada toma (raw-material, AAC 44,1 kHz) → 48 kHz mono float;
//  2. cada plano = muestras [trimBefore·1600, trimAfter·1600) (1 frame a 30 fps = 1600 muestras: sin deriva frente
//     al video de los proxies);
//  3. microrrampa de 6 ms (medio Hann) a cada lado de cada unión: evita el clic de la discontinuidad sin tocar
//     fonemas (las uniones caen en pausas o valles medidos); sin solapes ni crossfades que dupliquen palabras.
//     Un plano puede pedir una rampa más larga en un borde (audioFadeIn/audioFadeOut en la EDL);
//  4. si timeline.speed ≠ 1, tempo con Rubber Band (tono preservado) y ajuste a la longitud de la timeline;
//  5. library/audio/clean-voice.mjs (RNNoise, EQ, de-esser, compresor, loudnorm 2 pasadas → −14 LUFS, −1,5 dBTP).
// Salidas: public/video-001/v3/dialogue.wav (la usa la composición) y public/video-001/v3/dialogue-raw.wav (A/B,
// mismo montaje sin limpieza). Informe de uniones: analysis/video-001-v3-dialogue.json.
//
// Con audio.dialogueSource en la EDL (voz entregada por el usuario, ya corregida) no se monta ni se limpia nada: se
// corrige el desfase, se ajusta la longitud y se normaliza la sonoridad (ver el modo «audio entregado» más abajo).
//
// Uso: node src/videoAnalysis/buildDialogueTrack.mjs   (tras buildEditV3.mjs)
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
const SR = 48000;
const FADE = Math.round(0.006 * SR);
const order = JSON.parse(await fs.readFile(path.join(root, 'video-orders/VIDEO-001.json'), 'utf8'));
const tl = order.candidatoV3?.timeline ?? (() => { throw new Error('Falta candidatoV3.timeline: ejecuta buildEditV3.mjs'); })();
const perFrame = SR / tl.fps;
if (!Number.isInteger(perFrame)) throw new Error('fps incompatible con 48 kHz');
const workDir = path.join(root, '.whisper/v3');
const outDir = path.join(root, 'public/video-001/v3');
await fs.mkdir(workDir, {recursive: true});
await fs.mkdir(outDir, {recursive: true});

const decoded = new Map();
const pcm = async (take) => {
  if (!decoded.has(take)) {
    const {stdout} = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', path.join(root, 'raw-material/video-001', take), '-vn', '-ac', '1', '-af', `aresample=${SR}:resampler=soxr:precision=28`, '-f', 'f32le', '-'], {encoding: 'buffer', maxBuffer: 1 << 30});
    decoded.set(take, new Float32Array(stdout.buffer, stdout.byteOffset, stdout.byteLength / 4));
  }
  return decoded.get(take);
};
const db = (a) => 20 * Math.log10(Math.sqrt(a.reduce((s, x) => s + x * x, 0) / Math.max(1, a.length)) + 1e-9);

// el montaje se hace a 1x (frames de fuente); con timeline.speed ≠ 1 se acelera después, entero, conservando el tono
const speed = tl.speed ?? 1;
const total = tl.cuts.reduce((acc, c) => acc + (c.trimAfter - c.trimBefore) * perFrame, 0);
const finalSamples = tl.durationInFrames * perFrame;

// ---------- modo «audio entregado» (audio.dialogueSource) ----------
// El usuario puede entregar la voz ya corregida (p. ej. sin ruido) sobre esta misma timeline. Se respeta tal cual:
// sin RNNoise ni EQ; solo se corrige el desfase medido (desfaseMs < 0 = adelantar), se ajusta a la longitud exacta
// de la timeline con fundidos de borde y se lleva a −14 LUFS / −1,5 dBTP con loudnorm a dos pasadas.
const delivered = tl.audio?.dialogueSource;
if (delivered) {
  const input = path.join(root, delivered.archivo);
  const probe = await run(ffmpeg, ['-hide_banner', '-i', input, '-f', 'null', '-'], {maxBuffer: 1 << 24}).catch((e) => e);
  const dm = /time=(\d+):(\d+):([\d.]+)/g;
  let mm, lastT;
  while ((mm = dm.exec(probe.stderr))) lastT = mm;
  const inSeconds = lastT ? +lastT[1] * 3600 + +lastT[2] * 60 + +lastT[3] : NaN;
  const tlSeconds = finalSamples / SR;
  if (!(Math.abs(inSeconds - tlSeconds) < 0.25)) throw new Error(`El audio entregado dura ${inSeconds} s y la timeline ${tlSeconds} s: no corresponde a este montaje`);
  const shift = (delivered.desfaseMs ?? 0) / 1000;
  const align = shift < 0 ? `atrim=start=${(-shift).toFixed(4)},asetpts=PTS-STARTPTS` : shift > 0 ? `adelay=delays=${Math.round(shift * 1000)}:all=1` : 'anull';
  const shaped = path.join(workDir, 'dialogue-delivered.f32.wav');
  await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-af', `aresample=${SR}:resampler=soxr,pan=mono|c0=0.5*c0+0.5*c1,${align},apad=whole_len=${finalSamples},atrim=end_sample=${finalSamples},afade=t=in:d=0.006,afade=t=out:st=${((finalSamples - 0.03 * SR) / SR).toFixed(4)}:d=0.03`,
    '-ac', '1', '-c:a', 'pcm_f32le', shaped]);
  const measure = async (f, extra = '') => {
    const {stderr} = await run(ffmpeg, ['-hide_banner', '-nostats', '-i', f, '-af', `${extra}loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], {maxBuffer: 1 << 26}).catch((e) => e);
    const j = JSON.parse(stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
    return j;
  };
  const m1 = await measure(shaped);
  const cleanOut = path.join(outDir, 'dialogue.wav');
  const pass2 = await run(ffmpeg, ['-hide_banner', '-nostats', '-y', '-i', shaped,
    '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m1.input_i}:measured_TP=${m1.input_tp}:measured_LRA=${m1.input_lra}:measured_thresh=${m1.input_thresh}:offset=${m1.target_offset}:linear=true:print_format=json,aresample=${SR},atrim=end_sample=${finalSamples},apad=whole_len=${finalSamples}`,
    '-c:a', 'pcm_s24le', cleanOut], {maxBuffer: 1 << 26});
  const applied = JSON.parse(pass2.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
  const m2 = await measure(cleanOut);
  const report = {
    method: `Audio entregado por el usuario (${delivered.archivo}): desfase corregido ${delivered.desfaseMs ?? 0} ms, mono, longitud exacta de la timeline con fundidos de 6/30 ms, loudnorm 2 pasadas (−14 LUFS, −1,5 dBTP). Sin RNNoise ni EQ.`,
    nota: delivered.nota,
    createdAt: new Date().toISOString(),
    timelineSeconds: +tlSeconds.toFixed(3), entregadoSeconds: inSeconds,
    antes: {I: +m1.input_i, TP: +m1.input_tp, LRA: +m1.input_lra}, despues: {I: +m2.input_i, TP: +m2.input_tp, LRA: +m2.input_lra}, modoLoudnorm: applied.normalization_type,
    outputs: {clean: path.relative(root, cleanOut), raw: 'public/video-001/v3/dialogue-raw.wav (montaje generado, sin limpieza, para A/B)'},
  };
  await fs.writeFile(path.join(root, 'analysis/video-001-v3-dialogue.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`diálogo entregado: ${report.entregadoSeconds} s → ${report.outputs.clean} (${report.timelineSeconds} s) · desfase ${delivered.desfaseMs ?? 0} ms · ${report.antes.I} → ${report.despues.I} LUFS, TP ${report.despues.TP} dBTP`);
  process.exit(0);
}
const out = new Float32Array(total);
const joins = [];
let cursor = 0;
for (const c of tl.cuts) {
  const src = await pcm(c.take);
  const a = c.trimBefore * perFrame, b = c.trimAfter * perFrame;
  if (b > src.length) throw new Error(`${c.id}: el plano termina después del audio de la toma`);
  const seg = src.slice(a, b);
  const edge = {id: c.id, headDb: +db(seg.subarray(0, 480)).toFixed(1), tailDb: +db(seg.subarray(seg.length - 480)).toFixed(1)};
  // rampa por defecto de 6 ms; la orden puede alargarla en un borde concreto (audioFadeIn / audioFadeOut, en s)
  const ramp = (n, at) => {
    for (let i = 0; i < n; i++) {
      const g = Math.sin((Math.PI / 2) * (i / n)) ** 2;
      seg[at === 'in' ? i : seg.length - 1 - i] *= g;
    }
  };
  ramp(Math.max(FADE, Math.round((c.audioFadeIn ?? 0) * SR)), 'in');
  ramp(Math.max(FADE, Math.round((c.audioFadeOut ?? 0) * SR)), 'out');
  if (speed === 1 && cursor !== c.startFrame * perFrame) throw new Error(`${c.id}: desfase con la timeline`);
  out.set(seg, cursor);
  cursor += seg.length;
  joins.push(edge);
}
if (cursor !== total) throw new Error('La pista no mide lo mismo que la timeline');

// WAV float 32 bits (intermedio) → 24 bits para public
const wav32 = (samples) => {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};
const raw1x = path.join(workDir, 'dialogue-raw-1x.f32.wav');
await fs.writeFile(raw1x, wav32(out));
// velocidad: Rubber Band (librubberband vía FFmpeg) cambia el tempo sin cambiar el tono; después se ajusta a la
// longitud exacta de la timeline (finalSamples) para que la voz siga a los planos acelerados
// final: fundido de 30 ms (un corte seco de ruido de sala a silencio digital hacía que la cadena de limpieza
// generase un chasquido en la última muestra) y 0,3 s de silencio solo para la limpieza (los filtros terminan en silencio)
const endFade = `afade=t=out:st=${((finalSamples - 0.03 * SR) / SR).toFixed(4)}:d=0.03`;
const tempo = speed !== 1 ? `rubberband=tempo=${speed}:pitch=1:transients=mixed:detector=compound:phase=laminar:window=standard:smoothing=off:formant=preserved:pitchq=quality:channels=together,aresample=${SR},` : '';
const rawF32 = path.join(workDir, 'dialogue-raw.f32.wav');
await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw1x,
  '-af', `${tempo}atrim=end_sample=${finalSamples},apad=whole_len=${finalSamples},${endFade}`, '-c:a', 'pcm_f32le', rawF32]);
const rawOut = path.join(outDir, 'dialogue-raw.wav');
await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', rawF32, '-c:a', 'pcm_s24le', rawOut]);
const cleanIn = path.join(workDir, 'dialogue-raw.padded.f32.wav');
await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', rawF32, '-af', 'apad=pad_dur=0.3', '-c:a', 'pcm_f32le', cleanIn]);
const cleanTmp = path.join(workDir, 'dialogue.clean.wav');
const cleanOut = path.join(outDir, 'dialogue.wav');
const {stdout: log} = await run('node', [path.join(root, 'library/audio/clean-voice.mjs'), cleanIn, '--out', cleanTmp, '--lufs', '-14', '--tp', '-1.5', '--force'], {maxBuffer: 1 << 24, env: {...process.env, FFMPEG: ffmpeg}});
// longitud exacta = timeline (la cadena de limpieza puede dejar o quitar unas muestras)
await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', cleanTmp, '-af', `atrim=end_sample=${finalSamples},apad=whole_len=${finalSamples}`, '-c:a', 'pcm_s24le', cleanOut]);

// comprobación: duración del limpio = timeline
const {stderr} = await run(ffmpeg, ['-hide_banner', '-i', cleanOut, '-f', 'null', '-'], {maxBuffer: 1 << 24}).catch((e) => e);
const dur = /time=(\d+):(\d+):([\d.]+)/g;
let m, last;
while ((m = dur.exec(stderr))) last = m;
const seconds = last ? +last[1] * 3600 + +last[2] * 60 + +last[3] : null;
const report = {
  method: `Audio original de cada toma (raw-material) → 48 kHz soxr; planos por muestras exactas (1600/frame); microrrampas de 6 ms (medio Hann) en cada unión${speed !== 1 ? `; tempo ${speed}x con Rubber Band (tono y formantes preservados)` : ''}; library/audio/clean-voice.mjs −14 LUFS / −1,5 dBTP; longitud ajustada a la timeline.`,
  speed,
  createdAt: new Date().toISOString(),
  timelineSeconds: +(tl.durationInFrames / tl.fps).toFixed(3),
  cleanSeconds: seconds,
  outputs: {clean: path.relative(root, cleanOut), raw: path.relative(root, rawOut)},
  // energía de los 10 ms de cada borde antes de la rampa: alto = el corte atraviesa sonido (revisar de oído)
  joins,
  cleanVoiceLog: log.trim().split('\n').slice(-8),
};
await fs.writeFile(path.join(root, 'analysis/video-001-v3-dialogue.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`diálogo: ${report.timelineSeconds} s timeline · ${seconds} s limpio → ${report.outputs.clean} (+ ${report.outputs.raw})`);
// bordes que caen dentro de voz: energía por encima del umbral de isla de su toma (suelo + 6 dB, alignTranscript)
const thr = {};
for (const c of tl.cuts) thr[c.id] ??= JSON.parse(await fs.readFile(path.join(root, 'analysis/video-001-whisper', c.take + '.aligned.json'), 'utf8')).method.thresholdDb;
const loud = joins.filter((j) => j.headDb > thr[j.id] || j.tailDb > thr[j.id]);
console.log(`bordes dentro de voz (> umbral de isla): ${loud.map((j) => `${j.id}(${j.headDb}/${j.tailDb} vs ${thr[j.id]})`).join(' ') || 'ninguno'}`);
