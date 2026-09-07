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

(src / "DigitalBoostOsLive.tsx").write_text(r"""
import { useEffect, useState } from "react";
const KEY = "db-os-live-v1";
export default function DigitalBoostOsLive() {
  const [live, setLive] = useState(true);
  useEffect(function () {
    try { setLive(localStorage.getItem(KEY) !== "0"); } catch {}
  }, []);
  function toggle() {
    const next = !live;
    setLive(next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
  }
  return (
    <button type="button" onClick={toggle} className="hidden h-9 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] sm:inline-flex">
      <span className={live ? "h-1.5 w-1.5 rounded-full bg-emerald-400" : "h-1.5 w-1.5 rounded-full bg-amber-300"} />
      <span className={live ? "text-emerald-300" : "text-amber-300"}>{live ? "Live" : "Attention"}</span>
    </button>
  );
}
""", encoding="utf-8")
print("ok live")

w = ws.read_text(encoding="utf-8")
if "DigitalBoostOsLive from" not in w:
    w = w.replace(
        'import DigitalBoostOsHello from "./DigitalBoostOsHello.tsx";',
        'import DigitalBoostOsHello from "./DigitalBoostOsHello.tsx";\nimport DigitalBoostOsLive from "./DigitalBoostOsLive.tsx";',
        1,
    )
    if "DigitalBoostOsLive from" not in w:
        w = w.replace(
            'import CommerceOSOverview from "./CommerceOSOverview";',
            'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostOsLive from "./DigitalBoostOsLive.tsx";',
            1,
        )
if "<DigitalBoostOsLive" not in w:
    if "<DigitalBoostOsRange />" in w:
        w = w.replace("<DigitalBoostOsRange />", "<DigitalBoostOsRange />\n                <DigitalBoostOsLive />", 1)
        print("ok mount")
    elif "<DigitalBoostStoreSwitch />" in w:
        w = w.replace("<DigitalBoostStoreSwitch />", "<DigitalBoostStoreSwitch />\n                <DigitalBoostOsLive />", 1)
        print("ok mount switch")
    else:
        print("WARN no ancla")
ws.write_text(w, encoding="utf-8")
print("LISTO LIVE")
