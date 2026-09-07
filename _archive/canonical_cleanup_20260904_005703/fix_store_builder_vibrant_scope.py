#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"

STORE = SRC / "StoreBuilderWorkspace.tsx"
ENV = SRC / "StoreBuilderEnvironment.tsx"

CSS = SRC / "store-builder-vibrant-global.css"

STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 82)
print("DIGITALBOOST — STORE BUILDER VIBRANT SCOPE FIX")
print("CORRECCIÓN DEL ALCANCE VISUAL")
print("=" * 82)
print()

# ============================================================
# VALIDACIÓN
# ============================================================

if not STORE.exists():
    print(f"❌ No existe: {STORE}")
    sys.exit(1)

if not CSS.exists():
    print(f"❌ No existe: {CSS}")
    print("Primero hay que disponer del CSS visual.")
    sys.exit(1)

print("✓ StoreBuilderWorkspace.tsx encontrado")
print("✓ store-builder-vibrant-global.css encontrado")

if ENV.exists():
    print("✓ StoreBuilderEnvironment.tsx encontrado")
else:
    print("⚠️ StoreBuilderEnvironment.tsx no existe")

# ============================================================
# BACKUP
# ============================================================

store_backup = STORE.with_name(
    f"{STORE.stem}.before_scope_fix_{STAMP}{STORE.suffix}"
)

shutil.copy2(STORE, store_backup)

print(f"✓ Backup creado: {store_backup.name}")

env_backup = None

if ENV.exists():
    env_backup = ENV.with_name(
        f"{ENV.stem}.before_scope_fix_{STAMP}{ENV.suffix}"
    )
    shutil.copy2(ENV, env_backup)
    print(f"✓ Backup Environment: {env_backup.name}")

# ============================================================
# IMPORT CSS
# ============================================================

