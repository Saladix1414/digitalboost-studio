# Nightmare Protocolo — catálogo de horror

Cambio de producto solicitado por el usuario sobre la base aceptada `bbeb225`.

## Navegación

La barra violeta debajo de las cinco disciplinas conserva su fondo y pasa a mostrar un botón con el nombre exacto **Nightmare Protocolo** y una etiqueta aparte: **HORROR · SUPERVIVENCIA · PSICOLÓGICO**. Se retiran de esa barra los textos Daily Quest / Sesión mixta, Daily Neural Run y Cinco etapas, cinco áreas.

Neon Arena se traslada de Focus Lab a este catálogo. Hay una sola entrada al juego. Se reutilizan los tipos Category/Game, el estado activeCategory/activeGame, el portal, el stage, Suspense y el límite de errores existentes. La selección del catálogo no inicia WebGL; la tarjeta de Neon Arena monta la misma experiencia anterior.

Salir del juego o volver a Modos regresa a Nightmare Protocolo y desmonta el motor. Cerrar el catálogo vuelve a la landing. Los rótulos internos y los enlaces de regreso ya no mencionan Focus Lab.

Los cinco Labs se mantienen separados de esta colección recreativa. Focus Lab conserva Focus Protocol y Signal Hunt. Daily Neural Run continúa accesible mediante su botón en el panel central; no se desarrolla ni se elimina su catálogo. No cambian las claves de récord, arsenal, audio, combate ni controles.

## Dirección visual

Se preserva la barra violeta de la referencia. El botón tiene foco visible y la etiqueta es su descripción accesible, de modo que el nombre del botón solo contiene Nightmare Protocolo. El catálogo usa los estilos existentes con acentos violeta y un emblema triangular propio. La etiqueta puede partirse en líneas en el sidebar estrecho sin truncarse.

## Verificación

- Typecheck Neon Arena: PASS.
- Brain Boost: 85/85 PASS.
- Build: PASS; continúa la advertencia de chunks grandes.
- Navegador escritorio/móvil: PASS, incluido el flujo completo, salida/liberación GPU, recuperación de contexto y catálogo único.
- Regresión de disparo sostenido asistido desde la nueva entrada: PASS con ratón y táctil; modo Moderno táctil conserva apuntado manual.

Las pruebas de navegador existentes de Neon Arena se actualizan para entrar desde Nightmare Protocolo. La prueba de integración verifica texto exacto, catálogo sin iniciar renderer, entrada única, lanzamiento/pausa/retorno, cancelación de RAF y liberación GPU, recuperación de contexto, apertura de Focus Protocol y acceso al Daily conservado.
