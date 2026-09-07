from pathlib import Path
import re

ROOT = Path("src")

print("=" * 78)
print("🔎 DIAGNÓSTICO REAL — COLOR DEL STORE BUILDER")
print("=" * 78)

# ------------------------------------------------------------
# 1. ARCHIVOS RELEVANTES
# ------------------------------------------------------------
print("\n[1] ARCHIVOS DEL STORE BUILDER")
print("-" * 78)

for p in sorted(ROOT.iterdir()):
    if any(x in p.name.lower() for x in [
        "storebuilder",
        "store-builder",
        "websitebuilder",
        "website-builder",
        "commerce",
    ]):
        print("•", p)

# ------------------------------------------------------------
# 2. IMPORTS CSS DEL STORE BUILDER
# ------------------------------------------------------------
print("\n[2] IMPORTS CSS EN StoreBuilderWorkspace.tsx")
print("-" * 78)

workspace = ROOT / "StoreBuilderWorkspace.tsx"

if workspace.exists():
    text = workspace.read_text(encoding="utf-8", errors="ignore")

    for n, line in enumerate(text.splitlines(), 1):
        if re.search(r'import.*\.css', line):
            print(f"{n}: {line.strip()}")
else:
    print("❌ No existe StoreBuilderWorkspace.tsx")

# ------------------------------------------------------------
# 3. DATA ATTRIBUTES
# ------------------------------------------------------------
print("\n[3] DATA ATTRIBUTES RELACIONADOS CON STORE BUILDER")
print("-" * 78)

for p in ROOT.glob("*"):
    if p.suffix not in [".tsx", ".ts", ".css"]:
        continue

    try:
        lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()
    except:
        continue

    for n, line in enumerate(lines, 1):
        if re.search(
            r'data-store-builder|data-store|store-builder-vibrant',
            line,
            re.I
        ):
            print(f"{p}:{n}: {line.strip()}")

# ------------------------------------------------------------
# 4. CONTENEDORES PRINCIPALES
# ------------------------------------------------------------
print("\n[4] CONTENEDORES PRINCIPALES CON BACKGROUND")
print("-" * 78)

if workspace.exists():
    lines = text.splitlines()

    for n, line in enumerate(lines, 1):
        if (
            "h-screen" in line
            or "min-h-screen" in line
            or "fixed inset" in line
            or "overflow-hidden" in line
        ):
            if "bg-" in line or "background" in line:
                print(f"{n}: {line.strip()}")

# ------------------------------------------------------------
# 5. COLORES DIRECTOS EN WORKSPACE
# ------------------------------------------------------------
print("\n[5] COLORES DIRECTOS EN StoreBuilderWorkspace.tsx")
print("-" * 78)

colors = []

if workspace.exists():
    for n, line in enumerate(lines, 1):
        found = re.findall(
            r'(?:bg|text|border|from|via|to|hover:bg|focus:border)-\[[^\]]+\]',
            line
        )

        if found:
            colors.append((n, found, line.strip()))

for n, found, line in colors[:100]:
    print(f"{n}: {', '.join(found)}")
    print(f"    {line[:220]}")

# ------------------------------------------------------------
# 6. CSS ESPECÍFICO DEL STORE BUILDER
# ------------------------------------------------------------
print("\n[6] REGLAS CSS DE STORE BUILDER")
print("-" * 78)

css_files = [
    ROOT / "store-builder-vibrant-global.css",
    ROOT / "store-builder-studio-v2.css",
    ROOT / "store-builder-studio-shell.css",
    ROOT / "commerce-os-vibrant-global.css",
]

for css in css_files:
    if not css.exists():
        continue

    print(f"\n### {css}")

    css_text = css.read_text(encoding="utf-8", errors="ignore")

    for n, line in enumerate(css_text.splitlines(), 1):
        if re.search(
            r'background|background-color|background-image|color:|--.*color|--.*bg',
            line,
            re.I
        ):
            print(f"{n}: {line.strip()}")

# ------------------------------------------------------------
# 7. APP — QUIÉN LLAMA AL STORE BUILDER
# ------------------------------------------------------------
print("\n[7] App.tsx → StoreBuilderWorkspace")
print("-" * 78)

app = ROOT / "App.tsx"

if app.exists():
    app_lines = app.read_text(
        encoding="utf-8",
        errors="ignore"
    ).splitlines()

    for n, line in enumerate(app_lines, 1):
        if re.search(
            r'StoreBuilderWorkspace|store.?builder|CommerceOSOverview',
            line,
            re.I
        ):
            print(f"{n}: {line.strip()}")

# ------------------------------------------------------------
# 8. COMPONENTES QUE PUEDEN ESTAR ENCIMA
# ------------------------------------------------------------
print("\n[8] COMPONENTES CON STORE BUILDER EN EL RENDER")
print("-" * 78)

for p in ROOT.glob("*.tsx"):
    try:
        txt = p.read_text(encoding="utf-8", errors="ignore")
    except:
        continue

    if "StoreBuilderWorkspace" in txt:
        print("•", p)

# ------------------------------------------------------------
# 9. RESUMEN
# ------------------------------------------------------------
print("\n")
print("=" * 78)
print("✅ DIAGNÓSTICO TERMINADO")
print("=" * 78)
print()
print("⚠️ NO SE MODIFICÓ NINGÚN ARCHIVO.")
print()
print("Con esta salida podremos identificar la capa visual REAL")
print("antes de volver a cambiar colores.")
print("=" * 78)
