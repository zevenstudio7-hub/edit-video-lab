// Transcripción local con tiempos por palabra: whisper.cpp instalado y ejecutado con el paquete
// oficial @remotion/install-whisper-cpp (https://www.remotion.dev/docs/install-whisper-cpp).
// El audio no sale del equipo. Los originales no se modifican: el WAV de 16 kHz es un derivado en .whisper/.
//
// Uso:
//   node src/videoAnalysis/transcribeWhisper.mjs --setup            instala whisper.cpp y descarga el modelo
//   node src/videoAnalysis/transcribeWhisper.mjs [--take=X.MP4]     transcribe todas las tomas o una
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import whisper from '@remotion/install-whisper-cpp';

const {installWhisperCpp, downloadWhisperModel, transcribe} = whisper;
const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '../..');
const WHISPER_VERSION = '1.7.2'; // desde v1.7.3 el Makefile delega en cmake (no instalado); 1.7.2 ya trae DTW para large-v3-turbo
const MODEL = 'large-v3-turbo';
const whisperDir = path.join(root, '.whisper');
const whisperPath = path.join(whisperDir, 'whisper.cpp');
const modelFolder = path.join(whisperDir, 'models');
const audioDir = path.join(whisperDir, 'audio');
const rawDir = path.join(whisperDir, 'raw');
const outDir = path.join(root, 'analysis', 'video-001-whisper');
const materialDir = path.join(root, 'raw-material', 'video-001');
const ffmpeg = process.env.VIDEO_FFMPEG || '/usr/local/bin/ffmpeg';
// Vocabulario del guion para que el modelo escriba bien los nombres propios. No sustituye al audio.
const PROMPT = 'Apple, Samsung, iPhone, iPhone Duo, Galaxy, Galaxy Fold, plegable, posicionamiento de marca.';
// -ng: en este Mac Intel la GPU no es Metal family 7; whisper vuelve a CPU y su aviso «ggml_metal_free: deallocating»
// hace que transcribe() de @remotion detenga el proceso antes de tiempo. Sin GPU no se emite.
const extraArgs = (process.env.WHISPER_ARGS ?? '-ng').split(' ').filter(Boolean);

if (process.argv.includes('--setup')) {
  await fs.mkdir(modelFolder, {recursive: true});
  await installWhisperCpp({to: whisperPath, version: WHISPER_VERSION});
  await downloadWhisperModel({model: MODEL, folder: modelFolder});
  console.log('whisper.cpp', WHISPER_VERSION, 'y modelo', MODEL, 'listos en', whisperDir);
  process.exit(0);
}

const only = process.argv.find((a) => a.startsWith('--take='))?.slice(7);
const takes = (await fs.readdir(materialDir)).filter((f) => /\.mp4$/i.test(f)).sort().filter((f) => !only || f === only);
await fs.mkdir(audioDir, {recursive: true});
await fs.mkdir(rawDir, {recursive: true});
await fs.mkdir(outDir, {recursive: true});

// Une los tokens de whisper en palabras: un token que empieza con espacio abre palabra nueva.
const toWords = (transcription) => {
  const words = [];
  for (const item of transcription) {
    for (const token of item.tokens ?? []) {
      if (/^\[_.*\]$/.test(token.text.trim()) || token.text.trim() === '') continue; // [_BEG_], [_TT_123]…
      const ms = {startMs: token.offsets.from, endMs: token.offsets.to, dtwMs: token.t_dtw === -1 ? null : token.t_dtw * 10, p: token.p};
      if (token.text.startsWith(' ') || words.length === 0) {
        words.push({text: token.text.trim(), ...ms, tokens: 1, pMin: token.p});
      } else {
        const w = words[words.length - 1];
        w.text += token.text;
        w.endMs = Math.max(w.endMs, ms.endMs);
        w.tokens += 1;
        w.pMin = Math.min(w.pMin, token.p);
      }
    }
  }
  return words.map(({p, ...w}) => ({...w, pMin: Number(w.pMin.toFixed(3))}));
};

for (const take of takes) {
  const out = path.join(outDir, take + '.json');
  if (existsSync(out)) { console.log('Transcripción existente:', take); continue; }
  const source = path.join(materialDir, take);
  const wav = path.join(audioDir, take.replace(/\.mp4$/i, '.wav'));
  if (!existsSync(wav)) {
    await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', source, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);
  }
  const started = Date.now();
  console.log('Transcribiendo', take);
  const json = await transcribe({
    inputPath: wav, whisperPath, whisperCppVersion: WHISPER_VERSION, model: MODEL, modelFolder,
    tokenLevelTimestamps: true, language: 'es', printOutput: false,
    additionalArgs: ['--prompt', PROMPT, ...extraArgs],
  });
  await fs.writeFile(path.join(rawDir, take + '.json'), JSON.stringify(json));
  const words = toWords(json.transcription);
  const sha256 = createHash('sha256').update(await fs.readFile(source)).digest('hex');
  await fs.writeFile(out, JSON.stringify({
    sourceFile: take,
    sha256,
    provenance: {
      tool: 'whisper.cpp vía @remotion/install-whisper-cpp 4.0.438', whisperCppVersion: WHISPER_VERSION, model: MODEL,
      options: {language: 'es', tokenLevelTimestamps: true, dtw: 'large.v3.turbo', prompt: PROMPT, extraArgs},
      audio: '16 kHz mono PCM extraído del original con FFmpeg', createdAt: new Date().toISOString(),
      seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      note: 'Tiempos de token de whisper (offsets) + DTW. Son una transcripción de trabajo: verificar contra la energía del audio antes de fijar cortes.',
    },
    text: words.map((w) => w.text).join(' '),
    words,
  }, null, 2) + '\n');
  console.log(take, words.length, 'palabras en', ((Date.now() - started) / 1000).toFixed(0), 's');
}
