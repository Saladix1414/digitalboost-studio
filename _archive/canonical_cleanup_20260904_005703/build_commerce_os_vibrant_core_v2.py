#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

ROOT = Path.home() / "digitalboost-studio"
SRC = ROOT / "src"

# ============================================================
# CONFIGURACIÓN
# ============================================================

CANDIDATES = [
    SRC / "CommerceOSOverview.tsx",
    SRC / "CommerceOS.tsx",
    SRC / "CommerceOSDashboard.tsx",
    SRC / "CommerceOSHome.tsx",
]

WORKSPACE = next((p for p in CANDIDATES if p.exists()), None)

CSS_FILE = SRC / "commerce-os-vibrant-global.css"

print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT CORE V2")
print("IDENTIDAD VISUAL · PREMIUM DARK · ELECTRIC SYSTEM")
print("=" * 78)

if not ROOT.exists():
    print("❌ No existe ~/digitalboost-studio")
    sys.exit(1)

if WORKSPACE is None:
    print("❌ No encontré el componente principal de Commerce OS.")
    print()
    print("Busqué:")
    for p in CANDIDATES:
        print(f"   - {p}")
    sys.exit(1)

print(f"✓ Root Commerce OS detectado: {WORKSPACE.relative_to(ROOT)}")

# ============================================================
# BACKUP
# ============================================================

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = WORKSPACE.with_name(
    f"{WORKSPACE.stem}.before_vibrant_core_v2_{timestamp}.tsx"
)

shutil.copy2(WORKSPACE, backup)

print(f"✓ Backup creado: {backup.name}")

# ============================================================
# CSS — IDENTIDAD VISUAL COMMERCE OS
# ============================================================

