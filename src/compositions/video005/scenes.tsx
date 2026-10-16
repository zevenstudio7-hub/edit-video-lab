import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { flotar, stickerEscalonado } from "../../../formatos/motion-ux/snippets/primitivas";
import { App, Borrador, EASE, Carpeta, Check, clamp, Conector, Cursor, Drive, entra, FONT, Gmail, MONO, NodoIA, P, Pdf, Pildora, pop, pr, Repo, Sheets, Simulacion, Tarjeta, Titular, UI, vis } from "./ui";

// Escenas de VIDEO-005 (guion técnico del usuario §4, recalibrado con la toma). Cada escena recibe el frame global `f`
// y su escena `s` con beats globales (video-orders/VIDEO-005.json → timeline.scenes). Presentador: solo capas encima
// (rótulos en el pecho y a los lados de la cabeza; la cabeza ocupa x ≈ 260–800, y ≈ 280–1040). Motion: superficie
// soft a pantalla completa; contenido entre y ≈ 290 (titular) y 1300; la lectura de subtítulos queda en y = 1438.

export interface Escena { id: string; modo: "presentador" | "motion"; tipo: string; startFrame: number; durationInFrames: number; beats: Record<string, number> }
type Props = { f: number; s: Escena };
const fin = (s: Escena) => s.startFrame + s.durationInFrames;

const Abs: React.FC<{ x: number; y: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ x, y, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>
);
const Txt: React.FC<{ size?: number; w?: number; c?: string; mono?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ size = 34, w = 700, c = P.ink, mono, children, style }) => (
  <div style={{ fontFamily: mono ? MONO : FONT, fontSize: size, fontWeight: w, color: c, lineHeight: 1.1, letterSpacing: mono ? 0 : "-0.015em", whiteSpace: "nowrap", ...style }}>{children}</div>
);
/** Tarjeta de rótulo en el pecho del presentador (≤ 6 palabras, guion §3.4). */
const RotuloPecho: React.FC<{ f: number; at: number; exit?: number; y?: number; children: React.ReactNode }> = ({ f, at, exit, y = 1090, children }) => {
  const t = vis(f, at, exit);
  if (t <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", ...entra(f, at, exit) }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, letterSpacing: "-0.02em", color: P.ink, background: "linear-gradient(180deg,#FFFFFF,#F4F5F7)", borderRadius: 999, padding: "20px 38px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.45), inset 0 2px 0 #FFF", display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>{children}</div>
    </div>
  );
};

// ---------- ESC 1 · gancho (presentador) ----------
const Esc1: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const icono = (at: number, x: number, y: number, el: React.ReactNode, fase: number) => {
    const t = pop(f, at);
    return t <= 0 ? null : (
      <Abs x={x} y={y} style={{ transform: `scale(${t})`, ...flotar(f, fase) }}>
        <App size={128}>{el}</App>
      </Abs>
    );
  };
  return (
    <>
      {icono(b.drive, 84, 470, <Drive size={78} />, 0)}
      {icono(b.gmail, 868, 430, <Gmail size={80} />, 30)}
      {icono(b.sheets, 100, 700, <Sheets size={76} />, 60)}
      <RotuloPecho f={f} at={b.card} exit={b.cardSale}>¿Gmail + Drive + Sheets a diario?</RotuloPecho>
    </>
  );
};

// ---------- ESC 2 · conectar Google con IA ----------
const Esc2: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const C: [number, number] = [540, 880];
  const giro = (f - s.startFrame) * 0.5;
  const apps = [<Gmail key="g" size={100} />, <Drive key="d" size={98} />, <Sheets key="s" size={96} />];
  const pos = apps.map((_, i) => { const a = ((-90 + i * 120 + giro) * Math.PI) / 180; return [C[0] + 340 * Math.cos(a), C[1] + 290 * Math.sin(a)] as [number, number]; });
  const enciende = pr(f, b.facil, 8);
  const pulsoNodo = f >= b.facil && f < b.facil + 12 ? 1 + 0.08 * Math.sin((Math.PI * (f - b.facil)) / 12) : 1;
  return (
    <>
      <Titular f={f} at={b.titular} etiqueta="Gmail · Drive · Sheets" partes={["Tu Google + ", { clave: "IA" }]} size={104} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {pos.map((p, i) => (
          <Conector key={i} a={p} b={C} p={pr(f, b.conectar + i * 4, 14)} color={enciende > 0 ? P.yellow : UI.ui300} w={6 + 3 * enciende} pulso={f >= b.facil ? ((f - b.facil + i * 7) % 24) / 24 : undefined} />
        ))}
      </svg>
      <Abs x={C[0] - 140} y={C[1] - 140} style={{ transform: `scale(${pop(f, b.orbita) * pulsoNodo})` }}>
        <NodoIA f={f} size={280} glow={0.4 + 0.6 * Math.max(pr(f, b.ia, 10), enciende)} />
      </Abs>
      {apps.map((el, i) => (
        <Abs key={i} x={pos[i][0] - 90} y={pos[i][1] - 90} style={stickerEscalonado(f, i, b.orbita)}>
          <App size={180}>{el}</App>
        </Abs>
      ))}
    </>
  );
};

