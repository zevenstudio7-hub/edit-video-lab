# VIDEO-002 — orden del usuario (2026-10-05)

Texto de la orden tal como la entregó el usuario para `#edit-1-motion`. La grabación manda sobre el guion orientativo.

---

Organiza y ejecuta la edición del video sobre Muse for Small Business en Remotion, utilizando las dos tomas grabadas y el video de referencia.
Material grabado:
https://drive.google.com/drive/folders/1GVbB6UKERzjPsz5v7MBN_bpzNeUx8S2f?usp=drive_link
Antes de comenzar, comunica un resumen breve de lo que harás y después continúa con la orden completa, sin solicitar autorización para cada paso.

## 1. Fuente de verdad: lo que digo en la grabación

El guion escrito y las escenas descritas en esta orden son orientativos, no definitivos. Sirven para comprender el contexto y la intención visual.
Lo que realmente digo en las tomas debe determinar la narración final, los subtítulos, los motions y las animaciones.

* Escucha y transcribe ambas tomas con marcas de tiempo.
* Identifica frases completas, errores, interrupciones, falsos arranques y repeticiones.
* Construye una narración continua conservando mis palabras, intención y argumento.
* Selecciona por frase la toma con mejor dicción, intención y audio.
* Si lo grabado difiere del guion escrito, adapta la escena a lo grabado.
* Si una idea del guion no aparece en el audio, omite su escena.
* Si aparece una idea adicional, crea una escena que la explique.
* Ajusta el orden y la duración de los motions a la narración depurada.
* No fuerces la grabación para cumplir las doce escenas ni sus tiempos.
* No inventes palabras, clones mi voz ni agregues frases para completar el guion.
* Si falta una frase imprescindible para comprender el argumento, señala el fragmento y el problema concreto.

Los textos gráficos pueden resumir lo que digo, pero no introducir afirmaciones nuevas. Los subtítulos deben reflejar el audio seleccionado.

## 2. Identidad y referencia visual

Conserva la identidad existente del proyecto: fondo, colores, tipografías, subtítulos, resaltados, márgenes y componentes. Consulta y reutiliza su configuración actual antes de diseñar.
Del video de referencia toma únicamente:

* Alternancia entre presentador e interfaces animadas a pantalla completa.
* Tarjetas flotantes con profundidad y sombras suaves.
* Cursores que señalan, pulsan y activan elementos.
* Casillas, indicadores y etiquetas que cambian de estado.
* Conexiones animadas entre herramientas.
* Acercamientos a detalles concretos.
* Entradas, salidas y sustituciones rápidas sincronizadas con la narración.

No copies los colores, tipografías, subtítulos ni mascotas de la referencia. No crees un sistema visual nuevo.
Cada motion debe representar una idea que se está escuchando en ese momento. Evita animaciones decorativas sin relación con la narración.

## 3. Depuración y cortes

Primero resuelve la narración; después construye las animaciones.

* Elimina instrucciones de grabación, disculpas, interrupciones, intentos fallidos y repeticiones accidentales.
* Cuando existan varias versiones de una frase, conserva una sola versión completa.
* Mantén las repeticiones intencionales que desarrollan el argumento.
* Une fragmentos de distintas tomas solo cuando exista continuidad natural de voz y significado.
* Corta después del último sonido de una palabra y antes del inicio de la siguiente. No recortes consonantes ni finales de palabra.
* Reduce pausas internas excesivas a unos 120–220 ms cuando la dicción lo permita.
* Conserva pausas expresivas de aproximadamente 250–400 ms en ideas importantes.
* No elimines todas las respiraciones ni conviertas la voz en una sucesión atropellada.
* Utiliza microfundidos de audio de 5–15 ms cuando sean necesarios para evitar clics, sin superponer palabras.
* Cubre las uniones entre archivos y los saltos visibles con motions a pantalla completa, manteniendo la voz continua por debajo.
* Si el presentador permanece visible, utiliza un corte limpio y un cambio moderado de encuadre.
* No aceleres la voz para alcanzar una duración arbitraria.
* No añadas silencios para terminar animaciones: adapta las animaciones al tiempo disponible.
* No dejes pantallas negras, composiciones vacías ni elementos esperando sin intención.

## 4. Parámetros de animación

Mantén el formato vertical y los FPS existentes. Si los FPS aún no están definidos, utiliza 30.
Valores orientativos a 30 fps; adapta su equivalencia si el proyecto utiliza otra frecuencia:

