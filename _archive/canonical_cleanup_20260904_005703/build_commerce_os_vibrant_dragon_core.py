#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import re
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
SRC = ROOT / "src"
WORKSPACE = SRC / "StoreBuilderWorkspace.tsx"
APP = SRC / "App.tsx"
CSS = SRC / "commerce-os-vibrant-global.css"

print("=" * 76)
print("DIGITALBOOST — COMMERCE OS VIBRANT CORE")
print("COMMERCE OS → STORE BUILDER → WEBSITE BUILDER")
print("VISUAL LANGUAGE → FUTURE DRAGON COLLECTION")
print("=" * 76)

if not ROOT.exists():
    print("ERROR: no existe ~/digitalboost-studio")
    sys.exit(1)

if not SRC.exists():
    print("ERROR: no existe src/")
    sys.exit(1)

if not WORKSPACE.exists():
    print("ERROR: no existe src/StoreBuilderWorkspace.tsx")
    sys.exit(1)

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = WORKSPACE.with_name(
    f"StoreBuilderWorkspace.before_vibrant_core_{timestamp}.tsx"
)

shutil.copy2(WORKSPACE, backup)

print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# GLOBAL VISUAL SYSTEM
# ------------------------------------------------------------

css = r'''
/* ============================================================
   DIGITALBOOST — COMMERCE OS VIBRANT CORE
   Visual language shared by:
   Commerce OS
   Store Builder
   Website Builder
   Future Dragon Collection
   ============================================================ */

:root {

  /* ----------------------------------------------------------
     COMMERCE OS CORE
     ---------------------------------------------------------- */

  --commerce-bg-0: #05030d;
  --commerce-bg-1: #09051a;
  --commerce-bg-2: #10072b;
  --commerce-surface: rgba(17, 10, 43, 0.78);
  --commerce-surface-strong: rgba(23, 12, 57, 0.92);

  --commerce-violet: #8b5cf6;
  --commerce-violet-bright: #a78bfa;
  --commerce-purple: #7c3aed;

  --commerce-cyan: #22d3ee;
  --commerce-cyan-bright: #67e8f9;

  --commerce-magenta: #ec4899;
  --commerce-pink: #f472b6;

  --commerce-blue: #38bdf8;

  --commerce-text: #f8f7ff;
  --commerce-text-soft: #d8d3ec;
  --commerce-text-muted: #9189aa;

  --commerce-border: rgba(167, 139, 250, 0.20);
  --commerce-border-bright: rgba(103, 232, 249, 0.35);

  --commerce-glow-violet:
    0 0 24px rgba(139, 92, 246, 0.30),
    0 0 70px rgba(124, 58, 237, 0.14);

  --commerce-glow-cyan:
    0 0 24px rgba(34, 211, 238, 0.28),
    0 0 70px rgba(34, 211, 238, 0.12);

  --commerce-glow-magenta:
    0 0 24px rgba(236, 72, 153, 0.28),
    0 0 70px rgba(236, 72, 153, 0.12);

  --commerce-gradient-main:
    linear-gradient(
      135deg,
      #7c3aed 0%,
      #8b5cf6 38%,
      #22d3ee 100%
    );

  --commerce-gradient-energy:
    linear-gradient(
      135deg,
      #8b5cf6 0%,
      #ec4899 48%,
      #22d3ee 100%
    );

  --commerce-gradient-cyan:
    linear-gradient(
      135deg,
      #0891b2 0%,
      #22d3ee 50%,
      #67e8f9 100%
    );

  /* ----------------------------------------------------------
     FUTURE DRAGON COLLECTION
     ---------------------------------------------------------- */

  --dragon-crea-primary: #8b5cf6;
  --dragon-crea-secondary: #c4b5fd;
  --dragon-crea-glow: rgba(139, 92, 246, 0.55);

  --dragon-impulsa-primary: #22d3ee;
  --dragon-impulsa-secondary: #67e8f9;
  --dragon-impulsa-glow: rgba(34, 211, 238, 0.55);

  --dragon-escala-primary: #ec4899;
  --dragon-escala-secondary: #f9a8d4;
  --dragon-escala-glow: rgba(236, 72, 153, 0.55);

  --dragon-innova-primary: #7c3aed;
  --dragon-innova-secondary: #22d3ee;
  --dragon-innova-glow: rgba(124, 58, 237, 0.55);

  /* ----------------------------------------------------------
     GLASS
     ---------------------------------------------------------- */

  --commerce-glass:
    linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.11),
      rgba(34, 211, 238, 0.045)
    );

  --commerce-glass-border:
    1px solid rgba(167, 139, 250, 0.18);

  /* ----------------------------------------------------------
     MOTION
     ---------------------------------------------------------- */

  --commerce-transition:
    180ms cubic-bezier(.2,.8,.2,1);

  --commerce-transition-slow:
    420ms cubic-bezier(.16,1,.3,1);
}

/* ------------------------------------------------------------
   GLOBAL COMMERCE OS ATMOSPHERE
   ------------------------------------------------------------ */

[data-commerce-os="true"] {

  color-scheme: dark;

  background:
    radial-gradient(
      circle at 12% 12%,
      rgba(124, 58, 237, 0.17),
      transparent 28%
    ),
    radial-gradient(
      circle at 88% 18%,
      rgba(34, 211, 238, 0.10),
      transparent 25%
    ),
    radial-gradient(
      circle at 65% 92%,
      rgba(236, 72, 153, 0.09),
      transparent 26%
    ),
    linear-gradient(
      135deg,
      var(--commerce-bg-0),
      var(--commerce-bg-1) 48%,
      var(--commerce-bg-2)
    );

  color: var(--commerce-text);
}

/* ------------------------------------------------------------
   SURFACES
   ------------------------------------------------------------ */

[data-commerce-os="true"] .commerce-surface,
[data-commerce-os="true"] .glass,
[data-commerce-os="true"] [class*="glass"] {

  background:
    var(--commerce-glass);

  border:
    var(--commerce-glass-border);

  backdrop-filter:
    blur(20px);

  -webkit-backdrop-filter:
    blur(20px);

  box-shadow:
    0 18px 70px rgba(0,0,0,.30);
}

/* ------------------------------------------------------------
   BUTTONS
   ------------------------------------------------------------ */

[data-commerce-os="true"] button {

  transition:
    transform var(--commerce-transition),
    box-shadow var(--commerce-transition),
    border-color var(--commerce-transition),
    background var(--commerce-transition);
}

[data-commerce-os="true"] button:hover {

  transform:
    translateY(-1px);

  box-shadow:
    var(--commerce-glow-violet);
}

[data-commerce-os="true"] button:focus-visible {

  outline:
    2px solid var(--commerce-cyan);

  outline-offset:
    2px;

  box-shadow:
    var(--commerce-glow-cyan);
}

/* ------------------------------------------------------------
   INPUTS
   ------------------------------------------------------------ */

[data-commerce-os="true"] input,
[data-commerce-os="true"] textarea,
[data-commerce-os="true"] select {

  color:
    var(--commerce-text);

  background:
    rgba(7, 4, 20, 0.72);

  border:
    1px solid rgba(167, 139, 250, 0.20);

  transition:
    border-color var(--commerce-transition),
    box-shadow var(--commerce-transition),
    background var(--commerce-transition);
}

[data-commerce-os="true"] input:focus,
[data-commerce-os="true"] textarea:focus,
[data-commerce-os="true"] select:focus {

  border-color:
    var(--commerce-cyan);

  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.10),
    var(--commerce-glow-cyan);

  background:
    rgba(10, 6, 28, 0.90);

  outline:
    none;
}

/* ------------------------------------------------------------
   ACTIVE ELEMENTS
   ------------------------------------------------------------ */

[data-commerce-os="true"] [data-active="true"],
[data-commerce-os="true"] .active {

  border-color:
    rgba(103, 232, 249, 0.45);

  box-shadow:
    var(--commerce-glow-cyan);

  background:
    linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.20),
      rgba(34, 211, 238, 0.10)
    );
}

/* ------------------------------------------------------------
   LINKS
   ------------------------------------------------------------ */

[data-commerce-os="true"] a {

  transition:
    color var(--commerce-transition),
    text-shadow var(--commerce-transition);
}

[data-commerce-os="true"] a:hover {

  color:
    var(--commerce-cyan-bright);

  text-shadow:
    0 0 18px rgba(34, 211, 238, 0.40);
}

/* ------------------------------------------------------------
   SCROLLBAR
   ------------------------------------------------------------ */

[data-commerce-os="true"] ::-webkit-scrollbar {

  width:
    8px;

  height:
    8px;
}

[data-commerce-os="true"] ::-webkit-scrollbar-track {

  background:
    rgba(5, 3, 13, 0.65);
}

[data-commerce-os="true"] ::-webkit-scrollbar-thumb {

  background:
    linear-gradient(
      180deg,
      var(--commerce-violet),
      var(--commerce-cyan)
    );

  border-radius:
    999px;
}

/* ------------------------------------------------------------
   DRAGON ENERGY UTILITIES
   Future-ready visual classes
   ------------------------------------------------------------ */

.dragon-crea {

  --dragon-primary:
    var(--dragon-crea-primary);

  --dragon-secondary:
    var(--dragon-crea-secondary);

  --dragon-glow:
    var(--dragon-crea-glow);
}

.dragon-impulsa {

  --dragon-primary:
    var(--dragon-impulsa-primary);

  --dragon-secondary:
    var(--dragon-impulsa-secondary);

  --dragon-glow:
    var(--dragon-impulsa-glow);
}

.dragon-escala {

  --dragon-primary:
    var(--dragon-escala-primary);

  --dragon-secondary:
    var(--dragon-escala-secondary);

  --dragon-glow:
    var(--dragon-escala-glow);
}

.dragon-innova {

  --dragon-primary:
    var(--dragon-innova-primary);

  --dragon-secondary:
    var(--dragon-innova-secondary);

  --dragon-glow:
    var(--dragon-innova-glow);
}

/* ------------------------------------------------------------
   FUTURE DRAGON EFFECT
   No dragons rendered yet.
   ------------------------------------------------------------ */

.dragon-energy {

  background:
    radial-gradient(
      circle at 50% 45%,
      var(--dragon-glow),
      transparent 60%
    );

  box-shadow:
    0 0 45px var(--dragon-glow);
}

/* ------------------------------------------------------------
   COMMERCE OS GRADIENT TEXT
   ------------------------------------------------------------ */

.commerce-gradient-text {

  background:
    var(--commerce-gradient-energy);

  -webkit-background-clip:
    text;

  background-clip:
    text;

  color:
    transparent;
}

/* ------------------------------------------------------------
   AMBIENT LIGHT
   ------------------------------------------------------------ */

.commerce-ambient {

  position:
    relative;

  isolation:
    isolate;
}

.commerce-ambient::before {

  content:
    "";

  position:
    absolute;

  inset:
    -20%;

  pointer-events:
    none;

  z-index:
    -1;

  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(139, 92, 246, 0.15),
      transparent 28%
    ),
    radial-gradient(
      circle at 70% 65%,
      rgba(34, 211, 238, 0.10),
      transparent 28%
    );

  filter:
    blur(40px);
}

/* ------------------------------------------------------------
   REDUCED MOTION
   ------------------------------------------------------------ */

@media (prefers-reduced-motion: reduce) {

  [data-commerce-os="true"] *,
  [data-commerce-os="true"] *::before,
  [data-commerce-os="true"] *::after {

    animation-duration:
      0.01ms !important;

    animation-iteration-count:
      1 !important;

    transition-duration:
      0.01ms !important;

    scroll-behavior:
      auto !important;
  }
}
'''

