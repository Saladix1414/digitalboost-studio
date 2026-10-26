# Neon Arena V6 — auditoría y propuesta de evolución

Fecha: 26 de octubre de 2026  
Base auditada: rama `feat/neon-arena-v5`, commit `f2ba1b0`  
Estado de trabajo al auditar: cambios del usuario sin tocar en `.phase-backups/`, `data/` y el backup de `BrainBoostLandingSection.tsx`.

## Resultado de la auditoría

La integración está estable: Neon Arena vive dentro de Nightmare Protocolo, usa el
renderer Three.js/WebGL2 existente, comparte una simulación determinista con la
representación, mantiene cinco armas, tres jefes, cooperativo local y un solo loop.
La línea actual pasa typecheck y 93/93 pruebas de Brain Boost.

La escena ya tiene suelo industrial PBR, cobertura física compartida, maquinaria,
membranas, contaminación, raíces y huevos periféricos. Los enemigos se dibujan con
volúmenes separados para abdomen, tórax, cabeza, ojos, antenas, mandíbulas,
élitros, placas y patas. El resultado es legible y estilizado, pero todavía tiene
una silueta low poly común: falta que cada especie parezca una criatura distinta
antes de que el jugador lea su color o nombre.

El sistema actual de oleadas genera un jefe cuando `wave % 5 === 0`. La función
`bossForWave` asigna BROOD MOTHER a la primera aparición, IRON MAW a la décima y
HIVE SOVEREIGN a la decimoquinta. Esto contradice la nueva intención de dejar más
espacio entre la primera pelea y el siguiente jefe.

El cambio de armas ya está disponible durante una partida: los botones del arsenal
inferior llaman a `simulation.equip`, las teclas `1–5` equipan directamente, `Q`
recorre el arsenal, y los gamepads usan LB. En móvil la interacción existe, pero
los botones son pequeños y quedan separados del área de combate; falta una
presentación de acceso rápido con ranuras claras, arma activa, munición y estado de
bloqueo. La acción no debe pausar, perder el foco del canvas ni interrumpir fuego
asistido.

## Referencias externas y aprendizajes aplicables

- Crimsonland usa supervivencia, oleadas, un catálogo amplio de armas y modos, y
  cientos de criaturas en pantalla. La lección para Neon Arena es la legibilidad
  a gran densidad y el cambio de arma como decisión inmediata, no copiar su HUD ni
  sus recursos: https://10tons.com/news/crimsonland-brings-gratifying-top-down-shooting-to-xbox-one-on-october-14th
- Alien Swarm: Reactive Drop combina enjambres, roles de amenaza, armas con
  restricciones y enemigos con funciones reconocibles. Sus notas también muestran
  el valor de una enciclopedia de criaturas y una rejilla de selección de armas
  orientada a memoria muscular: https://store.steampowered.com/app/563560/Alien_Swarm_Reactive_Drop/
- La guía oficial de Terminids de Helldivers 2 diferencia carroñeros, cazadores,
  escupidores, cargadores y comandantes por anatomía y comportamiento. La lección
  es asignar a cada insecto una silueta, locomoción, órgano vulnerable y patrón de
  amenaza: https://www.playstation.com/es-es/games/helldivers-2/
- Deep Rock Galactic documenta oleadas puras de variantes y el problema de
  equilibrar enemigos nuevos entre cooperativo y solo. La lección es introducir
  amenazas por familias y revisar el ritmo para no hacer que el mapa ampliado
  perjudique la partida individual: https://www.deeprockgalactic.com/updatesold
- Halls of Torment demuestra el valor de una lectura de horda clara con una
  dirección visual fuerte y una progresión de recompensas reconocible. Se usa como
  referencia de ritmo y contraste, no como fuente de arte: https://store.steampowered.com/app/2218750/Halls_of_Torment/

Estas referencias fundamentan decisiones de diseño por inferencia; no se copiarán
modelos, mapas, música, nombres ni interfaces.

## Propuesta V6

### 1. Insectos alienígenas más monstruosos

Mantener las siete especies actuales y profundizar su identidad:

| Familia actual | Evolución visual propuesta | Señal de gameplay |
|---|---|---|
| Skitter / carapace | placas segmentadas, abdomen translúcido y patas con articulaciones visibles | masa rápida / resistencia |
| Spitter / brood | saco ácido pulsante, boca abierta y membrana dorsal | amenaza a distancia / cría |
| Stalker / maw | tórax estrecho, patas delanteras de salto y mandíbula de embestida | carga y presión cercana |
| Sovereign | corona de placas, órganos orbitales y núcleo expuesto | jefe con fases |

