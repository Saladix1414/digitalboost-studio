from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "StoreBuilderWorkspace.tsx"

print()
print("==============================================")
print(" DIGITALBOOST COMMERCE OS")
print(" FIX POR ESTRUCTURA REAL")
print("==============================================")
print()

text = FILE.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

# Buscar por contenido, no por espacios exactos.
boot_state = next(
    (i for i, line in enumerate(lines)
     if "const [commerceOSBooting" in line),
    -1
)

boot_effect = next(
    (i for i, line in enumerate(lines)
     if i > boot_state and "useEffect(() =>" in line),
    -1
)

open_groups = next(
    (i for i, line in enumerate(lines)
     if "const [openGroups, setOpenGroups]" in line),
    -1
)

if boot_state == -1:
    raise SystemExit("❌ No encontré commerceOSBooting. No se modificó nada.")

if boot_effect == -1:
    raise SystemExit("❌ No encontré el useEffect del boot. No se modificó nada.")

if open_groups == -1:
    raise SystemExit("❌ No encontré openGroups. No se modificó nada.")

if not (boot_state < boot_effect < open_groups):
    raise SystemExit(
        "❌ El orden estructural no coincide. No se modificó nada."
    )

print(f"✓ commerceOSBooting encontrado en línea {boot_state + 1}")
print(f"✓ useEffect del boot encontrado en línea {boot_effect + 1}")
print(f"✓ openGroups encontrado en línea {open_groups + 1}")
print()

# Encontrar el inicio del bloque de comentarios asociado.
start = boot_state

for i in range(boot_state - 1, max(-1, boot_state - 15), -1):
    if "DIGITALBOOST COMMERCE OS — BOOT SEQUENCE" in lines[i]:
        start = i
        break

# Eliminamos desde el comentario del boot hasta inmediatamente
# antes de openGroups.
removed = lines[start:open_groups]

# Seguridad adicional.
removed_text = "".join(removed)

if "commerceOSBooting" not in removed_text:
    raise SystemExit("❌ Verificación fallida del bloque a eliminar.")

if "useEffect" not in removed_text:
    raise SystemExit("❌ Verificación fallida del useEffect.")

if "openGroups" in removed_text:
    raise SystemExit("❌ openGroups quedó dentro del bloque a eliminar.")

# Backup.
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_line_fix_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print(f"✓ Backup creado: {backup.name}")

# Aplicar exclusivamente la eliminación.
new_lines = lines[:start] + lines[open_groups:]

new_text = "".join(new_lines)

# Verificaciones antes de escribir.
if "commerceOSBooting" in new_text:
    raise SystemExit("❌ commerceOSBooting sigue presente. No se escribió nada.")

if "const [openGroups, setOpenGroups]" not in new_text:
    raise SystemExit("❌ openGroups desapareció. No se escribió nada.")

if "const [section, setSection]" not in new_text:
    raise SystemExit("❌ section desapareció. No se escribió nada.")

FILE.write_text(new_text, encoding="utf-8")

print("✓ Bloque interno del Commerce OS eliminado.")
print("✓ openGroups conservado.")
print("✓ section conservado.")
print("✓ Resto del Store Builder no tocado.")
print()

# Build.
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
    print("Restaurando backup...")
    shutil.copy2(backup, FILE)
    print("✓ Archivo restaurado.")
    sys.exit(1)

print()
print("==============================================")
print("✅ BUILD CORRECTO")
print("==============================================")
print()
print("✓ Hooks estabilizados")
print("✓ Boot interno eliminado")
print("✓ CommerceOSBoot.tsx conservado")
print("✓ App.tsx conservado")
print("✓ Splash conservada")
print("✓ DigitalBoostMainPage conservada")
print("✓ Store Builder conservado")
print()
print(f"Backup: {backup.name}")
print()
print("👉 Reiniciá el servidor y probá la aplicación.")
print()

