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
  components/       # Componentes visuales y motion graphics reutilizables
  compositions/     # Definiciones de composiciones de video Remotion
  styles/           # Estilos globales y tokens visuales
  lib/              # Constantes, tipos y funciones de utilidad
docs/               # Documentación y lineamientos arquitectónicos del sistema
public/             # Archivos estáticos y recursos multimedia
```

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

### Renderizar la Composición de Prueba

Para renderizar la composición de prueba (`GeminiVideoLab`, 1080x1920 @ 30 FPS, 5s) a un archivo MP4 local:

```bash
pnpm run render
# o especificando parámetros:
pnpm remotion render GeminiVideoLab out/gemini-video-lab.mp4
```

El video resultante se guardará en `out/gemini-video-lab.mp4`.
