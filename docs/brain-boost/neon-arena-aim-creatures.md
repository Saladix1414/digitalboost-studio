# Neon Arena — apuntado asistido y criaturas

Base incremental: `448016e` (hotfix de spawn individual aceptado). Sin dependencias nuevas.

## Integración

Se conservan catálogo, lazy loading, un motor/renderer/simulación, controles cooperativos, música compartida y claves de progreso. No cambia la ruta de spawn individual del hotfix. La simulación sigue admitiendo apuntado clásico para reproducir la campaña anterior; el adaptador de entrada de la experiencia selecciona Asistido como opción inicial para ambos jugadores.

## Disparo

- Asistido: mantener F/FUEGO/gatillo busca un enemigo activo con alcance y línea de visión, en cualquier dirección. No dispara por sí solo.
- La selección favorece proximidad, conserva objetivos estables y prioriza amenazas de contacto. Cada marine tiene objetivo independiente.
- Predicción analítica usando velocidad real del enemigo, limitada a 0.7 segundos y a la vida del proyectil; fallback directo si la predicción cruza cobertura.
- Las balas conservan trayectorias físicas rectas, dispersión propia y colisión barrida. No hay daño automático ni homing invisible.
- En Asistido, ratón, FUEGO táctil y gatillo mantienen siempre el seguimiento automático, incluso al arrastrar. El apuntado manual con ratón, arrastre de FUEGO o stick derecho requiere elegir Moderno.
- Moderno mantiene dirección manual libre. Clásico conserva el desvío de 45°. Selección independiente por jugador.

## Arte y feedback

Geometría original instanciada: abdomen, tórax, cabeza, ojos compuestos, antenas y mandíbulas. Carapace/Iron Maw tienen élitros separados y mandíbulas grandes; Stalker tiene tórax estrecho y garras anteriores; Spitter/Brood tienen sacos laterales y abdomen pulsante. Se mantienen piezas propias de cada jefe.

Referencias anatómicas consultadas (no se incorporan fotografías ni recursos de terceros):

- Natural History Museum, ciervo volante y mandíbulas: https://www.nhm.ac.uk/discover/stag-beetles.html
- Smithsonian Q?rius, mantis, ojos separados y patas anteriores prensiles: https://qrius.si.edu/browse/object/10866419

Destello breve al recibir daño, fragmentos de muerte acotados a eventos, aro cian/ámbar de objetivo. Los efectos respetan movimiento reducido. Los nuevos pools comparten geometrías/materiales y se liberan mediante el dispose existente. Los adornos no alteran radios de colisión.

Sonidos procedurales por especie para muerte/ataque y entrada de jefe; bus compartido, mute existente, límite global de voces y por especie/evento. Sin contextos ni intervalos adicionales.

El resumen final muestra únicamente las armas realmente obtenidas durante esa partida; el arsenal local permanece entre sesiones. La entrada de jefe anuncia su nombre sin bloquear el combate.

## Verificación

- `npm run typecheck:neon-arena`: PASS.
- `npm run test:brain-boost`: 85/85 PASS (Node 24.22.1).
- Node 26.4.0: las mismas 85/85 PASS, incluida la campaña por entrada real hasta oleada 16 / tres jefes.
- `npm run build`: PASS; se conserva la advertencia de chunks grandes.
- Navegador Chromium/WebGL 2 con SwiftShader: escritorio y táctil, selección/Strict Mode/controles/pausa/Shockwave/salida/liberación GPU/context loss y otra experiencia PASS.
- Cooperativo: dos teclados, dos mandos, desconexión/pausa, cuatro punteros, rotación, dos vistas/un RAF, recursos individuales, derrota/reinicio/records/salida PASS.
- Progresión: derrotas de tres jefes, persistencia inmediata, equipamiento posterior y consumo de combustible PASS.
- Música compartida: RMS medido 0.00380, un scheduler, silencio en pausa, reanudar/mute/salida PASS.
- Nueva prueba de navegador: asistencia predeterminada elimina un objetivo detrás del marine con entrada F sin moverlo; apuntado manual Raycaster; pools de siete especies; resultado final con Lanzallamas obtenido y persistido PASS.
- Audio de criaturas: salida RMS positiva de siete voces, 100 eventos simultáneos programan una sola voz, mute bloquea nuevas voces PASS.
- Revisión visual de capturas de la arena normal, móvil y galería controlada de siete especies. La galería solo existe como fixture de pruebas; no hay menú/debug añadido a producción.

La nueva prueba detectó y permitió corregir un caso real: mover el cursor sobre el menú dejaba una dirección manual que bloqueaba la asistencia. Esa primera corrección protegía el teclado, pero no el disparo sostenido con ratón o dedo; la corrección posterior descrita abajo conserva el seguimiento en esos casos. No se atribuyen FPS, temperaturas ni rendimiento físico de Android a pruebas de Chromium con GPU de software. La validación humana en el teléfono sigue siendo necesaria para dificultad y comodidad de los controles.


## Corrección de disparo sostenido

El reporte del usuario reveló que la primera entrega permitía que el apuntado manual anulara la asistencia: mouse-down fijaba una dirección y un desplazamiento táctil de más de 8px hacía desaparecer el objetivo. Se reproduce con una prueba real de navegador que falla antes de la corrección.

La entrada del motor envía dirección manual exclusivamente en Moderno. Asistido conserva la selección automática de la simulación al mantener el disparo con cualquier dispositivo. Se actualizó la ayuda dentro del juego. No cambia daño, cadencia, dificultad, spawn, persistencia ni geometría.

Verificación del hotfix:

- Typecheck, 85/85 tests Brain Boost y build: PASS.
- Prueba nueva: ratón mantenido en canvas, FUEGO con ratón fuera del centro y arrastre, FUEGO táctil fuera del centro y arrastre; mata dos objetivos opuestos sin soltar ni mover al marine, y soltar detiene el disparo: PASS.
- Modo Moderno táctil sigue apuntando en la dirección elegida: PASS.
- Regresión de apuntado manual por Raycaster, resultados, modelos y audio: PASS.
- Regresión cooperativa: dos teclados, dos gamepads, cuatro punteros, rotación, recursos separados, pausa/desconexión, derrota/reinicio y limpieza GPU: PASS.

El navegador táctil se ejecutó con Chromium/SwiftShader. La prueba física en el teléfono del usuario queda pendiente.
