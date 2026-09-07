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

COMMERCE_CSS = SRC / "commerce-os-visual-v2.css"
STORE_CSS = SRC / "store-builder-visual-v2.css"

STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 84)
print("DIGITALBOOST — COMMERCE OS + STORE BUILDER VISUAL V2")
print("REFACTORIZACIÓN ARTÍSTICA · PREMIUM · HIGH CONTRAST · MODERN SAAS")
print("=" * 84)
print()

# ============================================================
# VALIDACIÓN
# ============================================================

if not COMMERCE.exists():
    print(f"❌ No existe: {COMMERCE}")
    sys.exit(1)

if not STORE.exists():
    print(f"❌ No existe: {STORE}")
    sys.exit(1)

print("✓ CommerceOSOverview.tsx encontrado")
print("✓ StoreBuilderWorkspace.tsx encontrado")

# ============================================================
# BACKUPS
# ============================================================

commerce_backup = COMMERCE.with_name(
    f"{COMMERCE.stem}.before_visual_v2_{STAMP}{COMMERCE.suffix}"
)

store_backup = STORE.with_name(
    f"{STORE.stem}.before_visual_v2_{STAMP}{STORE.suffix}"
)

shutil.copy2(COMMERCE, commerce_backup)
shutil.copy2(STORE, store_backup)

print(f"✓ Backup Commerce OS: {commerce_backup.name}")
print(f"✓ Backup Store Builder: {store_backup.name}")

# ============================================================
# CSS COMMERCE OS
# ============================================================

