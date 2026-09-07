#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"
COMMERCE = SRC / "CommerceOSOverview.tsx"
CSS = SRC / "commerce-os-vibrant-global.css"

print("=" * 82)
print("DIGITALBOOST — COMMERCE OS VISUAL REFINEMENT")
print("PREMIUM DARK · ELECTRIC · HIGH CONTRAST · SYSTEM POLISH")
print("=" * 82)

if not COMMERCE.exists():
    print("❌ No existe src/CommerceOSOverview.tsx")
    sys.exit(1)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

commerce_backup = SRC / (
    f"CommerceOSOverview.before_visual_refinement_{timestamp}.tsx"
)

css_backup = None

shutil.copy2(COMMERCE, commerce_backup)
print(f"✓ Backup Commerce OS: {commerce_backup.name}")

if CSS.exists():
    css_backup = SRC / (
        f"commerce-os-vibrant-global.before_visual_refinement_{timestamp}.css"
    )
    shutil.copy2(CSS, css_backup)
    print(f"✓ Backup CSS: {css_backup.name}")

# ---------------------------------------------------------------------
# COMMERCE OS VISUAL SYSTEM
# ---------------------------------------------------------------------

css = r"""
/* =====================================================================
   DIGITALBOOST — COMMERCE OS
   VISUAL REFINEMENT SYSTEM
   Premium Dark / Electric / High Contrast
   ===================================================================== */

:root {
  /* ---------------------------------------------------------------
     COMMERCE OS CORE PALETTE
     --------------------------------------------------------------- */

  --commerce-bg-0: #05040b;
  --commerce-bg-1: #090714;
  --commerce-bg-2: #0d0a1d;
  --commerce-bg-3: #12102a;

  --commerce-surface-0: rgba(14, 11, 29, 0.78);
  --commerce-surface-1: rgba(20, 16, 40, 0.82);
  --commerce-surface-2: rgba(28, 22, 54, 0.88);
  --commerce-surface-3: rgba(38, 29, 72, 0.92);

  --commerce-border: rgba(157, 122, 255, 0.18);
  --commerce-border-strong: rgba(157, 122, 255, 0.34);
  --commerce-border-active: rgba(0, 229, 255, 0.62);

  --commerce-text: #f8f7ff;
  --commerce-text-soft: #d8d3eb;
  --commerce-text-muted: #9992b5;
  --commerce-text-disabled: #625d76;

  /* Electric Violet */
  --commerce-violet-300: #c7a6ff;
  --commerce-violet-400: #a979ff;
  --commerce-violet-500: #8b5cf6;
  --commerce-violet-600: #713cff;
  --commerce-violet-700: #5924d6;

  /* Neon Cyan */
  --commerce-cyan-300: #8fffff;
  --commerce-cyan-400: #42f5ff;
  --commerce-cyan-500: #00e5ff;
  --commerce-cyan-600: #00b9d4;

  /* Energy */
  --commerce-magenta-400: #ff62d4;
  --commerce-magenta-500: #ff2bb5;
  --commerce-magenta-600: #d91a96;

  /* Brand gradient */
  --commerce-brand-gradient:
    linear-gradient(
      135deg,
      #8b5cf6 0%,
      #713cff 34%,
      #00e5ff 72%,
      #42f5ff 100%
    );

  --commerce-brand-gradient-energy:
    linear-gradient(
      135deg,
      #8b5cf6 0%,
      #ff2bb5 48%,
      #00e5ff 100%
    );

  /* ---------------------------------------------------------------
     FUTURE CHROMATIC TOKENS
     Preparación únicamente.
     No se renderizan personajes ni NFT.
     --------------------------------------------------------------- */

  --future-crea: #9b6cff;
  --future-impulsa: #00e5ff;
  --future-escala: #ff4fc3;
  --future-innova: #7f7cff;

  /* ---------------------------------------------------------------
     SHADOW / GLOW
     --------------------------------------------------------------- */

  --commerce-shadow-sm:
    0 8px 24px rgba(0, 0, 0, 0.28);

  --commerce-shadow-md:
    0 18px 48px rgba(0, 0, 0, 0.42);

  --commerce-shadow-lg:
    0 28px 80px rgba(0, 0, 0, 0.58);

  --commerce-glow-violet:
    0 0 32px rgba(139, 92, 246, 0.22);

  --commerce-glow-cyan:
    0 0 32px rgba(0, 229, 255, 0.18);

  --commerce-glow-brand:
    0 0 42px rgba(139, 92, 246, 0.18),
    0 0 70px rgba(0, 229, 255, 0.08);

  /* ---------------------------------------------------------------
     RADIUS / MOTION
     --------------------------------------------------------------- */

  --commerce-radius-sm: 10px;
  --commerce-radius-md: 14px;
  --commerce-radius-lg: 18px;
  --commerce-radius-xl: 24px;

  --commerce-transition:
    180ms cubic-bezier(.2, .8, .2, 1);

  --commerce-transition-slow:
    320ms cubic-bezier(.2, .8, .2, 1);
}

/* =====================================================================
   ROOT
   ===================================================================== */

[data-commerce-os="true"] {
  color-scheme: dark;

  color: var(--commerce-text);

  background:
    radial-gradient(
      circle at 12% 8%,
      rgba(139, 92, 246, 0.13),
      transparent 28%
    ),
    radial-gradient(
      circle at 88% 12%,
      rgba(0, 229, 255, 0.085),
      transparent 25%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(255, 43, 181, 0.055),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      var(--commerce-bg-0),
      var(--commerce-bg-1) 46%,
      var(--commerce-bg-2)
    );

  min-height: 100%;
  isolation: isolate;
}

/* =====================================================================
   SURFACE SYSTEM
   ===================================================================== */

[data-commerce-os="true"] .commerce-surface,
[data-commerce-os="true"] [class*="surface"],
[data-commerce-os="true"] [class*="card"] {
  background:
    linear-gradient(
      145deg,
      rgba(30, 24, 58, 0.76),
      rgba(12, 10, 25, 0.82)
    );

  border-color: var(--commerce-border);

  box-shadow:
    var(--commerce-shadow-sm),
    inset 0 1px 0 rgba(255, 255, 255, 0.035);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* =====================================================================
   CARDS / PANELS
   ===================================================================== */

[data-commerce-os="true"] .commerce-card {
  position: relative;

  border: 1px solid var(--commerce-border);

  background:
    linear-gradient(
      145deg,
      rgba(27, 22, 53, 0.9),
      rgba(11, 9, 24, 0.92)
    );

  border-radius: var(--commerce-radius-lg);

  box-shadow:
    var(--commerce-shadow-md),
    inset 0 1px 0 rgba(255,255,255,.035);

  transition:
    transform var(--commerce-transition),
    border-color var(--commerce-transition),
    box-shadow var(--commerce-transition);
}

[data-commerce-os="true"] .commerce-card:hover {
  transform: translateY(-2px);

  border-color:
    rgba(139, 92, 246, 0.42);

  box-shadow:
    var(--commerce-shadow-lg),
    var(--commerce-glow-violet),
    inset 0 1px 0 rgba(255,255,255,.05);
}

/* =====================================================================
   BUTTONS
   ===================================================================== */

[data-commerce-os="true"] button {
  transition:
    transform var(--commerce-transition),
    border-color var(--commerce-transition),
    background var(--commerce-transition),
    box-shadow var(--commerce-transition),
    color var(--commerce-transition);
}

[data-commerce-os="true"] button:hover {
  border-color:
    rgba(139, 92, 246, 0.42);
}

[data-commerce-os="true"] button:active {
  transform: translateY(1px);
}

[data-commerce-os="true"] .commerce-primary-button {
  position: relative;
  overflow: hidden;

  color: #ffffff;

  border: 1px solid rgba(255,255,255,.12);

  background:
    var(--commerce-brand-gradient);

  box-shadow:
    0 10px 30px rgba(113, 60, 255, 0.28),
    0 0 28px rgba(0, 229, 255, 0.08);
}

[data-commerce-os="true"] .commerce-primary-button:hover {
  box-shadow:
    0 14px 38px rgba(113, 60, 255, 0.38),
    0 0 38px rgba(0, 229, 255, 0.14);
}

/* =====================================================================
   ACTIVE STATES
   ===================================================================== */

[data-commerce-os="true"] .active,
[data-commerce-os="true"] [aria-current="true"],
[data-commerce-os="true"] [data-active="true"] {
  border-color:
    var(--commerce-border-active) !important;

  box-shadow:
    0 0 0 1px rgba(0,229,255,.08),
    0 0 26px rgba(0,229,255,.10),
    inset 0 1px 0 rgba(255,255,255,.04);
}

/* =====================================================================
   INPUTS
   ===================================================================== */

[data-commerce-os="true"] input,
[data-commerce-os="true"] textarea,
[data-commerce-os="true"] select {
  color: var(--commerce-text);

  background:
    rgba(7, 6, 16, 0.72);

  border-color:
    rgba(157, 122, 255, 0.18);

  transition:
    border-color var(--commerce-transition),
    box-shadow var(--commerce-transition),
    background var(--commerce-transition);
}

[data-commerce-os="true"] input:focus,
[data-commerce-os="true"] textarea:focus,
[data-commerce-os="true"] select:focus {
  outline: none;

  border-color:
    rgba(0, 229, 255, 0.62);

  background:
    rgba(12, 10, 26, 0.9);

  box-shadow:
    0 0 0 3px rgba(0,229,255,.07),
    0 0 24px rgba(0,229,255,.08);
}

/* =====================================================================
   TEXT HIERARCHY
   ===================================================================== */

[data-commerce-os="true"] h1,
[data-commerce-os="true"] h2,
[data-commerce-os="true"] h3 {
  color: var(--commerce-text);
  letter-spacing: -0.025em;
}

[data-commerce-os="true"] .commerce-muted {
  color: var(--commerce-text-muted);
}

[data-commerce-os="true"] .commerce-soft {
  color: var(--commerce-text-soft);
}

/* =====================================================================
   BRAND ACCENTS
   ===================================================================== */

[data-commerce-os="true"] .commerce-gradient-text {
  background:
    var(--commerce-brand-gradient);

  -webkit-background-clip: text;
  background-clip: text;

  color: transparent;
}

[data-commerce-os="true"] .commerce-violet {
  color: var(--commerce-violet-400);
}

[data-commerce-os="true"] .commerce-cyan {
  color: var(--commerce-cyan-400);
}

[data-commerce-os="true"] .commerce-magenta {
  color: var(--commerce-magenta-400);
}

/* =====================================================================
   DIVIDERS
   ===================================================================== */

[data-commerce-os="true"] hr {
  border: 0;
  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(139,92,246,.28),
      rgba(0,229,255,.22),
      transparent
    );
}

/* =====================================================================
   SELECTION
   ===================================================================== */

[data-commerce-os="true"] ::selection {
  color: #ffffff;

  background:
    rgba(113, 60, 255, 0.62);
}

/* =====================================================================
   SCROLLBAR
   ===================================================================== */

[data-commerce-os="true"] * {
  scrollbar-width: thin;
  scrollbar-color:
    rgba(139,92,246,.55)
    rgba(7,6,16,.45);
}

[data-commerce-os="true"] *::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

[data-commerce-os="true"] *::-webkit-scrollbar-track {
  background:
    rgba(5,4,11,.58);
}

[data-commerce-os="true"] *::-webkit-scrollbar-thumb {
  border-radius: 999px;

  background:
    linear-gradient(
      180deg,
      rgba(139,92,246,.72),
      rgba(0,229,255,.52)
    );

  border:
    2px solid rgba(5,4,11,.58);
}

/* =====================================================================
   FOCUS ACCESSIBILITY
   ===================================================================== */

[data-commerce-os="true"] :focus-visible {
  outline:
    2px solid rgba(0,229,255,.72);

  outline-offset: 3px;

  box-shadow:
    0 0 0 5px rgba(0,229,255,.07);
}

/* =====================================================================
   REDUCED MOTION
   ===================================================================== */

@media (prefers-reduced-motion: reduce) {
  [data-commerce-os="true"] *,
  [data-commerce-os="true"] *::before,
  [data-commerce-os="true"] *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
"""

