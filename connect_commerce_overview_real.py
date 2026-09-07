from pathlib import Path
from datetime import datetime
import shutil
import re
import subprocess
import sys

ROOT = Path.cwd()
TARGET = ROOT / "src" / "StoreBuilderWorkspace.tsx"

if not TARGET.exists():
    print("❌ No existe src/StoreBuilderWorkspace.tsx")
    sys.exit(1)

text = TARGET.read_text(encoding="utf-8")

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = TARGET.with_name(
    f"StoreBuilderWorkspace.tsx.before_commerce_overview_real_{stamp}.bak"
)

shutil.copy2(TARGET, backup)
print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# 1. Verificar import
# ------------------------------------------------------------

if "CommerceOSOverview" not in text:
    print("⚠️ CommerceOSOverview no aparece importado.")
    print("No se realizará una modificación especulativa.")
    sys.exit(1)

print("✓ CommerceOSOverview encontrado.")

# ------------------------------------------------------------
# 2. Buscar exactamente el dashboard actual
# ------------------------------------------------------------

old = '''case "dashboard":
        return renderDashboard();'''

new = '''case "dashboard":
        return (
          <CommerceOSOverview
            onNavigate={(target) => setSection(target as StoreSection)}
          />
        );'''

if old not in text:
    print("⚠️ No encontré el bloque exacto del dashboard.")
    print("No se modificó el JSX.")
    sys.exit(1)

# ------------------------------------------------------------
# 3. Reemplazo único y seguro
# ------------------------------------------------------------

count = text.count(old)

if count != 1:
    print(f"⚠️ Encontré {count} coincidencias del dashboard.")
    print("No se realizará el reemplazo para evitar tocar otra sección.")
    sys.exit(1)

text = text.replace(old, new, 1)

TARGET.write_text(text, encoding="utf-8")

print("✓ Dashboard conectado a CommerceOSOverview.")
print("✓ Render original preservado como función de respaldo.")
print("✓ Navegación conectada mediante setSection().")

# ------------------------------------------------------------
# 4. Verificación rápida
# ------------------------------------------------------------

verify = TARGET.read_text(encoding="utf-8")

expected = [
    'case "dashboard":',
    "<CommerceOSOverview",
    "onNavigate=",
    "setSection(target as StoreSection)",
]

missing = [item for item in expected if item not in verify]

if missing:
    print("❌ La verificación falló.")
    print("Faltan:")
    for item in missing:
        print("  -", item)

    shutil.copy2(backup, TARGET)
    print("✓ Archivo restaurado desde backup.")
    sys.exit(1)

print("✓ Verificación de conexión correcta.")

# ------------------------------------------------------------
# 5. Build
# ------------------------------------------------------------

print()
print("=" * 64)
print("DIGITALBOOST COMMERCE OS")
print("BUILD DE VERIFICACIÓN")
print("=" * 64)

result = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT,
    text=True
)

if result.returncode != 0:
    print()
    print("❌ BUILD FALLÓ.")
    print(f"✓ Restaurando backup: {backup.name}")

    shutil.copy2(backup, TARGET)

    print("✓ Archivo original restaurado.")
    sys.exit(result.returncode)

print()
print("=" * 64)
print("✅ INTEGRACIÓN COMPLETADA")
print("=" * 64)
print()
print("CommerceOSOverview ahora es el dashboard principal.")
print()
print("Backup:")
print(f"  {backup}")
print()
print("La siguiente fase será conectar las métricas del Overview")
print("con products, orders y customers para eliminar datos demo.")
