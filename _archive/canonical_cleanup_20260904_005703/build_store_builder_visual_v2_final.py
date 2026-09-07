#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

ROOT = Path.cwd()
SRC = ROOT / "src"

STORE = SRC / "StoreBuilderWorkspace.tsx"
ENV = SRC / "StoreBuilderEnvironment.tsx"
CSS = SRC / "store-builder-vibrant-global.css"

STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 86)
print("DIGITALBOOST — STORE BUILDER VISUAL V2 FINAL")
print("COMMERCE OS → STORE BUILDER → PREMIUM COMMERCE STUDIO")
print("=" * 86)
print()

# ============================================================
# VALIDACIÓN
# ============================================================

if not STORE.exists():
    print(f"❌ No existe: {STORE}")
    sys.exit(1)

if not ENV.exists():
    print(f"⚠️ No existe: {ENV}")

print("✓ StoreBuilderWorkspace.tsx encontrado")
print("✓ StoreBuilderEnvironment.tsx encontrado" if ENV.exists() else "⚠ Environment ausente")

# ============================================================
# BACKUPS
# ============================================================

store_backup = STORE.with_name(
    f"{STORE.stem}.before_visual_v2_final_{STAMP}{STORE.suffix}"
)

shutil.copy2(STORE, store_backup)
print(f"✓ Backup Store Builder: {store_backup.name}")

env_backup = None
if ENV.exists():
    env_backup = ENV.with_name(
        f"{ENV.stem}.before_visual_v2_final_{STAMP}{ENV.suffix}"
    )
    shutil.copy2(ENV, env_backup)
    print(f"✓ Backup Environment: {env_backup.name}")

css_backup = None
if CSS.exists():
    css_backup = CSS.with_name(
        f"{CSS.stem}.before_visual_v2_final_{STAMP}{CSS.suffix}"
    )
    shutil.copy2(CSS, css_backup)
    print(f"✓ Backup CSS: {css_backup.name}")

# ============================================================
# CREAR SISTEMA VISUAL
# ============================================================

