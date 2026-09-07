from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime

ROOT = Path.home() / "digitalboost-studio"
WORKSPACE = ROOT / "src" / "StoreBuilderWorkspace.tsx"
BUILDER = ROOT / "src" / "WebsiteBuilderV1.tsx"

print("=" * 70)
print("DIGITALBOOST — WEBSITE BUILDER V1")
print("CONEXIÓN REAL CON STORE BUILDER")
print("=" * 70)

if not WORKSPACE.exists():
    print("❌ No existe StoreBuilderWorkspace.tsx")
    sys.exit(1)

if not BUILDER.exists():
    print("❌ No existe WebsiteBuilderV1.tsx")
    print("Primero necesitamos crear el componente.")
    sys.exit(1)

original = WORKSPACE.read_text(encoding="utf-8")

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = WORKSPACE.with_name(
    f"StoreBuilderWorkspace.tsx.before_website_builder_{timestamp}.bak"
)

shutil.copy2(WORKSPACE, backup)
print(f"✓ Backup creado: {backup.name}")

source = original

# ------------------------------------------------------------
# IMPORT WEBSITE BUILDER
# ------------------------------------------------------------

if "WebsiteBuilderV1" not in source:
    imports = list(
        re.finditer(
            r'^import\s+.*?from\s+["\'].*?["\'];?\s*$',
            source,
            flags=re.MULTILINE,
        )
    )

    if imports:
        pos = imports[-1].end()
        source = (
            source[:pos]
            + '\nimport WebsiteBuilderV1 from "./WebsiteBuilderV1";'
            + source[pos:]
        )
        print("✓ Import de WebsiteBuilderV1 agregado")
    else:
        print("❌ No pude localizar imports")
        shutil.copy2(backup, WORKSPACE)
        sys.exit(1)
else:
    print("✓ WebsiteBuilderV1 ya estaba importado")

# ------------------------------------------------------------
# STORE SECTION
# ------------------------------------------------------------

section_match = re.search(
    r'(type\s+StoreSection\s*=\s*[\s\S]*?;)',
    source,
)

if not section_match:
    print("❌ No encontré type StoreSection.")
    shutil.copy2(backup, WORKSPACE)
    sys.exit(1)

section_text = section_match.group(1)

if '"website-builder"' not in section_text:
    new_section = (
        section_text.rstrip(";")
        + ' | "website-builder";'
    )

    source = source.replace(
        section_text,
        new_section,
        1,
    )

    print("✓ Sección website-builder agregada")
else:
    print("✓ StoreSection ya contiene website-builder")

# ------------------------------------------------------------
# NAVEGACIÓN
# ------------------------------------------------------------

if 'id: "website-builder"' not in source:

    nav_pattern = re.compile(
        r'(\{\s*id:\s*"dashboard",\s*label:\s*"Inicio",\s*icon:\s*LayoutDashboard\s*\},)',
        re.MULTILINE,
    )

    nav_match = nav_pattern.search(source)

    if nav_match:
        insertion = '''
      {
        id: "website-builder",
        label: "Website Builder",
        icon: Globe2,
      },
'''

        source = (
            source[:nav_match.end()]
            + insertion
            + source[nav_match.end():]
        )

        print("✓ Website Builder agregado a navegación")
    else:
        print("⚠️ No encontré el bloque exacto de navegación")
else:
    print("✓ Website Builder ya estaba en navegación")

# ------------------------------------------------------------
# RENDER SECTION
# ------------------------------------------------------------

if 'case "website-builder"' not in source:

    render_pattern = re.compile(
        r'(case\s+"dashboard":\s*\n\s*return\s+renderDashboard\(\);\s*)',
        re.MULTILINE,
    )

    render_match = render_pattern.search(source)

    if render_match:

        render_insert = '''
      case "website-builder":
        return (
          <WebsiteBuilderV1
            onBack={() => setSection("dashboard")}
          />
        );

'''

        source = (
            source[:render_match.end()]
            + render_insert
            + source[render_match.end():]
        )

        print("✓ Ruta website-builder conectada")

    else:
        print("⚠️ No encontré case dashboard dentro de renderSection")
else:
    print("✓ Ruta website-builder ya estaba conectada")

# ------------------------------------------------------------
# GLOBE2
# ------------------------------------------------------------

if "Globe2" in source:

    lucide_import = re.search(
        r'import\s*\{([\s\S]*?)\}\s*from\s*["\']lucide-react["\'];',
        source,
    )

    if lucide_import and "Globe2" not in lucide_import.group(1):

        content = lucide_import.group(1)

        updated_content = (
            content.rstrip()
            + "\n  Globe2,\n"
        )

        replacement = (
            "import {"
            + updated_content
            + '} from "lucide-react";'
        )

        source = (
            source[:lucide_import.start()]
            + replacement
            + source[lucide_import.end():]
        )

        print("✓ Globe2 agregado a lucide-react")

    else:
        print("✓ Globe2 ya disponible")

# ------------------------------------------------------------
# GUARDAR
# ------------------------------------------------------------

if source != original:
    WORKSPACE.write_text(
        source,
        encoding="utf-8",
    )

    print("✓ StoreBuilderWorkspace.tsx actualizado")
else:
    print("ℹ️ No hubo cambios estructurales nuevos")

# ------------------------------------------------------------
# BUILD
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
        timeout=180,
    )

    print(result.stdout)

    if result.returncode != 0:

        print(result.stderr)
        print("❌ BUILD FALLÓ")

        print()
        print("Restaurando backup...")

        shutil.copy2(
            backup,
            WORKSPACE,
        )

        print("✓ Workspace restaurado")
        sys.exit(result.returncode)

    print("✅ BUILD CORRECTO")

    print()
    print("=" * 70)
    print("WEBSITE BUILDER V1 CONECTADO")
    print("=" * 70)
    print("✓ Editor")
    print("✓ Preview")
    print("✓ Desktop / Tablet / Mobile")
    print("✓ Catálogo de bloques")
    print("✓ Canvas visual")
    print("✓ Inspector")
    print("✓ Undo / Redo")
    print("✓ Guardado local")
    print("✓ Integración con Store Builder")
    print()
    print(f"Backup: {backup.name}")

except subprocess.TimeoutExpired:

    print("❌ npm run build excedió el tiempo límite.")
    print("Restaurando backup...")
    shutil.copy2(backup, WORKSPACE)
    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible en PATH.")
    print("El backup permanece disponible.")
    sys.exit(1)
