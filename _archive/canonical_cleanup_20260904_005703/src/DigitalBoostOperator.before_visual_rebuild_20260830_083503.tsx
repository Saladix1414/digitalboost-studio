
import { useState } from "react";
import { analyzeSmart, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";

function ctx() {
  let range = "7d", store = "Nimbus", live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Nimbus";
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
  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([]);
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
      setMsgs(function (m) { return m.concat([{ role: "user", text: word || "hola" }, { role: "pulse", text: smart.decision.title + " — " + smart.decision.body }]); });
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
          {msgs.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-y-auto">
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