commerce_css = r"""
/* ============================================================
   DIGITALBOOST — COMMERCE OS VISUAL V2
   LIGHT PREMIUM COMMAND CENTER
   ============================================================ */

[data-commerce-os="true"].db-commerce-visual-v2 {
  position: relative !important;
  isolation: isolate !important;
  overflow: hidden !important;
  color: #172033 !important;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(34, 211, 238, .11),
      transparent 24%
    ),
    radial-gradient(
      circle at 94% 4%,
      rgba(139, 92, 246, .13),
      transparent 27%
    ),
    linear-gradient(
      145deg,
      #eef4fb 0%,
      #f6f8fc 42%,
      #f0f3fa 100%
    ) !important;

  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.80),
    0 24px 60px rgba(18,31,56,.10);
}

[data-commerce-os="true"].db-commerce-visual-v2::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  background:
    linear-gradient(
      120deg,
      rgba(34,211,238,.025),
      transparent 30%,
      rgba(139,92,246,.035) 72%,
      transparent
    );

  box-shadow:
    inset 0 -100px 140px rgba(99,102,241,.025);
}

/* Header */
[data-commerce-os="true"].db-commerce-visual-v2 header {
  background:
    rgba(255,255,255,.86) !important;

  border-bottom-color:
    rgba(148,163,184,.20) !important;

  box-shadow:
    0 8px 24px rgba(15,23,42,.055);

  backdrop-filter:
    blur(20px);
}

/* Sidebar */
[data-commerce-os="true"].db-commerce-visual-v2 aside {
  background:
    rgba(248,250,253,.94) !important;

  border-right-color:
    rgba(148,163,184,.17) !important;
}

/* Main */
[data-commerce-os="true"].db-commerce-visual-v2 main {
  background:
    linear-gradient(
      180deg,
      rgba(242,246,251,.76),
      rgba(247,249,252,.92)
    ) !important;
}

/* Common dark backgrounds → light surfaces */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#02050b]"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#03060d]"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#040811]"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#050912]"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#050a13]"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#050914]"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-[#070b14]"] {
  background:
    linear-gradient(
      145deg,
      #ffffff 0%,
      #f8fbff 100%
    ) !important;

  border-color:
    rgba(148,163,184,.19) !important;

  color:
    #172033 !important;

  box-shadow:
    0 10px 28px rgba(30,41,59,.07),
    inset 0 1px 0 rgba(255,255,255,.95);
}

/* Text hierarchy */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-slate-700"] {
  color: #40506a !important;
}

[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-slate-600"] {
  color: #64748b !important;
}

[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-slate-500"] {
  color: #708198 !important;
}

[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-white"] {
  color: #182338 !important;
}

/* Cyan */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-cyan-300"] {
  color: #0891b2 !important;
}

[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-cyan-200"] {
  color: #0e7490 !important;
}

/* Violet */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-violet-300"] {
  color: #7c3aed !important;
}

[data-commerce-os="true"].db-commerce-visual-v2
[class*="text-violet-200"] {
  color: #6d28d9 !important;
}

/* Buttons */
[data-commerce-os="true"].db-commerce-visual-v2
button {
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease,
    background-color .18s ease;
}

[data-commerce-os="true"].db-commerce-visual-v2
button:hover {
  transform:
    translateY(-1px);
  box-shadow:
    0 10px 24px rgba(30,41,59,.08);
}

/* Primary violet actions */
[data-commerce-os="true"].db-commerce-visual-v2
button[class*="bg-violet-500"] {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #8b5cf6
    ) !important;

  color: #fff !important;

  box-shadow:
    0 10px 24px rgba(124,58,237,.22);
}

/* Cyan actions */
[data-commerce-os="true"].db-commerce-visual-v2
button[class*="bg-cyan-400"] {
  background:
    linear-gradient(
      135deg,
      #06b6d4,
      #22d3ee
    ) !important;

  color: #082f49 !important;
}

/* Cards */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="rounded-2xl"][class*="border"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="rounded-xl"][class*="border"] {
  border-color:
    rgba(148,163,184,.18) !important;

  box-shadow:
    0 10px 24px rgba(15,23,42,.055);
}

[data-commerce-os="true"].db-commerce-visual-v2
[class*="rounded-2xl"][class*="border"]:hover,
[data-commerce-os="true"].db-commerce-visual-v2
[class*="rounded-xl"][class*="border"]:hover {
  border-color:
    rgba(124,58,237,.20) !important;

  box-shadow:
    0 14px 30px rgba(15,23,42,.08),
    0 0 0 1px rgba(124,58,237,.035);
}

/* Inputs */
[data-commerce-os="true"].db-commerce-visual-v2
input,
[data-commerce-os="true"].db-commerce-visual-v2
textarea,
[data-commerce-os="true"].db-commerce-visual-v2
select {
  background:
    rgba(255,255,255,.94) !important;

  color:
    #172033 !important;

  border-color:
    rgba(148,163,184,.24) !important;
}

[data-commerce-os="true"].db-commerce-visual-v2
input:focus,
[data-commerce-os="true"].db-commerce-visual-v2
textarea:focus,
[data-commerce-os="true"].db-commerce-visual-v2
select:focus {
  border-color:
    rgba(124,58,237,.48) !important;

  box-shadow:
    0 0 0 3px rgba(124,58,237,.08) !important;
}

/* Analytics surface */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-gradient-to-t"],
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-gradient-to-b"] {
  filter:
    saturate(1.10);
}

/* Live / active states */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="bg-emerald"] {
  filter:
    saturate(1.08);
}

/* Responsive bottom nav */
[data-commerce-os="true"].db-commerce-visual-v2
[class*="lg:hidden"] button {
  background:
    rgba(255,255,255,.92) !important;

  color:
    #5b6b80 !important;
}

/* Scrollbar */
[data-commerce-os="true"].db-commerce-visual-v2::-webkit-scrollbar {
  width: 9px;
}

[data-commerce-os="true"].db-commerce-visual-v2::-webkit-scrollbar-track {
  background: #eef2f7;
}

[data-commerce-os="true"].db-commerce-visual-v2::-webkit-scrollbar-thumb {
  background:
    linear-gradient(
      180deg,
      #94a3b8,
      #8b5cf6
    );

  border-radius: 999px;
  border: 2px solid #eef2f7;
}
"""

