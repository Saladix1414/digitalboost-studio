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
needle = '<div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">'
insert = '''<div className="mb-2 flex gap-2 overflow-x-auto lg:hidden">
            {pages.map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)} className={cx("shrink-0 rounded-full px-3 py-2 text-xs", page === p ? "bg-violet-500/30 text-violet-200" : "border border-white/10 text-slate-400")}>{p}</button>
            ))}
          </div>
          <div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">'''
if "lg:hidden\">\n            {pages.map" not in t and needle in t:
    t = t.replace(needle, insert, 1)
    print("ok pages chips")
else:
    print("skip pages chips (ya estaban o cambio el markup)")
studio.write_text(t, encoding="utf-8")
print("LISTO PAGES")
