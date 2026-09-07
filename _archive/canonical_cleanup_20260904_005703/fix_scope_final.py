from pathlib import Path
import re
import shutil
from datetime import datetime

ROOT = Path.cwd()
SRC = ROOT / "src"
STORE = SRC / "StoreBuilderWorkspace.tsx"
ENV = SRC / "StoreBuilderEnvironment.tsx"

STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

if not STORE.exists():
    raise SystemExit("ERROR: no existe StoreBuilderWorkspace.tsx")

CSS = SRC / "store-builder-vibrant-global.css"
if not CSS.exists():
    raise SystemExit("ERROR: no existe store-builder-vibrant-global.css")

print("=" * 70)
print("DIGITALBOOST — FIX FINAL STORE BUILDER")
print("=" * 70)

# ------------------------------------------------------------
# BACKUPS
# ------------------------------------------------------------

store_backup = STORE.with_name(
    f"{STORE.stem}.backup_{STAMP}{STORE.suffix}"
)
shutil.copy2(STORE, store_backup)

env_backup = None
if ENV.exists():
    env_backup = ENV.with_name(
        f"{ENV.stem}.backup_{STAMP}{ENV.suffix}"
    )
    shutil.copy2(ENV, env_backup)

print("✓ Backup Store Builder creado")
if env_backup:
    print("✓ Backup Environment creado")

# ------------------------------------------------------------
# CSS IMPORT
# ------------------------------------------------------------

def ensure_import(path):
    text = path.read_text(encoding="utf-8")

    if "store-builder-vibrant-global.css" not in text:
        path.write_text(
            "import './store-builder-vibrant-global.css';\n" + text,
            encoding="utf-8"
        )
        print(f"✓ CSS importado en {path.name}")
    else:
        print(f"✓ CSS ya estaba importado en {path.name}")

ensure_import(STORE)

if ENV.exists():
    ensure_import(ENV)

# ------------------------------------------------------------
# STORE BUILDER ROOT
# ------------------------------------------------------------

text = STORE.read_text(encoding="utf-8")

if 'data-store-builder-vibrant="true"' in text:
    print("✓ Store Builder ya tiene el scope")
else:

    # Busca cualquier div que contenga h-screen + overflow-hidden
    pattern = re.compile(
        r'<div(?P<attrs>[^>]*h-screen[^>]*overflow-hidden[^>]*)>',
        re.MULTILINE
    )

    match = pattern.search(text)

    if not match:
        # Segundo intento: buscar específicamente el fondo conocido
        pattern2 = re.compile(
            r'<div(?P<attrs>[^>]*bg-\[#02050d\][^>]*)>',
            re.MULTILINE
        )
        match = pattern2.search(text)

    if not match:
        print("ERROR: no se encontró el contenedor raíz.")
        print()
        print("CONTENEDORES ENCONTRADOS:")
        for i, m in enumerate(
            re.finditer(r'<div[^>]{0,300}>', text, re.MULTILINE)
        ):
            tag = m.group(0)
            if "h-screen" in tag or "overflow-hidden" in tag:
                print(f"{i}: {tag[:300]}")

        print()
        print("NO SE MODIFICÓ StoreBuilderWorkspace.tsx")
        print("Backup conservado:", store_backup.name)
        raise SystemExit(1)

    original = match.group(0)

    if "data-store-builder-vibrant" not in original:
        replacement = original.replace(
            "<div",
            '<div data-store-builder-vibrant="true"',
            1
        )

        text = text[:match.start()] + replacement + text[match.end():]
        STORE.write_text(text, encoding="utf-8")

        print("✓ SCOPE VIBRANT ACTIVADO EN STORE BUILDER")
        print()
        print("ROOT DETECTADO:")
        print(replacement[:500])

# ------------------------------------------------------------
# ENVIRONMENT
# ------------------------------------------------------------

if ENV.exists():

    env_text = ENV.read_text(encoding="utf-8")

    if 'data-store-builder-vibrant="true"' in env_text:
        print("✓ Environment ya tiene scope")
    else:

        patterns = [
            re.compile(
                r'<div(?P<attrs>[^>]*min-h-screen[^>]*)>',
                re.MULTILINE
            ),
            re.compile(
                r'<div(?P<attrs>[^>]*z-\[9999\][^>]*)>',
                re.MULTILINE
            )
        ]

        env_match = None

        for p in patterns:
            env_match = p.search(env_text)
            if env_match:
                break

        if env_match:
            original = env_match.group(0)

            replacement = original.replace(
                "<div",
                '<div data-store-builder-vibrant="true"',
                1
            )

            env_text = (
                env_text[:env_match.start()]
                + replacement
                + env_text[env_match.end():]
            )

            ENV.write_text(env_text, encoding="utf-8")

            print("✓ SCOPE VIBRANT ACTIVADO EN ENVIRONMENT")
        else:
            print("⚠ No se encontró root de Environment")

# ------------------------------------------------------------
# VERIFICACIÓN REAL
# ------------------------------------------------------------

store_check = STORE.read_text(encoding="utf-8")

print()
print("=" * 70)
print("VERIFICACIÓN")
print("=" * 70)

print(
    "CSS importado:",
    "store-builder-vibrant-global.css" in store_check
)

print(
    "Scope activo:",
    'data-store-builder-vibrant="true"' in store_check
)

if ENV.exists():
    env_check = ENV.read_text(encoding="utf-8")

    print(
        "Environment CSS:",
        "store-builder-vibrant-global.css" in env_check
    )

    print(
        "Environment scope:",
        'data-store-builder-vibrant="true"' in env_check
    )

# ------------------------------------------------------------
# MOSTRAR ROOT REAL
# ------------------------------------------------------------

print()
print("ROOT STORE BUILDER ACTUAL:")

for line_no, line in enumerate(store_check.splitlines(), 1):
    if (
        "data-store-builder-vibrant" in line
        or ("h-screen" in line and "overflow-hidden" in line)
    ):
        print(f"{line_no}: {line[:500]}")

print()
print("=" * 70)
print("FIX TERMINADO")
print("=" * 70)
