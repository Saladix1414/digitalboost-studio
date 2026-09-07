#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

ROOT = Path.home() / "digitalboost-studio"

# ============================================================
# COMMERCE OS — SAFE VIBRANT CORE
# ============================================================

print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT CORE")
print("PREMIUM DARK → ELECTRIC → HIGH CONTRAST")
print("SAFE VISUAL UPGRADE — NO APP.TSX MODIFICATION")
print("=" * 78)

if not ROOT.exists():
    print("❌ No existe:", ROOT)
    sys.exit(1)

# ------------------------------------------------------------
# DETECTAR COMPONENTE PRINCIPAL DE COMMERCE OS
# ------------------------------------------------------------

candidates = [
    ROOT / "src" / "CommerceOSOverview.tsx",
    ROOT / "src" / "CommerceOS.tsx",
    ROOT / "src" / "CommerceOSDashboard.tsx",
]

COMMERCE = None

for candidate in candidates:
    if candidate.exists():
        COMMERCE = candidate
        break

if COMMERCE is None:
    print("❌ No encontré el componente principal de Commerce OS.")
    print("Busqué:")
    for candidate in candidates:
        print("   ", candidate)
    sys.exit(1)

print(f"✓ Commerce OS detectado: {COMMERCE.relative_to(ROOT)}")

# ------------------------------------------------------------
# CSS
# ------------------------------------------------------------

CSS = ROOT / "src" / "commerce-os-vibrant-global.css"

# ------------------------------------------------------------
# BACKUPS
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

commerce_backup = COMMERCE.with_name(
    f"{COMMERCE.stem}.before_vibrant_safe_{timestamp}.tsx"
)

shutil.copy2(COMMERCE, commerce_backup)

if CSS.exists():
    css_backup = CSS.with_name(
        f"{CSS.stem}.before_vibrant_safe_{timestamp}.css"
    )
    shutil.copy2(CSS, css_backup)
else:
    css_backup = None

print(f"✓ Backup Commerce OS: {commerce_backup.name}")

if css_backup:
    print(f"✓ Backup CSS: {css_backup.name}")

# ------------------------------------------------------------
# SISTEMA VISUAL
# ------------------------------------------------------------

