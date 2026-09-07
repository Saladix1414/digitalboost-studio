from pathlib import Path
from datetime import datetime
import shutil

ROOT = Path.cwd()
SRC = ROOT / "src"
STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")

FILES = [
    SRC / "store-builder-studio-shell.css",
    SRC / "store-builder-studio-v2.css",
    SRC / "store-builder-vibrant-global.css",
    SRC / "commerce-os-vibrant-global.css",
]

print()
print("=" * 70)
print("🎨 DIGITALBOOST — STORE BUILDER")
print("   CORRECCIÓN REAL DEL FONDO")
print("=" * 70)

# ------------------------------------------------------------
# BACKUPS
# ------------------------------------------------------------

for f in FILES:
    if f.exists():
        backup = f.with_name(
            f.stem + f".before_light_bg_{STAMP}" + f.suffix
        )
        shutil.copy2(f, backup)
        print("🛡️ Backup:", backup.name)

# ------------------------------------------------------------
# CREAR CSS DE OVERRIDE
# ------------------------------------------------------------

override = SRC / "store-builder-light-background-final.css"

css = r"""
/*
 DIGITALBOOST STORE BUILDER
 LIGHT BACKGROUND OVERRIDE
*/

[data-store-builder-vibrant="true"] {
    background: #F8FAFC !important;
    background-color: #F8FAFC !important;
    color: #172033 !important;
}

[data-store-builder-vibrant="true"] > div,
[data-store-builder-vibrant="true"] main,
[data-store-builder-vibrant="true"] section {
    background-color: #F8FAFC !important;
}

[data-store-builder-vibrant="true"] aside {
    background: #FFFFFF !important;
    background-color: #FFFFFF !important;
    border-color: #D9E2EC !important;
}

[data-store-builder-vibrant="true"] input,
[data-store-builder-vibrant="true"] textarea,
[data-store-builder-vibrant="true"] select {
    background: #FFFFFF !important;
    background-color: #FFFFFF !important;
    color: #172033 !important;
    border-color: #D9E2EC !important;
}

/* Superficies claras */
[data-store-builder-vibrant="true"] .bg-\[\#04030a\],
[data-store-builder-vibrant="true"] .bg-\[\#05030b\],
[data-store-builder-vibrant="true"] .bg-\[\#070B16\],
[data-store-builder-vibrant="true"] .bg-\[\#0B1020\],
[data-store-builder-vibrant="true"] .bg-\[\#10182B\],
[data-store-builder-vibrant="true"] .bg-\[\#151F36\] {
    background-color: #FFFFFF !important;
}

/* Cualquier contenedor oscuro heredado */
[data-store-builder-vibrant="true"] [class*="bg-[#0"],
[data-store-builder-vibrant="true"] [class*="bg-[#1"] {
    background-color: #FFFFFF !important;
}

/* Bordes */
[data-store-builder-vibrant="true"] [class*="border-white"],
[data-store-builder-vibrant="true"] [class*="border-slate"] {
    border-color: #D9E2EC !important;
}

/* Texto */
[data-store-builder-vibrant="true"] [class*="text-slate-300"],
[data-store-builder-vibrant="true"] [class*="text-slate-400"] {
    color: #475569 !important;
}

/*
 IMPORTANTE:
 Los botones violetas/cian conservan texto blanco.
*/
[data-store-builder-vibrant="true"] button[class*="bg-violet"],
[data-store-builder-vibrant="true"] button[class*="bg-cyan"],
[data-store-builder-vibrant="true"] [class*="bg-violet-"],
[data-store-builder-vibrant="true"] [class*="bg-cyan-"] {
    color: #FFFFFF !important;
}
"""

override.write_text(css.strip() + "\n", encoding="utf-8")

print()
print("✅ CSS creado:")
print("   ", override)

# ------------------------------------------------------------
# IMPORTAR CSS EN STORE BUILDER
# ------------------------------------------------------------

workspace = SRC / "StoreBuilderWorkspace.tsx"

if not workspace.exists():
    print("❌ No existe StoreBuilderWorkspace.tsx")
    raise SystemExit(1)

text = workspace.read_text(encoding="utf-8")

IMPORT = 'import "./store-builder-light-background-final.css";'

if IMPORT not in text:
    text = IMPORT + "\n" + text
    workspace.write_text(text, encoding="utf-8")
    print("✅ Override importado.")
else:
    print("ℹ️ Override ya estaba importado.")

# ------------------------------------------------------------
# VERIFICACIÓN
# ------------------------------------------------------------

final = workspace.read_text(encoding="utf-8")

print()
print("=" * 70)
print("🔎 VERIFICACIÓN")
print("=" * 70)

print()
print("StoreBuilderWorkspace existe :", workspace.exists())
print("CSS override existe           :", override.exists())
print("Import correcto               :", IMPORT in final)

print()
print("Fondos oscuros encontrados en los CSS:")

dark = [
    "#04030a",
    "#05030b",
    "#0b0913",
    "#070B16",
    "#0B1020",
    "#10182B",
    "#151F36",
]

found = False

for f in FILES:
    if not f.exists():
        continue

    content = f.read_text(encoding="utf-8")

    for color in dark:
        n = content.lower().count(color.lower())
        if n:
            found = True
            print(f"   ⚠️ {f.name}: {color} × {n}")

if not found:
    print("   ✅ No encontrados.")

print()
print("=" * 70)
print("🎯 TERMINADO")
print("=" * 70)
print()
print("Ahora ejecuta:")
print()
print("   npm run dev")
print()
