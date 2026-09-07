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

p = src / "DigitalBoostOperator.tsx"
raw = p.read_text(encoding="utf-8") if p.is_file() else ""
if ("export default function" not in raw) or ("function analyze" not in raw):
    p.write_text(r"""
import { useState } from "react";
function analyze(q: string) {
  const s = (q || "").toLowerCase();
  if (s.indexOf("venta") !== -1 || s.indexOf("sales") !== -1)
    return { title: "Analisis de ventas", body: "Revenue semanal en alza. Ticket promedio estable. El freno esta en mobile.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (s.indexOf("stock") !== -1 || s.indexOf("invent") !== -1)
    return { title: "Stock critico", body: "Hay SKUs bajo umbral. Reponer antes del proximo drop.", action: "inventory", actionLabel: "Abrir Inventario", confirm: false };
  if (s.indexOf("conver") !== -1 || s.indexOf("homepage") !== -1 || s.indexOf("tienda") !== -1)
    return { title: "Conversion", body: "El hero convierte. El grid pierde atencion. CTA mas claro + social proof.", action: "website-builder", actionLabel: "Editar en Store Builder", confirm: false };
  if (s.indexOf("promo") !== -1 || s.indexOf("campan") !== -1)
    return { title: "Campana sugerida", body: "Recuperacion de carritos: 10% extra 48h.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (s.indexOf("cliente") !== -1 || s.indexOf("vip") !== -1)
    return { title: "Clientes", body: "Hay perfiles de alto valor. Tag VIP + follow-up.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  return { title: "AI Operator", body: "Puedo analizar ventas, stock, conversion, clientes o preparar una campana.", action: "dashboard", actionLabel: "Ir a Overview", confirm: false };
}
export default function DigitalBoostOperator(props: { onClose: () => void; onNavigate: (id: any) => void }) {
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
    props.onClose();
    props.onNavigate(out.action);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">AI Operator</div>
            <div className="text-sm font-semibold">Analyze · Suggest · Execute</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder="Analiza mis ventas / stock bajo / aumentar conversion" value={q} onChange={function (e) { setQ(e.target.value); }} />
          <button type="button" onClick={run} className="h-11 w-full rounded-lg bg-violet-500 text-sm font-semibold">Analizar</button>
          {out && (
            <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
              <div className="text-sm font-semibold">{out.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#AFC0D5]">{out.body}</p>
              {ask ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={exec} className="h-11 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                  <button type="button" onClick={function () { setAsk(false); }} className="h-11 flex-1 rounded-lg border border-white/10 text-xs">Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={exec} className="mt-3 h-11 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
    print("ok operator ui")
else:
    print("ok operator exists")

w = ws.read_text(encoding="utf-8")
if "from \"./DigitalBoostOperator" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostOperator from "./DigitalBoostOperator.tsx";',
        1,
    )
else:
    w = w.replace('from "./DigitalBoostOperator"', 'from "./DigitalBoostOperator.tsx"')
if "<DigitalBoostOperator" not in w:
    w = w.replace(
        "{showAI &&",
        "{showAI && (<DigitalBoostOperator onClose={() => setShowAI(false)} onNavigate={(id) => { setShowAI(false); setSection(id); }} />)}\n      {false &&",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")
print("LISTO AI")
print("Boton AI Operator o Ctrl+K -> Open AI Operator")