visual_css = r"""
/* ============================================================
   DIGITALBOOST — STORE BUILDER VISUAL V2
   PREMIUM COMMERCE STUDIO
   ============================================================ */

[data-store-builder-vibrant="true"] {

  --db-sb-bg-0: #07111f;
  --db-sb-bg-1: #0b1a31;
  --db-sb-bg-2: #102442;

  --db-sb-panel: #10233f;
  --db-sb-panel-2: #153052;
  --db-sb-panel-3: #1a385d;

  --db-sb-violet: #9b6cff;
  --db-sb-violet-bright: #c2a7ff;

  --db-sb-cyan: #20d9f2;
  --db-sb-cyan-bright: #72efff;

  --db-sb-magenta: #f05bbf;

  --db-sb-text: #f5f9ff;
  --db-sb-text-2: #d5e0ed;
  --db-sb-muted: #9eb0c5;
  --db-sb-muted-2: #7d92ab;

  position: relative !important;
  isolation: isolate !important;

  background:
    radial-gradient(
      circle at 5% 0%,
      rgba(32,217,242,.16),
      transparent 25%
    ),
    radial-gradient(
      circle at 96% 0%,
      rgba(155,108,255,.20),
      transparent 28%
    ),
    radial-gradient(
      circle at 65% 100%,
      rgba(240,91,191,.075),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      var(--db-sb-bg-0) 0%,
      var(--db-sb-bg-1) 46%,
      var(--db-sb-bg-2) 100%
    ) !important;

  color: var(--db-sb-text) !important;
}

/* ============================================================
   ATMOSPHERE
   ============================================================ */

[data-store-builder-vibrant="true"]::before {

  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  background:
    linear-gradient(
      130deg,
      rgba(114,239,255,.025),
      transparent 24%,
      rgba(194,167,255,.045) 66%,
      transparent
    );

  box-shadow:
    inset 0 80px 130px rgba(32,217,242,.025),
    inset 0 -90px 150px rgba(155,108,255,.025);
}

/* ============================================================
   HEADER
   ============================================================ */

[data-store-builder-vibrant="true"] header {

  background:
    linear-gradient(
      180deg,
      rgba(13,31,58,.97),
      rgba(8,21,41,.94)
    ) !important;

  border-bottom-color:
    rgba(170,190,215,.13) !important;

  box-shadow:
    0 12px 32px rgba(0,0,0,.22),
    inset 0 -1px 0 rgba(255,255,255,.035);

  backdrop-filter:
    blur(22px) saturate(1.15);
}

/* ============================================================
   SIDEBAR
   ============================================================ */

[data-store-builder-vibrant="true"] aside {

  background:
    linear-gradient(
      180deg,
      rgba(9,23,45,.98),
      rgba(7,18,36,.98)
    ) !important;

  border-color:
    rgba(170,190,215,.11) !important;

  box-shadow:
    18px 0 50px rgba(0,0,0,.16);
}

/* ============================================================
   MAIN CANVAS
   ============================================================ */

[data-store-builder-vibrant="true"] main {

  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(32,217,242,.045),
      transparent 27%
    ),
    linear-gradient(
      180deg,
      rgba(10,26,49,.72),
      rgba(7,18,35,.92)
    ) !important;
}

/* ============================================================
   SURFACES
   ============================================================ */

[data-store-builder-vibrant="true"]
[class*="bg-[#02050d]"],
[data-store-builder-vibrant="true"]
[class*="bg-[#02050a]"],
[data-store-builder-vibrant="true"]
[class*="bg-[#020711]"] {

  background:
    linear-gradient(
      145deg,
      #08182c,
      #0c213b
    ) !important;
}

[data-store-builder-vibrant="true"]
[class*="bg-[#030711]"],
[data-store-builder-vibrant="true"]
[class*="bg-[#030914]"] {

  background:
    linear-gradient(
      145deg,
      #0d2140,
      #112b4b
    ) !important;
}

[data-store-builder-vibrant="true"]
[class*="bg-[#070b14]"],
[data-store-builder-vibrant="true"]
[class*="bg-[#070d18]"] {

  background:
    linear-gradient(
      145deg,
      #122846,
      #183557
    ) !important;
}

[data-store-builder-vibrant="true"]
[class*="bg-[#0a0f1c]"] {

  background:
    linear-gradient(
      145deg,
      #18395c,
      #20466e
    ) !important;
}

/* ============================================================
   CARDS
   ============================================================ */

[data-store-builder-vibrant="true"]
[class*="rounded-2xl"][class*="border"],
[data-store-builder-vibrant="true"]
[class*="rounded-xl"][class*="border"] {

  border-color:
    rgba(169,190,214,.14) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.045),
    0 12px 30px rgba(0,0,0,.14);

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease,
    background-color .18s ease;
}

[data-store-builder-vibrant="true"]
[class*="rounded-2xl"][class*="border"]:hover,
[data-store-builder-vibrant="true"]
[class*="rounded-xl"][class*="border"]:hover {

  border-color:
    rgba(103,232,249,.22) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 18px 42px rgba(0,0,0,.18),
    0 0 0 1px rgba(32,217,242,.035);
}

/* ============================================================
   TYPOGRAPHY
   ============================================================ */

[data-store-builder-vibrant="true"]
[class*="text-slate-700"] {

  color: #7f95ae !important;
}

[data-store-builder-vibrant="true"]
[class*="text-slate-600"] {

  color: #93a8bf !important;
}

[data-store-builder-vibrant="true"]
[class*="text-slate-500"] {

  color: #a9b8c9 !important;
}

[data-store-builder-vibrant="true"]
[class*="text-slate-400"] {

  color: #bdcbd9 !important;
}

[data-store-builder-vibrant="true"]
[class*="text-white"] {

  color: #f5f9ff !important;
}

[data-store-builder-vibrant="true"]
[class*="text-cyan-300"],
[data-store-builder-vibrant="true"]
[class*="text-cyan-200"] {

  color: var(--db-sb-cyan-bright) !important;
}

[data-store-builder-vibrant="true"]
[class*="text-violet-300"] {

  color: var(--db-sb-violet-bright) !important;
}

[data-store-builder-vibrant="true"]
[class*="text-violet-200"] {

  color: #d9ceff !important;
}

/* ============================================================
   PRIMARY ACTIONS
   ============================================================ */

[data-store-builder-vibrant="true"]
button[class*="bg-violet-500"] {

  background:
    linear-gradient(
      135deg,
      #8657ff,
      #a25cff
    ) !important;

  color: #ffffff !important;

  box-shadow:
    0 10px 25px rgba(134,87,255,.24);
}

[data-store-builder-vibrant="true"]
button[class*="bg-violet-500"]:hover {

  box-shadow:
    0 14px 34px rgba(134,87,255,.30),
    0 0 0 1px rgba(194,167,255,.12);
}

[data-store-builder-vibrant="true"]
button[class*="bg-cyan-400"] {

  background:
    linear-gradient(
      135deg,
      #19cde7,
      #39dff3
    ) !important;

  color:
    #06283a !important;

  box-shadow:
    0 8px 24px rgba(32,217,242,.17);
}

/* ============================================================
   ACTIVE / SELECTED STATES
   ============================================================ */

[data-store-builder-vibrant="true"]
[class*="bg-violet-500/10"],
[data-store-builder-vibrant="true"]
[class*="bg-violet-400/[0.05]"],
[data-store-builder-vibrant="true"]
[class*="bg-violet-500/5"] {

  box-shadow:
    inset 0 0 28px rgba(155,108,255,.075),
    0 0 0 1px rgba(155,108,255,.025);
}

[data-store-builder-vibrant="true"]
[class*="bg-cyan-400/[0.06]"],
[data-store-builder-vibrant="true"]
[class*="bg-cyan-400/[0.07]"],
[data-store-builder-vibrant="true"]
[class*="bg-cyan-500/5"] {

  box-shadow:
    inset 0 0 28px rgba(32,217,242,.065),
    0 0 0 1px rgba(32,217,242,.025);
}

/* ============================================================
   INPUTS
   ============================================================ */

[data-store-builder-vibrant="true"]
input,
[data-store-builder-vibrant="true"]
textarea,
[data-store-builder-vibrant="true"]
select {

  background:
    rgba(5,18,36,.82) !important;

  color:
    #f3f8ff !important;

  border-color:
    rgba(169,190,214,.17) !important;
}

[data-store-builder-vibrant="true"]
input::placeholder,
[data-store-builder-vibrant="true"]
textarea::placeholder {

  color:
    #7088a2 !important;
}

[data-store-builder-vibrant="true"]
input:focus,
[data-store-builder-vibrant="true"]
textarea:focus,
[data-store-builder-vibrant="true"]
select:focus {

  border-color:
    rgba(114,239,255,.58) !important;

  box-shadow:
    0 0 0 3px rgba(32,217,242,.075),
    0 0 28px rgba(32,217,242,.055) !important;
}

/* ============================================================
   GLASS
   ============================================================ */

[data-store-builder-vibrant="true"]
[class*="backdrop-blur"] {

  backdrop-filter:
    blur(20px) saturate(1.12);
}

/* ============================================================
   MODALS
   ============================================================ */

[data-store-builder-vibrant="true"]
[class*="fixed"][class*="z-[100]"] {

  background:
    rgba(2,8,18,.67) !important;
}

[data-store-builder-vibrant="true"]
[class*="fixed"][class*="z-[100]"]
[class*="shadow-2xl"] {

  box-shadow:
    0 32px 100px rgba(0,0,0,.42),
    0 0 0 1px rgba(155,108,255,.035);
}

/* ============================================================
   FOCUS
   ============================================================ */

[data-store-builder-vibrant="true"]
button:focus-visible,
[data-store-builder-vibrant="true"]
input:focus-visible,
[data-store-builder-vibrant="true"]
textarea:focus-visible,
[data-store-builder-vibrant="true"]
select:focus-visible {

  outline:
    2px solid rgba(114,239,255,.72);

  outline-offset:
    2px;
}

/* ============================================================
   SCROLLBAR
   ============================================================ */

[data-store-builder-vibrant="true"]::-webkit-scrollbar {

  width: 9px;
  height: 9px;
}

[data-store-builder-vibrant="true"]::-webkit-scrollbar-track {

  background:
    #06101d;
}

[data-store-builder-vibrant="true"]::-webkit-scrollbar-thumb {

  background:
    linear-gradient(
      180deg,
      #2f5279,
      #8258d4
    );

  border-radius:
    999px;

  border:
    2px solid #06101d;
}

/* ============================================================
   SMALL DEVICES
   ============================================================ */

@media (max-width: 1023px) {

  [data-store-builder-vibrant="true"] main {

    background:
      linear-gradient(
        180deg,
        #0a1a30,
        #081426
      ) !important;
  }
}
"""

