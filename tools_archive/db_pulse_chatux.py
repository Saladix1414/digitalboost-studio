#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not (src / "DigitalBoostOperator.tsx").is_file():
    raise SystemExit("cd digitalboost-studio")

cst = src / "DigitalBoostPulseConst.ts"
if cst.is_file():
    c = cst.read_text(encoding="utf-8")
    if 's.indexOf("plan")' not in c:
        c = c.replace(
            'if (s.indexOf("health") !== -1 || s.indexOf("alerta") !== -1) return "optimization";',
            'if (s.indexOf("health") !== -1 || s.indexOf("alerta") !== -1 || s.indexOf("plan") !== -1 || s.indexOf("brief") !== -1) return "optimization";',
            1,
        )
        cst.write_text(c, encoding="utf-8")
        print("ok intent plan")

sk = src / "DigitalBoostPulseSkills.ts"
if sk.is_file():
    sk.write_text(r"""
import type { PulseInput } from "./DigitalBoostPulseKB";
function mul(r: string) { return r === "90d" ? 12 : r === "30d" ? 4 : 1; }
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }
function studio(i: PulseInput) {
  return i.section === "website-builder" || i.section === "store-builder" || i.section === "builder";
}
export function skillBriefing(i: PulseInput) {
  if (studio(i)) {
    const hero = i.heroTitle ? "«" + i.heroTitle + "»" : "un hero genérico";
    return { title: "PULSE Design", body: (i.page || "Inicio") + " tiene " + String(i.blockCount || 0) + " bloques. El que manda es " + hero + ". Yo arrancaría por el copy del hero.", action: "website-builder", label: "Seguir en el canvas" };
  }
  const m = mul(i.range);
  return { title: "PULSE", body: i.store + " en " + i.range + (i.live ? ", live" : "") + ": " + money(Math.round(474 * m)) + " y " + Math.max(1, Math.round(4 * m)) + " pedidos (cálculo demo). Lo rojo es el 1047 y el cap. ¿Cerramos el despacho?", action: "dashboard", label: "Quedarme acá" };
}
export function skillPlan(i: PulseInput) {
  if (studio(i)) {
    return { title: "PULSE Design", body: "Hoy en el canvas: hero con una promesa, CTA en destacados, un solo theme. El 1047 lo vemos en el OS.", action: "website-builder", label: "Seguir en el canvas" };
  }
  return { title: "PULSE", body: "Hoy: despachar 1047, anotar el cap (no comprar todavía) y dejar la campaña de carritos para una Pulse Card. ¿Arranco por pedidos?", action: "orders", label: "Ir a Pedidos" };
}
export function skillAlerta(i: PulseInput) {
  if (studio(i)) {
    return { title: "PULSE Design", body: "Hay bloques sin CTA. Eso mata más conversión que el color. ¿Reescribimos el hero?", action: "website-builder", label: "Seguir en el canvas" };
  }
  return { title: "PULSE", body: "Tres rojos: cap, 1047, mobile. Te abro Health; no escribo inventario.", action: "__health", label: "Abrir Health" };
}
export function skillHero() {
  try { localStorage.setItem("db-pulse-skill", "hero"); } catch {}
  return { title: "PULSE Design", body: "Una línea. Un botón. AI Design lo pega en el canvas; History lo revierte.", action: "website-builder", label: "Aplicar hero" };
}
""", encoding="utf-8")
    print("ok copy corta")

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
  const CHIPS = builder ? ["hero", "theme", "plan"] : ["briefing", "plan", "alerta"];
  const [q, setQ] = useState("");
  const [out, setOut] = useState<PulseDecision | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scroller = useRef<HTMLDivElement | null>(null);
  function follows(action: string) {
    if (builder || action === "website-builder") return [["hero", "Reescribamos el hero"], ["theme", "Probemos Noir"], ["conversion", "Revisar CTAs"]];
    if (action === "orders") return [["alerta", "Qué más está rojo"], ["stock", "El cap"], ["briefing", "Volver al pulso"]];
    if (action === "__health") return [["plan", "Dame el orden"], ["pedidos", "Ir a 1047"]];
    return [["plan", "Armame el día"], ["pedidos", "Ver 1047"], ["alerta", "Qué está rojo"]];
  }
  function think(word: string) {
    const line = (word || q || "briefing").trim();
    const c = ctx();
    const cv = readCanvas();
    const payload = { q: line, section: section, store: c.store, range: c.range, live: c.live, page: cv.page, blockCount: cv.n, heroTitle: cv.hero };
    const r = line === "debug" ? explain(payload) : analyze(payload);
    setOut(r);
    setQ("");
    setMsgs(function (m) { return m.concat([{ role: "user", text: line }, { role: "pulse", text: r.body }]).slice(-10); });
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
  const showGo = out && !out.card && !(builder && (out.action === "website-builder" || section === "website-builder"));
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE</div>
            <div className="text-sm font-semibold">{c0.store} · {c0.range}{c0.live ? " · live" : ""}{builder ? " · canvas" : ""}</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div ref={scroller} className="min-h-[220px] flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {msgs.length === 0 && (
            <div className="rounded-2xl rounded-tl-sm border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs leading-5 text-[#AFC0D5]">
              Estoy en {c0.store}. Pedime el pulso del día, un pedido, o el hero.
            </div>
          )}
          {msgs.map(function (m, i) {
            const mine = m.role === "user";
            return (
              <div key={i} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={mine ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-[#1B2B4A] px-3 py-2 text-xs leading-5" : "max-w-[90%] rounded-2xl rounded-tl-sm border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs leading-5 text-[#D5E4F5]"}>
                  {m.text}
                </div>
              </div>
            );
          })}
          {out && out.card && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs leading-5">
              <div className="font-semibold text-amber-200">Necesito tu OK · {out.risk}</div>
              <p className="mt-1 text-[#AFC0D5]">{out.body}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={exec} className="h-10 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                <button type="button" onClick={function () { setOut(null); }} className="h-10 flex-1 rounded-lg border border-white/10 text-xs">Ahora no</button>
              </div>
            </div>
          )}
          {out && !out.card && (
            <div className="flex flex-wrap gap-1 pt-1">
              {follows(out.action).map(function (pair) {
                return (
                  <button key={pair[0]} type="button" onClick={function () { think(pair[0]); }} className="rounded-full border border-white/15 px-3 py-2 text-[11px] text-cyan-200">
                    {pair[1]}
                  </button>
                );
              })}
              {showGo ? (
                <button type="button" onClick={exec} className="rounded-full border border-cyan-400/40 px-3 py-2 text-[11px] text-cyan-300">
                  {out.actionLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {CHIPS.map(function (chip) {
              return <button key={chip} type="button" onClick={function () { think(chip); }} className="h-8 rounded-full border border-white/10 px-3 text-[11px] text-[#AFC0D5]">{chip}</button>;
            })}
          </div>
          <form className="flex gap-2" onSubmit={function (e) { e.preventDefault(); think(q || "briefing"); }}>
            <input className="h-11 flex-1 rounded-xl border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder={builder ? "El hero, el theme, un CTA…" : "El pulso, un pedido, el cap…"} value={q} onChange={function (e) { setQ(e.target.value); }} />
            <button type="submit" className="h-11 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-[#070D18]">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("LISTO CHAT UX")
print("Hilo arriba. Input abajo. Como Sidekick.")
