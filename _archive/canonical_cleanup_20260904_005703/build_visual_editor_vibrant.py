#!/usr/bin/env python3

from pathlib import Path
import shutil
import re
import subprocess
from datetime import datetime

ROOT = Path.home() / "digitalboost-studio"

print("=" * 70)
print("DIGITALBOOST — VISUAL EDITOR VIBRANT UI")
print("EVOLUCIÓN VISUAL · PREMIUM DARK · ELECTRIC SYSTEM")
print("=" * 70)
print()

# ------------------------------------------------------------
# BUSCAR COMPONENTE
# ------------------------------------------------------------

candidates = [
    ROOT / "src" / "VisualEditorCore.tsx",
    ROOT / "src" / "VisualEditor.tsx",
    ROOT / "src" / "VisualEditorCore.jsx",
    ROOT / "src" / "VisualEditor.jsx",
    ROOT / "src" / "WebsiteBuilderV1.tsx",
]

workspace = None

for candidate in candidates:
    if candidate.exists():
        workspace = candidate
        break

if workspace is None:
    matches = list(ROOT.glob("src/**/*Visual*Editor*.tsx"))
    matches += list(ROOT.glob("src/**/*Website*Builder*.tsx"))

    if matches:
        workspace = matches[0]

if workspace is None:
    print("❌ No encontré el componente del Visual Editor.")
    print()
    print("Archivos candidatos buscados:")
    for candidate in candidates:
        print(f"  - {candidate}")
    print()
    print("No se modificó ningún archivo.")
    raise SystemExit(1)

print(f"✓ Componente encontrado: {workspace.relative_to(ROOT)}")

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = workspace.with_name(
    f"{workspace.stem}.before_vibrant_ui_{timestamp}{workspace.suffix}"
)

shutil.copy2(workspace, backup)

print(f"✓ Backup creado: {backup.name}")

source = workspace.read_text(encoding="utf-8")
original = source

# ------------------------------------------------------------
# PALETA PRINCIPAL
# ------------------------------------------------------------

replacements = {
    # Fondos
    "bg-[#030914]": "bg-[#050712]",
    "bg-[#070b14]": "bg-[#080b18]",
    "bg-[#07101e]": "bg-[#0a0d1f]",
    "bg-[#071326]": "bg-[#0c1028]",
    "bg-[#090817]": "bg-[#120b25]",
    "bg-black/20": "bg-white/[0.025]",

    # Bordes apagados
    "border-white/5": "border-white/[0.08]",
    "border-white/10": "border-white/[0.11]",
    "border-white/[.06]": "border-white/[0.08]",
    "border-white/[.07]": "border-white/[0.09]",

    # Violetas apagados
    "text-violet-300": "text-violet-200",
    "text-violet-400": "text-violet-300",
    "bg-violet-400/5": "bg-violet-400/[0.08]",
    "bg-violet-500/10": "bg-violet-500/[0.13]",
    "border-violet-400/15": "border-violet-400/25",
    "border-violet-400/20": "border-violet-400/25",

    # Cyan
    "text-cyan-300": "text-cyan-200",
    "text-cyan-400": "text-cyan-300",
    "bg-cyan-400/5": "bg-cyan-400/[0.08]",
    "bg-cyan-400/10": "bg-cyan-400/[0.12]",
    "bg-cyan-500/10": "bg-cyan-500/[0.14]",
    "border-cyan-400/10": "border-cyan-400/20",
    "border-cyan-400/15": "border-cyan-400/25",
    "border-cyan-400/20": "border-cyan-400/30",

    # Hover
    "hover:border-cyan-400/25": "hover:border-cyan-300/45",
    "hover:border-violet-400/30": "hover:border-violet-300/45",
    "hover:text-cyan-300": "hover:text-cyan-200",
    "hover:text-violet-300": "hover:text-violet-200",

    # Texto secundario: un poco más legible
    "text-slate-500": "text-slate-400",
    "text-slate-600": "text-slate-500",
}

for old, new in replacements.items():
    source = source.replace(old, new)

# ------------------------------------------------------------
# GRADIENTES MÁS VIVOS
# ------------------------------------------------------------

source = source.replace(
    "from-[#07101e] via-[#071326] to-[#090817]",
    "from-[#0a1028] via-[#11103a] to-[#180c2d]"
)

source = source.replace(
    "from-cyan-400/[0.04]",
    "from-cyan-400/[0.08]"
)

source = source.replace(
    "from-violet-500/10",
    "from-violet-500/[0.16]"
)

source = source.replace(
    "bg-cyan-500/10",
    "bg-cyan-400/[0.14]"
)

# ------------------------------------------------------------
# AÑADIR CLASE VISUAL GLOBAL
# ------------------------------------------------------------

# Buscamos el primer contenedor principal que tenga space-y
pattern = re.compile(
    r'<div className="space-y-6([^"]*)">',
    re.MULTILINE
)

match = pattern.search(source)

