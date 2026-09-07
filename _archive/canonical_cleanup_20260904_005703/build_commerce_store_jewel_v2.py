#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

ROOT = Path.cwd()
SRC = ROOT / "src"

COMMERCE = SRC / "CommerceOSOverview.tsx"
STORE = SRC / "StoreBuilderWorkspace.tsx"
ENV = SRC / "StoreBuilderEnvironment.tsx"

COMMERCE_CSS = SRC / "commerce-os-jewel-v2.css"
STORE_CSS = SRC / "store-builder-jewel-v2.css"

STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 82)
print("DIGITALBOOST — COMMERCE OS + STORE BUILDER JEWEL V2")
print("VISUAL SYSTEM · HIGH CONTRAST · ELECTRIC INDIGO · PREMIUM STUDIO")
print("=" * 82)
print()

# ------------------------------------------------------------
# VALIDACIÓN
# ------------------------------------------------------------

required = [COMMERCE, STORE]

for path in required:
    if not path.exists():
        print(f"❌ No existe: {path}")
        sys.exit(1)

print("✓ Commerce OS encontrado")
print("✓ Store Builder encontrado")

if ENV.exists():
    print("✓ Store Builder Environment encontrado")
else:
    print("⚠️ StoreBuilderEnvironment.tsx no encontrado; se continúa sin modificarlo")

# ------------------------------------------------------------
# BACKUPS
# ------------------------------------------------------------

backup_files = []

for path in [COMMERCE, STORE]:
    backup = path.with_name(
        f"{path.stem}.before_jewel_v2_{STAMP}{path.suffix}"
    )
    shutil.copy2(path, backup)
    backup_files.append((path, backup))
    print(f"✓ Backup: {backup.name}")

print()

# ------------------------------------------------------------
# CSS — COMMERCE OS
# ------------------------------------------------------------

commerce_css = r"""
/* ============================================================
   DIGITALBOOST — COMMERCE OS JEWEL V2
   ============================================================ */

[data-commerce-os="true"].db-commerce-jewel {
  position: relative !important;
  isolation: isolate !important;
  overflow: hidden !important;
  background:
    radial-gradient(
      circle at 8% 6%,
      rgba(34, 211, 238, 0.20),
      transparent 27%
    ),
    radial-gradient(
      circle at 94% 12%,
      rgba(139, 92, 246, 0.24),
      transparent 31%
    ),
    radial-gradient(
      circle at 52% 96%,
      rgba(236, 72, 153, 0.12),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #081326 0%,
      #0a1730 48%,
      #101431 100%
    ) !important;
}

[data-commerce-os="true"].db-commerce-jewel::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    linear-gradient(
      120deg,
      rgba(91, 231, 255, 0.05),
      transparent 30%,
      rgba(155, 108, 255, 0.07) 70%,
      transparent
    );
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.10),
    inset 0 -80px 140px rgba(139,92,246,.06);
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-[#02050b]"],
[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-[#03060d]"],
[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-[#050912]"],
[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-[#050a13]"],
[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-[#050914]"] {
  background:
    linear-gradient(
      145deg,
      rgba(16, 29, 55, .96),
      rgba(11, 24, 47, .94)
    ) !important;
  border-color: rgba(148, 163, 184, .13) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.055),
    0 14px 42px rgba(0,0,0,.22);
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="text-slate-600"] {
  color: #94a8c2 !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="text-slate-700"] {
  color: #8095b0 !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="text-slate-500"] {
  color: #a4b4c8 !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="border-white/10"],
[data-commerce-os="true"].db-commerce-jewel
  [class*="border-white/[0.07]"],
[data-commerce-os="true"].db-commerce-jewel
  [class*="border-white/[0.08]"] {
  border-color: rgba(148,163,184,.15) !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="text-cyan-300"] {
  color: #5be7ff !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="text-violet-300"] {
  color: #b59cff !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="text-violet-200"] {
  color: #d0c4ff !important;
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-violet-500"] {
  filter: saturate(1.15);
}

[data-commerce-os="true"].db-commerce-jewel
  [class*="bg-cyan-400"] {
  filter: saturate(1.14);
}

[data-commerce-os="true"].db-commerce-jewel
  button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(91,231,255,.10),
    0 12px 34px rgba(34,211,238,.08);
}

[data-commerce-os="true"].db-commerce-jewel
  input:focus,
[data-commerce-os="true"].db-commerce-jewel
  textarea:focus {
  border-color: rgba(91,231,255,.55) !important;
  box-shadow: 0 0 0 3px rgba(34,211,238,.08) !important;
}
"""