* Entrada de tarjeta: 8–12 fotogramas; opacidad 0→1, desplazamiento vertical corto y escala 0,96→1.
* Salida: 6–8 fotogramas.
* Pulsación: escala 1→0,97→1 durante 5–7 fotogramas.
* Énfasis: escala 1→1,06→1 durante 8–10 fotogramas.
* Presentador: encuadre base 100%; acercamientos de énfasis a 108–112%.
* Interfaces: acercamientos de 100% a 115–125%, centrados en el detalle relevante.
* Zoom out para revelar relaciones, conjuntos o recorridos completos.
* Mantén los textos importantes legibles antes de retirarlos.

Calcula todas las animaciones por fotograma en Remotion, de forma reproducible. No uses temporizadores ni animaciones CSS independientes del timeline.

## 5. Guía de escenas adaptable al audio

Las frases siguientes representan el guion inicial. No son un texto obligatorio para la edición. Utiliza cada propuesta únicamente si su idea aparece en la narración final y sincronízala con las palabras realmente pronunciadas.

### Escena 1. Redes como entretenimiento
CONTEXTO ORIENTATIVO: “Durante mucho tiempo nos hicieron creer que las redes sociales solo se trataban de entretenimiento.”
IMAGEN: Comienza directamente con el presentador, sin intro de logo. Introduce junto a él una tarjeta de teléfono con un feed conceptual: video, corazón y desplazamiento de contenido. Al mencionar entretenimiento, amplía la tarjeta y desplaza dos contenidos dentro del teléfono.
CÁMARA: Encuadre base y acercamiento gradual hasta 108% al terminar la idea.
SONIDO: Deslizamiento suave sincronizado con el movimiento del feed.
CORTE: Conserva una sola versión utilizable de la apertura. Corta al finalizar la idea realmente grabada.

### Escena 2. Evolución de la inteligencia artificial
CONTEXTO ORIENTATIVO: “Pero con la evolución de la inteligencia artificial estamos viendo algo mucho más interesante.”
IMAGEN: Sustituye la tarjeta del feed por una tarjeta de trabajo con contenido, datos y tarea. Conecta los elementos. Evita cerebros holográficos o imágenes genéricas de tecnología.
CÁMARA: Pasa a motion a pantalla completa al introducir la IA. Acércate a la tarjeta central al señalar el cambio importante.
SONIDO: Whoosh corto durante la sustitución y tono digital discreto al completar la conexión.
CORTE: Cierra la idea sin prolongar la animación. Mantén continuidad visual con la siguiente escena.

### Escena 3. Plataformas
CONTEXTO ORIENTATIVO: “Facebook, Instagram, TikTok… Sí, compiten por entretenerte.”
IMAGEN: Introduce una tarjeta por plataforma, exactamente cuando se mencione. Utiliza logos oficiales. Si se habla de competencia por entretener, desplaza las tarjetas hacia un teléfono central.
CÁMARA: Encuadre abierto para leer las tarjetas; pequeño acercamiento al teléfono al cerrar.
SONIDO: Pop suave en cada entrada y un único whoosh al agruparlas.
CORTE: Conserva la enumeración que exista en el audio. Elimina nombres repetidos por error y pausas accidentales.

### Escena 4. Atención
CONTEXTO ORIENTATIVO: “Porque el entretenimiento captura algo muchísimo más valioso: tu atención.”
IMAGEN: Rodea el teléfono con notificaciones; después atenúalas y concentra el enfoque en un elemento central. Al mencionar atención, introduce una tarjeta protagonista con esa palabra, utilizando el sistema gráfico existente. No dupliques innecesariamente el mismo texto grande junto al subtítulo.
CÁMARA: Zoom in al capturar el enfoque. Mantén el encuadre durante la palabra importante.
SONIDO: Clic de enfoque y golpe grave suave al aparecer la tarjeta.
CORTE: Conserva la pausa expresiva si existe. No alargues el silencio para destacar la palabra.

### Escena 5. Audiencias
CONTEXTO ORIENTATIVO: “Y cuando una plataforma concentra la atención de millones de personas, tiene algo todavía más importante: audiencias.”
IMAGEN: Transforma el punto central en grupos de perfiles que se multiplican y organizan. Una tarjeta engloba el conjunto al mencionar audiencias. Representa escala mediante elementos visuales; no inventes cifras ni métricas.
CÁMARA: Zoom out progresivo para revelar los grupos. Detén el movimiento al presentar el concepto principal.
SONIDO: Textura breve durante la expansión y tono suave de confirmación al agrupar.
CORTE: Finaliza después de la idea completa, conservando únicamente pausas con intención.

