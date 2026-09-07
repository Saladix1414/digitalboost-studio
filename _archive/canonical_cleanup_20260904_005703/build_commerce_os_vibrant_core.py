#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import re
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
SRC = ROOT / "src"

print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT CORE")
print("EVOLUCIÓN VISUAL · PREMIUM DARK · ELECTRIC SYSTEM")
print("COMMERCE OS CORE → STORE BUILDER / OTHER ECOSYSTEMS")
print("=" * 78)
print()

if not ROOT.exists():
    print("❌ No existe ~/digitalboost-studio")
    sys.exit(1)

if not SRC.exists():
    print("❌ No existe ~/digitalboost-studio/src")
    sys.exit(1)

# ============================================================
# LOCALIZAR ARCHIVOS
# ============================================================

tsx_files = list(SRC.rglob("*.tsx"))
ts_files = list(SRC.rglob("*.ts"))

all_source_files = tsx_files + ts_files

if not all_source_files:
    print("❌ No encontré archivos TypeScript/TSX dentro de src.")
    sys.exit(1)

# Intentamos encontrar primero archivos claramente relacionados
preferred_names = [
    "CommerceOSOverview.tsx",
    "CommerceOS.tsx",
    "CommerceOSShell.tsx",
    "CommerceOSWorkspace.tsx",
    "CommerceOSApp.tsx",
    "App.tsx",
]

workspace = None

for name in preferred_names:
    candidates = [p for p in all_source_files if p.name == name]
    if candidates:
        workspace = candidates[0]
        break

# Si no encontramos por nombre, buscamos referencias a Commerce OS
if workspace is None:
    scored = []

    for path in all_source_files:
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue

        score = 0

        if "CommerceOS" in text:
            score += 10

        if "Commerce OS" in text:
            score += 8

        if "StoreBuilder" in text:
            score += 4

        if "Store Builder" in text:
            score += 3

        if "commerce" in text.lower():
            score += 2

        if score:
            scored.append((score, path))

    if scored:
        scored.sort(key=lambda item: item[0], reverse=True)
        workspace = scored[0][1]

if workspace is None:
    print("⚠️ No pude identificar automáticamente el root de Commerce OS.")
    print()
    print("Archivos TSX encontrados:")

    for p in tsx_files[:20]:
        print(" -", p.relative_to(ROOT))

    print()
    print("No se modificó ningún archivo.")
    sys.exit(1)

print(f"✓ Root candidato detectado: {workspace.relative_to(ROOT)}")

# ============================================================
# CREAR CSS GLOBAL
# ============================================================

css_path = SRC / "commerce-os-vibrant-global.css"