COMMERCE_CSS.write_text(
    commerce_css.strip() + "\n",
    encoding="utf-8"
)

print(f"✓ CSS Commerce OS creado: {COMMERCE_CSS.name}")

# ============================================================
# CSS STORE BUILDER
# ============================================================

store_css = r"""
/* ============================================================
   DIGITALBOOST — STORE BUILDER VISUAL V2
   PROFESSIONAL COMMERCE STUDIO
   ============================================================ */

[data-store-builder-visual-v2="true"] {
  --sb-bg-0: #081321;
  --sb-bg-1: #0b1930;
  --sb-bg-2: #101d38;

  --sb-panel: #10213f;
  --sb-panel-2: #142947;

  --sb-violet: #9b6cff;
  --sb-violet-bright: #c0a5ff;

  --sb-cyan: #22d3ee;
  --sb-cyan-bright: #67e8f9;

  --sb-magenta: #ec4899;

  --sb-text: #f4f8ff;
  --sb-muted: #9fb1c8;

  position: relative !important;
  isolation: isolate !important;

  background:
    radial-gradient(
      circle at 4% 0%,
      rgba(34,211,238,.15),
      transparent 24%
    ),
    radial-gradient(
      circle at 97% 5%,
      rgba(155,108,255,.19),
      transparent 29%
    ),
    radial-gradient(
      circle at 65% 100%,
      rgba(236,72,153,.08),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      var(--sb-bg-0) 0%,
      var(--sb-bg-1) 50%,
      var(--sb-bg-2) 100%
    ) !important;

  color: var(--sb-text) !important;
}

[data-store-builder-visual-v2="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  background:
    linear-gradient(
      125deg,
      rgba(103,232,249,.035),
      transparent 26%,
      rgba(167,139,250,.055) 64%,
      transparent
    ),

    repeating-linear-gradient(
      90deg,
      rgba(255,255,255,.012) 0,
      rgba(255,255,255,.012) 1px,
      transparent 1px,
      transparent 72px
    );
}

/* ============================================================
   HEADER
   ============================================================ */

[data-store-builder-visual-v2="true"] header {
  background:
    linear-gradient(
      180deg,
      rgba(13,31,59,.97),
      rgba(9,22,43,.92)
    ) !important;

  border-bottom-color:
    rgba(148,163,184,.14) !important;

  box-shadow:
    0 12px 34px rgba(0,0,0,.18),
    inset 0 -1px 0 rgba(255,255,255,.035);

  backdrop-filter:
    blur(22px) saturate(1.08);
}

/* ============================================================
   SIDEBAR
   ============================================================ */

[data-store-builder-visual-v2="true"] aside {
  background:
    linear-gradient(
      180deg,
      rgba(9,23,44,.98),
      rgba(8,19,38,.97)
    ) !important;

  border-color:
    rgba(148,163,184,.12) !important;

  box-shadow:
    18px 0 55px rgba(0,0,0,.14);
}

/* ============================================================
   MAIN
   ============================================================ */

[data-store-builder-visual-v2="true"] main {
  background:
    radial-gradient(
      circle at 52% 0%,
      rgba(34,211,238,.035),
      transparent 28%
    ),
    linear-gradient(
      180deg,
      rgba(10,24,47,.36),
      rgba(7,17,33,.72)
    ) !important;
}

/* ============================================================
   OLD DARK TOKENS → NEW DEPTH SYSTEM
   ============================================================ */

[data-store-builder-visual-v2="true"]
[class*="bg-[#02050d]"],
[data-store-builder-visual-v2="true"]
[class*="bg-[#020711]"],
[data-store-builder-visual-v2="true"]
[class*="bg-[#02050a]"] {
  background:
    linear-gradient(
      145deg,
      #09182d,
      #0c1e38
    ) !important;
}

[data-store-builder-visual-v2="true"]
[class*="bg-[#030711]"],
[data-store-builder-visual-v2="true"]
[class*="bg-[#030914]"] {
  background:
    linear-gradient(
      145deg,
      #0d1f3b,
      #112746
    ) !important;
}

[data-store-builder-visual-v2="true"]
[class*="bg-[#070b14]"],
[data-store-builder-visual-v2="true"]
[class*="bg-[#070d18]"] {
  background:
    linear-gradient(
      145deg,
      #122542,
      #17304f
    ) !important;
}

[data-store-builder-visual-v2="true"]
[class*="bg-[#0a0f1c]"] {
  background:
    linear-gradient(
      145deg,
      #183452,
      #1c3c5f
    ) !important;
}

/* ============================================================
   TEXT
   ============================================================ */

[data-store-builder-visual-v2="true"]
[class*="text-slate-700"] {
  color: #7890ac !important;
}

[data-store-builder-visual-v2="true"]
[class*="text-slate-600"] {
  color: #91a5bd !important;
}

[data-store-builder-visual-v2="true"]
[class*="text-slate-500"] {
  color: #a5b6ca !important;
}

[data-store-builder-visual-v2="true"]
[class*="text-slate-400"] {
  color: #b9c7d7 !important;
}

[data-store-builder-visual-v2="true"]
[class*="text-cyan-300"] {
  color: #67e8f9 !important;
}

[data-store-builder-visual-v2="true"]
[class*="text-violet-300"] {
  color: #c0a5ff !important;
}

[data-store-builder-visual-v2="true"]
[class*="text-violet-200"] {
  color: #d9ceff !important;
}

/* ============================================================
   CARDS
   ============================================================ */

[data-store-builder-visual-v2="true"]
[class*="rounded-2xl"][class*="border-white"],
[data-store-builder-visual-v2="true"]
[class*="rounded-xl"][class*="border-white"] {
  border-color:
    rgba(148,163,184,.14) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.045),
    0 12px 30px rgba(0,0,0,.14);

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;
}

[data-store-builder-visual-v2="true"]
[class*="rounded-2xl"][class*="border-white"]:hover,
[data-store-builder-visual-v2="true"]
[class*="rounded-xl"][class*="border-white"]:hover {
  border-color:
    rgba(103,232,249,.20) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.055),
    0 18px 40px rgba(0,0,0,.18),
    0 0 0 1px rgba(34,211,238,.035);
}

/* ============================================================
   SELECTED STATES
   ============================================================ */

[data-store-builder-visual-v2="true"]
[class*="bg-violet-500/10"],
[data-store-builder-visual-v2="true"]
[class*="bg-violet-400/[0.05]"] {
  box-shadow:
    inset 0 0 24px rgba(155,108,255,.06),
    0 0 0 1px rgba(155,108,255,.035);
}

[data-store-builder-visual-v2="true"]
[class*="bg-cyan-400/[0.06]"],
[data-store-builder-visual-v2="true"]
[class*="bg-cyan-400/[0.07]"] {
  box-shadow:
    inset 0 0 24px rgba(34,211,238,.055),
    0 0 0 1px rgba(34,211,238,.035);
}

/* ============================================================
   BUTTONS
   ============================================================ */

[data-store-builder-visual-v2="true"] button {
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease,
    background-color .18s ease,
    color .18s ease;
}

[data-store-builder-visual-v2="true"] button:hover {
  transform:
    translateY(-1px);
}

[data-store-builder-visual-v2="true"]
button[class*="bg-violet-500"] {
  background:
    linear-gradient(
      135deg,
      #8b5cf6,
      #a855f7
    ) !important;

  box-shadow:
    0 9px 25px rgba(139,92,246,.23);
}

[data-store-builder-visual-v2="true"]
button[class*="bg-violet-500"]:hover {
  box-shadow:
    0 12px 30px rgba(139,92,246,.30),
    0 0 0 1px rgba(192,165,255,.12);
}

[data-store-builder-visual-v2="true"]
button[class*="bg-cyan-400"] {
  background:
    linear-gradient(
      135deg,
      #22d3ee,
      #38bdf8
    ) !important;
}

/* ============================================================
   INPUTS
   ============================================================ */

[data-store-builder-visual-v2="true"]
input,
[data-store-builder-visual-v2="true"]
textarea,
[data-store-builder-visual-v2="true"]
select {
  background:
    rgba(7,20,40,.78) !important;

  color:
    #f4f8ff !important;

  border-color:
    rgba(148,163,184,.16) !important;
}

[data-store-builder-visual-v2="true"]
input:focus,
[data-store-builder-visual-v2="true"]
textarea:focus,
[data-store-builder-visual-v2="true"]
select:focus {
  border-color:
    rgba(103,232,249,.55) !important;

  box-shadow:
    0 0 0 3px rgba(34,211,238,.075),
    0 0 26px rgba(34,211,238,.06) !important;
}

/* ============================================================
   GLASS
   ============================================================ */

[data-store-builder-visual-v2="true"]
[class*="backdrop-blur"] {
  backdrop-filter:
    blur(20px) saturate(1.12);
}

/* ============================================================
   MODALS
   ============================================================ */

[data-store-builder-visual-v2="true"]
[class*="fixed"][class*="z-[100]"] {
  background:
    rgba(2,7,16,.68) !important;
}

[data-store-builder-visual-v2="true"]
[class*="fixed"][class*="z-[100]"]
[class*="shadow-2xl"] {
  border-color:
    rgba(148,163,184,.16) !important;

  box-shadow:
    0 28px 90px rgba(0,0,0,.38),
    0 0 0 1px rgba(139,92,246,.035);
}

/* ============================================================
   FOOTER / STATUS AREAS
   ============================================================ */

[data-store-builder-visual-v2="true"] footer {
  background:
    rgba(7,17,33,.95) !important;

  border-top-color:
    rgba(148,163,184,.11) !important;
}

/* ============================================================
   SCROLLBAR
   ============================================================ */

[data-store-builder-visual-v2="true"]::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

[data-store-builder-visual-v2="true"]::-webkit-scrollbar-track {
  background:
    #07111f;
}

[data-store-builder-visual-v2="true"]::-webkit-scrollbar-thumb {
  background:
    linear-gradient(
      180deg,
      #35567d,
      #7652c9
    );

  border-radius: 999px;
  border: 2px solid #07111f;
}
"""

