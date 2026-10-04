#!/usr/bin/env node
// Limpieza de voz con FFmpeg. Sin dependencias de npm, sin servicios externos, sin claves.
//
//   node library/audio/clean-voice.mjs <entrada> [opciones]
//
// Cadena: pasa-altos 80 Hz → reducción de ruido (RNNoise vía `arnndn`, o `afftdn`) → EQ suave de voz
//         → de-esser → compresor → loudness (EBU R128, dos pasadas) → WAV 48 kHz / 24 bit.
//
// No modifica la entrada (material bruto). Escribe <entrada>.clean.wav y <entrada>.clean.report.json
// con las mediciones antes/después. Las mediciones son técnicas: NO sustituyen escuchar el resultado.
//
// Opciones:
//   --out <archivo>        destino (por defecto, junto a la entrada: <nombre>.clean.wav)
//   --lufs <n>             loudness integrado objetivo (por defecto -14)
//   --tp <n>               techo de true peak en dBTP (por defecto -1.5)
//   --denoise rnn|fft|none (por defecto rnn)
//   --mix <0..1>           cuánto del audio limpio se mezcla con el original en `rnn` (por defecto 0.85)
//   --no-eq                sin EQ de voz
//   --no-deess             sin de-esser
//   --from <s> --to <s>    procesa solo un tramo (para comparar A/B rápido)
//   --mux                  además escribe junto al destino un video (misma extensión que la entrada) con la imagen copiada y el audio limpio
//   --force                sobrescribe el destino si ya existe
//   --dry-run              imprime los comandos y no ejecuta nada
//
// FFmpeg: usa la variable FFMPEG si existe; si no, `ffmpeg` del PATH. No se instala nada.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MODEL_DIR = join(HERE, "models");
const MODEL_FILE = "sh.rnnn"; // somnolent-hogwash: voz hablada con ruido de grabación (ventilador, AC, equipo)

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d;
};
const input = argv.find((a, i) => !a.startsWith("--") && !["--out", "--lufs", "--tp", "--denoise", "--mix", "--from", "--to"].includes(argv[i - 1]));
if (!input || flag("--help") || flag("-h")) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
  process.exit(input ? 0 : 1);
}

const opt = {
  lufs: Number(val("--lufs", -14)),
  tp: Number(val("--tp", -1.5)),
  denoise: val("--denoise", "rnn"),
  mix: Number(val("--mix", 0.85)),
  eq: !flag("--no-eq"),
  deess: !flag("--no-deess"),
  from: val("--from", null),
  to: val("--to", null),
  mux: flag("--mux"),
  force: flag("--force"),
  dry: flag("--dry-run"),
};
if (!["rnn", "fft", "none"].includes(opt.denoise)) fail("--denoise debe ser rnn, fft o none");
if (!(opt.mix >= 0 && opt.mix <= 1)) fail("--mix debe estar entre 0 y 1");

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const src = resolve(input);
if (!existsSync(src)) fail(`no existe la entrada: ${src}`);
const base = src.slice(0, src.length - extname(src).length);
const out = resolve(val("--out", `${base}.clean.wav`));
if (out === src) fail("el destino no puede ser la entrada: el material bruto no se sobrescribe");
if (existsSync(out) && !opt.force && !opt.dry) fail(`ya existe ${out} (usa --force para sobrescribir)`);

function fail(m) {
  console.error(`ERROR  ${m}`);
  process.exit(1);
}

