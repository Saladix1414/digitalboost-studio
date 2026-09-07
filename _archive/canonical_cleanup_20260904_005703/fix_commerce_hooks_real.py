from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
FILE = ROOT / "src" / "StoreBuilderWorkspace.tsx"

print("=" * 64)
print("DIGITALBOOST COMMERCE OS — REPARACIÓN REAL DE HOOKS")
print("=" * 64)
print()

if not FILE.exists():
    raise SystemExit("❌ No existe src/StoreBuilderWorkspace.tsx")

text = FILE.read_text(encoding="utf-8")
lines = text.splitlines(keepends=True)

# ============================================================
# 1. Localizar el estado del boot interno
# ============================================================

boot_state = None

for i, line in enumerate(lines):
    if "const [commerceOSBooting, setCommerceOSBooting]" in line:
        boot_state = i
        break

if boot_state is None:
    print("ℹ️ commerceOSBooting ya no existe.")
    print("   El boot interno posiblemente ya fue eliminado.")
    print()
    print("===== BUILD DE VERIFICACIÓN =====")
    result = subprocess.run(["npm", "run", "build"], cwd=ROOT)

    if result.returncode != 0:
        print("❌ El proyecto no compila.")
        sys.exit(1)

    print("✅ BUILD CORRECTO")
    sys.exit(0)

print(f"✓ commerceOSBooting encontrado: línea {boot_state + 1}")

# ============================================================
# 2. Encontrar el useEffect del boot
# ============================================================

boot_effect = None

for i in range(boot_state + 1, min(len(lines), boot_state + 30)):
    if "useEffect(() =>" in lines[i]:
        boot_effect = i
        break

if boot_effect is None:
    raise SystemExit(
        "❌ Se encontró commerceOSBooting pero no su useEffect."
    )

print(f"✓ useEffect del boot encontrado: línea {boot_effect + 1}")

# ============================================================
# 3. Encontrar openGroups
# ============================================================

open_groups = None

for i, line in enumerate(lines):
    if "const [openGroups, setOpenGroups]" in line:
        open_groups = i
        break

if open_groups is None:
    raise SystemExit("❌ No se encontró openGroups.")

print(f"✓ openGroups encontrado: línea {open_groups + 1}")

# ============================================================
# 4. Encontrar el return del boot interno
#
# Sabemos por el diagnóstico que aparece:
#
# if (commerceOSBooting) {
#     return (
#
# y que comienza alrededor de la línea 687.
#
# Buscamos el IF correspondiente después de los hooks.
# ============================================================

boot_return_if = None

for i in range(open_groups + 1, len(lines)):
    stripped = lines[i].strip()

    if stripped == "if (commerceOSBooting) {":
        boot_return_if = i
        break

if boot_return_if is None:
    raise SystemExit(
        "❌ No encontré el 'if (commerceOSBooting)' interno."
    )

print(
    f"✓ Return condicional del boot encontrado: "
    f"línea {boot_return_if + 1}"
)

# ============================================================
# 5. Encontrar exactamente el final de:
#
# if (commerceOSBooting) {
#     return (
#         ...
#     );
# }
#
# Usamos balanceo de llaves para no depender del contenido JSX.
# ============================================================

depth = 0
boot_return_end = None

for i in range(boot_return_if, len(lines)):
    line = lines[i]

    # Contamos llaves de forma sencilla.
    # Este bloque no contiene template strings problemáticos.
    depth += line.count("{")
    depth -= line.count("}")

    if i > boot_return_if and depth == 0:
        boot_return_end = i + 1
        break

if boot_return_end is None:
    raise SystemExit(
        "❌ No pude determinar el final del return del boot."
    )

print(
    f"✓ Final del return del boot encontrado: "
    f"línea {boot_return_end}"
)

# ============================================================
# 6. Verificación crítica
#
# El boot interno debe estar DESPUÉS de los hooks y antes
# del return principal del Store Builder.
# ============================================================

removed_a = "".join(lines[boot_state:open_groups])
removed_b = "".join(lines[boot_return_if:boot_return_end])

if "commerceOSBooting" not in removed_a:
    raise SystemExit(
        "❌ Seguridad: el estado del boot no está en el bloque esperado."
    )

if "useEffect" not in removed_a:
    raise SystemExit(
        "❌ Seguridad: el useEffect del boot no está en el bloque esperado."
    )

if "if (commerceOSBooting)" not in removed_b:
    raise SystemExit(
        "❌ Seguridad: no se encontró el IF exacto del boot."
    )

if "return (" not in removed_b:
    raise SystemExit(
        "❌ Seguridad: el return del boot no está en el bloque esperado."
    )

# ============================================================
# 7. Mostrar exactamente qué vamos a eliminar
# ============================================================