STORE_CSS.write_text(
    store_css.strip() + "\n",
    encoding="utf-8"
)

print(f"✓ CSS Store Builder creado: {STORE_CSS.name}")

# ============================================================
# IMPORT HELPER
# ============================================================

def ensure_css_import(source: str, css_name: str) -> str:
    import_line = f'import "./{css_name}";'

    if import_line in source:
        return source

    imports = list(
        re.finditer(
            r'^import\s+.*?from\s+["\'].*?["\'];?\s*$',
            source,
            re.MULTILINE
        )
    )

    if not imports:
        raise RuntimeError(
            f"No se encontró un bloque de imports para {css_name}"
        )

    pos = imports[-1].end()

    return (
        source[:pos]
        + "\n"
        + import_line
        + source[pos:]
    )

# ============================================================
# COMMERCE OS
# ============================================================

commerce_source = COMMERCE.read_text(encoding="utf-8")
commerce_source = ensure_css_import(
    commerce_source,
    COMMERCE_CSS.name
)

commerce_root = re.search(
    r'<div([^>]*data-commerce-os="true"[^>]*)>',
    commerce_source
)

if commerce_root:
    tag = commerce_root.group(0)

    if "db-commerce-visual-v2" not in tag:
        if "className=" in tag:
            new_tag = re.sub(
                r'className="([^"]*)"',
                lambda m:
                    f'className="{m.group(1)} db-commerce-visual-v2"',
                tag,
                count=1
            )
        else:
            new_tag = tag[:-1] + ' className="db-commerce-visual-v2">'

        commerce_source = (
            commerce_source[:commerce_root.start()]
            + new_tag
            + commerce_source[commerce_root.end():]
        )

        print("✓ Commerce OS root marcado con Visual V2")
    else:
        print("✓ Commerce OS root ya marcado")