CSS.write_text(css.strip() + "\n", encoding="utf-8")

print("✓ Sistema visual Commerce OS refinado")

# ---------------------------------------------------------------------
# CONNECT CSS ONLY TO COMMERCE OS COMPONENT
# ---------------------------------------------------------------------

source = COMMERCE.read_text(encoding="utf-8")

css_import = 'import "./commerce-os-vibrant-global.css";'

if css_import not in source:
    lines = source.splitlines(True)

    insert_at = 0

    for i, line in enumerate(lines):
        stripped = line.strip()

        if stripped.startswith("import "):
            insert_at = i + 1

    lines.insert(insert_at, css_import + "\n")
    source = "".join(lines)

    print("✓ CSS conectado a CommerceOSOverview.tsx")
else:
    print("✓ CSS ya estaba conectado a CommerceOSOverview.tsx")

# ---------------------------------------------------------------------
# SAFE ROOT IDENTIFICATION
# ---------------------------------------------------------------------

if 'data-commerce-os="true"' not in source:

    candidates = [
        '<div className="',
        '<main className="',
        '<section className="',
    ]

    modified = False

    for candidate in candidates:
        index = source.find(candidate)

        if index != -1:
            tag_end = source.find(">", index)

            if tag_end != -1:
                opening = source[index:tag_end]

                replacement = opening + ' data-commerce-os="true"'

                source = (
                    source[:index]
                    + replacement
                    + source[tag_end:]
                )

                modified = True
                print("✓ Root Commerce OS identificado")
                break

    if not modified:
        print("⚠️ No fue necesario modificar el root.")
