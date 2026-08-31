import { idfOf, tfidfScore, bm25Norm, bm25PlusRank } from "./DigitalBoostTfidf";
import { simScore } from "./DigitalBoostSim";
import { useMemo, useState } from "react";
function lev(a: string, b: string) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp: number[] = [];
const CORPUS = INDEX.map(function (h) { return h.kind + ' ' + h.label; });
const IDF = idfOf(CORPUS);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}
function fuzz(q: string, t: string) {
  if (t.indexOf(q) !== -1) return 1;
  const parts = t.split(/[^a-z0-9]+/);
  let best = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    const d = lev(q, p.slice(0, q.length + 2));
    const s = 1 - d / Math.max(q.length, p.length, 1);
    if (s > best) best = s;
  }
  return best;
}

type Hit = { id: string; kind: string; label: string; go: any };
const INDEX: Hit[] = [
  { id: "DB-1048", kind: "Pedido", label: "DB-1048 · pagado", go: "orders" },
  { id: "DB-1047", kind: "Pedido", label: "DB-1047 · preparacion", go: "orders" },
  { id: "p1", kind: "Producto", label: "Campera Nimbus", go: "products" },
  { id: "p2", kind: "Producto", label: "Tote Cyan", go: "products" },
  { id: "p3", kind: "Producto", label: "Hoodie Violet", go: "products" },
  { id: "cmd-health", kind: "Comando", label: "Store Health", go: "__health" },
  { id: "cmd-ai", kind: "Comando", label: "PULSE", go: "__ai" },
  { id: "cmd-builder", kind: "Comando", label: "Store Builder", go: "website-builder" },
  { id: "cmd-insp", kind: "Comando", label: "Inspector canvas", go: "website-builder" }
];
export default function DigitalBoostSearch(props: {
  onClose: () => void;
  onNavigate: (id: any) => void;
  onOpenHealth?: () => void;
  onOpenAI?: () => void;
}) {
  const [q, setQ] = useState('');
  const hits = useMemo(function () {
    const s = q.trim().toLowerCase();
    if (!s) return INDEX;
    const plus = bm25PlusRank(s, CORPUS);
    return INDEX.map(function (h, i) {
      const blob = (h.kind + ' ' + h.label).toLowerCase();
      return { h: h, s: Math.max(simScore(s, blob), tfidfScore(s, blob, IDF), bm25Norm(s, blob, CORPUS), plus[i] || 0) };
    }).filter(function (x) { return x.s >= 0.38; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.h; });
  }, [q]);
  function go(h: Hit) {
    props.onClose();
    if (h.go === '__health' && props.onOpenHealth) props.onOpenHealth();
    else if (h.go === '__ai' && props.onOpenAI) props.onOpenAI();
    else props.onNavigate(h.go);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-start justify-center bg-black/55 p-3 pt-[12vh]" onClick={props.onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Buscar</div>
          <input autoFocus className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder="Pedido, producto, PULSE, builder..." value={q} onChange={function (e) { setQ(e.target.value); }} onKeyDown={function (e) { if (e.key === "Escape") props.onClose(); if (e.key === "Enter" && hits[0]) go(hits[0]); }} />
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {hits.map(function (h) {
            return (
              <button key={h.id} type="button" onClick={function () { go(h); }} className="mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-white/5">
                <span className="text-sm">{h.label}</span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">{h.kind}</span>
              </button>
            );
          })}
          {hits.length === 0 && <p className="px-3 py-6 text-xs text-[#AFC0D5]">Sin resultados.</p>}
        </div>
      </div>
    </div>
  );
}
