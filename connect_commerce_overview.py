from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import re
import sys

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "StoreBuilderWorkspace.tsx"
OVERVIEW = ROOT / "src" / "CommerceOSOverview.tsx"

print("=" * 64)
print("DIGITALBOOST COMMERCE OS")
print("CONEXIÓN SEGURA — OVERVIEW / CENTRO DE CONTROL")
print("=" * 64)
print()

if not FILE.exists():
    raise SystemExit("❌ No existe src/StoreBuilderWorkspace.tsx")

if not OVERVIEW.exists():
    raise SystemExit(
        "❌ No existe src/CommerceOSOverview.tsx.\n"
        "Primero debe existir el componente Overview."
    )

text = FILE.read_text(encoding="utf-8")

# ------------------------------------------------------------
# 1. BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_overview_connect_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print(f"✓ Backup creado: {backup.name}")
print()

# ------------------------------------------------------------
# 2. IMPORT
# ------------------------------------------------------------

import_line = 'import CommerceOSOverview from "./CommerceOSOverview";'

if import_line in text:
    print("✓ CommerceOSOverview ya estaba importado.")
else:
    lines = text.splitlines(keepends=True)

    last_import = -1

    for i, line in enumerate(lines):
        stripped = line.lstrip()

        if stripped.startswith("import "):
            last_import = i

    if last_import == -1:
        shutil.copy2(backup, FILE)
        raise SystemExit(
            "❌ No se encontró la zona de imports.\n"
            "Archivo restaurado."
        )

    newline = "\n"

    lines.insert(
        last_import + 1,
        import_line + newline
    )

    text = "".join(lines)

    print("✓ Import de CommerceOSOverview agregado.")

# ------------------------------------------------------------
# 3. EVITAR DUPLICACIÓN
# ------------------------------------------------------------

overview_render = "<CommerceOSOverview"

if overview_render in text:
    print("ℹ️ CommerceOSOverview ya aparece renderizado.")
    print("No se insertará una segunda instancia.")

    # Verificar build sin modificar nuevamente.
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
    print("✅ BUILD CORRECTO")
    print("No se realizó ninguna inserción duplicada.")
    sys.exit(0)

# ------------------------------------------------------------
# 4. LOCALIZAR COMPONENTE
# ------------------------------------------------------------

component_match = re.search(
    r'export\s+default\s+function\s+StoreBuilderWorkspace',
    text
)

if not component_match:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró StoreBuilderWorkspace.\n"
        "Archivo restaurado."
    )

component_start = component_match.start()

print("✓ StoreBuilderWorkspace localizado.")

# ------------------------------------------------------------
# 5. LOCALIZAR EL RETURN PRINCIPAL
# ------------------------------------------------------------

# Trabajamos únicamente dentro del componente.
tail = text[component_start:]

return_matches = list(
    re.finditer(
        r'\breturn\s*\(',
        tail
    )
)

if not return_matches:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró el return principal de StoreBuilderWorkspace.\n"
        "Archivo restaurado."
    )

# El return final del componente suele ser el último return (
# antes del cierre de la función.
return_match = return_matches[-1]

return_pos = component_start + return_match.start()

print(
    "✓ Return principal localizado en "
    f"línea {text[:return_pos].count(chr(10)) + 1}."
)

# ------------------------------------------------------------
# 6. INSPECCIÓN ESTRUCTURAL DEL RETURN
# ------------------------------------------------------------

render = text[return_pos:]

# Buscamos expresiones relacionadas con section/dashboard.
dashboard_patterns = [
    r'section\s*===\s*["\']dashboard["\']',
    r'section\s*==\s*["\']dashboard["\']',
    r'["\']dashboard["\']\s*===\s*section',
    r'case\s+["\']dashboard["\']',
]

dashboard_match = None

for pattern in dashboard_patterns:
    m = re.search(pattern, render)

    if m:
        dashboard_match = m
        print(f"✓ Render dashboard localizado mediante: {pattern}")
        break

# ------------------------------------------------------------
# 7. CONSTRUIR INSERCIÓN
# ------------------------------------------------------------

# Caso A:
# Existe una condición explícita section === "dashboard".
#
# Insertamos el Overview inmediatamente antes de esa condición,
# convirtiéndolo en el contenido principal del dashboard.
#
# Caso B:
# No existe condición detectable.
# Buscamos el primer bloque de contenido después del return.
#
# En ese caso NO hacemos una modificación especulativa.
# Es preferible detenerse antes que romper el JSX.