else:
    print("✓ Root Commerce OS ya identificado")

# ---------------------------------------------------------------------
# METADATA
# ---------------------------------------------------------------------

metadata = "data-commerce-os-core=\"true\""

if metadata not in source:
    root_index = source.find('data-commerce-os="true"')

    if root_index != -1:
        tag_start = source.rfind("<", 0, root_index)
        tag_end = source.find(">", root_index)

        if tag_start != -1 and tag_end != -1:
            source = (
                source[:tag_end]
                + " "
                + metadata
                + source[tag_end:]
            )

            print("✓ Metadata Commerce OS Core agregada")
else:
    print("✓ Metadata Commerce OS Core ya presente")

COMMERCE.write_text(source, encoding="utf-8")

print("✓ CommerceOSOverview.tsx actualizado")

# ---------------------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------------------

final_css = CSS.read_text(encoding="utf-8")
final_source = COMMERCE.read_text(encoding="utf-8")

checks = [
    ("Commerce OS CSS", CSS.exists()),
    ("Premium Dark", "--commerce-bg-0" in final_css),
    ("Electric Violet", "--commerce-violet-500" in final_css),
    ("Neon Cyan", "--commerce-cyan-500" in final_css),
    ("Magenta Pulse", "--commerce-magenta-500" in final_css),
    ("Brand Gradient", "--commerce-brand-gradient" in final_css),
    ("Glass surfaces", "backdrop-filter" in final_css),
    ("Ambient lighting", "radial-gradient" in final_css),
    ("Active states", "data-active" in final_css),
    ("Focus states", "focus-visible" in final_css),
    ("Future Crea token", "--future-crea" in final_css),
    ("Future Impulsa token", "--future-impulsa" in final_css),
    ("Future Escala token", "--future-escala" in final_css),
    ("Future Innova token", "--future-innova" in final_css),
    ("Commerce OS root", 'data-commerce-os="true"' in final_source),
    ("Commerce OS core", 'data-commerce-os-core="true"' in final_source),
]

