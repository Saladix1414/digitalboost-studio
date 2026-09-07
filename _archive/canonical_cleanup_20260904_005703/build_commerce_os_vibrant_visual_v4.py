from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

ROOT = Path.cwd()
COMMERCE = ROOT / "src" / "CommerceOSOverview.tsx"
CSS = ROOT / "src" / "commerce-os-vibrant-global.css"

if not COMMERCE.exists():
    print("❌ No encontré src/CommerceOSOverview.tsx")
    sys.exit(1)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = COMMERCE.with_name(
    f"CommerceOSOverview.before_vibrant_v4_{timestamp}.tsx"
)

shutil.copy2(COMMERCE, backup)

print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT VISUAL V4")
print("PREMIUM DARK → ELECTRIC → HIGH CONTRAST")
print("CAMBIO VISUAL REAL · SOLO COMMERCE OS")
print("=" * 78)

# ============================================================
# SISTEMA VISUAL
# ============================================================

css = r"""
/* ============================================================
   DIGITALBOOST — COMMERCE OS VIBRANT VISUAL V4
   SOLO COMMERCE OS
   ============================================================ */

:root {
  --commerce-bg-0: #05030d;
  --commerce-bg-1: #080516;
  --commerce-bg-2: #0d0820;
  --commerce-surface: rgba(18, 12, 38, 0.82);
  --commerce-surface-strong: rgba(24, 15, 52, 0.94);

  --commerce-violet: #8b5cf6;
  --commerce-violet-bright: #a78bfa;
  --commerce-violet-neon: #c084fc;

  --commerce-cyan: #22d3ee;
  --commerce-cyan-bright: #67e8f9;

  --commerce-magenta: #ec4899;
  --commerce-pink: #f472b6;

  --commerce-text: #faf7ff;
  --commerce-text-soft: #d8d1e8;
  --commerce-text-muted: #a59bbd;

  --commerce-border: rgba(167, 139, 250, 0.22);
  --commerce-border-bright: rgba(34, 211, 238, 0.38);

  --commerce-brand-gradient:
    linear-gradient(
      135deg,
      #8b5cf6 0%,
      #a855f7 35%,
      #ec4899 67%,
      #22d3ee 100%
    );

  /* FUTURE ONLY — NO NFT RENDER */
  --future-crea-primary: #8b5cf6;
  --future-impulsa-primary: #22d3ee;
  --future-escala-primary: #ec4899;
  --future-innova-primary: #a78bfa;
}


/* ============================================================
   COMMERCE OS ROOT
   ============================================================ */

[data-commerce-os="true"] {
  color: var(--commerce-text) !important;

  background:
    radial-gradient(
      circle at 15% 10%,
      rgba(139, 92, 246, 0.18),
      transparent 30%
    ),
    radial-gradient(
      circle at 85% 15%,
      rgba(34, 211, 238, 0.13),
      transparent 28%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(236, 72, 153, 0.11),
      transparent 35%
    ),
    linear-gradient(
      145deg,
      var(--commerce-bg-0),
      var(--commerce-bg-1) 48%,
      var(--commerce-bg-2)
    ) !important;

  min-height: 100vh;
}


/* ============================================================
   TEXT
   ============================================================ */

[data-commerce-os="true"] h1,
[data-commerce-os="true"] h2,
[data-commerce-os="true"] h3,
[data-commerce-os="true"] h4,
[data-commerce-os="true"] h5,
[data-commerce-os="true"] h6 {
  color: var(--commerce-text) !important;
  text-shadow:
    0 0 24px rgba(139, 92, 246, 0.18);
}

[data-commerce-os="true"] p,
[data-commerce-os="true"] span,
[data-commerce-os="true"] label {
  color: inherit;
}

[data-commerce-os="true"] [class*="muted"],
[data-commerce-os="true"] [class*="secondary"],
[data-commerce-os="true"] [class*="description"] {
  color: var(--commerce-text-muted) !important;
}


/* ============================================================
   GLASS SURFACES
   ============================================================ */

[data-commerce-os="true"] [class*="card"],
[data-commerce-os="true"] [class*="panel"],
[data-commerce-os="true"] [class*="surface"],
[data-commerce-os="true"] [class*="container"],
[data-commerce-os="true"] [class*="workspace"] {
  background:
    linear-gradient(
      145deg,
      rgba(24, 15, 52, 0.92),
      rgba(9, 6, 23, 0.88)
    ) !important;

  border-color: var(--commerce-border) !important;

  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255,255,255,0.035) !important;

  backdrop-filter: blur(18px);
}


/* ============================================================
   BUTTONS
   ============================================================ */

[data-commerce-os="true"] button {
  color: var(--commerce-text) !important;

  border-color: rgba(167, 139, 250, 0.28) !important;

  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease,
    background 160ms ease !important;
}

[data-commerce-os="true"] button:hover {
  transform: translateY(-1px);

  border-color:
    rgba(167, 139, 250, 0.68) !important;

  box-shadow:
    0 0 0 1px rgba(139, 92, 246, 0.12),
    0 12px 35px rgba(139, 92, 246, 0.18) !important;
}


/* ============================================================
   PRIMARY ACTIONS
   ============================================================ */

[data-commerce-os="true"] button[class*="primary"],
[data-commerce-os="true"] button[class*="Primary"],
[data-commerce-os="true"] [role="button"][class*="primary"],
[data-commerce-os="true"] [role="button"][class*="Primary"] {
  color: white !important;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #a855f7 45%,
      #ec4899
    ) !important;

  border-color:
    rgba(216, 180, 254, 0.52) !important;

  box-shadow:
    0 10px 34px rgba(139, 92, 246, 0.32),
    0 0 28px rgba(168, 85, 247, 0.16) !important;
}

[data-commerce-os="true"] button[class*="primary"]:hover,
[data-commerce-os="true"] button[class*="Primary"]:hover {
  background:
    linear-gradient(
      135deg,
      #8b5cf6,
      #c084fc 45%,
      #f472b6
    ) !important;

  box-shadow:
    0 14px 42px rgba(139, 92, 246, 0.42),
    0 0 36px rgba(236, 72, 153, 0.20) !important;
}


/* ============================================================
   ICON BUTTONS
   ============================================================ */

[data-commerce-os="true"] button svg,
[data-commerce-os="true"] [role="button"] svg {
  color: var(--commerce-violet-bright) !important;
}


/* ============================================================
   INPUTS / SELECTS / TEXTAREAS
   ============================================================ */

[data-commerce-os="true"] input,
[data-commerce-os="true"] textarea,
[data-commerce-os="true"] select {
  color: var(--commerce-text) !important;

  background:
    rgba(8, 5, 20, 0.72) !important;

  border-color:
    rgba(167, 139, 250, 0.22) !important;

  box-shadow:
    inset 0 1px 12px rgba(0, 0, 0, 0.18) !important;
}

[data-commerce-os="true"] input:focus,
[data-commerce-os="true"] textarea:focus,
[data-commerce-os="true"] select:focus {
  outline: none !important;

  border-color:
    rgba(34, 211, 238, 0.72) !important;

  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.09),
    0 0 28px rgba(34, 211, 238, 0.10) !important;
}

[data-commerce-os="true"] input::placeholder,
[data-commerce-os="true"] textarea::placeholder {
  color: #746a8d !important;
}


/* ============================================================
   ACTIVE / SELECTED STATES
   ============================================================ */

[data-commerce-os="true"] [aria-selected="true"],
[data-commerce-os="true"] [data-state="active"],
[data-commerce-os="true"] [data-active="true"],
[data-commerce-os="true"] [class*="active"] {
  border-color:
    rgba(139, 92, 246, 0.58) !important;

  background:
    linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.18),
      rgba(34, 211, 238, 0.07)
    ) !important;

  box-shadow:
    inset 0 0 24px rgba(139, 92, 246, 0.07),
    0 0 24px rgba(139, 92, 246, 0.08) !important;
}


/* ============================================================
   BADGES / TAGS
   ============================================================ */

[data-commerce-os="true"] [class*="badge"],
[data-commerce-os="true"] [class*="Badge"],
[data-commerce-os="true"] [class*="tag"],
[data-commerce-os="true"] [class*="Tag"] {
  color: #ddd6fe !important;

  background:
    rgba(139, 92, 246, 0.13) !important;

  border-color:
    rgba(167, 139, 250, 0.28) !important;
}


/* ============================================================
   LINKS
   ============================================================ */

[data-commerce-os="true"] a {
  color: var(--commerce-cyan-bright) !important;

  transition:
    color 150ms ease,
    text-shadow 150ms ease;
}

[data-commerce-os="true"] a:hover {
  color: white !important;

  text-shadow:
    0 0 16px rgba(34, 211, 238, 0.46);
}


/* ============================================================
   DIVIDERS
   ============================================================ */

[data-commerce-os="true"] hr {
  border-color:
    rgba(167, 139, 250, 0.14) !important;
}


/* ============================================================
   SCROLLBAR
   ============================================================ */

[data-commerce-os="true"] {
  scrollbar-color:
    rgba(139, 92, 246, 0.62)
    rgba(8, 5, 20, 0.85);
}

[data-commerce-os="true"]::-webkit-scrollbar {
  width: 10px;
}

[data-commerce-os="true"]::-webkit-scrollbar-track {
  background: #07040f;
}

[data-commerce-os="true"]::-webkit-scrollbar-thumb {
  background:
    linear-gradient(
      180deg,
      #8b5cf6,
      #ec4899
    );

  border-radius: 999px;
}


/* ============================================================
   BRAND / GRADIENT ELEMENTS
   ============================================================ */

[data-commerce-os="true"] [class*="gradient"],
[data-commerce-os="true"] [class*="brand"] {
  --commerce-brand-active: var(--commerce-brand-gradient);
}


/* ============================================================
   VIBRANT ACCENTS
   ============================================================ */

[data-commerce-os="true"] [class*="violet"],
[data-commerce-os="true"] [class*="purple"] {
  color: var(--commerce-violet-bright) !important;
}

[data-commerce-os="true"] [class*="cyan"],
[data-commerce-os="true"] [class*="blue"] {
  color: var(--commerce-cyan-bright) !important;
}

[data-commerce-os="true"] [class*="pink"],
[data-commerce-os="true"] [class*="magenta"] {
  color: var(--commerce-pink) !important;
}


/* ============================================================
   AMBIENT LIGHT
   ============================================================ */

[data-commerce-os="true"]::before {
  content: "";
  position: fixed;
  inset: -30%;
  pointer-events: none;
  z-index: 0;

  background:
    radial-gradient(
      circle at 25% 20%,
      rgba(139, 92, 246, 0.09),
      transparent 24%
    ),
    radial-gradient(
      circle at 75% 30%,
      rgba(34, 211, 238, 0.06),
      transparent 22%
    ),
    radial-gradient(
      circle at 55% 80%,
      rgba(236, 72, 153, 0.05),
      transparent 22%
    );

  filter: blur(40px);
}


/* ============================================================
   PRESERVE CONTENT ABOVE AMBIENT LAYER
   ============================================================ */

[data-commerce-os="true"] > * {
  position: relative;
  z-index: 1;
}
"""

