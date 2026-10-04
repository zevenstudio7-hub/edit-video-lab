/**
 * Generación de señales de sonido (cues) a partir de la edición y de lo que se dice.
 * Funciones puras, sin React ni Remotion: se pueden probar con node.
 *
 * Fuentes de señales:
 *  - eventos de la edición (corte, transición, tarjeta, sección) con su frame;
 *  - palabras con tiempo (de un análisis REAL con timestamps: no se inventan).
 * Las reglas salen de library/sfx/sfx.json.
 */

export interface SfxCue {
  /** Frame de la composición en que SUENA el sonido (ya con el adelanto aplicado). */
  frame: number;
  /** id de un sonido de sfx.json */
  sound: string;
  /** Volumen 0–1. Si falta, se usa el `volumen` del sonido en sfx.json. */
  volume?: number;
  /** Para depurar: por qué existe esta señal. */
  motivo?: string;
}

export interface SfxEventRule {
  evento: string;
  sonido: string;
  adelanto_frames?: number;
  volumen?: number;
}
export interface SfxWordRule {
  palabras: string[];
  sonido: string;
  adelanto_frames?: number;
  volumen?: number;
}
export type SfxRule = SfxEventRule | SfxWordRule;

export interface SfxLimits {
  separacion_min_frames: number;
  separacion_min_mismo_sonido_frames: number;
}

export interface EditEvent {
  type: string;
  frame: number;
}
export interface TimedWord {
  text: string;
  startFrame: number;
}

const isWordRule = (r: SfxRule): r is SfxWordRule => (r as SfxWordRule).palabras !== undefined;

/** Minúsculas, sin tildes ni signos: «¡Comentá!» → «comenta». */
export const normalizeWord = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Frames en que empieza cada plano salvo el primero (los cortes). */
export const boundariesFromDurations = (durations: number[]): number[] => {
  const out: number[] = [];
  let acc = 0;
  durations.forEach((d, i) => {
    if (i > 0) out.push(acc);
    acc += d;
  });
  return out;
};

export const cuesFromEvents = (events: EditEvent[], rules: SfxRule[]): SfxCue[] => {
  const cues: SfxCue[] = [];
  for (const ev of events) {
    const rule = rules.find((r): r is SfxEventRule => !isWordRule(r) && r.evento === ev.type);
    if (!rule) continue;
    cues.push({
      frame: Math.max(0, ev.frame - (rule.adelanto_frames ?? 0)),
      sound: rule.sonido,
      volume: rule.volumen,
      motivo: `evento:${ev.type}@${ev.frame}`,
    });
  }
  return cues;
};

export const cuesFromWords = (words: TimedWord[], rules: SfxRule[]): SfxCue[] => {
  const cues: SfxCue[] = [];
  for (const w of words) {
    const n = normalizeWord(w.text);
    if (!n) continue;
    const rule = rules.find((r): r is SfxWordRule => isWordRule(r) && r.palabras.some((p) => normalizeWord(p) === n));
    if (!rule) continue;
    cues.push({
      frame: Math.max(0, w.startFrame - (rule.adelanto_frames ?? 0)),
      sound: rule.sonido,
      volume: rule.volumen,
      motivo: `palabra:${n}@${w.startFrame}`,
    });
  }
  return cues;
};

/**
 * Evita el efecto «lluvia de sonidos»: descarta señales demasiado juntas.
 * En orden temporal conserva la primera de cada conflicto. Devuelve también lo descartado, para revisarlo.
 */
export const thinCues = (cues: SfxCue[], limits: SfxLimits): { kept: SfxCue[]; dropped: SfxCue[] } => {
  const sorted = [...cues].sort((a, b) => a.frame - b.frame);
  const kept: SfxCue[] = [];
  const dropped: SfxCue[] = [];
  const lastBySound = new Map<string, number>();
  let lastAny = -Infinity;
  for (const c of sorted) {
    const lastSame = lastBySound.get(c.sound) ?? -Infinity;
    if (c.frame - lastAny < limits.separacion_min_frames || c.frame - lastSame < limits.separacion_min_mismo_sonido_frames) {
      dropped.push(c);
      continue;
    }
    kept.push(c);
    lastBySound.set(c.sound, c.frame);
    lastAny = c.frame;
  }
  return { kept, dropped };
};

/** Atajo: eventos + palabras → señales finales. */
export const buildCues = (
  input: { events?: EditEvent[]; words?: TimedWord[] },
  rules: SfxRule[],
  limits: SfxLimits
): { kept: SfxCue[]; dropped: SfxCue[] } =>
  thinCues([...cuesFromEvents(input.events ?? [], rules), ...cuesFromWords(input.words ?? [], rules)], limits);