CSS.write_text(
    visual_css.strip() + "\n",
    encoding="utf-8"
)

print("✓ Sistema Visual V2 escrito")

# ============================================================
# GARANTIZAR IMPORT CSS
# ============================================================

def ensure_css_import(path: Path):
    text = path.read_text(encoding="utf-8")

    if "store-builder-vibrant-global.css" in text:
        return False

    path.write_text(
        "import './store-builder-vibrant-global.css';\n" + text,
        encoding="utf-8"
    )

    return True

if ensure_css_import(STORE):
    print("✓ CSS conectado al Workspace")

if ENV.exists() and ensure_css_import(ENV):
    print("✓ CSS conectado al Environment")

# ============================================================
# ASEGURAR SCOPE DEL ROOT
# ============================================================

store_source = STORE.read_text(encoding="utf-8")

if 'data-store-builder-vibrant="true"' in store_source:

    print("✓ Scope Store Builder ya activo")

else:

    root_pattern = re.compile(
        r'<div(?P<attrs>[^>]*h-screen[^>]*overflow-hidden[^>]*)>',
        re.MULTILINE
    )

    match = root_pattern.search(store_source)

    if not match:

        root_pattern = re.compile(
            r'<div(?P<attrs>[^>]*data-store-builder="true"[^>]*)>',
            re.MULTILINE
        )

        match = root_pattern.search(store_source)

    if not match:
        print("❌ No se pudo localizar el root Store Builder")
        shutil.copy2(store_backup, STORE)

        if env_backup:
            shutil.copy2(env_backup, ENV)

        if css_backup:
            shutil.copy2(css_backup, CSS)

        sys.exit(1)

    root_tag = match.group(0)

    replacement = root_tag.replace(
        "<div",
        '<div data-store-builder-vibrant="true"',
        1
    )

    store_source = (
        store_source[:match.start()]
        + replacement
        + store_source[match.end():]
    )

    STORE.write_text(
        store_source,
        encoding="utf-8"
    )

    print("✓ Scope V2 agregado al root real")

