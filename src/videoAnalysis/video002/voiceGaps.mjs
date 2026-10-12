// VIDEO-002: huecos sin voz medidos en la banda de la voz (300–2500 Hz), para no confundir ruido grave con habla.
// Uso: node voiceGaps.mjs <wav> [mínimo ms, por defecto 250] [desde s] [hasta s]
import {execFileSync} from 'node:child_process';
const [, , file, minArg, desde, hasta] = process.argv;
const b = execFileSync('/usr/local/bin/ffmpeg', ['-v', 'error', ...(desde ? ['-ss', desde] : []), ...(hasta ? ['-to', hasta] : []), '-i', file, '-af', 'highpass=f=300,lowpass=f=2500', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], {maxBuffer: 1 << 28});
const p = new Int16Array(b.buffer, b.byteOffset, b.length / 2); const t0 = +(desde ?? 0);
const db = []; for (let i = 0; i + 160 <= p.length; i += 160) { let a = 0; for (let j = i; j < i + 160; j++) a += p[j] * p[j]; db.push(20 * Math.log10(Math.sqrt(a / 160) / 32768 + 1e-9)); }
const pk = [...db].sort((x, y) => x - y)[Math.floor(db.length * 0.97)], thr = pk - 28, min = +(minArg ?? 250) / 1000;
const gaps = []; let a = null;
db.forEach((v, i) => { if (v <= thr && a === null) a = i; if ((v > thr || i === db.length - 1) && a !== null) { if ((i - a) * 0.01 >= min) gaps.push([t0 + a * 0.01, t0 + i * 0.01]); a = null; } });
console.log(`pico ${pk.toFixed(1)} dB · umbral ${thr.toFixed(1)} dB · huecos ≥ ${min * 1000} ms:`);
for (const [x, y] of gaps) console.log(`  ${x.toFixed(2)}–${y.toFixed(2)} (${Math.round((y - x) * 1000)} ms)`);