print()
print("=" * 82)
print("VALIDACIÓN VISUAL")
print("=" * 82)

failed = False

for name, ok in checks:
    if ok:
        print(f"✓ {name}")
    else:
        print(f"❌ {name}")
        failed = True

if failed:
    print()
    print("❌ La validación no pasó.")
    print("↩ Restaurando CommerceOSOverview.tsx...")

    shutil.copy2(commerce_backup, COMMERCE)

    if css_backup is not None:
        shutil.copy2(css_backup, CSS)

    print("✓ Archivos restaurados.")
    sys.exit(1)

# ---------------------------------------------------------------------
# BUILD
# ---------------------------------------------------------------------

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
    print("❌ npm run build excedió los 180 segundos.")
    print("↩ Restaurando cambios...")
    shutil.copy2(commerce_backup, COMMERCE)

    if css_backup is not None:
        shutil.copy2(css_backup, CSS)

    print("✓ Commerce OS restaurado.")
    sys.exit(1)

except FileNotFoundError:
    print("❌ npm no está disponible en PATH.")
    print("↩ Restaurando cambios...")
    shutil.copy2(commerce_backup, COMMERCE)

    if css_backup is not None:
        shutil.copy2(css_backup, CSS)

    print("✓ Commerce OS restaurado.")
    sys.exit(1)