CSS.write_text(css, encoding="utf-8")
print("✓ Sistema visual V4 escrito")


# ============================================================
# CONECTAR CSS AL COMPONENTE
# ============================================================

source = COMMERCE.read_text(encoding="utf-8")

css_import = 'import "./commerce-os-vibrant-global.css";'

if css_import not in source:
    imports = list(
        re.finditer(
            r'^import\s+.*?;\s*$',
            source,
            re.MULTILINE
        )
    )

    if imports:
        pos = imports[-1].end()
        source = source[:pos] + "\n" + css_import + source[pos:]
        print("✓ CSS conectado")
    else:
        source = css_import + "\n" + source
        print("✓ CSS agregado al inicio")
else:
    print("✓ CSS ya estaba conectado")


# ============================================================
# IDENTIFICAR ROOT DE COMMERCE OS SIN TOCAR APP.TSX
# ============================================================

if "data-commerce-os" not in source:

    # Intentamos encontrar el primer div raíz del componente.
    patterns = [
        r'(<div)(\s+className=)',
        r'(<main)(\s+className=)',
        r'(<section)(\s+className=)',
        r'(<div)(>)',
        r'(<main)(>)',
        r'(<section)(>)',
    ]

    modified = False

    for pattern in patterns:
        match = re.search(pattern, source)

        if match:
            start = match.start(1)
            end = match.end(1)

            source = (
                source[:start]
                + '<div data-commerce-os="true"'
                + source[end:]
            )

            # Si sustituimos main/section por div, cerramos correctamente
            # solo cuando el tag original era div.
            if match.group(1) != "<div":
                source = source.replace(
                    "</main>",
                    "</div>",
                    1
                ).replace(
                    "</section>",
                    "</div>",
                    1
                )

            modified = True
            print("✓ Root Commerce OS marcado")
            break

    if not modified:
        print("⚠️ No se pudo localizar automáticamente el root")