if dashboard_match:

    absolute_dashboard_pos = (
        return_pos + dashboard_match.start()
    )

    # Encontrar inicio de la expresión JSX que contiene la condición.
    line_start = text.rfind("\n", 0, absolute_dashboard_pos) + 1

    before = text[:line_start]
    after = text[line_start:]

    indentation_match = re.match(
        r'([ \t]*)',
        after
    )

    indent = indentation_match.group(1)

    block = (
        f'{indent}{{section === "dashboard" && ('
        f'\n'
        f'{indent}  <CommerceOSOverview />'
        f'\n'
        f'{indent})}}\n'
    )

    # Evitar insertar dentro de otra condición idéntica.
    if '<CommerceOSOverview />' not in text:
        text = before + block + after
        print("✓ CommerceOSOverview conectado al dashboard.")
    else:
        print("ℹ️ Render de Overview ya existente.")

else:

    print()
    print("⚠️ No encontré una condición dashboard reconocible.")
    print()
    print("No voy a modificar el JSX de forma especulativa.")
    print("El backup queda disponible:")
    print(f"  {backup.name}")

    shutil.copy2(backup, FILE)

    print()
    print("✓ Archivo original conservado.")
    print()
    print("Necesitamos inspeccionar únicamente el render actual")
    print("para conectar el Overview en el punto correcto.")
    sys.exit(2)

# ------------------------------------------------------------
# 8. VERIFICACIONES ANTES DE ESCRIBIR
# ------------------------------------------------------------

if import_line not in text:
    shutil.copy2(backup, FILE)

    raise SystemExit(
        "❌ Verificación fallida: falta el import.\n"
        "Archivo restaurado."
    )

if "<CommerceOSOverview />" not in text:
    shutil.copy2(backup, FILE)

    raise SystemExit(
        "❌ Verificación fallida: no apareció el Overview.\n"
        "Archivo restaurado."
    )

# El Overview debe aparecer solamente una vez.
count = text.count("<CommerceOSOverview />")

if count != 1:
    shutil.copy2(backup, FILE)

    raise SystemExit(
        f"❌ Se encontraron {count} instancias de "
        "<CommerceOSOverview />.\n"
        "Archivo restaurado."
    )

# ------------------------------------------------------------
# 9. ESCRIBIR
# ------------------------------------------------------------

FILE.write_text(text, encoding="utf-8")

print()
print("=" * 64)
print("✓ CONEXIÓN APLICADA")
print("=" * 64)
print()
print("✓ CommerceOSOverview importado")
print("✓ Dashboard conectado")
print("✓ Una sola instancia de Overview")
print("✓ App.tsx NO modificado")
print("✓ DigitalBoostMainPage.tsx NO modificada")
print("✓ CommerceOSBoot.tsx NO modificado")
print("✓ Splash NO modificada")
print("✓ StoreBuilderWorkspace modificado únicamente en el render")
print()

# ------------------------------------------------------------
# 10. BUILD DE SEGURIDAD
# ------------------------------------------------------------

print("=" * 64)
print("BUILD DE SEGURIDAD")
print("=" * 64)
print()

build = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)

if build.returncode != 0:

    print()
    print("=" * 64)
    print("❌ BUILD FALLÓ")
    print("=" * 64)
    print()
    print("Restaurando automáticamente el backup...")

    shutil.copy2(backup, FILE)

    print("✓ StoreBuilderWorkspace restaurado.")
    print("✓ No quedó aplicado ningún cambio roto.")
    print()
    sys.exit(1)

# ------------------------------------------------------------
# 11. VERIFICACIÓN FINAL
# ------------------------------------------------------------

final_text = FILE.read_text(encoding="utf-8")

checks = {
    "import": import_line in final_text,
    "overview": final_text.count("<CommerceOSOverview />") == 1,
    "openGroups": "const [openGroups, setOpenGroups]" in final_text,
    "section": "const [section, setSection]" in final_text,
    "customers": "const customers = useMemo" in final_text,
}

failed = [
    name for name, ok in checks.items()
    if not ok
]

if failed:

    print()
    print("❌ VERIFICACIÓN FINAL FALLÓ:")
    for item in failed:
        print(f"   - {item}")

    print()
    print("Restaurando backup...")

    shutil.copy2(backup, FILE)

    print("✓ Archivo restaurado.")
    sys.exit(1)

print()
print("=" * 64)
print("✅ BUILD CORRECTO — OVERVIEW CONECTADO")
print("=" * 64)
print()
print("ARQUITECTURA ACTUAL:")
print()
print("  Página principal")
print("       ↓")
print("  Commerce OS Boot")
print("       ↓")
print("  Commerce OS")
print("       ↓")
print("  Overview / Centro de Control")
print("       ↓")
print("  Store Builder")
print()
print("✓ Hooks conservados")
print("✓ Dashboard conectado")
print("✓ CommerceOSBoot separado")
print("✓ MainPage intacta")
print("✓ Splash intacta")
print("✓ Backup disponible:")
print(f"  {backup.name}")
print()
print("👉 Reiniciá el servidor y probá el Dashboard.")
print()