print(result.stdout)

if result.returncode != 0:
    print(result.stderr)

    print()
    print("=" * 82)
    print("❌ BUILD FALLÓ")
    print("=" * 82)

    print("↩ Restaurando únicamente los cambios de esta ejecución...")

    shutil.copy2(commerce_backup, COMMERCE)

    if css_backup is not None:
        shutil.copy2(css_backup, CSS)

    print("✓ CommerceOSOverview.tsx restaurado.")
    print("✓ CSS restaurado.")
    print("✓ App.tsx no fue modificado.")
    print()
    print(f"✓ Backup Commerce OS: {commerce_backup.name}")

    if css_backup is not None:
        print(f"✓ Backup CSS: {css_backup.name}")

    sys.exit(result.returncode)

# ---------------------------------------------------------------------
# RESULT
# ---------------------------------------------------------------------

print()
print("=" * 82)
print("COMMERCE OS VISUAL REFINEMENT INSTALADO")
print("=" * 82)

print()
print("✓ Premium Dark profundizado")
print("✓ Electric Violet reforzado")
print("✓ Neon Cyan reforzado")
print("✓ Magenta Pulse como energía secundaria")
print("✓ Brand Gradient refinado")
print("✓ Glass / layered surfaces")
print("✓ Ambient lighting")
print("✓ Contraste de texto mejorado")
print("✓ Cards con profundidad")
print("✓ Hover states")
print("✓ Active states")
print("✓ Focus states")
print("✓ Inputs refinados")
print("✓ Scrollbar premium")
print("✓ Selección visual")
print("✓ Reduced motion")
print()
print("ARQUITECTURA CONSERVADA")
print("────────────────────────────────────────────────────────────")
print("Commerce OS")
print("   └── Store Builder → herramienta para tiendas virtuales")
print()
print("Web Builder permanece como ecosistema independiente.")
print()
print("IDENTIDAD FUTURA")
print("────────────────────────────────────────────────────────────")
print("Los tokens cromáticos futuros quedan preparados.")
print("No se crean personajes.")
print("No se crean NFT.")
print("No se renderizan dragones.")
print()
print("✓ La mejora actual pertenece exclusivamente a Commerce OS.")
print()
print(f"✓ Backup Commerce OS: {commerce_backup.name}")

if css_backup is not None:
    print(f"✓ Backup CSS: {css_backup.name}")

print()
print("Para ejecutar:")
print("npm run dev")
print()
print("=" * 82)
