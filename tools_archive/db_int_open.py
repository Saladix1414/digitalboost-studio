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

p = src / "DigitalBoostIntegrations.tsx"
raw = p.read_text(encoding="utf-8") if p.is_file() else ""
if ("export default function" not in raw) or ("ITEMS" not in raw):
    p.write_text(r"""
import { useEffect, useMemo, useState } from "react";
type Item = { id: string; cat: string; name: string; blurb: string };
const CATS = ["Payments", "Shipping", "Marketing", "Analytics", "CRM", "Email", "AI", "Social", "Storage", "APIs"];
const ITEMS: Item[] = [
  { id: "stripe", cat: "Payments", name: "Stripe", blurb: "Cobros con tarjeta y wallets." },
  { id: "mp", cat: "Payments", name: "Mercado Pago", blurb: "Cobros locales AR / LATAM." },
  { id: "andreani", cat: "Shipping", name: "Andreani", blurb: "Envios y tracking." },
  { id: "meta", cat: "Marketing", name: "Meta Ads", blurb: "Campanas y pixel." },
  { id: "ga", cat: "Analytics", name: "Google Analytics", blurb: "Trafico y conversion." },
  { id: "hubspot", cat: "CRM", name: "HubSpot", blurb: "Contactos y pipeline." },
  { id: "resend", cat: "Email", name: "Resend", blurb: "Transaccional y broadcasts." },
  { id: "openai", cat: "AI", name: "OpenAI", blurb: "Copy, analisis y operator." },
  { id: "ig", cat: "Social", name: "Instagram", blurb: "Catalogo y shop." },
  { id: "s3", cat: "Storage", name: "S3 / R2", blurb: "Media de la tienda." },
  { id: "api", cat: "APIs", name: "Webhooks", blurb: "Eventos de pedidos y stock." }
];
const KEY = "db-integrations-v1";
function load(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function save(m: Record<string, boolean>) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {} }
export default function DigitalBoostIntegrations(props: { onClose: () => void }) {
  const [cat, setCat] = useState("Payments");
  const [on, setOn] = useState<Record<string, boolean>>({});
  useEffect(function () { setOn(load()); }, []);
  const list = useMemo(function () { return ITEMS.filter(function (i) { return i.cat === cat; }); }, [cat]);
  function toggle(id: string) {
    const next = Object.assign({}, on); next[id] = !on[id]; setOn(next); save(next);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">Integrations</div>
            <div className="text-sm font-semibold">Marketplace base</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
          {CATS.map(function (c) {
            return <button key={c} type="button" onClick={function () { setCat(c); }} className={cat === c ? "shrink-0 rounded-full bg-blue-500/30 px-3 py-2 text-[11px] text-blue-200" : "shrink-0 rounded-full border border-white/10 px-3 py-2 text-[11px] text-slate-400"}>{c}</button>;
          })}
        </div>
        <div className="space-y-2 p-3">
          {list.map(function (i) {
            const connected = Boolean(on[i.id]);
            return (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{i.name}</div>
                  <div className="text-[11px] text-[#AFC0D5]">{i.blurb}</div>
                  <div className={"mt-1 text-[10px] uppercase tracking-[0.12em] " + (connected ? "text-emerald-400" : "text-slate-500")}>{connected ? "Connected" : "Not connected"}</div>
                </div>
                <button type="button" onClick={function () { toggle(i.id); }} className={connected ? "h-11 shrink-0 rounded-md border border-white/15 px-3 text-xs text-slate-300" : "h-11 shrink-0 rounded-md bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]"}>{connected ? "Disconnect" : "Connect"}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
    print("ok integrations ui")
else:
    print("ok integrations exists")

w = ws.read_text(encoding="utf-8")
if "from \"./DigitalBoostIntegrations" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostIntegrations from "./DigitalBoostIntegrations.tsx";',
        1,
    )
else:
    w = w.replace('from "./DigitalBoostIntegrations"', 'from "./DigitalBoostIntegrations.tsx"')
if "showIntegrations" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showIntegrations, setShowIntegrations] = useState(false);",
        1,
    )
if "<DigitalBoostIntegrations" not in w:
    w = w.replace(
        "{showAI &&",
        "{showIntegrations && (<DigitalBoostIntegrations onClose={() => setShowIntegrations(false)} />)}\n      {showAI &&",
        1,
    )
if "onOpenIntegrations" not in w and "onOpenAI={() => setShowAI(true)}" in w:
    w = w.replace(
        "onOpenAI={() => setShowAI(true)}",
        "onOpenAI={() => setShowAI(true)} onOpenIntegrations={() => setShowIntegrations(true)}",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")

if cc.is_file():
    t = cc.read_text(encoding="utf-8")
    if "onOpenIntegrations" not in t:
        t = t.replace("onOpenAI: () => void;", "onOpenAI: () => void;\n  onOpenIntegrations?: () => void;", 1)
        t = t.replace("if (id === \"ai\") props.onOpenAI();", "if (id === \"ai\") props.onOpenAI();\n    else if (id === \"integrations\" && props.onOpenIntegrations) props.onOpenIntegrations();", 1)
    if 'id: "integrations"' not in t:
        t = t.replace(
            '{ id: "ai", label: "Open AI Operator"',
            '{ id: "integrations", label: "Open Integrations", k: "integraciones stripe" },\n  { id: "ai", label: "Open AI Operator"',
            1,
        )
    cc.write_text(t, encoding="utf-8")
    print("ok command center")
print("LISTO INTEGRATIONS")
