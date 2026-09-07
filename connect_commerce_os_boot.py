from pathlib import Path
import shutil
import subprocess
import re
import sys
from datetime import datetime

ROOT = Path.home() / "digitalboost-studio"
APP = ROOT / "src" / "App.tsx"

if not APP.exists():
    raise SystemExit("❌ No se encontró src/App.tsx")

text = APP.read_text(encoding="utf-8")

# ------------------------------------------------------------
# 1. Verificaciones de seguridad
# ------------------------------------------------------------

if 'import CommerceOSBoot from "./CommerceOSBoot";' in text:
    print("ℹ️ CommerceOSBoot ya está importado.")
else:
    # Insertar después de los imports existentes.
    lines = text.splitlines()
    last_import = -1

    for i, line in enumerate(lines):
        if line.startswith("import "):
            last_import = i

    if last_import == -1:
        raise SystemExit("❌ No se encontró la zona de imports de App.tsx.")

    lines.insert(
        last_import + 1,
        'import CommerceOSBoot from "./CommerceOSBoot";'
    )

    text = "\n".join(lines) + ("\n" if text.endswith("\n") else "")

# ------------------------------------------------------------
# 2. Detectar AppScreen
# ------------------------------------------------------------

screen_match = re.search(
    r'type\s+AppScreen\s*=\s*([^;]+);',
    text
)

if not screen_match:
    raise SystemExit(
        "❌ No pude localizar AppScreen. No se modificó App.tsx."
    )

screen_values = screen_match.group(1)

if "'commerceBoot'" not in screen_values and '"commerceBoot"' not in screen_values:
    new_values = screen_values.rstrip() + " | 'commerceBoot'"
    text = (
        text[:screen_match.start(1)]
        + new_values
        + text[screen_match.end(1):]
    )

# ------------------------------------------------------------
# 3. Buscar transición existente Main -> Workspace
# ------------------------------------------------------------

workspace_pattern = r"""
currentScreen\s*===\s*['"]workspace['"]
"""

if not re.search(workspace_pattern, text, re.X):
    raise SystemExit(
        "❌ No se encontró la pantalla workspace. "
        "No se modificó App.tsx."
    )

# ------------------------------------------------------------
# 4. Cambiar solamente la transición al workspace
# ------------------------------------------------------------

# Buscamos:
#
# currentScreen === 'workspace' && (
#
# y la convertimos en:
#
# currentScreen === 'commerceBoot' ...
# currentScreen === 'workspace' ...
#
# Esto NO toca splash ni main.

old = """{currentScreen === 'workspace' && ("""

if old not in text:
    old = """{currentScreen === "workspace" && ("""

if old not in text:
    raise SystemExit(
        "❌ No encontré el render exacto de workspace. "
        "No se modificó App.tsx."
    )

# ------------------------------------------------------------
# 5. Insertar Commerce OS antes del workspace
# ------------------------------------------------------------

boot_block = """{currentScreen === 'commerceBoot' && (
        <CommerceOSBoot
          onComplete={() => setCurrentScreen('workspace')}
        />
      )}

      {currentScreen === 'workspace' && ("""

replacement = boot_block

text = text.replace(old, replacement, 1)

# ------------------------------------------------------------
# 6. Cambiar solamente la transición que abre workspace
# ------------------------------------------------------------

# Buscamos setCurrentScreen('workspace')
# y modificamos SOLO la primera aparición que corresponda
# al acceso desde la página principal.

matches = list(
    re.finditer(
        r"setCurrentScreen\(\s*['\"]workspace['\"]\s*\)",
        text
    )
)

if not matches:
    raise SystemExit(
        "❌ No encontré setCurrentScreen('workspace')."
    )

# Normalmente la primera transición corresponde a la selección
# de herramienta desde la página principal.
m = matches[0]

text = (
    text[:m.start()]
    + "setCurrentScreen('commerceBoot')"
    + text[m.end():]
)

# ------------------------------------------------------------
# 7. Backup
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = APP.with_name(f"App.tsx.before_commerce_boot_{timestamp}.bak")

shutil.copy2(APP, backup)

# ------------------------------------------------------------
# 8. Guardar
# ------------------------------------------------------------

APP.write_text(text, encoding="utf-8")

print()
print("==============================================")
print("DIGITALBOOST COMMERCE OS — CONEXIÓN")
print("==============================================")
print()
print("✓ CommerceOSBoot importado")
print("✓ Nueva pantalla commerceBoot registrada")
print("✓ MainPage conservada")
print("✓ Splash conservada")
print("✓ StoreBuilderWorkspace no modificado")
print("✓ Transición Main → Commerce OS → Workspace")
print()
print(f"Backup: {backup.name}")
print()
print("===== BUILD DE SEGURIDAD =====")
print()

result = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)

if result.returncode != 0:
    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando App.tsx...")

    shutil.copy2(backup, APP)

    print("✓ App.tsx restaurado.")
    print("✓ No quedó aplicada una conexión rota.")
    sys.exit(1)

print()
print("==============================================")
print("✅ BUILD CORRECTO")
print("==============================================")
print()
print("Flujo configurado:")
print()
print("Splash")
print("   ↓")
print("Página principal")
print("   ↓")
print("Commerce OS Boot")
print("   ↓")
print("Store Builder")
print()
print("✓ App.tsx protegido")
print("✓ StoreBuilderWorkspace intacto")
print("✓ DigitalBoostMainPage intacta")
print()
print("Ahora reiniciá el servidor y probá la aplicación.")
print()
