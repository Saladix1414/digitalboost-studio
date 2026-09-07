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
print(" LIMPIEZA EXACTA DEL BOOT INTERNO")
print("==============================================")
print()

if not FILE.exists():
    raise SystemExit("❌ No existe src/StoreBuilderWorkspace.tsx")

text = FILE.read_text(encoding="utf-8")

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_exact2_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# LOCALIZAR EL BLOQUE REAL
# ------------------------------------------------------------

start_marker = (
    '    // DIGITALBOOST COMMERCE OS — BOOT SEQUENCE'
)

end_marker = (
    '    const [openGroups, setOpenGroups] = '
    'useState<Record<string, boolean>>({'
)

start = text.find(start_marker)
end = text.find(end_marker)

if start == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró el inicio real del boot.\n"
        "Archivo restaurado."
    )

if end == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró openGroups.\n"
        "Archivo restaurado."
    )

if end <= start:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ El orden del archivo no es válido.\n"
        "Archivo restaurado."
    )

# ------------------------------------------------------------
# SEGURIDAD: MOSTRAR QUÉ SE VA A ELIMINAR
# ------------------------------------------------------------

block = text[start:end]

if "commerceOSBooting" not in block:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ El bloque no contiene commerceOSBooting.\n"
        "No se modifica nada."
    )

if "useEffect" not in block:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ El bloque no contiene el useEffect del boot.\n"
        "No se modifica nada."
    )

print("✓ Boot interno localizado.")
print("✓ useState del boot localizado.")
print("✓ useEffect del boot localizado.")
print("✓ openGroups localizado.")
print()

# ------------------------------------------------------------
# ELIMINAR ÚNICAMENTE EL BLOQUE ENTRE AMBOS MARCADORES
# ------------------------------------------------------------

new_text = (
    text[:start]
    + text[end:]
)

# ------------------------------------------------------------
# VERIFICACIONES
# ------------------------------------------------------------

if "commerceOSBooting" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ commerceOSBooting todavía existe.\n"
        "Archivo restaurado."
    )

open_pos = new_text.find(
    'const [openGroups, setOpenGroups]'
)

if open_pos == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ openGroups desapareció.\n"
        "Archivo restaurado."
    )

component_pos = new_text.find(
    "export default function StoreBuilderWorkspace"
)

if component_pos == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró StoreBuilderWorkspace.\n"
        "Archivo restaurado."
    )

# No debe haber un return antes de openGroups.
pre_hooks = new_text[component_pos:open_pos]

if "return (" in pre_hooks:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Hay un return antes de los hooks principales.\n"
        "Archivo restaurado."
    )

# ------------------------------------------------------------
# GUARDAR
# ------------------------------------------------------------

FILE.write_text(new_text, encoding="utf-8")

print("✓ Boot interno eliminado.")
print("✓ openGroups quedó intacto.")
print("✓ Los hooks posteriores quedaron intactos.")
print()

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

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
    print("Restaurando automáticamente...")
    shutil.copy2(backup, FILE)
    print("✓ StoreBuilderWorkspace restaurado.")
    print("✓ No quedó aplicado ningún cambio roto.")
    sys.exit(1)

# ------------------------------------------------------------
# VERIFICACIÓN FINAL
# ------------------------------------------------------------

final_text = FILE.read_text(encoding="utf-8")

checks = [
    ("commerceOSBooting", False),
    ("const [openGroups, setOpenGroups]", True),
    ("const [section, setSection]", True),
    ("const customers = useMemo", True),
]

for needle, must_exist in checks:
    exists = needle in final_text

    if exists != must_exist:
        print()
        print(f"❌ Verificación fallida: {needle}")
        print("Restaurando backup...")
        shutil.copy2(backup, FILE)
        print("✓ Archivo restaurado.")
        sys.exit(1)

print()
print("==============================================")
print("✅ FIX COMPLETADO")
print("==============================================")
print()
print("✓ Boot interno eliminado")
print("✓ CommerceOSBoot separado conservado")
print("✓ Hooks del Store Builder estabilizados")
print("✓ App.tsx NO modificado")
print("✓ DigitalBoostMainPage.tsx NO modificada")
print("✓ Splash NO modificada")
print("✓ StoreBuilderWorkspace conservado")
print("✓ BUILD CORRECTO")
print()
print("Arquitectura:")
print("Splash")
print("   ↓")
print("Página principal")
print("   ↓")
print("Commerce OS Boot")
print("   ↓")
print("Store Builder")
print()
print(f"Backup: {backup.name}")
print()
print("👉 Reiniciá el servidor y probá nuevamente.")
print()

