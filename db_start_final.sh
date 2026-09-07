#!/data/data/com.termux/files/usr/bin/bash

set -u

echo
echo "============================================================"
echo " DIGITALBOOST — ARRANQUE FINAL"
echo "============================================================"
echo

# ------------------------------------------------------------
# 1. PROYECTO
# ------------------------------------------------------------

if [ ! -f package.json ]; then
  echo "ERROR: package.json no existe."
  exit 1
fi

if [ ! -f server.ts ]; then
  echo "ERROR: server.ts no existe."
  exit 1
fi

echo "OK: proyecto encontrado."
echo

# ------------------------------------------------------------
# 2. TSX
# ------------------------------------------------------------

echo "============================================================"
echo " COMPROBANDO TSX"
echo "============================================================"

if command -v tsx >/dev/null 2>&1; then
  echo "OK: tsx global disponible."
elif [ -x "node_modules/.bin/tsx" ]; then
  echo "OK: tsx local disponible."
else
  echo "TSX no está instalado."
  echo "Instalándolo como dependencia de desarrollo..."
  echo

  npm install --save-dev tsx

  if [ $? -ne 0 ]; then
    echo
    echo "ERROR: no se pudo instalar tsx."
    exit 1
  fi

  echo
  echo "OK: tsx instalado."
fi

echo

# ------------------------------------------------------------
# 3. LIMPIAR CACHE VITE
# ------------------------------------------------------------

echo "============================================================"
echo " LIMPIANDO CACHE"
echo "============================================================"

if [ -d node_modules/.vite ]; then
  rm -rf node_modules/.vite
  echo "OK: node_modules/.vite eliminado."
else
  echo "node_modules/.vite no existía."
fi

if [ -d .vite ]; then
  rm -rf .vite
  echo "OK: .vite eliminado."
else
  echo ".vite no existía."
fi

echo

# ------------------------------------------------------------
# 4. BUILD
# ------------------------------------------------------------

echo "============================================================"
echo " BUILD"
echo "============================================================"

npm run build

BUILD_CODE=$?

if [ "$BUILD_CODE" -ne 0 ]; then
  echo
  echo "ERROR: el build falló."
  echo "No se iniciará el servidor."
  exit "$BUILD_CODE"
fi

echo
echo "OK: build terminado correctamente."
echo

# ------------------------------------------------------------
# 5. LIBERAR SOLO EL PUERTO 3000 SI ESTA OCUPADO
# ------------------------------------------------------------

echo "============================================================"
echo " COMPROBANDO PUERTO 3000"
echo "============================================================"

PORT_PID=""

if command -v lsof >/dev/null 2>&1; then
  PORT_PID=$(lsof -t -iTCP:3000 -sTCP:LISTEN 2>/dev/null | head -1)
fi

if [ -n "$PORT_PID" ]; then
  echo "Puerto 3000 ocupado por PID: $PORT_PID"
  echo "Terminando proceso anterior..."
  kill "$PORT_PID" 2>/dev/null || true
  sleep 1
fi

# ------------------------------------------------------------
# 6. ARRANCAR SERVIDOR
# ------------------------------------------------------------

echo
echo "============================================================"
echo " INICIANDO DIGITALBOOST"
echo "============================================================"
echo

if [ -x "node_modules/.bin/tsx" ]; then
  ./node_modules/.bin/tsx server.ts &
  SERVER_PID=$!
else
  tsx server.ts &
  SERVER_PID=$!
fi

echo "PID DEL SERVIDOR: $SERVER_PID"
echo

# ------------------------------------------------------------
# 7. ESPERAR SERVIDOR
# ------------------------------------------------------------

READY=0

for i in $(seq 1 20); do

  sleep 1

  HTTP=$(curl -sS -o /tmp/digitalboost_runtime.html \
    -w '%{http_code}' \
    http://127.0.0.1:3000/ 2>/dev/null)

  if [ "$HTTP" = "200" ]; then
    READY=1
    break
  fi

  echo "Esperando servidor... $i/20"
done

echo

# ------------------------------------------------------------
# 8. VERIFICACION
# ------------------------------------------------------------

if [ "$READY" -eq 1 ]; then

  echo "============================================================"
  echo " ✅ SERVIDOR FUNCIONANDO"
  echo "============================================================"
  echo
  echo "HTTP: 200"
  echo "URL LOCAL:"
  echo "http://127.0.0.1:3000"
  echo

  echo "HTML SERVIDO:"
  echo "------------------------------------------------------------"

  sed -n '1,80p' /tmp/digitalboost_runtime.html 2>/dev/null

  echo
  echo "------------------------------------------------------------"
  echo
  echo "IMPORTANTE:"
  echo "El servidor ya está ejecutándose."
  echo
  echo "NO cierres esta terminal."
  echo "Abrí el navegador en:"
  echo "http://127.0.0.1:3000"
  echo
  echo "Después hacé una recarga completa."
  echo
  echo "Para detener el servidor:"
  echo "Ctrl+C"
  echo
  echo "============================================================"

  # Mantener el proceso en primer plano.
  wait "$SERVER_PID"

else

  echo "============================================================"
  echo " ❌ EL SERVIDOR NO RESPONDE"
  echo "============================================================"
  echo
  echo "Se esperaba HTTP 200 en:"
  echo "http://127.0.0.1:3000"
  echo
  echo "Procesos Node/TSX:"
  ps -ef 2>/dev/null | grep -E 'tsx|server\.ts|node' | grep -v grep
  echo

  kill "$SERVER_PID" 2>/dev/null || true

  exit 1
fi