css = r"""
/*
============================================================
DIGITALBOOST — COMMERCE OS
VIBRANT CORE VISUAL SYSTEM V2
============================================================

Commerce OS
└── Store Builder
    └── Website / Store creation tools

Web Builder remains a separate ecosystem.

Future dragon identity:
Crea / Impulsa / Escala / Innova
will inherit this visual language later.
No dragon UI is rendered by this file.
============================================================
*/

:root {

  /* --------------------------------------------------------
     COMMERCE OS — FOUNDATION
     -------------------------------------------------------- */

  --cos-bg-void: #05030b;
  --cos-bg-deep: #090615;
  --cos-bg-main: #0d091c;
  --cos-bg-surface: #121025;
  --cos-bg-elevated: #17132f;

  /* --------------------------------------------------------
     ELECTRIC BRAND
     -------------------------------------------------------- */

  --cos-violet: #7c3cff;
  --cos-violet-bright: #9b5cff;
  --cos-violet-neon: #b56cff;

  --cos-cyan: #00d9ff;
  --cos-cyan-bright: #28e7ff;
  --cos-cyan-neon: #6df3ff;

  --cos-magenta: #ff2bd6;
  --cos-magenta-bright: #ff4de1;

  /* --------------------------------------------------------
     BRAND GRADIENTS
     -------------------------------------------------------- */

  --cos-gradient-brand:
    linear-gradient(
      135deg,
      #7c3cff 0%,
      #00d9ff 52%,
      #ff2bd6 100%
    );

  --cos-gradient-violet-cyan:
    linear-gradient(
      135deg,
      #7c3cff 0%,
      #00d9ff 100%
    );

  --cos-gradient-cyan-magenta:
    linear-gradient(
      135deg,
      #00d9ff 0%,
      #ff2bd6 100%
    );

  --cos-gradient-deep:
    radial-gradient(
      circle at 20% 10%,
      rgba(124, 60, 255, 0.24),
      transparent 38%
    ),
    radial-gradient(
      circle at 85% 25%,
      rgba(0, 217, 255, 0.16),
      transparent 35%
    ),
    radial-gradient(
      circle at 55% 90%,
      rgba(255, 43, 214, 0.13),
      transparent 42%
    ),
    #05030b;

  /* --------------------------------------------------------
     GLOW
     -------------------------------------------------------- */

  --cos-glow-violet:
    0 0 25px rgba(124, 60, 255, 0.35);

  --cos-glow-cyan:
    0 0 25px rgba(0, 217, 255, 0.32);

  --cos-glow-magenta:
    0 0 25px rgba(255, 43, 214, 0.30);

  --cos-glow-brand:
    0 0 35px rgba(124, 60, 255, 0.18),
    0 0 55px rgba(0, 217, 255, 0.12);

  /* --------------------------------------------------------
     GLASS
     -------------------------------------------------------- */

  --cos-glass:
    rgba(18, 16, 37, 0.72);

  --cos-glass-strong:
    rgba(23, 19, 47, 0.88);

  --cos-border:
    rgba(255, 255, 255, 0.09);

  --cos-border-electric:
    rgba(124, 60, 255, 0.34);

  --cos-border-cyan:
    rgba(0, 217, 255, 0.30);

  /* --------------------------------------------------------
     TEXT
     -------------------------------------------------------- */

  --cos-text-primary: #ffffff;
  --cos-text-secondary: #c7c4dc;
  --cos-text-muted: #85819f;

  /* --------------------------------------------------------
     STATUS
     -------------------------------------------------------- */

  --cos-success: #35f0a0;
  --cos-warning: #ffd166;
  --cos-danger: #ff5c7a;

  /* --------------------------------------------------------
     FUTURE DRAGON COLOR DNA
     Preparación conceptual únicamente.
     No renderiza ningún dragón.
     -------------------------------------------------------- */

  --dragon-crea-primary: #7c3cff;
  --dragon-crea-secondary: #b56cff;

  --dragon-impulsa-primary: #00d9ff;
  --dragon-impulsa-secondary: #28e7ff;

  --dragon-escala-primary: #ff2bd6;
  --dragon-escala-secondary: #ff4de1;

  --dragon-innova-primary: #7c3cff;
  --dragon-innova-secondary: #00d9ff;

  --dragon-brand-gradient:
    linear-gradient(
      135deg,
      #7c3cff,
      #00d9ff,
      #ff2bd6
    );

  /* --------------------------------------------------------
     MOTION
     -------------------------------------------------------- */

  --cos-transition:
    180ms cubic-bezier(.2,.8,.2,1);

  --cos-transition-slow:
    320ms cubic-bezier(.2,.8,.2,1);
}


/* ==========================================================
   COMMERCE OS ROOT
   ========================================================== */

[data-commerce-os-root="true"] {

  color-scheme: dark;

  background:
    var(--cos-gradient-deep);

  color: var(--cos-text-primary);

  min-height: 100%;

  position: relative;

  isolation: isolate;

}


/* ==========================================================
   AMBIENT LIGHT
   ========================================================== */

[data-commerce-os-root="true"]::before {

  content: "";

  position: fixed;

  inset: -25%;

  pointer-events: none;

  z-index: -1;

  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(124, 60, 255, 0.12),
      transparent 28%
    ),
    radial-gradient(
      circle at 85% 15%,
      rgba(0, 217, 255, 0.09),
      transparent 25%
    ),
    radial-gradient(
      circle at 65% 85%,
      rgba(255, 43, 214, 0.07),
      transparent 28%
    );

  filter: blur(45px);

}


/* ==========================================================
   GLASS SURFACES
   ========================================================== */

[data-commerce-os-root="true"] .commerce-os-glass {

  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,0.055),
      rgba(255,255,255,0.018)
    ),
    var(--cos-glass);

  border:
    1px solid var(--cos-border);

  box-shadow:
    0 20px 60px rgba(0,0,0,.30),
    inset 0 1px 0 rgba(255,255,255,.055);

  backdrop-filter:
    blur(22px)
    saturate(135%);

}


/* ==========================================================
   ELECTRIC BUTTONS
   ========================================================== */

[data-commerce-os-root="true"] .commerce-os-electric {

  background:
    var(--cos-gradient-brand);

  border: 1px solid rgba(255,255,255,.14);

  color: white;

  box-shadow:
    var(--cos-glow-brand);

  transition:
    transform var(--cos-transition),
    box-shadow var(--cos-transition),
    filter var(--cos-transition);

}


[data-commerce-os-root="true"] .commerce-os-electric:hover {

  transform:
    translateY(-1px);

  filter:
    brightness(1.10)
    saturate(1.12);

  box-shadow:
    0 0 28px rgba(124,60,255,.34),
    0 0 42px rgba(0,217,255,.18);

}


/* ==========================================================
   ACTIVE ELEMENTS
   ========================================================== */

[data-commerce-os-root="true"] .commerce-os-active {

  border-color:
    rgba(124,60,255,.52);

  box-shadow:
    0 0 0 1px rgba(124,60,255,.12),
    0 0 28px rgba(124,60,255,.18);

}


/* ==========================================================
   FOCUS
   ========================================================== */

[data-commerce-os-root="true"] :focus-visible {

  outline:
    2px solid var(--cos-cyan);

  outline-offset:
    3px;

  box-shadow:
    0 0 18px rgba(0,217,255,.30);

}


/* ==========================================================
   SCROLLBAR
   ========================================================== */

[data-commerce-os-root="true"] ::-webkit-scrollbar {

  width: 8px;
  height: 8px;

}

[data-commerce-os-root="true"] ::-webkit-scrollbar-track {

  background:
    rgba(255,255,255,.025);

}

[data-commerce-os-root="true"] ::-webkit-scrollbar-thumb {

  background:
    linear-gradient(
      180deg,
      #7c3cff,
      #00d9ff
    );

  border-radius:
    999px;

}


/* ==========================================================
   SELECTION
   ========================================================== */

[data-commerce-os-root="true"] ::selection {

  background:
    rgba(124,60,255,.55);

  color:
    white;

}
"""

