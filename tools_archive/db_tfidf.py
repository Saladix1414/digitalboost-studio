#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")
L = [
"function toks(s: string) {",
"  return s.toLowerCase().split(/[^a-z0-9áéíóúñ]+/).filter(function (w) { return w.length > 1; });",
"}",
"export function idfOf(docs: string[]) {",
"  const df = new Map<string, number>();",
"  const N = docs.length || 1;",
"  for (let i = 0; i < docs.length; i++) {",
"    const seen = new Set(toks(docs[i]));",
"    seen.forEach(function (t) { df.set(t, (df.get(t) || 0) + 1); });",
"  }",
"  const idf = new Map<string, number>();",
"  df.forEach(function (c, t) { idf.set(t, Math.log((N + 1) / (c + 1)) + 1); });",
"  return idf;",
"}",
"export function tfidfVec(text: string, idf: Map<string, number>) {",
"  const w = toks(text);",
"  const tf = new Map<string, number>();",
"  for (let i = 0; i < w.length; i++) tf.set(w[i], (tf.get(w[i]) || 0) + 1);",
"  const v = new Map<string, number>();",
"  let n = 0;",
"  tf.forEach(function (c, t) {",
"    const x = (c / w.length) * (idf.get(t) || Math.log(2));",
"    v.set(t, x); n += x * x;",
"  });",
"  n = Math.sqrt(n) || 1;",
"  v.forEach(function (x, t) { v.set(t, x / n); });",
"  return v;",
"}",
"export function tfidfCos(a: Map<string, number>, b: Map<string, number>) {",
"  let s = 0;",
"  a.forEach(function (x, t) { const y = b.get(t); if (y) s += x * y; });",
"  return s;",
"}",
"export function tfidfScore(q: string, text: string, idf: Map<string, number>) {",
"  return tfidfCos(tfidfVec(q, idf), tfidfVec(text, idf));",
"}",
]
(src / "DigitalBoostTfidf.ts").write_text("\n".join(L) + "\n", encoding="utf-8")
print("ok tfidf")

s = src / "DigitalBoostSearch.tsx"
if s.is_file():
    t = s.read_text(encoding="utf-8")
    if "tfidfScore" not in t:
        t = 'import { idfOf, tfidfScore } from "./DigitalBoostTfidf";\n' + t
        if "const CORPUS" not in t:
            t = t.replace(
                "];",
                "];\nconst CORPUS = INDEX.map(function (h) { return h.kind + ' ' + h.label; });\nconst IDF = idfOf(CORPUS);",
                1,
            )
        t = t.replace(
            "s: simScore(s, blob)",
            "s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF))",
            1,
        )
        t = t.replace(
            "s: fuzz(s, blob)",
            "s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF))",
            1,
        )
        s.write_text(t, encoding="utf-8")
        print("ok wire")
    else:
        print("ya wire")
print("LISTO TFIDF")
