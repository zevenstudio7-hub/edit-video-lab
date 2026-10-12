import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Bars, bob, camera, Card, Checkbox, Connector, Cursor, enterStyle, FeedPost, FONT, Icon, Ilustrativo, inT, Label, Logo, LogoCard, outT, P, Phone, press, pulse, ramp, Reticle, shadow, Status } from "./ui";
import { anchorY, BandCard, BandNote, EDGE, Stage } from "./band";
import { Icon3D } from "./icons3d";
import { PuffyAvatar, PuffyCheck, PuffyChip } from "./relief";

// Escenas de VIDEO-002. Cada una recibe sus beats en frames locales (anclados a palabras de la narración; ver
// video-orders/VIDEO-002.json → edl.escenas) y su duración. Las de modo «presentador» solo pintan lo que va junto a él
// (sin tapar el rostro: posiciones medidas sobre las tomas); las de «motion» ocupan la pantalla mientras la voz sigue.
// Motion (preview v3): todo vive sobre la franja negra (band.tsx). Área de las escenas: x 65–1015, y 250–1180; la
// franja empieza en y = 1180 y lleva los subtítulos; nada a la derecha de x = 940 por debajo de y = 1000. Los objetos
// se apoyan en el borde de la franja y las tarjetas oscuras nacen de ella. Los acercamientos de cámara usan
// anchorY(s) para que el borde no se mueva. Iconos: 3D propios (icons3d.tsx) y relieve SVG (relief.tsx).
// Marca del usuario en las cuentas y perfiles de redes: @yeirodriguez.co (pedido del 2026-10-05).

export interface SceneProps { b: Record<string, number>; dur: number }
const HANDLE = "@yeirodriguez.co";
const W1 = "rgba(255,255,255,0.08)";

// ---------- presentador ----------

/** p1 · «Durante mucho tiempo… solo se trataban de entretenimiento»: teléfono con un feed junto a la cabeza. */
const Apertura: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const t = inT(f, b.telefono, 12);
  const grow = ramp(f, b.entretenimiento, b.entretenimiento + 10);
  const w = 270, h = 560, postW = w - 34, step = postW * 1.12 + 10;
  const scroll = (ramp(f, b.entretenimiento, b.entretenimiento + 10) + ramp(f, b.scroll2, b.scroll2 + 10)) * step;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 66, top: 320, width: w, height: h, opacity: t, transformOrigin: "0% 50%", transform: `translate(${(1 - t) * -50}px, ${bob(f, 0, 3)}px) scale(${(0.96 + 0.04 * t) * (1 + 0.1 * grow)})` }}>
        <Phone x={0} y={0} w={w} h={h}>
          <div style={{ position: "absolute", left: 8, top: 36 - scroll, display: "flex", flexDirection: "column", gap: 10 }}>
            <FeedPost w={postW} video tint="yellow" liked={ramp(f, b.feed, b.feed + 8)} />
            <FeedPost w={postW} tint="blue" />
            <FeedPost w={postW} video tint="cream" liked={ramp(f, b.scroll2 + 4, b.scroll2 + 12)} />
            <FeedPost w={postW} tint="yellow" />
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

