#!/usr/bin/env python3
from pathlib import Path

src = Path("src")
if not (src / "DigitalBoostOperator.tsx").is_file():
    raise SystemExit("cd digitalboost-studio")

(src / "DigitalBoostPulseSkills.ts").write_text(r"""
import type { PulseInput } from "./DigitalBoostPulseKB";
function mul(r: string) { return r === "90d" ? 12 : r === "30d" ? 4 : 1; }
function money(n: number) { return "US$ " + n.toLocaleString("es-AR"); }
function studio(i: PulseInput) {
  return i.section === "website-builder" || i.section === "store-builder" || i.section === "builder";
}
export function skillBriefing(i: PulseInput) {
  if (studio(i)) {
    const hero = i.heroTitle ? "«" + i.heroTitle + "»" : "un hero genérico";
    return {
      title: "PULSE Design",
      body: "En " + (i.page || "Inicio") + " hay " + String(i.blockCount || 0) + " bloques. El hero dice " + hero + ". Yo cambiaría esa línea: ahora mismo no vende en 3 segundos.",
      action: "website-builder",
      label: "Seguir en el canvas",
      draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Menos texto. Un solo CTA.", cta: "Entrar" }
    };
  }
  const m = mul(i.range);
  return { title: "PULSE", body: i.store + " en " + i.range + (i.live ? ", live" : "") + ": " + money(Math.round(474 * m)) + ", " + Math.max(1, Math.round(4 * m)) + " pedidos. Lo que frena es el 1047 y el cap. ¿Cerramos despacho?", action: "dashboard", label: "Quedarme acá" };
}
export function skillPlan(i: PulseInput) {
  if (studio(i)) {
    return { title: "PULSE Design", body: "Orden: 1) cambiar el hero, 2) un CTA en destacados, 3) un theme solo. Te dejo el copy listo para aplicar.", action: "website-builder", label: "Seguir", draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Menos texto. Un solo CTA.", cta: "Entrar" } };
  }
  return { title: "PULSE", body: "Hoy: despachar 1047, anotar el cap (todavía no comprar) y la campaña de carritos queda en una Pulse Card.", action: "orders", label: "Ir a Pedidos" };
}
export function skillAlerta(i: PulseInput) {
  if (studio(i)) {
    return { title: "PULSE Design", body: "El hero no cierra y hay bloques mudos. Eso recorta más que el color.", action: "website-builder", label: "Seguir", draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Menos texto. Un solo CTA.", cta: "Entrar" } };
  }
  return { title: "PULSE", body: "Tres rojos: cap, 1047, mobile. Health no escribe inventario: solo diagnostica.", action: "__health", label: "Abrir Health" };
}
export function skillHero(i?: PulseInput) {
  const now = i && i.heroTitle ? i.heroTitle : "Crea algo extraordinario.";
  return {
    title: "PULSE Design",
    body: "Ahora el hero dice «" + now + "». Te propongo otra línea, más corta. History lo revierte si no te cierra.",
    action: "website-builder",
    label: "Aplicar hero",
    draft: { kind: "hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" }
  };
}
""", encoding="utf-8")
print("ok skills + draft")

kb = src / "DigitalBoostPulseKB.ts"
t = kb.read_text(encoding="utf-8")
if "draft?:" not in t:
    t = t.replace(
        "confirm: boolean;",
        "confirm: boolean;\n  draft?: { kind: string; title: string; body: string; cta: string };",
        1,
    )
if "draft: pick.draft" not in t and "draft: (pick as any).draft" not in t:
    t = t.replace(
        "card: meta.card\n  };",
        "card: meta.card,\n    draft: (pick as any).draft\n  };",
        1,
    )
