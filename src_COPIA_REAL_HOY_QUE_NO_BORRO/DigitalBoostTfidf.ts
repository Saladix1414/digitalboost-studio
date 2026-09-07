function toks(s: string) {
  return s.toLowerCase().split(/[^a-z0-9áéíóúñ]+/).filter(function (w) { return w.length > 1; });
}
export function idfOf(docs: string[]) {
  const df = new Map<string, number>();
  const N = docs.length || 1;
  for (let i = 0; i < docs.length; i++) {
    const seen = new Set(toks(docs[i]));
    seen.forEach(function (t) { df.set(t, (df.get(t) || 0) + 1); });
  }
  const idf = new Map<string, number>();
  df.forEach(function (c, t) { idf.set(t, Math.log((N + 1) / (c + 1)) + 1); });
  return idf;
}
export function tfidfVec(text: string, idf: Map<string, number>) {
  const w = toks(text);
  const tf = new Map<string, number>();
  for (let i = 0; i < w.length; i++) tf.set(w[i], (tf.get(w[i]) || 0) + 1);
  const v = new Map<string, number>();
  let n = 0;
  tf.forEach(function (c, t) {
    const x = (c / w.length) * (idf.get(t) || Math.log(2));
    v.set(t, x); n += x * x;
  });
  n = Math.sqrt(n) || 1;
  v.forEach(function (x, t) { v.set(t, x / n); });
  return v;
}
export function tfidfCos(a: Map<string, number>, b: Map<string, number>) {
  let s = 0;
  a.forEach(function (x, t) { const y = b.get(t); if (y) s += x * y; });
  return s;
}
export function tfidfScore(q: string, text: string, idf: Map<string, number>) {
  return tfidfCos(tfidfVec(q, idf), tfidfVec(text, idf));
}

const K1 = 1.2;
const B = 0.75;
export function bm25Score(q: string, text: string, docs: string[]) {
  const N = docs.length || 1;
  let avg = 0;
  const ds = docs.map(function (d) { const w = toks(d); avg += w.length; return w; });
  avg = avg / N || 1;
  const df = new Map<string, number>();
  for (let i = 0; i < ds.length; i++) {
    const seen = new Set(ds[i]);
    seen.forEach(function (term) { df.set(term, (df.get(term) || 0) + 1); });
  }
  const qw = toks(q);
  const dw = toks(text);
  const tf = new Map<string, number>();
  for (let i = 0; i < dw.length; i++) tf.set(dw[i], (tf.get(dw[i]) || 0) + 1);
  const dl = dw.length || 1;
  let s = 0;
  for (let i = 0; i < qw.length; i++) {
    const term = qw[i];
    const f = tf.get(term) || 0;
    if (!f) continue;
    const n = df.get(term) || 0;
    const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);
    const den = f + K1 * (1 - B + B * (dl / avg));
    s += idf * (f * (K1 + 1)) / den;
  }
  return s;
}
export function bm25Norm(q: string, text: string, docs: string[]) {
  const raw = bm25Score(q, text, docs);
  return raw / (raw + 1);
}

const DELTA = 1.0;
export function bm25PlusScore(q: string, text: string, docs: string[]) {
  const N = docs.length || 1;
  let avg = 0;
  const ds = docs.map(function (d) { const w = toks(d); avg += w.length; return w; });
  avg = avg / N || 1;
  const df = new Map<string, number>();
  for (let i = 0; i < ds.length; i++) {
    const seen = new Set(ds[i]);
    seen.forEach(function (term) { df.set(term, (df.get(term) || 0) + 1); });
  }
  const qw = toks(q);
  const dw = toks(text);
  const tf = new Map<string, number>();
  for (let i = 0; i < dw.length; i++) tf.set(dw[i], (tf.get(dw[i]) || 0) + 1);
  const dl = dw.length || 1;
  let s = 0;
  for (let i = 0; i < qw.length; i++) {
    const term = qw[i];
    const f = tf.get(term) || 0;
    const n = df.get(term) || 0;
    const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);
    const den = f + K1 * (1 - B + B * (dl / avg));
    const tfN = f ? (f * (K1 + 1)) / den : 0;
    s += idf * (tfN + DELTA);
  }
  return s;
}
export function bm25PlusRank(q: string, docs: string[]) {
  const raw = docs.map(function (d) { return bm25PlusScore(q, d, docs); });
  let l2 = 0;
  for (let i = 0; i < raw.length; i++) l2 += raw[i] * raw[i];
  l2 = Math.sqrt(l2) || 1;
  return raw.map(function (x) { return x / l2; });
}
