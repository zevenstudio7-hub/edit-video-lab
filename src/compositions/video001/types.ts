import type { CaptionChunk } from "../../../library/recipes/ChunkCaptions";
import type { FocusKey, ImageMark } from "../../../library/recipes/FocusPanImage";
import type { PresenterPunch } from "../../../library/recipes/PresenterCamera";

/** Plano del presentador ya resuelto a frames de la línea de tiempo (lo calcula buildEdit.mjs desde la orden). */
export interface TimelineCut {
  id: string;
  block: string;
  source: string; // archivo de preview en public/
  inTime: number; // s en la fuente
  outTime: number;
  startFrame: number;
  durationInFrames: number;
  trimBefore: number; // frames en la fuente
  trimAfter: number;
  scale: number;
  focus: { x: number; y: number };
  push?: number;
  revealFrom?: number;
  punches?: PresenterPunch[];
  text: string;
}

interface SupportBase {
  id: string;
  startFrame: number;
  durationInFrames: number;
  kicker?: string;
  /** Atribución visible (obligatoria para CC BY-SA) o fuente de la captura. */
  credit?: string;
}

export interface ImageSupport extends SupportBase {
  kind: "image";
  src: string;
  width: number;
  height: number;
  fit?: "contain" | "cover";
  card?: boolean;
  padding?: number;
  keys?: FocusKey[];
  marks?: ImageMark[];
  drift?: number;
  /** Rótulo grande opcional que entra en un frame local. */
  title?: { text: string; frame: number; position?: "top" | "bottom" };
}

export interface ListSupport extends SupportBase {
  kind: "list";
  icon: "check" | "plus" | "cross" | "arrow";
  items: { text: string; frame: number }[];
  /** Frame local en que todos los elementos se tachan. */
  strikeAt?: number;
  footer?: { text: string; frame: number };
}

export interface StatementSupport extends SupportBase {
  kind: "statement";
  lines: { text: string; frame: number; highlight?: string[] }[];
}

export interface VersusSupport extends SupportBase {
  kind: "versus";
  left: { src: string; width: number; height: number; label: string; quote?: string; frame: number };
  right: { src: string; width: number; height: number; label: string; quote?: string; frame: number };
}

export interface ChipsSupport extends SupportBase {
  kind: "chips";
  title?: string;
  chips: { text: string; frame: number }[];
}

export interface CtaSupport extends SupportBase {
  kind: "cta";
  headline: string;
  subline?: string;
  buttonText?: string;
}

export type TimelineSupport = ImageSupport | ListSupport | StatementSupport | VersusSupport | ChipsSupport | CtaSupport;

export interface Video001Timeline {
  fps: number;
  durationInFrames: number;
  topHeight: number;
  source: { width: number; height: number };
  accent: string;
  cuts: TimelineCut[];
  supports: TimelineSupport[];
  captions: CaptionChunk[];
}

export type Video001Props = { timeline: Video001Timeline; reviewNotice?: string };