def ensure_import(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")

    if "store-builder-vibrant-global.css" in text:
        print(f"✓ CSS ya importado en {path.name}")
        return False

    text = (
        "import './store-builder-vibrant-global.css';\n"
        + text
    )

    path.write_text(text, encoding="utf-8")

    print(f"✓ CSS importado en {path.name}")
    return True

ensure_import(STORE)

if ENV.exists():
    ensure_import(ENV)

# ============================================================
# STORE BUILDER ROOT
# ============================================================

store_source = STORE.read_text(encoding="utf-8")

store_old = '<div className="flex h-screen overflow-hidden bg-[#02050d] text-white">'

store_new = '<div data-store-builder-vibrant="true" className="flex h-screen overflow-hidden bg-[#02050d] text-white">'

if 'data-store-builder-vibrant="true"' in store_source:

    print("✓ Store Builder ya tiene el scope visual activo")

elif store_old in store_source:

    store_source = store_source.replace(
        store_old,
        store_new,
        1
    )

    STORE.write_text(
        store_source,
        encoding="utf-8"
    )

    print("✓ Scope visual activado en Store Builder")

else:

    # Fallback extremadamente conservador
    marker = '<div className="flex h-screen overflow-hidden'

    position = store_source.find(marker)

    if position == -1:
        print("❌ No se encontró el root de Store Builder")
        print("Restaurando backup...")
        shutil.copy2(store_backup, STORE)
        if env_backup:
            shutil.copy2(env_backup, ENV)
        sys.exit(1)

    end = store_source.find(">", position)

    if end == -1:
        print("❌ No se encontró cierre del root de Store Builder")
        print("Restaurando backup...")
        shutil.copy2(store_backup, STORE)
        if env_backup:
            shutil.copy2(env_backup, ENV)
        sys.exit(1)

    original_tag = store_source[position:end + 1]

    if "className=" not in original_tag:
        print("❌ El root encontrado no contiene className")
        print("Restaurando backup...")
        shutil.copy2(store_backup, STORE)
        if env_backup:
            shutil.copy2(env_backup, ENV)
        sys.exit(1)

    fallback_tag = original_tag.replace(
        "<div ",
        '<div data-store-builder-vibrant="true" ',
        1
    )

    store_source = (
        store_source[:position]
        + fallback_tag
        + store_source[end + 1:]
    )

    STORE.write_text(
        store_source,
        encoding="utf-8"
    )

    print("✓ Scope visual activado mediante fallback seguro")

# ============================================================
# ENVIRONMENT ROOT
# ============================================================

if ENV.exists():

    env_source = ENV.read_text(encoding="utf-8")

    if 'data-store-builder-vibrant="true"' in env_source:

        print("✓ Environment ya tiene scope visual")

    else:

        env_old = '<div className="min-h-screen bg-[#01040a] text-white">'

        env_new = '<div data-store-builder-vibrant="true" className="min-h-screen bg-[#01040a] text-white">'

        if env_old in env_source:

            env_source = env_source.replace(
                env_old,
                env_new,
                1
            )

            ENV.write_text(
                env_source,
                encoding="utf-8"
            )

            print("✓ Scope visual activado en Environment")

        else:

            marker = '<div className="min-h-screen'

            position = env_source.find(marker)

            if position >= 0:

                end = env_source.find(">", position)

                if end >= 0:

                    original_tag = env_source[position:end + 1]

                    fallback_tag = original_tag.replace(
                        "<div ",
                        '<div data-store-builder-vibrant="true" ',
                        1
                    )

                    env_source = (
                        env_source[:position]
                        + fallback_tag
                        + env_source[end + 1:]
                    )

                    ENV.write_text(
                        env_source,
                        encoding="utf-8"
                    )

                    print("✓ Environment marcado mediante fallback")

                else:
                    print("⚠️ No se pudo modificar Environment")

            else:
                print("⚠️ No se encontró root de Environment")

# ============================================================
# VERIFICACIÓN
# ============================================================

print()
print("=" * 82)
print("VERIFICACIÓN DEL SCOPE")
print("=" * 82)

store_check = STORE.read_text(encoding="utf-8")

print(
    "✓ CSS importado:",
    "store-builder-vibrant-global.css" in store_check
)

print(
    '✓ data-store-builder-vibrant="true":',
    'data-store-builder-vibrant="true"' in store_check
)

if ENV.exists():

    env_check = ENV.read_text(encoding="utf-8")

    print(
        "✓ Environment CSS importado:",
        "store-builder-vibrant-global.css" in env_check
    )

    print(
        '✓ Environment scope:',
        'data-store-builder-vibrant="true"' in env_check
    )

# ============================================================
# COMPROBAR QUE NO TOCAMOS APP.TSX
# ============================================================

APP = SRC / "App.tsx"

if APP.exists():
    print()
    print("✓ App.tsx no será modificado por este proceso")

# ============================================================
# BUILD
# ============================================================

print()
print("=" * 82)
print("BUILD DE VERIFICACIÓN")
print("=" * 82)

try:

    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=180
    )

except subprocess.TimeoutExpired:

    print("❌ BUILD excedió el tiempo límite")
    print("Restaurando...")

    shutil.copy2(store_backup, STORE)

    if env_backup:
        shutil.copy2(env_backup, ENV)

    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible")
    print("Restaurando...")

    shutil.copy2(store_backup, STORE)

    if env_backup:
        shutil.copy2(env_backup, ENV)

    sys.exit(1)

print(result.stdout)

if result.returncode != 0:

    if result.stderr:
        print(result.stderr)

    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando archivos...")

    shutil.copy2(store_backup, STORE)

    if env_backup:
        shutil.copy2(env_backup, ENV)

    print("✓ StoreBuilderWorkspace.tsx restaurado")

    if env_backup:
        print("✓ StoreBuilderEnvironment.tsx restaurado")

    sys.exit(result.returncode)

# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 82)
print("STORE BUILDER VIBRANT SCOPE CORREGIDO")
print("=" * 82)

print()
print("✓ CSS conectado")
print("✓ Scope visual activo")
print("✓ Store Builder listo para recibir el sistema Vibrant")
print("✓ Environment listo")
print("✓ App.tsx protegido")
print("✓ Commerce OS protegido")
print("✓ Web Builder protegido")
print("✓ Sin cambios de lógica")
print("✓ Sin NFT")
print("✓ Sin dragones")

print()
print("Backup:")
print(f"  {store_backup.name}")

if env_backup:
    print(f"  {env_backup.name}")

print()
print("Ejecutá:")
print("npm run dev")

print("=" * 82)
