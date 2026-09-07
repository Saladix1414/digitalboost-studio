#!/usr/bin/env python3

from pathlib import Path
import re
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"

print("=" * 90)
print("DIGITALBOOST — DIAGNÓSTICO REAL DE COMMERCE OS")
print("SOLO LECTURA — NO MODIFICA NINGÚN ARCHIVO")
print("=" * 90)
print()

if not SRC.exists():
    print("❌ No existe la carpeta src")
    sys.exit(1)

# ============================================================
# ARCHIVOS
# ============================================================

files = list(SRC.rglob("*"))

tsx_files = [
    p for p in files
    if p.is_file() and p.suffix in {".tsx", ".ts", ".jsx", ".js"}
]

css_files = [
    p for p in files
    if p.is_file() and p.suffix in {".css", ".scss", ".sass"}
]

print(f"✓ Archivos TS/TSX/JS encontrados: {len(tsx_files)}")
print(f"✓ Archivos CSS encontrados:        {len(css_files)}")
print()

# ============================================================
# BUSCADOR
# ============================================================

def read_text(path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def print_matches(title, pattern, paths, max_lines=80):
    print()
    print("=" * 90)
    print(title)
    print("=" * 90)

    total = 0

    rx = re.compile(pattern, re.IGNORECASE)

    for path in paths:
        text = read_text(path)

        for line_no, line in enumerate(text.splitlines(), 1):
            if rx.search(line):
                print(f"{path.relative_to(ROOT)}:{line_no}: {line.strip()[:500]}")
                total += 1

                if total >= max_lines:
                    print()
                    print(f"... límite de {max_lines} coincidencias alcanzado.")
                    return total

    if total == 0:
        print("NINGUNA COINCIDENCIA")

    return total


# ============================================================
# 1. COMMERCE OS
# ============================================================

print_matches(
    "1 — TODAS LAS REFERENCIAS A COMMERCE OS",
    r"CommerceOS|Commerce OS|commerce-os|commerce_os",
    tsx_files,
    150
)

# ============================================================
# 2. COMPONENTE CommerceOSOverview
# ============================================================

print_matches(
    "2 — REFERENCIAS A CommerceOSOverview",
    r"CommerceOSOverview",
    tsx_files,
    100
)

# ============================================================
# 3. COMPONENTES CON NOMBRE COMMERCE
# ============================================================

print_matches(
    "3 — ARCHIVOS / COMPONENTES RELACIONADOS CON COMMERCE",
    r"(Commerce|commerce)",
    tsx_files,
    150
)

# ============================================================
# 4. FONDOS TAILWIND
# ============================================================

print_matches(
    "4 — FONDOS bg-* EN COMPONENTES DE COMMERCE",
    r"bg-(?:\[[^\]]+\]|[a-z0-9_./\-\[\]]+)",
    tsx_files,
    250
)

# ============================================================
# 5. HEX
# ============================================================

print_matches(
    "5 — COLORES HEX EN COMPONENTES",
    r"#[0-9a-fA-F]{3,8}",
    tsx_files,
    250
)

# ============================================================
# 6. RGBA / RGB
# ============================================================

print_matches(
    "6 — COLORES RGB/RGBA",
    r"rgba?\([^)]+\)",
    tsx_files,
    200
)

# ============================================================
# 7. ESTILOS INLINE
# ============================================================

print_matches(
    "7 — STYLE={{...}} / ESTILOS INLINE",
    r"style\s*=\s*\{\{",
    tsx_files,
    150
)

# ============================================================
# 8. CSS GLOBAL
# ============================================================

print_matches(
    "8 — CSS GLOBAL / SELECTORES QUE PODRÍAN SOBRESCRIBIR COMMERCE",
    r"(commerce|store-builder|db-commerce|body|html|root|\*)",
    css_files,
    250
)

# ============================================================
# 9. !important
# ============================================================

print_matches(
    "9 — !important EN CSS",
    r"!important",
    css_files,
    150
)

# ============================================================
# 10. IMPORTS CSS
# ============================================================

print_matches(
    "10 — IMPORTS DE CSS EN COMPONENTES",
    r"import\s+['\"].*\.css['\"]",
    tsx_files,
    200
)

# ============================================================
# 11. APP.TSX — RUTA DE COMMERCE
# ============================================================

APP = SRC / "App.tsx"

print()
print("=" * 90)
print("11 — RUTA REAL DESDE App.tsx")
print("=" * 90)

if APP.exists():
    app_text = read_text(APP)

    lines = app_text.splitlines()

    found = False

    keywords = [
        "CommerceOS",
        "Commerce",
        "commerce",
        "commerce-os",
        "commerce_os"
    ]

    for i, line in enumerate(lines, 1):
        if any(k.lower() in line.lower() for k in keywords):
            start = max(1, i - 4)
            end = min(len(lines), i + 6)

            print()
            print(f"--- App.tsx alrededor de línea {i} ---")

            for n in range(start, end + 1):
                print(f"{n}: {lines[n-1]}")

            found = True

    if not found:
        print("⚠️ No aparece Commerce OS directamente en App.tsx")
else:
    print("❌ No existe App.tsx")

# ============================================================
# 12. BUSCAR FONDOS ESPECÍFICOS QUE SIGUEN EXISTIENDO
# ============================================================

print()
print("=" * 90)
print("12 — COLORES OSCUROS QUE SIGUEN PRESENTES")
print("=" * 90)

dark_patterns = [
    "#02050b",
    "#02050a",
    "#02050d",
    "#03060d",
    "#040811",
    "#050912",
    "#050914",
    "#0a0714",
    "#0a1020",
    "#01040a",
    "bg-black",
    "bg-[#020",
    "bg-[#010",
]

for pattern in dark_patterns:

    found = []

    for path in tsx_files + css_files:
        text = read_text(path)

        if pattern.lower() in text.lower():
            for line_no, line in enumerate(text.splitlines(), 1):
                if pattern.lower() in line.lower():
                    found.append(
                        f"{path.relative_to(ROOT)}:{line_no}: {line.strip()[:450]}"
                    )

    if found:
        print()
        print(f"### {pattern}")

        for line in found[:30]:
            print(line)

# ============================================================
# 13. BUSCAR SELECTORES Commerce / data ATTRIBUTES
# ============================================================

print()
print("=" * 90)
print("13 — DATA ATTRIBUTES Y SELECTORES ESPECÍFICOS")
print("=" * 90)

for path in tsx_files + css_files:

    text = read_text(path)

    patterns = [
        r'data-[a-zA-Z0-9_-]*commerce[a-zA-Z0-9_-]*',
        r'data-[a-zA-Z0-9_-]*store[a-zA-Z0-9_-]*',
        r'\.db-[a-zA-Z0-9_-]*commerce[a-zA-Z0-9_-]*',
        r'\.commerce[a-zA-Z0-9_-]*',
    ]

    matches = []

    for pattern in patterns:
        matches.extend(re.findall(pattern, text, re.IGNORECASE))

    if matches:
        unique = sorted(set(matches))

        print()
        print(path.relative_to(ROOT))

        for item in unique[:50]:
            print("  ", item)

# ============================================================
# 14. ARCHIVOS DE PALETA CREADOS
# ============================================================

print()
print("=" * 90)
print("14 — ARCHIVOS DE PALETA / VIBRANT EN EL PROYECTO")
print("=" * 90)

for path in files:

    if not path.is_file():
        continue

    name = path.name.lower()

    if (
        "palette" in name
        or "vibrant" in name
        or "commerce" in name
        or "store-builder" in name
    ):
        print(path.relative_to(ROOT))

# ============================================================
# 15. RESUMEN AUTOMÁTICO
# ============================================================

print()
print("=" * 90)
print("15 — RESUMEN AUTOMÁTICO")
print("=" * 90)

commerce_overview_files = []

for path in tsx_files:
    text = read_text(path)

    if "CommerceOSOverview" in text:
        commerce_overview_files.append(path)

print()

if commerce_overview_files:
    print("✓ CommerceOSOverview aparece en:")
    for p in commerce_overview_files:
        print("  -", p.relative_to(ROOT))
else:
    print("⚠️ CommerceOSOverview NO aparece en los archivos TS/TSX.")

print()

commerce_files = []

for path in tsx_files:
    text = read_text(path)

    if re.search(r"Commerce|commerce", text):
        commerce_files.append(path)

print(f"✓ Archivos TS/TSX relacionados con Commerce: {len(commerce_files)}")

print()

dark_hits = 0

for path in tsx_files + css_files:
    text = read_text(path)

    for pattern in dark_patterns:
        if pattern.lower() in text.lower():
            dark_hits += 1
            break

print(f"✓ Archivos que todavía contienen fondos oscuros conocidos: {dark_hits}")

print()

css_commerce = 0

for path in css_files:
    text = read_text(path)

    if re.search(r"commerce|db-commerce", text, re.IGNORECASE):
        css_commerce += 1

print(f"✓ CSS que contiene reglas Commerce: {css_commerce}")

print()
print("=" * 90)
print("DIAGNÓSTICO TERMINADO")
print("=" * 90)
print()
print("IMPORTANTE:")
print("Este script NO modificó ningún archivo.")
print("No creó backups.")
print("No ejecutó npm.")
print("No modificó Commerce OS.")
print("No modificó Store Builder.")
print()
print("Copiá y pegá TODO el resultado que aparece después de ejecutar:")
print()
print("python3 diagnose_commerce_os_visual.py")
print()
print("=" * 90)
