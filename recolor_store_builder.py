from pathlib import Path
import shutil
from datetime import datetime

FILE = Path("src/StoreBuilderWorkspace.tsx")

if not FILE.exists():
    print("❌ No existe:", FILE)
    raise SystemExit(1)

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = FILE.with_name(f"StoreBuilderWorkspace.tsx.before-color-{stamp}")

shutil.copy2(FILE, BACKUP)

text = FILE.read_text(encoding="utf-8")
original = text

replacements = {
    "bg-[#111827]": "bg-[#070B16]",
    "bg-[#172033]": "bg-[#0B1020]",
    "bg-[#F1F5F9]": "bg-[#10182B]",
    "bg-white": "bg-[#10182B]",
    "hover:bg-slate-50": "hover:bg-[#151F36]",
    "hover:bg-slate-100": "hover:bg-[#151F36]",
    "bg-white/[.02]": "bg-white/[.04]",
    "bg-white/[.025]": "bg-white/[.045]",
    "bg-white/[.055]": "bg-white/[.06]",
    "bg-white/[.065]": "bg-white/[.075]",
    "text-slate-900": "text-white",
}

for old, new in replacements.items():
    text = text.replace(old, new)

FILE.write_text(text, encoding="utf-8")

print()
print("=" * 70)
print("🎨 STORE BUILDER — COLOR DIGITALBOOST")
print("=" * 70)
print()
print("✅ Archivo modificado:")
print("   src/StoreBuilderWorkspace.tsx")
print()
print("🛡️ Backup:")
print("  ", BACKUP)
print()
print("🎨 Nueva paleta:")
print("   Fondo       #070B16")
print("   Sidebar     #0B1020")
print("   Paneles     #10182B")
print("   Elevados    #151F36")
print("   Inputs      #0D1527")
print("   Violeta     #8B5CF6")
print("   Cian        #22D3EE")
print("   Rosa        #EC4899")
print()
print("🔒 No se tocaron WebsiteBuilderV1 ni WebsiteBuilderV2.")
print()

if text == original:
    print("⚠️ No hubo cambios. Las clases ya tenían estos valores.")
else:
    print("🚀 Cambios aplicados correctamente.")

print()
print("=" * 70)
print("🔎 COMPROBACIÓN")
print("=" * 70)

checks = [
    "bg-[#111827]",
    "bg-[#172033]",
    "bg-[#F1F5F9]",
    "bg-white",
    "hover:bg-slate-50",
    "hover:bg-slate-100",
]

remaining = []

for number, line in enumerate(text.splitlines(), 1):
    for item in checks:
        if item in line:
            remaining.append((number, item, line.strip()))

if remaining:
    print()
    print("⚠️ Quedan coincidencias:")
    for number, item, line in remaining[:30]:
        print(f"{number}: {item} -> {line}")
else:
    print()
    print("✅ Las principales superficies antiguas fueron eliminadas.")

print()
print("=" * 70)
print("🎯 TERMINADO")
print("=" * 70)
