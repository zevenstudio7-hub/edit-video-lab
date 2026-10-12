# Cuestionario de perfil Motion UX (se hace UNA sola vez)

Estado: candidato (2026-10-09). Resultado: `formatos/motion-ux/perfil.json` (modelo en `perfil.example.json`). `perfil.json` es del usuario: no se sobrescribe sin que lo pida.

## Cuándo se pregunta

- Antes del **primer** video que use Motion UX, si `perfil.json` no existe.
- Se vuelve a preguntar solo si el usuario dice «cambia mi estilo», «cambia mis colores» o equivalente.
- Si la sesión no admite preguntas (tarea programada o sin lector), se aplican los valores por defecto de ZevenPRO, se anota en el reporte «sin perfil: colores por defecto» y se pregunta en la siguiente sesión interactiva.
- Si hay dudas sobre si ya se preguntó: leer `perfil.json`. Existe → no se pregunta.

## Preguntas (máximo 4, en este orden)

**1. Color principal (tinta de interfaz).**
Opciones: «Usar el azul ZevenPRO (#0057FF)», «Escribir un color (hex o nombre: `#7C3AED`, «violeta», «verde menta»)», «Darte una imagen de referencia (logo, captura, paleta)».

- Hex válido (`#RGB` o `#RRGGBB`) → se usa tal cual.
- Nombre → se traduce a un hex concreto y **se muestra el hex elegido** para que lo confirme.
- Imagen → extraer 5 colores dominantes (k-means sobre píxeles reducidos, ignorando casi blancos/negros/grises) y proponer los 3 más saturados con su hex; el usuario elige uno. No se adivina: se confirma.

**2. Color de resalte** (palabras clave, píldoras, marcadores).
Opciones: «Amarillo ZevenPRO (#F5C518)», «Elegir otro (hex, nombre o imagen)», «Que lo derive la skill (complementario del principal)».

**3. Superficie preferida.**
`soft` (claro, suave; defecto) · `glass` (translúcido, para lanzamientos e IA) · `dark` (oscuro, solo si lo pides). La orden de cada video puede cambiarla.

**4. Tipografía.** Opciones: «Inter Tight + Instrument Serif (defecto)», «Otra: dime el nombre (se comprueba que esté disponible y tenga tildes)».

No se pregunta nada más: alerta (`#E1062C`), sonidos y movimientos salen de `tokens.json`.

## Validación antes de guardar

1. **Contraste**: texto blanco sobre `ui-600` y texto oscuro sobre `ui-100` ≥ 4,5:1. Si el color elegido no lo cumple (amarillos, cian claros), la skill propone el tono más cercano que sí lo cumple y lo dice; si el usuario insiste, se guarda su color y se usa texto oscuro automático sobre él (`on-ui` por luminancia).
2. **Distancia ui/resalte**: si ambos tienen matiz a menos de 30°, avisar y proponer el complementario.
3. **Derivar y mostrar**: calcular la paleta (`tokens.json → paleta.derivacion_desde_ui`) y enseñar una muestra (un still del specimen con `applyPalette`) antes de confirmar.

## Cómo preguntar

- Con `AskUserQuestion` si existe; si no, en texto plano con las mismas opciones numeradas.
- Una sola ronda. Si responde con una imagen, procesarla y confirmar en una línea.

## Qué se guarda

`formatos/motion-ux/perfil.json`:

```json
{ "version": 1, "definido": "AAAA-MM-DD", "ui": "#RRGGBB", "resalte": "#RRGGBB", "alerta": "#E1062C",
  "superficie": "soft", "fuente": { "titulares": "Inter Tight", "serif": "Instrument Serif", "mono": "ui-monospace" },
  "origen_color": "hex | nombre | imagen", "notas": "" }
```

Las imágenes de referencia que aporte el usuario se guardan en `formatos/motion-ux/referencias/` (ignorada por git) y no se reutilizan en los videos.

## Prioridad

orden del video (`cambios`) > `perfil.json` > valores por defecto de ZevenPRO.
