from pathlib import Path
from datetime import datetime
import re
import shutil

ROOT = Path("src")
TARGET = ROOT / "StoreBuilderWorkspace.tsx"
ENV = ROOT / "StoreBuilderEnvironment.tsx"

print("=" * 70)
print("DIGITALBOOST — STORE BUILDER ENVIRONMENT")
print("CONEXIÓN ROBUSTA DEL APPLICATION SHELL")
print("=" * 70)

if not TARGET.exists():
    raise SystemExit(f"❌ No existe {TARGET}")

if not ENV.exists():
    raise SystemExit(f"❌ No existe {ENV}")

source = TARGET.read_text(encoding="utf-8")

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = TARGET.with_name(
    f"{TARGET.stem}.before_environment_shell_{timestamp}.bak"
)

shutil.copy2(TARGET, backup)
print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# 1. IMPORT
# ------------------------------------------------------------

import_line = 'import StoreBuilderEnvironment from "./StoreBuilderEnvironment";'

if "StoreBuilderEnvironment" not in source:
    # Insertar después del último import existente.
    matches = list(re.finditer(r'^import .*?;\s*$', source, re.MULTILINE))

    if not matches:
        raise SystemExit("❌ No encontré un bloque de imports válido.")

    last_import = matches[-1]
    insert_at = last_import.end()

    source = (
        source[:insert_at]
        + "\n"
        + import_line
        + source[insert_at:]
    )

    print("✓ Import de StoreBuilderEnvironment agregado")
else:
    print("✓ StoreBuilderEnvironment ya estaba importado")

# ------------------------------------------------------------
# 2. LOCALIZAR EL RETURN PRINCIPAL DEL COMPONENTE
# ------------------------------------------------------------

# Buscamos primero StoreBuilderWorkspace como función/componente.
component_match = re.search(
    r'(?:export\s+default\s+)?function\s+StoreBuilderWorkspace\b[^{]*\{',
    source
)

if not component_match:
    # Compatibilidad con const StoreBuilderWorkspace = (...) => {
    component_match = re.search(
        r'(?:export\s+default\s+)?const\s+StoreBuilderWorkspace\b[^=]*=\s*[^=]*=>\s*\{',
        source
    )

if not component_match:
    raise SystemExit(
        "❌ No pude localizar la declaración de StoreBuilderWorkspace."
    )

component_start = component_match.end()

# ------------------------------------------------------------
# 3. ENCONTRAR "return (" DENTRO DEL COMPONENTE
# ------------------------------------------------------------

return_match = re.search(
    r'\breturn\s*\(',
    source[component_start:]
)

if not return_match:
    raise SystemExit(
        "❌ No encontré el return principal de StoreBuilderWorkspace."
    )

return_start = component_start + return_match.start()
open_paren = source.find("(", return_start)

if open_paren == -1:
    raise SystemExit("❌ No encontré el paréntesis de apertura del return.")

print(
    f"✓ Return principal localizado aproximadamente en línea "
    f"{source[:return_start].count(chr(10)) + 1}"
)

# ------------------------------------------------------------
# 4. ENCONTRAR EL ")" CORRESPONDIENTE
# ------------------------------------------------------------

def find_matching_paren(text, start):
    depth = 0
    i = start

    in_single = False
    in_double = False
    in_template = False
    in_line_comment = False
    in_block_comment = False
    escaped = False

    while i < len(text):
        c = text[i]
        n = text[i + 1] if i + 1 < len(text) else ""

        if in_line_comment:
            if c == "\n":
                in_line_comment = False
            i += 1
            continue

        if in_block_comment:
            if c == "*" and n == "/":
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue

        if in_single:
            if escaped:
                escaped = False
            elif c == "\\":
                escaped = True
            elif c == "'":
                in_single = False
            i += 1
            continue

        if in_double:
            if escaped:
                escaped = False
            elif c == "\\":
                escaped = True
            elif c == '"':
                in_double = False
            i += 1
            continue

        if in_template:
            if escaped:
                escaped = False
            elif c == "\\":
                escaped = True
            elif c == "`":
                in_template = False
            i += 1
            continue

        # comentarios
        if c == "/" and n == "/":
            in_line_comment = True
            i += 2
            continue

        if c == "/" and n == "*":
            in_block_comment = True
            i += 2
            continue

        # strings
        if c == "'":
            in_single = True
            i += 1
            continue

        if c == '"':
            in_double = True
            i += 1
            continue

        if c == "`":
            in_template = True
            i += 1
            continue

        if c == "(":
            depth += 1

        elif c == ")":
            depth -= 1

            if depth == 0:
                return i

        i += 1

    return -1


close_paren = find_matching_paren(source, open_paren)

if close_paren == -1:
    raise SystemExit(
        "❌ No pude encontrar el cierre real del return principal."
    )

print(
    f"✓ Cierre real del return localizado aproximadamente en línea "
    f"{source[:close_paren].count(chr(10)) + 1}"
)

# ------------------------------------------------------------
# 5. VERIFICAR SI YA ESTÁ ENVUELTO
# ------------------------------------------------------------

before = source[max(0, open_paren - 300):open_paren]
after = source[close_paren:min(len(source), close_paren + 300)]

if (
    "<StoreBuilderEnvironment" in before
    or "<StoreBuilderEnvironment" in after
):
    print("⚠️ StoreBuilderEnvironment ya parece estar conectado.")
    print("No se aplicó una segunda envoltura.")
    print(f"Backup conservado: {backup.name}")
    raise SystemExit(0)

# ------------------------------------------------------------
# 6. ENVOLVER EL RETURN COMPLETO
# ------------------------------------------------------------

opening = """
      <StoreBuilderEnvironment>
"""

closing = """
      </StoreBuilderEnvironment>
"""

# Insertar desde atrás para no alterar índices.
source = (
    source[:close_paren]
    + closing
    + source[close_paren:]
)

source = (
    source[:open_paren + 1]
    + opening
    + source[open_paren + 1:]
)

TARGET.write_text(source, encoding="utf-8")

print("✓ StoreBuilderEnvironment conectado alrededor del entorno completo")
print("✓ Archivo original actualizado")
print(f"✓ Backup disponible: {backup.name}")

# ------------------------------------------------------------
# 7. VERIFICACIÓN
# ------------------------------------------------------------

updated = TARGET.read_text(encoding="utf-8")

checks = [
    (
        "Import",
        'import StoreBuilderEnvironment from "./StoreBuilderEnvironment";'
        in updated
    ),
    (
        "Opening shell",
        "<StoreBuilderEnvironment>" in updated
    ),
    (
        "Closing shell",
        "</StoreBuilderEnvironment>" in updated
    ),
]

print()
print("=" * 70)
print("VERIFICACIÓN")
print("=" * 70)

ok = True

for name, result in checks:
    if result:
        print(f"✓ {name}")
    else:
        print(f"❌ {name}")
        ok = False

print()

if not ok:
    print("❌ La conexión no pasó la verificación.")
    print(f"Restaurá si fuera necesario desde: {backup.name}")
    raise SystemExit(1)

print("✓ CONEXIÓN COMPLETADA")
print()
print("Ahora verificaremos el build.")
