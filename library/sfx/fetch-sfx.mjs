#!/usr/bin/env node
// Descarga los sonidos CC0 de library/sfx/sfx.json a public/sfx. Sin dependencias (usa fetch de Node ≥ 18).
//   node library/sfx/fetch-sfx.mjs            descarga los que falten
//   node library/sfx/fetch-sfx.mjs --force    vuelve a descargar todos
// Solo escribe en public/sfx. No toca nada más. Imprime el sha256 de cada archivo para el registro de procedencia.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const sfx = JSON.parse(readFileSync(join(root, "library/sfx/sfx.json"), "utf8"));
const force = process.argv.includes("--force");

let fallos = 0;
mkdirSync(join(root, sfx.carpeta_publica), { recursive: true });
for (const s of sfx.sonidos) {
  const dest = join(root, s.archivo);
  if (existsSync(dest) && !force) {
    console.log(`= ${s.id}  ya existe (${s.archivo})`);
    continue;
  }
  try {
    const res = await fetch(s.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000 || buf.subarray(0, 4).toString() !== "RIFF") throw new Error("no parece un WAV");
    writeFileSync(dest, buf);
    console.log(`+ ${s.id}  ${buf.length} bytes  sha256:${createHash("sha256").update(buf).digest("hex")}  ${s.licencia}  ${s.autor}`);
  } catch (e) {
    fallos++;
    console.error(`✗ ${s.id}  ${s.url}  → ${e.message}`);
  }
}
console.log(fallos ? `✗ ${fallos} descarga(s) fallaron` : "✓ sonidos listos en " + sfx.carpeta_publica);
process.exit(fallos ? 1 : 0);