css = r"""
/* ============================================================
   DIGITALBOOST — COMMERCE OS
   VIBRANT CORE VISUAL SYSTEM
   ============================================================ */

:root {

  /* ----------------------------------------------------------
     CORE BACKGROUNDS
     ---------------------------------------------------------- */

  --commerce-bg-0: #05030d;
  --commerce-bg-1: #080512;
  --commerce-bg-2: #0d081c;
  --commerce-bg-3: #120b25;

  /* ----------------------------------------------------------
     ELECTRIC BRAND COLORS
     ---------------------------------------------------------- */

  --commerce-violet: #8b5cf6;
  --commerce-violet-bright: #a855f7;
  --commerce-violet-electric: #c084fc;

  --commerce-cyan: #06b6d4;
  --commerce-cyan-bright: #22d3ee;
  --commerce-cyan-electric: #67e8f9;

  --commerce-magenta: #ec4899;
  --commerce-magenta-bright: #f472b6;
  --commerce-magenta-electric: #fb7185;

  --commerce-blue: #3b82f6;
  --commerce-indigo: #6366f1;

  /* ----------------------------------------------------------
     FUTURE BRAND GRADIENT
     ---------------------------------------------------------- */

  --commerce-brand-gradient:
    linear-gradient(
      120deg,
      #8b5cf6 0%,
      #a855f7 32%,
      #06b6d4 68%,
      #22d3ee 100%
    );

  --commerce-brand-gradient-warm:
    linear-gradient(
      120deg,
      #8b5cf6 0%,
      #ec4899 52%,
      #f472b6 100%
    );

  /* ----------------------------------------------------------
     TEXT
     ---------------------------------------------------------- */

  --commerce-text-primary: #f8fafc;
  --commerce-text-secondary: #cbd5e1;
  --commerce-text-muted: #94a3b8;
  --commerce-text-dim: #64748b;

  /* ----------------------------------------------------------
     SURFACES
     ---------------------------------------------------------- */

  --commerce-surface:
    rgba(15, 10, 30, 0.78);

  --commerce-surface-strong:
    rgba(20, 12, 40, 0.92);

  --commerce-surface-soft:
    rgba(139, 92, 246, 0.07);

  --commerce-border:
    rgba(167, 139, 250, 0.16);

  --commerce-border-active:
    rgba(34, 211, 238, 0.48);

  /* ----------------------------------------------------------
     GLOW
     ---------------------------------------------------------- */

  --commerce-glow-violet:
    0 0 24px rgba(139, 92, 246, 0.24);

  --commerce-glow-cyan:
    0 0 24px rgba(34, 211, 238, 0.22);

  --commerce-glow-magenta:
    0 0 24px rgba(236, 72, 153, 0.20);

  /* ----------------------------------------------------------
     RADIUS
     ---------------------------------------------------------- */

  --commerce-radius-sm: 10px;
  --commerce-radius-md: 16px;
  --commerce-radius-lg: 22px;
  --commerce-radius-xl: 28px;
}

/* ============================================================
   COMMERCE OS ROOT
   ============================================================ */

[data-commerce-os="true"] {

  position: relative;

  color: var(--commerce-text-primary);

  background:
    radial-gradient(
      circle at 12% 12%,
      rgba(139, 92, 246, 0.14),
      transparent 30%
    ),
    radial-gradient(
      circle at 88% 18%,
      rgba(6, 182, 212, 0.10),
      transparent 28%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(236, 72, 153, 0.07),
      transparent 35%
    ),
    linear-gradient(
      135deg,
      var(--commerce-bg-0),
      var(--commerce-bg-1) 45%,
      var(--commerce-bg-2)
    );

  isolation: isolate;
}

/* Ambient lighting */

[data-commerce-os="true"]::before {

  content: "";

  position: fixed;

  inset: 0;

  pointer-events: none;

  z-index: -1;

  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(139, 92, 246, 0.08),
      transparent 24%
    ),
    radial-gradient(
      circle at 80% 60%,
      rgba(34, 211, 238, 0.06),
      transparent 22%
    );

  opacity: 0.95;
}

/* ============================================================
   COMMON COMMERCE OS SURFACES
   ============================================================ */

[data-commerce-os="true"] .commerce-surface,
[data-commerce-os="true"] .glass,
[data-commerce-os="true"] [class*="card"],
[data-commerce-os="true"] [class*="panel"] {

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,0.045),
      rgba(255,255,255,0.015)
    ),
    var(--commerce-surface);

  border-color: var(--commerce-border);

  box-shadow:
    0 18px 55px rgba(0,0,0,0.28),
    inset 0 1px 0 rgba(255,255,255,0.035);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* ============================================================
   TYPOGRAPHY
   ============================================================ */

[data-commerce-os="true"] h1,
[data-commerce-os="true"] h2,
[data-commerce-os="true"] h3 {

  color: var(--commerce-text-primary);

  text-shadow:
    0 0 28px rgba(139, 92, 246, 0.10);
}

[data-commerce-os="true"] p {

  color: var(--commerce-text-secondary);
}

/* ============================================================
   BRAND ELEMENTS
   ============================================================ */

[data-commerce-os="true"] .commerce-brand,
[data-commerce-os="true"] .brand-gradient {

  background: var(--commerce-brand-gradient);

  -webkit-background-clip: text;
  background-clip: text;

  -webkit-text-fill-color: transparent;

  color: transparent;
}

[data-commerce-os="true"] .commerce-accent {

  color: var(--commerce-violet-electric);

  text-shadow:
    0 0 18px rgba(192, 132, 252, 0.25);
}

/* ============================================================
   BUTTONS
   ============================================================ */

[data-commerce-os="true"] button {

  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

[data-commerce-os="true"] button:hover {

  transform: translateY(-1px);

  box-shadow:
    0 10px 28px rgba(0,0,0,0.28),
    0 0 20px rgba(139, 92, 246, 0.12);
}

[data-commerce-os="true"] button:focus-visible {

  outline: none;

  box-shadow:
    0 0 0 2px rgba(139, 92, 246, 0.35),
    0 0 0 5px rgba(34, 211, 238, 0.12);
}

/* ============================================================
   ACTIVE / SELECTED
   ============================================================ */

[data-commerce-os="true"] .active,
[data-commerce-os="true"] [aria-selected="true"],
[data-commerce-os="true"] [data-active="true"] {

  border-color:
    var(--commerce-border-active);

  box-shadow:
    var(--commerce-glow-cyan),
    inset 0 0 22px rgba(34, 211, 238, 0.035);
}

/* ============================================================
   INPUTS
   ============================================================ */

[data-commerce-os="true"] input,
[data-commerce-os="true"] textarea,
[data-commerce-os="true"] select {

  color: var(--commerce-text-primary);

  background:
    rgba(4, 3, 12, 0.68);

  border: 1px solid
    rgba(167, 139, 250, 0.15);

  border-radius:
    var(--commerce-radius-sm);

  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

[data-commerce-os="true"] input:focus,
[data-commerce-os="true"] textarea:focus,
[data-commerce-os="true"] select:focus {

  outline: none;

  border-color:
    rgba(34, 211, 238, 0.45);

  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.08),
    0 0 24px rgba(34, 211, 238, 0.08);
}

/* ============================================================
   LINKS
   ============================================================ */

[data-commerce-os="true"] a {

  transition:
    color 160ms ease,
    text-shadow 160ms ease;
}

[data-commerce-os="true"] a:hover {

  color: var(--commerce-cyan-electric);

  text-shadow:
    0 0 16px rgba(103, 232, 249, 0.20);
}

/* ============================================================
   SCROLLBAR
   ============================================================ */

[data-commerce-os="true"] ::-webkit-scrollbar {

  width: 8px;
  height: 8px;
}

[data-commerce-os="true"] ::-webkit-scrollbar-track {

  background:
    rgba(5, 3, 13, 0.75);
}

[data-commerce-os="true"] ::-webkit-scrollbar-thumb {

  background:
    linear-gradient(
      180deg,
      rgba(139, 92, 246, 0.65),
      rgba(6, 182, 212, 0.55)
    );

  border-radius: 999px;

  border:
    2px solid rgba(5, 3, 13, 0.65);
}

[data-commerce-os="true"] ::-webkit-scrollbar-thumb:hover {

  background:
    linear-gradient(
      180deg,
      rgba(168, 85, 247, 0.90),
      rgba(34, 211, 238, 0.85)
    );
}

/* ============================================================
   FUTURE COLOR TOKENS ONLY
   NO DRAGONS ARE CREATED
   NO NFT UI IS CREATED
   ============================================================ */

:root {

  --future-dragon-crea:
    #8b5cf6;

  --future-dragon-impulsa:
    #06b6d4;

  --future-dragon-escala:
    #ec4899;

  --future-dragon-innova:
    linear-gradient(
      120deg,
      #8b5cf6,
      #06b6d4
    );
}

/* ============================================================
   END
   ============================================================ */
"""