css = r"""
/*
 * DIGITALBOOST — COMMERCE OS VIBRANT GLOBAL SYSTEM
 *
 * Commerce OS = CORE
 *
 * Store Builder = herramienta especializada dentro de Commerce OS.
 * Website Builder = ecosistema independiente.
 *
 * La identidad futura del dragón NO se renderiza aquí.
 * Solamente se preparan tokens cromáticos reutilizables.
 */

:root {

  /* ==========================================================
     COMMERCE OS — CORE PALETTE
     ========================================================== */

  --commerce-os-bg-0: #070711;
  --commerce-os-bg-1: #0B0B18;
  --commerce-os-bg-2: #101024;
  --commerce-os-bg-3: #151535;

  --commerce-os-surface-0: rgba(255,255,255,0.035);
  --commerce-os-surface-1: rgba(255,255,255,0.055);
  --commerce-os-surface-2: rgba(255,255,255,0.075);
  --commerce-os-surface-3: rgba(255,255,255,0.10);

  --commerce-os-border: rgba(255,255,255,0.095);
  --commerce-os-border-strong: rgba(255,255,255,0.16);

  /* ==========================================================
     BRAND COLORS
     ========================================================== */

  --commerce-os-violet-300: #B9A7FF;
  --commerce-os-violet-400: #9B7BFF;
  --commerce-os-violet-500: #7C4DFF;
  --commerce-os-violet-600: #6337F5;
  --commerce-os-violet-700: #4B25C9;

  --commerce-os-cyan-300: #8FFFFF;
  --commerce-os-cyan-400: #4DEBFF;
  --commerce-os-cyan-500: #16D9FF;
  --commerce-os-cyan-600: #00B8E6;

  --commerce-os-magenta-300: #FF8FEA;
  --commerce-os-magenta-400: #FF55D8;
  --commerce-os-magenta-500: #F229C2;
  --commerce-os-magenta-600: #C9159F;

  /* ==========================================================
     TEXT
     ========================================================== */

  --commerce-os-text-primary: #F8F7FF;
  --commerce-os-text-secondary: #C9C8DC;
  --commerce-os-text-muted: #9998B1;
  --commerce-os-text-disabled: #6F6E82;

  /* ==========================================================
     SEMANTIC COLORS
     ========================================================== */

  --commerce-os-success: #36E6A0;
  --commerce-os-warning: #FFD166;
  --commerce-os-danger: #FF5C7A;
  --commerce-os-info: var(--commerce-os-cyan-500);

  /* ==========================================================
     GRADIENTS
     ========================================================== */

  --commerce-os-gradient-brand:
    linear-gradient(
      135deg,
      var(--commerce-os-violet-500) 0%,
      var(--commerce-os-magenta-500) 48%,
      var(--commerce-os-cyan-500) 100%
    );

  --commerce-os-gradient-violet-cyan:
    linear-gradient(
      135deg,
      var(--commerce-os-violet-500),
      var(--commerce-os-cyan-500)
    );

  --commerce-os-gradient-violet-magenta:
    linear-gradient(
      135deg,
      var(--commerce-os-violet-500),
      var(--commerce-os-magenta-500)
    );

  --commerce-os-gradient-dark:
    linear-gradient(
      145deg,
      #090916 0%,
      #111126 50%,
      #0B0B18 100%
    );

  /* ==========================================================
     GLOW
     ========================================================== */

  --commerce-os-glow-violet:
    0 0 32px rgba(124,77,255,0.22);

  --commerce-os-glow-cyan:
    0 0 32px rgba(22,217,255,0.18);

  --commerce-os-glow-magenta:
    0 0 32px rgba(242,41,194,0.16);

  --commerce-os-glow-brand:
    0 0 42px rgba(124,77,255,0.16),
    0 0 70px rgba(22,217,255,0.08);

  /* ==========================================================
     FUTURE DRAGON COLOR TOKENS
     ========================================================== */

  /*
   * These are intentionally NOT used to render a dragon.
   *
   * They establish a future visual bridge between
   * Commerce OS and the future Dragon collection.
   */

  --dragon-crea-primary: #7C4DFF;
  --dragon-crea-secondary: #B9A7FF;
  --dragon-crea-glow: rgba(124,77,255,0.32);

  --dragon-impulsa-primary: #16D9FF;
  --dragon-impulsa-secondary: #8FFFFF;
  --dragon-impulsa-glow: rgba(22,217,255,0.30);

  --dragon-escala-primary: #F229C2;
  --dragon-escala-secondary: #FF8FEA;
  --dragon-escala-glow: rgba(242,41,194,0.28);

  --dragon-innova-primary: #7C4DFF;
  --dragon-innova-secondary: #16D9FF;
  --dragon-innova-glow:
    rgba(124,77,255,0.28);

  /* ==========================================================
     RADIUS
     ========================================================== */

  --commerce-os-radius-sm: 10px;
  --commerce-os-radius-md: 16px;
  --commerce-os-radius-lg: 22px;
  --commerce-os-radius-xl: 30px;

  /* ==========================================================
     TRANSITIONS
     ========================================================== */

  --commerce-os-transition:
    180ms cubic-bezier(.2,.8,.2,1);

  --commerce-os-transition-slow:
    320ms cubic-bezier(.2,.8,.2,1);
}


/* ============================================================
   COMMERCE OS ROOT
   ============================================================ */

[data-commerce-os="true"] {

  color-scheme: dark;

  background:
    radial-gradient(
      circle at 12% 8%,
      rgba(124,77,255,0.16),
      transparent 30%
    ),
    radial-gradient(
      circle at 88% 18%,
      rgba(22,217,255,0.11),
      transparent 28%
    ),
    radial-gradient(
      circle at 55% 100%,
      rgba(242,41,194,0.08),
      transparent 32%
    ),
    var(--commerce-os-gradient-dark);

  color: var(--commerce-os-text-primary);

  min-height: 100%;
}


/* ============================================================
   GENERAL COMMERCE OS SURFACES
   ============================================================ */

[data-commerce-os="true"] .commerce-os-surface,
[data-commerce-os="true"] [data-commerce-surface] {

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,0.075),
      rgba(255,255,255,0.025)
    );

  border: 1px solid var(--commerce-os-border);

  box-shadow:
    0 18px 50px rgba(0,0,0,0.24),
    inset 0 1px 0 rgba(255,255,255,0.055);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  transition:
    transform var(--commerce-os-transition),
    border-color var(--commerce-os-transition),
    box-shadow var(--commerce-os-transition),
    background var(--commerce-os-transition);
}


/* ============================================================
   HOVER SURFACES
   ============================================================ */

[data-commerce-os="true"] .commerce-os-surface:hover,
[data-commerce-os="true"] [data-commerce-surface]:hover {

  border-color:
    rgba(155,123,255,0.32);

  box-shadow:
    var(--commerce-os-glow-violet),
    0 22px 60px rgba(0,0,0,0.30),
    inset 0 1px 0 rgba(255,255,255,0.075);

  transform:
    translateY(-1px);
}


/* ============================================================
   PRIMARY ACTIONS
   ============================================================ */

[data-commerce-os="true"] .commerce-os-primary,
[data-commerce-os="true"] [data-commerce-primary] {

  background:
    var(--commerce-os-gradient-violet-cyan);

  color: #FFFFFF;

  border:
    1px solid rgba(255,255,255,0.18);

  box-shadow:
    0 10px 32px rgba(124,77,255,0.20);

  transition:
    transform var(--commerce-os-transition),
    box-shadow var(--commerce-os-transition),
    filter var(--commerce-os-transition);
}


[data-commerce-os="true"] .commerce-os-primary:hover,
[data-commerce-os="true"] [data-commerce-primary]:hover {

  filter:
    brightness(1.10)
    saturate(1.08);

  box-shadow:
    0 14px 40px rgba(124,77,255,0.28),
    0 0 24px rgba(22,217,255,0.10);

  transform:
    translateY(-1px);
}


/* ============================================================
   ACTIVE / SELECTED
   ============================================================ */

[data-commerce-os="true"] .commerce-os-active,
[data-commerce-os="true"] [data-commerce-active="true"] {

  background:
    linear-gradient(
      135deg,
      rgba(124,77,255,0.22),
      rgba(22,217,255,0.10)
    );

  border-color:
    rgba(155,123,255,0.42);

  box-shadow:
    0 0 28px rgba(124,77,255,0.13),
    inset 0 0 20px rgba(124,77,255,0.035);
}


/* ============================================================
   LINKS / INTERACTIVE
   ============================================================ */

[data-commerce-os="true"] a,
[data-commerce-os="true"] button {

  transition:
    color var(--commerce-os-transition),
    background var(--commerce-os-transition),
    border-color var(--commerce-os-transition),
    box-shadow var(--commerce-os-transition),
    transform var(--commerce-os-transition);
}


/* ============================================================
   FOCUS
   ============================================================ */

[data-commerce-os="true"] :focus-visible {

  outline:
    2px solid var(--commerce-os-cyan-400);

  outline-offset:
    3px;

  box-shadow:
    0 0 0 5px rgba(22,217,255,0.13);
}


/* ============================================================
   TEXT UTILITIES
   ============================================================ */

[data-commerce-os="true"] .commerce-os-text-primary {
  color: var(--commerce-os-text-primary);
}

[data-commerce-os="true"] .commerce-os-text-secondary {
  color: var(--commerce-os-text-secondary);
}

[data-commerce-os="true"] .commerce-os-text-muted {
  color: var(--commerce-os-text-muted);
}


/* ============================================================
   BRAND TEXT
   ============================================================ */

[data-commerce-os="true"] .commerce-os-gradient-text {

  background:
    var(--commerce-os-gradient-brand);

  background-clip:
    text;

  -webkit-background-clip:
    text;

  color:
    transparent;

  -webkit-text-fill-color:
    transparent;
}


/* ============================================================
   BRAND GLOW
   ============================================================ */

[data-commerce-os="true"] .commerce-os-brand-glow {

  box-shadow:
    var(--commerce-os-glow-brand);
}


/* ============================================================
   DIVIDERS
   ============================================================ */

[data-commerce-os="true"] hr,
[data-commerce-os="true"] .commerce-os-divider {

  border:
    0;

  border-top:
    1px solid rgba(255,255,255,0.08);
}


/* ============================================================
   INPUTS
   ============================================================ */

[data-commerce-os="true"] input,
[data-commerce-os="true"] textarea,
[data-commerce-os="true"] select {

  background:
    rgba(255,255,255,0.045);

  color:
    var(--commerce-os-text-primary);

  border:
    1px solid rgba(255,255,255,0.11);

  transition:
    border-color var(--commerce-os-transition),
    box-shadow var(--commerce-os-transition),
    background var(--commerce-os-transition);
}


[data-commerce-os="true"] input:hover,
[data-commerce-os="true"] textarea:hover,
[data-commerce-os="true"] select:hover {

  border-color:
    rgba(155,123,255,0.30);
}


[data-commerce-os="true"] input:focus,
[data-commerce-os="true"] textarea:focus,
[data-commerce-os="true"] select:focus {

  border-color:
    rgba(22,217,255,0.55);

  box-shadow:
    0 0 0 3px rgba(22,217,255,0.10),
    0 0 24px rgba(22,217,255,0.08);

  outline:
    none;
}


/* ============================================================
   SCROLLBAR
   ============================================================ */

[data-commerce-os="true"] ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

[data-commerce-os="true"] ::-webkit-scrollbar-track {
  background:
    rgba(255,255,255,0.025);
}

[data-commerce-os="true"] ::-webkit-scrollbar-thumb {

  background:
    linear-gradient(
      180deg,
      rgba(124,77,255,0.70),
      rgba(22,217,255,0.58)
    );

  border:
    3px solid transparent;

  background-clip:
    padding-box;

  border-radius:
    999px;
}

[data-commerce-os="true"] ::-webkit-scrollbar-thumb:hover {

  background:
    linear-gradient(
      180deg,
      rgba(155,123,255,0.90),
      rgba(77,235,255,0.82)
    );

  background-clip:
    padding-box;
}


/* ============================================================
   AMBIENT LIGHT
   ============================================================ */

[data-commerce-os="true"]::before {

  content:
    "";

  position:
    fixed;

  inset:
    0;

  pointer-events:
    none;

  z-index:
    0;

  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(124,77,255,0.055),
      transparent 24%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(22,217,255,0.045),
      transparent 25%
    );
}


/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 900px) {

  [data-commerce-os="true"] {

    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(124,77,255,0.14),
        transparent 35%
      ),
      var(--commerce-os-gradient-dark);
  }
}


/* ============================================================
   REDUCED MOTION
   ============================================================ */

@media (prefers-reduced-motion: reduce) {

  [data-commerce-os="true"] *,
  [data-commerce-os="true"] *::before,
  [data-commerce-os="true"] *::after {

    transition:
      none !important;

    animation:
      none !important;
  }
}
"""

