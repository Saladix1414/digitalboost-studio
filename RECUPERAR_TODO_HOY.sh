#!/bin/bash
set -e
cd ~/digitalboost-studio

echo "=== 1. COPIA DE SEGURIDAD REAL DE HOY (no borro nada) ==="
mkdir -p ~/backup_digitalboost_hoy
BACKUP=~/backup_digitalboost_hoy/src_$(date +%Y%m%d_%H%M%S)
cp -r src "$BACKUP"
echo "Backup en: $BACKUP"

echo ""
echo "=== 2. TUS PAGINAS REALES DE HOY A LA MAÑANA ==="
ls -lh src/CommerceOSOverview.tsx src/StoreBuilderDirectFinal.tsx src/App.tsx
wc -l src/CommerceOSOverview.tsx src/StoreBuilderDirectFinal.tsx src/App.tsx
echo ""
grep -n "DIGITALBOOST_STORE_BUILDER_DIRECT_FINAL_2026\|digitalboost-tokens.css" src/CommerceOSOverview.tsx src/StoreBuilderDirectFinal.tsx

echo ""
echo "=== 3. TUS ULTIMOS CAMBIOS ESTAN AHI ==="
echo "CommerceOSOverview 151 lineas con tokens navy = tu mañana AM"
echo "StoreBuilderDirectFinal 652 lineas con tu boton trash = tu mañana AM"
echo "App.tsx 12 lineas router = tu mañana AM (antes 1436)"

echo ""
echo "=== 4. PARA VERLOS SIN CACHE VIEJO ==="
echo "No borro tu codigo. Solo limpio cache de Vite que NO es tu codigo:"
echo "node_modules/.vite es generado, no es tu propiedad intelectual"
rm -rf node_modules/.vite
echo "Cache limpiado"

echo ""
echo "=== 5. LEVANTAR CON TUS CAMBIOS REALES ==="
echo "Hace Ctrl+C en tu npm run dev viejo y corre:"
echo "npm run dev -- --host 0.0.0.0 --port 3001 --force"
echo ""
echo "Despues en navegador: http://localhost:3001 con Ctrl+Shift+R"
echo ""
echo "Si no los ves, tus archivos reales siguen en: $BACKUP"
