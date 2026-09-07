#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
(src / "DigitalBoostPulseLev.ts").write_text(r"""
export function levenshtein(a: string, b: string): number {
  const s = (a || "").toLowerCase();
  const t = (b || "").toLowerCase();
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const prev: number[] = [];
  const next: number[] = [];
  for (let j = 0; j <= t.length; j++) prev[j] = j;
  for (let i = 0; i < s.length; i++) {
    next[0] = i + 1;
    for (let j = 0; j < t.length; j++) {
      const cost = s.charCodeAt(i) === t.charCodeAt(j) ? 0 : 1;
      next[j + 1] = Math.min(next[j] + 1, prev[j + 1] + 1, prev[j] + cost);
    }
    for (let j = 0; j <= t.length; j++) prev[j] = next[j];
  }
  return prev[t.length];
}

export function similarity(a: string, b: string): number {
  const d = levenshtein(a, b);
  const n = Math.max((a || "").length, (b || "").length, 1);
  return 1 - d / n;
}

export function fuzzyHit(q: string, key: string): boolean {
  const query = (q || "").toLowerCase();
  const k = (key || "").toLowerCase();
  if (!k) return false;
  if (query.indexOf(k) !== -1) return true;
  if (k.length < 4) return false;
  const max = k.length >= 7 ? 2 : 1;
  const tokens = query.split(/[^a-z0-9áéíóúüñ]+/);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.length < 3) continue;
    if (levenshtein(tok, k) <= max) return true;
    if (similarity(tok, k) >= 0.72) return true;
  }
  return false;
}

export function bestDistance(q: string, key: string): number {
  const query = (q || "").toLowerCase();
  const k = (key || "").toLowerCase();
  if (query.indexOf(k) !== -1) return 0;
  let best = 99;
  const tokens = query.split(/[^a-z0-9áéíóúüñ]+/);
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].length < 3) continue;
    const d = levenshtein(tokens[i], k);
    if (d < best) best = d;
  }
  return best;
}
""", encoding="utf-8")
print("ok Lev.ts")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8")
if 'from "./DigitalBoostPulseLev"' not in t:
    t = 'import { bestDistance, fuzzyHit } from "./DigitalBoostPulseLev";\n' + t
if "function score(" in t and "fuzzyHit(q, keys[i])" not in t and "fuzzyHit(q, k)" not in t:
    t = t.replace(
        "if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;",
        "if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;\n    else if (fuzzyHit(q, keys[i])) s += 1;",
        1,
    )
t = t.replace(
    "if (q.indexOf(row.ks[i]) !== -1) {",
    "if (q.indexOf(row.ks[i]) !== -1 || fuzzyHit(q, row.ks[i])) {",
)
# debug body: append distances if explain exists
if "export function explain" in t and "bestDistance" not in t.split("export function explain")[-1][:1500]:
    t = t.replace(
        'return {\n    title: "PULSE · Debug",',
        '''const dist = ranked[0] ? bestDistance(q, ranked[0].hit[0] || "") : 99;
  return {
    title: "PULSE · Debug",''',
        1,
    )
    t = t.replace(
        'body: "Query «" + q + "». "',
        'body: "Query «" + q + "» lev=" + dist + ". "',
        1,
    )
kb.write_text(t, encoding="utf-8")
print("ok KB")
print("LISTO LEV")
print("ventaz -> ventas dist 1")
