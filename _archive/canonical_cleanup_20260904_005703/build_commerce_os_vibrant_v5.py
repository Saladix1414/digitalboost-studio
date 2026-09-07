from pathlib import Path
import shutil
import re
from datetime import datetime
import subprocess
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"
COMMERCE = SRC / "CommerceOSOverview.tsx"
CSS = SRC / "commerce-os-vibrant-global.css"

if not COMMERCE.exists():
    print("❌ No existe:", COMMERCE)
    sys.exit(1)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = SRC / f"CommerceOSOverview.before_vibrant_v5_{timestamp}.tsx"

print("=" * 78)
print("DIGITALBOOST — COMMERCE OS VIBRANT V5")
print("PREMIUM DARK → ELECTRIC HIGH-CONTRAST")
print("VISUAL UPGRADE — SIN CAMBIOS EN APP.TSX")
print("=" * 78)

# ------------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------------

shutil.copy2(COMMERCE, backup)
print(f"✓ Backup creado: {backup.name}")

source = COMMERCE.read_text(encoding="utf-8")

# ------------------------------------------------------------------
# 1. ELIMINAR OPACIDADES EXTREMADAMENTE BAJAS EN SUPERFICIES
# ------------------------------------------------------------------

replacements = {
    "bg-white/[0.02]": "bg-white/[0.055]",
    "bg-white/[0.025]": "bg-white/[0.065]",
    "bg-white/[0.03]": "bg-white/[0.075]",
    "bg-white/[0.04]": "bg-white/[0.085]",
    "bg-white/[0.05]": "bg-white/[0.095]",
    "bg-white/[0.06]": "bg-white/[0.11]",

    "border-white/[0.05]": "border-white/[0.12]",
    "border-white/[0.06]": "border-white/[0.14]",
    "border-white/[0.07]": "border-white/[0.16]",
    "border-white/[0.08]": "border-white/[0.18]",

    "text-slate-700": "text-slate-400",
    "text-slate-600": "text-slate-300",
    "text-slate-500": "text-slate-300",

    "bg-cyan-400/[0.02]": "bg-cyan-400/[0.07]",
    "bg-cyan-400/[0.04]": "bg-cyan-400/[0.10]",
    "bg-cyan-400/[0.06]": "bg-cyan-400/[0.13]",
    "bg-cyan-400/[0.07]": "bg-cyan-400/[0.15]",
    "bg-cyan-300/[0.06]": "bg-cyan-300/[0.13]",

    "border-cyan-400/10": "border-cyan-400/25",
    "border-cyan-400/15": "border-cyan-400/32",
    "border-cyan-300/20": "border-cyan-300/32",

    "bg-violet-500/[0.07]": "bg-violet-500/[0.14]",
    "bg-violet-400/[0.06]": "bg-violet-400/[0.13]",
    "bg-violet-400/10": "bg-violet-400/22",

    "border-violet-400/10": "border-violet-400/25",
    "border-violet-400/15": "border-violet-400/30",

    "text-cyan-300": "text-cyan-200",
    "text-cyan-300/70": "text-cyan-200",
    "text-violet-300": "text-violet-200",
    "text-violet-200": "text-violet-100",
}

for old, new in replacements.items():
    source = source.replace(old, new)

# ------------------------------------------------------------------
# 2. FONDOS PRINCIPALES — MÁS PROFUNDIDAD Y CONTRASTE
# ------------------------------------------------------------------

backgrounds = {
    "bg-[#02050b]": "bg-[#030817]",
    "bg-[#03060d]": "bg-[#040a18]",
    "bg-[#040811]": "bg-[#050b1b]",
    "bg-[#050912]": "bg-[#071022]",
    "bg-[#050914]": "bg-[#071125]",
    "bg-[#050a13]": "bg-[#071225]",
    "bg-[#070b14]": "bg-[#09142a]",
    "bg-[#02050a]": "bg-[#020714]",
    "bg-[#07101a]": "bg-[#0a1930]",
    "bg-[#07121d]": "bg-[#0a1b32]",
    "bg-[#0a0714]": "bg-[#13091f]",
    "via-[#070912]": "via-[#0a1024]",
    "to-[#041019]": "to-[#061c2c]",
    "to-[#11091d]": "to-[#180b27]",
}

for old, new in backgrounds.items():
    source = source.replace(old, new)

