#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import re
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
WORKSPACE = ROOT / "src" / "StoreBuilderWorkspace.tsx"
SHELL = ROOT / "src" / "StoreBuilderStudioShell.tsx"
WEBSITE = ROOT / "src" / "WebsiteBuilderV1.tsx"

print("=" * 70)
print("DIGITALBOOST — STORE BUILDER STUDIO CONNECTION")
print("COMMERCE OS CORE → STORE BUILDER → VISUAL STUDIO")
print("=" * 70)

# ------------------------------------------------------------
# VALIDACIONES
# ------------------------------------------------------------

if not WORKSPACE.exists():
    print("❌ No existe StoreBuilderWorkspace.tsx")
    sys.exit(1)

if not SHELL.exists():
    print("❌ No existe StoreBuilderStudioShell.tsx")
    print("Primero debe existir el Studio Shell.")
    sys.exit(1)

if not WEBSITE.exists():
    print("❌ No existe WebsiteBuilderV1.tsx")
    sys.exit(1)

original = WORKSPACE.read_text(encoding="utf-8")
source = original

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

backup = WORKSPACE.with_name(
    f"StoreBuilderWorkspace.before_studio_connection_{timestamp}.tsx"
)

shutil.copy2(WORKSPACE, backup)

print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# HELPER: AGREGAR IMPORT
# ------------------------------------------------------------

def add_import(source, component, path):
    if f'import {component} from "{path}";' in source:
        print(f"✓ Import existente: {component}")
        return source

    if component in source and f'from "{path}"' in source:
        print(f"✓ Import existente: {component}")
        return source

    import_pattern = re.compile(
        r'^import\s+.*?from\s+[\'"].*?[\'"];?\s*$',
        re.MULTILINE
    )

    imports = list(import_pattern.finditer(source))

    if not imports:
        print(f"❌ No se pudieron localizar imports para {component}")
        return source

    pos = imports[-1].end()

    new_import = (
        f'\nimport {component} from "{path}";'
    )

    source = (
        source[:pos]
        + new_import
        + source[pos:]
    )

    print(f"✓ Import agregado: {component}")

    return source


# ------------------------------------------------------------
# IMPORTS
# ------------------------------------------------------------

source = add_import(
    source,
    "StoreBuilderStudioShell",
    "./StoreBuilderStudioShell"
)

source = add_import(
    source,
    "WebsiteBuilderV1",
    "./WebsiteBuilderV1"
)

# ------------------------------------------------------------
# STORE SECTION
# ------------------------------------------------------------

section_match = re.search(
    r'(type\s+StoreSection\s*=\s*[\s\S]*?;)',
    source
)

if section_match:

    section_text = section_match.group(1)

    if '"website-builder"' not in section_text:

        new_section = (
            section_text.rstrip(";")
            + ' | "website-builder";'
        )

        source = source.replace(
            section_text,
            new_section,
            1
        )

        print("✓ website-builder agregado a StoreSection")

    else:

        print("✓ website-builder ya existe en StoreSection")

else:

    print("⚠️ No se encontró type StoreSection")

# ------------------------------------------------------------
# GLOBE2
# ------------------------------------------------------------

if "Globe2" in source:

    lucide_import = re.search(
        r'import\s*\{([\s\S]*?)\}\s*from\s*[\'"]lucide-react[\'"];',
        source
    )

    if lucide_import:

        content = lucide_import.group(1)

        if "Globe2" not in content:

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

            print("✓ Globe2 ya estaba disponible")

# ------------------------------------------------------------
# RENDER SECTION
# ------------------------------------------------------------

route_added = False

# Primero intentamos detectar switch(section)
switch_match = re.search(
    r'switch\s*\(\s*section\s*\)\s*\{',
    source
)

if switch_match:

    if 'case "website-builder"' not in source:

        insertion = r'''
      case "website-builder":
        return (
          <StoreBuilderStudioShell>
            <WebsiteBuilderV1
              onBack={() => setSection("dashboard")}
            />
          </StoreBuilderStudioShell>
        );

'''

        source = (
            source[:switch_match.end()]
            + insertion
            + source[switch_match.end():]
        )

        print("✓ Ruta website-builder conectada al switch(section)")
        route_added = True

    else:

        print("✓ Ruta website-builder ya existe")
        route_added = True


# ------------------------------------------------------------
# FALLBACK: IF / ELSE
# ------------------------------------------------------------

if not route_added and 'case "website-builder"' not in source:

    # Buscar patrones comunes de renderizado de secciones
    patterns = [

        r'if\s*\(\s*section\s*===\s*"dashboard"\s*\)\s*\{',

        r'if\s*\(\s*section\s*===\s*"dashboard"\s*\)',

        r'if\s*\(\s*section\s*==\s*"dashboard"\s*\)',

    ]

    for pattern in patterns:

        match = re.search(pattern, source)

        if match:

            insertion = r'''

  if (section === "website-builder") {
    return (
      <StoreBuilderStudioShell>
        <WebsiteBuilderV1
          onBack={() => setSection("dashboard")}
        />
      </StoreBuilderStudioShell>
    );
  }

'''

            source = (
                source[:match.start()]
                + insertion
                + source[match.start():]
            )

            print("✓ Ruta website-builder conectada mediante fallback")
            route_added = True
            break


