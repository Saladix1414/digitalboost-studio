#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
(src / "DigitalBoostPulseRadar.tsx").write_text(r"""
import { useMemo } from "react";
export default function DigitalBoostPulseRadar() {
  const n = useMemo(function () {
    let c = 0;
    try { if (localStorage.getItem("db-os-live-v1") === "0") c++; } catch {}
    c += 2;
    return c;
  }, []);
  function openBrief() {
    try { localStorage.setItem("db-pulse-seed", "briefing"); } catch {}
    try { window.dispatchEvent(new Event("db-open-pulse")); } catch {}
  }
  return (
    <button type="button" onClick={openBrief} title="PULSE radar" className="ml-1 inline-flex h-7 items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 text-[10px] font-semibold text-amber-200">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
      {n}
    </button>
  );
}
""", encoding="utf-8")
print("ok radar")

ws = src / "StoreBuilderWorkspace.tsx"
w = ws.read_text(encoding="utf-8")
if "DigitalBoostPulseRadar from" not in w:
    w = w.replace(
        'import DigitalBoostOsLive from "./DigitalBoostOsLive.tsx";',
        'import DigitalBoostOsLive from "./DigitalBoostOsLive.tsx";\nimport DigitalBoostPulseRadar from "./DigitalBoostPulseRadar.tsx";',
        1,
    )
    if "DigitalBoostPulseRadar from" not in w:
        w = w.replace(
            'from "./DigitalBoostOsLive',
            'from "./DigitalBoostOsLive";\nimport DigitalBoostPulseRadar from "./DigitalBoostPulseRadar.tsx',
            1,
        )
if "<DigitalBoostPulseRadar" not in w:
    w = w.replace("<DigitalBoostOsLive />", "<DigitalBoostOsLive /><DigitalBoostPulseRadar />", 1)
if "db-open-pulse" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        """const [showAI, setShowAI] = useState(false);
  useEffect(function () {
    function openPulse() { setShowAI(true); }
    window.addEventListener("db-open-pulse", openPulse);
    return function () { window.removeEventListener("db-open-pulse", openPulse); };
  }, []);""",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")

op = src / "DigitalBoostOperator.tsx"
o = op.read_text(encoding="utf-8")
if "db-pulse-seed" not in o:
    o = o.replace(
        'import { useState } from "react";',
        'import { useEffect, useState } from "react";',
        1,
    )
    o = o.replace(
        "function think(word: string) {",
        """useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) {
        localStorage.removeItem("db-pulse-seed");
        think(seed);
      }
    } catch {}
  }, []);
  function think(word: string) {""",
        1,
    )
    op.write_text(o, encoding="utf-8")
    print("ok seed")
print("LISTO RADAR")
print("Punto amber al lado de Live. Tap = briefing")
