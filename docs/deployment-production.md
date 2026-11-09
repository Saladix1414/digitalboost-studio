# Base de despliegue — DigitalBoost Studio

Esta entrega prepara el proceso HTTP y su imagen Docker. No habilita publicación
del Web Builder, cuentas compartidas ni persistencia remota. Mantener el entorno
de pruebas privado hasta conectar autenticación y revisar las rutas públicas de IA.

## Arranque

Usar Node 24 o una versión compatible, desde la raíz del repositorio:

```sh
npm ci
npm run build
npm run test:websites-builder
npm run test:deployment
npm start
```

PORT acepta un entero de 1 a 65535, por defecto 3000. El servidor escucha en
0.0.0.0. npm start establece NODE_ENV=production y usa node --import tsx;
tsx es dependencia de ejecución. Vite solo se importa en desarrollo.

La aplicación requiere dist/index.html antes de iniciar en producción. Las
variables se inyectan desde el proveedor; el servidor no lee automáticamente
.env. No poner secretos en variables VITE_ ni en el build del frontend.

## Salud y rutas

- /api/health/live: proceso HTTP vivo; no certifica funcionalidades.
- /api/health/ready: alias del chequeo de infraestructura existente.
- /api/health/infrastructure: conserva su contrato y diagnóstico.
- Los proveedores desactivados se informan como disabled; un 200 no significa que
  haya base de datos o publicación conectada. Unavailable devuelve 503; degraded
  conserva el comportamiento existente de 200.
- El chequeo existente de almacenamiento comprueba composición, no realiza una
  escritura real en S3. Verificar acceso por separado al habilitarlo.
- Las rutas /api desconocidas devuelven JSON 404. Los assets ausentes no reciben
  index.html. Las rutas de navegación sin extensión conservan el fallback SPA.
- SIGTERM/SIGINT cierra los streams Commerce y las conexiones. El límite para
  terminar es 10 segundos; el orquestador debe conceder al menos 15 segundos.

## Docker — servidor Linux, no Termux

```sh
docker build -t digitalboost:production-base .
docker run --rm --name digitalboost-check -p 127.0.0.1:3000:3000 digitalboost:production-base
```

El binding a 127.0.0.1 deja esta prueba accesible solo en el servidor. Para abrirla
usar el proxy HTTPS del proveedor después de completar los controles de acceso.

La imagen usa Node 24 Debian slim, build separado, dependencias de ejecución y
usuario node sin privilegios. No incluye .env, backups, logs ni .git. No ejecutar
npm run build en la etapa runtime: esa etapa no incluye todas las herramientas de build.

Construir en la arquitectura elegida y validar allí (amd64 o arm64). La etiqueta
base sigue actualizaciones de Node 24; para una release aprobada registrar el
digest de la imagen. No se ha creado ningún servicio remoto.

## Variables

Consultar .env.example. En este bloque todos los proveedores permanecen
desactivados. Activar PostgreSQL, Redis, S3 o colas requiere servicios reales,
credenciales, migraciones y pruebas de integración. Los proyectos Web Builder
siguen locales. Nunca inferir un usuario autenticado desde datos del navegador.

## Verificación y reversión

test:deployment lanza el servidor real en un puerto libre, verifica HTTP, frontend,
assets, errores API, salud y apagado con SSE; comprueba también PORT inválido y
build ausente. Requiere npm run build previamente. No llama a servicios de IA ni
bases de datos.

El instalador guarda copia de los archivos afectados y comprueba el parche antes
de escribir. Los cambios ajenos se conservan. No instala dependencias, no publica
servicios y no hace push. Registrar un commit selectivo después de validar en
Termux. Volver a la imagen anterior revierte este bloque; no contiene migraciones.
