#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))

css = src / "digitalboost-dashboard.css"
css.write_text("""
[data-commerce-os="true"] h1,
[data-commerce-os="true"] h2,
[data-commerce-os="true"] h3 {
  color: #F7FAFF;
}
[data-commerce-os="true"] p,
[data-commerce-os="true"] span,
[data-commerce-os="true"] li {
  color: #D7E2F0;
}
[data-commerce-os="true"] [class*="text-[#475569]"],
[data-commerce-os="true"] [class*="text-slate-500"] {
  color: #AFC0D5 !important;
}
[data-commerce-os="true"] [class*="rounded-xl"],
[data-commerce-os="true"] [class*="rounded-2xl"] {
  background: #101B32;
  border-color: rgba(247,250,255,.12);
}
""", encoding="utf-8")
print("ok dashboard css")

w = ws.read_text(encoding="utf-8")
if "digitalboost-dashboard.css" not in w:
    lines = w.splitlines(True)
    last = 0
    for n, line in enumerate(lines):
        if line.startswith("import "):
            last = n
    lines.insert(last + 1, 'import "./digitalboost-dashboard.css";\n')
    w = "".join(lines)
    ws.write_text(w, encoding="utf-8")
    print("ok import")
else:
    print("skip import")
print("LISTO DASH")
