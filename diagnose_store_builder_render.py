from pathlib import Path
import re

ROOT = Path("src")
TSX = ROOT / "StoreBuilderWorkspace.tsx"

print()
print("=" * 80)
print("🔍 DIGITALBOOST — STORE BUILDER / RENDER REAL")
print("=" * 80)
print()

if not TSX.exists():
    print("❌ NO EXISTE:")
    print("   src/StoreBuilderWorkspace.tsx")
    raise SystemExit(1)

text = TSX.read_text(encoding="utf-8")

print("📁 ARCHIVO")
print("   src/StoreBuilderWorkspace.tsx")
print()

print("=" * 80)
print("1️⃣ IMPORTS CSS")
print("=" * 80)

for i, line in enumerate(text.splitlines(), 1):
    if ".css" in line:
        print(f"{i}: {line}")

print()
print("=" * 80)
print("2️⃣ STORE BUILDER V4")
print("=" * 80)

checks = [
    'store-builder-v4',
    'data-store-builder="true"',
    'store-builder-v4-neon-dark.css',
    'store-builder-v3-neon.css',
    'store-builder-light-background-final.css',
    'store-builder-studio-shell.css',
    'store-builder-studio-v2.css',
]

for item in checks:
    print(f"{item:<45} : {item in text}")

print()
print("=" * 80)
print("3️⃣ COMPONENTE")
print("=" * 80)

patterns = [
    r'export\s+default\s+function\s+([A-Za-z0-9_]+)',
    r'export\s+function\s+([A-Za-z0-9_]+)',
    r'const\s+([A-Za-z0-9_]+)\s*=\s*\(',
]

found_components = []

for pattern in patterns:
    for match in re.finditer(pattern, text):
        name = match.group(1)
        if "Store" in name or "Builder" in name or name == "App":
            if name not in found_components:
                found_components.append(name)

for name in found_components:
    print("   ", name)

print()
print("=" * 80)
print("4️⃣ ROOTS / CONTENEDORES")
print("=" * 80)

lines = text.splitlines()

keywords = [
    "h-screen",
    "min-h-screen",
    "Store Builder",
    "store-builder",
    "bg-[#",
    "bg-white",
    "return (",
]

shown = set()

for i, line in enumerate(lines, 1):
    if any(k in line for k in keywords):
        start = max(1, i - 2)
        end = min(len(lines), i + 2)

        key = (start, end)

        if key in shown:
            continue

        shown.add(key)

        print()
        print(f"--- líneas {start}-{end} ---")

        for n in range(start, end + 1):
            print(f"{n}: {lines[n-1]}")

print()
print("=" * 80)
print("5️⃣ BACKGROUNDS REALES EN TSX")
print("=" * 80)

backgrounds = {}

for i, line in enumerate(lines, 1):
    if "bg-" in line:
        matches = re.findall(r'bg-[A-Za-z0-9_./\[\]#%-]+', line)

        for value in matches:
            backgrounds.setdefault(value, []).append(i)

for value, nums in backgrounds.items():
    print(f"{value:<35} → {len(nums)} ocurrencias → {nums[:12]}")

print()
print("=" * 80)
print("6️⃣ ROOT V4 EXACTO")
print("=" * 80)

for i, line in enumerate(lines, 1):
    if "store-builder-v4" in line or 'data-store-builder="true"' in line:
        print(f"{i}: {line}")

print()
print("=" * 80)
print("7️⃣ ARCHIVOS CSS STORE BUILDER")
print("=" * 80)

for file in sorted(ROOT.glob("*store-builder*.css")):
    print(f"   ✅ {file.name}")

print()
print("=" * 80)
print("8️⃣ POSIBLE CAUSA")
print("=" * 80)

if 'data-store-builder="true"' not in text:
    print("❌ El atributo data-store-builder NO está en el TSX.")
    print("   El CSS V4 no puede aplicar sus reglas scoped.")

elif "store-builder-v4" not in text:
    print("❌ La clase store-builder-v4 NO está en el TSX.")
    print("   El CSS V4 no tiene un root al cual engancharse.")

elif "store-builder-v4-neon-dark.css" not in text:
    print("❌ El CSS V4 NO está importado.")

else:
    print("✅ El root V4 aparentemente existe.")
    print()
    print("Entonces la siguiente sospecha es:")
    print("   • otro CSS está sobrescribiendo V4")
    print("   • existe otro contenedor superior")
    print("   • StoreBuilderWorkspace no es el componente realmente renderizado")
    print("   • existe una segunda versión del Store Builder")
    print("   • Tailwind/CSS está generando reglas posteriores")

print()
print("=" * 80)
print("🎯 DIAGNÓSTICO TERMINADO")
print("=" * 80)
print()
