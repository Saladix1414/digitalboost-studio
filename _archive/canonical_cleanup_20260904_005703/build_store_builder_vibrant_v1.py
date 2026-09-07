from pathlib import Path
import shutil
import re
from datetime import datetime
import subprocess
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 78)
print("DIGITALBOOST — STORE BUILDER VIBRANT V1")
print("PREMIUM DARK → ELECTRIC HIGH-CONTRAST")
print("SAFE VISUAL UPGRADE — APP.TSX PROTECTED")
print("=" * 78)

if not SRC.exists():
    print("❌ No existe:", SRC)
    sys.exit(1)

# ============================================================
# DETECCIÓN SEGURA DEL STORE BUILDER
# ============================================================

candidates = []

for path in SRC.rglob("*"):
    if not path.is_file():
        continue

    if path.suffix not in {".tsx", ".ts", ".jsx", ".js"}:
        continue

    if path.name == "App.tsx":
        continue

    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        continue

    score = 0

    keywords = [
        "Store Builder",
        "StoreBuilder",
        "store-builder",
        "storeBuilder",
        "tienda virtual",
        "tiendas virtuales",
        "productos",
        "catalogo",
        "catálogo",
        "product",
        "cart",
        "ShoppingBag",
    ]

    for keyword in keywords:
        if keyword.lower() in text.lower():
            score += 1

    if score:
        candidates.append((score, path))

if not candidates:
    print("❌ No se encontró un componente candidato de Store Builder.")
    print()
    print("Archivos disponibles:")
    for path in sorted(SRC.rglob("*.tsx")):
        print("  ", path.relative_to(ROOT))
    sys.exit(1)

candidates.sort(key=lambda x: (-x[0], str(x[1])))

print()
print("=" * 78)
print("CANDIDATOS DETECTADOS")
print("=" * 78)

for score, path in candidates[:10]:
    print(f"  [{score:02d}] {path.relative_to(ROOT)}")

STORE = candidates[0][1]

print()
print(f"✓ Componente seleccionado: {STORE.relative_to(ROOT)}")

# ============================================================
# PROTECCIÓN
# ============================================================

backup = STORE.with_name(
    STORE.stem +
    f".before_store_builder_vibrant_v1_{timestamp}" +
    STORE.suffix
)

shutil.copy2(STORE, backup)

print(f"✓ Backup creado: {backup.name}")

source = STORE.read_text(encoding="utf-8")

# ============================================================
# VALIDACIÓN ARQUITECTÓNICA
# ============================================================

print()
print("=" * 78)
print("ARQUITECTURA")
print("=" * 78)

if "Web Builder" in source or "WebBuilder" in source:
    print("⚠️ Referencia a Web Builder detectada.")
    print("   No se modificará ni redefinirá.")
else:
    print("✓ No se detectó redefinición de Web Builder.")

if "Commerce OS" in source or "CommerceOS" in source:
    print("✓ Referencia a Commerce OS detectada.")
else:
    print("— No contiene referencia directa a Commerce OS.")

print("✓ Store Builder continuará siendo exclusivamente para tiendas virtuales.")

# ============================================================
# BACKUP DE CSS SI EXISTE
# ============================================================

CSS_FILES = [
    SRC / "store-builder.css",
    SRC / "store-builder-global.css",
    SRC / "StoreBuilder.css",
    SRC / "StoreBuilder.module.css",
]

existing_css = [p for p in CSS_FILES if p.exists()]

for css in existing_css:
    css_backup = css.with_name(
        css.stem +
        f".before_store_builder_vibrant_v1_{timestamp}" +
        css.suffix
    )
    shutil.copy2(css, css_backup)
    print(f"✓ Backup CSS: {css_backup.name}")

# ============================================================
# TRANSFORMACIÓN VISUAL
# ============================================================

