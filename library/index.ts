// Entrada propia de la biblioteca: `pnpm library` abre Studio solo con las muestras de library/.
// Es independiente de src/Root.tsx para no chocar con composiciones de video en curso.
import { registerRoot } from "remotion";
import { LibraryRoot } from "./Root";

registerRoot(LibraryRoot);
