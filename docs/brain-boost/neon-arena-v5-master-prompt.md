# MASTER PROMPT V5 — NEON ARENA / NIGHTMARE PROTOCOLO

> Especificación original previa al desarrollo. La implementación y sus límites verificados se documentan en [la entrega V5](neon-arena-v5-release.md).

## Misión

Evolucioná el Neon Arena existente de DigitalBoost Studio en tres frentes: escenario 3D con mayor calidad visual, mapa moderadamente más grande y experiencia inmersiva al girar el teléfono; acompañalos con una banda sonora original más elaborada y adaptativa.

Este documento es una especificación para la próxima implementación. Estas mejoras todavía no están implementadas. Trabajá sobre el repositorio real; no construyas una aplicación ni una demo independiente.

Asumí los roles de arquitecto de integración React/TypeScript, desarrollador de gameplay, artista de entornos 3D, ingeniero Three.js/WebGL móvil, diseñador de UX táctil, compositor/diseñador de audio e ingeniero de QA. Tomá decisiones concretas y entregá incrementos ejecutables y verificables.

## 1. Base que debe preservarse

Repositorio: https://github.com/Saladix1414/digitalboost-studio

Ruta habitual del usuario: `~/digitalboost-studio`. Detectá la ruta, rama, versiones y cambios reales. No asumas Termux, Ubuntu, Node o npm a partir de registros históricos.

Hitos de referencia, sujetos a verificar en el historial local:

- `bbeb225`: Asistido conserva el seguimiento al mantener FUEGO.
- `555025c`: Nightmare Protocolo alberga Neon Arena.
- `5d4b401`: botón compacto y barra violeta completa.

La entrada canónica es **Nightmare Protocolo**, con etiqueta **HORROR · SUPERVIVENCIA · PSICOLÓGICO**. No devuelvas Neon Arena a Focus Lab. Conservá los cinco Labs y el acceso restante a Daily Neural Run.

Preservá el marine, las cinco armas, las especies diferenciadas, los tres jefes, oleadas, suministros, resultados y desbloqueos. Conservá el cooperativo local con recursos individuales, dos cámaras y un solo renderer/loop. No agregues multijugador en red.

Regla de control ya aceptada: **Asistido mantiene siempre el objetivo automático al sostener FUEGO, aunque el dedo o ratón se desplace**. El apuntado manual pertenece a Moderno. Clásico conserva su comportamiento. No regreses al fallo de dirección fija al mantener el disparo.

Mantené React, TypeScript, Vite, Three.js exacto `0.186.1` y WebGL 2 directo. No introduzcas React Three Fiber, otro motor, Flask, un iframe, un segundo contexto de audio ni una navegación paralela.

## 2. Auditoría dirigida obligatoria

Antes de editar, leé AGENTS.md aplicables, estado Git, scripts, dependencias, pruebas y los módulos implicados. Registrá qué existe, qué se reutiliza y qué cambió respecto de esta especificación.

Superficie observada al preparar este documento:

| Área | Implementación actual |
|---|---|
| Landing/catálogo | `src/brain-boost/BrainBoostLandingSection.tsx` |
| Escena y cámaras | `src/brain-boost/neon-arena/SurvivalWorld.ts` |
| Renderer, resize, entradas y loop | `src/brain-boost/neon-arena/NeonArenaEngine.ts` |
| Reglas y estados | `src/brain-boost/neon-arena/GameSimulation.ts` |
| Cobertura, armas y progreso | `src/brain-boost/neon-arena/SurvivalRules.ts` |
| Seguimiento y predicción | `src/brain-boost/neon-arena/AimAssist.ts` |
| Menús/HUD/expansión | `src/brain-boost/neon-arena/NeonArenaGame.tsx` y `.css` |
| Audio compartido | `src/brain-boost/brainBoostAudio.ts` |
| Verificación | `tests/brain-boost/` |

Datos de partida, no valores a modificar a ciegas:

- Límite lógico `CONFIG.arena = 21`: cuadrado de unos 42×42, antes del margen del collider.
- Suelo visual: plano 49×49. Cámara ortográfica 3D con seguimiento. No es un escenario 2D falso.
- Existen coordenadas de muros, cámara y spawn con constantes locales, como 20, 21 y 22.
- Hay seis obstáculos circulares compartidos por las reglas actuales.
- Expandir solo cambia alturas CSS: no existe todavía un flujo completo de Fullscreen API.
- En móvil, `min-height: 430px` del stage puede impedir que quepa en horizontal. Cooperativo tiene otras restricciones de altura.
- La música actual usa síntesis procedural a 116 BPM y estados start/horde/danger/boss/victory.
- Última regresión lógica ejecutada: 85/85 pruebas. Verificá nuevamente la línea base antes de cambios funcionales.

