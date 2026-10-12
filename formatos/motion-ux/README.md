# Motion UX — estilo de movimiento predeterminado para tecnología y software

Nombre técnico: **Soft Glass UI** (soft UI + glassmorphism/Liquid Glass + borde AI glow), animado como *UI motion / product motion*. Estado: candidato, sin aprobación audiovisual.

**Se usa por defecto** cuando lo que se dice trata de herramientas, tecnología, software, IA, sistemas digitales o «cómo se usa X», en cualquier EDIT_TYPE (con la intensidad de `MOTION-UX.md §2`; la orden manda).

## Qué leer y cuándo (carga perezosa)

| Necesito… | Archivo |
|---|---|
| Entender el estilo, enrutamiento, reglas de verdad | `MOTION-UX.md` |
| Colores, superficies, tipografía, sonido | `tokens.json` |
| Elegir un movimiento (20 presets) | `MOVIMIENTOS.md` → `movimientos.json` |
| Elegir un estilo de texto (10) | `TEXTOS.md` → `textos.json` |
| Ver cómo se ve y copiar la matemática | `specimen/index.html` (abrir en navegador; sin dependencias) |
| Código Remotion de los movimientos | `snippets/primitivas.ts` |
| Preguntar colores (una sola vez) | `CUESTIONARIO.md` → `perfil.json` |
| Saber de dónde salió cada cosa | `img/INDICE.md` |

## Cargarlo en cualquier IA (Claude Code, Codex, otra)

1. Leer `MOTION-UX.md` y `tokens.json`.
2. Leer `perfil.json` si existe; si no, hacer `CUESTIONARIO.md` (una vez).
3. Elegir presets en `movimientos.json` y estilos en `textos.json` según lo que se dice.
4. Comprobar el aspecto en `specimen/index.html`; implementar como funciones puras de `useCurrentFrame()`.

## Carpetas

```
formatos/motion-ux/
  MOTION-UX.md  MOVIMIENTOS.md  TEXTOS.md  CUESTIONARIO.md  README.md
  tokens.json  movimientos.json  textos.json  perfil.example.json  (perfil.json = del usuario)
  specimen/index.html   snippets/primitivas.ts   img/   referencias/ (videos, ignorada por git)
```

## Límites conocidos

Nada se ha renderizado con Remotion todavía; valores leídos a ojo (±2 frames). Ver `MOTION-UX.md §9`.