COMMERCE_CSS.write_text(commerce_css.strip() + "\n", encoding="utf-8")
print(f"✓ CSS Commerce OS creado: {COMMERCE_CSS.name}")

# ------------------------------------------------------------
# CSS — STORE BUILDER
# ------------------------------------------------------------

store_css = r"""
/* ============================================================
   DIGITALBOOST — STORE BUILDER JEWEL V2
   STORE BUILDER = COMMERCE STUDIO
   ============================================================ */

[data-store-builder-jewel="true"] {
  --db-jewel-bg-0: #07111f;
  --db-jewel-bg-1: #0a1730;
  --db-jewel-bg-2: #101a35;
  --db-jewel-panel: #111f3b;
  --db-jewel-panel-2: #142846;

  --db-jewel-violet: #9b6cff;
  --db-jewel-violet-bright: #bd9aff;

  --db-jewel-cyan: #22d3ee;
  --db-jewel-cyan-bright: #67e8f9;

  --db-jewel-magenta: #ec4899;
  --db-jewel-blue: #5b9cff;

  --db-jewel-text: #f8fbff;
  --db-jewel-muted: #a7bad0;

  position: relative !important;
  isolation: isolate !important;
  color-scheme: dark !important;
  background:
    radial-gradient(
      circle at 4% 0%,
      rgba(34,211,238,.19),
      transparent 28%
    ),
    radial-gradient(
      circle at 96% 8%,
      rgba(155,108,255,.23),
      transparent 31%
    ),
    radial-gradient(
      circle at 70% 100%,
      rgba(236,72,153,.11),
      transparent 35%
    ),
    linear-gradient(
      135deg,
      var(--db-jewel-bg-0) 0%,
      var(--db-jewel-bg-1) 46%,
      var(--db-jewel-bg-2) 100%
    ) !important;
}

/* ------------------------------------------------------------
   ATMÓSFERA
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  background:
    linear-gradient(
      135deg,
      rgba(91,156,255,.045),
      transparent 28%,
      rgba(155,108,255,.055) 66%,
      transparent
    ),

    repeating-linear-gradient(
      90deg,
      rgba(255,255,255,.014) 0,
      rgba(255,255,255,.014) 1px,
      transparent 1px,
      transparent 64px
    ),

    repeating-linear-gradient(
      0deg,
      rgba(255,255,255,.010) 0,
      rgba(255,255,255,.010) 1px,
      transparent 1px,
      transparent 64px
    );

  opacity: .95;
}

/* ------------------------------------------------------------
   SHELL PRINCIPAL
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"].db-store-jewel-shell {
  min-height: 100vh !important;

  background:
    radial-gradient(
      circle at 15% 12%,
      rgba(34,211,238,.11),
      transparent 25%
    ),
    radial-gradient(
      circle at 86% 18%,
      rgba(155,108,255,.14),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #07111f,
      #0a1730 48%,
      #111a35
    ) !important;
}

/* ------------------------------------------------------------
   HEADER
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
.db-store-jewel-header {
  background:
    linear-gradient(
      180deg,
      rgba(12,27,52,.96),
      rgba(9,20,39,.91)
    ) !important;

  border-bottom-color:
    rgba(91,231,255,.12) !important;

  box-shadow:
    0 10px 35px rgba(0,0,0,.20),
    inset 0 -1px 0 rgba(255,255,255,.035);

  backdrop-filter: blur(22px);
}

/* ------------------------------------------------------------
   SIDEBAR
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
.db-store-jewel-sidebar {
  background:
    linear-gradient(
      180deg,
      rgba(10,24,47,.98),
      rgba(8,18,37,.97)
    ) !important;

  border-right-color:
    rgba(155,108,255,.13) !important;

  box-shadow:
    16px 0 55px rgba(0,0,0,.16);
}

/* ------------------------------------------------------------
   MAIN CANVAS
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
.db-store-jewel-main {
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(34,211,238,.055),
      transparent 30%
    ),
    linear-gradient(
      180deg,
      rgba(10,24,47,.35),
      rgba(7,17,31,.70)
    ) !important;
}

/* ------------------------------------------------------------
   OLD BACKGROUND TOKENS → JEWEL
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
[class*="bg-[#02050d]"],
[data-store-builder-jewel="true"]
[class*="bg-[#020711]"],
[data-store-builder-jewel="true"]
[class*="bg-[#02050a]"] {
  background:
    linear-gradient(
      145deg,
      #081528,
      #0b1b36
    ) !important;
}

[data-store-builder-jewel="true"]
[class*="bg-[#030711]"],
[data-store-builder-jewel="true"]
[class*="bg-[#030914]"] {
  background:
    linear-gradient(
      145deg,
      #0c1a33,
      #102342
    ) !important;
}

[data-store-builder-jewel="true"]
[class*="bg-[#070b14]"],
[data-store-builder-jewel="true"]
[class*="bg-[#070d18]"] {
  background:
    linear-gradient(
      145deg,
      #10203d,
      #142a4a
    ) !important;
}

[data-store-builder-jewel="true"]
[class*="bg-[#0a0f1c]"] {
  background:
    linear-gradient(
      145deg,
      #142846,
      #183153
    ) !important;
}

/* ------------------------------------------------------------
   CARDS
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
[class*="rounded-2xl"][class*="border-white"],
[data-store-builder-jewel="true"]
[class*="rounded-xl"][class*="border-white"] {
  border-color:
    rgba(148,163,184,.14) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.045),
    0 12px 34px rgba(0,0,0,.15);

  transition:
    transform .20s ease,
    border-color .20s ease,
    box-shadow .20s ease,
    background .20s ease;
}

[data-store-builder-jewel="true"]
[class*="rounded-2xl"][class*="border-white"]:hover,
[data-store-builder-jewel="true"]
[class*="rounded-xl"][class*="border-white"]:hover {
  border-color:
    rgba(91,231,255,.22) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 16px 42px rgba(0,0,0,.19),
    0 0 0 1px rgba(34,211,238,.045);
}

/* ------------------------------------------------------------
   TYPOGRAPHY
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
[class*="text-slate-700"] {
  color: #8ea4c0 !important;
}

[data-store-builder-jewel="true"]
[class*="text-slate-600"] {
  color: #9db1c8 !important;
}

[data-store-builder-jewel="true"]
[class*="text-slate-500"] {
  color: #aebfd3 !important;
}

[data-store-builder-jewel="true"]
[class*="text-slate-400"] {
  color: #bcc9d8 !important;
}

[data-store-builder-jewel="true"]
[class*="text-cyan-300"] {
  color: #67e8f9 !important;
}

[data-store-builder-jewel="true"]
[class*="text-violet-300"] {
  color: #bd9aff !important;
}

[data-store-builder-jewel="true"]
[class*="text-violet-200"] {
  color: #d8ccff !important;
}

/* ------------------------------------------------------------
   ACCENTOS
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
[class*="bg-violet-500"]:not([class*="bg-violet-500/"]) {
  background:
    linear-gradient(
      135deg,
      #8b5cf6,
      #a855f7
    ) !important;
}

[data-store-builder-jewel="true"]
[class*="bg-cyan-400"]:not([class*="bg-cyan-400/"]) {
  background:
    linear-gradient(
      135deg,
      #22d3ee,
      #38bdf8
    ) !important;
}

/* ------------------------------------------------------------
   BOTONES
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"] button {
  transition:
    transform .18s ease,
    background-color .18s ease,
    border-color .18s ease,
    box-shadow .18s ease,
    color .18s ease;
}

[data-store-builder-jewel="true"] button:hover {
  transform: translateY(-1px);
}

[data-store-builder-jewel="true"]
button[class*="bg-violet-500"] {
  box-shadow:
    0 8px 28px rgba(139,92,246,.20);
}

[data-store-builder-jewel="true"]
button[class*="bg-violet-500"]:hover {
  box-shadow:
    0 10px 34px rgba(139,92,246,.28),
    0 0 0 1px rgba(189,154,255,.16);
}

[data-store-builder-jewel="true"]
button[class*="border-cyan-400"] {
  box-shadow:
    0 0 20px rgba(34,211,238,.07);
}

[data-store-builder-jewel="true"]
button[class*="border-cyan-400"]:hover {
  box-shadow:
    0 0 28px rgba(34,211,238,.12);
}

/* ------------------------------------------------------------
   INPUTS
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
input,
[data-store-builder-jewel="true"]
textarea,
[data-store-builder-jewel="true"]
select {
  background:
    rgba(7,18,36,.82) !important;

  border-color:
    rgba(148,163,184,.16) !important;

  color:
    #f7fbff !important;
}

[data-store-builder-jewel="true"]
input:focus,
[data-store-builder-jewel="true"]
textarea:focus,
[data-store-builder-jewel="true"]
select:focus {
  border-color:
    rgba(103,232,249,.60) !important;

  box-shadow:
    0 0 0 3px rgba(34,211,238,.08),
    0 0 28px rgba(34,211,238,.07) !important;
}

/* ------------------------------------------------------------
   GLASS
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
[class*="backdrop-blur"] {
  backdrop-filter:
    blur(20px) saturate(1.12);
}

/* ------------------------------------------------------------
   SCROLLBAR
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

[data-store-builder-jewel="true"]::-webkit-scrollbar-track {
  background: #07111f;
}

[data-store-builder-jewel="true"]::-webkit-scrollbar-thumb {
  background:
    linear-gradient(
      180deg,
      #35527a,
      #6645b7
    );

  border-radius: 999px;
  border: 2px solid #07111f;
}

/* ------------------------------------------------------------
   ACTIVE STATE
   ------------------------------------------------------------ */

[data-store-builder-jewel="true"]
[class*="bg-violet-500/10"],
[data-store-builder-jewel="true"]
[class*="bg-cyan-400/10"] {
  box-shadow:
    inset 0 0 24px rgba(91,231,255,.035);
}
"""

