#!/usr/bin/env node
// Valida library/catalog.json y library/assets.json. Sin dependencias; solo lee archivos.
//   node library/validate.mjs
// Errores → exit 1. Avisos (componentes de src/components sin catalogar) → exit 0.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const readJson = (rel) => {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (e) {
    err(`${rel}: no se pudo leer o no es JSON válido (${e.message})`);
    return null;
  }
};

const EDIT_TYPES = [
  "#edit-1-motion",
  "#edit-2-pantalla-dividida",
  "#edit-3-organico",
  "#edit-4-avatar",
];
const TIPOS = ["componente", "receta", "preset", "tokens", "marca", "composicion", "herramienta", "datos"];
const ORIGENES = ["LIB-001", "library"];
const ESTADOS = ["disponible", "candidata", "validada", "incompleta"];
const USO = ["si", "condicional", "no"];
const ASSET_ESTADOS = ["pendiente", "usado", "descartado"];

const catalog = readJson("library/catalog.json");
if (catalog) {
  if (catalog.version !== 1) err("catalog.json: version debe ser 1");
  if (JSON.stringify(catalog.edit_types) !== JSON.stringify(EDIT_TYPES)) {
    err("catalog.json: edit_types debe listar exactamente los 4 EDIT_TYPE de la RAÍZ, en orden");
  }

  const entradas = Array.isArray(catalog.entradas) ? catalog.entradas : [];
  if (entradas.length === 0) err("catalog.json: entradas vacío");
  const ids = new Set();
  for (const e of entradas) {
    const w = `entrada '${e.id ?? "?"}'`;
    for (const k of ["id", "nombre", "tipo", "origen", "archivo", "estado", "funcion", "usa", "edit_types"]) {
      if (e[k] === undefined) err(`${w}: falta el campo '${k}'`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id ?? "")) err(`${w}: id debe ser kebab-case`);
    if (ids.has(e.id)) err(`${w}: id duplicado`);
    ids.add(e.id);
    if (!TIPOS.includes(e.tipo)) err(`${w}: tipo '${e.tipo}' no válido`);
    if (!ORIGENES.includes(e.origen)) err(`${w}: origen '${e.origen}' no válido`);
    if (!ESTADOS.includes(e.estado)) err(`${w}: estado '${e.estado}' no válido`);
    if (e.ref !== null && !/^REF-\d+$/.test(e.ref ?? "")) err(`${w}: ref debe ser null o REF-n`);
    if (e.archivo && !existsSync(join(root, e.archivo))) err(`${w}: el archivo '${e.archivo}' no existe`);
    if (e.edit_types) {
      const keys = Object.keys(e.edit_types);
      if (JSON.stringify(keys) !== JSON.stringify(EDIT_TYPES)) {
        err(`${w}: edit_types debe tener los 4 EDIT_TYPE, en orden`);
      }
      for (const [k, v] of Object.entries(e.edit_types)) {
        if (!USO.includes(v)) err(`${w}: edit_types['${k}']='${v}' no válido (si | condicional | no)`);
        if (v === "condicional" && !e.nota) err(`${w}: hay un 'condicional' sin 'nota' que diga la condición`);
      }
    }
    if (e.origen === "library" && e.estado === "validada") {
      // Una validación debe poder rastrearse a una orden; sin campo 'validada_en' no se acepta.
      if (!e.validada_en) err(`${w}: estado 'validada' exige 'validada_en' con la orden VIDEO-XXX`);
    }
  }
  for (const e of entradas) {
    for (const u of e.usa ?? []) {
      if (!ids.has(u)) err(`entrada '${e.id}': usa '${u}', que no existe en el catálogo`);
    }
  }

  // Todo lo que vive en library/recipes debe estar catalogado (error).
  const catalogued = new Set(entradas.map((e) => e.archivo));
  const recipesDir = join(root, "library/recipes");
  if (existsSync(recipesDir)) {
    for (const f of readdirSync(recipesDir).filter((n) => n.endsWith(".tsx"))) {
      if (!catalogued.has(`library/recipes/${f}`)) err(`library/recipes/${f}: receta sin entrada en el catálogo`);
    }
  }
  // Componentes de src/components sin catalogar (aviso: pueden ser trabajo en curso sin versionar).
  const excl = new Set((catalog.excluidos ?? []).map((x) => x.archivo));
  const compDir = join(root, "src/components");
  if (existsSync(compDir)) {
    for (const f of readdirSync(compDir).filter((n) => n.endsWith(".tsx"))) {
      const rel = `src/components/${f}`;
      if (!catalogued.has(rel) && !excl.has(rel)) warn(`${rel}: componente sin catalogar ni excluir`);
    }
  }

  var porEstado = entradas.reduce((acc, e) => ((acc[e.estado] = (acc[e.estado] ?? 0) + 1), acc), {});
  var total = entradas.length;
}

