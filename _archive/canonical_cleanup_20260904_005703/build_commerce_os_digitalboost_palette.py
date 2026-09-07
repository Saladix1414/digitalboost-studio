#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"
COMMERCE = SRC / "CommerceOSOverview.tsx"

STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 78)
print("DIGITALBOOST — COMMERCE OS DIGITALBOOST PALETTE")
print("NUEVA IDENTIDAD CROMÁTICA · PREMIUM DARK · ELECTRIC SYSTEM")
print("=" * 78)
print()

# ============================================================
# VALIDACIÓN
# ============================================================

if not COMMERCE.exists():
    print("❌ No existe:")
    print(COMMERCE)
    sys.exit(1)

print("✓ CommerceOSOverview.tsx encontrado")

# ============================================================
# BACKUP
# ============================================================

backup = COMMERCE.with_name(
    f"{COMMERCE.stem}.before_digitalboost_palette_{STAMP}{COMMERCE.suffix}"
)

shutil.copy2(COMMERCE, backup)

print(f"✓ Backup creado: {backup.name}")

# ============================================================
# PALETA DIGITALBOOST
# ============================================================

# La intención no es volver todo violeta.
# Cada color tiene una función concreta dentro del sistema.

replacements = {

    # --------------------------------------------------------
    # FONDOS PRINCIPALES
    # --------------------------------------------------------

    "#02050b": "#0A1020",
    "#03060d": "#0C1427",
    "#040811": "#0D172B",
    "#050912": "#101B32",
    "#050914": "#101D36",
    "#050a13": "#111F3A",
    "#02050a": "#0A1224",
    "#070b14": "#14233F",
    "#07121d": "#112844",
    "#070916": "#151F3D",
    "#0a0714": "#191934",
    "#11091d": "#21152F",
    "#07101a": "#13243D",

    # --------------------------------------------------------
    # FONDOS SECUNDARIOS / PREVIEW
    # --------------------------------------------------------

    "#041019": "#10243A",
    "#0a1020": "#111F3A",
    "#070c15": "#0F1A30",
    "#06111d": "#122944",

    # --------------------------------------------------------
    # COLORES DE IDENTIDAD
    # --------------------------------------------------------

    "#7c3aed": "#8B5CF6",
    "#8c48ff": "#925BFF",
    "#9b5cff": "#A36BFF",

    "#22d3ee": "#22D3EE",
    "#25e7ff": "#2DE4FF",

    "#3b82f6": "#3B82F6",
    "#4c8dff": "#5A96FF",

    "#ec4899": "#EC4899",
    "#ff4fd8": "#F05BCB",

    # --------------------------------------------------------
    # TEXTOS DEMASIADO APAGADOS
    # --------------------------------------------------------

    "#475569": "#6B7C96",
    "#64748b": "#7E90AA",
    "#6b7280": "#7E90AA",
    "#94a3b8": "#AFC0D5",
    "#cbd5e1": "#D7E2F0",

    # --------------------------------------------------------
    # BLANCOS / CONTRASTE
    # --------------------------------------------------------

    "#f8fafc": "#F7FAFF",
    "#f1f5f9": "#F4F8FF",
}

source = COMMERCE.read_text(encoding="utf-8")

changed = 0

for old, new in replacements.items():
    count = source.count(old)

    if count:
        source = source.replace(old, new)
        changed += count
        print(f"✓ {old} → {new}   ({count})")

# ============================================================
# GRADIENTES PRINCIPALES
# ============================================================

gradient_replacements = {

    "from-cyan-400 via-blue-500 to-violet-500":
        "from-cyan-300 via-blue-500 to-violet-500",

    "from-violet-500 to-cyan-400":
        "from-violet-500 via-blue-500 to-cyan-400",

    "from-violet-500 to-cyan-300":
        "from-violet-500 via-blue-500 to-cyan-300",

    "from-cyan-400/20 to-violet-500/20":
        "from-cyan-400/25 to-violet-500/25",

    "from-violet-500/[0.07] to-cyan-500/[0.04]":
        "from-violet-500/[0.10] to-cyan-500/[0.07]",

    "from-cyan-400/[0.035] to-transparent":
        "from-cyan-400/[0.07] to-transparent",
}