/** p3 · «¿Y qué significa esto realmente para tu negocio?»: tienda 3D junto a la cabeza. */
const Pregunta: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 790, top: 390 + bob(f, 1, 3), ...enterStyle(f, b.negocio - 2, { dy: 20 }) }}>
        <Card x={0} y={0} w={210} h={210} style={{ display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pulse(f, b.negocio + 12)})` }}>
          <Icon3D name="store" size={200} f={f} at={b.negocio} dur={16} contact={false} />
        </Card>
      </div>
    </AbsoluteFill>
  );
};

/** p4 · «automatizar procesos y generar oportunidades de negocio. ¿En qué lado estás tú?» */
const Cierre: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const exit = b.pregunta;
  return (
    <AbsoluteFill>
      <div style={{ ...enterStyle(f, b.automatizar - 4, { exit, dy: 12 }), position: "absolute", left: 0, top: 0 }}><Ilustrativo x={790} y={286} size={18} /></div>
      <div style={{ position: "absolute", left: 830, top: 336 + bob(f, 0, 3), ...enterStyle(f, b.automatizar, { exit, dx: 30, dy: 0 }) }}>
        <Card x={0} y={0} w={184} h={190} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" }}>
          {[6, 14].map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Checkbox t={ramp(f, b.automatizar + d, b.automatizar + d + 5)} size={44} />
              <Bars widths={[76]} h={14} />
            </div>
          ))}
        </Card>
      </div>
      <div style={{ position: "absolute", left: 830, top: 546 + bob(f, 1.3, 3), ...enterStyle(f, b.generar, { exit, dx: 30, dy: 0 }) }}>
        <Card x={0} y={0} w={184} h={226} style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxSizing: "border-box", transform: `scale(${pulse(f, b.generar + 12)})` }}>
          <PuffyAvatar size={78} tone="yellow" />
          <Bars widths={[120, 80]} h={12} gap={8} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 23, color: P.ink, background: P.yellowSoft, border: `1.5px solid ${P.yellow}`, borderRadius: 999, padding: "5px 14px" }}>Interesado</div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------- motion a pantalla completa ----------

/** Fila de módulo dentro de una tarjeta oscura. */
const DarkRow: React.FC<{ y: number; at: number; f: number; active?: number; icon: React.ReactNode; label: string }> = ({ y, at, f, active = 0, icon, label }) => (
  <div style={{ position: "absolute", left: 40, top: y, width: 800, height: 220, ...enterStyle(f, at, { dy: 30 }) }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 30, background: active > 0.5 ? "#302A12" : "#24242D", border: `3px solid ${active > 0.5 ? P.yellow : W1}`, display: "flex", alignItems: "center", gap: 30, padding: "0 36px", boxSizing: "border-box" }}>
      <div style={{ width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Label size={58} weight={900} color="#FFFFFF">{label}</Label>
        <Bars widths={[300, 200]} h={16} gap={12} color="rgba(255,255,255,0.14)" />
      </div>
    </div>
  </div>
);

/** m1 · «el paso del tiempo y el avance de la tecnología… algo totalmente diferente». El feed de entretenimiento,
 *  apoyado en la franja, se hunde en ella y de la franja sale la tarjeta oscura de trabajo. */
const TiempoTecnologia: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const sinkPhone = ramp(f, b.avance - 2, b.avance + 10);
  const card = ramp(f, b.avance, b.avance + 14);
  const link = ramp(f, b.conecta, b.conecta + 12);
  const done = ramp(f, b.diferente, b.diferente + 8);
  const postW = 380, step = postW * 1.12 + 12, scroll = (f * 11) % (step * 3);
  const cam = camera(f, [[0, 1, 540, 690], [b.foco, 1, 540, 690], [b.foco + 14, 1.08, 540, anchorY(1.08)]]);
  const rows = [{ at: b.avance + 6, y: 150 }, { at: b.datos, y: 400 }, { at: b.tarea, y: 650 }];
  return (
    <Stage cam={cam}>
      <div style={{ position: "absolute", left: 300, top: EDGE - 870 + sinkPhone * 920 }}>
        <Phone x={0} y={0} w={420} h={870}>
          <div style={{ position: "absolute", left: 14, top: 50 - scroll, display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => <FeedPost key={i} w={postW} video={i % 2 === 0} tint={(["yellow", "blue", "cream"] as const)[i % 3]} />)}
          </div>
        </Phone>
      </div>
      <div style={{ position: "absolute", left: 738, top: 300 + bob(f, 0.4, 4), opacity: outT(f, b.avance - 4, 8) }}>
        <Icon3D name="clock" size={290} f={f} at={b.tiempo} dur={18} />
      </div>
      <BandCard x={90} y={262} w={900} t={card}>
        <DarkRow y={rows[0].y} at={rows[0].at} f={f} label="Contenido" icon={<Icon3D name="play" size={170} f={f} at={rows[0].at} dur={16} contact={false} />} />
        <DarkRow y={rows[1].y} at={rows[1].at} f={f} label="Datos" icon={<Icon3D name="chart" size={170} f={f} at={rows[1].at} dur={22} contact={false} />} />
        <DarkRow y={rows[2].y} at={rows[2].at} f={f} label="Tarea" active={done} icon={<div style={{ transform: `scale(${pulse(f, b.diferente)})` }}><Checkbox t={done} size={96} /></div>} />
        {[0, 1].map((k) => (
          <svg key={k} style={{ position: "absolute", left: 0, top: 0 }} width={900} height={1000}>
            <line x1={165} y1={rows[k].y + 220} x2={165} y2={rows[k].y + 220 + (rows[k + 1].y - rows[k].y - 220) * link} stroke={P.blue} strokeWidth={8} strokeLinecap="round" />
          </svg>
        ))}
      </BandCard>
    </Stage>
  );
};

/** m2 · «Facebook, Instagram, TikTok, sí compiten por entretenerte… tu atención». */
const PlataformasAtencion: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const group = ramp(f, b.compiten, b.compiten + 12);
  const phone = inT(f, b.compiten + 2, 12);
  const dim = ramp(f, b.importante, b.importante + 10);
  const snap = ramp(f, b.atencion - 2, b.atencion + 8);
  const cam = camera(f, [[0, 1, 540, 690], [b.compiten + 12, 1, 540, 690], [b.compiten + 26, 1.04, 540, anchorY(1.04)], [b.atencion - 2, 1.04, 540, anchorY(1.04)], [b.atencion + 12, 1.16, 540, anchorY(1.16)]]);
  const PH = { x: 340, y: EDGE - 820, w: 400, h: 820 }, frame = 400 * 0.035;
  const brands = [{ brand: "facebook" as const, at: b.facebook, x: 70 }, { brand: "instagram" as const, at: b.instagram, x: 395 }, { brand: "tiktok" as const, at: b.tiktok, x: 720 }];
  const notes = [{ x: 70, y: 500, at: b.porque + 6 }, { x: 710, y: 550, at: b.captura - 2 }, { x: 70, y: 830, at: b.captura + 8 }, { x: 690, y: 860, at: b.captura + 16 }];
  const iconSize = 96, rowGap = (PH.w - 2 * frame - 2 * 30 - 3 * iconSize) / 2;
  const eye = 236, eyeX = PH.x + frame + (PH.w - 2 * frame - eye) / 2, eyeY = PH.y + frame + 280;
  return (
    <Stage cam={cam}>
      <div style={{ position: "absolute", left: PH.x, top: PH.y, opacity: phone, transform: `translateY(${(1 - phone) * 40}px) scale(${0.96 + 0.04 * phone})` }}>
        <Phone x={0} y={0} w={PH.w} h={PH.h}>
          <div style={{ position: "absolute", left: 30, right: 30, top: 74, display: "flex", justifyContent: "space-between", opacity: ramp(f, b.compiten + 8, b.compiten + 12) }}>
            {brands.map((x) => <div key={x.brand} style={{ width: iconSize, height: iconSize, borderRadius: 26, background: P.card, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(23,23,29,0.08)" }}><Logo brand={x.brand} size={62} /></div>)}
          </div>
          <div style={{ position: "absolute", left: 18, top: 210, opacity: 1 - 0.6 * dim }}><FeedPost w={PH.w - 2 * frame - 36} video tint="yellow" /></div>
        </Phone>
      </div>
      {/* «tu atención»: el ojo 3D aparece en el centro del teléfono */}
      <div style={{ position: "absolute", left: eyeX, top: eyeY }}>
        <Icon3D name="eye" size={eye} f={f} at={b.atencion - 2} dur={12} />
      </div>
      {brands.map((x, i) => {
        // la tarjeta vuela a su icono dentro del teléfono (fila de iconos: margen 30, arriba 74)
        const iconLeft = PH.x + frame + 30 + i * (iconSize + rowGap), iconTop = PH.y + frame + 74;
        const tx = iconLeft - x.x, ty = iconTop - 300, sc = 1 - (1 - iconSize / 290) * group;
        const t = inT(f, x.at, 10);
        return (
          <div key={x.brand} style={{ position: "absolute", left: x.x, top: 300 + bob(f, i, 3) * (1 - group), opacity: (1 - ramp(f, b.compiten + 9, b.compiten + 12)) * t, transformOrigin: "0 0", transform: `translate(${tx * group}px, ${ty * group + (1 - t) * 26}px) scale(${sc * (0.96 + 0.04 * t)})` }}>
            <LogoCard brand={x.brand} x={0} y={0} w={290} h={290} />
          </div>
        );
      })}
      {notes.map((n, i) => (
        <div key={i} style={{ position: "absolute", left: n.x, top: n.y + bob(f, i * 1.7, 3), opacity: inT(f, n.at, 8) * (1 - 0.75 * dim), filter: `blur(${2 * dim}px)`, transform: `scale(${0.96 + 0.04 * inT(f, n.at, 8)})` }}>
          <Card x={0} y={0} w={300} h={116} r={30} style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 22px", boxSizing: "border-box" }}>
            <div style={{ position: "relative", width: 70, height: 70, borderRadius: 20, background: P.bgBlue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={(["heart", "comment", "share", "play"] as const)[i]} size={42} />
              <div style={{ position: "absolute", right: -6, top: -6, width: 24, height: 24, borderRadius: 999, background: P.red, border: "3px solid #fff" }} />
            </div>
            <Bars widths={[150, 96]} h={14} gap={11} />
          </Card>
        </div>
      ))}
      <Reticle x={360 + (eyeX - 14 - 360) * snap} y={PH.y + 160 + (eyeY - 14 - PH.y - 160) * snap} w={360 + (eye + 28 - 360) * snap} h={520 + (eye + 28 - 520) * snap} opacity={ramp(f, b.importante, b.importante + 8)} thick={9} />
    </Stage>
  );
};

/** m3 · «concentra la atención de millones de personas… audiencia». */
const Audiencias: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const spread = ramp(f, b.millones, b.millones + 20);
  const organize = ramp(f, b.tiene, b.tiene + 18);
  const box = ramp(f, b.audiencia - 2, b.audiencia + 14);
  const cam = camera(f, [[0, 1.2, 540, 700], [b.millones, 1.2, 540, 700], [b.valioso, 1, 540, 690]]);
  const rings = [{ r: 170, n: 6 }, { r: 300, n: 12 }, { r: 430, n: 18 }];
  const clusters = [{ x: 300, y: 520 }, { x: 780, y: 520 }, { x: 540, y: 900 }];
  const people = rings.flatMap((ring, ri) => Array.from({ length: ring.n }, (_, k) => ({ ri, a: (2 * Math.PI * k) / ring.n + ri * 0.3, r: ring.r })));
  return (
    <Stage cam={cam}>
      {[0, 1, 2].map((k) => { const ph = (((f - b.concentra - k * 9) % 36) + 36) % 36 / 36; const on = f >= b.concentra + k * 9 && f < b.millones + 10; return on ? <div key={k} style={{ position: "absolute", left: 540 - 50 - ph * 150, top: 700 - 50 - ph * 150, width: 100 + ph * 300, height: 100 + ph * 300, borderRadius: 999, border: `5px solid ${P.yellow}`, opacity: 1 - ph }} /> : null; })}
      <div style={{ position: "absolute", left: 540 - 44, top: 700 - 44, width: 88, height: 88, borderRadius: 999, background: P.yellow, boxShadow: `0 0 0 14px ${P.yellowSoft}`, opacity: 1 - spread }} />
      {people.map((q, i) => {
        const c = clusters[i % 3], local = Math.floor(i / 3), ang = local * 2.399, rad = 34 * Math.sqrt(local + 0.5) * 1.9;
        const x0 = 540 + Math.cos(q.a) * q.r, y0 = 700 + Math.sin(q.a) * q.r * 0.8;
        const x1 = c.x + Math.cos(ang) * rad, y1 = c.y + Math.sin(ang) * rad * 0.9;
        const appear = ramp(f, b.millones + q.ri * 4 + (i % 6), b.millones + q.ri * 4 + (i % 6) + 8);
        const x = 540 + (x0 - 540) * appear + (x1 - x0) * organize, y = 700 + (y0 - 700) * appear + (y1 - y0) * organize;
        return <div key={i} style={{ position: "absolute", left: x - 42, top: y - 42, opacity: appear, transform: `scale(${0.4 + 0.6 * appear})` }}><PuffyAvatar size={84} tone={(["ink", "blue", "yellow"] as const)[i % 3]} /></div>;
      })}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <rect x={80} y={300} width={850} height={840} rx={70} fill="none" stroke={P.yellow} strokeWidth={8} strokeDasharray={3400} strokeDashoffset={3400 * (1 - box)} />
      </svg>
      {/* «audiencia»: el grupo 3D se posa en la esquina del recuadro */}
      <div style={{ position: "absolute", left: 92, top: 222 }}>
        <Icon3D name="people" size={200} f={f} at={b.audiencia + 4} dur={18} />
      </div>
    </Stage>
  );
};

/** m4 · «Meta acaba de lanzar Muse for Small Business»: captura verificada del anuncio y acercamiento al nombre. */
const Anuncio: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const k = 840 / 780, x0 = 540 - (500 * k) / 2, y0 = 250;
  const cam = camera(f, [[0, 1, 540, 690], [b.muse, 1, 540, 690], [b.muse + 18, 1.3, x0 + 190 * k, y0 + 600 * k]]);
  const mark = ramp(f, b.business, b.business + 12);
  return (
    <Stage cam={cam} fixed={<BandNote>Captura de about.fb.com · Meta, 29 sep 2026</BandNote>}>
      <div style={{ position: "absolute", left: x0, top: y0, width: 500 * k, height: 780 * k, borderRadius: 28, overflow: "hidden", boxShadow: shadow, border: `2px solid ${P.border}` }}>
        <Img src={staticFile("video-002/support/meta-anuncio-titulo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 33 * k, top: 698 * k, width: 300 * k * mark, height: 9 * k, borderRadius: 999, background: P.yellow, opacity: 0.9 }} />
      </div>
    </Stage>
  );
};

/** Imagen oficial del anuncio (Meta, about.fb.com, 29 sep 2026): logotipo «Muse», la mascota Jolly y los conectores.
 *  Se muestra COMPLETA y sin alterar (las condiciones de Meta para sus medios no permiten modificarlos): solo se escala,
 *  con margen blanco para que el redondeo de la tarjeta no la recorte, y con la fuente visible. Derechos: requiere_revision. */
const OFICIAL = staticFile("video-002/support/meta-muse-oficial.png");
const MuseOficial: React.FC<{ cx: number; top: number; w: number; t: number; f: number; at: number }> = ({ cx, top, w, t, f, at }) => {
  const pad = Math.max(8, w * 0.018), h = (w * 9) / 16;
  return (
    <div style={{ position: "absolute", left: cx - w / 2 - pad, top, opacity: t, transform: `translateY(${(1 - t) * 24}px) scale(${(0.96 + 0.04 * t) * pulse(f, at + 10)})` }}>
      <div style={{ width: w + 2 * pad, background: P.card, borderRadius: 22 + pad, border: `2px solid ${P.border}`, boxShadow: shadow, padding: pad, boxSizing: "border-box" }}>
        <Img src={OFICIAL} style={{ width: w, height: h, display: "block" }} />
        <div style={{ fontFamily: FONT, fontSize: Math.max(18, w * 0.042), fontWeight: 700, color: P.ink2, padding: `${pad * 0.8}px 2px 0` }}>Imagen oficial de Meta · about.fb.com</div>
      </div>
    </div>
  );
};

/** m5 · «Es una inteligencia artificial… ejecutar tareas utilizando la información y las herramientas… conectadas». */
const Sistema: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const cam = camera(f, [[0, 1, 540, 690], [b.tareas, 1, 540, 690], [b.tareas + 12, 1.07, 640, anchorY(1.07)], [b.info, 1.07, 640, anchorY(1.07)], [b.info + 12, 1, 540, 690]]);
  const ready = (i: number) => ramp(f, b.conectadas + i * 5, b.conectadas + i * 5 + 8);
  const glow = ramp(f, b.conectadas, b.conectadas + 6) * (1 - ramp(f, b.conectadas + 14, b.conectadas + 26));
  return (
    // «Ejemplo ilustrativo» solo cuando empieza el diagrama conceptual (la imagen oficial de Muse no es ilustrativa)
    <Stage cam={cam} fixed={<div style={enterStyle(f, b.negocios, { dy: 10 })}><Ilustrativo x={65} y={256} size={26} /></div>}>
      <Connector x1={540} y1={470} x2={540} y2={490} t={ramp(f, b.negocios + 4, b.negocios + 12)} glow={glow} width={7} />
      <Connector x1={660} y1={798} x2={700} y2={830} t={ramp(f, b.tareas + 4, b.tareas + 12)} glow={glow} width={7} />
      <Connector x1={430} y1={850} x2={430} y2={798} t={ramp(f, b.info + 4, b.info + 12)} glow={glow} width={7} />
      <Connector x1={482} y1={1030} x2={492} y2={798} t={ramp(f, b.herramientas + 4, b.herramientas + 14)} glow={glow} width={7} />
      {/* «Es una inteligencia artificial…»: Muse se presenta con su imagen oficial y se reduce hasta el centro del sistema */}
      <MuseOficial cx={540} top={490 - 120 * (1 - ramp(f, b.negocios - 8, b.negocios + 4))} w={460 + 300 * (1 - ramp(f, b.negocios - 8, b.negocios + 4))} t={inT(f, b.ia, 10)} f={f} at={b.ia} />
      <div style={{ position: "absolute", left: 340, top: 290 + bob(f, 0.5), ...enterStyle(f, b.negocios) }}>
        <Card x={0} y={0} w={400} h={180} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon3D name="store" size={170} f={f} at={b.negocios} dur={16} contact={false} />
          <Label size={46}>Negocio</Label>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 500, top: 830 + bob(f, 1.1), ...enterStyle(f, b.tareas) }}>
        <Card x={0} y={0} w={430} h={320} style={{ padding: "24px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22 }}>
          <Label size={40} weight={900}>Tareas</Label>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Checkbox t={ready(i)} size={44} />
              <div style={{ flex: 1 }}><Bars widths={[70]} h={14} /></div>
              <Status done={ready(i)} size={24} />
            </div>
          ))}
        </Card>
      </div>
      <div style={{ position: "absolute", left: 70, top: 850 + bob(f, 2.1), ...enterStyle(f, b.info, { dx: -30, dy: 0 }) }}>
        <Card x={0} y={0} w={400} h={150} style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 20px 0 6px", boxSizing: "border-box" }}>
          <Icon3D name="chart" size={150} f={f} at={b.info} dur={22} contact={false} /><Label size={38}>Información</Label>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 70, top: EDGE - 150, ...enterStyle(f, b.herramientas, { dx: -30, dy: 0 }) }}>
        <Card x={0} y={0} w={400} h={150} style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 26px", boxSizing: "border-box" }}>
          <Icon name="calendar" size={58} /><Icon name="cart" size={58} /><Icon name="mail" size={58} /><Label size={36}>Herramientas</Label>
        </Card>
      </div>
    </Stage>
  );
};

/** m6 · «Por ejemplo, puedes darle un objetivo como “ayúdame a buscar nuevos clientes”»: la ventana oscura de Muse
 *  nace de la franja (con la cuenta del usuario) y, al enviar, la lupa 3D sale a buscar. */
const GOAL = "Ayúdame a buscar nuevos clientes";
const Objetivo: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const typed = Math.round(GOAL.length * ramp(f, b.tecleo, b.fin - 4));
  const sent = f >= b.fin;
  const cx = cursorPath(f, b);
  const cam = camera(f, [[0, 1, 540, 690], [b.objetivo, 1, 540, 690], [b.objetivo + 12, 1.12, 520, 1060], [b.fin, 1.12, 520, 1060], [b.fin + 12, 1.02, 540, 720]]);
  const focused = f >= b.objetivo + 14 && !sent;
  return (
    <Stage cam={cam} fixed={<div style={enterStyle(f, b.ejemplo, { dy: 10 })}><Ilustrativo x={65} y={256} size={26} /></div>} front={<Cursor x={cx.x} y={cx.y} opacity={cx.o} scale={1.3 * press(f, b.objetivo + 14) * press(f, b.fin)} />}>
      <BandCard x={80} y={300} w={920} t={ramp(f, b.ejemplo - 6, b.ejemplo + 8)}>
        <div style={{ position: "absolute", left: 40, top: 70, display: "flex", alignItems: "center", gap: 14 }}>
          <Logo brand="meta" size={46} />
          <Label size={46} weight={900} color="#FFFFFF">Muse</Label>
          <Label size={30} weight={700} color="rgba(255,255,255,0.55)" style={{ marginLeft: 6 }}>· {HANDLE}</Label>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, height: 2, background: W1 }} />
        {sent ? (
          <div style={{ position: "absolute", right: 40, top: 200, maxWidth: 640, ...enterStyle(f, b.fin, { dy: 16 }), background: P.yellowSoft, border: `2px solid ${P.yellow}`, borderRadius: "30px 30px 10px 30px", padding: "24px 30px" }}>
            <Label size={44} weight={800}>{GOAL}</Label>
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 40, top: 440, display: "flex", alignItems: "center", gap: 18, ...enterStyle(f, b.fin + 8, { dy: 12 }) }}>
          <svg width={56} height={56} viewBox="0 0 44 44" style={{ transform: `rotate(${f * 14}deg)` }}><circle cx={22} cy={22} r={17} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={6} /><path d="M22 5a17 17 0 0 1 17 17" fill="none" stroke={P.blue} strokeWidth={6} strokeLinecap="round" /></svg>
          <Label size={42} weight={700} color="rgba(255,255,255,0.72)">Buscando clientes…</Label>
        </div>
        <div style={{ position: "absolute", left: 600, top: 380 }}>
          <Icon3D name="magnifier" size={250} f={f} at={b.fin + 12} dur={18} contact={false} />
        </div>
        <div style={{ position: "absolute", left: 36, right: 64, top: 700, height: 120, borderRadius: 36, background: "#24242D", border: `3px solid ${focused ? P.yellow : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", padding: "0 126px 0 30px", boxSizing: "border-box" }}>
          <Label size={38} weight={typed && !sent ? 800 : 600} color={typed && !sent ? "#FFFFFF" : "rgba(255,255,255,0.45)"}>{sent || !typed ? "Escribe un objetivo…" : GOAL.slice(0, typed)}{focused && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: "#FFFFFF" }}>|</span> : null}</Label>
          <div style={{ position: "absolute", right: 18, width: 86, height: 86, borderRadius: 999, background: P.yellow, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press(f, b.fin)})` }}><Icon name="send" size={44} /></div>
        </div>
      </BandCard>
    </Stage>
  );
};
// campo: x 116–936, y 1000–1120 (centro 1060); botón de enviar centrado en (875, 1060), dentro del área segura
const cursorPath = (f: number, b: Record<string, number>) => {
  const o = inT(f, b.objetivo, 6) * outT(f, b.fin + 16, 8);
  const toField = ramp(f, b.objetivo, b.objetivo + 12), toSend = ramp(f, b.fin - 10, b.fin - 1);
  return { x: 900 + (430 - 900) * toField + (875 - 430) * toSend, y: 1140 + (1064 - 1140) * toField, o };
};

/** m7 · «Y Muse puede trabajar con tus cuentas de Facebook e Instagram y conectarse con herramientas como Shopify, Canva, Notion, etcétera». */
const Herramientas: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const done = ramp(f, b.etc + 4, b.etc + 12) * (1 - ramp(f, b.etc + 20, b.etc + 30));
  const tools = [{ brand: "shopify" as const, at: b.shopify, x: 75 }, { brand: "canva" as const, at: b.canva, x: 352 }, { brand: "notion" as const, at: b.notion, x: 629 }];
  const TY = EDGE - 180;
  return (
    <Stage fixed={<div style={enterStyle(f, b.herramientas, { dy: 8 })}><BandNote>Nota: Muse está disponible en EE. UU. y Canadá · Fuente: Meta, 29 sep 2026</BandNote></div>}>
      <Connector x1={285} y1={520} x2={420} y2={577} t={ramp(f, b.facebook + 4, b.facebook + 14)} glow={done} width={7} />
      <Connector x1={795} y1={520} x2={660} y2={577} t={ramp(f, b.instagram + 4, b.instagram + 14)} glow={done} width={7} />
      {tools.map((x) => <Connector key={x.brand} x1={x.x + 120} y1={TY} x2={540 + (x.x - 352) * 0.3} y2={846} t={ramp(f, x.at + 4, x.at + 12)} glow={done} width={7} />)}
      <MuseOficial cx={540} top={575} w={400} t={inT(f, 0, 8)} f={f} at={-20} />
      {[{ brand: "facebook" as const, at: b.facebook, x: 70 }, { brand: "instagram" as const, at: b.instagram, x: 580 }].map((a, i) => (
        <div key={a.brand} style={{ position: "absolute", left: a.x, top: 340 + bob(f, i), ...enterStyle(f, a.at) }}>
          <Card x={0} y={0} w={430} h={180} style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 26px", boxSizing: "border-box" }}>
            <Logo brand={a.brand} size={100} />
            <div><Label size={42} weight={900}>{a.brand === "facebook" ? "Facebook" : "Instagram"}</Label><Label size={27} weight={800} color={P.blue}>{HANDLE}</Label></div>
          </Card>
        </div>
      ))}
      {tools.map((x) => (
        <div key={x.brand} style={{ position: "absolute", left: x.x, top: TY, ...enterStyle(f, x.at, { dy: 40 }) }}>
          <LogoCard brand={x.brand} x={0} y={0} w={240} h={180} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 878, top: TY + 59, ...enterStyle(f, b.etc) }}>
        <Card x={0} y={0} w={62} h={62} r={31} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Label size={48} weight={900}>+</Label></Card>
      </div>
    </Stage>
  );
};

/** m8 · «mira hacia dónde va toda esta evolución. Tienes contenido, audiencia, ejecución y sobre todo ventas». Las
 *  cuatro tarjetas forman una cuadrícula apoyada en la franja; cada una se enciende con su icono 3D. */
const Evolucion: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const R1 = EDGE - 315 - 395, R2 = EDGE - 315;
  const cards = [
    { at: b.contenido, x: 65, y: R1, label: "Contenido", icon: "play" as const },
    { at: b.audiencia, x: 520, y: R1, label: "Audiencia", icon: "people" as const },
    { at: b.ejecucion, x: 65, y: R2, label: "Ejecución", icon: "target" as const },
    { at: b.ventas, x: 520, y: R2, label: "Ventas", icon: "cart" as const },
  ];
  // cámara anclada a la franja: se acerca levemente hacia la tarjeta activa (30 % en horizontal)
  const tx = (i: number) => 540 + (cards[i].x + 210 - 540) * 0.3;
  const key = (fr: number, s: number, x = 540): [number, number, number, number] => [fr, s, x, anchorY(s)];
  const cam = camera(f, [key(0, 1.06), key(b.mira, 1.06), key(b.mira + 18, 1), key(b.contenido, 1), key(b.contenido + 8, 1.04, tx(0)), key(b.audiencia, 1.04, tx(0)), key(b.audiencia + 8, 1.04, tx(1)), key(b.ejecucion, 1.04, tx(1)), key(b.ejecucion + 8, 1.04, tx(2)), key(b.ventas, 1.04, tx(2)), key(b.ventas + 8, 1.07, tx(3)), key(b.ventas + 26, 1)]);
  const arrows = [[485, R1 + 157, 520, R1 + 157], [575, R1 + 315, 440, R2], [485, R2 + 157, 520, R2 + 157]] as const;
  return (
    <Stage cam={cam}>
      {arrows.map((a, i) => <Connector key={i} x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} t={ramp(f, cards[i + 1].at - 6, cards[i + 1].at + 4)} color={i === 2 ? P.yellow : P.blue} width={8} />)}
      {cards.map((k, i) => {
        const on = inT(f, k.at, 10), last = i === 3;
        return (
          <div key={i} style={{ position: "absolute", left: k.x, top: k.y, opacity: inT(f, i * 2, 8) }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 420, height: 315, borderRadius: 32, border: `4px dashed ${P.ink2}`, opacity: 0.4 * (1 - on), boxSizing: "border-box" }} />
            <div style={{ opacity: on, transform: `scale(${(0.96 + 0.04 * on) * pulse(f, k.at, last ? 1.09 : 1.06)})` }}>
              <Card x={0} y={0} w={420} h={315} active={last && on > 0.5} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, background: last ? P.yellowSoft : P.card, overflow: "visible" }}>
                <div style={{ position: "relative", marginTop: -14 }}>
                  <Icon3D name={k.icon} size={210} f={f} at={k.at} dur={18} contact={false} />
                  {last ? <PuffyCheck size={70} style={{ position: "absolute", right: -12, top: 16, transform: `scale(${inT(f, k.at + 12, 10)})` }} /> : null}
                </div>
                <Label size={56} weight={900} style={{ marginTop: -18 }}>{k.label}</Label>
              </Card>
            </div>
          </div>
        );
      })}
    </Stage>
  );
};

/** m9 · «cada vez habrá menos distancia entre tener algo que vender y encontrar a quien vendérselo». */
const Distancia: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const near = ramp(f, b.menos, b.menos + 16);
  const link = ramp(f, b.vendérselo - 2, b.vendérselo + 10);
  const cam = camera(f, [[0, 1, 540, 690], [b.vendérselo, 1, 540, 690], [b.vendérselo + 14, 1.06, 540, anchorY(1.06)]]);
  const W = 270, H = 360, px = 65 + 50 * near, bx = 670 - 50 * near, y = EDGE - H, lineY = y + 175;
  const mids: ("play" | "people" | "target")[] = ["play", "people", "target"];
  // el hueco (335 → 235 px) se reparte en tres: las fichas pasan de 100 a 72 px y quedan como una cadena
  const spacing = (bx - (px + W)) / 3, chip = 100 - 28 * near;
  const midX = (i: number) => 540 + (i - 1) * spacing;
  return (
    <Stage cam={cam}>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <line x1={px + W} y1={lineY} x2={bx} y2={lineY} stroke={P.ink2} strokeOpacity={0.5 * (1 - link)} strokeWidth={6} strokeDasharray="2 18" strokeLinecap="round" />
        <line x1={px + W} y1={lineY} x2={px + W + (bx - px - W) * link} y2={lineY} stroke={P.blue} strokeWidth={10} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: px, top: y + bob(f, 0, 2) * 0, ...enterStyle(f, 0) }}>
        <Card x={0} y={0} w={W} h={H} active={f >= b.vender && f < b.vendérselo + 20} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, transform: `scale(${pulse(f, b.vender)})`, overflow: "visible" }}>
          <Icon3D name="box" size={220} f={f} at={2} dur={18} contact={false} />
          <Label size={44} weight={900} style={{ marginTop: -10 }}>Producto</Label>
        </Card>
      </div>
      <div style={{ position: "absolute", left: bx, top: y, ...enterStyle(f, 4) }}>
        <Card x={0} y={0} w={W} h={H} active={f >= b.encontrar && f < b.vendérselo + 20} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, transform: `scale(${pulse(f, b.encontrar)})`, overflow: "visible" }}>
          <Icon3D name="people" size={220} f={f} at={6} dur={18} contact={false} />
          <Label size={40} weight={900} style={{ marginTop: -10 }}>Compradores</Label>
        </Card>
      </div>
      {mids.map((m, i) => (
        <div key={m} style={{ position: "absolute", left: midX(i) - chip / 2, top: lineY - chip / 2, ...enterStyle(f, 8 + i * 4, { dy: 14 }) }}>
          <PuffyChip size={chip} ring={link > 0.5 ? P.blue : "#E4E1DA"}><Icon name={m} size={chip * 0.5} /></PuffyChip>
        </div>
      ))}
      <div style={{ position: "absolute", left: 540 - 64, top: y - 190, transform: `scale(${inT(f, b.vendérselo + 6, 10) * pulse(f, b.vendérselo + 14)})` }}>
        <PuffyCheck size={128} />
      </div>
    </Stage>
  );
};

/** m10 · «mientras muchos… consumir entretenimiento, otros… las mismas plataformas para construir audiencia». */
const Usos: React.FC<SceneProps> = ({ b }) => {
  const f = useCurrentFrame();
  const postW = 380, step = postW * 1.12 + 12;
  const scroll = (ramp(f, b.redes, b.redes + 10) + ramp(f, b.consumir, b.consumir + 10)) * step;
  const swap = ramp(f, b.otros, b.otros + 12);
  const group = ramp(f, b.construir, b.construir + 16);
  return (
    <Stage fixed={<div style={enterStyle(f, b.otros, { dy: 10 })}><Ilustrativo x={65} y={256} size={26} /></div>}>
      <div style={{ position: "absolute", left: 330 - 230 * group, top: EDGE - 870 }}>
        <Phone x={0} y={0} w={420} h={870}>
          <div style={{ position: "absolute", left: 14, top: 50 - scroll, display: "flex", flexDirection: "column", gap: 12, opacity: 1 - swap }}>
            {[0, 1, 2, 3].map((i) => <FeedPost key={i} w={postW} video={i % 2 === 0} tint={(["yellow", "blue", "cream", "yellow"] as const)[i]} />)}
          </div>
          {/* «otros… construir audiencia»: el perfil de la marca del usuario */}
          <div style={{ position: "absolute", left: 22, right: 22, top: 70, display: "flex", flexDirection: "column", gap: 18, opacity: swap, transform: `translateY(${(1 - swap) * 30}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <PuffyAvatar size={86} tone="yellow" />
              <div><Label size={30} weight={900}>{HANDLE}</Label><Bars widths={[150]} h={12} /></div>
            </div>
            {(["people", "target", "store"] as const).map((ic, i) => (
              <div key={ic} style={{ background: P.card, borderRadius: 28, padding: "22px 20px", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 4px 10px rgba(23,23,29,0.06)", border: `3px solid ${i === 0 && group > 0.5 ? P.yellow : P.border}` }}>
                <Icon name={ic} size={60} /><Bars widths={[180, 110]} h={14} gap={10} />
              </div>
            ))}
          </div>
        </Phone>
      </div>
      {/* «consumir entretenimiento»: palomitas 3D junto al feed */}
      <div style={{ position: "absolute", left: 760, top: 470 }}>
        <Icon3D name="popcorn" size={260} f={f} at={b.consumir} dur={18} out={outT(f, b.otros - 2, 8)} />
      </div>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2, x0 = 820 + Math.cos(a) * 110, y0 = 700 + Math.sin(a) * 300;
        const x1 = 790 + Math.cos(a + 0.5) * (i ? 100 : 0), y1 = 700 + Math.sin(a + 0.5) * (i ? 100 : 0);
        const t = inT(f, b.construir + i * 2, 8);
        return <div key={i} style={{ position: "absolute", left: x0 + (x1 - x0) * group - 46, top: y0 + (y1 - y0) * group - 46, opacity: t, transform: `scale(${0.5 + 0.5 * t})` }}><PuffyAvatar size={92} tone={(["blue", "yellow", "ink"] as const)[i % 3]} /></div>;
      })}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}><circle cx={790} cy={700} r={185} fill="none" stroke={P.yellow} strokeWidth={8} strokeDasharray={1170} strokeDashoffset={1170 * (1 - ramp(f, b.construir + 10, b.construir + 24))} /></svg>
    </Stage>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  Apertura, TiempoTecnologia, PlataformasAtencion, Audiencias, Transicion: () => null, Anuncio, Sistema, Objetivo, Herramientas, Evolucion, Pregunta, Distancia, Usos, Cierre,
};
