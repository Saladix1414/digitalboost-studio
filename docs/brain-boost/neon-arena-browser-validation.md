# Neon Arena — validación de navegador y Android

## Navegador automatizado

Requiere Node, las dependencias del repositorio y Chromium. El runner usa
`NEON_BROWSER_EXECUTABLE` cuando está definido y, en Linux, detecta Chromium o
Google Chrome en sus rutas habituales.

```bash
npm install
npm run test:neon-arena:browser:core
npm run test:neon-arena:browser
```

Las suites cubren selección y ciclo de vida, modo inmersivo, disparo mantenido,
apuntado, cooperativo, progresión, audio y el fixture industrial de oleada 4.

Para generar solamente las capturas reproducibles:

```bash
NEON_CAPTURE_DIR=/tmp/neon-industrial npm run capture:neon-arena
```

El fixture produce el estado 16:9, la vista móvil vertical, cooperativo y la
secuencia movimiento → disparo → ácido → salud crítica. Las métricas impresas
por la captura corresponden a la misma escena y calidad.

## Termux y Android real

Playwright no distribuye un Chromium ejecutable para Android. Que los tests de
Node, el typecheck y el build pasen en Termux no equivale a una comprobación del
navegador Android real.

En Android se valida manualmente desde `npm run dev`:

- entrada Brain Boost → Nightmare Protocolo → Neon Arena;
- orientación horizontal, vertical y retorno desde pantalla completa;
- joystick, disparo mantenido, Shockwave y pausa;
- rotación sin duplicar canvas ni perder controles;
- recuperación de progreso y armas tras recargar;
- cooperativo y separación de controles;
- bloom desactivado y movimiento reducido;
- cierre del juego sin audio, render o controles residuales.

Registrar modelo, versión de Android, navegador y calidad gráfica. No marcar
“Android real validado” basándose únicamente en Playwright o emulación.
