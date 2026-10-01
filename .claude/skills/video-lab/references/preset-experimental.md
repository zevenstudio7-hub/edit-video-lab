# reel-editorial-reforzado — experimento

Estado: definido, sin aprobación audiovisual. No es un EDIT_TYPE nuevo ni reemplaza presets existentes.

## Alcance

Primera prueba bajo `#edit-2-pantalla-dividida`, tomando 20–30 segundos de una orden existente que incluyan voz y pantalla. Reutiliza fuentes y análisis válidos. Registra el intervalo elegido, escenas, revisión de procedencia y limitaciones si la orden está incompleta. No completes falsamente el video para aprobar la muestra.

Mantén el mismo material, duración, audio y selección de cortes en base y candidato. Cambia solo captions y, como máximo, un señalador o apoyo breve. No añadir música, SFX, modelos ni assets externos a esta primera prueba.

## Configuración del candidato

- Base visual: preset local screen-tutorial para edit-2.
- Captions: frase completa legible con contraste y animación por frame. Con tiempos por frase, conserva ese nivel de sincronización; resalte por palabra solo con alineación comprobada.
- Posición: zona libre medida en la composición final; nunca importar coordenadas de otra grabación. Mantener rostro y acción de pantalla visibles.
- Apoyo: un señalador sobre un elemento real o una síntesis breve que no añada datos sin evidencia. No repetir toda la voz ni ocultar captions automáticamente.
- Color: preservar tokens locales y asignar una función clara al acento. Sin perfil global nuevo.

## Implementación aislada

Antes de editar, comprueba la estructura actual. Añade una configuración y composición de prueba con ID distinto, por ejemplo `Video001PresetTrial`, sin alterar la composición base ni la orden aprobada. Usa componentes locales o implementaciones mínimas compatibles; los componentes del ZIP son candidatos de referencia, no código que deba copiarse.

Haz explícita la transformación del intervalo de timeline a frames locales y la conversión de cues. Verifica que los medios y apoyos no excedan sus rangos ni se repitan involuntariamente. No conviertas el preset en default ni lo exportes como producción.

## Aceptación

Registra para base y candidato: intervalo, versiones, URL/composición, tiempo hasta preview, correcciones humanas, errores de medios, palabras cortadas, desfase observado y problemas de lectura/oclusiones. Si no hay medida, escribe pendiente; no rellenes cifras estimadas como resultados.

Para aceptar técnicamente: typecheck, reproducción y límites temporales correctos. Para aceptar audiovisualmente: escucha de cortes, captions fieles y legibles, rostro y pantalla relevantes visibles, sin datos añadidos sin evidencia. La preferencia por el candidato requiere valoración editorial del usuario, no únicamente aprobación del agente.

Si el candidato falla, corrige o conserva la base. Si pasa, queda como preset opcional del estilo actual. No crear un quinto estilo: los EDIT_TYPE oficiales son los cuatro definidos en `docs/VIDEO-SYSTEM-ROOT.md` y solo se modifican allí, fuera de este experimento.

## Límites del adjunto

La revisión de reel-edicion encontró dependencias diferentes, QA facial muestreado, confianza de captions fijada artificialmente a 1, traducción con tiempos aproximados y configuración ambigua de música. No trasladar esas limitaciones al experimento. ASR por palabra, seguimiento, OCR y mezcla son ampliaciones posteriores según necesidad, no requisitos iniciales.
