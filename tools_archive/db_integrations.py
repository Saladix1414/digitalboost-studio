#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
cc = root / "src" / "DigitalBoostCommandCenter.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))
if cc.is_file():
    shutil.copy2(cc, cc.with_name("DigitalBoostCommandCenter.before_visual_rebuild_" + stamp + ".tsx"))
print("backup ok")

(root / "src" / "DigitalBoostIntegrations.tsx").write_text("""
import { useEffect, useMemo, useState } from "react";

type Item = { id: string; cat: string; name: string; blurb: string };
const CATS = ["Payments", "Shipping", "Marketing", "Analytics", "CRM", "Email", "AI", "Social", "Storage", "APIs"];
const ITEMS: Item[] = [
  { id: "stripe", cat: "Payments", name: "Stripe", blurb: "Cobros con tarjeta y wallets." },
  { id: "mp", cat: "Payments", name: "Mercado Pago", blurb: "Cobros locales AR / LATAM." },
  { id: "andreani", cat: "Shipping", name: "Andreani", blurb: "Envios y tracking." },
  { id: "correo", cat: "Shipping", name: "Correo Argentino", blurb: "Logistica nacional." },
  { id: "meta", cat: "Marketing", name: "Meta Ads", blurb: "Campanas y pixel." },
  { id: "ga", cat: "Analytics", name: "Google Analytics", blurb: "Trafico y conversion." },
  { id: "hubspot", cat: "CRM", name: "HubSpot", blurb: "Contactos y pipeline." },
  { id: "resend", cat: "Email", name: "Resend", blurb: "Transaccional y broadcasts." },
  { id: "openai", cat: "AI", name: "OpenAI", blurb: "Copy, analisis y operator." },
  { id: "ig", cat: "Social", name: "Instagram", blurb: "Catalogo y shop." },
  { id: "s3", cat: "Storage", name: "S3 / R2", blurb: "Media de la tienda." },
  { id: "api", cat: "APIs", name: "Webhooks", blurb: "Eventos de pedidos y stock." },
];
const KEY = "db-integrations-v1";
function load(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function save(m: Record<string, boolean>) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

export default function DigitalBoostIntegrations({ onClose }: { onClose: () => void }) {
  const [cat, setCat] = useState("Payments");
  const [on, setOn] = useState<Record<string, boolean>>({});
  useEffect(() => { setOn(load()); }, []);
  const list = useMemo(() => ITEMS.filter((i) => i.cat === cat), [cat]);
  function toggle(id: string) {
    const next = { ...on, [id]: !on[id] };
    setOn(next);
    save(next);
  }
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">Integrations</div>
            <div className="text-sm font-semibold">Marketplace base</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
          {CATS.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={"shrink-0 rounded-full px-3 py-1.5 text-[11px] " + (cat === c ? "bg-blue-500/30 text-blue-200" : "border border-white/10 text-slate-400")}>{c}</button>
          ))}
        </div>
        <div className="space-y-2 p-3">
          {list.map((i) => {
            const connected = Boolean(on[i.id]);
            return (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{i.name}</div>
                  <div className="text-[11px] text-[#AFC0D5]">{i.blurb}</div>
                  <div className={"mt-1 text-[10px] uppercase tracking-[0.12em] " + (connected ? "text-emerald-400" : "text-slate-500")}>{connected ? "Connected" : "Not connected"}</div>
                </div>
                <button type="button" onClick={() => toggle(i.id)} className={"h-9 shrink-0 rounded-md px-3 text-xs font-semibold " + (connected ? "border border-white/15 text-slate-300" : "bg-cyan-400 text-[#070D18]")}>
                  {connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok integrations")

if cc.is_file():
    cct = cc.read_text(encoding="utf-8")
    if "onOpenIntegrations" not in cct:
        cct = cct.replace(
            "onOpenHealth?: () => void;",
            "onOpenHealth?: () => void;\n  onOpenIntegrations?: () => void;",
            1,
        )
        cct = cct.replace(
            "{ onNavigate, onOpenAI, onOpenHealth }",
            "{ onNavigate, onOpenAI, onOpenHealth, onOpenIntegrations }",
            1,
        )
        if '{ id: "health"' in cct and '{ id: "integrations"' not in cct:
            cct = cct.replace(
                '{ id: "health", label: "Open Store Health", k: "health diagnostico problemas" },',
                '{ id: "health", label: "Open Store Health", k: "health diagnostico problemas" },\n  { id: "integrations", label: "Open Integrations", k: "integraciones stripe pagos" },',
                1,
            )
        if 'id === "health"' in cct and "integrations" not in cct[cct.find("function run"):cct.find("function run")+400]:
            cct = cct.replace(
                'else if (id === "health") onOpenHealth?.();',
                'else if (id === "health") onOpenHealth?.();\n    else if (id === "integrations") onOpenIntegrations?.();',
                1,
            )
        cc.write_text(cct, encoding="utf-8")
        print("ok command center")

txt = ws.read_text(encoding="utf-8")
if "DigitalBoostIntegrations from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostIntegrations from "./DigitalBoostIntegrations";',
        1,
    )
if "showIntegrations" not in txt:
    txt = txt.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showIntegrations, setShowIntegrations] = useState(false);",
        1,
    )
if "onOpenIntegrations" not in txt:
    txt = txt.replace(
        "onOpenHealth={() => setShowHealth(true)}",
        "onOpenHealth={() => setShowHealth(true)} onOpenIntegrations={() => setShowIntegrations(true)}",
        1,
    )
if "{showIntegrations &&" not in txt:
    if "{showHealth &&" in txt:
        txt = txt.replace(
            "{showHealth &&",
            "{showIntegrations && (<DigitalBoostIntegrations onClose={() => setShowIntegrations(false)} />)}\n      {showHealth &&",
            1,
        )
    else:
        txt = txt.replace(
            "{showAI && (",
            "{showIntegrations && (<DigitalBoostIntegrations onClose={() => setShowIntegrations(false)} />)}\n      {showAI && (",
            1,
        )
ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO INTEGRATIONS")
print("Ctrl+K -> Open Integrations")
