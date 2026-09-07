
import { useEffect, useRef, useState } from "react";
import { explain, analyze, analyzeSmart, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";
import {
  approvePulseAction,
  rejectPulseAction,
} from "./DigitalBoostPulseGovernance";
import { executePulseAction } from "./DigitalBoostPulseExecutor";


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
  let range = "7d", store = "Nimbus", live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Nimbus";
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
  hola: "Hola",
  publicar: "Podemos publicar?", seo: "Como esta el SEO?",
  inspeccionar: "Inspeccioná la tienda",
  mapa: "Mostrame el mapa del canvas",
  golpe: "¿Cuál es el siguiente golpe?",
  diff: "Diferencia del hero",
  score: "¿Cuál es el score?"
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
  const THREAD = "db-pulse-thread-" + section;
  const [msgs, setMsgs] = useState<Msg[]>(function () {
    try { return JSON.parse(sessionStorage.getItem(THREAD) || "[]"); } catch { return []; }
  });
  const [lastKey, setLastKey] = useState("");
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  useEffect(function () { document.body.classList.add('db-pulse-open'); return function () { document.body.classList.remove('db-pulse-open'); }; }, []);
  function follows(action: string, used: string) {
    let all: string[][] = [];
    if (builder || action === "seo" || action === "website-builder") all = [["golpe", "Siguiente golpe"], ["mapa", "Mapa del canvas"], ["diff", "Diff del hero"]];
    else if (action === "orders") all = [["alerta", "Qué más está rojo"], ["stock", "El cap"], ["briefing", "Volver al pulso"]];
    else all = [["golpe", "Siguiente golpe"], ["inspeccionar", "Inspeccioná"], ["plan", "El orden"]];
    return all.filter(function (p) { return p[0] !== used; });
  }
  async function think(word: string) {
    const raw = (word || q || "hola").trim();
    const line = SAY[raw.toLowerCase()] || raw;
    const c = ctx();
    const cv = readCanvas();
    const payload = { q: raw, section: section, store: c.store, range: c.range, live: c.live, page: cv.page, blockCount: cv.n, heroTitle: cv.hero };
    setBusy(true);
    setQ("");
    setMsgs(function (m) {
      const last = m[m.length - 1];
      if (last && last.role === "user" && last.text === line) return m;
      return m.concat([{ role: "user", text: line }]).slice(-12);
    });
    let result = raw === "debug" ? explain(payload) : analyze(payload);
    try {
      if (raw !== "debug") {
        const timed = new Promise((_, reject) => setTimeout(function () { reject(new Error("pulse-ai-timeout")); }, 20000));
        const r = await Promise.race([analyzeSmart(payload), timed]);
        if (r && typeof r === "object" && "decision" in r) result = r.decision;
        else if (r && typeof r === "object" && "body" in r) result = r;
      }
    } catch {}
    setLastKey(raw.toLowerCase());
    setApplied(false);
    setOut(result);
    setBusy(false);
    setMsgs(function (m) {
      const last = m[m.length - 1];
      if (last && last.role === "pulse" && last.text === result.body) return m;
      return m.concat([{ role: "pulse", text: result.body }]).slice(-12);
    });
  }
  function applyDraft() {
    if (!out || !out.draft || !out.envelope) return;

    let approval = out.approval || null;
    if (out.envelope.requires_approval) {
      if (!approval) {
        setMsgs(function (m) {
          return m.concat([{ role: "pulse", text: "PULSE no puede aplicar: falta una aprobación válida." }]).slice(-10);
        });
        return;
      }
      approval = approvePulseAction(approval);
    }

    let result = executePulseAction({
      envelope: out.envelope,
      approval: approval,
      draft: out.draft,
      proposal: out.proposal,
      onNavigate: function (action) {
        if (action === "__health" && props.onOpenHealth) props.onOpenHealth();
        else if (action === "__search" && props.onOpenSearch) props.onOpenSearch();
        else if (action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
        else if (action === "__console" && props.onOpenConsole) props.onOpenConsole();
        else if (action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
        else props.onNavigate(action);
      }
    });

    const ok = result.state === "COMPLETED";

    if (ok) {
      try {
        localStorage.setItem("db-pulse-skill", out.draft.kind);
        localStorage.setItem("db-pulse-apply-v1", JSON.stringify(out.draft));
        window.dispatchEvent(new CustomEvent("db-pulse-apply", { detail: out.draft }));
      } catch {}
      setApplied(true);
    }

    setMsgs(function (m) {
      return m.concat([{ role: "pulse", text: ok
        ? "Listo. El canvas ya tiene el cambio. History lo revierte si no te cierra."
        : result.state === "AWAITING_APPROVAL"
          ? "La propuesta requiere aprobación antes de aplicar el cambio."
          : "No se aplicó el cambio. PULSE bloqueó la ejecución." }]).slice(-10);
    });
  }
  useEffect(function () {
    try {
      const seed = localStorage.getItem("db-pulse-seed");
      if (seed) { localStorage.removeItem("db-pulse-seed"); think(seed); return; }
    } catch {}
    try {
      const saved = JSON.parse(sessionStorage.getItem(THREAD) || "[]");
      if (Array.isArray(saved) && saved.length) return;
    } catch {}
    if (msgs.length === 0) think(builder ? "hola" : "briefing");
  }, []);
  useEffect(function () {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
      try { sessionStorage.setItem(THREAD, JSON.stringify(msgs)); } catch {}
  }, [msgs, out, applied]);
  function exec() {
    if (!out || !out.envelope) return;

    let approval = out.approval || null;

    if (out.envelope.requires_approval) {
      if (!approval) {
        setMsgs(function (m) {
          return m.concat([{ role: "pulse", text: "PULSE no puede ejecutar: falta una aprobación válida." }]).slice(-10);
        });
        return;
      }

      approval = approvePulseAction(approval);
    }

    const result = executePulseAction({
      envelope: out.envelope,
      approval: approval,
      draft: out.draft,
      proposal: out.proposal,
      onNavigate: function (action) {
        props.onClose();
        if (action === "__health" && props.onOpenHealth) props.onOpenHealth();
        else if (action === "__search" && props.onOpenSearch) props.onOpenSearch();
        else if (action === "__automations" && props.onOpenAutomations) props.onOpenAutomations();
        else if (action === "__console" && props.onOpenConsole) props.onOpenConsole();
        else if (action === "__integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
        else props.onNavigate(action);
      }
    });

    if (result.state !== "COMPLETED") {
      setMsgs(function (m) {
        return m.concat([{ role: "pulse", text:
          result.state === "AWAITING_APPROVAL"
            ? "La acción sigue esperando aprobación."
            : result.state === "REJECTED"
              ? "PULSE rechazó la acción según Governance."
              : "La ejecución falló y quedó auditada."
        }]).slice(-10);
      });
      return;
    }

    if (out.draft) {
      try {
        localStorage.setItem("db-pulse-skill", out.draft.kind);
        localStorage.setItem("db-pulse-apply-v1", JSON.stringify(out.draft));
        window.dispatchEvent(new CustomEvent("db-pulse-apply", { detail: out.draft }));
      } catch {}
      setApplied(true);
      setMsgs(function (m) {
        return m.concat([{ role: "pulse", text: "Listo. El canvas ya tiene el cambio. History lo revierte si no te cierra." }]).slice(-10);
      });
      return;
    }

    setApplied(false);
  }
  const showGo = out && !out.card && !builder && out.action !== "dashboard";
  const TRAY = builder
    ? [["golpe", "Siguiente golpe"], ["mapa", "Mapa"], ["diff", "Diff"], ["hero", "Hero"], ["publicar", "Publicar"], ["seo", "SEO"]]
    : [["golpe", "Siguiente golpe"], ["inspeccionar", "Inspect"], ["pedidos", "Pedidos"], ["stock", "Stock"], ["plan", "Plan"]];
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0C1427] shadow-[0_20px_60px_rgba(0,0,0,.45)] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PULSE</div>
            <div className="text-sm font-semibold">Tienda {c0.store} · {c0.range}{builder ? " · canvas" : ""}</div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={function () { setMsgs([]); setOut(null); setApplied(false); try { sessionStorage.removeItem(THREAD); } catch {} }} className="h-9 rounded-md border border-white/10 px-2 text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Nueva</button>
            <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
          </div>
        </div>
        <div ref={scroller} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {msgs.length === 0 && (
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-[13px] leading-6 text-[#D5E4F5]">
              Estoy en {c0.store}. Preguntame como al socio, o usá los chips de abajo.
            </div>
          )}
          {msgs.map(function (m, i) {
            const mine = m.role === "user";
            return (
              <div key={i} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className={mine
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#1E3A5F] px-3.5 py-2.5 text-[13px] leading-6"
                  : "max-w-[88%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-[13px] leading-6 text-[#D5E4F5]"}>
                  <div className={"mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] " + (mine ? "text-[#7F9CB8] text-right" : "text-cyan-300")}>{mine ? "Vos" : "PULSE"}</div>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            );
          })}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-[13px] text-[#AFC0D5]">
                PULSE está pensando…
              </div>
            </div>
          )}
          {out && out.draft && !applied && (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Propuesta · {out.draft.kind}</div>
              <div className="mt-2 text-sm font-semibold">{out.draft.title}</div>
              <p className="mt-1 text-[13px] leading-6 text-[#AFC0D5]">{out.draft.body}</p>
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
                <button type="button" onClick={function () {
                  if (out && out.approval) {
                    rejectPulseAction(out.approval);
                  }
                  setOut(null);
                }} className="h-10 flex-1 rounded-lg border border-white/10 text-xs">Ahora no</button>
              </div>
            </div>
          )}
          {false && out && !out.card && (
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
          <div className="mb-2 flex flex-wrap gap-1">
            {TRAY.map(function (pair) {
              return (
                <button key={pair[0]} type="button" onClick={function () { think(pair[0]); }} className="h-8 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 text-[11px] text-cyan-200">
                  {pair[1]}
                </button>
              );
            })}
          </div>
          <form className="flex gap-2" onSubmit={function (e) { e.preventDefault(); think(q || "hola"); }}>
            <input className="h-11 flex-1 rounded-xl border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder="Preguntale a PULSE…" value={q} onChange={function (e) { setQ(e.target.value); }} />
            <button type="submit" className="h-11 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-[#070D18]">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