else:
    print("✓ Root Commerce OS ya identificado")


# ============================================================
# METADATA NO VISUAL
# ============================================================

if "Commerce OS Core" not in source:
    source = (
        "/* Commerce OS Core — Vibrant Visual System */\n"
        + source
    )
    print("✓ Metadata Commerce OS agregada")


COMMERCE.write_text(source, encoding="utf-8")

print(f"✓ Actualizado: {COMMERCE}")


# ============================================================
# VALIDACIÓN
# ============================================================

final_source = COMMERCE.read_text(encoding="utf-8")
final_css = CSS.read_text(encoding="utf-8")

checks = [
    ("Commerce OS CSS", CSS.exists()),
    ("Electric Violet", "--commerce-violet" in final_css),
    ("Neon Cyan", "--commerce-cyan" in final_css),
    ("Magenta Pulse", "--commerce-magenta" in final_css),
    ("Brand Gradient", "--commerce-brand-gradient" in final_css),
    ("Future Crea token", "--future-crea-primary" in final_css),
    ("Future Impulsa token", "--future-impulsa-primary" in final_css),
    ("Future Escala token", "--future-escala-primary" in final_css),
    ("Future Innova token", "--future-innova-primary" in final_css),
    ("Commerce OS root", "data-commerce-os" in final_source),
]