print()
print("===== GRADIENTES =====")

for old, new in gradient_replacements.items():
    count = source.count(old)

    if count:
        source = source.replace(old, new)
        changed += count
        print(f"✓ Gradiente actualizado ({count})")

# ============================================================
# ATMÓSFERA AMBIENTAL
# ============================================================

ambient_replacements = {

    "rgba(0,220,255,.10)":
        "rgba(45,228,255,.16)",

    "rgba(34,211,238,.08)":
        "rgba(45,228,255,.13)",

    "rgba(34,211,238,.035)":
        "rgba(45,228,255,.07)",

    "rgba(139,92,246,.12)":
        "rgba(163,107,255,.17)",

    "rgba(139,92,246,.09)":
        "rgba(163,107,255,.13)",

    "rgba(139,92,246,.08)":
        "rgba(163,107,255,.12)",
}

print()
print("===== ILUMINACIÓN AMBIENTAL =====")

for old, new in ambient_replacements.items():
    count = source.count(old)

    if count:
        source = source.replace(old, new)
        changed += count
        print(f"✓ {old} → {new} ({count})")

# ============================================================
# SUPERFICIES MÁS VISIBLES
# ============================================================

surface_replacements = {

    "bg-white/[0.02]":
        "bg-white/[0.035]",

    "bg-white/[0.025]":
        "bg-white/[0.045]",

    "bg-white/[0.03]":
        "bg-white/[0.045]",

    "bg-white/[0.04]":
        "bg-white/[0.055]",

    "bg-white/[0.06]":
        "bg-white/[0.075]",

    "bg-white/5":
        "bg-white/[0.075]",

    "border-white/[0.05]":
        "border-white/[0.09]",

    "border-white/[0.06]":
        "border-white/[0.10]",

    "border-white/[0.07]":
        "border-white/[0.11]",

    "border-white/[0.08]":
        "border-white/[0.13]",

    "border-white/10":
        "border-white/[0.14]",
}

print()
print("===== SUPERFICIES =====")

for old, new in surface_replacements.items():
    count = source.count(old)

    if count:
        source = source.replace(old, new)
        changed += count
        print(f"✓ {old} → {new} ({count})")

# ============================================================
# ACENTOS ACTIVOS
# ============================================================

accent_replacements = {

    "bg-cyan-400/[0.04]":
        "bg-cyan-400/[0.075]",

    "bg-cyan-400/[0.06]":
        "bg-cyan-400/[0.10]",

    "bg-cyan-400/[0.07]":
        "bg-cyan-400/[0.11]",

    "bg-violet-400/[0.06]":
        "bg-violet-400/[0.09]",

    "bg-violet-500/10":
        "bg-violet-500/[0.14]",

    "bg-violet-500/5":
        "bg-violet-500/[0.08]",

    "bg-emerald-400/[0.06]":
        "bg-emerald-400/[0.10]",
}

print()
print("===== ACENTOS =====")

for old, new in accent_replacements.items():
    count = source.count(old)

    if count:
        source = source.replace(old, new)
        changed += count
        print(f"✓ {old} → {new} ({count})")

# ============================================================
# ESCRITURA
# ============================================================

COMMERCE.write_text(
    source,
    encoding="utf-8"
)

print()
print(f"✓ CommerceOSOverview.tsx actualizado")
print(f"✓ Cambios visuales realizados: {changed}")

# ============================================================
# CREAR TOKEN CSS DE REFERENCIA
# ============================================================

CSS = SRC / "commerce-os-digitalboost-palette.css"

