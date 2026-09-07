from pathlib import Path
import re
import shutil
import subprocess
from datetime import datetime

ROOT = Path.home() / "digitalboost-studio"
COMPONENT = ROOT / "src" / "WebsiteBuilderV1.tsx"

print("=" * 70)
print("DIGITALBOOST — VISUAL EDITOR ART DIRECTION")
print("EVOLUCIÓN ARTÍSTICA · ELECTRIC GLASS · PREMIUM COMMERCE OS")
print("=" * 70)

if not COMPONENT.exists():
    print("❌ No existe src/WebsiteBuilderV1.tsx")
    raise SystemExit(1)

original = COMPONENT.read_text(encoding="utf-8")

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = ROOT / "src" / f"WebsiteBuilderV1.before_art_direction_{timestamp}.tsx"
shutil.copy2(COMPONENT, backup)

print(f"✓ Backup creado: {backup.name}")

source = original

# ------------------------------------------------------------
# 1. CREAR SISTEMA VISUAL GLOBAL
# ------------------------------------------------------------

css_file = ROOT / "src" / "website-builder-art-direction.css"

css = r'''
/* ============================================================
   DIGITALBOOST — WEBSITE BUILDER
   ART DIRECTION V2
   Electric Glass / Premium Commerce OS
   ============================================================ */

.db-vibrant-editor {
  --db-bg: #05030d;
  --db-bg-2: #09051a;
  --db-surface: rgba(14, 9, 31, 0.82);
  --db-surface-strong: rgba(20, 12, 43, 0.94);

  --db-violet: #9b5cff;
  --db-violet-bright: #b77aff;
  --db-cyan: #25e7ff;
  --db-blue: #4c8dff;
  --db-magenta: #ff4fd8;

  --db-border: rgba(155, 92, 255, .24);
  --db-border-cyan: rgba(37, 231, 255, .24);

  --db-text: #f8f7ff;
  --db-muted: #a9a3bd;

  position: relative !important;
  isolation: isolate;

  min-height: 100%;

  color: var(--db-text);

  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(155, 92, 255, .20),
      transparent 28%
    ),
    radial-gradient(
      circle at 92% 8%,
      rgba(37, 231, 255, .16),
      transparent 25%
    ),
    radial-gradient(
      circle at 65% 100%,
      rgba(255, 79, 216, .10),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #04020a 0%,
      #080416 45%,
      #050914 100%
    ) !important;
}

/* Ambient light */
.db-vibrant-editor::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -2;

  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(155,92,255,.035) 48%,
      transparent 100%
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255,255,255,.018) 0,
      rgba(255,255,255,.018) 1px,
      transparent 1px,
      transparent 72px
    );

  opacity: .7;
}

/* Top electric aura */
.db-vibrant-editor::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  top: 0;
  height: 2px;

  background: linear-gradient(
    90deg,
    transparent,
    var(--db-violet),
    var(--db-cyan),
    var(--db-magenta),
    transparent
  );

  box-shadow:
    0 0 18px rgba(155,92,255,.75),
    0 0 32px rgba(37,231,255,.35);

  pointer-events: none;
  z-index: 20;
}

/* ============================================================
   SURFACES
   ============================================================ */

.db-vibrant-editor > div,
.db-vibrant-editor section {
  transition:
    border-color .22s ease,
    background .22s ease,
    box-shadow .22s ease,
    transform .22s ease;
}

.db-vibrant-editor section,
.db-vibrant-editor [class*="rounded-xl"],
.db-vibrant-editor [class*="rounded-2xl"] {
  background:
    linear-gradient(
      145deg,
      rgba(19, 11, 42, .86),
      rgba(7, 8, 21, .90)
    ) !important;

  border-color:
    rgba(155, 92, 255, .18) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.035),
    0 18px 55px rgba(0,0,0,.28);
}

/* Hoverable surfaces */
.db-vibrant-editor button:hover {
  border-color:
    rgba(37,231,255,.42) !important;

  box-shadow:
    0 0 0 1px rgba(37,231,255,.06),
    0 12px 35px rgba(37,231,255,.08),
    0 0 30px rgba(155,92,255,.08);
}

/* ============================================================
   TEXT
   ============================================================ */

.db-vibrant-editor h1,
.db-vibrant-editor h2,
.db-vibrant-editor h3 {
  color: #ffffff !important;
}

.db-vibrant-editor p,
.db-vibrant-editor span {
  text-shadow: 0 0 22px rgba(255,255,255,.015);
}

.db-vibrant-editor [class*="text-slate-500"],
.db-vibrant-editor [class*="text-slate-600"] {
  color: #918aa9 !important;
}

.db-vibrant-editor [class*="text-slate-400"] {
  color: #b3aec4 !important;
}

/* ============================================================
   ELECTRIC ACCENTS
   ============================================================ */

.db-vibrant-editor [class*="text-violet"] {
  color: var(--db-violet-bright) !important;
}

.db-vibrant-editor [class*="text-cyan"] {
  color: var(--db-cyan) !important;
}

.db-vibrant-editor [class*="text-emerald"] {
  color: #53f5bd !important;
}

/* ============================================================
   BUTTONS
   ============================================================ */

.db-vibrant-editor button {
  position: relative;
  overflow: hidden;

  transition:
    transform .18s ease,
    border-color .18s ease,
    box-shadow .18s ease,
    background .18s ease !important;
}

.db-vibrant-editor button::before {
  content: "";
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      120deg,
      transparent 20%,
      rgba(255,255,255,.07) 48%,
      transparent 75%
    );

  transform: translateX(-120%);
  transition: transform .5s ease;

  pointer-events: none;
}

.db-vibrant-editor button:hover::before {
  transform: translateX(120%);
}

.db-vibrant-editor button:focus-visible {
  outline: none !important;

  box-shadow:
    0 0 0 2px rgba(5,3,13,1),
    0 0 0 4px rgba(37,231,255,.48),
    0 0 30px rgba(37,231,255,.20) !important;
}

/* Primary-looking buttons */
.db-vibrant-editor button[class*="bg-violet"],
.db-vibrant-editor button[class*="bg-cyan"] {
  background:
    linear-gradient(
      135deg,
      #8c48ff,
      #a84dff 45%,
      #2bdfff
    ) !important;

  border-color: rgba(255,255,255,.18) !important;

  color: white !important;

  box-shadow:
    0 8px 28px rgba(137,65,255,.25),
    0 0 28px rgba(37,231,255,.10);
}

/* ============================================================
   INPUTS
   ============================================================ */

.db-vibrant-editor input,
.db-vibrant-editor textarea,
.db-vibrant-editor select {
  background:
    rgba(5,3,14,.72) !important;

  border-color:
    rgba(155,92,255,.20) !important;

  color: #f7f4ff !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025);
}

.db-vibrant-editor input:focus,
.db-vibrant-editor textarea:focus,
.db-vibrant-editor select:focus {
  border-color:
    rgba(37,231,255,.55) !important;

  outline: none !important;

  box-shadow:
    0 0 0 3px rgba(37,231,255,.08),
    0 0 24px rgba(37,231,255,.08) !important;
}

/* ============================================================
   CANVAS
   ============================================================ */

.db-vibrant-editor [class*="border-dashed"] {
  border-color:
    rgba(37,231,255,.24) !important;

  background:
    radial-gradient(
      circle at center,
      rgba(37,231,255,.055),
      transparent 55%
    ),
    rgba(5,4,14,.72) !important;

  box-shadow:
    inset 0 0 70px rgba(37,231,255,.035);
}

/* ============================================================
   ICON CONTAINERS
   ============================================================ */

.db-vibrant-editor [class*="bg-violet-500\\/10"],
.db-vibrant-editor [class*="bg-violet-400\\/5"] {
  background:
    linear-gradient(
      135deg,
      rgba(155,92,255,.18),
      rgba(255,79,216,.07)
    ) !important;

  border-color:
    rgba(155,92,255,.25) !important;
}

.db-vibrant-editor [class*="bg-cyan-400\\/5"],
.db-vibrant-editor [class*="bg-cyan-400\\/10"] {
  background:
    linear-gradient(
      135deg,
      rgba(37,231,255,.14),
      rgba(76,141,255,.06)
    ) !important;

  border-color:
    rgba(37,231,255,.24) !important;
}

/* ============================================================
   SCROLLBARS
   ============================================================ */

.db-vibrant-editor ::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.db-vibrant-editor ::-webkit-scrollbar-track {
  background: rgba(255,255,255,.015);
}

.db-vibrant-editor ::-webkit-scrollbar-thumb {
  background:
    linear-gradient(
      180deg,
      rgba(155,92,255,.75),
      rgba(37,231,255,.75)
    );

  border-radius: 99px;
}

/* ============================================================
   ACTIVE STATES
   ============================================================ */

.db-vibrant-editor [aria-selected="true"],
.db-vibrant-editor [data-active="true"] {
  border-color:
    rgba(37,231,255,.48) !important;

  background:
    linear-gradient(
      135deg,
      rgba(37,231,255,.10),
      rgba(155,92,255,.10)
    ) !important;

  box-shadow:
    0 0 0 1px rgba(37,231,255,.08),
    0 0 26px rgba(37,231,255,.08) !important;
}

/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 768px) {
  .db-vibrant-editor {
    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(155,92,255,.18),
        transparent 38%
      ),
      #05030d !important;
  }
}
'''

