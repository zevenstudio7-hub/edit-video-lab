import {GoogleGenAI} from '@google/genai';
import {loadEnvFile} from 'node:process';
delete process.env.GEMINI_API_KEY;
loadEnvFile('.env.local');
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
try {
  for await (const m of await ai.models.list()) console.log(JSON.stringify({name:m.name,displayName:m.displayName,supportedActions:m.supportedActions}));
} catch(e) {console.error(JSON.stringify({error:e.name,status:e.status}));process.exitCode=1;}
