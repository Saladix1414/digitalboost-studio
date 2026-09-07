#!/usr/bin/env python3

from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime


ROOT = Path.cwd()
TARGET = ROOT / "src" / "CommerceOSOverview.tsx"


def error(message: str) -> None:
    print()
    print("[ERROR] " + message)
    print()
    sys.exit(1)


print("========================================")
print(" DIGITALBOOST - COMMERCE OS CSS FIX")
print("========================================")
print()
print(f"Proyecto: {ROOT}")
print(f"Archivo:  {TARGET}")
print()


# ---------------------------------------------------------
# Comprobaciones
# ---------------------------------------------------------

if not TARGET.is_file():
    error(f"No existe {TARGET}")

original = TARGET.read_text(encoding="utf-8")


# ---------------------------------------------------------
# Verificar que estamos tocando exactamente la estructura
# diagnosticada y no una versión diferente del proyecto.
# ---------------------------------------------------------

required_import = 'import "./commerce-os-visual-v2.css";'
required_class = "db-commerce-jewel db-commerce-visual-v2"

if required_import not in original:
    error(
        "No se encontró la importación esperada:\n"
        f"  {required_import}\n"
        "No se modificó ningún archivo."
    )

if required_class not in original:
    error(
        "No se encontró la combinación esperada:\n"
        f"  {required_class}\n"
        "No se modificó ningún archivo."
    )


# ---------------------------------------------------------
# Backup
# ---------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = (
    TARGET.parent
    / f"{TARGET.name}.backup-commerce-css-{timestamp}"
)

shutil.copy2(TARGET, backup)

print("[OK] Backup creado:")
print(f"     {backup}")
print()


# ---------------------------------------------------------
# Cambio 1:
# retirar la hoja LIGHT antigua de Commerce OS.
# ---------------------------------------------------------

updated = original.replace(
    'import "./commerce-os-visual-v2.css";\n',
    ""
)


# ---------------------------------------------------------
# Cambio 2:
# retirar la clase que activa esa capa LIGHT.
# ---------------------------------------------------------

updated = updated.replace(
    "db-commerce-jewel db-commerce-visual-v2",
    "db-commerce-jewel"
)


if updated == original:
    shutil.copy2(backup, TARGET)
    error(
        "No se produjo ningún cambio. "
        "El backup fue restaurado."
    )


TARGET.write_text(updated, encoding="utf-8")


# ---------------------------------------------------------
# Validación estructural
# ---------------------------------------------------------

result = TARGET.read_text(encoding="utf-8")


if required_import in result:
    shutil.copy2(backup, TARGET)
    error(
        "La importación de visual-v2 sigue presente. "
        "Se restauró el backup."
    )


if "db-commerce-visual-v2" in result:
    shutil.copy2(backup, TARGET)
    error(
        "La clase db-commerce-visual-v2 sigue presente. "
        "Se restauró el backup."
    )


if "db-commerce-jewel" not in result:
    shutil.copy2(backup, TARGET)
    error(
        "Desapareció db-commerce-jewel inesperadamente. "
        "Se restauró el backup."
    )


print("[OK] Cambio aplicado.")
print()
print("Se eliminó:")
print("  - import de commerce-os-visual-v2.css")
print("  - clase db-commerce-visual-v2")
print()
print("Se conserva:")
print("  - db-commerce-jewel")
print("  - commerce-os-vibrant-global.css")
print()


# ---------------------------------------------------------
# Build
# ---------------------------------------------------------

print("========================================")
print(" EJECUTANDO npm run build")
print("========================================")
print()

build = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)


# ---------------------------------------------------------
# Rollback automático si falla el build
# ---------------------------------------------------------

if build.returncode != 0:
    print()
    print("========================================")
    print(" BUILD FALLÓ - ROLLBACK")
    print("========================================")
    print()

    shutil.copy2(backup, TARGET)

    print("[OK] Se restauró el archivo original.")
    print(f"[OK] Backup conservado en:")
    print(f"     {backup}")
    print()

    sys.exit(build.returncode)


# ---------------------------------------------------------
# Resultado
# ---------------------------------------------------------

print()
print("========================================")
print(" COMMERCE OS CSS FIX: OK")
print("========================================")
print()
print("Build exitoso.")
print()
print("La capa LIGHT visual-v2 fue retirada del")
print("render de Commerce OS.")
print()
print("Commerce OS conserva:")
print("  Jewel + Vibrant")
print()
print(f"Backup disponible en:")
print(f"  {backup}")
print()
