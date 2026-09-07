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

h = src / "DigitalBoostHealth.tsx"
need = (not h.is_file()) or ("export default function" not in h.read_text(encoding="utf-8")) or ("return null" in h.read_text(encoding="utf-8") and "ISSUES" not in h.read_text(encoding="utf-8"))
if need:
    h.write_text(r"""
type Issue = { id: string; sev: "error" | "warn" | "hint"; title: string; loc: string; why: string; fix: string; go: string };
const ISSUES: Issue[] = [
  { id: "i1", sev: "error", title: "Checkout incompleto", loc: "Settings / Payments", why: "Falta confirmar proveedor de cobro.", fix: "Abrir pagos", go: "payments" },
  { id: "i2", sev: "error", title: "Stock bajo", loc: "Inventory", why: "SKUs cerca del umbral.", fix: "Ver inventario", go: "inventory" },
  { id: "i3", sev: "warn", title: "Productos sin imagen", loc: "Products", why: "Fichas sin media bajan conversion.", fix: "Completar fichas", go: "products" },
  { id: "i4", sev: "warn", title: "SEO faltante", loc: "SEO Manager", why: "Paginas sin title/description.", fix: "Abrir SEO", go: "seo" },
  { id: "i5", sev: "hint", title: "Hero sin prueba social", loc: "Store Builder / Home", why: "El canvas puede vender mas con reviews.", fix: "Editar home", go: "website-builder" }
];
export default function DigitalBoostHealth(props: { onClose: () => void; onFix?: (id: string) => void }) {
  const errors = ISSUES.filter(function (i) { return i.sev === "error"; }).length;
  const warns = ISSUES.filter(function (i) { return i.sev === "warn"; }).length;
  const score = Math.max(40, 100 - errors * 14 - warns * 7);
  function tone(s: Issue["sev"]) {
    if (s === "error") return "text-red-400";
    if (s === "warn") return "text-amber-300";
    return "text-cyan-300";
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">Store Health</div>
            <div className="text-sm font-semibold">Diagnostics · score {score}</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {[["Score", String(score)], ["Errors", String(errors)], ["Warnings", String(warns)]].map(function (row) {
            return (
              <div key={row[0]} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">{row[0]}</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{row[1]}</div>
              </div>
            );
          })}
        </div>
        <div className="space-y-2 px-4 pb-4">
          {ISSUES.map(function (i) {
            return (
              <div key={i.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className={"text-[10px] font-semibold uppercase tracking-[0.14em] " + tone(i.sev)}>{i.sev}</div>
                <div className="mt-1 text-sm font-medium">{i.title}</div>
                <div className="mt-1 text-[11px] text-[#AFC0D5]">{i.loc} · {i.why}</div>
                <button type="button" onClick={function () { if (props.onFix) props.onFix(i.go); props.onClose(); }} className="mt-2 h-11 rounded-md border border-cyan-400/30 px-3 text-xs text-cyan-300">{i.fix}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
    print("ok health ui")
else:
    print("ok health exists")

w = ws.read_text(encoding="utf-8")
if "from \"./DigitalBoostHealth" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostHealth from "./DigitalBoostHealth.tsx";',
        1,
    )
else:
    w = w.replace('from "./DigitalBoostHealth"', 'from "./DigitalBoostHealth.tsx"')
if "showHealth" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showHealth, setShowHealth] = useState(false);",
        1,
    )
if "<DigitalBoostHealth" not in w:
    w = w.replace(
        "{showAI &&",
        "{showHealth && (<DigitalBoostHealth onClose={() => setShowHealth(false)} onFix={(id) => { setShowHealth(false); setSection(id as any); }} />)}\n      {showAI &&",
        1,
    )
if "onOpenHealth" not in w and "onOpenAI={() => setShowAI(true)}" in w:
    w = w.replace(
        "onOpenAI={() => setShowAI(true)}",
        "onOpenAI={() => setShowAI(true)} onOpenHealth={() => setShowHealth(true)}",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")

if cc.is_file():
    t = cc.read_text(encoding="utf-8")
    if "onOpenHealth" not in t:
        t = t.replace("onOpenAI: () => void;", "onOpenAI: () => void;\n  onOpenHealth?: () => void;", 1)
        t = t.replace("if (id === \"ai\") props.onOpenAI();", "if (id === \"ai\") props.onOpenAI();\n    else if (id === \"health\" && props.onOpenHealth) props.onOpenHealth();", 1)
    if 'id: "health"' not in t:
        t = t.replace(
            '{ id: "ai", label: "Open AI Operator"',
            '{ id: "health", label: "Open Store Health", k: "health diagnostico" },\n  { id: "ai", label: "Open AI Operator"',
            1,
        )
    cc.write_text(t, encoding="utf-8")
    print("ok command center")
print("LISTO HEALTH")