css_file.write_text(css, encoding="utf-8")
print("✓ Sistema artístico creado")

# ------------------------------------------------------------
# 2. IMPORTAR CSS
# ------------------------------------------------------------

if "website-builder-art-direction.css" not in source:
    import_matches = list(re.finditer(
        r'^import\s+.*?;\s*$',
        source,
        flags=re.MULTILINE
    ))

    if import_matches:
        pos = import_matches[-1].end()
        source = (
            source[:pos]
            + '\nimport "./website-builder-art-direction.css";'
            + source[pos:]
        )
    else:
        source = (
            'import "./website-builder-art-direction.css";\n'
            + source
        )

    print("✓ CSS artístico conectado")
else:
    print("✓ CSS artístico ya estaba conectado")

# ------------------------------------------------------------
# 3. LOCALIZAR ROOT REAL DEL COMPONENTE
# ------------------------------------------------------------

# Buscamos el primer return (...) después de export default function
component_pos = source.find("export default function WebsiteBuilderV1")

if component_pos == -1:
    component_pos = source.find("function WebsiteBuilderV1")

if component_pos == -1:
    print("❌ No pude localizar WebsiteBuilderV1")
    shutil.copy2(backup, COMPONENT)
    raise SystemExit(1)

return_pos = source.find("return (", component_pos)