print()
print("=" * 64)
print("BLOQUE 1 — ESTADO + USEFFECT DEL BOOT")
print("=" * 64)

for n, line in enumerate(lines[boot_state:open_groups], start=boot_state + 1):
    print(f"{n:4}: {line.rstrip()}")

print()
print("=" * 64)
print("BLOQUE 2 — RETURN CONDICIONAL DEL BOOT")
print("=" * 64)

for n, line in enumerate(
    lines[boot_return_if:boot_return_end],
    start=boot_return_if + 1
):
    print(f"{n:4}: {line.rstrip()}")

# ============================================================
# 8. Crear backup
# ============================================================

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = FILE.with_name(
    f"StoreBuilderWorkspace.tsx.before_real_hook_fix_{timestamp}.bak"
)

shutil.copy2(FILE, backup)

print()
print(f"✓ Backup creado:")
print(f"  {backup.name}")

# ============================================================
# 9. Eliminar SOLAMENTE los dos bloques internos
# ============================================================

new_lines = (
    lines[:boot_state]
    + lines[open_groups:boot_return_if]
    + lines[boot_return_end:]
)

new_text = "".join(new_lines)

# ============================================================
# 10. Verificaciones ANTES de escribir
# ============================================================

if "commerceOSBooting" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Seguridad: commerceOSBooting todavía aparece.\n"
        "Archivo restaurado."
    )

if "setCommerceOSBooting" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Seguridad: setCommerceOSBooting todavía aparece.\n"
        "Archivo restaurado."
    )

if "if (commerceOSBooting)" in new_text:
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ Seguridad: el return del boot todavía aparece.\n"
        "Archivo restaurado."
    )

# Los hooks principales DEBEN seguir.
required = [
    "const [openGroups, setOpenGroups]",
    "const [section, setSection]",
    "const customers = useMemo",
    "const [products, setProducts]",
    "const [orders, setOrders]",
]

for needle in required:
    if needle not in new_text:
        shutil.copy2(backup, FILE)
        raise SystemExit(
            f"❌ Seguridad: desapareció '{needle}'.\n"
            "Archivo restaurado."
        )

# CommerceOSBoot separado debe seguir existiendo.
commerce_boot = ROOT / "src" / "CommerceOSBoot.tsx"

if not commerce_boot.exists():
    shutil.copy2(backup, FILE)
    raise SystemExit(
        "❌ No existe src/CommerceOSBoot.tsx.\n"
        "Archivo restaurado."
    )

# ============================================================
# 11. Escribir
# ============================================================

FILE.write_text(new_text, encoding="utf-8")

print()
print("=" * 64)
print("✓ BOOT INTERNO ELIMINADO")
print("=" * 64)
print()
print("✓ commerceOSBooting eliminado")
print("✓ useEffect interno eliminado")
print("✓ return condicional interno eliminado")
print("✓ openGroups conservado")
print("✓ section conservado")
print("✓ products conservado")
print("✓ orders conservado")
print("✓ CommerceOSBoot.tsx conservado")
print("✓ App.tsx NO modificado")
print()

# ============================================================
# 12. Mostrar hooks resultantes
# ============================================================

print("=" * 64)
print("HOOKS RESULTANTES")
print("=" * 64)

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
    print(result.stdout[:8000])

# ============================================================
# 13. BUILD
# ============================================================

print()
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

# ============================================================
# 14. Verificación final
# ============================================================

final_text = FILE.read_text(encoding="utf-8")

for forbidden in [
    "commerceOSBooting",
    "setCommerceOSBooting",
    "if (commerceOSBooting)",
]:
    if forbidden in final_text:
        shutil.copy2(backup, FILE)
        print(f"❌ Verificación final fallida: {forbidden}")
        print("✓ Archivo restaurado.")
        sys.exit(1)

for required_hook in required:
    if required_hook not in final_text:
        shutil.copy2(backup, FILE)
        print(f"❌ Verificación final fallida: {required_hook}")
        print("✓ Archivo restaurado.")
        sys.exit(1)

print()
print("=" * 64)
print("✅ FIX COMPLETADO CORRECTAMENTE")
print("=" * 64)
print()
print("Arquitectura final:")
print()
print("  Splash")
print("     ↓")
print("  Página principal")
print("     ↓")
print("  CommerceOSBoot.tsx")
print("     ↓")
print("  StoreBuilderWorkspace.tsx")
print()
print("✓ StoreBuilderWorkspace con hooks estables")
print("✓ Boot interno eliminado")
print("✓ CommerceOSBoot separado")
print("✓ App.tsx intacto")
print("✓ DigitalBoostMainPage intacta")
print("✓ Splash intacta")
print("✓ BUILD CORRECTO")
print()
print(f"Backup disponible: {backup.name}")
print()
print("👉 Reiniciá el servidor y probá nuevamente.")
print()
