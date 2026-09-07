#!/usr/bin/env python3

from pathlib import Path
import re
import subprocess
from collections import defaultdict

ROOT = Path.cwd()
SRC = ROOT / "src"
OUT = ROOT / "COMMERCE_OS_DIAGNOSTIC.txt"

if not SRC.is_dir():
    print("[ERROR] No existe src/")
    raise SystemExit(1)

# ---------------------------------------------------------
# Utilidades
# ---------------------------------------------------------

TEXT_EXT = {
    ".tsx", ".ts", ".jsx", ".js",
    ".css", ".html", ".json",
    ".mjs", ".cjs"
}

def read_file(path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def rel(path):
    try:
        return str(path.relative_to(ROOT))
    except Exception:
        return str(path)

files = [
    p for p in SRC.rglob("*")
    if p.is_file() and p.suffix in TEXT_EXT
]

files.sort()

contents = {p: read_file(p) for p in files}

# ---------------------------------------------------------
# Buscar imports CSS/TSX relevantes
# ---------------------------------------------------------

css_imports = defaultdict(list)

import_re = re.compile(
    r'import\s+(?:[^;]*?\s+from\s+)?["\']([^"\']+\.(?:css|scss|sass))["\']'
)

for path, text in contents.items():
    for match in import_re.finditer(text):
        css_imports[path].append(match.group(1))

# ---------------------------------------------------------
# Referencias a CommerceOSOverview
# ---------------------------------------------------------

commerce_refs = []

for path, text in contents.items():
    if "CommerceOSOverview" in text:
        commerce_refs.append(path)

# ---------------------------------------------------------
# Componentes que pueden renderizar Commerce OS
# ---------------------------------------------------------

component_candidates = []

for path, text in contents.items():
    if path.suffix not in {".tsx", ".jsx"}:
        continue

    patterns = [
        "Commerce OS",
        "CommerceOS",
        "commerce-os",
        "commerce_os",
        "dashboard",
        "control plane",
        "AI Store Operator",
    ]

    hits = [x for x in patterns if x.lower() in text.lower()]

    if hits:
        component_candidates.append((path, hits))

# ---------------------------------------------------------
# Render / navegación alrededor de referencias
# ---------------------------------------------------------

render_hits = []

render_patterns = [
    "currentScreen",
    "InternalWorkspace",
    "LandingPage",
    "CommerceOSOverview",
    "renderSection",
    "section ===",
    "section ==",
    "dashboard",
]

for path, text in contents.items():
    lines = text.splitlines()

    for i, line in enumerate(lines):
        if any(p.lower() in line.lower() for p in render_patterns):
            start = max(0, i - 3)
            end = min(len(lines), i + 5)

            render_hits.append(
                (
                    path,
                    i + 1,
                    lines[start:end]
                )
            )

# ---------------------------------------------------------
# CSS relevantes
# ---------------------------------------------------------

css_files = [
    p for p in files
    if p.suffix == ".css"
]

css_property_re = re.compile(
    r"""
    (?P<prop>
        background(?:-color|-image)?|
        color|
        border(?:-[a-z-]+)?|
        box-shadow|
        fill|
        stroke
    )
    \s*:\s*
    (?P<value>[^;{}]+)
    (?:;|$)
    """,
    re.IGNORECASE | re.VERBOSE
)

important_lines = []
commerce_css_hits = []

for path in css_files:
    text = contents[path]
    lines = text.splitlines()

    for i, line in enumerate(lines):
        low = line.lower()

        if "!important" in low:
            important_lines.append(
                (path, i + 1, line.strip())
            )

        if (
            "commerce" in low
            or "db-commerce" in low
            or "store-builder" in low
        ):
            commerce_css_hits.append(
                (path, i + 1, line.strip())
            )

# ---------------------------------------------------------
# Colores y fondos dentro de TSX/JSX
# ---------------------------------------------------------

jsx_style_hits = []

jsx_patterns = [
    r"bg-\[[^\]]+\]",
    r"text-\[[^\]]+\]",
    r"border-\[[^\]]+\]",
    r"from-\[[^\]]+\]",
    r"via-\[[^\]]+\]",
    r"to-\[[^\]]+\]",
    r"#[0-9a-fA-F]{3,8}",
    r"rgba?\([^)]+\)",
    r"hsla?\([^)]+\)",
]

for path, text in contents.items():
    if path.suffix not in {".tsx", ".jsx"}:
        continue

    for i, line in enumerate(text.splitlines()):
        if any(re.search(p, line) for p in jsx_patterns):
            jsx_style_hits.append(
                (path, i + 1, line.strip())
            )

# ---------------------------------------------------------
# Colores específicos conocidos del problema
# ---------------------------------------------------------

known_colors = [
    "#030817",
    "#040a18",
    "#071125",
    "#050b1b",
    "#071225",
    "#020714",
    "#071022",
    "#F5F7FB",
    "#FFFFFF",
    "#0A1020",
    "#101B32",
    "#14233F",
    "#183052",
    "#8B5CF6",
    "#3B82F6",
    "#22D3EE",
    "#EC4899",
]

known_color_hits = []

for path, text in contents.items():
    for i, line in enumerate(text.splitlines()):
        for color in known_colors:
            if color.lower() in line.lower():
                known_color_hits.append(
                    (path, i + 1, color, line.strip())
                )

# ---------------------------------------------------------
# Selectores potencialmente dominantes
# ---------------------------------------------------------

selector_blocks = []

selector_re = re.compile(
    r"(?P<selectors>[^{]+)\{(?P<body>[^{}]*)\}",
    re.DOTALL
)

for path in css_files:
    text = contents[path]

    for match in selector_re.finditer(text):
        selector = " ".join(match.group("selectors").split())
        body = match.group("body")

        if (
            "commerce" in selector.lower()
            or "db-commerce" in selector.lower()
            or "text-white" in selector.lower()
            or "bg-" in selector.lower()
            or "background" in body.lower()
            or "color:" in body.lower()
        ):
            selector_blocks.append(
                (path, selector, body.strip())
            )

# ---------------------------------------------------------
# index.html / root
# ---------------------------------------------------------

root_hits = []

for path in [ROOT / "index.html", ROOT / "src" / "index.css", ROOT / "src" / "main.tsx"]:
    if path.is_file():
        text = read_file(path)

        for i, line in enumerate(text.splitlines()):
            low = line.lower()

            if (
                "#root" in low
                or "body" in low
                or "background" in low
                or "color:" in low
                or "!important" in low
            ):
                root_hits.append(
                    (path, i + 1, line.strip())
                )

# ---------------------------------------------------------
# Tailwind/configuración
# ---------------------------------------------------------

config_hits = []

for name in [
    "tailwind.config.js",
    "tailwind.config.cjs",
    "tailwind.config.ts",
    "postcss.config.js",
    "postcss.config.cjs",
    "vite.config.ts",
    "vite.config.js",
]:
    path = ROOT / name

    if path.is_file():
        text = read_file(path)

        config_hits.append((path, text))

# ---------------------------------------------------------
# package
# ---------------------------------------------------------

package = ROOT / "package.json"

# ---------------------------------------------------------
# Git diff: comprobar exactamente qué cambió previamente
# ---------------------------------------------------------

git_status = ""
git_diff = ""

try:
    git_status = subprocess.run(
        ["git", "status", "--short"],
        cwd=ROOT,
        text=True,
        capture_output=True
    ).stdout

    git_diff = subprocess.run(
        ["git", "diff", "--", "src/CommerceOSOverview.tsx"],
        cwd=ROOT,
        text=True,
        capture_output=True
    ).stdout
except Exception:
    pass

# ---------------------------------------------------------
# Generar informe
# ---------------------------------------------------------

with OUT.open("w", encoding="utf-8") as f:

    f.write("============================================================\n")
    f.write(" DIGITALBOOST - COMMERCE OS DIAGNOSTIC\n")
    f.write("============================================================\n\n")

    f.write(f"ROOT: {ROOT}\n")
    f.write(f"SRC:  {SRC}\n")
    f.write(f"FILES SCANNED: {len(files)}\n\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("1. COMMERCEOSOVERVIEW REFERENCES\n")
    f.write("============================================================\n\n")

    if commerce_refs:
        for p in commerce_refs:
            f.write(f"- {rel(p)}\n")
    else:
        f.write("NO CommerceOSOverview references found.\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("2. COMPONENT CANDIDATES\n")
    f.write("============================================================\n\n")

    for p, hits in component_candidates:
        f.write(f"\n--- {rel(p)} ---\n")
        f.write("keywords: " + ", ".join(hits) + "\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("3. RENDER / NAVIGATION HITS\n")
    f.write("============================================================\n\n")

    for p, line_no, lines in render_hits:
        f.write(f"\n--- {rel(p)}:{line_no} ---\n")
        for j, line in enumerate(lines):
            f.write(f"{line}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("4. CSS IMPORT GRAPH\n")
    f.write("============================================================\n\n")

    for p, imports in css_imports.items():
        f.write(f"\n{rel(p)}\n")
        for imp in imports:
            f.write(f"  -> {imp}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("5. COMMERCE CSS REFERENCES\n")
    f.write("============================================================\n\n")

    for p, line_no, line in commerce_css_hits:
        f.write(f"{rel(p)}:{line_no}: {line}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("6. ALL !IMPORTANT CSS RULE LINES\n")
    f.write("============================================================\n\n")

    for p, line_no, line in important_lines:
        f.write(f"{rel(p)}:{line_no}: {line}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("7. JSX/TSX COLOR AND TAILWIND STYLE HITS\n")
    f.write("============================================================\n\n")

    for p, line_no, line in jsx_style_hits:
        f.write(f"{rel(p)}:{line_no}: {line}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("8. KNOWN COLOR HITS\n")
    f.write("============================================================\n\n")

    for p, line_no, color, line in known_color_hits:
        f.write(f"{rel(p)}:{line_no}: [{color}] {line}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("9. POTENTIALLY DOMINANT CSS SELECTOR BLOCKS\n")
    f.write("============================================================\n\n")

    for p, selector, body in selector_blocks:
        f.write(f"\n--- {rel(p)} ---\n")
        f.write(f"SELECTOR: {selector}\n")
        f.write(body + "\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("10. ROOT / BODY / INDEX.HTML RULES\n")
    f.write("============================================================\n\n")

    for p, line_no, line in root_hits:
        f.write(f"{rel(p)}:{line_no}: {line}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("11. CONFIGURATION FILES\n")
    f.write("============================================================\n\n")

    for p, text in config_hits:
        f.write(f"\n--- {rel(p)} ---\n")
        f.write(text + "\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("12. PACKAGE.JSON\n")
    f.write("============================================================\n\n")

    if package.is_file():
        f.write(read_file(package))
    else:
        f.write("package.json NOT FOUND\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("13. GIT STATUS\n")
    f.write("============================================================\n\n")

    f.write(git_status or "Git status unavailable / clean output.\n")

    f.write("\n============================================================\n")
    f.write("14. GIT DIFF CommerceOSOverview.tsx\n")
    f.write("============================================================\n\n")

    f.write(git_diff or "No git diff available for this file.\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("15. FILES CONTAINING 'visual-v2'\n")
    f.write("============================================================\n\n")

    for p, text in contents.items():
        if "visual-v2" in text:
            f.write(f"- {rel(p)}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("16. FILES CONTAINING 'vibrant'\n")
    f.write("============================================================\n\n")

    for p, text in contents.items():
        if "vibrant" in text.lower():
            f.write(f"- {rel(p)}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("17. FILES CONTAINING 'jewel'\n")
    f.write("============================================================\n\n")

    for p, text in contents.items():
        if "jewel" in text.lower():
            f.write(f"- {rel(p)}\n")

    # -----------------------------------------------------
    f.write("\n============================================================\n")
    f.write("18. FILES CONTAINING DIGITALBOOST PALETTE VARIABLES\n")
    f.write("============================================================\n\n")

    for p, text in contents.items():
        if (
            "--db-commerce-" in text
            or "db-commerce-violet" in text
            or "db-commerce-cyan" in text
        ):
            f.write(f"- {rel(p)}\n")

    f.write("\n============================================================\n")
    f.write(" END DIAGNOSTIC\n")
    f.write("============================================================\n")


# ---------------------------------------------------------
# Mostrar resumen y primeras secciones
# ---------------------------------------------------------

print()
print("============================================================")
print(" DIAGNOSTICO COMPLETADO")
print("============================================================")
print()
print(f"Informe: {OUT}")
print(f"Archivos inspeccionados: {len(files)}")
print(f"Referencias a CommerceOSOverview: {len(commerce_refs)}")
print(f"CSS encontrados: {len(css_files)}")
print(f"Reglas con !important: {len(important_lines)}")
print(f"Hits de colores conocidos: {len(known_color_hits)}")
print()

print("IMPORTANTE:")
print("Este diagnóstico NO modificó archivos del proyecto.")
print()

print("===== CommerceOSOverview =====")
for p in commerce_refs:
    print(" -", rel(p))

print()
print("===== CSS Commerce =====")
seen = set()
for p, line_no, line in commerce_css_hits:
    key = (p, line_no)
    if key not in seen:
        print(f" - {rel(p)}:{line_no}: {line[:180]}")
        seen.add(key)

print()
print("===== ROOT / BODY =====")
for p, line_no, line in root_hits:
    print(f" - {rel(p)}:{line_no}: {line}")

print()
print("===== INFORME COMPLETO =====")
print(OUT)
print()