Entregá un mapa breve de responsabilidades, archivos afectados y riesgos. Conservá backups y cambios del usuario. No reestructures el repositorio entero.

## 3. Dirección artística propuesta: colonia contaminada

Construí un escenario original: **una instalación industrial abandonada absorbida por un nido alienígena**. Debe sentirse oscuro, material y amenazante, pero el marine, enemigos, disparos y suministros siempre deben distinguirse.

Referencias de diseño:

- **Alien Swarm / Reactive Drop**: estudiar composición de instalaciones, metal, rejillas, maquinaria, luz localizada y profundidad del escenario.
- **Crimsonland**: estudiar legibilidad del suelo bajo grandes hordas, espacios de evasión y contraste entre criaturas, proyectiles y fondo.
- **Phobia II**, referencia aportada por el usuario: conservar la presión del enjambre, el tono orgánico y la tensión de sobrevivir rodeado.

La combinación anterior es una propuesta artística para este proyecto. No copies mapas, HUD, música ni recursos de esas obras.

### Construcción del entorno

La primera entrega debe mejorar un solo mapa completo, sin crear un selector de biomas prematuro:

1. Zona de combate central con suelo industrial erosionado y rutas de escape legibles.
2. Sectores contaminados con membranas, raíces, huevos y restos orgánicos.
3. Perímetro con muros, tuberías, ventiladores y maquinaria que dé escala y profundidad.

Añadí volumen y variedad deliberada: placas hundidas, rejillas, canaletas, contenedores bajos, conducciones y estructuras rotas. Las decoraciones altas se ubican fuera de líneas de combate o permiten ver a través de ellas. No escondas enemigos detrás de props opacos.

Reemplazá la repetición visual evidente del suelo por superficies con detalle coherente. Usá PBR con color, rugosidad y normales cuando aporten una mejora visible. Atlas, variaciones de UV y conjuntos compartidos son preferibles a una textura/material nuevo por objeto. Evitá patrones aleatorios que parezcan ruido o círculos repetidos por toda la arena.

Todo obstáculo transitable o sólido debe ser coherente entre representación y simulación. El detalle cosmético no agrega colisión invisible. El relieve visual no implica una física de altura si no está implementada.

### Luz y efectos

- Base ambiental moderada, contraste local y luz de contorno para reconocer siluetas.
- Frío cian en equipos activos, ámbar en emergencia y verde ácido en contaminación.
- Sombras de contacto discretas; evaluar bakeadas o proyectadas simples para móvil.
- Niebla distante y vapor localizado con partículas limitadas.
- Destellos de armas breves, conservando las señales de ataques enemigos.
- Bloom opcional y tenue. El mapa debe verse bien sin composer.

No agregues iluminación dinámica por cada insecto, SSAO obligatorio, volumétricos costosos o sombras en todas las luces. No cambies de cámara por considerar que perspectiva equivale a más calidad; la escena ortográfica actual ya es 3D. Evaluá la mejora con capturas comparables del mismo encuadre.

## 4. Mapa un poco más grande

Objetivo inicial propuesto: pasar de aproximadamente **42×42 a 50×50 unidades**. Es cerca de 19% más de lado y 42% más de superficie; no es un mundo abierto ni una multiplicación del número de enemigos.

Crear o reutilizar una definición inmutable de arena por partida, compartida por simulación, representación, colisiones y apuntado. La propuesta es un semilado jugable de 25, con márgenes visuales externos. Evitá aumentar únicamente el plano del suelo.

Revisar conjuntamente:

- Límites del marine y enemigos, muros y recorrido de la cámara.
- Distribución de obstáculos y corredores amplios para rodear hordas.
- Puntos de aparición, distancia mínima a ambos marines y aparición de jefes.
- Cobertura de balas, lanzallamas, predicción y adquisición de objetivos.
- Granada de cascada, suministros y efectos en el borde.
- Cámara y viewport de cada jugador en vertical y horizontal.