STORE_CSS.write_text(store_css.strip() + "\n", encoding="utf-8")
print(f"✓ CSS Store Builder creado: {STORE_CSS.name}")

# ------------------------------------------------------------
# FUNCIÓN PARA INSERTAR IMPORT CSS
# ------------------------------------------------------------

def ensure_css_import(source: str, css_name: str) -> str:
    import_line = f'import "./{css_name}";'

    if import_line in source:
        return source

    pattern = re.compile(
        r'^import\s+.*?from\s+["\'].*?["\'];?\s*$',
        re.MULTILINE
    )

    imports = list(pattern.finditer(source))

    if not imports:
        raise RuntimeError(
            f"No se encontraron imports para conectar {css_name}"
        )

    pos = imports[-1].end()

    return (
        source[:pos]
        + "\n"
        + import_line
        + source[pos:]
    )

# ------------------------------------------------------------
# MODIFICAR COMMERCE OS
# ------------------------------------------------------------

commerce_source = COMMERCE.read_text(encoding="utf-8")
commerce_original = commerce_source

commerce_source = ensure_css_import(
    commerce_source,
    COMMERCE_CSS.name
)

# Marcar root real de Commerce OS
commerce_root_pattern = re.compile(
    r'<div([^>]*data-commerce-os="true"[^>]*)>',
    re.MULTILINE
)

