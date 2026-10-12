# #edit-5-creator — Creator (antes `#edit-creator`)

Estado: **definido, sin video ni aprobación audiovisual** (decisión del usuario, 2026-10-05). Es el quinto EDIT_TYPE de la RAÍZ; el 2026-10-09 el usuario lo renombró de `#edit-creator` a `#edit-5-creator` (la carpeta antigua `formatos/edit-creator/` queda con un aviso de redirección y puede borrarse a mano) (`docs/VIDEO-SYSTEM-ROOT.md`). `#edit-3-organico` queda como está: edición mínima.

Definición y reglas: `FORMATO.md`. Variantes **5A** collage (S2), **5B** hook (S3), **5C** explicativo (S2) y **5D** editorial lifestyle (S9): `estilos.json`. Subtítulos: `../subtitulos/SUBTITULOS.md`. Tipografías: `tipografias.json`. Preguntas de perfil y de cada video: `CUESTIONARIO.md`. Procedimiento de **todos los formatos** (elegir formato → variante → subtítulos): la skill única `/video-lab` (`.claude/skills/video-lab/SKILL.md`), ya presente en este repositorio. Creator es un formato; no se instala otra skill. Referencias internas: `referencias/analisis/` (videos 2 y 3; no se versionan).

## Videos

Ninguno todavía.

## Carpeta de cada video: `formatos/edit-5-creator/<VIDEO-XXX-tema>/`

Cada elemento se sube **en su propia carpeta** (así se cargan y se asignan sin confusión):

```
<VIDEO-XXX-tema>/
  tomas/principal/     el creador hablando a cámara
  tomas/apoyo/         B-roll propio, otras cámaras
  material/capturas/   capturas y grabaciones de pantalla
  material/fotos/      fotos que se superponen
  material/logos/      logos e iconos de marca (archivos oficiales)
  material/emojis-iconos/  emojis o iconos propios (si no, se resuelven con Remotion)
  material/voz/        locución o voz en off aparte
  material/musica/     música con su licencia
  material/otros/
  exportaciones/  revision/  README.md
```

Los medios no se versionan (`.gitignore`); las fichas y los documentos sí.