No escales automáticamente velocidad, salud, cadencia, alcance o número de enemigos con el tamaño del suelo. Primero probá el ritmo: el nuevo espacio no debe producir largas esperas, camping seguro ni hordas inalcanzables. Ajustá parámetros de dirección de oleadas solo con evidencia.

No alejes la cámara para mostrar todo el mapa a la vez: conservá el tamaño legible del marine y el seguimiento, para que recorrer más espacio tenga sentido.

### Compatibilidad determinista

La definición antigua puede conservarse como perfil de regresión si simplifica la migración. No modifiques silenciosamente el spawn individual previamente corregido ni reemplaces sus pruebas por expectativas más débiles.

**La campaña del nuevo mapa predeterminado también tiene que probarse.** Que pase el piloto del perfil antiguo no demuestra que se puedan completar los tres jefes en el mapa nuevo. El piloto debe usar el mismo perfil que selecciona la experiencia real y controlar únicamente entradas legítimas, sin alterar salud, oleadas, enemigos ni RNG durante el recorrido.

Si se retiene un perfil antiguo, documentá claramente qué prueba cada test. No mantengas dos motores ni dos simulaciones. No uses configuración global mutable que pueda mezclar arenas distintas.

## 5. Pantalla completa al girar el teléfono

Objetivo de producto: durante una partida, girar a horizontal debe aprovechar la pantalla para arena, HUD y controles; la landing y el marco del catálogo no deben robar altura.

Distinguí dos estados verificables:

- **Inmersivo de viewport**: ocupa el área disponible del navegador mediante layout, aun si sus barras siguen presentes.
- **Fullscreen nativo**: usa la API del navegador y se confirma mediante `document.fullscreenElement`.

No llames pantalla completa nativa a un simple cambio de altura CSS.

### Comportamiento deseado

1. No expandir ni solicitar fullscreen al recorrer la landing o abrir el catálogo.
2. Con Neon Arena activo en móvil, detectar el cambio real a horizontal y adaptar el layout inmediatamente, conservando partida y renderer.
3. Intentar la entrada nativa por giro cuando el navegador lo permita. El estándar contempla activación por interacción y una excepción para cambios de orientación generados por el usuario; no asumir soporte uniforme ni confundir un resize con esa autorización.
4. Si no se puede entrar por giro, mantener el modo inmersivo y ofrecer **Pantalla completa** con un toque. No mostrar alertas bloqueantes ni repetir solicitudes rechazadas en un loop.
5. Sincronizar el estado con `fullscreenchange` y manejar rechazos. Tener siempre una salida accesible.
6. No bloquear la orientación por defecto: el usuario pidió poder girar. Un bloqueo opcional solo corresponde después de entrar y debe liberarse al salir.
7. Al volver a vertical, restaurar el diseño vertical. Si se decide salir del fullscreen propio en esa transición, hacerlo sin reiniciar la partida y sin afectar fullscreen ajeno.
8. Back/Escape/salida nativa: pausar si se abandona el modo de juego activo, limpiar entradas y resolver primero la salida inmersiva antes de cerrar accidentalmente todo el catálogo. Coordinar con el handler Escape de la landing.

Solicitar fullscreen sobre el contenedor que incluye canvas, HUD, controles y menús. Auditar las restricciones del portal y su dialog antes de modificar estilos. No cambiar keys, desmontar el canvas, duplicar el árbol React o crear otro renderer al expandir/girar.

En CSS, revisar conjuntamente los mínimos de altura, el stage, toolbar, barras de armas y menús. Usar viewport dinámico, safe areas y distribución flexible. En horizontal bajo, el stage debe poder encogerse; no conservar un mínimo de 430/540px que exceda la pantalla. Mantener controles táctiles utilizables y sin scroll obligatorio para disparar o pausar.

El resize conserva estados, ajusta cámaras, scissor rectangles y Raycaster. Cancelar punteros activos al cambiar de geometría evita dejar movimiento o disparo trabados. La pausa y el audio siguen funcionando, y una rotación no puede crear un segundo loop.

Cooperativo: mantener dos vistas consistentes con sus controles; en horizontal favorecer división izquierda/derecha sin tapar cada arena con HUD duplicado innecesario.

## 6. Banda sonora profesional y adaptativa

Objetivo: sustituir la sensación de patrón sintético breve por una composición con identidad, arreglo y mezcla cuidados. Subir el volumen, añadir más osciladores o acelerar el patrón actual no basta.

### Brief musical propuesto