Cada variante debe conservar una lectura a escala móvil: color de núcleo, pose de
ataque, flash de impacto, órgano vulnerable y animación de muerte. La mejora debe
salir de geometría/materiales compartidos e instancing, no de una textura pesada
por enemigo ni de luces dinámicas individuales.

### 2. Cadencia de jefes extendida

Primera propuesta verificable: jefes en las oleadas `5, 12, 20, 29, 39, 50...`.
Los intervalos crecen `+7, +8, +9, +10...`, dejando que cada arma desbloqueada
tenga tiempo real de uso. La secuencia de especies puede repetirse con variantes de
fase y apariencia después del tercer jefe, sin crear todavía una cuarta recompensa
persistente.

La regla debe vivir en una función pura compartida por HUD, simulación y pruebas.
No debe depender de `% 5`, del renderer ni de un estado global. `nextEncounter`
debe anunciar la siguiente oleada real y una oleada solo puede generar un jefe una
vez. La campaña de aceptación debe actualizarse para probar al menos las oleadas
12 y 20 además de los tres jefes existentes.

### 3. Cambio rápido de armas durante la partida

Mantener los contratos actuales y añadir una barra de cinco ranuras compactas,
siempre visible durante `PLAYING` y `WAVE_TRANSITION`:

- toque directo en una ranura;
- número grande y nombre corto;
- munición y color por arma;
- marca clara de arma activa;
- bloqueo visible para armas no desbloqueadas;
- `Q`/LB como ciclo de respaldo;
- `1–5` y Numpad para teclado/cooperativo;
- `aria-label`, foco conservado y `preventDefault` táctil para no desplazar la landing.

El cambio no debe cancelar un disparo sostenido, reiniciar cooldowns, duplicar
munición ni crear una autoridad de estado paralela en React.

## Riesgos de regresión

- Cambiar la cadencia con una fórmula nueva puede romper los pilotos deterministas
  actuales si el test sigue suponiendo jefes en 10 y 15.
- Aumentar detalle geométrico por enemigo puede multiplicar draw calls o memoria;
  las nuevas piezas deben agruparse en `InstancedMesh` y tener perfil reducido.
- Los huevos y raíces no deben convertirse en colisiones implícitas ni esconder
  proyectiles, pickups o señales de jefe.
- Una barra de armas sobre los controles táctiles puede robar altura en horizontal;
  debe probarse con viewport estrecho y cooperativo.
- La progresión persistente de armas ya está aceptada; no se debe resetear la clave
  local ni mezclarla con `Cognitive Score`.

## Orden recomendado de implementación

1. Extraer y probar la nueva tabla de encuentros `5, 12, 20...`.
2. Integrar la cadencia en simulación, HUD, campaña y cooperativo.
3. Rediseñar la barra de cambio rápido y validar fuego sostenido, teclado, táctil y
   dos jugadores.
4. Mejorar anatomía y materiales de skitter, spitter/stalker y jefes usando pools
   compartidos.
5. Comparar capturas con la misma cámara y correr 93 pruebas más las nuevas de
   progresión, rendimiento y legibilidad.

No se propone crear una aplicación nueva, otro renderer, un segundo motor de
simulación, multijugador en red ni un selector de biomas prematuro.

## Estado de implementación V6

La primera unidad V6 ya está integrada:

- `38789bd`: la colonia usa encuentros en `5, 12, 20, 29, 39, 50...`; Legacy
  conserva la cadencia histórica para sus regresiones.
- `e68d97f`: la barra de armas muestra tecla, nombre corto, munición y selección
  activa durante el combate, con soporte táctil y cooperativo.
- `465ad80`: las criaturas reciben núcleos luminosos por familia y colmillos
  instanciados para reforzar sus siluetas de ataque.

La campaña Colony se extendió a la oleada 21 para comprobar los tres primeros
jefes en la nueva cadencia. La validación actual es 94/94 pruebas, typecheck y
build PASS. El aviso de chunks grandes existente se conserva. La comprobación
visual final en el teléfono sigue siendo necesaria para ajustar tamaño de la barra,
legibilidad de las criaturas y rendimiento sostenido.