if match:
    old = match.group(0)

    if "visual-editor-vibrant" not in old:
        new = old.replace(
            'className="space-y-6',
            'className="visual-editor-vibrant relative space-y-6'
        )

        source = source[:match.start()] + new + source[match.end():]

        print("✓ Identidad visual global agregada")
    else:
        print("✓ Identidad visual global ya presente")
else:
    print("⚠️ No encontré contenedor principal para identidad visual")

# ------------------------------------------------------------
# CSS LOCAL
# ------------------------------------------------------------

css_block = r'''

/* ============================================================
   DIGITALBOOST VISUAL EDITOR — VIBRANT SYSTEM
   Premium dark / electric / glass / creative
   ============================================================ */

<style>{`
  .visual-editor-vibrant {
    --db-violet: #8b5cf6;
    --db-purple: #a855f7;
    --db-cyan: #22d3ee;
    --db-blue: #38bdf8;
    --db-green: #34d399;
    --db-orange: #fb923c;
  }

  .visual-editor-vibrant button,
  .visual-editor-vibrant [role="button"] {
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background-color 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease;
  }

  .visual-editor-vibrant button:hover {
    box-shadow:
      0 0 0 1px rgba(139, 92, 246, 0.06),
      0 12px 35px rgba(8, 10, 30, 0.35);
  }

  .visual-editor-vibrant input:focus,
  .visual-editor-vibrant textarea:focus,
  .visual-editor-vibrant select:focus {
    outline: none;
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow:
      0 0 0 3px rgba(34, 211, 238, 0.08),
      0 0 25px rgba(34, 211, 238, 0.08);
  }

  .visual-editor-vibrant ::selection {
    background: rgba(139, 92, 246, 0.35);
    color: white;
  }
`}</style>
'''

# Solo insertar si parece ser JSX TSX
if "visual-editor-vibrant" in source and "DIGITALBOOST VISUAL EDITOR — VIBRANT SYSTEM" not in source:
    # Insertar después del primer return (
    return_match = re.search(r'return\s*\(\s*', source)

    if return_match:
        pos = return_match.end()
        source = (
            source[:pos]
            + css_block
            + "\n"
            + source[pos:]
        )

        print("✓ Sistema visual Vibrant agregado")
    else:
        print("⚠️ No pude localizar return JSX para insertar estilos")
else:
    if "DIGITALBOOST VISUAL EDITOR — VIBRANT SYSTEM" in source:
        print("✓ Sistema visual Vibrant ya estaba presente")

# ------------------------------------------------------------
# MEJORAR ALGUNOS ELEMENTOS DE ESTADO ACTIVO
# ------------------------------------------------------------

source = source.replace(
    "bg-violet-500/20",
    "bg-violet-500/[0.24]"
)

source = source.replace(
    "border-violet-500/30",
    "border-violet-400/45"
)

source = source.replace(
    "bg-cyan-500/20",
    "bg-cyan-400/[0.20]"
)

source = source.replace(
    "border-cyan-500/30",
    "border-cyan-400/45"
)

# ------------------------------------------------------------
# ESCRIBIR SOLO SI HUBO CAMBIOS
# ------------------------------------------------------------

if source == original:
    print()
    print("ℹ️ No se detectaron cambios visuales nuevos.")
else:
    workspace.write_text(source, encoding="utf-8")
    print("✓ Paleta Vibrant aplicada")

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

print()
print("=" * 70)
print("BUILD DE VERIFICACIÓN")
print("=" * 70)
print()

try:
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=180,
    )

    if result.stdout:
        print(result.stdout)

    if result.returncode != 0:
        print(result.stderr)
        print()
        print("❌ BUILD FALLÓ")
        print("Restaurando backup...")

        shutil.copy2(backup, workspace)

        print("✓ Workspace restaurado")
        print(f"✓ Backup utilizado: {backup.name}")

        raise SystemExit(result.returncode)

    print()
    print("✅ BUILD CORRECTO")
    print()
    print("=" * 70)
    print("DIGITALBOOST VIBRANT UI INSTALADO")
    print("=" * 70)
    print()
    print("✓ Dark premium conservado")
    print("✓ Violet electric")
    print("✓ Cyan tecnológico")
    print("✓ Estados activos más luminosos")
    print("✓ Contraste mejorado")
    print("✓ Glass/layered surfaces")
    print("✓ Hover interactivo")
    print("✓ Focus states")
    print("✓ Visual identity consistente")
    print("✓ Backup disponible")
    print()
    print(f"Backup: {backup.name}")
    print()
    print("Ejecutá:")
    print("  npm run dev")
    print()
    print("Luego abrí Store Builder → Visual Editor.")
    print()

except subprocess.TimeoutExpired:
    print("❌ npm run build excedió el tiempo límite.")
    print("Restaurando backup...")

    shutil.copy2(backup, workspace)

    print("✓ Workspace restaurado")
    raise SystemExit(1)

except FileNotFoundError:
    print("❌ npm no está disponible en PATH.")
    print("El archivo no fue restaurado automáticamente.")
    print(f"Backup disponible: {backup.name}")
    raise SystemExit(1)