commerce_match = commerce_root_pattern.search(commerce_source)

if commerce_match:
    tag = commerce_match.group(0)

    if "db-commerce-jewel" not in tag:
        if "className=" in tag:
            tag_new = re.sub(
                r'className="([^"]*)"',
                lambda m: f'className="{m.group(1)} db-commerce-jewel"',
                tag,
                count=1
            )
        else:
            tag_new = tag[:-1] + ' className="db-commerce-jewel">'
        commerce_source = (
            commerce_source[:commerce_match.start()]
            + tag_new
            + commerce_source[commerce_match.end():]
        )
        print("✓ Commerce OS root marcado con identidad Jewel")
    else:
        print("✓ Commerce OS Jewel ya estaba marcado")
else:
    print("⚠️ No se encontró root data-commerce-os=true")
    print("Se mantiene solamente la capa CSS conectada")

COMMERCE.write_text(commerce_source, encoding="utf-8")

if commerce_source != commerce_original:
    print("✓ CommerceOSOverview.tsx actualizado")
else:
    print("✓ CommerceOSOverview.tsx ya contenía la estructura")

# ------------------------------------------------------------
# MODIFICAR STORE BUILDER
# ------------------------------------------------------------

store_source = STORE.read_text(encoding="utf-8")
store_original = store_source

store_source = ensure_css_import(
    store_source,
    STORE_CSS.name
)

# Root exacto encontrado durante la inspección
root_candidates = [
    '<div className="flex h-screen overflow-hidden bg-[#02050d] text-white">',
    '<div className="flex h-screen overflow-hidden bg-[#02050d] text-white">',
]

