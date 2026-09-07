#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostOsKpiPaint.tsx")
if not p.is_file():
    raise SystemExit("Falta DigitalBoostOsKpiPaint.tsx")

p.write_text(r"""
import { useEffect, useState } from "react";
function mulOf(r: string) {
  if (r === "30d") return 4;
  if (r === "90d") return 12;
  return 1;
}
function money(n: number) {
  return "US$ " + n.toLocaleString("es-AR");
}
function paint(range: string) {
  const m = mulOf(range);
  const sales = Math.round(474 * m);
  const ticket = Math.round(118 * m);
  const orders = Math.max(1, Math.round(4 * m));
  const nodes = document.querySelectorAll("div, span, p, strong, h2, h3");
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i] as HTMLElement;
    if (el.children.length) continue;
    const t = (el.textContent || "").trim();
    if (t === "US$ 474" || t === "US$ 1.896" || t === "US$ 5.688" || t === "US$ 1896" || t === "US$ 5688") {
      el.textContent = money(sales);
      continue;
    }
    if (t === "US$ 118" || t === "US$ 472" || t === "US$ 1.416") {
      el.textContent = money(ticket);
    }
  }
  void orders;
}
export default function DigitalBoostOsKpiPaint() {
  const [range, setRange] = useState("7d");
  useEffect(function () {
    function pull() {
      try { setRange(localStorage.getItem("db-os-range-v1") || "7d"); } catch {}
    }
    pull();
    window.addEventListener("db-os-range", pull);
    return function () { window.removeEventListener("db-os-range", pull); };
  }, []);
  useEffect(function () {
    const a = requestAnimationFrame(function () { paint(range); });
    const b = window.setTimeout(function () { paint(range); }, 80);
    return function () {
      cancelAnimationFrame(a);
      window.clearTimeout(b);
    };
  }, [range]);
  return null;
}
""", encoding="utf-8")
print("LISTO KPIS5")
print("Sin observer. 30d no tiene que tildar")