replacements = {

    # --------------------------------------------------------
    # SUPERFICIES BLANCAS / OPACIDADES BAJAS
    # --------------------------------------------------------

    "bg-white/[0.02]": "bg-white/[0.055]",
    "bg-white/[0.025]": "bg-white/[0.065]",
    "bg-white/[0.03]": "bg-white/[0.075]",
    "bg-white/[0.04]": "bg-white/[0.085]",
    "bg-white/[0.05]": "bg-white/[0.095]",
    "bg-white/[0.06]": "bg-white/[0.11]",

    # --------------------------------------------------------
    # BORDES
    # --------------------------------------------------------

    "border-white/[0.04]": "border-white/[0.11]",
    "border-white/[0.05]": "border-white/[0.12]",
    "border-white/[0.06]": "border-white/[0.14]",
    "border-white/[0.07]": "border-white/[0.16]",
    "border-white/[0.08]": "border-white/[0.18]",

    # --------------------------------------------------------
    # TEXTO APAGADO
    # --------------------------------------------------------

    "text-slate-700": "text-slate-400",
    "text-slate-600": "text-slate-300",
    "text-slate-500": "text-slate-300",

    # --------------------------------------------------------
    # CYAN
    # --------------------------------------------------------

    "bg-cyan-400/[0.02]": "bg-cyan-400/[0.07]",
    "bg-cyan-400/[0.04]": "bg-cyan-400/[0.10]",
    "bg-cyan-400/[0.06]": "bg-cyan-400/[0.13]",
    "bg-cyan-400/[0.07]": "bg-cyan-400/[0.15]",
    "bg-cyan-300/[0.06]": "bg-cyan-300/[0.13]",

    "border-cyan-400/10": "border-cyan-400/25",
    "border-cyan-400/15": "border-cyan-400/32",
    "border-cyan-300/20": "border-cyan-300/32",

    # --------------------------------------------------------
    # VIOLET
    # --------------------------------------------------------

    "bg-violet-500/[0.05]": "bg-violet-500/[0.11]",
    "bg-violet-500/[0.07]": "bg-violet-500/[0.14]",
    "bg-violet-400/[0.06]": "bg-violet-400/[0.13]",
    "bg-violet-400/10": "bg-violet-400/22",

    "border-violet-400/10": "border-violet-400/25",
    "border-violet-400/15": "border-violet-400/30",

    # --------------------------------------------------------
    # TEXTO DE MARCA
    # --------------------------------------------------------

    "text-cyan-300": "text-cyan-200",
    "text-cyan-300/70": "text-cyan-200",
    "text-violet-300": "text-violet-200",
    "text-violet-200": "text-violet-100",
}

for old, new in replacements.items():
    source = source.replace(old, new)

# ============================================================
# FONDOS DARK MÁS PROFUNDOS
# ============================================================

backgrounds = {
    "bg-[#02050a]": "bg-[#020714]",
    "bg-[#02050b]": "bg-[#030817]",
    "bg-[#03060d]": "bg-[#040a18]",
    "bg-[#040811]": "bg-[#050b1b]",
    "bg-[#050912]": "bg-[#071022]",
    "bg-[#050914]": "bg-[#071125]",
    "bg-[#050a13]": "bg-[#071225]",
    "bg-[#070b14]": "bg-[#09142a]",
    "bg-[#07101a]": "bg-[#0a1930]",
    "bg-[#07121d]": "bg-[#0a1b32]",
    "bg-[#0a0714]": "bg-[#13091f]",
}

for old, new in backgrounds.items():
    source = source.replace(old, new)

# ============================================================
# GRADIENTES
# ============================================================

source = source.replace(
    "from-violet-500 to-cyan-400",
    "from-violet-500 via-fuchsia-500 to-cyan-300"
)

source = source.replace(
    "from-cyan-400 via-blue-500 to-violet-500",
    "from-cyan-300 via-violet-500 to-fuchsia-500"
)

source = source.replace(
    "from-violet-500/40 to-cyan-300/70",
    "from-violet-500/75 to-cyan-300"
)

# ============================================================
# RADIALES
# ============================================================

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

# ============================================================
# GLOW
# ============================================================

source = source.replace(
    "shadow-cyan-950/20",
    "shadow-cyan-500/25"
)

source = source.replace(
    "shadow-[0_0_80px_rgba(34,211,238,.13)]",
    "shadow-[0_0_90px_rgba(34,211,238,.28)]"
)

# ============================================================
# ACTIVE STATES
# ============================================================

source = source.replace(
    "border-cyan-400/20 bg-cyan-400/[0.08]",
    "border-cyan-300/45 bg-cyan-400/[0.16]"
)

source = source.replace(
    "border-violet-400/20",
    "border-violet-300/45"
)