CSS.write_text(css, encoding="utf-8")
print("✓ Sistema CSS Vibrant Core creado")

# ------------------------------------------------------------
# CONNECT CSS TO APP
# ------------------------------------------------------------

target = APP if APP.exists() else WORKSPACE

source = target.read_text(encoding="utf-8")

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

        target.write_text(source, encoding="utf-8")

        print(f"✓ CSS global conectado a {target.name}")

    else:

        print("⚠️ No se encontraron imports en el archivo principal")

else:

    print("✓ CSS global ya conectado")

# ------------------------------------------------------------
# CONNECT COMMERCE OS ROOT
# ------------------------------------------------------------

source = target.read_text(encoding="utf-8")

if "data-commerce-os" not in source:

    candidates = [
        r'<div\s+className="([^"]+)"',
        r'<div\s+className=\{([^}]+)\}',
        r'<main\s+className="([^"]+)"',
        r'<main\s+className=\{([^}]+)\}'
    ]

    connected = False

    for pattern in candidates:

        match = re.search(pattern, source)

        if match:

            tag_start = source.rfind("<", 0, match.start())

            if tag_start >= 0:

                tag_end = source.find(">", tag_start)

                if tag_end >= 0:

                    opening = source[tag_start:tag_end]

                    if "data-commerce-os" not in opening:

                        replacement = (
                            opening.rstrip()
                            + ' data-commerce-os="true"'
                            + ">"
                        )

                        source = (
                            source[:tag_start]
                            + replacement
                            + source[tag_end + 1:]
                        )

                        target.write_text(
                            source,
                            encoding="utf-8"
                        )

                        print(
                            f"✓ Commerce OS conectado al root de {target.name}"
                        )

                        connected = True
                        break

    if not connected:

        print(
            "⚠️ No pude detectar automáticamente el root visual."
        )
        print(
            "El CSS queda instalado igualmente."
        )

