#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
p = src / "DigitalBoostTfidf.ts"
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
t = p.read_text(encoding="utf-8")
if "export function bm25PlusRank" not in t:
    t += "\n".join([
"",
"const DELTA = 1.0;",
"export function bm25PlusScore(q: string, text: string, docs: string[]) {",
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
"    const n = df.get(term) || 0;",
"    const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);",
"    const den = f + K1 * (1 - B + B * (dl / avg));",
"    const tfN = f ? (f * (K1 + 1)) / den : 0;",
"    s += idf * (tfN + DELTA);",
"  }",
"  return s;",
"}",
"export function bm25PlusRank(q: string, docs: string[]) {",
"  const raw = docs.map(function (d) { return bm25PlusScore(q, d, docs); });",
"  let l2 = 0;",
"  for (let i = 0; i < raw.length; i++) l2 += raw[i] * raw[i];",
"  l2 = Math.sqrt(l2) || 1;",
"  return raw.map(function (x) { return x / l2; });",
"}",
]) + "\n"
    p.write_text(t, encoding="utf-8")
    print("ok bm25+")
else:
    print("ya bm25+")

s = src / "DigitalBoostSearch.tsx"
if s.is_file():
    st = s.read_text(encoding="utf-8")
    st = st.replace(
        "import { idfOf, tfidfScore, bm25Norm } from \"./DigitalBoostTfidf\";",
        "import { idfOf, tfidfScore, bm25Norm, bm25PlusRank } from \"./DigitalBoostTfidf\";",
        1,
    )
    old = "return INDEX.map(function (h) {\n      const blob = (h.kind + ' ' + h.label).toLowerCase();\n      return { h: h, s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF), bm25Norm(s, blob, CORPUS)) };"
    new = (
        "const plus = bm25PlusRank(s, CORPUS);\n"
        "    return INDEX.map(function (h, i) {\n"
        "      const blob = (h.kind + ' ' + h.label).toLowerCase();\n"
        "      return { h: h, s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF), bm25Norm(s, blob, CORPUS), plus[i] || 0) };"
    )
    if old in st:
        st = st.replace(old, new, 1)
        print("ok wire")
    elif "bm25PlusRank" in st:
        print("ya wire")
    else:
        print("no match memo — pegá el useMemo si falla")
        s.write_text(st, encoding="utf-8")
        print("LISTO parcial")
        raise SystemExit(0)
    s.write_text(st, encoding="utf-8")
print("LISTO BM25+")