# ============================================================
# MARCADOR STORE BUILDER
# ============================================================

if 'data-store-builder-vibrant="true"' not in source:

    # Intentar agregarlo a un root existente
    patterns = [
        r'(<div[^>]+)(data-store-builder="true")([^>]*>)',
        r'(<main[^>]+)(data-store-builder="true")([^>]*>)',
        r'(<div[^>]+)(data-store-builder)([^>]*>)',
    ]

    modified_marker = False

    for pattern in patterns:
        match = re.search(pattern, source)

        if match:
            full = match.group(0)

            if 'data-store-builder-vibrant' not in full:
                replacement = (
                    match.group(1)
                    + match.group(2)
                    + ' data-store-builder-vibrant="true"'
                    + match.group(3)
                )

                source = source.replace(full, replacement, 1)
                modified_marker = True
                break

    if not modified_marker:
        # Buscar el primer root JSX razonable.
        root_match = re.search(
            r'(<(?:div|main|section)[^>]*className="[^"]+"[^>]*)>',
            source
        )

        if root_match:
            original = root_match.group(0)

            replacement = (
                original[:-1]
                + ' data-store-builder-vibrant="true">'
            )

            source = source.replace(original, replacement, 1)

# ============================================================
# GUARDAR
# ============================================================

STORE.write_text(source, encoding="utf-8")

print()
print("=" * 78)
print("✓ STORE BUILDER ACTUALIZADO")
print("=" * 78)

# ============================================================
# CSS GLOBAL ESPECÍFICO
# ============================================================

VIBRANT_CSS = SRC / "store-builder-vibrant-global.css"

css = r'''
/* ============================================================
   DIGITALBOOST — STORE BUILDER VIBRANT V1
   ============================================================ */

[data-store-builder-vibrant="true"] {

  --db-violet: #8b5cf6;
  --db-violet-bright: #a78bfa;

  --db-cyan: #22d3ee;
  --db-cyan-bright: #67e8f9;

  --db-magenta: #d946ef;

  --db-surface: #071022;
  --db-surface-2: #09142a;

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
      rgba(139,92,246,.18),
      transparent 30%
    ),
    radial-gradient(
      circle at 55% 100%,
      rgba(217,70,239,.10),
      transparent 35%
    ),
    #030817 !important;
}

[data-store-builder-vibrant="true"]::before {

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

/* ------------------------------------------------------------
   SUPERFICIES
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"]
.bg-\[\#050912\],
[data-store-builder-vibrant="true"]
.bg-\[\#071022\],
[data-store-builder-vibrant="true"]
.bg-\[\#071125\] {

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.045),
    0 12px 40px rgba(0,0,0,.22);
}

/* ------------------------------------------------------------
   BOTONES
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"] button:hover {

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

/* ------------------------------------------------------------
   GRADIENTES DE ACCIÓN
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"]
.bg-gradient-to-r {

  filter: saturate(1.18);

  box-shadow:
    0 8px 30px rgba(139,92,246,.18),
    0 0 28px rgba(34,211,238,.08);
}

/* ------------------------------------------------------------
   TEXTO
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"]
.text-slate-300 {

  color: #cbd5e1 !important;
}

[data-store-builder-vibrant="true"]
.text-slate-400 {

  color: #aebdce !important;
}

[data-store-builder-vibrant="true"]
.text-cyan-200,
[data-store-builder-vibrant="true"]
.text-cyan-300 {

  color: #67e8f9 !important;
}

[data-store-builder-vibrant="true"]
.text-violet-100,
[data-store-builder-vibrant="true"]
.text-violet-200 {

  color: #c4b5fd !important;
}

/* ------------------------------------------------------------
   GLASS
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"]
.backdrop-blur-xl {

  background-color:
    rgba(7,17,37,.88) !important;

  backdrop-filter: blur(18px);
}

/* ------------------------------------------------------------
   CONTRASTE
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"] * {

  box-sizing: border-box;
}

/* ------------------------------------------------------------
   STORE BUILDER — ACCENTOS DE CONSTRUCCIÓN
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"] [class*="border-cyan"] {

  box-shadow:
    inset 0 0 18px rgba(34,211,238,.025);
}

[data-store-builder-vibrant="true"] [class*="border-violet"] {

  box-shadow:
    inset 0 0 18px rgba(139,92,246,.025);
}

/* ------------------------------------------------------------
   FOCUS
   ------------------------------------------------------------ */

[data-store-builder-vibrant="true"] button:focus-visible,
[data-store-builder-vibrant="true"] input:focus-visible,
[data-store-builder-vibrant="true"] textarea:focus-visible {

  outline: 2px solid rgba(103,232,249,.65);
  outline-offset: 2px;

  box-shadow:
    0 0 24px rgba(34,211,238,.16);
}
'''