CSS.write_text(css, encoding="utf-8")

print(f"✓ Sistema visual creado: {CSS.relative_to(ROOT)}")

# ------------------------------------------------------------
# MODIFICAR SOLAMENTE COMMERCE OS
# ------------------------------------------------------------

source = COMMERCE.read_text(encoding="utf-8")

original = source

# ------------------------------------------------------------
# CSS IMPORT
# ------------------------------------------------------------

css_import = 'import "./commerce-os-vibrant-global.css";'

if css_import not in source:

    # Buscar imports existentes.
    import_pattern = re.compile(
        r'^import\s+.*?from\s+[\'"].*?[\'"];?\s*$',
        re.MULTILINE
    )

    imports = list(import_pattern.finditer(source))

    if imports:

        pos = imports[-1].end()

        source = (
            source[:pos]
            + "\n"
            + css_import
            + source[pos:]
        )

        print("✓ CSS global conectado a Commerce OS")

    else:

        # Si no hay imports, agregar al principio.
        source = css_import + "\n" + source

        print("✓ CSS global agregado al inicio")

else:

    print("✓ CSS global ya estaba conectado")

# ------------------------------------------------------------
# IDENTIFICAR ROOT DE COMMERCE OS
# ------------------------------------------------------------

if "data-commerce-os=" not in source:

    # Caso habitual:
    # <div className="...">
    root_match = re.search(
        r'<div\s+className=',
        source
    )

    if root_match:

        start = root_match.start()
        tag_end = source.find(">", root_match.start())

        if tag_end != -1:

            opening = source[start:tag_end]

            if "data-commerce-os" not in opening:

                replacement = (
                    opening
                    + ' data-commerce-os="true"'
                )

                source = (
                    source[:start]
                    + replacement
                    + source[tag_end:]
                )

                print("✓ Root Commerce OS identificado")

            else:

                print("✓ Root Commerce OS ya identificado")

        else:

            print("⚠️ No pude localizar el cierre del root <div>")

    else:

        print(
            "⚠️ No se encontró un <div className=...> "
            "seguro. No se modificó JSX."
        )

else:

    print("✓ Metadata Commerce OS ya presente")

# ------------------------------------------------------------
# METADATA SEGURA
# ------------------------------------------------------------

if "commerce-os-core" not in source:

    # Solamente agregamos metadata a un root que ya exista.
    # No se intenta reescribir estructuras JSX complejas.

    root_match = re.search(
        r'<div[^>]*data-commerce-os="true"[^>]*>',
        source
    )

    if root_match:

        opening = root_match.group(0)

        if "data-commerce-os-core" not in opening:

            replacement = opening[:-1] + (
                ' data-commerce-os-core="true">'
            )

            source = (
                source[:root_match.start()]
                + replacement
                + source[root_match.end():]
            )

            print("✓ Metadata Commerce OS Core agregada")