const assets = readJson("library/assets.json");
if (assets) {
  if (assets.version !== 1) err("assets.json: version debe ser 1");
  if (!Array.isArray(assets.items)) err("assets.json: items debe ser un arreglo");
  for (const it of assets.items ?? []) {
    const w = `asset '${it.id ?? "?"}'`;
    for (const k of assets.campos_item ?? []) if (it[k] === undefined) err(`${w}: falta '${k}'`);
    if (!ASSET_ESTADOS.includes(it.estado)) err(`${w}: estado '${it.estado}' no válido`);
    if (it.estado === "usado" && it.archivo && !existsSync(join(root, it.archivo))) {
      err(`${w}: marcado 'usado' pero el archivo '${it.archivo}' no existe`);
    }
  }
}


// ---------- sonidos ----------
const sfx = readJson("library/sfx/sfx.json");
let sfxSinDescargar = [];
if (sfx) {
  if (sfx.version !== 1) err("sfx.json: version debe ser 1");
  if (!/^public\/[a-z0-9/_-]+$/.test(sfx.carpeta_publica ?? "")) err("sfx.json: carpeta_publica debe vivir bajo public/");
  const sids = new Set();
  for (const s of sfx.sonidos ?? []) {
    const w = `sonido '${s.id ?? "?"}'`;
    for (const k of ["id", "archivo", "url", "autor", "licencia", "licencia_fuente", "volumen", "uso"]) {
      if (s[k] === undefined) err(`${w}: falta '${k}'`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id ?? "")) err(`${w}: id debe ser kebab-case`);
    if (sids.has(s.id)) err(`${w}: id duplicado`);
    sids.add(s.id);
    if (s.licencia !== "CC0") err(`${w}: solo se admite licencia CC0 declarada (encontrado '${s.licencia}')`);
    if (!String(s.url ?? "").startsWith("https://")) err(`${w}: url debe ser https`);
    if (!String(s.licencia_fuente ?? "").startsWith("https://")) err(`${w}: licencia_fuente debe ser una URL https`);
    if (!String(s.archivo ?? "").startsWith(`${sfx.carpeta_publica}/`)) err(`${w}: archivo debe estar en ${sfx.carpeta_publica}`);
    if (!(s.volumen > 0 && s.volumen <= 1)) err(`${w}: volumen debe estar en (0, 1]`);
    if (s.archivo && !existsSync(join(root, s.archivo))) sfxSinDescargar.push(s.id);
  }
  const excluidos = new Set((sfx.excluidos ?? []).flatMap((x) => x.ids ?? []));
  for (const id of sids) if (excluidos.has(id)) err(`sonido '${id}': está a la vez en sonidos y en excluidos`);
  for (const [i, r] of (sfx.reglas ?? []).entries()) {
    const w = `regla #${i + 1}`;
    if (!sids.has(r.sonido)) err(`${w}: el sonido '${r.sonido}' no existe en sonidos`);
    if (excluidos.has(r.sonido)) err(`${w}: usa el sonido excluido '${r.sonido}'`);
    if ((r.evento === undefined) === (r.palabras === undefined)) err(`${w}: debe tener 'evento' o 'palabras' (uno solo)`);
    if (r.palabras !== undefined && (!Array.isArray(r.palabras) || r.palabras.length === 0)) err(`${w}: 'palabras' debe ser un arreglo no vacío`);
  }
  const lim = sfx.limites ?? {};
  for (const k of ["separacion_min_frames", "separacion_min_mismo_sonido_frames"]) {
    if (!Number.isInteger(lim[k]) || lim[k] < 0) err(`sfx.json: limites.${k} debe ser un entero ≥ 0`);
  }
  if (!existsSync(join(root, "library/audio/models/sh.rnnn"))) err("library/audio/models/sh.rnnn: falta el modelo que usa clean-voice.mjs");
}

if (catalog) console.log(`catálogo: ${total} entradas · ${JSON.stringify(porEstado)}`);
if (assets) console.log(`assets: ${assets.items?.length ?? 0} registrados · ${assets.fuentes_candidatas?.length ?? 0} fuentes candidatas`);
if (sfx) {
  console.log(`sonidos: ${sfx.sonidos?.length ?? 0} con CC0 declarada · ${sfx.pendientes?.length ?? 0} pendientes por conseguir`);
  if (sfxSinDescargar.length) warn(`sonidos sin descargar (${sfxSinDescargar.join(", ")}): node library/sfx/fetch-sfx.mjs`);
}
for (const w of warnings) console.warn(`AVISO  ${w}`);
for (const e of errors) console.error(`ERROR  ${e}`);
console.log(errors.length ? `✗ ${errors.length} error(es)` : "✓ catálogo y manifiesto válidos");
process.exit(errors.length ? 1 : 0);
