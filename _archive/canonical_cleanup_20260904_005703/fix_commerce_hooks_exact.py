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
print(" FIX EXACTO DE HOOKS")
print("==============================================")
print()

if not FILE.exists():
    raise SystemExit("❌ No existe StoreBuilderWorkspace.tsx")

text = FILE.read_text(encoding="utf-8")

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_exact_fix_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# BLOQUE EXACTO QUE SOBRÓ
# ------------------------------------------------------------

old = '''    // ----------------------------------------------------------
    // DIGITALBOOST COMMERCE OS — BOOT SEQUENCE
    // ----------------------------------------------------------

    const [commerceOSBooting, setCommerceOSBooting] = useState(true);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        setCommerceOSBooting(false);
      }, 1500);

      return () => window.clearTimeout(timer);
    }, []);


    // ----------------------------------------------------------
    // COMMERCE OS LOADING SCREEN
    // ----------------------------------------------------------

'''

# ------------------------------------------------------------
# VERIFICACIÓN
# ------------------------------------------------------------

if old not in text:
    print("❌ El bloque exacto no coincide.")
    print("No se modificó el archivo.")
    print(f"Backup: {backup.name}")
    sys.exit(1)

print("✓ Bloque sobrante localizado exactamente.")

# ------------------------------------------------------------
# ELIMINACIÓN
# ------------------------------------------------------------

new_text = text.replace(old, "", 1)

# ------------------------------------------------------------
# VERIFICACIONES ANTES DE GUARDAR
# ------------------------------------------------------------

if "commerceOSBooting" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Todavía existe commerceOSBooting. Archivo restaurado."
    )

open_groups = new_text.find(
    "const [openGroups"
)

if open_groups == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró openGroups. Archivo restaurado."
    )

component = new_text.find(
    "export default function StoreBuilderWorkspace"
)

if component == -1:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No se encontró el componente. Archivo restaurado."
    )

before_open_groups = new_text[component:open_groups]

# No debe haber return JSX antes de los hooks principales.
if "return (" in before_open_groups:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Se encontró un return antes de openGroups.\n"
        "Archivo restaurado."
    )

# ------------------------------------------------------------
# GUARDAR
# ------------------------------------------------------------

FILE.write_text(new_text, encoding="utf-8")

print("✓ Hooks sobrantes eliminados.")
print("✓ openGroups permanece como primer hook del workspace.")
print("✓ No se tocó ningún JSX del Store Builder.")
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
    print("✓ Archivo restaurado.")
    print("✓ No quedó ningún cambio roto.")
    sys.exit(1)

# ------------------------------------------------------------
# VERIFICACIÓN FINAL
# ------------------------------------------------------------

final_text = FILE.read_text(encoding="utf-8")

if "commerceOSBooting" in final_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Verificación final fallida. Archivo restaurado."
    )

if "const [openGroups" not in final_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ openGroups desapareció. Archivo restaurado."
    )

print()
print("==============================================")
print("✅ FIX COMPLETADO CORRECTAMENTE")
print("==============================================")
print()
print("✓ Render más hooks corregido")
print("✓ Hooks del StoreBuilder en orden estable")
print("✓ CommerceOSBoot.tsx conservado")
print("✓ App.tsx conservado")
print("✓ DigitalBoostMainPage.tsx conservada")
print("✓ Splash conservada")
print("✓ Store Builder conservado")
print("✓ Build correcto")
print()
print("Flujo:")
print("Splash")
print("  ↓")
print("Página principal")
print("  ↓")
print("Commerce OS")
print("  ↓")
print("Store Builder")
print()
print(f"Backup: {backup.name}")
print()
print("👉 Reiniciá el servidor y probá nuevamente.")
print()

