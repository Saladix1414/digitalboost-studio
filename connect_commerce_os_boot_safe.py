from pathlib import Path
import shutil
import subprocess
import re
import sys
from datetime import datetime

ROOT = Path.home() / "digitalboost-studio"
APP = ROOT / "src" / "App.tsx"
BOOT = ROOT / "src" / "CommerceOSBoot.tsx"

print("==============================================")
print(" DIGITALBOOST COMMERCE OS — CONEXIÓN SEGURA")
print("==============================================")
print()

# ------------------------------------------------------------
# 1. Verificaciones
# ------------------------------------------------------------

if not APP.exists():
    raise SystemExit("❌ No existe src/App.tsx")

if not BOOT.exists():
    raise SystemExit(
        "❌ No existe src/CommerceOSBoot.tsx\n"
        "Primero hay que crear el componente Boot."
    )

original = APP.read_text(encoding="utf-8")
text = original

# ------------------------------------------------------------
# 2. Evitar duplicaciones
# ------------------------------------------------------------

if "CommerceOSBoot" in text:
    print("⚠️ App.tsx ya contiene referencias a CommerceOSBoot.")
    print("No se aplicará una segunda conexión.")
    print()
    print("Revisá primero el estado actual con:")
    print("grep -n -E 'CommerceOSBoot|commerceBoot' src/App.tsx")
    sys.exit(0)

# ------------------------------------------------------------
# 3. Backup antes de tocar nada
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = APP.with_name(
    f"App.tsx.before_commerce_boot_{timestamp}.bak"
)

shutil.copy2(APP, backup)

print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# 4. Insertar import de forma segura
# ------------------------------------------------------------

lines = text.splitlines()

# Detectamos el bloque inicial de imports.
# No insertamos dentro de `import { ... }`.
#
# Buscamos la última línea que pertenezca al bloque de imports.
# La estrategia es recorrer desde arriba y detectar cuándo
# comienza realmente el código.

last_import_line = -1
inside_multiline_import = False

for i, line in enumerate(lines):

    stripped = line.strip()

    if inside_multiline_import:
        if "}" in stripped and "from" in stripped:
            inside_multiline_import = False
            last_import_line = i
        continue

    if stripped.startswith("import {") and "from" not in stripped:
        inside_multiline_import = True
        last_import_line = i
        continue

    if stripped.startswith("import "):
        last_import_line = i
        continue

    # Una vez encontrado código real después de imports,
    # dejamos de buscar.
    if last_import_line >= 0 and stripped:
        break

if last_import_line == -1:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ No se pudo detectar correctamente el bloque de imports."
    )

lines.insert(
    last_import_line + 1,
    'import CommerceOSBoot from "./CommerceOSBoot";'
)

text = "\n".join(lines) + ("\n" if original.endswith("\n") else "")

print("✓ Import insertado fuera de los imports existentes.")

# ------------------------------------------------------------
# 5. Detectar AppScreen
# ------------------------------------------------------------

screen_match = re.search(
    r"type\s+AppScreen\s*=\s*([^;]+);",
    text
)

if not screen_match:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ No se encontró type AppScreen. Restaurado."
    )

screen_values = screen_match.group(1)

if "commerceBoot" not in screen_values:

    new_values = screen_values.rstrip() + " | 'commerceBoot'"

    text = (
        text[:screen_match.start(1)]
        + new_values
        + text[screen_match.end(1):]
    )

    print("✓ Estado commerceBoot agregado a AppScreen.")
else:
    print("✓ Estado commerceBoot ya existía.")

# ------------------------------------------------------------
# 6. Detectar el render actual de workspace
# ------------------------------------------------------------

workspace_render = re.search(
    r"\{currentScreen\s*===\s*(['\"])workspace\1\s*&&\s*\(",
    text
)

if not workspace_render:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ No se encontró el render de workspace. Restaurado."
    )

workspace_start = workspace_render.start()

print(
    f"✓ Render de workspace encontrado en posición {workspace_start}."
)

# ------------------------------------------------------------
# 7. Insertar CommerceOSBoot ANTES de workspace
# ------------------------------------------------------------

boot_render = """{currentScreen === 'commerceBoot' && (
        <CommerceOSBoot
          onComplete={() => setCurrentScreen('workspace')}
        />
      )}

      """

text = (
    text[:workspace_start]
    + boot_render
    + text[workspace_start:]
)

print("✓ CommerceOSBoot insertado antes de workspace.")

# ------------------------------------------------------------
# 8. Detectar navegación hacia workspace
# ------------------------------------------------------------

workspace_calls = list(
    re.finditer(
        r"setCurrentScreen\(\s*(['\"])workspace\1\s*\)",
        text
    )
)

