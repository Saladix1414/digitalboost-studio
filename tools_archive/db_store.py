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

(src / "DigitalBoostStoreSwitch.tsx").write_text(r"""
import { useEffect, useState } from "react";
const STORES = ["Aura", "Nimbus", "Taller 09"];
const KEY = "db-active-store-v1";
export default function DigitalBoostStoreSwitch() {
  const [name, setName] = useState("Aura");
  useEffect(function () {
    try { setName(localStorage.getItem(KEY) || "Aura"); } catch {}
  }, []);
  function cycle() {
    const i = (STORES.indexOf(name) + 1) % STORES.length;
    const next = STORES[i];
    setName(next);
    try { localStorage.setItem(KEY, next); } catch {}
  }
  return (
    <button type="button" onClick={cycle} className="hidden h-9 items-center rounded-full border border-white/10 px-3 text-[11px] text-cyan-300 sm:inline-flex">
      {name}
    </button>
  );
}
""", encoding="utf-8")
print("ok switch")

w = ws.read_text(encoding="utf-8")
if "DigitalBoostStoreSwitch" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostStoreSwitch from "./DigitalBoostStoreSwitch.tsx";',
        1,
    )
    w = w.replace(
        "DigitalBoost Commerce OS",
        "DigitalBoost Commerce OS</span> <DigitalBoostStoreSwitch /><span className=\"hidden\">",
        1,
    )
    if "<DigitalBoostStoreSwitch" not in w:
        print("WARN no inserte el switch, busco otro ancla")
    else:
        print("ok mount")
ws.write_text(w, encoding="utf-8")
print("LISTO STORE SWITCH")
print("Header: toca Aura para ciclar Nimbus / Taller 09")