### Escena 6. Presentación de Muse
CONTEXTO ORIENTATIVO: “Y aquí es donde empieza a ponerse interesante. Meta acaba de presentar Muse for Small Business.”
IMAGEN: Regresa brevemente al presentador durante la transición. Al mencionar Meta y Muse, introduce una captura verificada del anuncio o una tarjeta con el nombre del producto. No reutilices interfaces de ChatGPT/dots de la referencia para representar Muse.
CÁMARA: Presentador al 100%; después corte a la tarjeta y acercamiento al nombre.
SONIDO: Whoosh breve en la entrada e impacto suave en la aparición del producto.
CORTE: Cubre posibles uniones de tomas con la tarjeta del anuncio.

### Escena 7. Información, herramientas y tareas
CONTEXTO ORIENTATIVO: “Una inteligencia artificial pensada para ayudar a los negocios a ejecutar tareas utilizando la información y las herramientas que ya tienen conectadas.”
IMAGEN: Muse al centro. Introduce información y herramientas desde un lado y conéctalas mediante líneas animadas. En el otro lado, muestra una lista de tareas que cambia de pendiente a preparada. Si la interfaz es conceptual, identifícala discretamente como “Ejemplo ilustrativo”.
CÁMARA: Plano general del sistema y acercamiento a la tarea al mencionar su ejecución.
SONIDO: Clic en las conexiones principales y confirmación suave en el cambio de estado.
CORTE: Elimina interrupciones sin romper el sentido de la explicación.

### Escena 8. Objetivo concreto
CONTEXTO ORIENTATIVO: “Por ejemplo, puedes darle un objetivo como: ‘Ayúdame a conseguir nuevos clientes.’”
IMAGEN: Abre una tarjeta de conversación conceptual. Escribe el objetivo que realmente diga en la grabación; no impongas el ejemplo escrito si cambia. El texto debe quedar completo cuando termine la frase. El cursor pulsa el botón y aparece un estado como “Preparando propuesta”, sin fingir una venta conseguida.
CÁMARA: Acercamiento al campo de texto y apertura ligera para revelar el resultado.
SONIDO: Ráfaga breve de teclado, clic de pulsación y tono suave al mostrar el estado.
CORTE: Conserva el objetivo completo y una separación natural antes de pronunciarlo.

### Escena 9. Herramientas conectadas
CONTEXTO ORIENTATIVO: “Y Muse puede trabajar con tus cuentas de Facebook e Instagram y conectarse con herramientas como Shopify, Stripe, Klaviyo, HighLevel, Notion o Canva.”
IMAGEN: Mantén Muse como nodo central. Conecta primero las cuentas mencionadas y después las demás herramientas. Si la enumeración coincide con el guion, utiliza dos grupos:

* Shopify, Stripe y Klaviyo.
* HighLevel, Notion y Canva.

Si cambia, adapta los grupos al audio. Cada tarjeta aparece cuando se pronuncia su nombre. Utiliza logos oficiales y evita siete tarjetas pequeñas compitiendo simultáneamente.
Las aclaraciones verificadas sobre disponibilidad o aprobación deben ser notas informativas secundarias, nunca subtítulos que aparenten palabras pronunciadas. No añadirlas como voz.
CÁMARA: Plano abierto y desplazamiento corto entre grupos. Evita un zoom por cada logo.
SONIDO: Pops discretos en las entradas y un tono suave al completar cada grupo.
CORTE: Una sola mención por herramienta, salvo repetición intencional. No superpongas nombres al unir fragmentos.

### Escena 10. Recorrido de la evolución
CONTEXTO ORIENTATIVO: “Entonces mira hacia dónde está evolucionando todo: contenido. Atención. Audiencia. Ejecución / ventas.”
IMAGEN: Construye tarjetas para los conceptos realmente pronunciados. Si coinciden con el guion: CONTENIDO → ATENCIÓN → AUDIENCIA → EJECUCIÓN / VENTAS. Representa cada uno con una pieza de contenido, un marco de enfoque, perfiles y una tarea con oportunidad comercial. Organiza el recorrido en escalera o cuadrícula de dos por dos. Activa cada tarjeta con su palabra y conserva las anteriores para mostrar la relación.
CÁMARA: Acercamiento breve a cada concepto activo y zoom out final para revelar el recorrido.
SONIDO: Pulso suave por concepto; el último ligeramente más marcado.
CORTE: No insertes silencios artificiales entre conceptos. Utiliza las palabras grabadas; la barra del guion no implica pronunciar “barra”.

