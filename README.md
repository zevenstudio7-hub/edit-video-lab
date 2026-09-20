# Gemini Video Lab

Laboratorio de edición inteligente de video enfocado en procesar y enriquecer contenido grabado por el usuario, utilizando **Gemini** para análisis, interpretación y generación de planes de edición, y **Remotion** para composición programática, motion graphics y renderizado automatizado.

## Objetivo

Construir un flujo reproducible y modular de edición asistida por IA para contenido audiovisual (cortes, subtítulos, motion graphics, overlays, B-roll, reencuadres y renderizado), priorizando el uso de componentes reutilizables sobre la generación de código ad-hoc para cada video.

## Stack Inicial

- **Framework de video**: Remotion (v4.0.438)
- **UI & Composición**: React 19
- **Lenguaje**: TypeScript
- **Gestor de paquetes**: pnpm

## Estructura del Proyecto

```text
src/
  components/       # 12 componentes visuales reutilizables (LIB-001)
  presets/          # 5 presets de estilo e intensidad con Theme Provider
  compositions/     # Definiciones de composiciones Remotion (GeminiVideoLab, LibraryShowcase)
  styles/           # Estilos globales y tokens visuales
  lib/              # Tokens de diseño, constantes y utilidades
docs/               # Documentación y lineamientos arquitectónicos del sistema
public/             # Archivos estáticos y recursos multimedia
out/                # Videos MP4 renderizados
```

## Biblioteca Base Remotion (LIB-001)

### Componentes Mínimos Reutilizables
1. **`DynamicCaptions`**: Subtítulos dinámicos en 3 modos: `simple`, `editorial`, y `dynamic` (karaoke con pop activo).
2. **`HighlightWord`**: Énfasis visual para palabras clave (`pill`, `marker`, `glow`, `box`).
3. **`KineticText`**: Animación cinética tipográfica escalonada (`slide-up`, `pop`, `blur-in`, `fade`).
4. **`BigStatement`**: Titular de alto impacto con overline kicker y palabras resaltadas.
5. **`SpeakerCard`**: Lower-third con avatar/monograma, nombre, rol y redes.
6. **`PictureInPicture`**: Ventana flotante (PiP) para cámara o material secundario.
7. **`MediaFrame`**: Marco para B-Roll, capturas o video de apoyo con caption.
8. **`ScreenFrame`**: Mockup de ventana / navegador con controles macOS y barra de URL.
9. **`FocusHighlight`**: Máscara spotlight SVG con halo y borde pulsante.
10. **`SoftZoom`**: Zoom suave continuo (Ken Burns / push-in) con origen configurable.
11. **`SceneTransition`**: Transiciones fluidas (`fade`, `slide-left`, `slide-up`, `zoom`, `wipe`).
12. **`CTA`**: Llamado a la acción con botón de respiración, badge, handle y flecha indicadora.

### Presets Iniciales
- **`editorial-dynamic`**: Alto contraste oscuro, acentos cyan vibrantes y motion enérgico.
- **`kinetic-infographic`**: Estilo técnico de precisión con acentos ámbar y tipografía mono.
- **`editorial-minimal`**: Sobrio, ritmos pausados, paleta neutra y acento champaña.
- **`screen-tutorial`**: Optimizado para demos de software con acento esmeralda.
- **`organic-iphone-demo`**: Estilo de producto móvil con cristal y gradientes violeta/fucsia.

## Guía de Uso

### Instalación de dependencias

```bash
pnpm install
```

### Ejecutar Preview (Remotion Studio)

Para abrir la interfaz interactiva de desarrollo y previsualización en el navegador:

```bash
pnpm run dev
# o directamente:
pnpm remotion studio
```
URL por defecto: `http://localhost:3000`

### Renderizar Composiciones

**Renderizar Showcase completo (15s @ 30 FPS, 1080x1920):**
```bash
pnpm run render:showcase
# genera: out/library-showcase.mp4
```

**Renderizar Composición inicial (`GeminiVideoLab`, 5s @ 30 FPS, 1080x1920):**
```bash
pnpm run render
# genera: out/gemini-video-lab.mp4
```