// ---------- ESC 3 · tres casos de uso ----------
const Esc3: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const ys = [560, 815, 1070];
  const activa = f >= b.c3 ? 2 : f >= b.c2 ? 1 : 0;
  const card = (i: number, at: number, label: string, cont: React.ReactNode) =>
    vis(f, at) <= 0 ? null : (
      <div key={i} style={entra(f, at, undefined, 60)}>
        <Tarjeta x={80} y={ys[i]} w={920} h={225} activa={activa === i ? 1 : 0} style={{ opacity: activa === i ? 1 : 0.72 }}>
          <Txt size={32} w={800} style={{ position: "absolute", left: 40, top: 26 }}>{label}</Txt>
          <div style={{ position: "absolute", left: 40, right: 40, top: 78, height: 120 }}>{cont}</div>
        </Tarjeta>
      </div>
    );
  // 1: el adjunto cae del correo a la carpeta
  const viaje = pr(f, b.c1 + 10, 20);
  // 2: la hoja se convierte en PDF
  const conv = pr(f, b.c2 + 12, 14);
  return (
    <>
      <Titular f={f} at={s.startFrame + 2} etiqueta="Lo que puedes hacer" size={76}
        partes={[<span key="a" style={{ opacity: f >= b.c1 ? 1 : 0.25 }}>Organizar · </span>, <span key="b" style={{ opacity: f >= b.c2 ? 1 : 0.25 }}>Reportar · </span>, { clave: f >= b.c3 ? "Dar seguimiento" : "" }]} />
      {card(0, b.c1, "Documentos del correo", (
        <>
          <App size={110} style={{ position: "absolute", left: 0, top: 4 }}><Gmail size={64} /></App>
          <Abs x={150 + viaje * 470} y={34 + Math.sin(viaje * Math.PI) * -26} style={{ opacity: 1 - pr(f, b.c1 + 28, 6) }}><Pildora size={24} tono="suave"><Pdf size={30} />Factura.pdf</Pildora></Abs>
          <div style={{ position: "absolute", right: 0, top: 8, transform: `scale(${1 + 0.08 * Math.sin(Math.PI * pr(f, b.c1 + 28, 10))})` }}><Carpeta size={120} /></div>
        </>
      ))}
      {card(1, b.c2, "Reportes desde tus hojas", (
        <>
          <App size={110} style={{ position: "absolute", left: 0, top: 4 }}><Sheets size={66} /></App>
          <svg width={300} height={40} style={{ position: "absolute", left: 300, top: 40 }}><path d="M0 20h270m-22-16l22 16-22 16" fill="none" stroke={UI.ui300} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={330} strokeDashoffset={330 * (1 - conv)} /></svg>
          <div style={{ position: "absolute", right: 10, top: 0, transform: `scale(${conv}) rotate(${(1 - conv) * -12}deg)` }}><Pdf size={112} /></div>
        </>
      ))}
      {card(2, b.c3, "Solicitudes pendientes", (
        <div style={{ display: "flex", gap: 22, marginTop: 14 }}>
          {["Contrato", "Factura", "Reporte"].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, background: pr(f, b.c3 + 10 + i * 9, 6) > 0.5 ? UI.okSoft : "#F3F4F6", borderRadius: 999, padding: "12px 20px 12px 12px" }}>
              <Check t={pr(f, b.c3 + 10 + i * 9, 8)} size={46} /><Txt size={30}>{t}</Txt>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

// ---------- ESC 4 · los 3 repositorios ----------
export const REPOS = [
  { n: "01", nombre: "Google Workspace CLI", ruta: "googleworkspace/cli", funcion: "Operar tus apps" },
  { n: "02", nombre: "clasp", ruta: "google/clasp", funcion: "Automatizar en Google" },
  { n: "03", nombre: "n8n-MCP", ruta: "czlonkowski/n8n-mcp", funcion: "Flujos de trabajo" },
];
export const TarjetaRepo: React.FC<{ r: (typeof REPOS)[number]; x: number; y: number; w?: number; activa?: number; atenuada?: boolean }> = ({ r, x, y, w = 920, activa = 0, atenuada }) => (
  <Tarjeta x={x} y={y} w={w} h={200} activa={activa} style={{ opacity: atenuada ? 0.55 : 1 }}>
    <div style={{ position: "absolute", left: 36, top: 44, width: 112, height: 112, borderRadius: 32, background: activa > 0.5 ? UI.ui : UI.ui100, display: "grid", placeItems: "center" }}>
      <Txt size={46} w={900} c={activa > 0.5 ? "#FFF" : UI.ui}>{r.n}</Txt>
    </div>
    <div style={{ position: "absolute", left: 180, top: 34 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Repo size={34} color={P.ink2} /><Txt size={26} mono c={P.ink2}>{r.ruta}</Txt></div>
      <Txt size={46} w={800} style={{ marginTop: 10, letterSpacing: "-0.03em" }}>{r.nombre}</Txt>
      <Txt size={32} w={700} c={P.ink2} style={{ marginTop: 8 }}>
        <span style={{ background: activa > 0.5 ? `linear-gradient(transparent 55%, ${P.yellow} 55%)` : undefined, color: activa > 0.5 ? P.ink : undefined }}>{r.funcion}</span>
      </Txt>
    </div>
  </Tarjeta>
);
const Esc4: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const beats = [b.r1, b.r2, b.r3];
  const activa = f >= b.r3 ? 2 : f >= b.r2 ? 1 : f >= b.r1 ? 0 : -1;
  return (
    <>
      <Titular f={f} at={s.startFrame + 2} etiqueta="Para empezar" partes={["3 ", { clave: "repositorios" }]} size={104} />
      {REPOS.map((r, i) => (
        <div key={r.n} style={entra(f, s.startFrame + 4 + i * 4, undefined, 70)}>
          <TarjetaRepo r={r} x={80} y={540 + i * 240} activa={activa === i ? pr(f, beats[i], 8) : 0} atenuada={activa >= 0 && activa !== i} />
        </div>
      ))}
    </>
  );
};

// ---------- ESC 5 · puente a la demo (presentador) ----------
const Esc5: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const ks = [[b.k1, "Organizar"], [b.k2, "Revisar"], [b.k3, "Enviar"]] as const;
  return (
    <>
      <RotuloPecho f={f} at={b.card}>Recibir <span style={{ color: UI.ui }}>→</span> Organizar <span style={{ color: UI.ui }}>→</span> Enviar</RotuloPecho>
      {ks.map(([at, t], i) =>
        vis(f, at) <= 0 ? null : (
          <Abs key={t} x={806} y={450 + i * 96} style={{ ...entra(f, at, undefined, 16), display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.94)", borderRadius: 999, padding: "8px 18px 8px 8px", boxShadow: "0 16px 30px -12px rgba(0,0,0,.45)" }}>
            <Check t={pr(f, at, 8)} size={44} /><Txt size={26} w={800}>{t}</Txt>
          </Abs>
        ),
      )}
    </>
  );
};

// ---------- ESC 5b · la IA prepara, tú revisas (SIMULACIÓN; pasos 2–5 de la demo del guion) ----------
const Paso: React.FC<{ n: string; t: string; on: boolean }> = ({ n, t, on }) => (
  <div style={{ position: "absolute", right: 28, top: 22, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT, fontWeight: 800, fontSize: 24, color: on ? UI.ui : P.ink2, background: on ? UI.ui100 : "#F1F2F4", borderRadius: 999, padding: "8px 16px" }}>{n}. {t}</div>
);
const Esc5b: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const vuela = pr(f, b.adjunto, b.carpeta - b.adjunto + 4);
  const renombra = pr(f, b.nombra, 14);
  const nombreA = "Factura_0457.pdf", nombreB = "2026-09_ClienteX_Factura0457.pdf";
  const nombre = renombra <= 0 ? nombreA : nombreB.slice(0, Math.round(nombreB.length * renombra));
  return (
    <>
      <Simulacion t={vis(f, s.startFrame)} />
      <Titular f={f} at={s.startFrame + 2} etiqueta="Una tarea concreta" partes={["La IA prepara, ", { clave: "tú revisas" }]} size={70} />
      {/* Gmail: el correo del cliente con su adjunto */}
      <div style={entra(f, b.busca - 6, undefined, 50)}>
        <Tarjeta x={80} y={500} w={920} h={210} activa={f >= b.busca && f < b.adjunto ? 1 : 0}>
          <Paso n="2" t="Encuentra" on={f >= b.busca} />
          <App size={104} style={{ position: "absolute", left: 32, top: 52 }}><Gmail size={62} /></App>
          <div style={{ position: "absolute", left: 164, top: 58 }}>
            <Txt size={36} w={800}>Cliente X</Txt>
            <Txt size={28} w={600} c={P.ink2} style={{ marginTop: 6 }}>Factura de septiembre</Txt>
          </div>
          <Abs x={164 + 0} y={140} style={{ opacity: vuela > 0 ? 0.35 : 1 }}><Pildora size={22}><Pdf size={26} />{nombreA}</Pildora></Abs>
        </Tarjeta>
      </div>
      {/* el adjunto viaja a la carpeta */}
      {vuela > 0 && vuela < 1 ? <Abs x={244 + vuela * 40} y={640 + vuela * 210} style={{ transform: `scale(${1 - 0.1 * Math.sin(Math.PI * vuela)})` }}><Pildora size={22}><Pdf size={26} />{nombreA}</Pildora></Abs> : null}
      {/* Drive: carpeta del cliente; el archivo se renombra */}
      <div style={entra(f, b.adjunto - 4, undefined, 50)}>
        <Tarjeta x={80} y={750} w={920} h={200} activa={f >= b.carpeta && f < b.registra ? 1 : 0}>
          <Paso n="3" t="Organiza" on={f >= b.carpeta} />
          <App size={104} style={{ position: "absolute", left: 32, top: 48 }}><Drive size={62} /></App>
          <Txt size={28} mono c={P.ink2} style={{ position: "absolute", left: 164, top: 50 }}>Clientes / Cliente X / 2026-09 /</Txt>
          {vuela >= 1 ? <Abs x={164} y={104}><Pildora size={22} tono={renombra > 0 ? "resalte" : "suave"} style={{ fontFamily: MONO, fontWeight: 700 }}><Pdf size={26} />{nombre}</Pildora></Abs> : null}
        </Tarjeta>
      </div>
      {/* Sheets: fila en la hoja de control */}
      <div style={entra(f, b.registra - 6, undefined, 50)}>
        <Tarjeta x={80} y={990} w={920} h={230} activa={f >= b.registra && f < b.revisas ? 1 : 0}>
          <Paso n="4" t="Registra" on={f >= b.registra} />
          <App size={92} style={{ position: "absolute", left: 32, top: 30 }}><Sheets size={54} /></App>
          <Txt size={30} w={800} style={{ position: "absolute", left: 146, top: 56 }}>Hoja de control</Txt>
          <div style={{ position: "absolute", left: 32, right: 32, top: 138, display: "grid", gridTemplateColumns: "1fr 1.3fr 1.5fr 2fr", gap: 10, fontFamily: FONT, fontSize: 22, fontWeight: 700, color: P.ink2 }}>
            {["Fecha", "Cliente", "Documento", "Estado"].map((h) => <div key={h}>{h}</div>)}
            {["30/09", "Cliente X", "Factura 0457"].map((v, i) => <div key={v} style={{ color: P.ink, opacity: pr(f, b.registra + 4 + i * 3, 6) }}>{v}</div>)}
            <div style={{ opacity: pr(f, b.registra + 13, 6), color: UI.ok, fontWeight: 800 }}>Listo para enviar</div>
          </div>
        </Tarjeta>
      </div>
      {vis(f, b.revisas) > 0 ? (
        <Abs x={0} y={1240} style={{ width: 1080, display: "flex", justifyContent: "center", ...entra(f, b.revisas, undefined, 20) }}>
          <Pildora tono="suave" size={32}><Check t={pr(f, b.revisas + 4, 8)} size={46} />5. Tú revisas</Pildora>
        </Abs>
      ) : null}
    </>
  );
};

// ---------- ESC 6 · 01 Google Workspace CLI (SIMULACIÓN; el prompt se teclea al decirlo) ----------
const PROMPT = "Busca los correos de este cliente, organiza sus adjuntos en esta carpeta y prepara un resumen.";
const Esc6: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const n = Math.round(PROMPT.length * interpolate(f, [b.teclea, b.fin + 6], [0, 1], clamp));
  const tecleando = f >= b.teclea && f < b.fin + 6;
  const caret = tecleando || Math.floor(f / 8) % 2 === 0;
  return (
    <>
      <Simulacion t={vis(f, s.startFrame)} />
      <Titular f={f} at={s.startFrame + 2} etiqueta="01 | Google Workspace CLI" partes={["Operar tus apps ", { clave: "por instrucción" }]} size={76} />
      <div style={entra(f, b.card, undefined, 80)}>
        <Tarjeta x={80} y={560} w={920} h={640}>
          <div style={{ position: "absolute", left: 34, top: 30, display: "flex", gap: 12 }}>{["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: 99, background: c }} />)}</div>
          <Txt size={24} w={700} c={P.ink2} style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center" }}>Asistente IA · terminal</Txt>
          <div style={{ position: "absolute", left: 30, right: 30, top: 80, display: "flex", gap: 14 }}>
            {[<Gmail key="g" size={34} />, <Drive key="d" size={34} />, <Sheets key="s" size={32} />].map((el, i) => (
              <div key={i} style={{ ...entra(f, b.card + 8 + i * 4, undefined, 12), display: "flex", alignItems: "center", gap: 10, background: "#F3F4F6", borderRadius: 999, padding: "8px 16px" }}>{el}<Txt size={24}>{["Gmail", "Drive", "Sheets"][i]}</Txt></div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 30, right: 30, top: 150, bottom: 30, borderRadius: 32, background: "#12141B", padding: "34px 36px", fontFamily: MONO, fontSize: 32, lineHeight: 1.45, color: "#E8EAF0", boxShadow: "inset 0 2px 10px rgba(0,0,0,.4)" }}>
            <span style={{ color: P.yellow }}>› </span>
            <span>{PROMPT.slice(0, n)}</span>
            {caret ? <span style={{ display: "inline-block", width: 16, height: 36, background: P.yellow, verticalAlign: "-6px", marginLeft: 2 }} /> : null}
            {f >= b.fin + 2 ? (
              <div style={{ marginTop: 24, color: "#9AA3B5", fontSize: 28 }}>
                {["correos del cliente encontrados", "adjuntos en la carpeta", "resumen preparado"].map((t, i) => (
                  <div key={t} style={{ opacity: pr(f, b.fin + 2 + i * 2, 4) }}><span style={{ color: "#5FE08A" }}>✓</span> {t}</div>
                ))}
              </div>
            ) : null}
          </div>
        </Tarjeta>
      </div>
      {vis(f, b.pides) > 0 ? <Abs x={80} y={1225} style={entra(f, b.pides, undefined, 14)}><Pildora tono="ui" size={30}>1. Pides</Pildora></Abs> : null}
    </>
  );
};

/** «Listo para enviar» (paso 5 de la demo): cae justo al final de ESC 6 y, como permite el guion, sigue en una esquina al empezar ESC 7. */
export const ListoBadge: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const t = vis(f, at, at + 48, 8, 8);
  return t <= 0 ? null : (
    <Abs x={1010} y={1230} style={{ transform: `translate(-100%, 0) scale(${0.9 + 0.1 * pop(f, at)})`, transformOrigin: "right center", opacity: t }}>
      <Pildora tono="ok" size={30}><Check t={1} size={40} />Listo para enviar</Pildora>
    </Abs>
  );
};

// ---------- ESC 7 · 02 clasp ----------
const CODIGO = ["function generarReportes() {", "  const hoja = SpreadsheetApp.getActive();", "  const pdf = exportarPDF(hoja);", "  DriveApp.getFolderById(CARPETA)", "    .createFile(pdf);", "  GmailApp.sendEmail(cliente, asunto,", "    cuerpo, { attachments: [pdf] });", "}"];
const Esc7: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const fondo = pr(f, b.script, 14);
  const nodos = [[b.sheets, <Sheets key="s" size={70} />, "Sheets"], [b.pdf, <Pdf key="p" size={74} />, "PDF"], [b.drive, <Drive key="d" size={72} />, "Drive"], [b.gmail, <Gmail key="g" size={74} />, "Gmail"]] as const;
  const xs = [175, 405, 635, 865];
  const Y = 1030;
  return (
    <>
      <Titular f={f} at={s.startFrame + 2} etiqueta="02 | clasp" partes={["Automatiza ", { clave: "dentro de Google" }]} size={84} />
      {/* código genérico de Apps Script; en «Apps Script» pasa a fondo desenfocado */}
      {vis(f, b.codigo) > 0 ? (
        <div style={{ ...entra(f, b.codigo, undefined, 30), position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 80, top: 560, width: 920, padding: "34px 40px", borderRadius: 40, background: "#12141B", fontFamily: MONO, fontSize: 28, lineHeight: 1.5, color: "#C9D1E3", opacity: 1 - 0.65 * fondo, filter: `blur(${fondo * 6}px)`, transform: `scale(${1 - 0.04 * fondo})` }}>
            {CODIGO.map((l, i) => <div key={i} style={{ opacity: pr(f, b.codigo + i * 2, 4), whiteSpace: "pre" }}>{l}</div>)}
          </div>
        </div>
      ) : null}
      {/* tarjeta del repositorio hasta que entra el código */}
      <div style={{ ...entra(f, b.card, b.codigo - 2, 60) }}>
        <TarjetaRepo r={REPOS[1]} x={80} y={600} activa={1} />
        <Abs x={80} y={840}><Pildora tono="suave" size={30}>Apps Script desde tu equipo</Pildora></Abs>
      </div>
      {vis(f, b.codigo) > 0 ? <Abs x={80} y={1245} style={entra(f, b.codigo - 6, undefined, 14)}><Pildora tono="ui" size={28}>La IA prepara el código</Pildora></Abs> : null}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {xs.slice(0, 3).map((x, i) => <Conector key={i} a={[x + 80, Y]} b={[xs[i + 1] - 80, Y]} p={pr(f, nodos[i + 1][0] - 8, 8)} color={UI.ui} w={6} />)}
      </svg>
      {nodos.map(([at, el, label], i) =>
        f < at - 4 ? null : (
          <Abs key={label} x={xs[i] - 85} y={Y - 85} style={{ textAlign: "center", transform: `scale(${pop(f, at - 4)})` }}>
            <App size={170} style={{ boxShadow: f >= at ? `0 0 0 6px ${UI.ui300}, 0 24px 50px -18px rgba(0,87,255,.45)` : undefined }}>{el}</App>
            <Txt size={32} w={800} style={{ marginTop: 16 }}>{label}</Txt>
          </Abs>
        ),
      )}
    </>
  );
};

// ---------- ESC 8 · 03 n8n-MCP ----------
const Esc8: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  const nodos = [[b.gmail, <Gmail key="g" size={80} />, "Solicitud"], [b.sheets, <Sheets key="s" size={76} />, "Registro"], [b.borrador, <Borrador key="b" size={84} />, "Borrador"]] as const;
  const xs = [190, 510, 830];
  const Y = 1000;
  return (
    <>
      <Titular f={f} at={s.startFrame + 2} etiqueta="03 | n8n-MCP" partes={["Flujos ", { clave: "recurrentes" }]} size={104} />
      <div style={entra(f, b.card, undefined, 60)}><TarjetaRepo r={REPOS[2]} x={80} y={520} activa={f < b.gmail ? 1 : 0} atenuada={f >= b.gmail} /></div>
      {vis(f, b.aclara) > 0 ? (
        <Abs x={0} y={760} style={{ width: 1080, display: "flex", justifyContent: "center", ...entra(f, b.aclara, undefined, 14) }}>
          <Pildora tono="ink" size={34}>El MCP diseña <span style={{ color: P.yellow }}>·</span> n8n ejecuta</Pildora>
        </Abs>
      ) : null}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1].map((i) => (
          <g key={i}>
            <Conector a={[xs[i] + 95, Y]} b={[xs[i + 1] - 95, Y]} p={pr(f, nodos[i][0], 10)} color={f >= nodos[i + 1][0] ? UI.ui : "#C7CBD3"} w={6} curva={0} pulso={f >= nodos[i][0] && f < nodos[i + 1][0] ? ((f - nodos[i][0]) % 18) / 18 : undefined} />
          </g>
        ))}
      </svg>
      {nodos.map(([at, el, label], i) => {
        const on = f >= at;
        return vis(f, b.card + 6 + i * 3) <= 0 ? null : (
          <Abs key={label} x={xs[i] - 95} y={Y - 95} style={{ ...entra(f, b.card + 6 + i * 3, undefined, 30), textAlign: "center" }}>
            <div style={{ width: 190, height: 190, borderRadius: 44, background: "linear-gradient(180deg,#FFFFFF,#F3F4F7)", display: "grid", placeItems: "center", border: `4px solid ${on ? UI.ui : P.border}`, boxShadow: on ? "0 0 0 8px rgba(0,87,255,.15), 0 30px 60px -20px rgba(0,87,255,.5)" : "0 24px 50px -18px rgba(20,30,60,.3)", transform: `scale(${on ? 1 + 0.06 * Math.sin(Math.PI * pr(f, at, 10)) : 1})`, opacity: on ? 1 : 0.6 }}>{el}</div>
            <Txt size={32} w={800} c={on ? P.ink : P.ink2} style={{ marginTop: 16 }}>{label}</Txt>
          </Abs>
        );
      })}
    </>
  );
};