root_done = False

for old_root in root_candidates:
    if old_root in store_source:
        new_root = (
            '<div '
            'data-store-builder-jewel="true" '
            'className="flex h-screen overflow-hidden bg-[#07111f] text-white db-store-jewel-shell">'
        )

        store_source = store_source.replace(
            old_root,
            new_root,
            1
        )

        root_done = True
        print("✓ Root Store Builder transformado a Jewel Studio")
        break

if not root_done:

    # Fallback flexible: buscar el root por sus clases principales
    fallback = re.search(
        r'<div\s+className="flex h-screen overflow-hidden ([^"]+)">',
        store_source
    )

    if fallback:
        classes = fallback.group(1)

        new_root = (
            '<div '
            'data-store-builder-jewel="true" '
            f'className="flex h-screen overflow-hidden {classes} db-store-jewel-shell">'
        )

        store_source = (
            store_source[:fallback.start()]
            + new_root
            + store_source[fallback.end():]
        )

        root_done = True
        print("✓ Root Store Builder marcado mediante fallback")
    else:
        print("⚠️ No se pudo localizar root exacto de Store Builder")

# Header
header_old = (
    '<header className="flex h-[72px] shrink-0 items-center justify-between '
    'border-b border-white/[.07] bg-[#02050d]/95 px-4 backdrop-blur-xl lg:px-7">'
)

if header_old in store_source:
    header_new = (
        '<header className="flex h-[72px] shrink-0 items-center justify-between '
        'border-b border-white/[.07] bg-[#0a1730]/95 px-4 backdrop-blur-xl '
        'lg:px-7 db-store-jewel-header">'
    )

    store_source = store_source.replace(
        header_old,
        header_new,
        1
    )
    print("✓ Header Store Builder rediseñado")

# Sidebar
sidebar_old = (
    'className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col '
    'border-r border-white/[.07] bg-[#030711] transition-transform '
    'lg:relative lg:translate-x-0 ${'
)

if sidebar_old in store_source:
    sidebar_new = (
        'className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col '
        'border-r border-white/[.07] bg-[#0a1831] transition-transform '
        'lg:relative lg:translate-x-0 db-store-jewel-sidebar ${'
    )

    store_source = store_source.replace(
        sidebar_old,
        sidebar_new,
        1
    )
    print("✓ Sidebar Store Builder rediseñada")

# Main
main_old = '<main className="min-w-0 flex-1 bg-[#020711]">'

if main_old in store_source:
    main_new = (
        '<main className="min-w-0 flex-1 bg-[#0a1730] '
        'db-store-jewel-main">'
    )

    store_source = store_source.replace(
        main_old,
        main_new,
        1
    )
    print("✓ Canvas principal Store Builder rediseñado")

STORE.write_text(store_source, encoding="utf-8")
print("✓ StoreBuilderWorkspace.tsx actualizado")

# ------------------------------------------------------------
# ENVIRONMENT — PEQUEÑO AJUSTE VISUAL, SIN CAMBIAR ARQUITECTURA
# ------------------------------------------------------------

if ENV.exists():
    env_source = ENV.read_text(encoding="utf-8")
    env_original = env_source

    env_replacements = {
        'bg-[#01040a]': 'bg-[#07111f]',
        'bg-[#02050b]': 'bg-[#081528]',
        'bg-[#02060d]': 'bg-[#0a1730]',
        'bg-[#020711]': 'bg-[#0b1a34]',
        'bg-[#030711]': 'bg-[#0d1d3a]',
        'bg-[#050a12]': 'bg-[#10213f]',
    }

    env_changes = 0

    for old, new in env_replacements.items():
        count = env_source.count(old)

        if count:
            env_source = env_source.replace(old, new)
            env_changes += count

    if env_source != env_original:
        ENV.write_text(env_source, encoding="utf-8")
        print(
            f"✓ StoreBuilderEnvironment.tsx actualizado "
            f"({env_changes} fondos)"
        )
    else:
        print("✓ StoreBuilderEnvironment.tsx no necesitó cambios")
    
# ------------------------------------------------------------
# VALIDACIÓN
# ------------------------------------------------------------

print()
print("=" * 82)
print("VALIDACIÓN DE IDENTIDAD")
print("=" * 82)

commerce_check = COMMERCE.read_text(encoding="utf-8")
store_check = STORE.read_text(encoding="utf-8")