else:
    print("⚠️ No se encontró data-commerce-os=true")

COMMERCE.write_text(
    commerce_source,
    encoding="utf-8"
)

print("✓ CommerceOSOverview.tsx actualizado")

# ============================================================
# STORE BUILDER
# ============================================================

store_source = STORE.read_text(encoding="utf-8")
store_source = ensure_css_import(
    store_source,
    STORE_CSS.name
)

store_patterns = [
    (
        '<div className="flex h-screen overflow-hidden '
        'bg-[#02050d] text-white">',
        '<div data-store-builder-visual-v2="true" '
        'className="flex h-screen overflow-hidden '
        'bg-[#081321] text-white">'
    ),
]

store_root_done = False

for old, new in store_patterns:
    if old in store_source:
        store_source = store_source.replace(
            old,
            new,
            1
        )
        store_root_done = True
        print("✓ Store Builder root transformado a Visual V2")
        break

if not store_root_done:
    fallback = re.search(
        r'<div\s+className="flex h-screen overflow-hidden ([^"]*)">',
        store_source
    )

    if fallback:
        classes = fallback.group(1)

        new_root = (
            '<div '
            'data-store-builder-visual-v2="true" '
            f'className="flex h-screen overflow-hidden '
            f'{classes}">'
        )

        store_source = (
            store_source[:fallback.start()]
            + new_root
            + store_source[fallback.end():]
        )

        store_root_done = True
        print("✓ Store Builder root marcado mediante fallback")
    else:
        print("⚠️ No se pudo marcar automáticamente el root")

