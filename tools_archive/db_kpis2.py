#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime
import re

root = Path.cwd()
src = root / "src"
ov = src / "CommerceOSOverview.tsx"
if not ov.is_file():
    raise SystemExit("Falta CommerceOSOverview.tsx")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ov, ov.with_name("CommerceOSOverview.before_visual_rebuild_" + stamp + ".tsx"))

data = src / "DigitalBoostOsRangeData.ts"
if not data.is_file():
    data.write_text(r"""
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

rng = src / "DigitalBoostOsRange.tsx"
if rng.is_file():
    rt = rng.read_text(encoding="utf-8")
    if 'Event("db-os-range")' not in rt:
        rt = rt.replace(
            "try { localStorage.setItem(KEY, next); } catch {}",
            'try { localStorage.setItem(KEY, next); } catch {}\n    try { window.dispatchEvent(new Event("db-os-range")); } catch {}',
            1,
        )
        rng.write_text(rt, encoding="utf-8")
        print("ok dispatch")

t = ov.read_text(encoding="utf-8")
if "DigitalBoostOsRangeData" not in t:
    t = t.replace(
        'from "react";',
        'from "react";\nimport { rangeMul, useOsRange } from "./DigitalBoostOsRangeData";',
        1,
    )
    print("ok import")

if "const osRange = useOsRange()" not in t:
    m = re.search(r"(export default function \w+\s*\([^)]*\)\s*\{)", t)
    if not m:
        m = re.search(r"(export function Overview\s*\([^)]*\)\s*\{)", t)
    if m:
        t = t[:m.end()] + "\n  const osRange = useOsRange();\n  const osMul = rangeMul(osRange);\n" + t[m.end():]
        print("ok hook")
    else:
        print("WARN no funcion overview")

# computed sales
t = t.replace("formatMoney(sales)", "formatMoney(Math.round(sales * osMul))", 1)
t = t.replace("formatMoney(ticket)", "formatMoney(Math.round(ticket * osMul))", 1)
if "String(ordersSeed.length)" in t:
    t = t.replace("String(ordersSeed.length)", "String(Math.max(1, Math.round(ordersSeed.length * osMul)))", 1)
if "String(customersSeed.length)" in t:
    t = t.replace("String(customersSeed.length)", "String(Math.max(1, Math.round(customersSeed.length * osMul)))", 1)

# bars if pulseSeries exists
if "pulseSeries.map" in t and "osMul" in t:
    t = t.replace(
        "pulseSeries.map",
        "pulseSeries.map((h) => Math.min(100, Math.round(h * (osMul > 1 ? 1 + osMul * 0.04 : 1)))).map",
        1,
    )

ov.write_text(t, encoding="utf-8")
print("ok overview")
print("LISTO KPIS2")
print("30d -> ventas \~ US$ 1.896")
