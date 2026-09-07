#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostEmbed.ts")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
L = [
"const DIM = 64;",
"const cache = new Map<string, Float32Array>();",
"function fnv(s: string) {",
"  let h = 2166136261;",
"  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }",
"  return h >>> 0;",
"}",
"function grams(s: string) {",
"  const compact = s.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');",
"  const words = s.toLowerCase().split(/[^a-z0-9áéíóúñ]+/).filter(Boolean);",
"  const g: string[] = words.slice();",
"  const cap = Math.min(compact.length, 48);",
"  for (let i = 0; i < cap - 1; i++) g.push(compact.slice(i, i + 2));",
"  for (let i = 0; i < cap - 2; i++) g.push(compact.slice(i, i + 3));",
"  return g;",
"}",
"export function embed(text: string): Float32Array {",
"  const key = text.toLowerCase().trim();",
"  const hit = cache.get(key);",
"  if (hit) return hit;",
"  const v = new Float32Array(DIM);",
"  const g = grams(key);",
"  for (let i = 0; i < g.length; i++) {",
"    const h = fnv(g[i]);",
"    const bucket = h % DIM;",
"    const sign = (h & 1) === 0 ? 1 : -1;",
"    v[bucket] += sign;",
"  }",
"  let n = 0;",
"  for (let i = 0; i < DIM; i++) n += v[i] * v[i];",
"  n = Math.sqrt(n) || 1;",
"  for (let i = 0; i < DIM; i++) v[i] /= n;",
"  if (cache.size > 200) cache.clear();",
"  cache.set(key, v);",
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
p.write_text("\n".join(L) + "\n", encoding="utf-8")
print("ok embed opt", len(L))
print("LISTO OPT")
