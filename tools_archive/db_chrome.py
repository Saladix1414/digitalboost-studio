#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")

bdir = root / "_backup" / ("chrome-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
bdir.mkdir(parents=True, exist_ok=True)
shutil.copy2(ws, bdir / "StoreBuilderWorkspace.tsx")

(root / "src" / "commerce-os-navy-lock.css").write_text(r"""
[data-store-builder="true"]{
  background:#0A1020 !important;
  color:#F7FAFF !important;
}
[data-store-builder="true"] > aside{
  background:#070D18 !important;
  color:#F7FAFF !important;
  border-color:rgba(247,250,255,.12) !important;
}
[data-store-builder="true"] > main{
  background:#0A1020 !important;
  color:#F7FAFF !important;
}
[data-store-builder="true"] > main > header{
  background:#0A1020 !important;
  color:#F7FAFF !important;
  border-color:rgba(247,250,255,.12) !important;
}
[data-store-builder="true"] > main > header [class*="text-[#475569]"]{
  color:#AFC0D5 !important;
}
[data-store-builder="true"] [class*="bg-[#050"]{
  background:#0A1020 !important;
}
[data-store-builder="true"] [data-commerce-os="true"]{
  background:#0A1020 !important;
  color:#F7FAFF !important;
}
[data-store-builder="true"] [data-commerce-os="true"] h1{
  color:#F7FAFF !important;
}
[data-store-builder="true"] [data-commerce-os="true"] h1 span{
  color:#67E8F9 !important;
}
[data-store-builder="true"] [data-commerce-os="true"] p{
  color:#AFC0D5 !important;
}
[data-store-builder="true"] [data-commerce-os="true"] [class*="rounded-xl"],
[data-store-builder="true"] [data-commerce-os="true"] [class*="rounded-2xl"],
[data-store-builder="true"] [data-commerce-os="true"] [class*="rounded-lg"]{
  background-color:#101B32 !important;
  background-image:none !important;
  border-color:rgba(247,250,255,.12) !important;
  color:#F7FAFF !important;
  box-shadow:none !important;
}
[data-store-builder="true"] [data-commerce-os="true"] [class*="text-white"]{
  color:#F7FAFF !important;
}
[data-store-builder="true"] [data-commerce-os="true"] button[class*="bg-cyan"]{
  background:#22D3EE !important;
  color:#070D18 !important;
}
[data-store-builder="true"] [data-commerce-os="true"] button[class*="bg-violet"]{
  background:#8B5CF6 !important;
  color:#F7FAFF !important;
}
[data-store-builder="true"] [data-commerce-os="true"] button[class*="border-white"]{
  background:transparent !important;
  border-color:rgba(247,250,255,.28) !important;
  color:#F7FAFF !important;
}
[data-store-builder="true"] [data-commerce-os="true"] [class*="from-violet"]{
  background-image:linear-gradient(to top,#8b5cf6,#22d3ee) !important;
}
[data-store-builder="true"] > main > header button[class*="violet"]{
  background:rgba(139,92,246,.25) !important;
  color:#C4B5FD !important;
}
""", encoding="utf-8")
print("ok css")

txt = ws.read_text(encoding="utf-8")
txt = txt.replace("db-commerce-white ", "").replace("db-commerce-white", "")
if "commerce-os-navy-lock.css" not in txt:
    lines = txt.splitlines(True)
    last = 0
    for i, line in enumerate(lines):
        if line.startswith("import "):
            last = i
    lines.insert(last + 1, 'import "./commerce-os-navy-lock.css";\n')
    txt = "".join(lines)
ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO", bdir)
