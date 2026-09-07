
import { useState } from "react";
import { analyzeSmart, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";
import { pushLog } from "./DigitalBoostConsoleData";

function ctx() {
  let range = "7d";
  let store = "Nimbus";
  let live = true;
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
  const CHIPS = builder ? ["hola", "hero", "conversion", "theme"] : ["hola", "ventas", "pedidos", "health", "buscar"];
  const [q, setQ] = useState("");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState("rules");
  async function think(word: string) {
    const c = ctx();
    setBusy(true);
    try {
      const smart = await analyzeSmart({ q: word || "hola", section: section, store: c.store, range: c.range, live: c.live });
      setEngine(smart.engine);
      setOut(smart.decision);
      setAsk(Boolean(smart.decision.confirm));
    } catch (e) {
      setEngine("rules");
      setOut({ title: "PULSE IA", body: "No pude hablar con el modelo. Seguí con reglas. " + String(e), action: "dashboard", actionLabel: "Cerrar", confirm: false });
    }
    setBusy(false);
  }
  function exec() {
    if (!out) return;
    try { pushLog({ actor: "PULSE IA", action: out.title, resource: section, status: "completed", result: String(out.body).slice(0, 120) }); } catch {}
    props.onClose();
    if (out.action === "__health" && props.onOpenHealth) props.onOpenHealth();
    else if (out.action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (out.action === "__console" && props.onOpenConsole) props.onOpenConsole();
    else if (out.action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
    else if (out.action === "__search" && props.onOpenSearch) props.onOpenSearch();
    else props.onNavigate(out.action);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400 text-xs font-bold text-[#070D18]">P</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{builder ? "PULSE Design" : "PULSE · Commerce OS"}</div>
              <div className="text-sm font-semibold">{builder ? "Estudio" : "Operador"} · {section} · motor {engine}{busy ? " · …" : ""}</div>
            </div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder={builder ? "hero / conversion" : "hola / ventas / health"} value={q} onChange={function (e) { setQ(e.target.value); }} />
          <div className="flex flex-wrap gap-1">
            {CHIPS.map(function (c) {
              return <button key={c} type="button" onClick={function () { setQ(c); think(c); }} className="h-9 rounded-full border border-white/10 px-3 text-[11px] text-cyan-300">{c}</button>;
            })}
          </div>
          <button type="button" disabled={busy} onClick={function () { think(q || "hola"); }} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18] disabled:opacity-60">{busy ? "PULSE pensando…" : "Hablar con PULSE"}</button>
          {out && (
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3">
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
