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

(src / "DigitalBoostOsRange.tsx").write_text(r"""
import { useEffect, useState } from "react";
const RANGES = ["7d", "30d", "90d"];
const KEY = "db-os-range-v1";
export default function DigitalBoostOsRange() {
  const [r, setR] = useState("7d");
  useEffect(function () {
    try { setR(localStorage.getItem(KEY) || "7d"); } catch {}
  }, []);
  function pick(next: string) {
    setR(next);
    try { localStorage.setItem(KEY, next); } catch {}
  }
  return (
    <div className="hidden items-center gap-1 sm:flex">
      {RANGES.map(function (id) {
        return (
          <button key={id} type="button" onClick={function () { pick(id); }} className={r === id ? "h-9 rounded-full bg-cyan-400 px-3 text-[11px] font-semibold text-[#070D18]" : "h-9 rounded-full border border-white/10 px-3 text-[11px] text-slate-400"}>
            {id}
          </button>
        );
      })}
    </div>
  );
}
""", encoding="utf-8")
print("ok range")

w = ws.read_text(encoding="utf-8")
if "DigitalBoostOsRange from" not in w:
    w = w.replace(
        'import DigitalBoostStoreSwitch from "./DigitalBoostStoreSwitch.tsx";',
        'import DigitalBoostStoreSwitch from "./DigitalBoostStoreSwitch.tsx";\nimport DigitalBoostOsRange from "./DigitalBoostOsRange.tsx";',
        1,
    )
    if "DigitalBoostOsRange from" not in w:
        w = w.replace(
            'import CommerceOSOverview from "./CommerceOSOverview";',
            'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostOsRange from "./DigitalBoostOsRange.tsx";',
            1,
        )
if "<DigitalBoostOsRange" not in w:
    if "<DigitalBoostStoreSwitch />" in w:
        w = w.replace("<DigitalBoostStoreSwitch />", "<DigitalBoostStoreSwitch />\n                <DigitalBoostOsRange />", 1)
        print("ok mount")
    else:
        print("WARN no encontre StoreSwitch")
ws.write_text(w, encoding="utf-8")
print("LISTO RANGE")
