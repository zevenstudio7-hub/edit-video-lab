import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * TypeCaptions — subtítulos en dos capas (dirección V3 de VIDEO-001):
 *  - lectura: bloques cortos en sans pesada;
 *  - énfasis: en momentos elegidos por sentido, el bloque se convierte en una composición tipográfica grande y
 *    asimétrica (1–3 líneas con jerarquía de tamaño). Sustituye a la lectura en esas palabras: la frase no se
 *    duplica en dos capas.
 * Variantes:
 *  - "texture" (referencia tipográfica del usuario, 2026-10-03): lectura blanca sin caja; énfasis con relleno de
 *    textura rosa/roja sobre el video;
 *  - "cards" (identidad ZevenPRO, 2026-10-04): lectura en tarjeta blanca con borde suave y sombra ligera; énfasis en
 *    tarjetas apiladas (blanca con texto oscuro; amarilla con efecto marcador para la palabra clave; roja solo para
 *    alertas; azul solo para lo digital). En esta variante el énfasis se ancla por su borde inferior (emphasisY),
 *    para no salir del área segura.
 * Estado: validada en VIDEO-001 con la variante «texture» (formato #edit-2-pantalla-dividida, 2026-10-04); «cards» sin uso. Los tiempos por bloque salen de palabras alineadas (refineWordTimesV3: sílabas + energía).
 */

export interface ReadChunk {
  text: string;
  startFrame: number;
  endFrame: number;
}

export type EmphasisTone = "white" | "pink" | "red" | "ink" | "yellow" | "blue";

export interface EmphasisLine {
  text: string;
  size: "s" | "m" | "l" | "xl";
  tone: EmphasisTone;
  align?: "left" | "right" | "center";
  /** Desplazamiento horizontal extra (px) para escalonar. */
  indent?: number;
}

export interface EmphasisBlock {
  id: string;
  startFrame: number;
  endFrame: number;
  lines: EmphasisLine[];
}

export interface CaptionTheme {
  card: string;
  ink: string;
  border: string;
  yellow: string;
  red: string;
  blue: string;
}

export interface TypeCaptionsProps {
  read: ReadChunk[];
  emphasis: EmphasisBlock[];
  fontFamily: string;
  /** Centro vertical de la capa de lectura (px). */
  readY: number;
  /** "texture": centro vertical del énfasis (o borde inferior con emphasisAnchor="bottom"); "cards": borde inferior (px). */
  emphasisY: number;
  /** Anclaje vertical del énfasis en la variante "texture" (por defecto "center"). "bottom" lo mantiene encima de un límite (área segura). */
  emphasisAnchor?: "center" | "bottom";
  /** Tamaños de letra por nivel (px); por defecto los de cada variante. */
  sizes?: Partial<Record<EmphasisLine["size"], number>>;
  variant?: "texture" | "cards";
  textures?: { pink: string; red: string };
  colors?: { pink: string; red: string };
  theme?: CaptionTheme;
  /** Ancho útil (px) y margen izquierdo de la composición. */
  width?: number;
  left?: number;
}

const SIZE_TEXTURE = { s: 74, m: 108, l: 150, xl: 192 } as const;
const SIZE_CARDS = { s: 48, m: 64, l: 86, xl: 110 } as const;

const ReadLayer: React.FC<{ chunk: ReadChunk; props: TypeCaptionsProps }> = ({ chunk, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - chunk.startFrame, fps, config: { damping: 200, stiffness: 260 }, durationInFrames: 6 });
  if (props.variant === "cards" && props.theme) {
    const t = props.theme;
    return (
      <div
        data-read-chunk={chunk.text}
        style={{
          position: "absolute", left: props.left ?? 65, width: props.width ?? 875, top: props.readY, zIndex: 40, textAlign: "center",
          transform: `translateY(-50%) translateY(${interpolate(enter, [0, 1], [10, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        }}
      >
        <span
          style={{
            display: "inline-block", maxWidth: "100%", padding: "8px 22px 10px", borderRadius: 18, background: t.card, color: t.ink,
            border: `1.5px solid ${t.border}`, boxShadow: "0 8px 22px rgba(23,23,29,0.16)",
            fontFamily: props.fontFamily, fontWeight: 800, fontSize: 46, lineHeight: 1.12, letterSpacing: "-0.01em",
          }}
        >
          {chunk.text}
        </span>
      </div>
    );
  }
  return (
    <div
      data-read-chunk={chunk.text}
      style={{
        position: "absolute", ...(props.width !== undefined ? { left: props.left ?? 0, width: props.width } : { left: 90, right: 90 }), top: props.readY, transform: `translateY(-50%) translateY(${interpolate(enter, [0, 1], [8, 0])}px)`,
        textAlign: "center", fontFamily: props.fontFamily, fontWeight: 800, fontSize: 56, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff",
        textShadow: "0 2px 3px rgba(0,0,0,0.55), 0 6px 22px rgba(0,0,0,0.5)", zIndex: 40,
      }}
    >
      {chunk.text}
    </div>
  );
};

const CardsEmphasis: React.FC<{ block: EmphasisBlock; props: TypeCaptionsProps; theme: CaptionTheme }> = ({ block, props, theme: t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = props.width ?? 875;
  const local = frame - block.startFrame;
  return (
    <div
      data-emphasis={block.id}
      style={{ position: "absolute", left: props.left ?? 65, width, top: props.emphasisY, transform: "translateY(-100%)", zIndex: 41, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}
    >
      {block.lines.map((line, i) => {
        const indent = line.indent ?? 0;
        // tamaño de referencia; se reduce si la línea no cabe (≈0,56 em por carácter en peso 900 + relleno)
        const fontSize = Math.min(props.sizes?.[line.size] ?? SIZE_CARDS[line.size], (width - indent) / Math.max(1, line.text.length * 0.56 + 0.6));
        const e = spring({ frame: local - i * 3, fps, config: { damping: 15, stiffness: 190, mass: 0.7 } });
        const sweep = interpolate(local - i * 3, [2, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const tone = line.tone === "pink" ? "yellow" : line.tone === "white" ? "ink" : line.tone;
        const solid = tone === "red" ? t.red : tone === "blue" ? t.blue : null;
        const box: React.CSSProperties =
          tone === "yellow"
            ? { // marcador: el amarillo se extiende de izquierda a derecha sobre la tarjeta blanca
                backgroundColor: t.card, backgroundImage: `linear-gradient(${t.yellow}, ${t.yellow})`, backgroundRepeat: "no-repeat",
                backgroundSize: `${sweep * 100}% 100%`, color: t.ink, border: `1.5px solid ${t.yellow}`,
              }
            : solid
              ? { background: solid, color: t.card, border: `1.5px solid ${solid}` }
              : { background: t.card, color: t.ink, border: `1.5px solid ${t.border}` };
        return (
          <div
            key={i}
            style={{
              alignSelf: line.align === "right" ? "flex-end" : line.align === "center" ? "center" : "flex-start",
              marginLeft: line.align === "right" ? 0 : indent,
              fontFamily: props.fontFamily, fontWeight: 900, fontSize, lineHeight: 1.0, letterSpacing: "-0.03em", whiteSpace: "nowrap",
              padding: "0.08em 0.26em 0.12em", borderRadius: "0.2em", boxShadow: "0 10px 26px rgba(23,23,29,0.18)", ...box,
              opacity: interpolate(e, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(e, [0, 1], [24, 0])}px) scale(${interpolate(e, [0, 1], [0.94, 1])})`,
              transformOrigin: line.align === "right" ? "right bottom" : "left bottom",
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};

const TextureEmphasis: React.FC<{ block: EmphasisBlock; props: TypeCaptionsProps }> = ({ block, props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = props.width ?? 940;
  const left = props.left ?? 70;
  const local = frame - block.startFrame;
  return (
    <div
      data-emphasis={block.id}
      style={{ position: "absolute", left, width, top: props.emphasisY, transform: props.emphasisAnchor === "bottom" ? "translateY(-100%)" : "translateY(-50%)", zIndex: 41, filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.45))" }}
    >
      {block.lines.map((line, i) => {
        const fontSize = Math.min(props.sizes?.[line.size] ?? SIZE_TEXTURE[line.size], (width - (line.indent ?? 0)) / Math.max(1, line.text.length * 0.53));
        const e = spring({ frame: local - i * 3, fps, config: { damping: 15, stiffness: 190, mass: 0.7 } });
        const textured = line.tone === "pink" || line.tone === "red";
        const fill: React.CSSProperties =
          !textured || !props.textures
            ? { color: "#fff" }
            : {
                color: "transparent",
                WebkitTextFillColor: "transparent",
                backgroundImage: `url(${line.tone === "pink" ? props.textures.pink : props.textures.red})`,
                backgroundSize: "720px auto",
                backgroundPosition: `${-local * 0.6}px ${i * 90}px`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              };
        return (
          <div
            key={i}
            style={{
              fontFamily: props.fontFamily, fontWeight: 900, fontSize, lineHeight: 0.9, letterSpacing: "-0.045em",
              textAlign: line.align ?? "left", paddingLeft: line.indent ?? 0, whiteSpace: "nowrap",
              opacity: interpolate(e, [0, 1], [0, 1]), transform: `translateY(${interpolate(e, [0, 1], [34, 0])}px) scale(${interpolate(e, [0, 1], [0.94, 1])})`,
              transformOrigin: line.align === "right" ? "right bottom" : "left bottom",
            }}
          >
            <span style={fill}>{line.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export const TypeCaptions: React.FC<TypeCaptionsProps> = (props) => {
  const frame = useCurrentFrame();
  const emph = props.emphasis.find((b) => frame >= b.startFrame && frame < b.endFrame);
  if (emph) {
    return props.variant === "cards" && props.theme ? <CardsEmphasis block={emph} props={props} theme={props.theme} /> : <TextureEmphasis block={emph} props={props} />;
  }
  const chunk = props.read.find((c) => frame >= c.startFrame && frame < c.endFrame);
  return chunk ? <ReadLayer chunk={chunk} props={props} /> : null;
};
