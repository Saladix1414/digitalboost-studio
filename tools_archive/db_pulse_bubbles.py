#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
op = src / "DigitalBoostOperator.tsx"
if not op.is_file():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostOperator.tsx").write_text(r"""
import { useEffect, useRef, useState } from "react";
import { analyze, explain, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";

function readCanvas() {
  let page = "Inicio", n = 0, hero = "";
  try {
    page = localStorage.getItem("db-store-page-v1") || "Inicio";
    const raw = localStorage.getItem("db-store-canvas-v1:" + page) || localStorage.getItem("db-store-canvas-v1") || "[]";
    const blocks = JSON.parse(raw);
    if (Array.isArray(blocks)) {
      n = blocks.length;
      const h = blocks.find(function (b: any) { return b && b.type === "hero"; });
      if (h) hero = String(h.title || "");
    }
  } catch {}
  return { page: page, n: n, hero: hero };
}
function ctx() {
  let range = "7d", store = "Aura", live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Aura";
    live = localStorage.getItem("db-os-live-v1") !== "0";
  } catch {}
  return { range: range, store: store, live: live };
}

const SAY: Record<string, string> = {
  briefing: "¿Cómo está el día?",
  plan: "Armame el orden de hoy",
  alerta: "¿Qué está en rojo?",
  ventas: "¿Cómo vienen las ventas?",
  pedidos: "¿Cómo vienen los pedidos?",
  stock: "¿Cómo está el cap?",
  hero: "Reescribamos el hero",
  theme: "Probemos otro theme",
  conversion: "¿Dónde falta el CTA?",
  health: "Abrí Health",
  campana: "Quiero una campaña de carritos",
  campaña: "Quiero una campaña de carritos"
};

type Msg = { role: "user" | "pulse"; text: string };

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
  const c0 = ctx();
  const [q, setQ] = useState("");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scroller = useRef<HTMLDivElement | null>(null);
  function follows(action: string) {
    if (builder || action === "website-builder") return [["hero", "Reescribamos el hero"], ["theme", "Otro theme"], ["conversion", "Revisar CTAs"]];
    if (action === "orders") return [["alerta", "Qué más está rojo"], ["stock", "El cap"], ["briefing", "Volver al pulso"]];
    if (action === "__health") return [["plan", "El orden de hoy"], ["pedidos", "Ir a 1047"]];
    return [["plan", "El orden de hoy"], ["pedidos", "Ver 1047"], ["alerta", "Qué está rojo"]];
  }
  function think(word: string) {
    const raw = (word || q || "briefing").trim();
    const line = SAY[raw] || raw;
    const c = ctx();
    const cv = readCanvas();
    const payload = { q: raw, section: section, store: c.store, range: c.range, live: c.live, page: cv.page, blockCount: cv.n, heroTitle: cv.hero };
    const r = raw === "debug" ? explain(payload) : analyze(payload);
    setOut(r);
    setQ("");
    setMsgs(function (m) {
      const last = m[m.length - 1];
      if (last && last.role === "pulse" && last.text === r.body) {
        return m.concat([{ role: "user", text: line }]).concat([{ role: "pulse", text: r.body }]).filter(function (_, i, arr) {
          return !(i === arr.length - 3 && arr[i].role === "pulse" && arr[i].text === r.body);
        }).slice(-10);
      }
      if (last && last.role === "pulse" && last.text === r.body) return m;
      return m.concat([{ role: "user", text: line }, { role: "pulse", text: r.body }]).slice(-10);
    });
  }
  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) { localStorage.removeItem("db-pulse-seed"); think(seed); }
    } catch {}
  }, []);
  useEffect(function () {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);
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
  const showGo = out && !out.card && !(builder && out.action === "website-builder");
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE</div>
            <div className="text-sm font-semibold">Tienda {c0.store} · {c0.range}{c0.live ? " · live" : ""}{builder ? " · canvas" : ""}</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div ref={scroller} className="min-h-[240px] flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {msgs.length === 0 && (
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-cyan-400/10 px-3.5 py-2.5 text-xs leading-5 text-[#D5E4F5]">
              Estoy en {c0.store}. ¿El pulso del día, un pedido, o el hero?
            </div>
          )}
          {msgs.map(function (m, i) {
            const mine = m.role === "user";
            return (
              <div key={i} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={mine
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#1E3A5F] px-3.5 py-2.5 text-xs leading-5 text-white"
                  : "max-w-[88%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-xs leading-5 text-[#D5E4F5]"}>
                  {m.text}
                </div>
              </div>
            );
          })}
          {out && out.card && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs leading-5">
              <div className="font-semibold text-amber-200">Necesito tu OK</div>
              <p className="mt-1 text-[#AFC0D5]">{out.body}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={exec} className="h-10 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                <button type="button" onClick={function () { setOut(null); }} className="h-10 flex-1 rounded-lg border border-white/10 text-xs">Ahora no</button>
              </div>
            </div>
          )}
          {out && !out.card && (
            <div className="flex flex-wrap gap-1">
              {follows(out.action).map(function (pair) {
                return (
                  <button key={pair[0]} type="button" onClick={function () { think(pair[0]); }} className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-cyan-200">
                    {pair[1]}
                  </button>
                );
              })}
              {showGo ? (
                <button type="button" onClick={exec} className="rounded-full bg-cyan-400/15 px-3 py-1.5 text-[11px] text-cyan-300">
                  {out.actionLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>
        <div className="border-t border-white/10 p-3">
          <form className="flex gap-2" onSubmit={function (e) { e.preventDefault(); think(q || "briefing"); }}>
            <input className="h-11 flex-1 rounded-xl border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder="Escribí como al socio…" value={q} onChange={function (e) { setQ(e.target.value); }} />
            <button type="submit" className="h-11 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-[#070D18]">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok chat")

kb = src / "DigitalBoostPulseKB.ts"
if kb.is_file():
    t = kb.read_text(encoding="utf-8")
    t = t.replace("DATO demo: ", "")
    t = t.replace("CALCULO sobre demo seed, no un hecho de pasarela. ", "")
    t = t.replace("(cálculo demo)", "")
    t = t.replace("Cálculo de demo: ", "")
    t = t.replace("Cálculo seed: ", "")
    kb.write_text(t, encoding="utf-8")
    print("ok copy")

sk = src / "DigitalBoostPulseSkills.ts"
if sk.is_file():
    s = sk.read_text(encoding="utf-8")
    s = s.replace("(cálculo demo). ", ". ")
    s = s.replace("Cálculo de demo: ", "")
    s = s.replace("CALCULO seed: ", "")
    sk.write_text(s, encoding="utf-8")
print("LISTO BUBBLES")