// ---------- ESC 9 · cierre (presentador) ----------
// Movimiento tomado de la referencia del usuario (material/referencias/referencia-comenta-seguir.mov; solo estilo):
//  - «comenta Google»: píldora oscura de comentario que baja con desenfoque, la palabra se escribe con caret y, al
//    enviarse, la cruza un barrido de luz;
//  - «sígueme»: el avatar entra en arco (se estira por la velocidad y se aplasta al aterrizar) y desde él se expande la
//    tarjeta de perfil (Motion UX `logo-expandir`). La tarjeta recrea la captura del perfil del usuario sin cifras; el
//    cursor pulsa «Seguir» (azul) → «Siguiendo». Foto: public/video-005/perfil-avatar.png (del propio usuario).
const AVATAR = "video-005/perfil-avatar.png";
const Avatar: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile(AVATAR)} style={{ width: size, height: size, borderRadius: 999, objectFit: "cover", display: "block", ...style }} />
);
const Campana: React.FC = () => (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></svg>
);
const Esc9: React.FC<Props> = ({ f, s }) => {
  const b = s.beats;
  // --- comentario ---
  const texto = "GOOGLE";
  const escritas = Math.round(texto.length * pr(f, b.comenta + 3, b.google - b.comenta - 5, (x) => x));
  const enviado = f >= b.google;
  const cIn = pr(f, b.comenta, 9), cOut = pr(f, b.sigueme - 4, 7);
  const barrido = interpolate(f, [b.google, b.google + 12], [-120, 120], clamp);
  // --- avatar en arco y tarjeta que se expande ---
  const CARD = { x: 90, y: 1060, w: 900, h: 304 };
  const A0 = { x: 30, y: 1720 }, A1 = { x: CARD.x + 36 + 65, y: CARD.y + 34 + 65 }, CTRL = { x: 40, y: 1060 };
  const vuelo = pr(f, b.sigueme, b.expande - b.sigueme, EASE.entradaSalida);
  const ax = (1 - vuelo) ** 2 * A0.x + 2 * (1 - vuelo) * vuelo * CTRL.x + vuelo ** 2 * A1.x;
  const ay = (1 - vuelo) ** 2 * A0.y + 2 * (1 - vuelo) * vuelo * CTRL.y + vuelo ** 2 * A1.y;
  const estira = Math.sin(Math.PI * vuelo); // velocidad aproximada
  const aplasta = f >= b.expande ? Math.sin(Math.PI * pr(f, b.expande, 6, (x) => x)) : 0;
  const sx = 1 - 0.18 * estira + 0.15 * aplasta, sy = 1 + 0.25 * estira - 0.12 * aplasta;
  const abre = pr(f, b.expande, 11);
  const contenido = (k: number) => { const t = pr(f, b.expande + 4 + k * 2, 9); return { opacity: t, filter: `blur(${(1 - t) * 10}px)`, transform: `translateX(${(1 - t) * -24}px)` }; };
  // --- cursor y clic en «Seguir» ---
  const BTN = { x: CARD.x + 36, y: CARD.y + 196, w: 380, h: 78 };
  const objetivo = { x: BTN.x + BTN.w * 0.8, y: BTN.y + BTN.h * 0.55 };
  const viaje = pr(f, b.expande + 6, b.clic - b.expande - 8, EASE.entradaSalida);
  const cur = { x: 980 + (objetivo.x - 980) * viaje, y: 1560 + (objetivo.y - 1560) * viaje };
  const pulsado = f >= b.clic && f < b.clic + 5;
  const sigue = f >= b.clic + 3;
  const anillo = pr(f, b.clic, 14);
  return (
    <>
      <RotuloPecho f={f} at={b.guia} exit={b.comenta - 6}>Guía: <span style={{ color: UI.ui }}>3 repositorios</span></RotuloPecho>
      {cIn > 0 && cOut < 1 ? (
        <Abs x={160} y={1090} style={{ width: 760, opacity: cIn * (1 - cOut), filter: `blur(${(1 - cIn) * 12 + cOut * 12}px)`, transform: `translateY(${(1 - cIn) * -50 - cOut * 60}px)` }}>
          <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 20, height: 108, padding: "0 30px 0 18px", borderRadius: 999, background: "rgba(23,23,29,0.94)", boxShadow: "0 30px 60px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08)" }}>
            <Avatar size={72} />
            <Txt size={50} w={800} c="#FFF" style={{ flex: 1, letterSpacing: "0.01em" }}>
              {texto.slice(0, escritas)}<span style={{ opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0, color: "#FFF", fontWeight: 400 }}>|</span>
            </Txt>
            <Txt size={26} w={700} c={enviado ? UI.ui300 : "#8B93A5"}>Comentar</Txt>
            {enviado ? <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 38%, rgba(255,214,150,.55) 50%, transparent 62%)", transform: `translateX(${barrido}%)`, mixBlendMode: "screen" }} /> : null}
          </div>
        </Abs>
      ) : null}
      {/* tarjeta de perfil: crece desde el avatar hacia la derecha */}
      {abre > 0 ? (
        <Abs x={CARD.x} y={CARD.y} style={{ width: CARD.w, height: CARD.h, clipPath: `inset(0 ${(1 - abre) * 72}% 0 0 round 44px)` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: "#FFFFFF", boxShadow: "0 40px 80px -24px rgba(0,0,0,.55)" }} />
          <div style={{ position: "absolute", left: 196, top: 48, ...contenido(0) }}><Txt size={40} w={800} style={{ letterSpacing: "-0.01em" }}>yeirodriguez.co</Txt></div>
          <div style={{ position: "absolute", right: 36, top: 30, display: "flex", gap: 26, alignItems: "center", ...contenido(0) }}>
            <Campana />
            <Txt size={40} w={900} style={{ letterSpacing: "0.05em", lineHeight: 0.6 }}>···</Txt>
          </div>
          <div style={{ position: "absolute", left: 196, top: 112, ...contenido(1) }}><Txt size={32} w={700}>Yeirodriguez | Estratega</Txt></div>
          <div style={{ position: "absolute", left: 36, top: 196, display: "flex", gap: 14, ...contenido(2) }}>
            <div style={{ width: BTN.w, height: BTN.h, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: sigue ? "#EFEFF2" : UI.ui, transform: `scale(${pulsado ? 0.96 : 1})`, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: sigue ? P.ink : "#FFF" }}>
              {sigue ? <>Siguiendo <svg width={24} height={24} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke={P.ink} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg></> : "Seguir"}
            </div>
            <div style={{ width: 350, height: BTN.h, borderRadius: 22, background: "#EFEFF2", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 32, color: P.ink }}>Mensaje</div>
            <div style={{ width: 92, height: BTN.h, borderRadius: 22, background: "#EFEFF2", display: "grid", placeItems: "center" }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill={P.ink}><circle cx={9} cy={8} r={4} /><path d="M2 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5z" /><path d="M19 8v6M16 11h6" stroke={P.ink} strokeWidth={2.4} strokeLinecap="round" /></svg>
            </div>
          </div>
        </Abs>
      ) : null}
      {/* avatar: vuela en arco y queda como foto de perfil de la tarjeta */}
      {vuelo > 0 ? (
        <Abs x={ax - 65} y={ay - 65} style={{ transform: `scale(${sx}, ${sy})`, filter: estira > 0.3 && vuelo < 1 ? `blur(${estira * 2}px)` : undefined }}>
          <Avatar size={130} style={{ boxShadow: "0 16px 30px -10px rgba(0,0,0,.5)" }} />
        </Abs>
      ) : null}
      {anillo > 0 && anillo < 1 ? <div style={{ position: "absolute", left: objetivo.x - 10 - 60 * anillo, top: objetivo.y - 10 - 60 * anillo, width: 20 + 120 * anillo, height: 20 + 120 * anillo, borderRadius: 999, border: `4px solid ${UI.ui300}`, opacity: 1 - anillo }} /> : null}
      <Cursor x={cur.x - 6} y={cur.y - 6} t={pr(f, b.expande + 4, 6)} pulsado={pulsado} />
    </>
  );
};