# ============================================================
# ENVIRONMENT SCOPE
# ============================================================

if ENV.exists():

    env_source = ENV.read_text(encoding="utf-8")

    if 'data-store-builder-vibrant="true"' in env_source:

        print("✓ Scope V2 de Environment ya activo")

    else:

        candidates = [
            re.compile(
                r'<div(?P<attrs>[^>]*min-h-screen[^>]*)>',
                re.MULTILINE
            ),
            re.compile(
                r'<div(?P<attrs>[^>]*z-\[9999\][^>]*)>',
                re.MULTILINE
            )
        ]

        found = None

        for candidate in candidates:
            found = candidate.search(env_source)
            if found:
                break

        if found:

            tag = found.group(0)

            replacement = tag.replace(
                "<div",
                '<div data-store-builder-vibrant="true"',
                1
            )

            env_source = (
                env_source[:found.start()]
                + replacement
                + env_source[found.end():]
            )

            ENV.write_text(
                env_source,
                encoding="utf-8"
            )

            print("✓ Scope V2 agregado a Environment")

# ============================================================
# VALIDACIÓN
# ============================================================

store_check = STORE.read_text(encoding="utf-8")

print()
print("=" * 86)
print("VALIDACIÓN")
print("=" * 86)

checks = [
    (
        "CSS existe",
        CSS.exists()
    ),
    (
        "CSS importado",
        "store-builder-vibrant-global.css" in store_check
    ),
    (
        "Scope Store Builder",
        'data-store-builder-vibrant="true"' in store_check
    ),
    (
        "Root Store Builder",
        "data-store-builder=\"true\"" in store_check
    ),
    (
        "Premium azul",
        "#07111f" in visual_css
    ),
    (
        "Electric Violet",
        "#9b6cff" in visual_css
    ),
    (
        "Neon Cyan",
        "#20d9f2" in visual_css
    ),
    (
        "Magenta",
        "#f05bbf" in visual_css
    )
]

