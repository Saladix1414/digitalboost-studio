#!/usr/bin/env python3
from pathlib import Path
import re
src = Path("src")
print("=== FIX G: productos reales ===")
canvas = src / "DigitalBoostStoreCanvas.ts"
if canvas.is_file():
    t = canvas.read_text(encoding="utf-8")
    t = t.replace("Crea algo extraordinario.", "La colección que no pide permiso.")
    t = t.replace("Por que Aura", "Por qué Nimbus")
    t = t.replace("Campera Aura · Tote Cyan · Hoodie Violet", "Campera Nimbus Navy · Tote Cyan Pulse · Hoodie Violet Grid")
    t = t.replace("Catalogo Aura.", "Catálogo Nimbus.")
    canvas.write_text(t, encoding="utf-8")
    print("✅ Canvas Nimbus")
studio = src / "DigitalBoostStoreStudio.tsx"
if studio.is_file():
    s = studio.read_text(encoding="utf-8")
    s = s.replace('>AURA<', '>NIMBUS<')
    if "__DB_REAL_PRODUCTS__" not in s:
        s = s.replace(
            "function CanvasView({ blocks",
            "function loadRealProducts(): any[] { try { const raw = localStorage.getItem('db-commerce-products-v1'); if(raw){ const p=JSON.parse(raw); if(Array.isArray(p)) return p; } } catch {} return []; }\n\nfunction CanvasView({ blocks"
        )
        s = s.replace(
            '"Producto"',
            '"Producto Nimbus"'
        )
    studio.write_text(s, encoding="utf-8")
    print("✅ Studio lee productos reales")
ws = src / "StoreBuilderWorkspace.tsx"
t = ws.read_text(encoding="utf-8")
if "db-commerce-products-v1" not in t:
    t = re.sub(
        r"const \[products, setProducts\] = useState\(productsSeed\);",
        "const [products, setProducts] = useState(productsSeed);\n useEffect(() => { try { localStorage.setItem('db-commerce-products-v1', JSON.stringify(products)); } catch {} }, [products]);",
        t
    )
    ws.write_text(t, encoding="utf-8")
    print("✅ Workspace guarda productos")
