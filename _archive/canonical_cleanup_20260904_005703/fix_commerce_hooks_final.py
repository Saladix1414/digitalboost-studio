from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "StoreBuilderWorkspace.tsx"

print()
print("=" * 62)
print("DIGITALBOOST COMMERCE OS — FIX DEFINITIVO POR ESTRUCTURA")
print("=" * 62)
print()

if not FILE.exists():
    raise SystemExit("❌ No existe src/StoreBuilderWorkspace.tsx")

text = FILE.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

# ------------------------------------------------------------
# 1. Localizar exactamente las estructuras conocidas
# ------------------------------------------------------------

boot_state = None
boot_effect = None
open_groups = None

for i, line in enumerate(lines):
    if "const [commerceOSBooting, setCommerceOSBooting]" in line:
        boot_state = i

    if boot_state is not None and i > boot_state:
        if "useEffect(() => {" in line:
            boot_effect = i
            break

for i, line in enumerate(lines):
    if "const [openGroups, setOpenGroups]" in line:
        open_groups = i
        break

if boot_state is None:
    print("ℹ️ No se encontró commerceOSBooting.")
    print("   El boot interno posiblemente ya fue eliminado.")
    print()
    print("===== BUILD DE VERIFICACIÓN =====")
    result = subprocess.run(["npm", "run", "build"], cwd=ROOT)

    if result.returncode != 0:
        print()
        print("❌ El proyecto todavía no compila.")
        sys.exit(1)

    print()
    print("✅ BUILD CORRECTO")
    print("No se modificó StoreBuilderWorkspace.tsx.")
    sys.exit(0)

if boot_effect is None:
    raise SystemExit(
        "❌ Se encontró commerceOSBooting pero no su useEffect."
        "\nNo se modificó el archivo."
    )

if open_groups is None:
    raise SystemExit(
        "❌ No se encontró openGroups."
        "\nNo se modificó el archivo."
    )

print(f"✓ commerceOSBooting encontrado en línea {boot_state + 1}")
print(f"✓ useEffect del boot encontrado en línea {boot_effect + 1}")
print(f"✓ openGroups encontrado en línea {open_groups + 1}")

if not (boot_state < boot_effect < open_groups):
    raise SystemExit(
        "❌ La estructura no coincide con la esperada."
        "\nNo se modificó el archivo."
    )

# ------------------------------------------------------------
# 2. Determinar exactamente qué borrar
#
# Desde el estado del boot hasta inmediatamente antes
# de openGroups.
#
# Esto elimina:
#
# const [commerceOSBooting...]
# useEffect(...)
# comentarios del loading interno
#
# SIN tocar openGroups ni ningún hook posterior.
# ------------------------------------------------------------

start = boot_state
end = open_groups

removed = lines[start:end]

print()
print("Bloque que será eliminado:")
print("-" * 62)

for n, line in enumerate(removed, start=start + 1):
    print(f"{n:4}: {line.rstrip()}")

print("-" * 62)

# ------------------------------------------------------------
# 3. Seguridad adicional
# ------------------------------------------------------------

removed_text = "".join(removed)

if "commerceOSBooting" not in removed_text:
    raise SystemExit(
        "❌ Verificación de seguridad falló: "
        "commerceOSBooting no está dentro del bloque."
    )

if "useEffect(() => {" not in removed_text:
    raise SystemExit(
        "❌ Verificación de seguridad falló: "
        "useEffect no está dentro del bloque."
    )

open_line = lines[open_groups]

if "const [openGroups, setOpenGroups]" not in open_line:
    raise SystemExit(
        "❌ Verificación de seguridad falló: "
        "openGroups no es la siguiente estructura esperada."
    )

# ------------------------------------------------------------
# 4. Crear backup
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_final_hook_fix_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print()
print(f"✓ Backup creado:")
print(f"  {backup.name}")

# ------------------------------------------------------------
# 5. Aplicar modificación
# ------------------------------------------------------------

new_lines = lines[:start] + lines[end:]

new_text = "".join(new_lines)

# ------------------------------------------------------------
# 6. Verificaciones antes de escribir
# ------------------------------------------------------------

if "commerceOSBooting" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Seguridad: commerceOSBooting todavía aparece."
        "\nArchivo restaurado."
    )

if "const [openGroups, setOpenGroups]" not in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Seguridad: openGroups desapareció."
        "\nArchivo restaurado."
    )

# El componente separado debe seguir existiendo.
commerce_boot = ROOT / "src" / "CommerceOSBoot.tsx"

if not commerce_boot.exists():
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No existe src/CommerceOSBoot.tsx."
        "\nNo se continuará sin el componente separado."
        "\nArchivo restaurado."
    )

# ------------------------------------------------------------
# 7. Escribir
# ------------------------------------------------------------

FILE.write_text(new_text, encoding="utf-8")

print()
print("=" * 62)
print("✓ BOOT INTERNO ELIMINADO")
print("=" * 62)
print()
print("✓ StoreBuilderWorkspace conserva sus hooks")
print("✓ openGroups permanece intacto")
print("✓ CommerceOSBoot permanece separado")
print("✓ App.tsx NO modificado por este script")
print("✓ DigitalBoostMainPage NO modificada")
print("✓ Splash NO modificada")
print()
print("===== VERIFICACIÓN DE HOOKS =====")

# Mostrar las primeras apariciones de hooks después del cambio.
result = subprocess.run(
    [
        "grep",
        "-n",
        "-E",
        r"useState|useEffect|useMemo|useCallback|useRef",
        str(FILE),
    ],
    capture_output=True,
    text=True,
)

if result.returncode == 0:
    print(result.stdout[:5000])

print()
print("===== BUILD DE SEGURIDAD =====")
print()

build = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)

if build.returncode != 0:
    print()
    print("=" * 62)
    print("❌ BUILD FALLÓ")
    print("=" * 62)
    print()
    print("Restaurando automáticamente el archivo original...")

    shutil.copy2(backup, FILE)

    print("✓ Archivo restaurado.")
    print("✓ No quedó aplicado ningún cambio roto.")
    print()
    sys.exit(1)

# ------------------------------------------------------------
# 8. Verificación final
# ------------------------------------------------------------

final_text = FILE.read_text(encoding="utf-8")

if "commerceOSBooting" in final_text:
    shutil.copy2(backup, FILE)
    print("❌ commerceOSBooting reapareció. Archivo restaurado.")
    sys.exit(1)

if "const [openGroups, setOpenGroups]" not in final_text:
    shutil.copy2(backup, FILE)
    print("❌ openGroups desapareció. Archivo restaurado.")
    sys.exit(1)

print()
print("=" * 62)
print("✅ BUILD CORRECTO")
print("=" * 62)
print()
print("RESULTADO:")
print()
print("  StoreBuilderWorkspace")
print("        ↓")
print("  Hooks en orden estable")
print("        ↓")
print("  Store Builder")
print()
print("Commerce OS queda separado:")
print()
print("  CommerceOSBoot.tsx")
print("        ↓")
print("  App.tsx")
print("        ↓")
print("  StoreBuilderWorkspace")
print()
print(f"Backup disponible: {backup.name}")
print()
print("✓ FIX APLICADO CORRECTAMENTE")
print()
