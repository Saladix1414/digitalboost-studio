#!/usr/bin/env python3
from pathlib import Path

Path("src/DigitalBoostPulseLev.ts").write_text(r"""
function prep(a: string, b: string) {
  let s = (a || "").toLowerCase();
  let t = (b || "").toLowerCase();
  return { s: s, t: t };
}

export function damerauLevenshtein(a: string, b: string, maxDist?: number): number {
  const p = prep(a, b);
  const s = p.s;
  const t = p.t;
  if (s === t) return 0;
  const n = s.length;
  const m = t.length;
  if (!n) return m;
  if (!m) return n;
  if (maxDist !== undefined && Math.abs(n - m) > maxDist) return maxDist + 1;
  const rows = n + 1;
  const cols = m + 1;
  const d: number[] = new Array(rows * cols);
  const at = function (i: number, j: number) { return i * cols + j; };
  for (let i = 0; i <= n; i++) d[at(i, 0)] = i;
  for (let j = 0; j <= m; j++) d[at(0, j)] = j;
  for (let i = 1; i <= n; i++) {
    let rowMin = maxDist !== undefined ? maxDist + 1 : n + m;
    for (let j = 1; j <= m; j++) {
      const cost = s.charCodeAt(i - 1) === t.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min(
        d[at(i - 1, j)] + 1,
        d[at(i, j - 1)] + 1,
        d[at(i - 1, j - 1)] + cost
      );
      if (i > 1 && j > 1 && s.charCodeAt(i - 1) === t.charCodeAt(j - 2) && s.charCodeAt(i - 2) === t.charCodeAt(j - 1)) {
        v = Math.min(v, d[at(i - 2, j - 2)] + 1);
      }
      d[at(i, j)] = v;
      if (v < rowMin) rowMin = v;
    }
    if (maxDist !== undefined && rowMin > maxDist) return maxDist + 1;
  }
  return d[at(n, m)];
}

export function levenshtein(a: string, b: string, maxDist?: number): number {
  return damerauLevenshtein(a, b, maxDist);
}

export function similarity(a: string, b: string): number {
  const n = Math.max((a || "").length, (b || "").length, 1);
  return 1 - damerauLevenshtein(a, b) / n;
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
    if (Math.abs(tok.length - k.length) > max) continue;
    if (damerauLevenshtein(tok, k, max) <= max) return true;
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
    const d = damerauLevenshtein(tokens[i], k, 3);
    if (d < best) best = d;
  }
  return best;
}
""", encoding="utf-8")
print("LISTO DAMERAU")
print("vnetas / ventsa -> ventas (transposición = 1)")
