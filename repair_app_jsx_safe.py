from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.cwd()
APP = ROOT / "src" / "App.tsx"

print("=" * 78)
print("DIGITALBOOST — REPARACIÓN SEGURA DE APP.TSX")
print("CORRECCIÓN JSX · SIN MODIFICAR COMMERCE OS")
print("=" * 78)

if not APP.exists():
    print("❌ No existe src/App.tsx")
    sys.exit(1)

source = APP.read_text(encoding="utf-8")

bad = '</div data-commerce-os="true">'
good = '</div>'

count = source.count(bad)

print()
print(f"✓ App.tsx encontrado: {APP}")

if count == 0:
    print("✓ No se encontró el cierre JSX corrupto.")
    print("✓ No se modifica App.tsx.")

    print()
    print("=" * 78)
    print("VERIFICANDO BUILD ACTUAL")
    print("=" * 78)

    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True
    )

    if result.returncode == 0:
        print()
        print("✓ BUILD CORRECTO")
        print("✓ El proyecto ya compila correctamente.")
        sys.exit(0)

    print()
    print("⚠️ El build todavía presenta otro error.")
    sys.exit(result.returncode)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = ROOT / f"App.before_jsx_repair_{timestamp}.tsx"

shutil.copy2(APP, backup)

print(f"✓ Backup creado: {backup.name}")
print(f"✓ Cierres JSX corruptos encontrados: {count}")

fixed_source = source.replace(bad, good)

APP.write_text(fixed_source, encoding="utf-8")

print("✓ Corrección aplicada:")
print('  </div data-commerce-os="true">')
print("  ↓")
print("  </div>")

print()
print("=" * 78)
print("BUILD DE VERIFICACIÓN")
print("=" * 78)

try:
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=180
    )

except subprocess.TimeoutExpired:
    print("❌ npm run build excedió los 180 segundos.")
    print("↩ Restaurando App.tsx...")
    shutil.copy2(backup, APP)
    print("✓ App.tsx restaurado.")
    print(f"✓ Backup disponible: {backup.name}")
    sys.exit(1)

except FileNotFoundError:
    print("❌ npm no está disponible en PATH.")
    print("↩ Restaurando App.tsx...")
    shutil.copy2(backup, APP)
    print("✓ App.tsx restaurado.")
    print(f"✓ Backup disponible: {backup.name}")
    sys.exit(1)

print(result.stdout)

if result.returncode != 0:
    print(result.stderr)

    print()
    print("=" * 78)
    print("❌ BUILD FALLÓ")
    print("=" * 78)
    print("↩ Restaurando únicamente App.tsx...")
    
    shutil.copy2(backup, APP)

    print(f"✓ App.tsx restaurado desde: {backup.name}")
    print("✓ CommerceOSOverview.tsx no fue modificado.")
    print("✓ commerce-os-vibrant-global.css no fue modificado.")
    print()
    print("El error restante pertenece a otra parte del proyecto.")
    sys.exit(result.returncode)

print()
print("=" * 78)
print("✓ BUILD CORRECTO")
print("=" * 78)
print()
print("COMMERCE OS — REPARACIÓN COMPLETADA")
print()
print("✓ JSX corrupto reparado")
print("✓ App.tsx compila")
print("✓ CommerceOSOverview.tsx intacto")
print("✓ CSS de Commerce OS intacto")
print("✓ No se agregaron dragones")
print("✓ No se agregó NFT")
print()
print(f"✓ Backup de seguridad: {backup.name}")
print()
print("Para iniciar el proyecto:")
print("npm run dev")
print("=" * 78)