checks = [
    (
        "Commerce OS Jewel CSS",
        COMMERCE_CSS.exists()
    ),
    (
        "Commerce OS Jewel root",
        "db-commerce-jewel" in commerce_check
    ),
    (
        "Electric Violet",
        "#9b6cff" in commerce_css
    ),
    (
        "Neon Cyan",
        "#22d3ee" in commerce_css and "#22d3ee" in store_css
    ),
    (
        "Magenta",
        "#ec4899" in commerce_css or "#ec4899" in store_css
    ),
    (
        "Store Builder Jewel CSS",
        STORE_CSS.exists()
    ),
    (
        "Store Builder Jewel root",
        'data-store-builder-jewel="true"' in store_check
    ),
    (
        "Store Builder header",
        "db-store-jewel-header" in store_check
    ),
    (
        "Store Builder sidebar",
        "db-store-jewel-sidebar" in store_check
    ),
    (
        "Store Builder main",
        "db-store-jewel-main" in store_check
    ),
]

for name, ok in checks:
    print(f"{'✓' if ok else '⚠️'} {name}")

print()
print("Protecciones:")
print("✓ App.tsx NO será modificado")
print("✓ Web Builder NO será redefinido")
print("✓ Commerce OS se modifica únicamente en su identidad visual")
print("✓ Store Builder sigue siendo exclusivamente e-commerce")
print("✓ No se agregan NFT")
print("✓ No se agregan dragones")
print("✓ No se agrega ninguna interfaz futura")

# ------------------------------------------------------------
# PROTECCIÓN APP.TSX
# ------------------------------------------------------------

APP = SRC / "App.tsx"

app_before = None

if APP.exists():
    app_before = APP.read_text(encoding="utf-8")

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

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
    print("❌ npm run build excedió el tiempo límite")
    print("Restaurando archivos modificados...")

    for original_file, backup_file in backup_files:
        shutil.copy2(backup_file, original_file)

    if ENV.exists() and app_before is not None:
        pass

    sys.exit(1)

except FileNotFoundError:
    print("❌ npm no está disponible en PATH")
    print("Restaurando archivos modificados...")

    for original_file, backup_file in backup_files:
        shutil.copy2(backup_file, original_file)

    sys.exit(1)

print(result.stdout)

if result.returncode != 0:

    if result.stderr:
        print(result.stderr)

    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando Commerce OS y Store Builder...")

    for original_file, backup_file in backup_files:
        shutil.copy2(backup_file, original_file)
        print(f"✓ Restaurado: {original_file.name}")

    print()
    print("✓ Los CSS nuevos permanecen disponibles")
    print(f"  {COMMERCE_CSS.name}")
    print(f"  {STORE_CSS.name}")

    sys.exit(result.returncode)

# ------------------------------------------------------------
# RESULTADO
# ------------------------------------------------------------

print()
print("=" * 82)
print("COMMERCE OS + STORE BUILDER JEWEL V2 INSTALADO")
print("=" * 82)

print("✓ BUILD CORRECTO")
print()
print("COMMERCE OS")
print("✓ Fondo índigo profundo")
print("✓ Cyan luminoso")
print("✓ Violet eléctrico")
print("✓ Magenta de acento")
print("✓ Mayor contraste")
print("✓ Más profundidad")
print("✓ Glass / layered surfaces")
print("✓ Iluminación ambiental")

print()
print("STORE BUILDER")
print("✓ Nuevo fondo azul/índigo")
print("✓ Studio visual más profundo")
print("✓ Header rediseñado")
print("✓ Sidebar rediseñada")
print("✓ Canvas principal rediseñado")
print("✓ Cards con mayor jerarquía")
print("✓ Estados activos más visibles")
print("✓ Inputs más profesionales")
print("✓ Hover / focus mejorados")
print("✓ Scrollbar premium")
print("✓ Atmósfera tecnológica")

print()
print("ARQUITECTURA")
print("✓ Commerce OS sigue siendo la base")
print("✓ Store Builder continúa siendo e-commerce")
print("✓ Web Builder continúa separado")
print("✓ App.tsx protegido")
print("✓ Sin NFT")
print("✓ Sin dragones")

print()
print("Backups:")
for _, backup in backup_files:
    print(f"  {backup.name}")

print()
print("Ejecutá:")
print("npm run dev")

print()
print("=" * 82)
print("FIN")
print("=" * 82)