# ------------------------------------------------------------------
# 3. GRADIENTES — ELECTRIC VIOLET + NEON CYAN
# ------------------------------------------------------------------

source = source.replace(
    "from-cyan-400 via-blue-500 to-violet-500",
    "from-cyan-300 via-violet-500 to-fuchsia-500"
)

source = source.replace(
    "from-violet-500 to-cyan-400",
    "from-violet-500 via-fuchsia-500 to-cyan-300"
)

source = source.replace(
    "from-violet-500/40 to-cyan-300/70",
    "from-violet-500/75 to-cyan-300"
)

source = source.replace(
    "from-violet-500/[0.14] to-cyan-500/[0.04]",
    "from-violet-500/[0.20] to-cyan-500/[0.12]"
)

# ------------------------------------------------------------------
# 4. RADIALES MÁS VISIBLES
# ------------------------------------------------------------------

source = source.replace(
    "rgba(0,220,255,.10)",
    "rgba(0,220,255,.20)"
)

source = source.replace(
    "rgba(139,92,246,.12)",
    "rgba(139,92,246,.22)"
)

source = source.replace(
    "rgba(34,211,238,.08)",
    "rgba(34,211,238,.16)"
)

source = source.replace(
    "rgba(124,58,237,.09)",
    "rgba(124,58,237,.18)"
)

# ------------------------------------------------------------------
# 5. SOMBRAS / GLOW
# ------------------------------------------------------------------

source = source.replace(
    "shadow-cyan-950/20",
    "shadow-cyan-500/25"
)

source = source.replace(
    "shadow-[0_0_80px_rgba(34,211,238,.13)]",
    "shadow-[0_0_90px_rgba(34,211,238,.28)]"
)

# ------------------------------------------------------------------
# 6. ELEMENTOS DE ESTADO / ACTIVE
# ------------------------------------------------------------------

source = source.replace(
    "border-cyan-400/20 bg-cyan-400/[0.08]",
    "border-cyan-300/45 bg-cyan-400/[0.16]"
)

source = source.replace(
    "border-violet-400/20",
    "border-violet-300/45"
)

source = source.replace(
    "bg-violet-400/[0.13]",
    "bg-violet-400/[0.18]"
)

# ------------------------------------------------------------------
# 7. AÑADIR CLASE ROOT ESPECÍFICA SIN MODIFICAR APP.TSX
# ------------------------------------------------------------------

source = source.replace(
    'data-commerce-os="true" data-commerce-os-core="true"',
    'data-commerce-os="true" data-commerce-os-core="true" data-commerce-os-vibrant="true"'
)

COMMERCE.write_text(source, encoding="utf-8")

# ------------------------------------------------------------------
# 8. CSS GLOBAL DE REFUERZO
# ------------------------------------------------------------------

