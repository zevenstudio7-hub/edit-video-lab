// VIDEO-002: segunda opinión de transcripción (Gemini) para fragmentos dudosos de whisper.
// Uso: node src/videoAnalysis/video002/verifySnippets.mjs [ids…]  → imprime la transcripción literal de cada fragmento.
// La clave se lee de .env.local y no se imprime nunca.
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {GoogleGenAI} from '@google/genai';

const root = path.resolve(import.meta.dirname, '../../..');
delete process.env.GEMINI_API_KEY;
process.loadEnvFile(path.join(root, '.env.local'));
if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY no está definida en .env.local');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const tomas = path.join(root, 'formatos/edit-1-motion/RSS - Entretenimiento/tomas');
const fragmentos = [
  {id: 'A-plataformas', toma: 'FBF4A159-15B2-4B42-B057-E8FFA87CF0C5.MP4', desde: 13.8, hasta: 17.3},
  {id: 'A-lanzamiento', toma: 'FBF4A159-15B2-4B42-B057-E8FFA87CF0C5.MP4', desde: 33.3, hasta: 38.3},
  {id: 'A-final', toma: 'FBF4A159-15B2-4B42-B057-E8FFA87CF0C5.MP4', desde: 52.6, hasta: 60.08},
  {id: 'B-herramientas', toma: 'B0B164E0-FD5D-4DB0-ACFA-581CDE53C1E6.MP4', desde: 0.0, hasta: 8.8},
  {id: 'D-avance', archivo: 'public/video-002/dialogue.wav', desde: 4.0, hasta: 9.5, revisarUnion: true},
  {id: 'D-union-AB', archivo: 'public/video-002/dialogue.wav', desde: 46.5, hasta: 52.0, revisarUnion: true},
  {id: 'D-herramientas', archivo: 'public/video-002/dialogue.wav', desde: 53.0, hasta: 57.5, revisarUnion: true},
  {id: 'A-completa', toma: 'FBF4A159-15B2-4B42-B057-E8FFA87CF0C5.MP4', desde: 0, hasta: 60.08, conTiempos: true},
  {id: 'B-completa', toma: 'B0B164E0-FD5D-4DB0-ACFA-581CDE53C1E6.MP4', desde: 0, hasta: 48.02, conTiempos: true},
];
const promptUnion = 'Este audio en español es una voz editada. 1) Transcribe literalmente lo que se oye. 2) Indica si se nota algún corte de edición: palabra cortada o comida, salto brusco, clic, cambio de ambiente o de volumen, o una pausa artificial. Si se nota, di en qué palabras y qué se oye. Responde en dos líneas: «Texto: …» y «Cortes: …».';
const promptTiempos = 'Transcribe de forma literal el audio en español, frase por frase, con el tiempo aproximado de inicio de cada frase en formato [ss.s]. No corrijas ni limpies: incluye muletillas (eh, em, este), repeticiones, falsos arranques, palabras cortadas o mal pronunciadas e instrucciones o comentarios fuera del texto. Marca cada muletilla o repetición entre llaves, por ejemplo {eh}.';
const prompt = 'Transcribe de forma literal, palabra por palabra, el audio en español. No corrijas, no completes ni resumas: escribe exactamente lo que se oye, incluidas vacilaciones, palabras cortadas o en otro idioma (nombres de marcas o productos). Si una palabra no se entiende con claridad, escribe [inaudible] o tus dos mejores opciones entre corchetes.';
const solo = process.argv.slice(2);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
for (const f of fragmentos.filter((x) => !solo.length || solo.includes(x.id))) {
  const wav = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', '-ss', String(f.desde), '-to', String(f.hasta), '-i', f.archivo ? path.join(root, f.archivo) : path.join(tomas, f.toma), '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], {maxBuffer: 1 << 26});
  let r;
  for (let intento = 1; ; intento++) {
    try { r = await ai.models.generateContent({model: 'gemini-3.6-flash', contents: [{role: 'user', parts: [{inlineData: {mimeType: 'audio/wav', data: wav.toString('base64')}}, {text: f.conTiempos ? promptTiempos : f.revisarUnion ? promptUnion : prompt}]}]}); break; }
    catch (e) { if (e.status !== 503 || intento >= 8) throw e; await esperar(10000 * intento); }
  }
  console.log(`${f.id} (${f.desde}–${f.hasta} s): ${r.text.trim()}`);
}