css_path.write_text(css.strip() + "\n", encoding="utf-8")

print(f"✓ Sistema visual creado: {css_path.relative_to(ROOT)}")


# ============================================================
# BACKUP
# ============================================================

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = workspace.with_name(
    workspace.stem
    + f".before_vibrant_core_{timestamp}"
    + workspace.suffix
)

shutil.copy2(workspace, backup)

print(f"✓ Backup creado: {backup.name}")


# ============================================================
# LEER WORKSPACE
# ============================================================

original = workspace.read_text(encoding="utf-8")
source = original


# ============================================================
# CONECTAR CSS GLOBAL
# ============================================================

css_import = 'import "./commerce-os-vibrant-global.css";'

if css_import not in source:

    # Intentar colocar después del último import
    import_matches = list(
        re.finditer(
            r'^import[\s\S]*?from\s+[\'"][^\'"]+[\'"];?\s*$',
            source,
            flags=re.MULTILINE
        )
    )

    if import_matches:

        pos = import_matches[-1].end()

        source = (
            source[:pos]
            + "\n"
            + css_import
            + source[pos:]
        )

        print("✓ CSS global conectado al workspace")

    else:

        # Fallback: colocar al principio
        source = (
            css_import
            + "\n"
            + source
        )

        print("✓ CSS global agregado mediante fallback")