# richer packs for theme / cta / hero
t = t.replace(
    'add(["hero", "homepage", "redisen", "canvas"], "PULSE Design", "L1 contenido. Hero: 3 segundos, una promesa, un CTA. AI Design aplica al canvas.", "website-builder", "Abrir Store Builder");',
    'add(["hero", "homepage", "redisen", "canvas", "titulo"], "PULSE Design", "El hero actual no cierra en 3 segundos. Abajo te dejo el reemplazo: aplicarlo es L1, reversible.", "website-builder", "Aplicar hero");',
)
t = t.replace(
    'add(["theme", "noir", "color"], "PULSE Design", "Aura calma · Noir precision. Chip Theme. Reversible.", "website-builder", "Seguir en el canvas");',
    'add(["theme", "noir", "color", "preset"], "PULSE Design", "Aura es calma, Noir es filo. No mezcles los dos. ¿Aplicamos Noir en este canvas?", "website-builder", "Seguir en el canvas");',
)
t = t.replace(
    'add(["conver", "cta"], "PULSE Design", "Todo bloque sin CTA es ruido.", "website-builder", "Abrir Store Builder");',
    'add(["conver", "cta", "boton"], "PULSE Design", "Hay bloques que no piden nada. El cierre tiene que decir Comprar ahora. ¿Lo unificamos?", "website-builder", "Seguir en el canvas");',
)
# skillHero() call with input
t = t.replace("return finish(input, skillHero());", "return finish(input, skillHero(input));")
kb.write_text(t, encoding="utf-8")
print("ok kb")

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
  hola: "Hola"
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
  const [lastKey, setLastKey] = useState("");
  const [applied, setApplied] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  function follows(action: string, used: string) {
    let all: string[][] = [];
    if (builder || action === "website-builder") all = [["hero", "Otro hero"], ["theme", "Cambiar theme"], ["conversion", "Unificar CTAs"]];
    else if (action === "orders") all = [["alerta", "Qué más está rojo"], ["stock", "El cap"], ["briefing", "Volver al pulso"]];
    else all = [["plan", "El orden de hoy"], ["pedidos", "Ver 1047"], ["alerta", "Qué está rojo"]];
    return all.filter(function (p) { return p[0] !== used; });
  }
  function think(word: string) {
    const raw = (word || q || "hola").trim();
    const line = SAY[raw.toLowerCase()] || raw;
    const c = ctx();
    const cv = readCanvas();
    const payload = { q: raw, section: section, store: c.store, range: c.range, live: c.live, page: cv.page, blockCount: cv.n, heroTitle: cv.hero };
    const r = raw === "debug" ? explain(payload) : analyze(payload);
    setLastKey(raw.toLowerCase());
    setApplied(false);
    setOut(r);
    setQ("");
    setMsgs(function (m) { return m.concat([{ role: "user", text: line }, { role: "pulse", text: r.body }]).slice(-10); });
  }
  function applyDraft() {
    if (!out || !out.draft) return;
    try {
      localStorage.setItem("db-pulse-skill", out.draft.kind);
      localStorage.setItem("db-pulse-apply-v1", JSON.stringify(out.draft));
      window.dispatchEvent(new CustomEvent("db-pulse-apply", { detail: out.draft }));
    } catch {}
    setApplied(true);
    setMsgs(function (m) { return m.concat([{ role: "pulse", text: "Listo. Quedó aplicado en el canvas. History lo revierte si no te cierra." }]).slice(-10); });
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
  }, [msgs, out, applied]);
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
  const showGo = out && !out.card && !builder && out.action !== "dashboard";
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE</div>
            <div className="text-sm font-semibold">Tienda {c0.store} · {c0.range}{builder ? " · canvas" : ""}</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div ref={scroller} className="min-h-[240px] flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {msgs.length === 0 && (
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-xs leading-5 text-[#D5E4F5]">
              Estoy en el canvas de {c0.store}. Decime si tocamos el hero, el theme o los CTA.
            </div>
          )}
          {msgs.map(function (m, i) {
            const mine = m.role === "user";
            return (
              <div key={i} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={mine
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#1E3A5F] px-3.5 py-2.5 text-xs leading-5"
                  : "max-w-[88%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-xs leading-5 text-[#D5E4F5]"}>
                  {m.text}
                </div>
              </div>
            );
          })}
          {out && out.draft && !applied && (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Propuesta · {out.draft.kind}</div>
              <div className="mt-2 text-sm font-semibold">{out.draft.title}</div>
              <p className="mt-1 text-xs leading-5 text-[#AFC0D5]">{out.draft.body}</p>
              <div className="mt-2 text-[11px] text-cyan-200">{out.draft.cta}</div>
              <button type="button" onClick={applyDraft} className="mt-3 h-10 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Aplicar en el canvas</button>
            </div>
          )}
          {out && out.card && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs">
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
              {follows(out.action, lastKey).map(function (pair) {
                return (
                  <button key={pair[0]} type="button" onClick={function () { think(pair[0]); }} className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-cyan-200">
                    {pair[1]}
                  </button>
                );
              })}
              {showGo ? (
                <button type="button" onClick={exec} className="rounded-full bg-cyan-400/15 px-3 py-1.5 text-[11px] text-cyan-300">{out.actionLabel}</button>
              ) : null}
            </div>
          )}
        </div>
        <div className="border-t border-white/10 p-3">
          <form className="flex gap-2" onSubmit={function (e) { e.preventDefault(); think(q || "hola"); }}>
            <input className="h-11 flex-1 rounded-xl border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder="Escribí como al socio…" value={q} onChange={function (e) { setQ(e.target.value); }} />
            <button type="submit" className="h-11 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-[#070D18]">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("LISTO APPLY")
print("Hero: propuesta + Aplicar. Chips no se repiten.")
