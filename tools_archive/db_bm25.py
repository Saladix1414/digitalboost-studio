#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
p = src / "DigitalBoostTfidf.ts"
if not p.is_file():
    raise SystemExit("cd digitalboost-studio y corre db_tfidf.py")
t = p.read_text(encoding="utf-8")
if "export function bm25Score" not in t:
    t += "\n".join([
"",
"const K1 = 1.2;",
"const B = 0.75;",
"export function bm25Score(q: string, text: string, docs: string[]) {",
"  const N = docs.length || 1;",
"  let avg = 0;",
"  const ds = docs.map(function (d) { const w = toks(d); avg += w.length; return w; });",
"  avg = avg / N || 1;",
"  const df = new Map<string, number>();",
"  for (let i = 0; i < ds.length; i++) {",
"    const seen = new Set(ds[i]);",
"    seen.forEach(function (term) { df.set(term, (df.get(term) || 0) + 1); });",
"  }",
"  const qw = toks(q);",
"  const dw = toks(text);",
"  const tf = new Map<string, number>();",
"  for (let i = 0; i < dw.length; i++) tf.set(dw[i], (tf.get(dw[i]) || 0) + 1);",
"  const dl = dw.length || 1;",
"  let s = 0;",
"  for (let i = 0; i < qw.length; i++) {",
"    const term = qw[i];",
"    const f = tf.get(term) || 0;",
"    if (!f) continue;",
"    const n = df.get(term) || 0;",
"    const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);",
"    const den = f + K1 * (1 - B + B * (dl / avg));",
"    s += idf * (f * (K1 + 1)) / den;",
"  }",
"  return s;",
"}",
"export function bm25Norm(q: string, text: string, docs: string[]) {",
"  const raw = bm25Score(q, text, docs);",
"  return raw / (raw + 1);",
"}",
]) + "\n"
    p.write_text(t, encoding="utf-8")
    print("ok bm25")
else:
    print("ya bm25")

s = src / "DigitalBoostSearch.tsx"
if s.is_file():
    st = s.read_text(encoding="utf-8")
    st = st.replace(
        "import { idfOf, tfidfScore } from \"./DigitalBoostTfidf\";",
        "import { idfOf, tfidfScore, bm25Norm } from \"./DigitalBoostTfidf\";",
        1,
    )
    st = st.replace(
        "s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF))",
        "s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF), bm25Norm(s, blob, CORPUS))",
        1,
    )
    s.write_text(st, encoding="utf-8")
    print("ok wire")
print("LISTO BM25")
print("k1=1.2 b=0.75 · norm raw/(raw+1)")