if return_pos == -1:
    print("❌ No pude localizar el return del componente")
    shutil.copy2(backup, COMPONENT)
    raise SystemExit(1)

root_pos = source.find("<div", return_pos)

if root_pos == -1:
    print("❌ No pude localizar el root <div>")
    shutil.copy2(backup, COMPONENT)
    raise SystemExit(1)

# ------------------------------------------------------------
# 4. INYECTAR IDENTIDAD EN ROOT
# ------------------------------------------------------------

root_end = source.find(">", root_pos)

if root_end == -1:
    print("❌ Root JSX inválido")
    shutil.copy2(backup, COMPONENT)
    raise SystemExit(1)

root_tag = source[root_pos:root_end + 1]

if "db-vibrant-editor" not in root_tag:

    class_match = re.search(
        r'className\s*=\s*"([^"]*)"',
        root_tag
    )

    if class_match:
        old_class = class_match.group(1)

        new_class = (
            old_class
            + " db-vibrant-editor"
        )

        new_root_tag = root_tag.replace(
            class_match.group(0),
            f'className="{new_class}"',
            1
        )

    else:
        new_root_tag = root_tag[:-1] + ' className="db-vibrant-editor">'

    source = (
        source[:root_pos]
        + new_root_tag
        + source[root_end + 1:]
    )

    print("✓ Identidad visual conectada al root real")
else:
    print("✓ Identidad visual ya conectada")

# ------------------------------------------------------------
# 5. ESCRIBIR
# ------------------------------------------------------------

COMPONENT.write_text(source, encoding="utf-8")
print("✓ WebsiteBuilderV1.tsx actualizado")

# ------------------------------------------------------------
# 6. BUILD
# ------------------------------------------------------------

print()
print("=" * 70)
print("BUILD DE VERIFICACIÓN")
print("=" * 70)

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
        print("Restaurando backup...")
        shutil.copy2(backup, COMPONENT)
        print("✓ Workspace restaurado")
        raise SystemExit(result.returncode)

except subprocess.TimeoutExpired:
    print("❌ BUILD EXCEDIÓ EL TIEMPO")
    shutil.copy2(backup, COMPONENT)
    print("✓ Workspace restaurado")
    raise SystemExit(1)

print("✅ BUILD CORRECTO")

print()
print("=" * 70)
print("DIGITALBOOST — ART DIRECTION V2 INSTALADA")
print("=" * 70)
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta accent")
print("✓ Ambient lighting")
print("✓ Glass / layered surfaces")
print("✓ Canvas atmosphere")
print("✓ Interactive hover lighting")
print("✓ Focus states")
print("✓ Premium inputs")
print("✓ Active states")
print("✓ Custom scrollbar")
print("✓ Responsive visual treatment")
print()
print(f"Backup: {backup.name}")
print(f"CSS: {css_file.name}")
print()
print("Ahora ejecutá:")
print("npm run dev")
print()
print("Y abrí:")
print("Store Builder → Website Builder")
