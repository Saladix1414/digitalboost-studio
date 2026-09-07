#!/usr/bin/env python3
from pathlib import Path

Path("src/DigitalBoostPulseLev.ts").write_text(r"""
export function levenshtein(a: string, b: string, maxDist?: number): number {
  let s = (a || "").toLowerCase();
  let t = (b || "").toLowerCase();
  if (s === t) return 0;
  if (s.length > t.length) { const tmp = s; s = t; t = tmp; }
  const n = s.length;
  const m = t.length;
  if (!n) return m;
  if (maxDist !== undefined && m - n > maxDist) return maxDist + 1;
  const prev: number[] = new Array(n + 1);
  const next: number[] = new Array(n + 1);
  for (let i = 0; i <= n; i++) prev[i] = i;
  for (let j = 1; j <= m; j++) {
    const band = maxDist !== undefined ? maxDist : n;
    const from = maxDist !== undefined ? Math.max(1, j - band) : 1;
    const to = maxDist !== undefined ? Math.min(n, j + band) : n;
    next[0] = j;
    if (from > 1) next[from - 1] = maxDist !== undefined ? maxDist + 1 : j;
    let rowMin = next[0];
    for (let i = from; i <= to; i++) {
      const cost = s.charCodeAt(i - 1) === t.charCodeAt(j - 1) ? 0 : 1;
      next[i] = Math.min(next[i - 1] + 1, prev[i] + 1, prev[i - 1] + cost);
      if (next[i] < rowMin) rowMin = next[i];
    }
    if (to < n) next[to + 1] = maxDist !== undefined ? maxDist + 1 : n;
    if (maxDist !== undefined && rowMin > maxDist) return maxDist + 1;
    for (let i = 0; i <= n; i++) prev[i] = next[i];
  }
  return prev[n];
}

export function similarity(a: string, b: string): number {
  const n = Math.max((a || "").length, (b || "").length, 1);
  const d = levenshtein(a, b);
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
    if (Math.abs(tok.length - k.length) > max) continue;
    if (levenshtein(tok, k, max) <= max) return true;
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
    const d = levenshtein(tokens[i], k, 3);
    if (d < best) best = d;
  }
  return best;
}
""", encoding="utf-8")
print("LISTO LEV2")
print("banda k + prune |len| + 2 filas")