# ------------------------------------------------------------
# FALLBACK FINAL: renderSection
# ------------------------------------------------------------

if not route_added and 'case "website-builder"' not in source:

    render_match = re.search(
        r'const\s+renderSection\s*=\s*\(\)\s*=>\s*\{',
        source
    )

    if not render_match:

        render_match = re.search(
            r'function\s+renderSection\s*\(\)\s*\{',
            source
        )

    if render_match:

        # Buscar cualquier return JSX dentro del renderSection
        local_source = source[render_match.end():]

        return_match = re.search(
            r'\n\s*return\s*\(',
            local_source
        )

        if return_match:

            absolute_pos = (
                render_match.end()
                + return_match.start()
            )

            insertion = r'''

  if (section === "website-builder") {
    return (
      <StoreBuilderStudioShell>
        <WebsiteBuilderV1
          onBack={() => setSection("dashboard")}
        />
      </StoreBuilderStudioShell>
    );
  }

'''

            source = (
                source[:absolute_pos]
                + insertion
                + source[absolute_pos:]
            )

            print("✓ Ruta website-builder conectada dentro de renderSection")
            route_added = True


if not route_added:

    print("⚠️ No pude conectar automáticamente la ruta.")
    print("No se tocará el workspace.")
    shutil.copy2(backup, WORKSPACE)
    sys.exit(1)

# ------------------------------------------------------------
# NAVEGACIÓN
# ------------------------------------------------------------

if 'id: "website-builder"' not in source:

    navigation_patterns = [

        r'(\{\s*id:\s*"dashboard"[\s\S]*?\},)',

        r'(\{\s*id:\s*"products"[\s\S]*?\},)',

        r'(\{\s*id:\s*"themes"[\s\S]*?\},)',

        r'(\{\s*id:\s*"orders"[\s\S]*?\},)',

    ]

    nav_match = None

    for pattern in navigation_patterns:

        match = re.search(pattern, source)

        if match:

            nav_match = match
            break

    if nav_match:

        insertion = r'''
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

        print("⚠️ No encontré un bloque de navegación compatible")

else:

    print("✓ Website Builder ya existe en navegación")

# ------------------------------------------------------------
# VERIFICACIÓN DE ESTRUCTURA
# ------------------------------------------------------------

required = [
    "StoreBuilderStudioShell",
    "WebsiteBuilderV1",
    "website-builder",
]

missing = [
    item for item in required
    if item not in source
]

if missing:

    print("❌ Faltan elementos:")
    for item in missing:
        print(f"   - {item}")

    print("Restaurando backup...")
    shutil.copy2(backup, WORKSPACE)
    sys.exit(1)

# ------------------------------------------------------------
# ESCRITURA
# ------------------------------------------------------------

if source == original:

    print("ℹ️ No hubo cambios nuevos")

else:

    WORKSPACE.write_text(
        source,
        encoding="utf-8"
    )

    print("✓ StoreBuilderWorkspace.tsx actualizado")

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
        timeout=180
    )

    print(result.stdout)

    if result.returncode != 0:

        print(result.stderr)

        print()
        print("❌ BUILD FALLÓ")
        print("Restaurando backup...")

        shutil.copy2(
            backup,
            WORKSPACE
        )

        print("✓ Workspace restaurado")
        print(f"✓ Backup disponible: {backup.name}")

        sys.exit(result.returncode)

    print("✅ BUILD CORRECTO")

except subprocess.TimeoutExpired:

    print("❌ npm run build excedió el tiempo límite.")
    print("Restaurando backup...")

    shutil.copy2(
        backup,
        WORKSPACE
    )

    print("✓ Workspace restaurado")

    sys.exit(1)

except FileNotFoundError:

    print("❌ npm no está disponible en PATH.")
    print("El workspace no fue restaurado automáticamente.")

    sys.exit(1)

# ------------------------------------------------------------
# RESULTADO
# ------------------------------------------------------------

print()
print("=" * 70)
print("DIGITALBOOST — STUDIO CONNECTION OK")
print("=" * 70)
print()
print("COMMERCE OS")
print("   ↓")
print("STORE BUILDER")
print("   ↓")
print("STORE BUILDER STUDIO")
print("   ↓")
print("WEBSITE BUILDER")
print()
print("✓ Studio Shell")
print("✓ Website Builder")
print("✓ Navegación")
print("✓ Ruta interna")
print("✓ Integración con Commerce OS")
print("✓ Backup disponible")
print()
print(f"Backup: {backup.name}")
print()
print("Siguiente paso:")
print("npm run dev")
print()
print("Luego:")
print("Commerce OS → Store Builder → Website Builder")
print("=" * 70)