css = r"""
/*
============================================================
DIGITALBOOST — COMMERCE OS
PALETA OFICIAL DE ESTA ITERACIÓN
============================================================
*/

:root {

  /* BASE */
  --db-commerce-bg: #0A1020;
  --db-commerce-surface: #101B32;
  --db-commerce-surface-2: #14233F;
  --db-commerce-surface-3: #183052;

  /* PRIMARY */
  --db-commerce-violet: #8B5CF6;
  --db-commerce-violet-bright: #A36BFF;

  /* SECONDARY */
  --db-commerce-blue: #3B82F6;
  --db-commerce-blue-bright: #5A96FF;

  /* TECHNOLOGY */
  --db-commerce-cyan: #22D3EE;
  --db-commerce-cyan-bright: #2DE4FF;

  /* ACCENT */
  --db-commerce-magenta: #EC4899;

  /* TEXT */
  --db-commerce-text: #F7FAFF;
  --db-commerce-text-secondary: #D7E2F0;
  --db-commerce-muted: #AFC0D5;
  --db-commerce-muted-2: #7E90AA;
}
"""

CSS.write_text(
    css.strip() + "\n",
    encoding="utf-8"
)

print("✓ Token de referencia creado:")
print(f"  {CSS.name}")

# ============================================================
# VALIDACIÓN
# ============================================================

print()
print("=" * 78)
print("VALIDACIÓN")
print("=" * 78)

final_source = COMMERCE.read_text(encoding="utf-8")

checks = [
    ("Commerce OS root", 'data-commerce-os="true"' in final_source),
    ("Midnight Navy", "#0A1020" in final_source),
    ("Electric Violet", "#8B5CF6" in final_source),
    ("Digital Blue", "#3B82F6" in final_source),
    ("Neon Cyan", "#22D3EE" in final_source),
    ("Magenta accent", "#EC4899" in final_source),
    ("High contrast text", "#F7FAFF" in final_source),
    ("Palette CSS", CSS.exists()),
]

for name, ok in checks:
    print(f"{'✓' if ok else '⚠️'} {name}")

# ============================================================
# PROTECCIONES
# ============================================================

print()
print("=" * 78)
print("PROTECCIONES")
print("=" * 78)

print("✓ StoreBuilderWorkspace.tsx NO modificado")
print("✓ StoreBuilderEnvironment.tsx NO modificado")
print("✓ StoreBuilderStudioShell.tsx NO modificado")
print("✓ WebsiteBuilderV1.tsx NO modificado")
print("✓ App.tsx NO modificado")
print("✓ No se cambia ninguna funcionalidad")
print("✓ No se agrega NFT")
print("✓ No se agregan dragones")

# ============================================================
# BUILD
# ============================================================

print()
print("=" * 78)
print("BUILD DE VERIFICACIÓN")
print("=" * 78)

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
    print("Restaurando Commerce OS...")

    shutil.copy2(backup, COMMERCE)

    if CSS.exists():
        CSS.unlink()

    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible")
    print("Restaurando Commerce OS...")

    shutil.copy2(backup, COMMERCE)

    if CSS.exists():
        CSS.unlink()

    sys.exit(1)

print(result.stdout)

if result.returncode != 0:

    print(result.stderr)

    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando Commerce OS...")

    shutil.copy2(
        backup,
        COMMERCE
    )

    if CSS.exists():
        CSS.unlink()

    print("✓ CommerceOSOverview.tsx restaurado")
    sys.exit(result.returncode)

# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 78)
print("COMMERCE OS — DIGITALBOOST PALETTE INSTALADA")
print("=" * 78)

print()
print("✓ Midnight Navy")
print("✓ Electric Violet")
print("✓ Digital Blue")
print("✓ Neon Cyan")
print("✓ Magenta como acento")
print("✓ Fondos menos negros")
print("✓ Superficies más visibles")
print("✓ Contraste mejorado")
print("✓ Gradientes más vivos")
print("✓ Iluminación ambiental reforzada")
print("✓ Identidad DigitalBoost más consistente")

print()
print("IMPORTANTE:")
print("Store Builder NO fue modificado.")
print("Web Builder NO fue modificado.")
print("NFT / dragones NO fueron agregados.")

print()
print(f"Backup: {backup.name}")
print(f"Tokens: {CSS.name}")

print()
print("Ejecutá:")
print("npm run dev")

print("=" * 78)