Nombre de trabajo: **Containment Breach**.

Estilo: horror industrial y dark electronic cinematográfico. Pulso grave contenido, percusión metálica, texturas orgánicas, bajo con definición y un motivo reconocible. La tensión debe crecer sin saturar continuamente al jugador.

Propuesta inicial: 128 BPM, 4/4, centro tonal en re menor con coloraciones disonantes controladas. Es una elección artística ajustable por escucha, no una obligación técnica del motor.

Preparar frases de 8/16 compases con variaciones y una forma perceptible de al menos 60–90 segundos antes de repetir el arreglo completo:

- Inicio: ambiente y pulso mínimo.
- Horda: bajo y percusión principal.
- Peligro: capa de tensión; las alertas de gameplay conservan prioridad.
- Jefe: cambio de arreglo y motivo dominante, sin duplicar dos canciones completas.
- Transición de oleada: breve respiración musical.
- Derrota: cierre corto seguido de silencio controlado.

### Producción de los recursos

Preferir stems originales producidos o recursos musicales con licencia de distribución documentada. Entregar archivos reales y un manifiesto con origen, autoría/licencia, BPM, duración, compases, sample rate y puntos de loop. Las fuentes originales pueden conservarse fuera del bundle; la versión web debe estar comprimida y validada en el navegador objetivo.

Si no hay herramientas o recursos capaces de producir esos audios con la calidad pedida, explicar esa limitación y entregar el brief de producción y la integración preparada, manteniendo un fallback explícito. No presentar un placeholder o el viejo patrón renombrado como banda sonora profesional terminada.

No comprar ni contratar servicios sin autorización. No usar pistas de los juegos de referencia.

### Integración

Reutilizar el AudioContext, buses, mute y ownership del sistema compartido. Incorporar stems mediante un transporte musical coherente, con capas sincronizadas y transiciones en límites musicales. Los conceptos de capas y transiciones se toman como referencia de Wwise/FMOD; **no instalar estos middleware** para resolver esta integración web.

Mantener un solo dueño del transporte por partida, también en cooperativo. La música sigue el estado del equipo, no una instancia por cámara. Evitar capas duplicadas al reiniciar, reanudar o girar.

El contenido sonoro y la lógica de adaptación son responsabilidades distintas. Los nuevos recursos no deben imponer un backend ni alterar las reglas deterministas del combate. Reutilizar estados start/horde/danger/boss/victory cuando sean suficientes.

Balancear música, armas, criaturas y avisos. Reservar margen de mezcla para ráfagas, limitar acumulación de graves y usar transiciones de volumen suaves. Debe sonar bien en altavoz de teléfono y auriculares, también en mono; no depender de subgraves inaudibles en móvil. Separar volumen musical del de efectos si puede integrarse sin contradecir el mute global.

Carga diferida al entrar al juego; fallback si falla la red o la decodificación. Presupuestar memoria por PCM decodificado, no solo por tamaño del archivo comprimido. Evitar precargar todos los stems de una composición larga cuando solo se necesitan unos pocos loops.

Pausa, pestaña oculta y salida deben detener el transporte propio. Al reanudar se recupera la sincronía sin saltos de compás ni nodos antiguos. No suspender o cerrar indiscriminadamente el contexto compartido de otros juegos.

## 7. Presupuesto y diagnóstico móvil

Conservar pooling e instancing; crear materiales, geometrías y texturas fuera del frame loop. Liberar correctamente recursos exclusivos. No incrementar límites de enemigos/proyectiles para compensar un mapa más grande.

Definir perfiles bajo/medio/alto a partir de capacidad y medición; el perfil bajo debe conservar la dirección artística. Separar resolución/postprocesado del tamaño lógico de arena. Evitar texturas 4K por defecto, luces y transparencias sin límite.

Añadir diagnóstico opcional de desarrollo: FPS medidos, percentiles de frame time, tiempo CPU aproximado de update/render submission, draw calls por frame completo, triángulos, recursos Three.js y conteos de entidades. Para cooperativo sumar las dos vistas; no medir solo la última llamada a render. No llamar tiempo GPU a una medición CPU ni considerar renderer.info una medición exacta de VRAM. Excluir pausa, pestaña oculta y carga inicial de estadísticas de gameplay.

Objetivo: 60 FPS en el Android objetivo con un perfil adecuado; ofrecer degradación controlada si no se sostiene. Es un objetivo a medir, no una garantía basada en Chromium/SwiftShader. Validar partidas prolongadas para detectar degradación, memoria retenida y efectos de temperatura, distinguiendo observación de sensores realmente disponibles.

