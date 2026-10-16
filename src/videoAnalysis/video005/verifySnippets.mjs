// VIDEO-005: segunda opinión de transcripción (Gemini) para la grabación completa y los fragmentos dudosos de whisper.
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
const fuente = path.join(root, 'formatos/edit-1-motion/VIDEO-005-google-ia-contadores/tomas/google workspace.mp4');
const fragmentos = [
  {id: 'completa', desde: 0, hasta: 72.6, conTiempos: true},
  {id: 'ia-busca', desde: 32.3, hasta: 38.6},
  {id: 'cli', desde: 38.3, hasta: 47.2},
  {id: 'clasp', desde: 46.9, hasta: 57.1},
  {id: 'n8n', desde: 57.0, hasta: 64.5},
  {id: 'cierre', desde: 64.3, hasta: 72.6},
];
const promptTiempos = 'Transcribe de forma literal el audio en español, frase por frase, con el tiempo aproximado de inicio de cada frase en formato [ss.s]. No corrijas ni limpies: incluye muletillas (eh, em, este), repeticiones, falsos arranques, palabras cortadas o mal pronunciadas. Marca cada muletilla, repetición o autocorrección entre llaves, por ejemplo {eh}.';
const prompt = 'Transcribe de forma literal, palabra por palabra, el audio en español. No corrijas, no completes ni resumas: escribe exactamente lo que se oye, incluidas vacilaciones, palabras cortadas o en otro idioma (nombres de marcas, herramientas y repositorios tal como se pronuncian: por ejemplo Gmail, Drive, Sheets, Google Workspace CLI, clasp, Apps Script, n8n-MCP). Si una palabra no se entiende con claridad, escribe tus dos mejores opciones entre corchetes.';
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
