from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "StoreBuilderWorkspace.tsx"

print()
print("==============================================")
print(" DIGITALBOOST COMMERCE OS")
print(" FIX PRECISO DE HOOKS")
print("==============================================")
print()

if not FILE.exists():
    raise SystemExit("❌ No existe src/StoreBuilderWorkspace.tsx")

# ============================================================
# 1. CREAR BACKUP DEL ESTADO ACTUAL
# ============================================================

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_precise_fix_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print(f"✓ Backup actual: {backup.name}")

# ============================================================
# 2. LEER ARCHIVO
# ============================================================

text = FILE.read_text(encoding="utf-8")

# ============================================================
# 3. LOCALIZAR EXACTAMENTE EL ESTADO DEL BOOT
# ============================================================

state_pattern = re.compile(
    r'\n[ \t]*const[ \t]+\[commerceOSBooting,\s*setCommerceOSBooting\]'
    r'[ \t]*=[ \t]*useState\(true\);'
)

state_match = state_pattern.search(text)

if not state_match:
    print("ℹ️ commerceOSBooting ya no existe.")
    print("No se realizará ninguna modificación.")
    print()
    print("===== BUILD =====")

    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT
    )

    if result.returncode != 0:
        print("❌ El proyecto ya no compila.")
        shutil.copy2(backup, FILE)
        sys.exit(1)

    print()
    print("✅ BUILD CORRECTO")
    sys.exit(0)

print("✓ Estado commerceOSBooting localizado.")

# ============================================================
# 4. LOCALIZAR EL useEffect EXACTO
# ============================================================

effect_pattern = re.compile(
    r'\n[ \t]*useEffect\(\(\)[ \t]*=>[ \t]*\{'
    r'[ \t]*\n?[ \t]*const[ \t]+timer[ \t]*=[ \t]*window\.setTimeout'
    r'\(\(\)[ \t]*=>[ \t]*\{'
    r'[ \t]*\n?[ \t]*setCommerceOSBooting\(false\);'
    r'[ \t]*\n?[ \t]*\}[ \t]*,[ \t]*1500\);'
    r'[ \t]*\n?[ \t]*return[ \t]+\(\)[ \t]*=>[ \t]*window\.clearTimeout\(timer\);'
    r'[ \t]*\n?[ \t]*\}[ \t]*,[ \t]*\[\][ \t]*\);',
    re.S
)

effect_match = effect_pattern.search(text)

if not effect_match:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Encontré commerceOSBooting pero no su useEffect exacto.\n"
        "No voy a modificar el archivo."
    )

print("✓ useEffect del boot localizado.")

# ============================================================
# 5. LOCALIZAR EL BLOQUE VISUAL EXACTO
# ============================================================

if_start = text.find(
    "if (commerceOSBooting) {",
    effect_match.end()
)

if if_start == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No encontré el bloque visual del boot.\n"
        "No voy a modificar el archivo."
    )

print("✓ Bloque visual del boot localizado.")

# ============================================================
# 6. ENCONTRAR EL CIERRE EXACTO DEL IF
# ============================================================

# Desde "if (commerceOSBooting) {" contamos llaves.
brace_start = text.find("{", if_start)

depth = 0
if_end = -1

for i in range(brace_start, len(text)):
    char = text[i]

    if char == "{":
        depth += 1
    elif char == "}":
        depth -= 1

        if depth == 0:
            if_end = i + 1
            break

if if_end == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No pude determinar el cierre del bloque boot.\n"
        "No voy a modificar el archivo."
    )

# ============================================================
# 7. VERIFICAR QUE EL BLOQUE CONTIENE LA PANTALLA ESPERADA
# ============================================================

boot_block = text[if_start:if_end]

required_markers = [
    "Commerce OS",
    "Inicializando tu entorno comercial",
    "DIGITALBOOST COMMERCE OS",
    "commerceBootProgress",
]

missing = [
    marker for marker in required_markers
    if marker not in boot_block
]

if missing:
    shutil.copy2(backup, FILE)

    raise SystemExit(
        "❌ El bloque localizado no coincide con el boot esperado.\n"
        f"Faltan: {missing}\n"
        "Archivo restaurado."
    )

print("✓ Bloque confirmado como Commerce OS Boot.")

# ============================================================
# 8. ELIMINAR SOLAMENTE ESTOS TRES ELEMENTOS
# ============================================================

# Eliminamos primero el return visual.
new_text = text[:if_start] + text[if_end:]

# Eliminamos el useEffect.
new_text = (
    new_text[:effect_match.start()]
    + new_text[effect_match.end():]
)

# Volvemos a localizar el estado porque las posiciones
# anteriores ya cambiaron.
state_match_2 = state_pattern.search(new_text)

if not state_match_2:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No pude localizar nuevamente el estado del boot.\n"
        "Archivo restaurado."
    )

new_text = (
    new_text[:state_match_2.start()]
    + new_text[state_match_2.end():]
)

# ============================================================
# 9. VERIFICACIÓN DE SEGURIDAD ANTES DE ESCRIBIR
# ============================================================

if "commerceOSBooting" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Quedó una referencia a commerceOSBooting.\n"
        "Archivo restaurado."
    )

open_groups = new_text.find("const [openGroups")

if open_groups == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró openGroups después del cambio.\n"
        "Archivo restaurado."
    )

component_start = new_text.find(
    "export default function StoreBuilderWorkspace"
)

if component_start == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró StoreBuilderWorkspace.\n"
        "Archivo restaurado."
    )

prefix = new_text[component_start:open_groups]

# No debe existir ningún return JSX antes de openGroups.
if re.search(r'\breturn\s*\(', prefix):
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Existe un return antes de openGroups.\n"
        "Esto podría volver a romper los hooks.\n"
        "Archivo restaurado."
    )

print("✓ Verificación de hooks superada.")

# ============================================================
# 10. ESCRIBIR CAMBIO
# ============================================================

FILE.write_text(new_text, encoding="utf-8")

print("✓ Cambio escrito.")
print()

# ============================================================
# 11. BUILD
# ============================================================

print("==============================================")
print(" BUILD DE SEGURIDAD")
print("==============================================")
print()

result = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)

if result.returncode != 0:
    print()
    print("❌ BUILD FALLÓ")
    print()
    print("Restaurando automáticamente...")
    shutil.copy2(backup, FILE)
    print("✓ StoreBuilderWorkspace restaurado.")
    print("✓ No quedó aplicado el cambio.")
    sys.exit(1)

# ============================================================
# 12. VERIFICACIÓN FINAL
# ============================================================

final_text = FILE.read_text(encoding="utf-8")

if "commerceOSBooting" in final_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Verificación final fallida. Archivo restaurado."
    )

if "const [openGroups" not in final_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Verificación final de hooks fallida. Archivo restaurado."
    )

print()
print("==============================================")
print("✅ FIX COMPLETADO")
print("==============================================")
print()
print("✓ Boot interno eliminado")
print("✓ Hooks del StoreBuilder estabilizados")
print("✓ CommerceOSBoot queda separado")
print("✓ App.tsx NO modificado")
print("✓ DigitalBoostMainPage.tsx NO modificada")
print("✓ Splash NO modificada")
print("✓ Build correcto")
print()
print("Flujo esperado:")
print()
print("Splash")
print("   ↓")
print("Página principal")
print("   ↓")
print("Commerce OS Boot")
print("   ↓")
print("Store Builder")
print()
print(f"Backup:")
print(f"  {backup.name}")
print()
print("👉 Reiniciá el servidor y probá la aplicación.")
print()

