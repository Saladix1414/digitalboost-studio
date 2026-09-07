#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")
L = [
"export function jaroWinkler(a: string, b: string) {",
"  if (a === b) return 1;",
"  const m = a.length, n = b.length;",
"  if (!m || !n) return 0;",
"  const match = Math.floor(Math.max(m, n) / 2) - 1;",
"  const am = new Array(m), bm = new Array(n);",
"  let matches = 0, trans = 0;",
"  for (let i = 0; i < m; i++) {",
"    const lo = Math.max(0, i - match), hi = Math.min(i + match + 1, n);",
"    for (let j = lo; j < hi; j++) {",
"      if (bm[j] || a[i] !== b[j]) continue;",
"      am[i] = true; bm[j] = true; matches++; break;",
"    }",
"  }",
"  if (!matches) return 0;",
"  let k = 0;",
"  for (let i = 0; i < m; i++) {",
"    if (!am[i]) continue;",
"    while (!bm[k]) k++;",
"    if (a[i] !== b[k]) trans++;",
"    k++;",
"  }",
"  const jaro = (matches / m + matches / n + (matches - trans / 2) / matches) / 3;",
"  let pref = 0;",
"  for (let i = 0; i < Math.min(4, m, n); i++) { if (a[i] === b[i]) pref++; else break; }",
"  return jaro + pref * 0.1 * (1 - jaro);",
"}",
"export function tokenJaccard(a: string, b: string) {",
"  const A = a.split(/[^a-z0-9]+/).filter(Boolean);",
"  const B = b.split(/[^a-z0-9]+/).filter(Boolean);",
"  if (!A.length || !B.length) return 0;",
"  const set = new Set(A);",
"  let inter = 0;",
"  for (let i = 0; i < B.length; i++) if (set.has(B[i])) inter++;",
"  return inter / (A.length + B.length - inter);",
"}",
"export function diceBigram(a: string, b: string) {",
"  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;",
"  const grams = function (s: string) { const o: Record<string, number> = {}; for (let i = 0; i < s.length - 1; i++) o[s.slice(i, i + 2)] = (o[s.slice(i, i + 2)] || 0) + 1; return o; };",
"  const A = grams(a), B = grams(b);",
"  let inter = 0, na = 0, nb = 0;",
"  for (const k in A) { na += A[k]; if (B[k]) inter += Math.min(A[k], B[k]); }",
"  for (const k in B) nb += B[k];",
"  return (2 * inter) / (na + nb);",
"}",
"export function simScore(q: string, text: string) {",
"  const a = q.toLowerCase().trim();",
"  const b = text.toLowerCase().trim();",
"  if (!a) return 1;",
"  if (b.indexOf(a) !== -1) return 1;",
"  const jw = jaroWinkler(a, b.slice(0, Math.max(a.length + 4, 12)));",
"  const jac = tokenJaccard(a, b);",
"  const dice = diceBigram(a, b.replace(/\\s+/g, ''));",
"  return Math.max(jw * 0.5 + jac * 0.25 + dice * 0.25, jw, jac, dice);",
"}",
]
(src / "DigitalBoostSim.ts").write_text("\n".join(L) + "\n", encoding="utf-8")
print("ok sim")

s = src / "DigitalBoostSearch.tsx"
if s.is_file():
    t = s.read_text(encoding="utf-8")
    if "simScore" not in t:
        t = 'import { simScore } from "./DigitalBoostSim";\n' + t
        t = t.replace("s: fuzz(s, blob)", "s: simScore(s, blob)")
        t = t.replace("x.s >= 0.45", "x.s >= 0.38")
        s.write_text(t, encoding="utf-8")
        print("ok search wire")
    else:
        print("ya search")
print("LISTO SIM")
