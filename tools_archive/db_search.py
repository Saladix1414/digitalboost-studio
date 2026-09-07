#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
cc = src / "DigitalBoostCommandCenter.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))

(src / "DigitalBoostSearch.tsx").write_text(r"""
import { useMemo, useState } from "react";
type Hit = { id: string; kind: string; label: string; go: string };
const INDEX: Hit[] = [
  { id: "DB-1048", kind: "Pedido", label: "DB-1048 · Martin Gonzalez · Pagado", go: "orders" },
  { id: "DB-1047", kind: "Pedido", label: "DB-1047 · Sofia Rodriguez · En preparacion", go: "orders" },
  { id: "DB-1046", kind: "Pedido", label: "DB-1046 · Lucas Fernandez · Enviado", go: "orders" },
  { id: "p1", kind: "Producto", label: "Campera Aura Navy", go: "products" },
  { id: "p2", kind: "Producto", label: "Tote Cyan Pulse", go: "products" },
  { id: "p3", kind: "Producto", label: "Hoodie Violet Grid", go: "products" },
  { id: "c1", kind: "Cliente", label: "Martin Gonzalez", go: "customers" },
  { id: "cmd-health", kind: "Comando", label: "Store Health", go: "__health" },
  { id: "cmd-ai", kind: "Comando", label: "PULSE", go: "__ai" },
  { id: "cmd-builder", kind: "Comando", label: "Store Builder", go: "website-builder" }
];
export default function DigitalBoostSearch(props: {
  onClose: () => void;
  onNavigate: (id: any) => void;
  onOpenHealth?: () => void;
  onOpenAI?: () => void;
}) {
  const [q, setQ] = useState("");
  const hits = useMemo(function () {
    const s = q.trim().toLowerCase();
    if (!s) return INDEX;
    return INDEX.filter(function (h) { return (h.kind + " " + h.label).toLowerCase().indexOf(s) !== -1; });
  }, [q]);
  function go(h: Hit) {
    props.onClose();
    if (h.go === "__health" && props.onOpenHealth) props.onOpenHealth();
    else if (h.go === "__ai" && props.onOpenAI) props.onOpenAI();
    else props.onNavigate(h.go);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Search</div>
          <input autoFocus className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder="Pedidos, productos, clientes, PULSE" value={q} onChange={function (e) { setQ(e.target.value); }} />
        </div>
        <div className="p-2">
          {hits.map(function (h) {
            return (
              <button key={h.id} type="button" onClick={function () { go(h); }} className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-[#14233F]">
                <span className="text-sm">{h.label}</span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">{h.kind}</span>
              </button>
            );
          })}
          {!hits.length && <p className="px-3 py-6 text-xs text-[#AFC0D5]">Sin resultados.</p>}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok search ui")

w = ws.read_text(encoding="utf-8")
if "DigitalBoostSearch from" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostSearch from "./DigitalBoostSearch.tsx";',
        1,
    )
if "showSearch" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showSearch, setShowSearch] = useState(false);",
        1,
    )
if "<DigitalBoostSearch" not in w:
    w = w.replace(
        "{showAI &&",
        "{showSearch && (<DigitalBoostSearch onClose={() => setShowSearch(false)} onNavigate={(id) => { setShowSearch(false); setSection(id); }} onOpenHealth={() => setShowHealth(true)} onOpenAI={() => setShowAI(true)} />)}\n      {showAI &&",
        1,
    )
if "onOpenSearch" not in w:
    w = w.replace(
        "onOpenAI={() => setShowAI(true)}",
        "onOpenAI={() => setShowAI(true)} onOpenSearch={() => setShowSearch(true)}",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")

if cc.is_file():
    c = cc.read_text(encoding="utf-8")
    if "onOpenSearch" not in c:
        c = c.replace("onOpenAI: () => void;", "onOpenAI: () => void;\n  onOpenSearch?: () => void;", 1)
        c = c.replace("if (id === \"ai\") props.onOpenAI();", "if (id === \"ai\") props.onOpenAI();\n    else if (id === \"search\" && props.onOpenSearch) props.onOpenSearch();", 1)
    if 'id: "search"' not in c:
        c = c.replace(
            '{ id: "ai", label: "Open PULSE"',
            '{ id: "search", label: "Open Search", k: "buscar search pedidos" },\n  { id: "ai", label: "Open PULSE"',
            1,
        )
        if 'id: "search"' not in c:
            c = c.replace(
                '{ id: "ai", label: "Open AI Operator"',
                '{ id: "search", label: "Open Search", k: "buscar search" },\n  { id: "ai", label: "Open AI Operator"',
                1,
            )
    cc.write_text(c, encoding="utf-8")
    print("ok command")
print("LISTO SEARCH")
print("Cmd -> Open Search -> DB-1048")
