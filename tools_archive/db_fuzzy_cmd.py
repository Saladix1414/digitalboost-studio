#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
p = src / "DigitalBoostSearch.tsx"
if not p.is_file():
    raise SystemExit("cd digitalboost-studio y corre db_cmdk.py")
t = p.read_text(encoding="utf-8")
lev = src / "DigitalBoostPulseLev.ts"
imp = 'import { similarity } from "./DigitalBoostPulseLev";\n' if lev.is_file() else ""
if "function fuzz" not in t:
    fuzz = (
        "function lev(a: string, b: string) {\n"
        "  const m = a.length, n = b.length;\n"
        "  if (!m) return n; if (!n) return m;\n"
        "  const dp: number[] = [];\n"
        "  for (let j = 0; j <= n; j++) dp[j] = j;\n"
        "  for (let i = 1; i <= m; i++) {\n"
        "    let prev = dp[0]; dp[0] = i;\n"
        "    for (let j = 1; j <= n; j++) {\n"
        "      const tmp = dp[j];\n"
        "      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));\n"
        "      prev = tmp;\n"
        "    }\n"
        "  }\n"
        "  return dp[n];\n"
        "}\n"
        "function fuzz(q: string, t: string) {\n"
        "  if (t.indexOf(q) !== -1) return 1;\n"
        "  const parts = t.split(/[^a-z0-9]+/);\n"
        "  let best = 0;\n"
        "  for (let i = 0; i < parts.length; i++) {\n"
        "    const p = parts[i];\n"
        "    if (!p) continue;\n"
        "    const d = lev(q, p.slice(0, q.length + 2));\n"
        "    const s = 1 - d / Math.max(q.length, p.length, 1);\n"
        "    if (s > best) best = s;\n"
        "  }\n"
        "  return best;\n"
        "}\n"
    )
    if "from \"react\"" in t:
        t = t.replace('from "react";', 'from "react";\n' + fuzz, 1)
    else:
        t = fuzz + t
    print("ok fuzz fn")
old = "if (!s) return INDEX;\n    return INDEX.filter(function (h) { return (h.kind + ' ' + h.label).toLowerCase().indexOf(s) !== -1; });"
new = (
    "if (!s) return INDEX;\n"
    "    return INDEX.map(function (h) {\n"
    "      const blob = (h.kind + ' ' + h.label).toLowerCase();\n"
    "      return { h: h, s: fuzz(s, blob) };\n"
    "    }).filter(function (x) { return x.s >= 0.45; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.h; });"
)
if old in t:
    t = t.replace(old, new, 1)
    print("ok memo")
elif "fuzz(s, blob)" in t:
    print("ya memo")
else:
    print("no match memo — el filter cambio")
p.write_text(t, encoding="utf-8")
print("LISTO FUZZY")
print("proba: pulze, 1046, campera, healt")