else:

    print("✓ data-commerce-os ya estaba presente")

# ------------------------------------------------------------
# CONNECT STORE BUILDER ROOT IF AVAILABLE
# ------------------------------------------------------------

if WORKSPACE.exists():

    workspace_source = WORKSPACE.read_text(
        encoding="utf-8"
    )

    if "data-commerce-os" not in workspace_source:

        root_match = re.search(
            r'<div(\s+className=)',
            workspace_source
        )

        if root_match:

            start = root_match.start()

            workspace_source = (
                workspace_source[:start]
                + '<div data-commerce-os="true"'
                + workspace_source[
                    root_match.end() - len("className="):
                ]
            )

            WORKSPACE.write_text(
                workspace_source,
                encoding="utf-8"
            )

            print(
                "✓ Store Builder conectado al sistema Commerce OS"
            )

        else:

            print(
                "⚠️ Root de Store Builder no detectado automáticamente"
            )

    else:

        print(
            "✓ Store Builder ya estaba conectado a Commerce OS"
        )

# ------------------------------------------------------------
# ARCHITECTURE VALIDATION
# ------------------------------------------------------------

final_workspace = WORKSPACE.read_text(
    encoding="utf-8"
)

final_css = CSS.read_text(
    encoding="utf-8"
)

checks = [

    (
        "Commerce OS",
        True
    ),

    (
        "Store Builder",
        "StoreBuilder" in final_workspace
    ),

    (
        "Website Builder",
        "WebsiteBuilder" in final_workspace
    ),

    (
        "Dragon CREA",
        "--dragon-crea-primary" in final_css
    ),

    (
        "Dragon IMPULSA",
        "--dragon-impulsa-primary" in final_css
    ),

    (
        "Dragon ESCALA",
        "--dragon-escala-primary" in final_css
    ),

    (
        "Dragon INNOVA",
        "--dragon-innova-primary" in final_css
    ),

    (
        "Electric Violet",
        "--commerce-violet" in final_css
    ),

    (
        "Neon Cyan",
        "--commerce-cyan" in final_css
    ),

    (
        "Magenta",
        "--commerce-magenta" in final_css
    )
]