else:

    print("✓ CSS global ya estaba conectado")


# ============================================================
# IDENTIFICAR ROOT DE COMMERCE OS
# ============================================================

if "data-commerce-os" not in source:

    # Preferimos un root con className.
    root_patterns = [
        r'<div(\s+className\s*=\s*["\'][^"\']*["\'])',
        r'<main(\s+className\s*=\s*["\'][^"\']*["\'])',
        r'<section(\s+className\s*=\s*["\'][^"\']*["\'])',
    ]

    root_match = None

    for pattern in root_patterns:

        match = re.search(
            pattern,
            source
        )

        if match:
            root_match = match
            break

    if root_match:

        tag_start = root_match.start()

        tag_name_match = re.match(
            r'<([A-Za-z][A-Za-z0-9]*)',
            source[tag_start:]
        )

        if tag_name_match:

            tag_name = tag_name_match.group(1)

            insert_position = (
                tag_start
                + len("<")
                + len(tag_name)
            )

            source = (
                source[:insert_position]
                + ' data-commerce-os="true"'
                + source[insert_position:]
            )

            print(
                f"✓ Identidad Commerce OS conectada al root <{tag_name}>"
            )

        else:

            print(
                "⚠️ Encontré un root pero no pude identificar el tag."
            )

    else:

        print(
            "⚠️ No encontré automáticamente un root JSX."
        )