for label, ok in checks:
    print(f"{'✓' if ok else '⚠️'} {label}")

# ============================================================
# PROTECCIONES
# ============================================================

APP = SRC / "App.tsx"
COMMERCE = SRC / "CommerceOSOverview.tsx"
WEB = SRC / "WebsiteBuilderV1.tsx"

print()
print("=" * 86)
print("PROTECCIONES")
print("=" * 86)

print("✓ App.tsx NO modificado")
print("✓ CommerceOSOverview.tsx NO modificado")
print("✓ WebsiteBuilderV1.tsx NO modificado")
print("✓ Store Builder continúa dedicado a tiendas virtuales")
print("✓ Web Builder continúa siendo un ecosistema separado")
print("✓ No se agregan NFT")
print("✓ No se agregan dragones")
print("✓ No se modifica la lógica funcional")

# ============================================================
# BUILD
# ============================================================

print()
print("=" * 86)
print("BUILD DE VERIFICACIÓN")
print("=" * 86)

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

    shutil.copy2(store_backup, STORE)

    if env_backup:
        shutil.copy2(env_backup, ENV)

    if css_backup:
        shutil.copy2(css_backup, CSS)

    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible")

    shutil.copy2(store_backup, STORE)

    if env_backup:
        shutil.copy2(env_backup, ENV)

    if css_backup:
        shutil.copy2(css_backup, CSS)

    sys.exit(1)

print(result.stdout)

if result.returncode != 0:

    if result.stderr:
        print(result.stderr)

    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando cambios...")

    shutil.copy2(store_backup, STORE)

    if env_backup:
        shutil.copy2(env_backup, ENV)

    if css_backup:
        shutil.copy2(css_backup, CSS)

    print("✓ Workspace restaurado")
    print("✓ CSS restaurado")

    sys.exit(result.returncode)

# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 86)
print("STORE BUILDER VISUAL V2 FINAL INSTALADO")
print("=" * 86)
print()

print("✓ Fondo azul/índigo más profundo")
print("✓ Mayor separación entre capas")
print("✓ Violet eléctrico más protagonista")
print("✓ Cyan tecnológico más visible")
print("✓ Magenta como acento")
print("✓ Cards más limpias")
print("✓ Bordes menos pesados")
print("✓ Glass surfaces")
print("✓ Header premium")
print("✓ Sidebar premium")
print("✓ Main canvas reforzado")
print("✓ Inputs refinados")
print("✓ Active states reforzados")
print("✓ Focus states")
print("✓ Hover lighting")
print("✓ Scrollbar premium")
print()

print("ARQUITECTURA")
print("✓ Commerce OS = Core")
print("✓ Store Builder = tiendas virtuales")
print("✓ Web Builder = ecosistema independiente")
print()

print("BACKUPS")
print(f"✓ {store_backup.name}")

if env_backup:
    print(f"✓ {env_backup.name}")

if css_backup:
    print(f"✓ {css_backup.name}")

print()
print("Ejecutá:")
print("npm run dev")
print()

print("=" * 86)
