
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
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