// ---------- cierre: tarjetas apiladas + usuario ----------
const Fin: React.FC<Props> = ({ f, s }) => (
  <>
    {REPOS.map((r, i) => (
      <div key={r.n} style={{ ...entra(f, s.startFrame + i * 4, undefined, 80), position: "absolute", inset: 0, transform: `${entra(f, s.startFrame + i * 4, undefined, 80).transform} rotate(${(i - 1) * -2.5}deg)`, transformOrigin: "540px 900px" }}>
        <TarjetaRepo r={r} x={80} y={560 + i * 215} activa={0} />
      </div>
    ))}
    <Abs x={0} y={1250} style={{ width: 1080, display: "flex", justifyContent: "center", gap: 18, ...entra(f, s.startFrame + 14, undefined, 20) }}>
      <Pildora tono="resalte" size={36}>Comenta GOOGLE</Pildora>
      <Pildora tono="suave" size={36}>@yeirodriguez.co</Pildora>
    </Abs>
  </>
);

export const ESCENAS: Record<string, React.FC<Props>> = { gancho: Esc1, conectar: Esc2, casos: Esc3, repos: Esc4, puente: Esc5, "flujo-demo": Esc5b, cli: Esc6, clasp: Esc7, n8n: Esc8, cierre: Esc9, "tarjetas-finales": Fin };
export { fin };
