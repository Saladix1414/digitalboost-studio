#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

src = Path("src")
op = src / "DigitalBoostOperator.tsx"
if not op.is_file():
    raise SystemExit("cd digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(op, op.with_name("DigitalBoostOperator.before_visual_rebuild_" + stamp + ".tsx"))

op.write_text(r"""
import { useState } from "react";
import { analyze, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";

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
  const CHIPS = builder ? ["hola", "hero", "theme"] : ["hola", "ventas", "pedidos", "stock", "health", "buscar"];
  const [q, setQ] = useState("hola");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([]);
  function think(word: string) {
    const c = ctx();
    const r = analyze({ q: word || "hola", section: section, store: c.store, range: c.range, live: c.live });
    setOut(r);
    setMsgs(function (m) {
      return m.concat([
        { role: "user", text: word || "hola" },
        { role: "pulse", text: r.body }
      ]);
    });
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE · DigitalBoost</div>
            <div className="text-sm font-semibold">{section} · instantaneo</div>
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
          <button type="button" onClick={function () { think(q || "hola"); }} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Hablar con PULSE</button>
          {msgs.length > 0 && (
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {msgs.map(function (m, i) {
                return (
                  <div key={i} className={m.role === "user" ? "rounded-lg bg-white/5 px-3 py-2 text-xs" : "rounded-lg border border-cyan-400/25 bg-cyan-400/5 px-3 py-2 text-xs text-[#AFC0D5]"}>
                    <span className="font-semibold text-cyan-300">{m.role === "user" ? "Vos" : "PULSE"} · </span>{m.text}
                  </div>
                );
              })}
            </div>
          )}
          {out && (
            <button type="button" onClick={exec} className="h-11 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("LISTO NOW")
print("Sin await. Sin Ollama. Responde al toque.")
