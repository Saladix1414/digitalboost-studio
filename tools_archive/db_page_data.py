#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
canvas = src / "DigitalBoostStoreCanvas.ts"
studio = src / "DigitalBoostStoreStudio.tsx"
if not canvas.is_file() or not studio.is_file():
    raise SystemExit("Faltan canvas o studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(canvas, canvas.with_name("DigitalBoostStoreCanvas.before_visual_rebuild_" + stamp + ".ts"))
shutil.copy2(studio, studio.with_name("DigitalBoostStoreStudio.before_visual_rebuild_" + stamp + ".tsx"))

c = canvas.read_text(encoding="utf-8")
if "export function seedPage" not in c:
    extra = r"""
export function seedPage(page: string): CanvasBlock[] {
  if (page === "Inicio") return seedHome();
  if (page === "Productos") return [
    { id: newId(), type: "hero", title: "Catalogo Aura.", body: "Toda la coleccion en un solo lugar.", cta: "Filtrar" },
    { id: newId(), type: "products", title: "Todos los productos", body: "Campera Aura · Tote Cyan · Hoodie Violet", cta: "Ver detalle" }
  ];
  if (page === "Colecciones") return [
    { id: newId(), type: "hero", title: "Colecciones.", body: "Drops y lineas de temporada.", cta: "Explorar" },
    { id: newId(), type: "features", title: "Lineas", body: "Studio · City · Night", cta: "" }
  ];
  if (page === "Nosotros") return [
    { id: newId(), type: "text", title: "Hecho para vender con identidad.", body: "Aura es una marca de estudio. Disenamos piezas que se leen bien en una tienda.", cta: "" }
  ];
  return [
    { id: newId(), type: "cta", title: "Escribinos.", body: "Atencion humana, no tickets infinitos.", cta: "Contactar" }
  ];
}
export function loadCanvasPage(page: string): CanvasBlock[] {
  if (typeof localStorage === "undefined") return seedPage(page);
  try {
    const raw = localStorage.getItem(KEY + ":" + page);
    if (!raw) return seedPage(page);
    const parsed = JSON.parse(raw) as CanvasBlock[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedPage(page);
    return parsed;
  } catch { return seedPage(page); }
}
export function saveCanvasPage(page: string, blocks: CanvasBlock[]) {
  try { localStorage.setItem(KEY + ":" + page, JSON.stringify(blocks)); } catch {}
}
"""
    c = c + extra
    canvas.write_text(c, encoding="utf-8")
    print("ok canvas page helpers")
else:
    print("ok canvas helpers exist")

t = studio.read_text(encoding="utf-8")
if "loadCanvasPage" not in t:
    t = t.replace(
        "loadCanvas, saveCanvas, seedHome, newId",
        "loadCanvas, saveCanvas, loadCanvasPage, saveCanvasPage, seedHome, newId",
        1,
    )
if "loadCanvasPage" not in t:
    t = t.replace(
        'from "./DigitalBoostStoreCanvas";',
        'from "./DigitalBoostStoreCanvas";',
        1,
    )
    t = t.replace(
        "loadCanvas, saveCanvas, seedHome, newId, type BlockType, type CanvasBlock",
        "loadCanvasPage, saveCanvasPage, seedHome, newId, type BlockType, type CanvasBlock",
        1,
    )
t = t.replace("setBlocks(loadCanvas());", "setBlocks(loadCanvasPage(page));")
t = t.replace("saveCanvas(blocks)", "saveCanvasPage(page, blocks)")
if "useEffect(() => { if (ready) setBlocks(loadCanvasPage(page)); }, [page]);" not in t:
    t = t.replace(
        "useEffect(() => { setBlocks(loadCanvasPage(page)); setTheme(loadTheme()); setReady(true); }, []);",
        "useEffect(() => { setBlocks(loadCanvasPage(page)); setTheme(loadTheme()); setReady(true); }, []);\n  useEffect(() => { if (ready) { setBlocks(loadCanvasPage(page)); setSelected(null); } }, [page]);",
        1,
    )
    if "setBlocks(loadCanvasPage(page)); setTheme(loadTheme()); setReady(true);" not in t:
        t = t.replace(
            "setBlocks(loadCanvas()); setReady(true);",
            "setBlocks(loadCanvasPage(page)); setReady(true);",
            1,
        )
        if "}, [page]);" not in t:
            t = t.replace(
                "useEffect(() => { setBlocks(loadCanvasPage(page)); setReady(true); }, []);",
                "useEffect(() => { setBlocks(loadCanvasPage(page)); setReady(true); }, []);\n  useEffect(() => { if (ready) { setBlocks(loadCanvasPage(page)); setSelected(null); } }, [page]);",
                1,
            )
studio.write_text(t, encoding="utf-8")
print("ok studio")
print("LISTO PAGE DATA")
print("Cambia de pagina: el canvas cambia y se guarda solo")