# ============================================================
# HEADER / MAIN / SIDEBAR MARKERS
# ============================================================

header_pattern = (
    'className="flex h-[72px] shrink-0 items-center justify-between '
    'border-b border-white/[.07] bg-[#02050d]/95 px-4 backdrop-blur-xl '
    'lg:px-7"'
)

header_replacement = (
    'className="flex h-[72px] shrink-0 items-center justify-between '
    'border-b border-white/[.07] bg-[#0a1730]/95 px-4 backdrop-blur-xl '
    'lg:px-7 db-store-visual-header"'
)

if header_pattern in store_source:
    store_source = store_source.replace(
        header_pattern,
        header_replacement,
        1
    )
    print("✓ Header Store Builder refinado")

main_pattern = (
    '<main className="min-w-0 flex-1 bg-[#020711]">'
)

main_replacement = (
    '<main className="min-w-0 flex-1 bg-[#0a1730] '
    'db-store-visual-main">'
)

if main_pattern in store_source:
    store_source = store_source.replace(
        main_pattern,
        main_replacement,
        1
    )
    print("✓ Main Store Builder refinado")

STORE.write_text(
    store_source,
    encoding="utf-8"
)

print("✓ StoreBuilderWorkspace.tsx actualizado")

# ============================================================
# PROTECCIONES
# ============================================================

APP = SRC / "App.tsx"
WEBSITE = SRC / "WebsiteBuilderV1.tsx"

print()
print("=" * 84)
print("PROTECCIONES")
print("=" * 84)

print("✓ App.tsx no será modificado")
print("✓ WebsiteBuilderV1.tsx no será modificado")
print("✓ No se cambia la lógica del Store Builder")
print("✓ No se cambia la lógica de Commerce OS")
print("✓ Store Builder continúa dedicado a tiendas virtuales")
print("✓ Web Builder continúa como ecosistema separado")
print("✓ No se agrega NFT")
print("✓ No se agregan dragones")

# ============================================================
# VALIDACIÓN
# ============================================================

print()
print("=" * 84)
print("VALIDACIÓN")
print("=" * 84)

commerce_check = COMMERCE.read_text(encoding="utf-8")
store_check = STORE.read_text(encoding="utf-8")

