#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
for name in ("DigitalBoostOperator.tsx", "DigitalBoostPulseBrain.ts"):
    p = src / name
    if p.is_file():
        shutil.copy2(p, p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix))

(src / "DigitalBoostPulseBrain.ts").write_text(r"""
export type PulseInput = {
  q: string;
  section: string;
  store: string;
  range: string;
  live: boolean;
};
export type PulseDecision = {
  title: string;
  body: string;
  action: string;
  actionLabel: string;
  confirm: boolean;
};
export type PulseBlock = { id: string; type: string; title: string; body: string; cta: string };

export function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
export function stampOf(input: PulseInput) {
  return input.store + " · " + input.range + " · " + (input.live ? "Live" : "Attention");
}
export function analyze(input: PulseInput): PulseDecision {
  const q = (input.q || "").toLowerCase();
  const section = input.section || "dashboard";
  const stamp = stampOf(input);
  if (q.indexOf("hola") !== -1 || q.indexOf("quien") !== -1 || q === "") {
    return { title: "PULSE", body: stamp + ". Soy el operador de Commerce OS. Pedime ventas, pedidos, health o buscar.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (q.indexOf("health") !== -1)
    return { title: "PULSE · Health", body: stamp + ". Te abro Store Health.", action: "__health", actionLabel: "Abrir Store Health", confirm: false };
  if (q.indexOf("buscar") !== -1 || q.indexOf("search") !== -1)
    return { title: "PULSE · Search", body: stamp + ". Te abro Search.", action: "__search", actionLabel: "Abrir Search", confirm: false };
  if (q.indexOf("pedido") !== -1)
    return { title: "PULSE · Pedidos", body: stamp + ". DB-1048 pagado.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (q.indexOf("venta") !== -1)
    return { title: "PULSE · Ventas", body: stamp + ". Mobile recorta conversion.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (q.indexOf("campan") !== -1)
    return { title: "PULSE · Campana", body: stamp + ". Carritos 10% / 48h.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (q.indexOf("hero") !== -1 || q.indexOf("homepage") !== -1)
    return { title: "PULSE Design", body: stamp + ". Pase al canvas.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  return { title: "PULSE", body: stamp + ". Frente: " + section + ". No enganche un intent: prueba hola, ventas, health.", action: section, actionLabel: "Seguir aca", confirm: false };
}
export async function analyzeSmart(input: PulseInput): Promise<{ decision: PulseDecision; engine: "ollama" | "rules" }> {
  return { decision: analyze(input), engine: "rules" };
}
export function designApply(q: string, blocks: PulseBlock[]): { note: string; next: PulseBlock[] } {
  const s = (q || "").toLowerCase();
  const copy = blocks.map(function (b) { return Object.assign({}, b); });
  copy.forEach(function (b) {
    if (b.type === "hero" && (s.indexOf("hero") !== -1 || s.indexOf("premium") !== -1 || s.indexOf("redisen") !== -1)) {
      b.title = "La coleccion que no pide permiso.";
      b.body = "Menos texto. Mas tension. Un solo CTA.";
      b.cta = "Entrar";
    }
  });
  return { note: "PULSE Design aplico el matcher.", next: copy };
}
""", encoding="utf-8")

(src / "DigitalBoostOperator.tsx").write_text(r"""
import { useState } from "react";
import { analyzeSmart, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";

function ctx() {
  let range = "7d", store = "Aura", live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Aura";
    live = localStorage.getItem("db-os-live-v1") !== "0";
  } catch {}
  return { range: range, store: store, live: live };
}

export default function DigitalBoostOperator(props: {
  onClose: () => void;
  onNavigate: (id: any) => void;
  section?: string;
  onOpenHealth?: () => void;
  onOpenAutomations?: () => void;
  onOpenConsole?: () => void;
  onOpenIntegrations?: () => void;
  onOpenSearch?: () => void;
}) {
  const section = props.section || "dashboard";
  const builder = isBuilder(section);
  const CHIPS = builder ? ["hola", "hero"] : ["hola", "ventas", "pedidos", "health", "buscar"];
  const [q, setQ] = useState("hola");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState("rules");
  async function think(word: string) {
    setBusy(true);
    const c = ctx();
    try {
      const smart = await analyzeSmart({ q: word || "hola", section: section, store: c.store, range: c.range, live: c.live });
      setEngine(smart.engine);
      setOut(smart.decision);
      setAsk(Boolean(smart.decision.confirm));
    } catch (err) {
      setOut({ title: "PULSE", body: "Error: " + String(err), action: "dashboard", actionLabel: "Cerrar", confirm: false });
    }
    setBusy(false);
  }
  function exec() {
    if (!out) return;
    props.onClose();
    if (out.action === "__health" && props.onOpenHealth) props.onOpenHealth();
    else if (out.action === "__search" && props.onOpenSearch) props.onOpenSearch();
    else if (out.action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (out.action === "__console" && props.onOpenConsole) props.onOpenConsole();
    else if (out.action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
    else props.onNavigate(out.action);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE · Commerce OS</div>
            <div className="text-sm font-semibold">{section} · motor {engine}{busy ? " · …" : ""}</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <textarea className="min-h-16 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" value={q} onChange={function (e) { setQ(e.target.value); }} />
          <div className="flex flex-wrap gap-1">
            {CHIPS.map(function (c) {
              return <button key={c} type="button" onClick={function () { setQ(c); think(c); }} className="h-9 rounded-full border border-white/10 px-3 text-[11px] text-cyan-300">{c}</button>;
            })}
          </div>
          <button type="button" disabled={busy} onClick={function () { think(q || "hola"); }} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">{busy ? "PULSE pensando…" : "Hablar con PULSE"}</button>
          {out && (
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3">
              <div className="text-sm font-semibold">{out.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#AFC0D5]">{out.body}</p>
              <button type="button" onClick={exec} className="mt-3 h-11 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{ask ? "Confirmar · " : ""}{out.actionLabel}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("LISTO CLICK")