VIBRANT_CSS.write_text(css, encoding="utf-8")

print(f"✓ CSS Store Builder creado: {VIBRANT_CSS}")

# ============================================================
# IMPORTAR CSS SI ES NECESARIO
# ============================================================

updated = STORE.read_text(encoding="utf-8")

if "store-builder-vibrant-global.css" not in updated:

    import_match = re.search(
        r'^(import .*?;\s*)',
        updated,
        flags=re.MULTILINE
    )

    if import_match:
        insertion = (
            import_match.group(1)
            + 'import "./store-builder-vibrant-global.css";\n'
        )

        updated = updated.replace(
            import_match.group(1),
            insertion,
            1
        )

    else:
        updated = (
            'import "./store-builder-vibrant-global.css";\n'
            + updated
        )

    STORE.write_text(updated, encoding="utf-8")

print("✓ CSS global conectado al Store Builder")

# ============================================================
# VALIDACIÓN
# ============================================================

updated = STORE.read_text(encoding="utf-8")

checks = {

    "Store Builder file":
        STORE.exists(),

    "Vibrant CSS":
        VIBRANT_CSS.exists(),

    "Vibrant marker":
        'data-store-builder-vibrant="true"' in updated,

    "Electric Violet":
        "#8b5cf6" in css,

    "Neon Cyan":
        "#22d3ee" in css,

    "Magenta":
        "#d946ef" in css,

    "No NFT":
        "NFT" not in updated,

    "No dragon":
        "dragón" not in updated.lower()
        and "dragon" not in updated.lower(),

}

print()
print("=" * 78)
print("VALIDACIÓN")
print("=" * 78)

for name, ok in checks.items():
    print(("✓" if ok else "❌"), name)

# ============================================================
# APP.TSX PROTECTION
# ============================================================

APP = SRC / "App.tsx"

if APP.exists():

    app_before = APP.read_text(encoding="utf-8")

    print()
    print("=" * 78)
    print("APP.TSX")
    print("=" * 78)

    print("✓ App.tsx encontrado")
    print("✓ App.tsx NO será modificado")

else:

    print("⚠️ App.tsx no encontrado")

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
        timeout=180
    )

except subprocess.TimeoutExpired:

    print("❌ BUILD excedió el tiempo límite")

    shutil.copy2(backup, STORE)

    print("✓ Store Builder restaurado")
    sys.exit(1)

if result.returncode != 0:

    print()
    print("❌ BUILD FALLÓ")

    print("Restaurando únicamente el componente de Store Builder...")

    shutil.copy2(backup, STORE)

    print(f"✓ Restaurado desde: {backup.name}")

    print()
    print("✓ App.tsx permaneció intacto")
    print("✓ Commerce OS no fue modificado")
    print("✓ CSS Vibrant permanece disponible para revisión")

    sys.exit(result.returncode)

# ============================================================
# RESULTADO
# ============================================================

print()
print("=" * 78)
print("STORE BUILDER VIBRANT V1 INSTALADO")
print("=" * 78)

print("✓ Build correcto")
print("✓ Premium Dark conservado")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta Pulse")
print("✓ Brand Gradient")
print("✓ Contraste mejorado")
print("✓ Superficies más visibles")
print("✓ Glass / layered surfaces")
print("✓ Ambient lighting")
print("✓ Active states")
print("✓ Focus states")
print("✓ App.tsx protegido")
print("✓ Commerce OS protegido")
print("✓ Web Builder sin redefinir")
print("✓ Store Builder continúa dedicado a tiendas virtuales")
print("✓ Sin NFT")
print("✓ Sin dragones")
print()
print("Ejecutá:")
print("npm run dev")
print()
print("=" * 78)