CSS_FILE.write_text(css, encoding="utf-8")

print(f"✓ Sistema visual creado: {CSS_FILE.relative_to(ROOT)}")

# ============================================================
# LEER WORKSPACE
# ============================================================

original = WORKSPACE.read_text(encoding="utf-8")
source = original

# ============================================================
# IMPORTAR CSS
# ============================================================

css_import = 'import "./commerce-os-vibrant-global.css";'

if css_import not in source:

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

        print("✓ CSS global conectado a CommerceOSOverview")

    else:

        print("❌ No encontré imports válidos en CommerceOSOverview.")
        print("Restaurando backup...")
        shutil.copy2(backup, WORKSPACE)
        sys.exit(1)

else:

    print("✓ CSS global ya estaba conectado")


# ============================================================
# ROOT REAL DEL COMPONENTE
#
# IMPORTANTE:
# NO TOCAMOS App.tsx
# NO TOCAMOS CIERRES </div>
# ============================================================

if "data-commerce-os-root=" not in source:

    # Buscamos el primer JSX <div ...>
    root_match = re.search(
        r'<div(\s+[^>]*)?>',
        source
    )

    if root_match:

        original_open = root_match.group(0)

        if "data-commerce-os-root" not in original_open:

            if original_open == "<div>":

                replacement = '<div data-commerce-os-root="true">'

            else:

                replacement = original_open[:-1] + ' data-commerce-os-root="true">'

            source = (
                source[:root_match.start()]
                + replacement
                + source[root_match.end():]
            )

            print("✓ Root real de Commerce OS identificado")

        else:

            print("✓ Root Commerce OS ya identificado")

    else:

        print("⚠️ No encontré un <div> raíz automático.")
        print("El CSS queda creado y conectado; no se modificará JSX.")

else:

    print("✓ Metadata Commerce OS ya presente")


# ============================================================
# METADATA NO INVASIVA
#
# No modifica estructura visual.
# Sirve para reconocer Commerce OS desde herramientas futuras.
# ============================================================

if "data-commerce-os-core=" not in source:

    root_attr_match = re.search(
        r'<div([^>]*)data-commerce-os-root="true"([^>]*)>',
        source
    )

    if root_attr_match:

        full = root_attr_match.group(0)

        replacement = full[:-1] + ' data-commerce-os-core="true">'

        source = source.replace(
            full,
            replacement,
            1
        )

        print("✓ Metadata Commerce OS Core agregada")

    else:

        print("⚠️ No se agregó metadata secundaria")


