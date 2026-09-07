#!/usr/bin/env python3
from pathlib import Path
import re, shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

def bak(rel):
    p = root / rel
    if p.is_file():
        dest = p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix)
        shutil.copy2(p, dest)
        print("backup", dest.name)

print("FASE 1-2-5  tokens + shell + command center")
bak("src/StoreBuilderWorkspace.tsx")
bak("index.html")

(root / "src" / "digitalboost-os.css").write_text("""
:root{
  --db-bg:#0A1020;
  --db-deep:#0C1427;
  --db-surface:#101B32;
  --db-surface-2:#14233F;
  --db-violet:#8B5CF6;
  --db-cyan:#22D3EE;
  --db-text:#F7FAFF;
  --db-muted:#AFC0D5;
}
html,body,#root,#app{
  background:var(--db-bg);
  color:var(--db-text);
}
[data-store-builder="true"]{
  background:var(--db-bg) !important;
  color:var(--db-text) !important;
}
[data-store-builder="true"] > aside{
  background:#070D18 !important;
  color:var(--db-text) !important;
  border-color:rgba(247,250,255,.12) !important;
}
[data-store-builder="true"] > main{
  background:var(--db-bg) !important;
  color:var(--db-text) !important;
}
[data-store-builder="true"] > main > header{
  background:var(--db-bg) !important;
  color:var(--db-text) !important;
  border-color:rgba(247,250,255,.12) !important;
}
[data-store-builder="true"] > main > header [class*="text-[#475569]"]{
  color:var(--db-muted) !important;
}
.db-cmd-overlay{
  position:fixed;inset:0;z-index:200;
  background:rgba(7,13,24,.72);
  display:flex;align-items:flex-start;justify-content:center;
  padding:12vh 16px 16px;
}
.db-cmd-panel{
  width:min(560px,100%);
  background:#101B32;
  border:1px solid rgba(247,250,255,.12);
  border-radius:16px;
  overflow:hidden;
  color:#F7FAFF;
}
.db-cmd-panel input{
  width:100%;height:48px;border:0;outline:0;
  background:#0C1427;color:#F7FAFF;
  padding:0 16px;font-size:14px;
}
.db-cmd-item{
  display:block;width:100%;text-align:left;
  padding:10px 16px;background:transparent;border:0;
  color:#D7E2F0;font-size:13px;cursor:pointer;
}
.db-cmd-item.active,.db-cmd-item:hover{background:#14233F;color:#fff}
""", encoding="utf-8")
print("ok digitalboost-os.css")

(root / "src" / "DigitalBoostCommandCenter.tsx").write_text("""
import { useEffect, useMemo, useState } from "react";
import "./digitalboost-os.css";

type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
};

const COMMANDS = [
  { id: "dashboard", label: "Go to Overview", k: "inicio overview dashboard" },
  { id: "orders", label: "Go to Orders", k: "pedidos orders" },
  { id: "products", label: "Go to Products", k: "productos products" },
  { id: "customers", label: "Go to Customers", k: "clientes customers" },
  { id: "analytics", label: "Go to Analytics", k: "analytics metricas" },
  { id: "campaigns", label: "Go to Marketing", k: "marketing campanas" },
  { id: "website-builder", label: "Open Store Builder", k: "store builder tienda" },
  { id: "settings", label: "Open Settings", k: "configuracion settings" },
  { id: "ai", label: "Open AI Operator", k: "ia ai operator" },
];

export default function DigitalBoostCommandCenter({ onNavigate, onOpenAI }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter((c) => (c.label + " " + c.k).toLowerCase().includes(s));
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setI(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function run(id: string) {
    setOpen(false);
    if (id === "ai") onOpenAI();
    else onNavigate(id);
  }

  if (!open) return null;
  return (
    <div className="db-cmd-overlay" onClick={() => setOpen(false)}>
      <div className="db-cmd-panel" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder="Command Center  ·  busca o ejecutá"
          value={q}
          onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setI((n) => Math.min(items.length - 1, n + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
            if (e.key === "Enter" && items[i]) run(items[i].id);
          }}
        />
        <div>
          {items.map((c, n) => (
            <button
              key={c.id}
              type="button"
              className={n === i ? "db-cmd-item active" : "db-cmd-item"}
              onClick={() => run(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok DigitalBoostCommandCenter.tsx")

txt = ws.read_text(encoding="utf-8")
txt = txt.replace("db-commerce-white ", "").replace("db-commerce-white", "")
txt = txt.replace(
    'import "./digitalboost-store-builder-white-authoritative.css";',
    '// import "./digitalboost-store-builder-white-authoritative.css";',
)
if "digitalboost-os.css" not in txt:
    lines = txt.splitlines(True)
    last = 0
    for n, line in enumerate(lines):
        if line.startswith("import "):
            last = n
    lines.insert(last + 1, 'import "./digitalboost-os.css";\n')
    txt = "".join(lines)
if "DigitalBoostCommandCenter" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostCommandCenter from "./DigitalBoostCommandCenter";',
        1,
    )
    txt = txt.replace(
        "{showAI && (",
        "{<DigitalBoostCommandCenter onNavigate={setSection} onOpenAI={() => setShowAI(true)} />}\n      {showAI && (",
        1,
    )
ws.write_text(txt, encoding="utf-8")
print("ok StoreBuilderWorkspace.tsx")

idxp = root / "index.html"
if idxp.is_file():
    idx = idxp.read_text(encoding="utf-8")
    idx = re.sub(r'<style id="digitalboost-white-root">[\s\S]*?</style>', "", idx)
    idx = re.sub(r'<style id="digitalboost-store-builder-final-root">[\s\S]*?</style>', "", idx)
    idx = idx.replace("bg-[#F5F7FB]", "bg-[#0A1020]")
    idx = idx.replace("text-[#172033]", "text-[#F7FAFF]")
    idxp.write_text(idx, encoding="utf-8")
    print("ok index.html")

print("LISTO")
print("Siguiente: Ctrl+K = Command Center")
print("No implementado: Health, Automations, Integrations, Version History")
