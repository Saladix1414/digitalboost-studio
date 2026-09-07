#!/usr/bin/env python3
from pathlib import Path

kb = Path("src/DigitalBoostPulseKB.ts")
if not kb.is_file():
    raise SystemExit("Falta PulseKB")
t = kb.read_text(encoding="utf-8")

if "function lev(" not in t:
    helper = r"""
function lev(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0: number[] = [];
  const v1: number[] = [];
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a.charAt(i) === b.charAt(j) ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v0[b.length];
}
function fuzzyHit(q: string, key: string) {
  if (!key) return false;
  if (q.indexOf(key) !== -1) return true;
  if (key.length < 4) return false;
  const max = key.length >= 7 ? 2 : 1;
  const tokens = q.split(/[^a-z0-9áéíóúüñ]+/);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.length < 3) continue;
    if (lev(tok, key) <= max) return true;
    if (tok.length >= 4 && key.indexOf(tok) !== -1) return true;
  }
  return false;
}
"""
    if "function st(" in t:
        t = t.replace("function st(", helper + "function st(", 1)
    elif "function mul(" in t:
        t = t.replace("function mul(", helper + "function mul(", 1)
    else:
        t = t.replace("export function decide", helper + "export function decide", 1)
    print("ok lev")

old_score = '''function score(q: string, keys: string[]) {
  let s = 0;
  for (let i = 0; i < keys.length; i++) {
    if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;
  }
  return s;
}'''
new_score = '''function score(q: string, keys: string[]) {
  let s = 0;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (q.indexOf(k) !== -1) s += k.length > 4 ? 2 : 1;
    else if (fuzzyHit(q, k)) s += 1;
  }
  return s;
}'''
if old_score in t:
    t = t.replace(old_score, new_score, 1)
    print("ok score")
elif "function score(" in t:
    t = t.replace(
        "if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;",
        "if (q.indexOf(keys[i]) !== -1) s += keys[i].length > 4 ? 2 : 1;\n    else if (fuzzyHit(q, keys[i])) s += 1;",
        1,
    )
    print("ok score patch")
else:
    print("WARN no function score — decide usa ifs")

t = t.replace(
    "if (q.indexOf(row.ks[i]) !== -1)",
    "if (q.indexOf(row.ks[i]) !== -1 || fuzzyHit(q, row.ks[i]))",
)
kb.write_text(t, encoding="utf-8")
print("LISTO FUZZY")
print("Proba: ventaz / pedids / helth / campaa")