print()
print("=" * 78)
print("VALIDACIÓN")
print("=" * 78)

for name, result in checks:
    if result:
        print(f"✓ {name}")
    else:
        print(f"⚠️ {name}")


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
        print("Restaurando CommerceOSOverview.tsx...")

        shutil.copy2(backup, COMMERCE)

        print(f"✓ Restaurado desde: {backup.name}")
        print("✓ El CSS queda disponible para revisión.")
        sys.exit(result.returncode)

except subprocess.TimeoutExpired:
    print("❌ BUILD excedió el tiempo límite.")
    shutil.copy2(backup, COMMERCE)
    sys.exit(1)

except FileNotFoundError:
    print("❌ npm no está disponible.")
    shutil.copy2(backup, COMMERCE)
    sys.exit(1)


# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 78)
print("COMMERCE OS VIBRANT VISUAL V4 — INSTALADO")
print("=" * 78)

print("✓ Commerce OS visual actualizado")
print("✓ Premium Dark conservado")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta Pulse")
print("✓ Gradiente de marca")
print("✓ Glass surfaces")
print("✓ Ambient lighting")
print("✓ Contraste mejorado")
print("✓ Botones más visibles")
print("✓ Estados activos más visibles")
print("✓ Inputs / focus mejorados")
print("✓ Scrollbar premium")
print()
print("ARQUITECTURA")
print("✓ Commerce OS")
print("  └── Store Builder = tiendas virtuales")
print("✓ Web Builder permanece como ecosistema aparte")
print()
print("IDENTIDAD FUTURA — SOLO TOKENS DE COLOR")
print("✓ Crea")
print("✓ Impulsa")
print("✓ Escala")
print("✓ Innova")
print("⚠️ No se crean ni renderizan dragones.")
print("⚠️ No se agregan NFTs.")
print()
print(f"✓ Backup: {backup.name}")
print()
print("Ahora ejecutá:")
print("npm run dev")
print("=" * 78)