### Escena 11. Consecuencia para el negocio
CONTEXTO ORIENTATIVO: “¿Y qué significa esto para un negocio? Que cada vez habrá menos distancia entre tener algo que vender y encontrar a las personas que podrían comprarlo.”
IMAGEN: Presentador durante la pregunta. Después, una tarjeta de producto y perfiles de posibles clientes. Entre ambos, elementos de contenido, audiencia y tarea reducen su separación hasta formar un recorrido conectado. Representa oportunidades y conexión con posibles compradores.
CÁMARA: Presentador al 108% en la pregunta; plano gráfico abierto en la explicación y acercamiento moderado al recorrido final.
SONIDO: Whoosh suave al reducir la distancia y clic al completar la conexión.
CORTE: Mantén una pausa breve después de la pregunta. Cubre cambios de toma con el motion.

### Escena 12. Cierre
CONTEXTO ORIENTATIVO: “Por eso, mientras unos utilizan las redes únicamente para consumir entretenimiento… otros están utilizando exactamente las mismas plataformas para construir audiencias, automatizar procesos y generar oportunidades de negocio.”
IMAGEN: Muestra primero el teléfono desplazando un feed. Al introducir el uso empresarial, sustitúyelo por las acciones que realmente mencione:

* Construir audiencias: perfiles que se agrupan.
* Automatizar procesos: casillas que cambian de estado.
* Oportunidades de negocio: ficha de un contacto interesado.

Regresa al presentador para la conclusión final. Retira los gráficos sin tapar el rostro.
CÁMARA: Zoom out al mostrar las acciones. Regreso al presentador al 100% y acercamiento lento hasta 108% durante el cierre.
SONIDO: Deslizamiento del feed, transición breve y clics discretos en los cambios de estado. Reduce música y efectos durante la última frase.
CORTE: Elimina pausas procedentes de errores. Termina aproximadamente 200–350 ms después de la última palabra. No agregues outro largo ni un CTA que no esté grabado.

## 6. Sonido general

* Prioriza siempre la inteligibilidad de la voz.
* Utiliza música instrumental discreta, sin letra.
* Sincroniza los efectos con la aparición, pulsación o cambio de estado exacto.
* No añadas whoosh a cada corte ni sonidos a cada subtítulo.
* Mantén volumen y ambiente consistentes entre las dos tomas.
* Evita saturación.
* Comprueba el resultado con altavoz de teléfono.

Los efectos anteriores son propuestas para esta edición; adapta su presencia al ritmo real y elimina los que distraigan.

## 7. Construcción de recursos

Construye los motions directamente en Remotion mediante tarjetas, SVG, máscaras, líneas, cursores y capturas verificadas.
No exijas tomas de apoyo para completar el video. Resuelve visualmente las ideas con estas herramientas.
No inventes interfaces, logos ni resultados de Muse. Cuando representes un funcionamiento de manera conceptual, indícalo como ejemplo ilustrativo.

## 8. Entrega y verificación

Completa la orden y entrega:

1. Mapa de cortes con archivo, entrada, salida y frase conservada.
2. Guion técnico final basado en la transcripción depurada.
3. Preview completo con motions, subtítulos, música y efectos.

Verifica antes de entregar:

* Cero repeticiones accidentales, instrucciones de grabación o intentos fallidos.
* Cero palabras recortadas o superpuestas.
* Cero fotogramas negros involuntarios.
* Ninguna pausa residual superior a 450 ms sin intención expresiva.
* Motions sincronizados con las ideas realmente pronunciadas.
* Subtítulos fieles al audio y con el estilo existente.
* Textos gráficos legibles y sin colisiones con rostro o subtítulos.
* Colores, tipografías e identidad existentes preservados.
* Audio continuo e inteligible entre ambas tomas.

No exportes el MP4 definitivo hasta revisar el preview.
La narración grabada dirige la edición; el guion orientativo y las animaciones se adaptan a ella.