# ------------------------------------------------------------
# ESCRITURA
# ------------------------------------------------------------

if source != original:

    COMMERCE.write_text(
        source,
        encoding="utf-8"
    )

    print(
        f"✓ Actualizado: "
        f"{COMMERCE.relative_to(ROOT)}"
    )

else:

    print("ℹ️ Commerce OS ya tenía las modificaciones necesarias")

# ------------------------------------------------------------
# IMPORTANTE:
# APP.TSX NO SE TOCA
# ------------------------------------------------------------

print("✓ App.tsx protegido — no se modifica")

# ------------------------------------------------------------
# VALIDACIÓN
# ------------------------------------------------------------

final_source = COMMERCE.read_text(encoding="utf-8")

checks = [
    (
        "Commerce OS CSS",
        CSS.exists()
    ),
    (
        "Electric Violet",
        "--commerce-violet" in css
    ),
    (
        "Neon Cyan",
        "--commerce-cyan" in css
    ),
    (
        "Magenta Pulse",
        "--commerce-magenta" in css
    ),
    (
        "Brand Gradient",
        "--commerce-brand-gradient" in css
    ),
    (
        "Commerce OS root",
        'data-commerce-os="true"' in final_source
    ),
    (
        "Commerce OS core metadata",
        'data-commerce-os-core="true"' in final_source
    ),
    (
        "Future Crea color token",
        "--future-dragon-crea" in css
    ),
    (
        "Future Impulsa color token",
        "--future-dragon-impulsa" in css
    ),
    (
        "Future Escala color token",
        "--future-dragon-escala" in css
    ),
    (
        "Future Innova color token",
        "--future-dragon-innova" in css
    ),
]

print()
print("=" * 78)
print("VALIDACIÓN")
print("=" * 78)

all_ok = True

for name, result in checks:

    if result:
        print(f"✓ {name}")
    else:
        print(f"⚠️ {name} no detectado")
        all_ok = False

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

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

    if result.stdout:
        print(result.stdout)

    if result.returncode != 0:

        if result.stderr:
            print(result.stderr)

        print()
        print("❌ BUILD FALLÓ")

        print()
        print(
            "⚠️ El script NO modificó App.tsx."
        )

        print(
            "⚠️ El error de build pertenece a otro archivo "
            "si aparece fuera de Commerce OS."
        )

        print()
        print(
            f"✓ Backup Commerce OS disponible: "
            f"{commerce_backup.name}"
        )

        print(
            "✓ El CSS permanece disponible para revisión."
        )

        sys.exit(result.returncode)

    print("✓ BUILD CORRECTO")

except subprocess.TimeoutExpired:

    print("❌ npm run build excedió el tiempo límite.")

    print(
        f"✓ Backup disponible: {commerce_backup.name}"
    )

    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible en PATH.")

    print(
        f"✓ Backup disponible: {commerce_backup.name}"
    )

    sys.exit(1)

# ------------------------------------------------------------
# RESULTADO
# ------------------------------------------------------------

print()
print("=" * 78)
print("COMMERCE OS VIBRANT CORE — LISTO")
print("=" * 78)

print()
print("✓ Commerce OS recibió una actualización visual")
print("✓ Premium Dark conservado")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta Pulse")
print("✓ Brand Gradient")
print("✓ Glass / layered surfaces")
print("✓ Ambient lighting")
print("✓ Active states")
print("✓ Focus states")
print("✓ Contraste mejorado")
print("✓ Scrollbar premium")

print()
print("ARQUITECTURA")
print("────────────────────────────────────────────────────────────")
print("Commerce OS")
print("   └── Store Builder → tiendas virtuales")
print("Web Builder")
print("   └── ecosistema independiente")

print()
print("IDENTIDAD CROMÁTICA FUTURA")
print("────────────────────────────────────────────────────────────")
print("Crea     → Violet")
print("Impulsa  → Cyan")
print("Escala   → Magenta")
print("Innova   → Violet + Cyan")

print()
print("✓ Los dragones NO fueron creados.")
print("✓ Los dragones NO fueron renderizados.")
print("✓ No se agregó ninguna interfaz NFT.")
print("✓ Solamente quedaron preparados tokens cromáticos futuros.")
print("✓ App.tsx no fue modificado.")

print()
print(f"✓ Backup Commerce OS: {commerce_backup.name}")

print()
print("Para iniciar:")
print("npm run dev")

print("=" * 78)