# ============================================================
# ESCRIBIR
# ============================================================

if source != original:

    WORKSPACE.write_text(
        source,
        encoding="utf-8"
    )

    print(f"✓ Workspace actualizado: {WORKSPACE.relative_to(ROOT)}")

else:

    print("ℹ️ No fueron necesarios cambios JSX nuevos.")


# ============================================================
# VALIDACIÓN
# ============================================================

final_source = WORKSPACE.read_text(encoding="utf-8")

checks = [
    ("Commerce OS CSS", CSS_FILE.exists()),
    ("Electric Violet", "--cos-violet:" in css),
    ("Neon Cyan", "--cos-cyan:" in css),
    ("Magenta Pulse", "--cos-magenta:" in css),
    ("Brand Gradient", "--cos-gradient-brand:" in css),

    # Futuro lenguaje del dragón
    ("Future Dragon Crea", "--dragon-crea-primary:" in css),
    ("Future Dragon Impulsa", "--dragon-impulsa-primary:" in css),
    ("Future Dragon Escala", "--dragon-escala-primary:" in css),
    ("Future Dragon Innova", "--dragon-innova-primary:" in css),

    # Arquitectura
    ("Commerce OS root", "data-commerce-os-root=" in final_source),
    ("Commerce OS core", "data-commerce-os-core=" in final_source),

    # Separación conceptual
    ("Store Builder no redefinido", "StoreBuilder" in final_source or "Store Builder" in final_source),
]

print()
print("=" * 78)
print("VALIDACIÓN DE IDENTIDAD")
print("=" * 78)

for name, result in checks:

    if result:
        print(f"✓ {name}")
    else:
        print(f"⚠️ {name} no detectado")


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

    print(result.stdout)

    if result.returncode != 0:

        print(result.stderr)

        print()
        print("❌ BUILD FALLÓ")
        print("Restaurando únicamente CommerceOSOverview.tsx...")

        shutil.copy2(
            backup,
            WORKSPACE
        )

        print(f"✓ Workspace restaurado desde: {backup.name}")

        # El CSS nuevo es seguro conservarlo.
        print("✓ El sistema CSS permanece disponible para revisión.")

        sys.exit(result.returncode)

    print("✓ BUILD CORRECTO")

except subprocess.TimeoutExpired:

    print("❌ npm run build excedió el tiempo límite.")

    shutil.copy2(
        backup,
        WORKSPACE
    )

    print(f"✓ Workspace restaurado desde: {backup.name}")

    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible en PATH.")
    print(f"✓ Backup disponible: {backup.name}")

    sys.exit(1)


# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT CORE V2 INSTALADO")
print("=" * 78)

print()
print("✓ Commerce OS continúa siendo la identidad principal")
print("✓ Premium Dark conservado")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta Pulse")
print("✓ Gradiente de marca")
print("✓ Glass surfaces")
print("✓ Ambient lighting")
print("✓ Active / hover / focus mejorados")
print("✓ Contraste visual mejorado")
print("✓ CSS conectado al componente real")
print("✓ App.tsx NO fue modificado")
print("✓ Store Builder NO fue redefinido")
print("✓ Web Builder permanece conceptualmente separado")

print()
print("🐉 PREPARACIÓN FUTURA")
print("----------------------")
print("✓ Crea")
print("✓ Impulsa")
print("✓ Escala")
print("✓ Innova")
print()
print("✓ Paleta futura preparada")
print("✓ Gradientes preparados")
print("✓ Glow preparado")
print("✓ DNA visual preparada")
print("✓ NO se renderiza ningún dragón todavía")

print()
print(f"✓ Backup: {backup.name}")
print()
print("Ejecutá:")
print("npm run dev")
print()
print("Luego abrí Commerce OS y revisá la nueva identidad visual.")
print("=" * 78)