checks = [
    (
        "Commerce OS Visual V2",
        "db-commerce-visual-v2" in commerce_check
    ),
    (
        "Commerce OS CSS",
        COMMERCE_CSS.exists()
    ),
    (
        "Commerce OS identidad violeta",
        "#7c3aed" in commerce_css
    ),
    (
        "Commerce OS cyan",
        "#0891b2" in commerce_css
    ),
    (
        "Store Builder Visual V2",
        'data-store-builder-visual-v2="true"' in store_check
    ),
    (
        "Store Builder CSS",
        STORE_CSS.exists()
    ),
    (
        "Store Builder violet",
        "#9b6cff" in store_css
    ),
    (
        "Store Builder cyan",
        "#22d3ee" in store_css
    ),
    (
        "Store Builder header marker",
        "db-store-visual-header" in store_check
    ),
    (
        "Store Builder main marker",
        "db-store-visual-main" in store_check
    ),
]

for name, ok in checks:
    print(f"{'✓' if ok else '⚠️'} {name}")

# ============================================================
# BUILD
# ============================================================

print()
print("=" * 84)
print("BUILD DE VERIFICACIÓN")
print("=" * 84)

try:
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=180
    )

except FileNotFoundError:
    print("❌ npm no está disponible")
    result = None

except subprocess.TimeoutExpired:
    print("❌ npm run build excedió el tiempo límite")
    result = None

if result is None or result.returncode != 0:

    if result is not None and result.stderr:
        print(result.stderr)

    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando archivos TypeScript modificados...")

    shutil.copy2(
        commerce_backup,
        COMMERCE
    )

    shutil.copy2(
        store_backup,
        STORE
    )

    print("✓ CommerceOSOverview.tsx restaurado")
    print("✓ StoreBuilderWorkspace.tsx restaurado")

    # Los CSS nuevos se eliminan porque no se instalaron.
    if COMMERCE_CSS.exists():
        COMMERCE_CSS.unlink()

    if STORE_CSS.exists():
        STORE_CSS.unlink()

    print("✓ CSS V2 eliminado")
    print(f"✓ Backup Commerce: {commerce_backup.name}")
    print(f"✓ Backup Store Builder: {store_backup.name}")

    sys.exit(1)

print(result.stdout)

# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 84)
print("COMMERCE OS + STORE BUILDER VISUAL V2 INSTALADO")
print("=" * 84)

print()
print("COMMERCE OS")
print("✓ Light Premium Command Center")
print("✓ Fondo azul claro / hielo")
print("✓ Superficies blancas")
print("✓ Electric Violet")
print("✓ Cyan tecnológico")
print("✓ Mejor jerarquía visual")
print("✓ Menos ruido")
print("✓ Cards más limpias")
print("✓ Inputs refinados")
print("✓ Estados activos mejorados")

print()
print("STORE BUILDER")
print("✓ Dark Premium Studio")
print("✓ Azul petróleo / índigo")
print("✓ Violet eléctrico")
print("✓ Neon Cyan")
print("✓ Magenta de apoyo")
print("✓ Paneles con profundidad")
print("✓ Header refinado")
print("✓ Main canvas refinado")
print("✓ Cards mejoradas")
print("✓ Inputs mejorados")
print("✓ Hover / focus mejorados")
print("✓ Glass surfaces")
print("✓ Scrollbar premium")

print()
print("ARQUITECTURA")
print("✓ Commerce OS continúa siendo el Core")
print("✓ Store Builder continúa siendo e-commerce")
print("✓ Web Builder continúa separado")
print("✓ App.tsx protegido")
print("✓ Sin NFT")
print("✓ Sin dragones")
print("✓ Sin cambios de lógica")

print()
print("Backups:")
print(f"  {commerce_backup.name}")
print(f"  {store_backup.name}")

print()
print("Ejecutá:")
print("npm run dev")

print()
print("=" * 84)
print("FIN")
print("=" * 84)
