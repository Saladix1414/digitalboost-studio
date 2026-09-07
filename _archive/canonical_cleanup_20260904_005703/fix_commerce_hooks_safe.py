from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import re
import sys

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "StoreBuilderWorkspace.tsx"

print()
print("==============================================")
print(" DIGITALBOOST COMMERCE OS — FIX DEFINITIVO")
print("==============================================")
print()

if not FILE.exists():
    raise SystemExit("❌ No se encontró src/StoreBuilderWorkspace.tsx")

original = FILE.read_text(encoding="utf-8")

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_hook_fix_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print(f"✓ Backup creado: {backup.name}")
print()

# ------------------------------------------------------------
# 1. DETECTAR EL BOOT INTERNO
# ------------------------------------------------------------

boot_state = re.search(
    r'\n\s*const\s+\[commerceOSBooting,\s*setCommerceOSBooting\]\s*=\s*useState\(true\);',
    original
)

boot_effect = re.search(
    r'\n\s*useEffect\(\(\)\s*=>\s*\{\s*'
    r'const\s+timer\s*=\s*window\.setTimeout\(\(\)\s*=>\s*\{\s*'
    r'setCommerceOSBooting\(false\);\s*'
    r'\},\s*1500\);\s*'
    r'return\s+\(\)\s*=>\s*window\.clearTimeout\(timer\);\s*'
    r'\},\s*\[\]\);',
    original,
    re.S
)

boot_return = re.search(
    r'\n\s*if\s*\(\s*commerceOSBooting\s*\)\s*\{.*?\n\s*\}',
    original,
    re.S
)

if not boot_state:
    print("ℹ️ No se encontró el estado commerceOSBooting.")
else:
    print("✓ Estado interno del boot localizado.")

if not boot_effect:
    print("ℹ️ No se encontró el useEffect del boot.")
else:
    print("✓ useEffect interno del boot localizado.")

if not boot_return:
    print("ℹ️ No se encontró el return interno del boot.")
else:
    print("✓ Return interno del boot localizado.")

# ------------------------------------------------------------
# 2. ELIMINAR ÚNICAMENTE EL BOOT INTERNO
# ------------------------------------------------------------

new_text = original

if boot_return:
    new_text = new_text[:boot_return.start()] + new_text[boot_return.end():]

if boot_effect:
    new_text = new_text[:boot_effect.start()] + new_text[boot_effect.end():]

if boot_state:
    new_text = new_text[:boot_state.start()] + new_text[boot_state.end():]

# ------------------------------------------------------------
# 3. LIMPIAR COMENTARIOS DEL BOOT, SI QUEDARON VACÍOS
# ------------------------------------------------------------

new_text = re.sub(
    r'\n\s*//\s*-{10,}\s*\n'
    r'\s*//\s*DIGITALBOOST COMMERCE OS — BOOT SEQUENCE\s*\n'
    r'\s*//\s*-{10,}\s*\n',
    "\n",
    new_text,
    flags=re.I
)

new_text = re.sub(
    r'\n\s*//\s*-{10,}\s*\n'
    r'\s*//\s*COMMERCE OS LOADING SCREEN\s*\n'
    r'\s*//\s*-{10,}\s*\n',
    "\n",
    new_text,
    flags=re.I
)

# ------------------------------------------------------------
# 4. VERIFICACIÓN CRÍTICA
# ------------------------------------------------------------

if re.search(r'commerceOSBooting', new_text):
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Todavía existe commerceOSBooting en el archivo. "
        "Se restauró el backup."
    )

# Verificar que el componente comienza con sus hooks normales.
component_match = re.search(
    r'export\s+default\s+function\s+StoreBuilderWorkspace[\s\S]{0,3000}',
    new_text
)

if not component_match:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se pudo verificar el componente. "
        "Se restauró el backup."
    )

component_start = component_match.group(0)

if "const [openGroups" not in component_start:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ openGroups no quedó en la zona inicial del componente. "
        "Se restauró el backup."
    )

# ------------------------------------------------------------
# 5. VERIFICAR QUE NO HAYA RETURN ANTES DE openGroups
# ------------------------------------------------------------

open_pos = new_text.find("const [openGroups")

if open_pos == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit("❌ No se encontró openGroups.")

component_body_start = new_text.find("{", new_text.find(
    "export default function StoreBuilderWorkspace"
))

if component_body_start == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit("❌ No se pudo localizar el cuerpo del componente.")

prefix = new_text[component_body_start:open_pos]

# No debería existir un return JSX antes de openGroups.
if re.search(r'\breturn\s*\(', prefix):
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Hay un return antes de openGroups. "
        "Se restauró el backup para evitar otro error de hooks."
    )

# ------------------------------------------------------------
# 6. GUARDAR CAMBIO
# ------------------------------------------------------------

FILE.write_text(new_text, encoding="utf-8")

print()
print("==============================================")
print("✓ BOOT INTERNO ELIMINADO")
print("==============================================")
print()
print("✓ StoreBuilderWorkspace vuelve a tener hooks")
print("  en un orden estable.")
print("✓ CommerceOSBoot queda separado.")
print("✓ DigitalBoostMainPage NO modificada.")
print("✓ Splash NO modificada.")
print("✓ App.tsx NO modificada.")
print()

# ------------------------------------------------------------
# 7. BUILD DE SEGURIDAD
# ------------------------------------------------------------

print("===== BUILD DE SEGURIDAD =====")
print()

result = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)

if result.returncode != 0:
    print()
    print("❌ BUILD FALLÓ")
    print()
    print("Restaurando StoreBuilderWorkspace.tsx...")
    shutil.copy2(backup, FILE)
    print("✓ Archivo restaurado.")
    print("✓ No quedó aplicado un cambio roto.")
    sys.exit(1)

# ------------------------------------------------------------
# 8. VERIFICACIÓN FINAL
# ------------------------------------------------------------

final_text = FILE.read_text(encoding="utf-8")

if "commerceOSBooting" in final_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Verificación final fallida. Archivo restaurado."
    )

print()
print("==============================================")
print("✅ BUILD CORRECTO")
print("==============================================")
print()
print("Arquitectura:")
print()
print("Splash")
print("   ↓")
print("Página principal")
print("   ↓")
print("Commerce OS Boot")
print("   ↓")
print("Store Builder")
print()
print("✓ Error 'Rendered more hooks' corregido")
print("✓ Boot interno eliminado del Store Builder")
print("✓ CommerceOSBoot independiente")
print("✓ Splash intacta")
print("✓ Página principal intacta")
print("✓ App.tsx intacto")
print("✓ Build correcto")
print()
print(f"Backup disponible en:")
print(f"  {backup}")
print()
print("👉 Ahora reiniciá el servidor y recargá la web.")
print()