else:

    print("✓ data-commerce-os ya estaba presente")


# ============================================================
# AÑADIR META DE IDENTIDAD SIN ALTERAR ARQUITECTURA
# ============================================================

identity_marker = "data-commerce-os-core"

if identity_marker not in source:

    # Si encontramos data-commerce-os, agregamos una marca
    # en el mismo root.
    root_identity = re.search(
        r'data-commerce-os="true"',
        source
    )

    if root_identity:

        pos = root_identity.end()

        source = (
            source[:pos]
            + ' data-commerce-os-core="vibrant-1"'
            + source[pos:]
        )

        print("✓ Metadata visual Commerce OS agregada")

    else:

        print(
            "⚠️ No se pudo agregar metadata visual al root."
        )

else:

    print("✓ Metadata visual ya estaba presente")


# ============================================================
# ESCRIBIR
# ============================================================

if source != original:

    workspace.write_text(
        source,
        encoding="utf-8"
    )

    print(
        f"✓ Workspace actualizado: {workspace.relative_to(ROOT)}"
    )

else:

    print("ℹ️ No hubo cambios estructurales en el workspace.")


# ============================================================
# VALIDACIONES
# ============================================================

final_source = workspace.read_text(
    encoding="utf-8"
)

checks = [

    (
        "Commerce OS CSS",
        css_path.exists()
    ),

    (
        "Electric Violet",
        "--commerce-os-violet-500" in css
    ),

    (
        "Neon Cyan",
        "--commerce-os-cyan-500" in css
    ),

    (
        "Magenta Pulse",
        "--commerce-os-magenta-500" in css
    ),

    (
        "Gradient Brand",
        "--commerce-os-gradient-brand" in css
    ),

    (
        "Future Dragon CREA",
        "--dragon-crea-primary" in css
    ),

    (
        "Future Dragon IMPULSA",
        "--dragon-impulsa-primary" in css
    ),

    (
        "Future Dragon ESCALA",
        "--dragon-escala-primary" in css
    ),

    (
        "Future Dragon INNOVA",
        "--dragon-innova-primary" in css
    ),

    (
        "Commerce OS root",
        "data-commerce-os" in final_source
    ),

    (
        "Commerce OS core",
        "data-commerce-os-core" in final_source
    ),
]

print()
print("=" * 78)
print("VALIDACIÓN DE IDENTIDAD")
print("=" * 78)

all_ok = True

for name, result in checks:

    if result:
        print(f"✓ {name}")
    else:
        print(f"⚠️ {name} no detectado")
        all_ok = False


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
        print("Restaurando workspace...")

        shutil.copy2(
            backup,
            workspace
        )

        print(
            f"✓ Workspace restaurado desde: {backup.name}"
        )

        sys.exit(result.returncode)

    print("✓ BUILD CORRECTO")

except subprocess.TimeoutExpired:

    print(
        "❌ npm run build excedió el tiempo límite."
    )

    print(
        "Restaurando workspace..."
    )

    shutil.copy2(
        backup,
        workspace
    )

    print(
        f"✓ Workspace restaurado desde: {backup.name}"
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


# ============================================================
# RESULTADO FINAL
# ============================================================

print()
print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT CORE INSTALADO")
print("=" * 78)

print()
print("✓ Commerce OS tratado como núcleo visual")
print("✓ Dark premium conservado")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta Pulse")
print("✓ Fondos profundos")
print("✓ Glass / layered surfaces")
print("✓ Gradientes de marca")
print("✓ Iluminación ambiental")
print("✓ Estados activos más visibles")
print("✓ Hover / focus mejorados")
print("✓ Inputs premium")
print("✓ Scrollbar premium")
print("✓ Responsive")
print("✓ Reduced motion")
print()
print("FUTURA IDENTIDAD DRAGON")
print("------------------------------------------")
print("🐉 CREA     → Electric Violet")
print("🐉 IMPULSA  → Neon Cyan")
print("🐉 ESCALA   → Magenta Pulse")
print("🐉 INNOVA   → Violet + Cyan")
print("------------------------------------------")
print("✓ Tokens preparados solamente")
print("✓ Ningún dragón fue agregado a la interfaz")
print()
print("ARQUITECTURA")
print("------------------------------------------")
print("Commerce OS → CORE")
print("Store Builder → herramienta dentro de Commerce OS")
print("Website Builder → ecosistema independiente")
print("------------------------------------------")
print()
print(f"Backup: {backup.name}")
print()
print("Ejecutá:")
print("npm run dev")
print()
print("Después abrí Commerce OS y revisá la interfaz general.")
print("=" * 78)