if not workspace_calls:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ No se encontró ninguna transición hacia workspace."
    )

print(
    f"✓ Se encontraron {len(workspace_calls)} transición(es) "
    "hacia workspace."
)

# ------------------------------------------------------------
# 9. Encontrar handleSelectTool
# ------------------------------------------------------------

handle_match = re.search(
    r"(const\s+handleSelectTool\s*=\s*\([^)]*\)\s*=>\s*\{)",
    text
)

if not handle_match:

    # Alternativa común: function handleSelectTool
    handle_match = re.search(
        r"(function\s+handleSelectTool\s*\([^)]*\)\s*\{)",
        text
    )

if not handle_match:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ No se encontró handleSelectTool. Restaurado."
    )

handle_start = handle_match.start()

# Buscamos el cierre de la función de manera conservadora.
brace_start = text.find("{", handle_match.start())

depth = 0
handle_end = -1

for i in range(brace_start, len(text)):

    char = text[i]

    if char == "{":
        depth += 1

    elif char == "}":
        depth -= 1

        if depth == 0:
            handle_end = i + 1
            break

if handle_end == -1:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ No se pudo analizar handleSelectTool. Restaurado."
    )

handle_body = text[handle_start:handle_end]

# ------------------------------------------------------------
# 10. Modificar solamente la salida de handleSelectTool
# ------------------------------------------------------------

if "setCurrentScreen('workspace')" in handle_body:
    new_handle_body = handle_body.replace(
        "setCurrentScreen('workspace')",
        "setCurrentScreen('commerceBoot')"
    )
elif 'setCurrentScreen("workspace")' in handle_body:
    new_handle_body = handle_body.replace(
        'setCurrentScreen("workspace")',
        "setCurrentScreen('commerceBoot')"
    )
else:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ handleSelectTool no contiene una transición directa "
        "a workspace. Restaurado."
    )

text = (
    text[:handle_start]
    + new_handle_body
    + text[handle_end:]
)

print("✓ Main → Commerce OS configurado.")

# ------------------------------------------------------------
# 11. Validaciones antes del build
# ------------------------------------------------------------

required = [
    'import CommerceOSBoot from "./CommerceOSBoot";',
    "'commerceBoot'",
    "<CommerceOSBoot",
    "onComplete={() => setCurrentScreen('workspace')}",
]

for item in required:

    if item not in text:

        shutil.copy2(backup, APP)

        raise SystemExit(
            f"❌ Validación fallida: no se encontró:\n{item}\n"
            "App.tsx restaurado."
        )

# Seguridad adicional:
# la Splash y DigitalBoostMainPage deben seguir existiendo.

if "SplashScreen" not in text:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ SplashScreen desapareció durante la modificación. "
        "App.tsx restaurado."
    )

if "DigitalBoostMainPage" not in text:
    shutil.copy2(backup, APP)
    raise SystemExit(
        "❌ DigitalBoostMainPage desapareció durante la modificación. "
        "App.tsx restaurado."
    )

# ------------------------------------------------------------
# 12. Guardar modificación
# ------------------------------------------------------------

APP.write_text(text, encoding="utf-8")

print("✓ Validaciones estructurales correctas.")
print()
print("===== BUILD DE SEGURIDAD =====")
print()

result = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT
)

# ------------------------------------------------------------
# 13. Rollback automático
# ------------------------------------------------------------

if result.returncode != 0:

    print()
    print("==============================================")
    print("❌ BUILD FALLÓ")
    print("==============================================")
    print()
    print("Restaurando App.tsx...")
    
    shutil.copy2(backup, APP)

    print("✓ App.tsx restaurado.")
    print("✓ Splash protegida.")
    print("✓ Página principal protegida.")
    print("✓ StoreBuilderWorkspace no fue modificado.")
    print()
    sys.exit(1)

# ------------------------------------------------------------
# 14. Éxito
# ------------------------------------------------------------

print()
print("==============================================")
print("✅ CONEXIÓN INSTALADA CORRECTAMENTE")
print("==============================================")
print()
print("Flujo:")
print()
print("Splash")
print("   ↓")
print("Página principal")
print("   ↓")
print("Commerce OS Boot")
print("   ↓")
print("Store Builder")
print()
print("✓ Build correcto")
print("✓ App.tsx validado")
print("✓ Splash conservada")
print("✓ DigitalBoostMainPage conservada")
print("✓ StoreBuilderWorkspace NO modificado")
print()
print(f"Backup disponible en:")
print(f"  {backup}")
print()
print("Ahora reiniciá el servidor y probá la aplicación.")
print()
