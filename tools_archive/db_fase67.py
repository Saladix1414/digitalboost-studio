#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

def bak(rel):
    p = root / rel
    if p.is_file():
        d = p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix)
        shutil.copy2(p, d)
        print("backup", d.name)

bak("src/StoreBuilderWorkspace.tsx")
bak("src/DigitalBoostCommandCenter.tsx")

(root / "src" / "DigitalBoostOperator.tsx").write_text("""
import { useState } from "react";

type Props = {
  onClose: () => void;
  onNavigate: (id: any) => void;
};

function analyze(q: string) {
  const s = q.toLowerCase();
  if (s.includes("venta") || s.includes("sales") || s.includes("rendimiento"))
    return { title: "Analisis de ventas", body: "Revenue semanal en alza (+18,4%). Ticket promedio US$ 118. El drop de conversion en mobile es el freno.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (s.includes("stock") || s.includes("reposic") || s.includes("invent"))
    return { title: "Stock critico", body: "Hay SKUs bajo umbral. Prioriza reposicion antes del proximo drop.", action: "inventory", actionLabel: "Abrir Inventario", confirm: false };
  if (s.includes("conver") || s.includes("homepage") || s.includes("tienda"))
    return { title: "Conversion", body: "El hero convierte. El grid de productos pierde atencion. CTA mas claro + social proof.", action: "website-builder", actionLabel: "Editar en Store Builder", confirm: false };
  if (s.includes("promo") || s.includes("campan") || s.includes("descuento"))
    return { title: "Campana sugerida", body: "Recuperacion de carritos: 10% extra 48h, segmento checkout abandonado.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (s.includes("cliente") || s.includes("vip") || s.includes("reten"))
    return { title: "Clientes", body: "4 clientes activos. 1 perfil de alto valor. Tag VIP + follow-up.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (s.includes("producto") || s.includes("mejor") || s.includes("catalog"))
    return { title: "Catalogo", body: "Los destacados cargan la venta. Completa imagenes y SEO de los que no rotan.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  return { title: "AI Operator", body: "Puedo analizar ventas, stock, conversion, clientes o preparar una campana. Escribi el objetivo.", action: "dashboard", actionLabel: "Ir a Overview", confirm: false };
}

export default function DigitalBoostOperator({ onClose, onNavigate }: Props) {
  const [q, setQ] = useState("");
  const [out, setOut] = useState<ReturnType<typeof analyze> | null>(null);
  const [ask, setAsk] = useState(false);

  function run() {
    const r = analyze(q || "ventas");
    setOut(r);
    setAsk(Boolean(r.confirm));
  }

  function exec() {
    if (!out) return;
    onClose();
    onNavigate(out.action);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">AI Operator</div>
            <div className="text-sm font-semibold">Analyze · Suggest · Execute</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder="Analiza mis ventas / quiero aumentar conversion / stock bajo..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" onClick={run} className="h-11 w-full rounded-lg bg-violet-500 text-sm font-semibold">Analizar</button>
          {out && (
            <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
              <div className="text-sm font-semibold">{out.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#AFC0D5]">{out.body}</p>
              {ask ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={exec} className="h-10 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                  <button type="button" onClick={() => setAsk(false)} className="h-10 flex-1 rounded-lg border border-white/10 text-xs">Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={exec} className="mt-3 h-10 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok Operator")

(root / "src" / "DigitalBoostHealth.tsx").write_text("""
type Issue = { id: string; sev: "error" | "warn" | "hint"; title: string; loc: string; why: string; fix: string; go: string };

const ISSUES: Issue[] = [
  { id: "i1", sev: "error", title: "Checkout incompleto", loc: "Settings / Payments", why: "Falta confirmar proveedor de cobro.", fix: "Abrir pagos", go: "payments" },
  { id: "i2", sev: "error", title: "Stock bajo", loc: "Inventory", why: "SKUs cerca del umbral.", fix: "Ver inventario", go: "inventory" },
  { id: "i3", sev: "warn", title: "Productos sin imagen", loc: "Products", why: "Fichas sin media bajan conversion.", fix: "Completar fichas", go: "products" },
  { id: "i4", sev: "warn", title: "SEO faltante", loc: "SEO Manager", why: "Paginas sin title/description.", fix: "Abrir SEO", go: "seo" },
  { id: "i5", sev: "warn", title: "Coleccion vacia", loc: "Products", why: "Una coleccion no tiene items.", fix: "Organizar catalogo", go: "products" },
  { id: "i6", sev: "hint", title: "Hero sin prueba social", loc: "Store Builder / Home", why: "El canvas puede vender mas con reviews.", fix: "Editar home", go: "website-builder" },
];

export default function DigitalBoostHealth({ onClose, onFix }: { onClose: () => void; onFix: (id: string) => void }) {
  const errors = ISSUES.filter((i) => i.sev === "error").length;
  const warns = ISSUES.filter((i) => i.sev === "warn").length;
  const score = Math.max(40, 100 - errors * 14 - warns * 7);
  const tone = (s: Issue["sev"]) => s === "error" ? "text-red-400" : s === "warn" ? "text-amber-300" : "text-cyan-300";
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">Store Health</div>
            <div className="text-sm font-semibold">Diagnostics · score {score}</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {[["Score", String(score)], ["Errors", String(errors)], ["Warnings", String(warns)]].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">{l}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2 px-4 pb-4">
          {ISSUES.map((i) => (
            <div key={i.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
              <div className={"text-[10px] font-semibold uppercase tracking-[0.14em] " + tone(i.sev)}>{i.sev}</div>
              <div className="mt-1 text-sm font-medium">{i.title}</div>
              <div className="mt-1 text-[11px] text-[#AFC0D5]">{i.loc} · {i.why}</div>
              <button type="button" onClick={() => onFix(i.go)} className="mt-2 h-9 rounded-md border border-cyan-400/30 px-3 text-xs text-cyan-300">{i.fix}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok Health")

(root / "src" / "DigitalBoostCommandCenter.tsx").write_text("""
import { useEffect, useMemo, useState } from "react";

type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenHealth?: () => void;
};

const COMMANDS = [
  { id: "dashboard", label: "Go to Overview", k: "inicio overview" },
  { id: "orders", label: "Go to Orders", k: "pedidos" },
  { id: "products", label: "Go to Products", k: "productos" },
  { id: "customers", label: "Go to Customers", k: "clientes" },
  { id: "analytics", label: "Go to Analytics", k: "analytics" },
  { id: "campaigns", label: "Go to Marketing", k: "marketing campana" },
  { id: "website-builder", label: "Open Store Builder", k: "store builder tienda" },
  { id: "health", label: "Open Store Health", k: "health diagnostico problemas" },
  { id: "ai", label: "Open AI Operator", k: "ia ai operator" },
  { id: "settings", label: "Open Settings", k: "config" },
];

export default function DigitalBoostCommandCenter({ onNavigate, onOpenAI, onOpenHealth }: Props) {
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
    else if (id === "health") onOpenHealth?.();
    else onNavigate(id);
  }

  if (!open) return null;
  return (
    <div className="db-cmd-overlay" onClick={() => setOpen(false)}>
      <div className="db-cmd-panel" onClick={(e) => e.stopPropagation()}>
        <input autoFocus placeholder="Command Center  ·  Ctrl K" value={q} onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setI((n) => Math.min(items.length - 1, n + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
            if (e.key === "Enter" && items[i]) run(items[i].id);
          }} />
        {items.map((c, n) => (
          <button key={c.id} type="button" className={n === i ? "db-cmd-item active" : "db-cmd-item"} onClick={() => run(c.id)}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok CommandCenter")

txt = ws.read_text(encoding="utf-8")
if "DigitalBoostOperator from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostOperator from "./DigitalBoostOperator";\nimport DigitalBoostHealth from "./DigitalBoostHealth";',
        1,
    )
if "DigitalBoostCommandCenter from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostCommandCenter from "./DigitalBoostCommandCenter";',
        1,
    )
if "showHealth" not in txt:
    txt = txt.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showHealth, setShowHealth] = useState(false);",
        1,
    )

old_cc = "{<DigitalBoostCommandCenter onNavigate={setSection} onOpenAI={() => setShowAI(true)} />}"
new_cc = "{<DigitalBoostCommandCenter onNavigate={setSection} onOpenAI={() => setShowAI(true)} onOpenHealth={() => setShowHealth(true)} />}"
if old_cc in txt:
    txt = txt.replace(old_cc, new_cc, 1)
elif "onOpenHealth" not in txt and "DigitalBoostCommandCenter" in txt:
    txt = txt.replace(
        "onOpenAI={() => setShowAI(true)}",
        "onOpenAI={() => setShowAI(true)} onOpenHealth={() => setShowHealth(true)}",
        1,
    )

if "DigitalBoostHealth" in txt and "{showHealth &&" not in txt:
    txt = txt.replace(
        new_cc if new_cc in txt else old_cc,
        (new_cc if "onOpenHealth" in txt else old_cc) + "\n      {showHealth && (<DigitalBoostHealth onClose={() => setShowHealth(false)} onFix={(id) => { setShowHealth(false); setSection(id as any); }} />)}",
        1,
    )

if "{showHealth &&" not in txt:
    txt = txt.replace(
        "{showAI && (",
        "{showHealth && (<DigitalBoostHealth onClose={() => setShowHealth(false)} onFix={(id) => { setShowHealth(false); setSection(id as any); }} />)}\n      {showAI && (",
        1,
    )

if "DigitalBoostOperator" in txt and "<DigitalBoostOperator" not in txt.split("import")[-1][:]:
    pass
if "<DigitalBoostOperator" not in txt:
    txt = txt.replace(
        "{showAI && (",
        "{showAI && (<DigitalBoostOperator onClose={() => { setShowAI(false); }} onNavigate={(id) => { setShowAI(false); setSection(id); }} />)}\n      {false && (",
        1,
    )

ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO FASE 6-7")
print("Ctrl+K -> Open Store Health / Open AI Operator")
