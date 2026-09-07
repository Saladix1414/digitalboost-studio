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

(src / "DigitalBoostOsHello.tsx").write_text(r"""
export default function DigitalBoostOsHello() {
  const h = new Date().getHours();
  const hello = h < 12 ? "Buenos dias" : h < 19 ? "Buenas tardes" : "Buenas noches";
  return <span className="hidden text-[11px] text-[#AFC0D5] lg:inline">{hello}</span>;
}
""", encoding="utf-8")
print("ok hello")

w = ws.read_text(encoding="utf-8")
if "DigitalBoostOsHello from" not in w:
    w = w.replace(
        'import DigitalBoostOsRange from "./DigitalBoostOsRange.tsx";',
        'import DigitalBoostOsRange from "./DigitalBoostOsRange.tsx";\nimport DigitalBoostOsHello from "./DigitalBoostOsHello.tsx";',
        1,
    )
    if "DigitalBoostOsHello from" not in w:
        w = w.replace(
            'import CommerceOSOverview from "./CommerceOSOverview";',
            'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostOsHello from "./DigitalBoostOsHello.tsx";',
            1,
        )
if "<DigitalBoostOsHello" not in w:
    if "<DigitalBoostOsRange />" in w:
        w = w.replace("<DigitalBoostOsRange />", "<DigitalBoostOsHello />\n                <DigitalBoostOsRange />", 1)
        print("ok mount range")
    elif "<DigitalBoostStoreSwitch />" in w:
        w = w.replace("<DigitalBoostStoreSwitch />", "<DigitalBoostStoreSwitch />\n                <DigitalBoostOsHello />", 1)
        print("ok mount switch")
    else:
        print("WARN no ancla")
ws.write_text(w, encoding="utf-8")
print("LISTO HELLO")
