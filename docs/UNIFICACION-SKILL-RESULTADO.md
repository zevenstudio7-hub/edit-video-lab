# Aplicación de DIRECTRIZ-UNIFICAR-SKILL

Fecha: 2026-10-10. Alcance: unificar la skill y completar la guía v2.2; sin commit, push ni render final de video.

## Cambios aplicados

- Única skill del checkout principal: `.claude/skills/video-lab/SKILL.md`. Integra elección de los cinco formatos, 15 variantes, subtítulos S1–S9, perfil Creator y perfil Motion UX sin repetir colores/fuentes compartidos, looks con intensidad, guion técnico y referencias de estilo.
- Los antiguos `SKILL.md` de Creator quedaron como `NOTAS-HISTORICAS.md`, sin frontmatter ni entrada invocable. Las bases `.nuevo` se conservaron en `out/unificar-skill-20261010/bases-antiguas/`. Se corrigieron las referencias operativas. La directriz original conserva sus menciones históricas.
- `formatos/edit-creator/` se conserva como carpeta antigua con aviso. No se borró, porque la directriz condiciona ese borrado a autorización expresa. El worktree `.claude/worktrees/nervous-booth-8c10c9/` quedó intacto: contiene una copia aislada de `/video-lab`, no una segunda entrada del checkout principal. No hay `.claude/commands/` en este checkout.
- Catálogo de cinco EDIT_TYPE y 38 entradas: Business revisado contra su FORMATO, con condiciones propias para rótulos, marca, evidencia y UI digital sobria. Se retiró la copia automática de la columna Orgánico y se corrigió el README de biblioteca.
- Looks: cinco LUT comprobadas con FFmpeg sobre VIDEO-003, `public/video-003/hq/fuente-1080.mp4`, 2,2 s, Rec.709. Burdeos cálido a pedido, también al 70 %, sin alterar luminoso-aire por defecto ni oscuro-cinematico como alternativa. La LUT solo gradúa metraje; aplicar al compuesto final alteraría textos, logos y Motion UX.
- Una guía fuente (`formatos/guia/guia.html`) y un PDF entregable (`docs/Guia-de-uso-sistema-de-edicion-ZEVEN.pdf`). Los PDF anteriores se conservan como backups en `out/`, fuera de la entrega.
- Guía: “Empieza aquí” en dos páginas, índice de 13 secciones, tabla por objetivo e identidad del cliente, diagrama propio, comparativo S1–S9 en una página, secuencias y prompt para cada subtítulo, muestras nativas de las 15 variantes (1080×1920; 3C a 1920×1080), las diez imágenes Motion UX aportadas, 20 movimientos y 10 rótulos ilustrados con stills de Remotion, cinco comparaciones de looks en toma real más las cartas de prueba rotuladas. Las interfaces genéricas se identifican como ilustración.
- Reutilizadas las secuencias válidas; regeneradas las que tapaban rostros o requerían una UI propia. Los stills pesados están excluidos de Git; índices, diagramas y código se conservan.

## Verificación

- `node library/validate.mjs`: catálogo y manifiesto válidos.
- `pnpm typecheck` y `pnpm typecheck:library`: sin errores. `formatos/motion-ux/snippets/primitivas.ts` se comprueba porque la entrada de la guía lo importa.
- Validador de skill `quick_validate.py`: `Skill is valid!`. PyYAML se instaló solo en `/tmp/video-lab-validation-deps`, sin cambiar dependencias del proyecto.
- Stills reales con `@remotion/renderer` 4.0.438; no se renderizó un MP4. Composiciones y scripts propios en `src/compositions/guia/`; no se modificó la entrada principal `src/Root.tsx`.
- Inventario de imágenes, procedencia y dimensiones: `formatos/guia/muestras/inventario.json`. Pruebas de LUT: `formatos/guia/muestras/looks/pruebas.json`.
- PDF v2.2 regenerado desde el HTML: 39 páginas, 17.463.153 bytes. Las 39 páginas finales se rasterizaron y revisaron visualmente, incluida la portada, las dos páginas de inicio, comparativo y fichas, variantes corregidas, colores, Motion UX, looks, guion y cierre. Paginación y recursos cargados comprobados; sin avatar. Evidencia en `out/unificar-skill-20261010/pdf-entrega/`, con hash y resultado en `verificacion.json`.
- `git diff --check`: limpio. Se conservaron los cambios locales previos y backups de los archivos afectados en `out/unificar-skill-20261010/antes/`.

## Pendientes reales

1. No se comprobó el menú `/video-lab` dentro de una sesión interactiva de Claude Code ni la prueba con otra cuenta. Se verificaron el archivo, su frontmatter, rutas y el procedimiento con la documentación oficial de Claude Code: https://code.claude.com/docs/en/skills.
2. Motion UX tiene stills técnicos y typecheck; falta revisar movimiento continuo y audio en una preview. Las muestras, los formatos candidatos y los looks no reciben aprobación audiovisual por regenerar la guía.
3. Looks por defecto y alternativos de Edit-2/4/5 siguen pendientes; se usa `ninguno` o una elección explícita. Burdeos cálido necesita elección editorial de intensidad. 3C usa reencuadres de una misma cámara y 5D tomas de estudio; faltan multicámara y tomas de vida diaria para validar esos casos completos.

La jerarquía RAÍZ → VIDEO-XXX → skill se mantiene. No se crearon perfiles de usuario ficticios ni se modificaron órdenes de videos para simular una aprobación.
