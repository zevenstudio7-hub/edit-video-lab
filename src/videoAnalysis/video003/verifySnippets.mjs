// VIDEO-003: segunda opinión de transcripción (Gemini) para la grabación completa y los fragmentos dudosos de whisper.
// Uso: node src/videoAnalysis/video003/verifySnippets.mjs [ids…]  → imprime la transcripción literal de cada fragmento.
// La clave se lee de .env.local y no se imprime nunca.
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {GoogleGenAI} from '@google/genai';

const root = path.resolve(import.meta.dirname, '../../..');
delete process.env.GEMINI_API_KEY;
process.loadEnvFile(path.join(root, '.env.local'));
if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY no está definida en .env.local');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const fuente = path.join(root, 'formatos/edit-1-motion/guerra de la IA EMPEZÓ.mp4');
const fragmentos = [
  {id: 'completa', desde: 0, hasta: 46, conTiempos: true},
  {id: 'lanzamientos', desde: 13.7, hasta: 25.5},
  {id: 'claro', desde: 25.2, hasta: 27.3},
  {id: 'competencia', desde: 36.4, hasta: 41.1},
];
const promptTiempos = 'Transcribe de forma literal el audio en español, frase por frase, con el tiempo aproximado de inicio de cada frase en formato [ss.s]. No corrijas ni limpies: incluye muletillas (eh, em, este), repeticiones, falsos arranques, palabras cortadas o mal pronunciadas. Marca cada muletilla, repetición o autocorrección entre llaves, por ejemplo {eh}.';
const prompt = 'Transcribe de forma literal, palabra por palabra, el audio en español. No corrijas, no completes ni resumas: escribe exactamente lo que se oye, incluidas vacilaciones, palabras cortadas o en otro idioma (nombres de marcas, modelos y versiones, tal como se pronuncian). Si una palabra no se entiende con claridad, escribe tus dos mejores opciones entre corchetes.';
const solo = process.argv.slice(2);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
for (const f of fragmentos.filter((x) => !solo.length || solo.includes(x.id))) {
  const wav = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-ss', String(f.desde), '-to', String(f.hasta), '-i', fuente, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], {maxBuffer: 1 << 26});
  let r;
  for (let intento = 1; ; intento++) {
    try { r = await ai.models.generateContent({model: 'gemini-3.6-flash', contents: [{role: 'user', parts: [{inlineData: {mimeType: 'audio/wav', data: wav.toString('base64')}}, {text: f.conTiempos ? promptTiempos : prompt}]}]}); break; }
    catch (e) { if (e.status !== 503 || intento >= 8) throw e; await esperar(10000 * intento); }
  }
  console.log(`${f.id} (${f.desde}–${f.hasta} s): ${r.text.trim()}\n`);
}