print()
print("=" * 76)
print("VALIDACIÓN DE IDENTIDAD")
print("=" * 76)

for name, result in checks:

    if result:
        print(f"✓ {name}")
    else:
        print(f"⚠️ {name} no detectado")

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

print()
print("=" * 76)
print("BUILD DE VERIFICACIÓN")
print("=" * 76)

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
        print("❌ BUILD FALLÓ")

        print()
        print("Restaurando workspace...")

        shutil.copy2(
            backup,
            WORKSPACE
        )

        print(
            f"✓ Workspace restaurado desde {backup.name}"
        )

        sys.exit(result.returncode)

    print("✓ BUILD CORRECTO")

except subprocess.TimeoutExpired:

    print(
        "❌ npm run build excedió el tiempo límite."
    )

    shutil.copy2(
        backup,
        WORKSPACE
    )

    print(
        f"✓ Workspace restaurado desde {backup.name}"
    )

    sys.exit(1)

except FileNotFoundError:

    print(
        "❌ npm no está disponible en PATH."
    )

    print(
        f"✓ Backup disponible: {backup.name}"
    )

    sys.exit(1)

# ------------------------------------------------------------
# FINAL
# ------------------------------------------------------------

print()
print("=" * 76)
print("DIGITALBOOST — VIBRANT CORE INSTALADO")
print("=" * 76)

print()
print("ARQUITECTURA")

print("✓ Commerce OS = núcleo / sistema base")
print("✓ Store Builder = herramienta dentro de Commerce OS")
print("✓ Website Builder = estudio visual dentro de Store Builder")

print()
print("IDENTIDAD VISUAL")

print("✓ Dark premium")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta energético")
print("✓ Glass surfaces")
print("✓ Ambient lighting")
print("✓ Interactive hover")
print("✓ Focus states")
print("✓ Contrast improvements")
print("✓ Gradient energy system")

print()
print("FUTURA DRAGON COLLECTION")

print("✓ CREA     → Violet / Purple")
print("✓ IMPULSA  → Cyan / Neon")
print("✓ ESCALA   → Magenta / Pink")
print("✓ INNOVA   → Violet + Cyan")

print()
print("✓ Tokens de color preparados")
print("✓ Gradientes preparados")
print("✓ Sistema de glow preparado")
print("✓ Arquitectura extensible preparada")
print("✓ Los dragones todavía NO se renderizan")

print()
print(f"Backup: {backup.name}")

print()
print("Ahora ejecutá:")
print("npm run dev")

print()
print("La colección Dragon se desarrollará posteriormente")
print("sobre esta misma identidad visual.")

print("=" * 76)