## 8. Entrega por hitos

1. Auditoría, capturas de referencia internas y línea base de recursos/rendimiento.
2. Layout inmersivo, fullscreen y rotación: probar en el juego existente antes de cambiar el mapa.
3. Definición compartida de arena y ampliación a 50×50: verificar colisiones, spawn y campaña real.
4. Arte del escenario y perfiles gráficos: comparar el mismo encuadre antes/después y validar legibilidad.
5. Producción de audio, integración adaptativa y mezcla: verificar con escucha y medición.
6. Regresión completa, documentación y entrega del parche incremental.

Después de cada unidad lógica validada, hacer un commit con staging selectivo y reportar hash/mensaje. Nunca usar `git add .` ni `git add -A`; no hacer push automático. Preservar backups. Evitar comandos `echo` en instrucciones para Android.

## 9. Criterios de aceptación

- Nightmare Protocolo conserva su botón compacto, etiqueta y barra violeta completa.
- El mapa tiene mayor espacio jugable real, materiales más convincentes y mejor composición; los enemigos no se confunden con el suelo.
- No hay discrepancias entre obstáculos visibles y colisiones.
- El nuevo perfil predeterminado es jugable hasta los tres jefes mediante entradas reales; las pruebas antiguas se conservan cuando correspondan.
- Mantener FUEGO sigue apuntando automáticamente en Asistido antes y después de rotar. Moderno conserva Raycaster/aim manual.
- Se puede jugar en horizontal sin que las restricciones del modal obliguen a desplazar la página para acceder a controles.
- Fullscreen real se confirma por API; su rechazo deja un fallback funcional y recuperable.
- Rotar, entrar/salir y reanudar no reinician la partida ni duplican canvas, loop o transporte musical.
- La composición tiene variación audible, transiciones suaves, voces claras y procedencia documentada. Un RMS positivo prueba señal, no calidad musical.
- Al salir se limpian fullscreen propio, listeners, captura, scroll temporal, RAF y recursos exclusivos; los otros juegos siguen funcionando.

Ejecutar los scripts existentes de typecheck, tests y build. Actualizar las pruebas de navegador de selección/controles/cooperativo/progresión cuando cambie un contrato real. Añadir pruebas significativas para límites, cobertura y spawn del nuevo mapa, giro con punteros mantenidos, fallo de fullscreen, salida nativa y ciclo de audio.

Probar a 30/60/120 Hz la independencia de la simulación respecto del render. Validar vertical/horizontal, cooperativo y reduced motion. Incluir una prueba física del Android objetivo; la emulación no certifica fullscreen real, ergonomía, rendimiento ni calidad de escucha en el dispositivo.

Entregar cambios, comandos y resultados reales, capturas comparables, recursos musicales, limitaciones pendientes y commits. No declarar completada una mejora solo porque existe un botón o compila.

## 10. Fuentes consultadas para esta propuesta

Consulta: 25 de octubre de 2026. Verificar nuevamente la documentación de APIs al implementar.

- 10tons, Crimsonland y capturas oficiales: https://10tons.com/games/crimsonland
- Valve, Alien Swarm: https://store.steampowered.com/app/630/Alien_Swarm/
- Reactive Drop, galería oficial de escenarios: https://store.steampowered.com/app/563560/Alien_Swarm_Reactive_Drop/
- WHATWG, Fullscreen API y activación por orientación: https://fullscreen.spec.whatwg.org/
- MDN, requestFullscreen: https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
- MDN, bloqueo de orientación: https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock
- Chrome, adaptación edge-to-edge en Android: https://developer.chrome.com/docs/css-ui/edge-to-edge
- Audiokinetic, creación de música interactiva: https://www.audiokinetic.com/en/public-library/2024.1.8_8893/?id=creating_interactive_music&source=Help
- FMOD, conceptos de eventos y parámetros: https://www.fmod.com/docs/2.04/studio/fmod-studio-concepts.html

La documentación de música se localizó mediante el índice público; algunos accesos directos de esos proveedores devolvieron errores. No se descargaron ni escucharon pistas de sus sitios. Las decisiones de tempo, instrumentación, geometría y tamaño son propuestas propias para Neon Arena, no hechos atribuidos a esos juegos o proveedores.
