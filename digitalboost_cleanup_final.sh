#!/data/data/com.termux/files/usr/bin/bash

set -u

PROJECT="$HOME/digitalboost-studio"
STAMP="$(date +%Y%m%d_%H%M%S)"
SNAPSHOT="$HOME/digitalboost_PRE_CLEANUP_${STAMP}.tar.gz"
REPORT="$HOME/digitalboost_CLEANUP_${STAMP}.txt"

cd "$PROJECT" || {
  echo "ERROR: no se pudo entrar a $PROJECT"
  exit 1
}

echo "=============================================================="
echo " DIGITALBOOST STUDIO — LIMPIEZA CANÓNICA FINAL"
echo "=============================================================="
echo
echo "Proyecto : $PROJECT"
echo "Fecha    : $(date)"
echo

# ==============================================================
# 1. SNAPSHOT DE SEGURIDAD
# ==============================================================

echo "[1/7] Creando snapshot de seguridad..."
echo

tar \
  --exclude='./node_modules' \
  --exclude='./dist' \
  --exclude='./.git' \
  --exclude='./.venv' \
  --exclude='./_archive' \
  -czf "$SNAPSHOT" \
  .

if [ $? -ne 0 ]; then
  echo
  echo "❌ ERROR: no se pudo crear el snapshot."
  echo "NO SE BORRÓ NADA."
  exit 1
fi

echo "✓ Snapshot creado:"
echo "  $SNAPSHOT"
echo

# ==============================================================
# 2. INVENTARIO
# ==============================================================

echo "[2/7] Inventario de backups/históricos actuales..."
echo

find src -maxdepth 1 -type f \
  \( \
    -iname '*backup*' -o \
    -iname '*.bak' -o \
    -iname '*.old' -o \
    -iname '*.orig' -o \
    -iname '*before*' -o \
    -iname '*restore*' -o \
    -iname '*recovery*' -o \
    -iname '*histor*' \
  \) \
  -printf '%TY-%Tm-%Td %TH:%TM:%TS | %p\n' \
  2>/dev/null |
sort -r > "$REPORT"

echo "Inventario guardado en:"
echo "  $REPORT"
echo

# ==============================================================
# 3. PROTECCIONES ABSOLUTAS
# ==============================================================

echo "[3/7] Activando protecciones..."

