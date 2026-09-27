import { useMemo, useState } from "react";
import { buildPages, loadSeo, saveSeo, utmOf } from "./DigitalBoostSeo";
import { draftPulseBotMessage } from "./commerce/DigitalBoostPulseBot";
import { buildCommerceUtm } from "./commerce/DigitalBoostCommerceUtm";

export default function DigitalBoostMarketingHub() {
  const [s, setS] = useState(() => loadSeo());
  const pages = useMemo(() => buildPages(s), [s]);
  const home = pages.find((p) => p.id === "home") || pages[0];
  const [utm, setUtm] = useState({
    u: home?.url || "/",
    s: "os",
    m: "social",
    c: "manual",
  });
  const [log, setLog] = useState("Marketing OS: OG + UTM. Sin GMV inventado.");
  const [tab, setTab] = useState<"og" | "utm">("og");


  function saveHomeOg(title: string, desc: string) {
    const ov = { ...(s.overrides || {}) };
    ov[home.id] = { ...(ov[home.id] || {}), title, description: desc };
    const ns = { ...s, overrides: ov };
    saveSeo(ns);
    setS(ns);
    setLog("OG guardado");
  }

  function createBotDraft(kind: string, payload: string) {
    draftPulseBotMessage({
      tenantId: "local-tenant",
      channel: "mail",
      kind: "order.created",
      subject: "Draft marketing",
      body: kind + ": " + payload,
    });
    setLog("Pulse Bot draft creado");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg font-semibold text-white">Marketing</p>
        <p className="mt-1 text-sm text-[#AFC0D5]">OG + UTM. Pulse Bot solo deja draft.</p>
        <p className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">
          {log}
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => setTab("og")} className={`h-9 rounded-md px-3 text-xs ${tab === "og" ? "bg-cyan-400 text-[#070d18]" : "border border-white/10"}`}>OG</button>
          <button type="button" onClick={() => setTab("utm")} className={`h-9 rounded-md px-3 text-xs ${tab === "utm" ? "bg-cyan-400 text-[#070d18]" : "border border-white/10"}`}>UTM</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0B1B30] p-5">
          <p className="text-[10px] uppercase text-cyan-300">OG — Home</p>
          <input className="mt-3 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm" defaultValue={home?.title || ""} id="og-title" />
          <textarea className="mt-2 min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] p-3 text-sm" defaultValue={home?.description || ""} id="og-desc" />
          <button
            className="mt-3 h-11 w-full rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]"
            onClick={() => {
              const title = (document.getElementById("og-title") as HTMLInputElement)?.value || home?.title;
              const desc = (document.getElementById("og-desc") as HTMLTextAreaElement)?.value || home?.description;
              saveHomeOg(title, desc);
            }}
          >
            Guardar OG
          </button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1B30] p-5">
          <p className="text-[10px] uppercase text-violet-300">UTM</p>
          <input className="mt-3 h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm" value={utm.u} onChange={(e) => setUtm({ ...utm, u: e.target.value })} />
          <button
            className="mt-3 h-10 w-full rounded-lg bg-white/10 text-xs"
            onClick={() => {
              const built = buildCommerceUtm({
                path: utm.u || "/",
                source: utm.s,
                medium: utm.m,
                campaign: utm.c,
                tenantId: "local-tenant",
              });
              if (!built.ok) {
                setLog("UTM unavailable: " + built.reason);
                return;
              }
              navigator.clipboard.writeText(built.url);
              setLog("UTM: " + built.url);
            }}
          >
            Copiar UTM
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
        <p className="text-sm font-semibold text-white">Pulse Bot draft</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button className="h-9 rounded-lg bg-cyan-400 text-[11px] font-semibold text-[#070D18]" onClick={() => createBotDraft("notice", "sin pedido inventado")}>
            Draft aviso
          </button>
          <button className="h-9 rounded-lg border border-white/10 text-[11px]" onClick={() => createBotDraft("cart", "recuperar carrito")}>
            Draft carrito
          </button>
        </div>
      </div>
    </div>
  );
}