// ---------- ffmpeg ----------
function ff(args, { cwd } = {}) {
  if (opt.dry) {
    console.log(`$ ${FFMPEG} ${args.map((a) => (/[\s;|]/.test(a) ? JSON.stringify(a) : a)).join(" ")}${cwd ? `   (cwd: ${cwd})` : ""}`);
    return { status: 0, stderr: "", stdout: "" };
  }
  const r = spawnSync(FFMPEG, ["-hide_banner", "-nostats", ...args], { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.error) fail(`no se pudo ejecutar '${FFMPEG}': ${r.error.message}. Instala FFmpeg o define la variable FFMPEG.`);
  return r;
}

const version = opt.dry ? "dry-run" : (ff(["-version"]).stdout.split("\n")[0] ?? "").trim();
const filtersTxt = opt.dry ? "" : spawnSync(FFMPEG, ["-hide_banner", "-filters"], { encoding: "utf8" }).stdout ?? "";
const has = (f) => opt.dry || new RegExp(`\\s${f}\\s`).test(filtersTxt);
for (const f of ["loudnorm", "highpass", "acompressor", "equalizer", "aresample"]) {
  if (!has(f)) fail(`este FFmpeg no incluye el filtro '${f}'`);
}

const avisos = [];
const denoise = opt.denoise;
// Sin RNNoise no se cae en silencio a 'afftdn': en la prueba con una toma de VIDEO-001 casi no bajó el ruido
// (relación voz/ruido 24,5 dB frente a 24,1 dB sin reductor). Mejor fallar que dar por limpio un audio sucio.
if (denoise === "rnn" && !has("arnndn")) {
  fail("este FFmpeg no incluye 'arnndn' (RNNoise). Usa un FFmpeg completo (p. ej. `brew install ffmpeg`) o define FFMPEG=/ruta/ffmpeg. Con --denoise fft aceptas un resultado mucho más débil.");
}
if (denoise === "rnn" && !existsSync(join(MODEL_DIR, MODEL_FILE))) {
  fail(`falta el modelo library/audio/models/${MODEL_FILE}`);
}
if (denoise === "fft") avisos.push("'afftdn' casi no reduce ruido de fondo constante (medido en VIDEO-001); úsalo solo si no hay RNNoise.");
let deess = opt.deess;
if (deess && !has("deesser")) {
  avisos.push("Este FFmpeg no tiene 'deesser': se omite.");
  deess = false;
}

// ---------- cadena ----------
const trim = [];
if (opt.from !== null) trim.push("-ss", String(opt.from));
if (opt.to !== null) trim.push("-to", String(opt.to));

const chain = ["aresample=48000", "highpass=f=80"];
if (denoise === "rnn") chain.push(`arnndn=m=${MODEL_FILE}:mix=${opt.mix}`);
if (denoise === "fft") chain.push("afftdn=nr=12:nf=-35:tn=1");
if (opt.eq) {
  chain.push("equalizer=f=300:t=q:w=1.2:g=-2"); // resta "caja" (250–400 Hz)
  chain.push("equalizer=f=3500:t=q:w=1.0:g=2"); //  suma presencia (2–5 kHz)
}
if (deess) chain.push("deesser=i=0.4:m=0.5:f=0.5");
chain.push("acompressor=threshold=-21dB:ratio=3:attack=10:release=180:makeup=2");
const chainStr = chain.join(",");

// Los modelos se resuelven con ruta relativa desde su carpeta: evita escapar rutas con espacios o ":".
const cwd = denoise === "rnn" ? MODEL_DIR : undefined;

const tmp = mkdtempSync(join(tmpdir(), "clean-voice-"));
const mid = join(tmp, "mid.wav");

function parseLoudnorm(stderr) {
  const m = stderr.match(/\{[\s\S]*?\}\s*$/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    return {
      I: Number(j.input_i),
      TP: Number(j.input_tp),
      LRA: Number(j.input_lra),
      thresh: Number(j.input_thresh),
      offset: Number(j.target_offset),
    };
  } catch {
    return null;
  }
}
const measure = (file) => {
  const r = ff(["-i", file, "-vn", "-af", `loudnorm=I=${opt.lufs}:TP=${opt.tp}:LRA=9:print_format=json`, "-f", "null", "-"]);
  return opt.dry ? null : parseLoudnorm(r.stderr);
};

try {
  // 0) medición de la entrada
  const antes = measure(opt.from !== null || opt.to !== null ? srcTrimmed() : src);

  function srcTrimmed() {
    const t = join(tmp, "trim.wav");
    ff([...trim, "-i", src, "-vn", "-c:a", "pcm_f32le", t]);
    return t;
  }

  // 1) cadena de limpieza → intermedio en coma flotante
  let r = ff([...trim, "-i", src, "-vn", "-af", chainStr, "-c:a", "pcm_f32le", mid], { cwd });
  if (r.status !== 0) fail(`falló la cadena de limpieza:\n${r.stderr.split("\n").slice(-8).join("\n")}`);

  // 2) loudness en dos pasadas sobre el intermedio
  const m1 = measure(mid);
  const ln = opt.dry
    ? `loudnorm=I=${opt.lufs}:TP=${opt.tp}:LRA=9:measured_I=<I>:measured_TP=<TP>:measured_LRA=<LRA>:measured_thresh=<thresh>:offset=<offset>:linear=true`
    : `loudnorm=I=${opt.lufs}:TP=${opt.tp}:LRA=9:measured_I=${m1.I}:measured_TP=${m1.TP}:measured_LRA=${m1.LRA}:measured_thresh=${m1.thresh}:offset=${m1.offset}:linear=true`;
  r = ff(["-y", "-i", mid, "-af", `${ln},aresample=48000`, "-c:a", "pcm_s24le", out]);
  if (r.status !== 0) fail(`falló la normalización:\n${r.stderr.split("\n").slice(-8).join("\n")}`);

  // 3) medición del resultado
  const despues = measure(out);

  // 4) mux opcional: video copiado, audio limpio
  let muxOut = null;
  if (opt.mux) {
    muxOut = join(dirname(out), basename(out, extname(out)) + extname(src));
    if (existsSync(muxOut) && !opt.force && !opt.dry) fail(`ya existe ${muxOut} (usa --force)`);
    r = ff(["-y", ...trim, "-i", src, "-i", out, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", muxOut]);
    if (r.status !== 0) avisos.push(`El mux falló: ${r.stderr.split("\n").slice(-3).join(" ")}`);
  }

  // 5) informe
  const modelPath = join(MODEL_DIR, MODEL_FILE);
  const informe = {
    herramienta: "library/audio/clean-voice.mjs",
    fecha: new Date().toISOString(),
    entrada: basename(src),
    salida: basename(out),
    ffmpeg: version,
    opciones: { ...opt, denoise_efectivo: denoise, deesser_efectivo: deess },
    filtros: chainStr,
    modelo: denoise === "rnn" ? { archivo: `library/audio/models/${MODEL_FILE}`, sha256: createHash("sha256").update(readFileSync(modelPath)).digest("hex") } : null,
    antes,
    despues,
    avisos,
    nota: "Mediciones técnicas (EBU R128). No evalúan timbre, eco de cuarto ni artefactos del reductor de ruido: revisar escuchando.",
  };
  if (!opt.dry) writeFileSync(`${out}.report.json`, JSON.stringify(informe, null, 2) + "\n");

  const f = (x) => (x === null || x === undefined || Number.isNaN(x) ? "—" : x.toFixed(1));
  console.log(`\nEntrada : ${basename(src)}`);
  console.log(`Salida  : ${out}`);
  if (muxOut) console.log(`Video   : ${muxOut}`);
  console.log(`Cadena  : ${chainStr}`);
  if (antes && despues) {
    console.log(`\n            LUFS    true peak   LRA`);
    console.log(`  antes   ${f(antes.I).padStart(6)}   ${f(antes.TP).padStart(6)} dBTP  ${f(antes.LRA).padStart(5)} LU`);
    console.log(`  después ${f(despues.I).padStart(6)}   ${f(despues.TP).padStart(6)} dBTP  ${f(despues.LRA).padStart(5)} LU`);
    if (despues.TP > opt.tp + 0.3) console.log(`  AVISO: el true peak final supera el techo (${opt.tp} dBTP).`);
  }
  for (const a of avisos) console.log(`AVISO  ${a}`);
  console.log("\nPendiente: escuchar el resultado (el informe solo mide nivel).");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