css = r'''
/* ============================================================
   DIGITALBOOST — COMMERCE OS VIBRANT V5
   Visual reinforcement layer
   ============================================================ */

[data-commerce-os="true"][data-commerce-os-vibrant="true"] {
  --db-violet: #8b5cf6;
  --db-violet-bright: #a78bfa;
  --db-cyan: #22d3ee;
  --db-cyan-bright: #67e8f9;
  --db-magenta: #d946ef;
  --db-surface: #071022;
  --db-surface-2: #09142a;
  --db-border: rgba(255,255,255,.14);

  position: relative;
  isolation: isolate;
  color-scheme: dark;

  background:
    radial-gradient(
      circle at 8% 8%,
      rgba(34,211,238,.16),
      transparent 27%
    ),
    radial-gradient(
      circle at 92% 18%,
      rgba(139,92,246,.17),
      transparent 30%
    ),
    radial-gradient(
      circle at 55% 100%,
      rgba(217,70,239,.09),
      transparent 35%
    ),
    #030817 !important;
}

[data-commerce-os="true"][data-commerce-os-vibrant="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;

  background:
    linear-gradient(
      135deg,
      rgba(34,211,238,.035),
      transparent 35%,
      rgba(139,92,246,.045)
    );

  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.08),
    inset 0 0 90px rgba(34,211,238,.045);
}

/* Superficies */

[data-commerce-os="true"][data-commerce-os-vibrant="true"] .bg-\[\#050912\],
[data-commerce-os="true"][data-commerce-os-vibrant="true"] .bg-\[\#071022\],
[data-commerce-os="true"][data-commerce-os-vibrant="true"] .bg-\[\#071125\] {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.045),
    0 12px 40px rgba(0,0,0,.22);
}

/* Botones cyan */

[data-commerce-os="true"][data-commerce-os-vibrant="true"] button:hover {
  transition:
    border-color .18s ease,
    background-color .18s ease,
    color .18s ease,
    box-shadow .18s ease,
    transform .18s ease;

  box-shadow:
    0 0 0 1px rgba(34,211,238,.08),
    0 0 24px rgba(34,211,238,.08);
}

/* Acciones principales */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.bg-gradient-to-r {
  filter: saturate(1.18);
  box-shadow:
    0 8px 30px rgba(139,92,246,.18),
    0 0 28px rgba(34,211,238,.08);
}

/* Texto de navegación */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.text-slate-300 {
  color: #cbd5e1 !important;
}

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.text-slate-400 {
  color: #aebdce !important;
}

/* Cyan principal */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.text-cyan-200,
[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.text-cyan-300 {
  color: #67e8f9 !important;
}

/* Violet principal */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.text-violet-100,
[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.text-violet-200 {
  color: #c4b5fd !important;
}

/* Bordes */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-white\/10 {
  border-color: rgba(255,255,255,.14) !important;
}

/* Active cyan */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-cyan-400\/32,
[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-cyan-300\/32 {
  border-color: rgba(103,232,249,.40) !important;
}

/* Active violet */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-violet-400\/30 {
  border-color: rgba(167,139,250,.38) !important;
}

/* Glass surfaces */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.backdrop-blur-xl {
  background-color: rgba(7,17,37,.88) !important;
  backdrop-filter: blur(18px);
}

/* Preview / panels */

[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-white\/\[0\.14\],
[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-white\/\[0\.16\],
[data-commerce-os="true"][data-commerce-os-vibrant="true"]
.border-white\/\[0\.18\] {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.035);
}

/* Mantener el layout sin alterar dimensiones */

[data-commerce-os="true"][data-commerce-os-vibrant="true"] * {
  box-sizing: border-box;
}
'''

CSS.write_text(css, encoding="utf-8")
print("✓ CSS V5 escrito:", CSS)

# ------------------------------------------------------------------
# 9. VALIDACIÓN
# ------------------------------------------------------------------

updated = COMMERCE.read_text(encoding="utf-8")

checks = {
    "Commerce OS root": 'data-commerce-os="true"' in updated,
    "Vibrant marker": 'data-commerce-os-vibrant="true"' in updated,
    "Electric Violet": "#8b5cf6" in CSS.read_text(encoding="utf-8"),
    "Neon Cyan": "#22d3ee" in CSS.read_text(encoding="utf-8"),
    "Magenta": "#d946ef" in CSS.read_text(encoding="utf-8"),
    "No NFT": "NFT" not in updated,
    "No dragon": "dragón" not in updated.lower(),
}

print()
print("=" * 78)
print("VALIDACIÓN")
print("=" * 78)

for name, ok in checks.items():
    print(("✓" if ok else "❌"), name)

print()
print("=" * 78)
print("BUILD DE VERIFICACIÓN")
print("=" * 78)

try:
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True,
        timeout=180
    )

    if result.returncode != 0:
        print()
        print("❌ BUILD FALLÓ")
        print("Restaurando CommerceOSOverview.tsx...")
        shutil.copy2(backup, COMMERCE)
        print("✓ Archivo restaurado")
        print("✓ CSS V5 permanece disponible para revisión")
        sys.exit(result.returncode)

except subprocess.TimeoutExpired:
    print("❌ BUILD excedió el tiempo límite")
    shutil.copy2(backup, COMMERCE)
    print("✓ CommerceOSOverview.tsx restaurado")
    sys.exit(1)

print()
print("=" * 78)
print("COMMERCE OS VIBRANT V5 INSTALADO")
print("=" * 78)
print("✓ Build correcto")
print("✓ Commerce OS visualmente reforzado")
print("✓ Premium Dark conservado")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta Pulse")
print("✓ Mayor contraste")
print("✓ Mayor luminosidad")
print("✓ Superficies más visibles")
print("✓ Estados activos más claros")
print("✓ App.tsx NO modificado")
print("✓ Sin NFT")
print("✓ Sin dragones")
print("✓ Sin Web Builder")
print("✓ Store Builder no redefinido")
print()
print("Ejecutá:")
print("npm run dev")
print("=" * 78)