is_protected() {
  case "$1" in
    ./src/App.tsx)
      return 0
      ;;
    ./src/main.tsx)
      return 0
      ;;
    ./server.ts)
      return 0
      ;;
    ./vite.config.ts)
      return 0
      ;;
    ./package.json)
      return 0
      ;;
    ./agente.md)
      return 0
      ;;
    ./src/DigitalBoostMainPage.tsx)
      return 0
      ;;
    ./src/DigitalBoostOperator.tsx)
      return 0
      ;;
    ./src/StudioDock.tsx)
      return 0
      ;;
    ./src/ai/*)
      return 0
      ;;
    ./src/ollama/*)
      return 0
      ;;
    ./src/openclaw/*)
      return 0
      ;;
    ./src/context/*)
      return 0
      ;;
    ./src/pulse/*)
      return 0
      ;;
    ./docs/*)
      return 0
      ;;
    ./_archive/*)
      return 0
      ;;
  esac

  return 1
}

echo "✓ Código canónico protegido."
echo

# ==============================================================
# 4. DETECTAR BACKUPS POR FAMILIA
# ==============================================================

echo "[4/7] Clasificando backups por familia..."
echo

TMP="$PROJECT/.db_cleanup_tmp_${STAMP}"
mkdir -p "$TMP"

CANDIDATES="$TMP/candidates.txt"
DELETE="$TMP/delete.txt"

: > "$CANDIDATES"
: > "$DELETE"

find src -maxdepth 1 -type f \
  \( \
    -iname '*backup*' -o \
    -iname '*.bak' -o \
    -iname '*.old' -o \
    -iname '*.orig' -o \
    -iname '*before*' -o \
    -iname '*restore*' -o \
    -iname '*recovery*' -o \
    -iname '*histor*' \
  \) \
  -print \
  2>/dev/null |
sort > "$CANDIDATES"

echo "Backups/históricos encontrados:"
echo

if [ -s "$CANDIDATES" ]; then
  cat "$CANDIDATES"
else
  echo "Ninguno."
fi

echo

# ==============================================================
# 5. CONSERVAR LOS 2 MÁS RECIENTES POR FAMILIA
# ==============================================================

echo "[5/7] Conservando solamente los 2 backups más recientes por familia..."
echo

# Generamos lista con:
# fecha_epoch | familia | archivo

META="$TMP/meta.txt"
: > "$META"

while IFS= read -r FILE; do

  [ -z "$FILE" ] && continue
  [ ! -f "$FILE" ] && continue

  BASE="$(basename "$FILE")"

  # Determinar familia canónica.
  FAMILY="$BASE"

  FAMILY="${FAMILY%%.backup*}"
  FAMILY="${FAMILY%%.bak*}"
  FAMILY="${FAMILY%%.old*}"
  FAMILY="${FAMILY%%.orig*}"
  FAMILY="${FAMILY%%.before*}"
  FAMILY="${FAMILY%%.restore*}"
  FAMILY="${FAMILY%%.recovery*}"
  FAMILY="${FAMILY%%.histor*}"

  # Casos *_RESTORED_*
  FAMILY="${FAMILY%%_RESTORED_*}"

  # Si quedó vacío, usar nombre original.
  [ -z "$FAMILY" ] && FAMILY="$BASE"

  MTIME="$(stat -c %Y "$FILE" 2>/dev/null || echo 0)"

  printf '%s\t%s\t%s\n' "$FAMILY" "$MTIME" "$FILE" >> "$META"

done < "$CANDIDATES"

# Para cada familia:
# ordenar por fecha descendente y eliminar desde el tercero.
cut -f1 "$META" |
sort -u |
while IFS= read -r FAMILY; do

  [ -z "$FAMILY" ] && continue

  COUNT=0

  while IFS="$(printf '\t')" read -r FAM TIME FILE; do

    [ "$FAM" = "$FAMILY" ] || continue

    COUNT=$((COUNT + 1))

    if [ "$COUNT" -le 2 ]; then
      echo "CONSERVAR [$FAMILY]: $FILE"
    else
      echo "$FILE" >> "$DELETE"
      echo "ELIMINAR  [$FAMILY]: $FILE"
    fi

  done < <(
    awk -F '\t' -v fam="$FAMILY" '$1 == fam {print}' "$META" |
    sort -t "$(printf '\t')" -k2,2nr
  )

done

echo

# ==============================================================
# 6. WRAPPER MUERTO + BACKUP DE MAIN PAGE
# ==============================================================

echo "[6/7] Eliminando componentes históricos claramente muertos..."
echo

# App.tsx ya importa DigitalBoostMainPage directamente.
# El Wrapper no tiene referencias externas.
if [ -f "./src/DigitalBoostMainPageWrapper.tsx" ]; then

  REFS="$(
    grep -RIl \
      --exclude='DigitalBoostMainPageWrapper.tsx' \
      --exclude-dir=node_modules \
      --exclude-dir=dist \
      --exclude-dir=.git \
      --exclude-dir=.venv \
      --exclude-dir=_archive \
      'DigitalBoostMainPageWrapper' \
      . 2>/dev/null || true
  )"

  if [ -z "$REFS" ]; then
    echo "./src/DigitalBoostMainPageWrapper.tsx" >> "$DELETE"
    echo "ELIMINAR: ./src/DigitalBoostMainPageWrapper.tsx"
  else
    echo "PROTEGER: Wrapper todavía referenciado por:"
    echo "$REFS"
  fi
fi

# El backup específico usado exclusivamente por el Wrapper.
if [ -f "./src/DigitalBoostMainPage.backup.tsx" ]; then

  REFS="$(
    grep -RIl \
      --exclude='DigitalBoostMainPage.backup.tsx' \
      --exclude='DigitalBoostMainPageWrapper.tsx' \
      --exclude-dir=node_modules \
      --exclude-dir=dist \
      --exclude-dir=.git \
      --exclude-dir=.venv \
      --exclude-dir=_archive \
      'DigitalBoostMainPage.backup' \
      . 2>/dev/null || true
  )"

  if [ -z "$REFS" ]; then
    echo "./src/DigitalBoostMainPage.backup.tsx" >> "$DELETE"
    echo "ELIMINAR: ./src/DigitalBoostMainPage.backup.tsx"
  else
    echo "PROTEGER backup MainPage: todavía referenciado."
  fi
fi

sort -u "$DELETE" -o "$DELETE"

echo
echo "=============================================================="
echo " LISTA FINAL DE ELIMINACIÓN"
echo "=============================================================="
echo

if [ -s "$DELETE" ]; then
  nl -ba "$DELETE"
else
  echo "No hay archivos para eliminar."
fi

TOTAL="$(wc -l < "$DELETE" | tr -d ' ')"

echo
echo "Total a eliminar: $TOTAL"
echo

# ==============================================================
# 7. ELIMINACIÓN + BUILD
# ==============================================================

echo "[7/7] Ejecutando limpieza..."
echo

DELETED=0
ERRORS=0

if [ -s "$DELETE" ]; then

  while IFS= read -r FILE; do

    [ -z "$FILE" ] && continue

    if is_protected "$FILE"; then
      echo "⚠ PROTEGIDO — NO SE TOCA: $FILE"
      continue
    fi

    if [ -f "$FILE" ]; then

      rm -f -- "$FILE"

      if [ $? -eq 0 ]; then
        echo "✓ ELIMINADO: $FILE"
        DELETED=$((DELETED + 1))
      else
        echo "❌ ERROR ELIMINANDO: $FILE"
        ERRORS=$((ERRORS + 1))
      fi

    fi

  done < "$DELETE"

fi

rm -rf "$TMP"

echo
echo "=============================================================="
echo " VERIFICACIÓN POST-LIMPIEZA"
echo "=============================================================="
echo

echo "[1] Archivos históricos que permanecen:"
find src -maxdepth 1 -type f \
  \( \
    -iname '*backup*' -o \
    -iname '*.bak' -o \
    -iname '*.old' -o \
    -iname '*.orig' -o \
    -iname '*before*' -o \
    -iname '*restore*' -o \
    -iname '*recovery*' -o \
    -iname '*histor*' \
  \) \
  -printf '  %p\n' \
  2>/dev/null |
sort

echo
echo "[2] Componentes críticos:"
for FILE in \
  src/App.tsx \
  src/main.tsx \
  src/DigitalBoostMainPage.tsx \
  src/DigitalBoostOperator.tsx \
  src/StudioDock.tsx \
  src/ai/DigitalBoostModelRegistry.ts \
  src/ai/DigitalBoostModelRouter.ts \
  src/context/DigitalBoostContextBuilder.ts \
  src/openclaw/DigitalBoostOpenClawBridge.ts \
  src/ollama/client.ts \
  src/DigitalBoostPulseBrain.ts \
  src/DigitalBoostPulseRouter.ts \
  src/DigitalBoostPulseApply.ts
do
  if [ -f "$FILE" ]; then
    echo "  ✓ $FILE"
  else
    echo "  ❌ FALTA $FILE"
  fi
done

echo
echo "[3] BUILD FINAL"
echo

if npm run build; then
  BUILD="PASS"
else
  BUILD="FAIL"
fi

echo
echo "=============================================================="
echo " RESULTADO FINAL"
echo "=============================================================="
echo
echo "Backups/históricos eliminados : $DELETED"
echo "Errores de eliminación        : $ERRORS"
echo "BUILD                         : $BUILD"
echo
echo "Snapshot de seguridad:"
echo "  $SNAPSHOT"
echo
echo "Reporte:"
echo "  $REPORT"
echo

if [ "$BUILD" = "PASS" ] && [ "$ERRORS" -eq 0 ]; then
  echo "✅ LIMPIEZA COMPLETADA CORRECTAMENTE"
  echo "✅ PROYECTO COMPILA"
  echo "✅ CÓDIGO CANÓNICO CONSERVADO"
else
  echo "⚠ REVISAR RESULTADO"
fi

echo
echo "=============================================================="
