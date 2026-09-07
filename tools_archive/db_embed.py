#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")
L = [
"const DIM = 64;",
"function tokens(s: string) {",
"  const t = s.toLowerCase().replace(/[^a-z0-9áéíóúñ\\s]/g, ' ');",
"  const w = t.split(/\\s+/).filter(Boolean);",
"  const grams: string[] = w.slice();",
"  for (let i = 0; i < t.length - 2; i++) grams.push(t.slice(i, i + 3));",
"  return grams;",
"}",
"function hash(s: string) {",
"  let h = 2166136261;",
"  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }",
"  return (h >>> 0) % DIM;",
"}",
"export function embed(text: string): Float32Array {",
"  const v = new Float32Array(DIM);",
"  const g = tokens(text);",
"  for (let i = 0; i < g.length; i++) v[hash(g[i])] += 1;",
"  let n = 0;",
"  for (let i = 0; i < DIM; i++) n += v[i] * v[i];",
"  n = Math.sqrt(n) || 1;",
"  for (let i = 0; i < DIM; i++) v[i] /= n;",
"  return v;",
"}",
"export function cosine(a: Float32Array, b: Float32Array) {",
"  let s = 0;",
"  for (let i = 0; i < DIM; i++) s += a[i] * b[i];",
"  return s;",
"}",
"export function embedScore(q: string, text: string) {",
"  return cosine(embed(q), embed(text));",
"}",
]
(src / "DigitalBoostEmbed.ts").write_text("\n".join(L) + "\n", encoding="utf-8")
print("ok embed")

sim = src / "DigitalBoostSim.ts"
if sim.is_file():
    t = sim.read_text(encoding="utf-8")
    if "embedScore" not in t:
        t = 'import { embedScore } from "./DigitalBoostEmbed";\n' + t
        t = t.replace(
            "return Math.max(jw * 0.5 + jac * 0.25 + dice * 0.25, jw, jac, dice);",
            "const emb = embedScore(a, b);\n  return Math.max(jw * 0.4 + jac * 0.2 + dice * 0.15 + emb * 0.25, jw, jac, dice, emb);",
            1,
        )
        sim.write_text(t, encoding="utf-8")
        print("ok blend")
    else:
        print("ya blend")
print("LISTO EMBED")
print("64-d hashing trick + cosine. MiniLM = otro paso (peso).")

