from pathlib import Path
import re

ROOT = Path.cwd()
SRC = ROOT / "src"

print()
print("=" * 78)
print("🔍 DIGITALBOOST — DIAGNÓSTICO REAL DEL FONDO")
print("   STORE BUILDER")
print("=" * 78)
print()

# ------------------------------------------------------------
# ARCHIVOS
# ------------------------------------------------------------

files = [
    SRC / "StoreBuilderWorkspace.tsx",
    SRC / "App.tsx",
    SRC / "store-builder-studio-shell.css",
    SRC / "store-builder-studio-v2.css",
    SRC / "store-builder-vibrant-global.css",
    SRC / "commerce-os-vibrant-global.css",
    SRC / "commerce-os-vibrant-global.css",
]

files = list(dict.fromkeys(files))

# ------------------------------------------------------------
# 1. EXISTENCIA
# ------------------------------------------------------------

print("📁 ARCHIVOS RELEVANTES")
print("-" * 78)

for f in files:
    print(
        ("✅ " if f.exists() else "❌ "),
        f.relative_to(ROOT) if f.exists() else f
    )

# ------------------------------------------------------------
# 2. IMPORTS CSS EN STORE BUILDER
# ------------------------------------------------------------

workspace = SRC / "StoreBuilderWorkspace.tsx"

print()
print("=" * 78)
print("📦 IMPORTS CSS DE STOREBUILDERWORKSPACE")
print("=" * 78)

if workspace.exists():
    text = workspace.read_text(encoding="utf-8", errors="ignore")

    for i, line in enumerate(text.splitlines(), 1):
        if "import" in line and ".css" in line:
            print(f"{i}: {line.strip()}")

# ------------------------------------------------------------
# 3. BACKGROUND / BACKGROUND-COLOR
# ------------------------------------------------------------

print()
print("=" * 78)
print("🎨 REGLAS BACKGROUND")
print("=" * 78)

patterns = [
    r"background\s*:",
    r"background-color\s*:",
    r"--bg\s*:",
    r"--surface",
    r"--background",
]

for f in files:
    if not f.exists():
        continue

    lines = f.read_text(encoding="utf-8", errors="ignore").splitlines()

    matches = []

    for i, line in enumerate(lines, 1):
        if any(re.search(p, line, re.I) for p in patterns):
            matches.append((i, line.strip()))

    if matches:
        print()
        print(f"📄 {f.relative_to(ROOT)}")
        print("-" * 78)

        for n, line in matches:
            print(f"{n}: {line}")

# ------------------------------------------------------------
# 4. CLASES TAILWIND OSCURAS
# ------------------------------------------------------------

print()
print("=" * 78)
print("🌑 CLASES OSCURAS EN STOREBUILDER")
print("=" * 78)

dark_patterns = [
    "bg-black",
    "bg-slate-950",
    "bg-slate-900",
    "bg-slate-800",
    "bg-gray-950",
    "bg-gray-900",
    "bg-zinc-950",
    "bg-zinc-900",
    "bg-[#",
    "from-black",
    "to-black",
    "from-slate",
    "to-slate",
]

if workspace.exists():
    lines = workspace.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines()

    for i, line in enumerate(lines, 1):
        if any(x.lower() in line.lower() for x in dark_patterns):
            print(f"{i}: {line.strip()}")

# ------------------------------------------------------------
# 5. OVERLAYS
# ------------------------------------------------------------

print()
print("=" * 78)
print("⚠️ POSIBLES OVERLAYS QUE PUEDEN TAPAR EL FONDO")
print("=" * 78)

overlay_patterns = [
    "fixed inset-0",
    "absolute inset-0",
    "fixed inset-y-0",
    "bg-black/",
    "bg-black",
    "backdrop-blur",
    "z-[100]",
    "z-50",
    "z-40",
]

if workspace.exists():
    lines = workspace.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines()

    for i, line in enumerate(lines, 1):
        if any(x.lower() in line.lower() for x in overlay_patterns):
            print(f"{i}: {line.strip()}")

# ------------------------------------------------------------
# 6. SELECTOR PRINCIPAL DEL STORE BUILDER
# ------------------------------------------------------------

print()
print("=" * 78)
print("🏗️ CONTENEDORES PRINCIPALES")
print("=" * 78)

if workspace.exists():
    lines = workspace.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines()

    for i, line in enumerate(lines, 1):
        if (
            "flex h-screen" in line
            or "min-h-screen" in line
            or "h-screen" in line
            or "overflow-hidden" in line
        ):
            print(f"{i}: {line.strip()}")

# ------------------------------------------------------------
# 7. VARIABLES CSS
# ------------------------------------------------------------

print()
print("=" * 78)
print("🧩 VARIABLES CSS RELACIONADAS CON FONDO")
print("=" * 78)

for f in files:
    if not f.exists():
        continue

    lines = f.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines()

    found = False

    for i, line in enumerate(lines, 1):
        if re.search(
            r"--(bg|background|surface|panel|shell|canvas|page)",
            line,
            re.I
        ):
            if not found:
                print()
                print(f"📄 {f.relative_to(ROOT)}")
                found = True

            print(f"{i}: {line.strip()}")

# ------------------------------------------------------------
# 8. DATA STORE BUILDER
# ------------------------------------------------------------

print()
print("=" * 78)
print("🏷️ DATA ATTRIBUTES")
print("=" * 78)

for f in files:
    if not f.exists():
        continue

    lines = f.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines()

    for i, line in enumerate(lines, 1):
        if "data-store-builder" in line:
            print(f"{f.relative_to(ROOT)}:{i}: {line.strip()}")

# ------------------------------------------------------------
# 9. IMPORTS DEL SHELL
# ------------------------------------------------------------

print()
print("=" * 78)
print("📦 REFERENCIAS A STORE-BUILDER-STUDIO-SHELL")
print("=" * 78)

for f in SRC.glob("*"):
    if not f.is_file():
        continue

    try:
        text = f.read_text(
            encoding="utf-8",
            errors="ignore"
        )
    except Exception:
        continue

    if "store-builder-studio-shell" in text:
        print(f"📄 {f.relative_to(ROOT)}")

        for i, line in enumerate(text.splitlines(), 1):
            if "store-builder-studio-shell" in line:
                print(f"   {i}: {line.strip()}")

# ------------------------------------------------------------
# FINAL
# ------------------------------------------------------------

print()
print("=" * 78)
print("✅ DIAGNÓSTICO TERMINADO")
print("=" * 78)
print()
print("⚠️ NO SE MODIFICÓ NINGÚN ARCHIVO.")
print()
print("Envíame la salida completa de este diagnóstico.")
print("Con ella vamos a identificar LA CAPA REAL que pinta")
print("el fondo oscuro antes de tocar otro color.")
print()
