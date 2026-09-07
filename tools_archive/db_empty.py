#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
studio = root / "src" / "DigitalBoostStoreStudio.tsx"
if not studio.is_file():
    raise SystemExit("Falta DigitalBoostStoreStudio.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(studio, studio.with_name("DigitalBoostStoreStudio.before_visual_rebuild_" + stamp + ".tsx"))

t = studio.read_text(encoding="utf-8")
old = "{blocks.map((b) => {"
new = """{blocks.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="text-sm font-semibold">Pagina vacia</div>
              <p className="mt-2 text-xs text-black/50">Agrega un bloque o carga la plantilla de {page}.</p>
            </div>
          )}
          {blocks.map((b) => {"""
if "Pagina vacia" not in t:
    t = t.replace(old, new, 1)
    print("ok empty state")
else:
    print("skip empty state")
if "seedPage(" not in t and "seedHome" in t:
    t = t.replace(
        "loadCanvasPage, saveCanvasPage, seedHome, newId",
        "loadCanvasPage, saveCanvasPage, seedPage, seedHome, newId",
        1,
    )
if "Cargar plantilla" not in t:
    t = t.replace(
        '<button type="button" onClick={() => setShowHistory(true)}',
        '<button type="button" onClick={() => { commit(typeof seedPage === "function" ? seedPage(page) : seedHome()); setSelected(null); }} className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs">Plantilla</button>\n            <button type="button" onClick={() => setShowHistory(true)}',
        1,
    )
studio.write_text(t, encoding="utf-8")
print("LISTO EMPTY")
