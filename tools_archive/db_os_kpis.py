#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime
import re

root = Path.cwd()
src = root / "src"
ov = src / "CommerceOSOverview.tsx"
rng = src / "DigitalBoostOsRange.tsx"
if not ov.is_file():
    raise SystemExit("Falta CommerceOSOverview.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ov, ov.with_name("CommerceOSOverview.before_visual_rebuild_" + stamp + ".tsx"))

(src / "DigitalBoostOsRangeData.ts").write_text(r"""
import { useEffect, useState } from "react";
export const RANGE_KEY = "db-os-range-v1";
export function readRange() {
  try { return localStorage.getItem(RANGE_KEY) || "7d"; } catch { return "7d"; }
}
export function rangeMul(r: string) {
  if (r === "30d") return 4;
  if (r === "90d") return 12;
  return 1;
}
export function useOsRange() {
  const [r, setR] = useState("7d");
  useEffect(function () {
    function pull() { setR(readRange()); }
    pull();
    window.addEventListener("db-os-range", pull);
    window.addEventListener("storage", pull);
    return function () {
      window.removeEventListener("db-os-range", pull);
      window.removeEventListener("storage", pull);
    };
  }, []);
  return r;
}
""", encoding="utf-8")
print("ok range data")

if rng.is_file():
    rtxt = rng.read_text(encoding="utf-8")
    if "db-os-range" not in rtxt:
        rtxt = rtxt.replace(
            "try { localStorage.setItem(KEY, next); } catch {}",
            'try { localStorage.setItem(KEY, next); } catch {}\n    try { window.dispatchEvent(new Event("db-os-range")); } catch {}',
            1,
        )
        rng.write_text(rtxt, encoding="utf-8")
        print("ok range event")

t = ov.read_text(encoding="utf-8")
if "DigitalBoostOsRangeData" not in t:
    t = t.replace(
        'from "react";',
        'from "react";\nimport { rangeMul, useOsRange } from "./DigitalBoostOsRangeData";',
        1,
    )
if "useOsRange()" not in t:
    m = re.search(r"export default function CommerceOSOverview\s*\([^)]*\)\s*\{", t)
    if m:
        i = m.end()
        t = t[:i] + "\n  const osRange = useOsRange();\n  const osMul = rangeMul(osRange);\n  const osSales = Math.round(474 * osMul);\n  const osOrders = Math.max(1, Math.round(4 * osMul));\n  const osClients = Math.max(1, Math.round(4 * osMul));\n" + t[i:]
        print("ok hook inject")
    else:
        print("WARN no encontre la funcion Overview")

repls = [
    ("US$ 474", "{`US$ ${osSales.toLocaleString(\"es-AR\")}`}"),
    ("US$474", "{`US$ ${osSales.toLocaleString(\"es-AR\")}`}"),
    (">474<", ">{osSales.toLocaleString(\"es-AR\")}<"),
]
for a, b in repls:
    if a in t and "osSales" in b:
        t = t.replace(a, b, 1)
        print("ok sales", a)
        break

# pedidos KPI: the isolated 4 next to PEDIDOS is risky; skip if not unique
if "osOrders" in t and t.count(">4<") <= 6:
    t = t.replace(">4<", ">{osOrders}<", 1)
    print("ok one orders cell")

if "Tu comercio" in t and "osRange" in t and "Periodo" not in t:
    t = t.replace(
        "Tu comercio",
        'Tu comercio',
        1,
    )
ov.write_text(t, encoding="utf-8")
print("ok overview")
print("LISTO KPIS")
print("Toca 30d: ventas tienen que subir. 7d vuelve a 474")
