#!/usr/bin/env python3
from pathlib import Path
import re

src = Path("src")
ws = src / "StoreBuilderWorkspace.tsx"
dock = src / "DigitalBoostStudioDock.tsx"
if not ws.is_file():
    raise SystemExit("cd digitalboost-studio")

w = ws.read_text(encoding="utf-8")
print("offset 138269:", repr(w[138240:138320]))

w = w.replace("return (<><DigitalBoostStudioDock />", "return (")
w = w.replace("return (<DigitalBoostStudioDock />", "return (")
w = re.sub(r"<DigitalBoostStudioDock\s*/>", "", w)
w = w.replace("<><DigitalBoostOsKpiPaint /></>", "<DigitalBoostOsKpiPaint />")
w = w.replace("<><DigitalBoostOsKpiPaint /><DigitalBoostStudioDock /></>", "<DigitalBoostOsKpiPaint />")

# import → side-effect only (no JSX)
w = re.sub(
    r'import DigitalBoostStudioDock from ["\']\./DigitalBoostStudioDock["\'];\s*',
    'import "./DigitalBoostStudioDock";\n',
    w,
    count=1,
)
if 'import "./DigitalBoostStudioDock"' not in w and "DigitalBoostStudioDock" not in w.split("from")[0][:200]:
    w = 'import "./DigitalBoostStudioDock";\n' + w

ws.write_text(w, encoding="utf-8")
print("ok workspace limpio")

dock.write_text(r"""
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { applyPulseDraft } from "./DigitalBoostPulseApply";
import { toolInspect, toolMap } from "./DigitalBoostPulseTools";

const SNIPPETS = [
  { id: "hero", label: "Hero", title: "La colección que no pide permiso.", body: "Una promesa. Un botón.", cta: "Entrar" },
  { id: "cta", label: "Banner CTA", title: "¿Listo para el drop?", body: "Stock corto. Envío en 48h.", cta: "Comprar ahora" },
  { id: "faq", label: "FAQ", title: "Preguntas", body: "Envíos, cambios, talles.", cta: "Escribir" },
  { id: "trust", label: "Confianza", title: "Checkout seguro", body: "Soporte humano.", cta: "Ver política" }
];

function Dock() {
  const [tab, setTab] = useState<"outline" | "seo" | "audit" | "snip" | "tokens">("outline");
  const [open, setOpen] = useState(false);
  const [seo, setSeo] = useState(function () {
    try { return JSON.parse(localStorage.getItem("db-page-seo-v1") || "{}"); } catch { return {}; }
  });
  const facts = useMemo(function () { return toolInspect(); }, [open, tab]);
  const blocks = (function () {
    try {
      const page = localStorage.getItem("db-store-page-v1") || "Inicio";
      const raw = localStorage.getItem("db-store-canvas-v1:" + page) || localStorage.getItem("db-store-canvas-v1") || "[]";
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  })();
  const TABS = [["outline", "Outline"], ["snip", "Snippets"], ["audit", "Problems"], ["seo", "SEO"], ["tokens", "Tokens"]] as const;
  if (!open) {
    return (
      <button type="button" onClick={function () { setOpen(true); }} className="fixed bottom-20 right-3 z-[70] h-11 rounded-full border border-cyan-400/40 bg-[#0C1427] px-4 text-xs font-semibold text-cyan-300 shadow-lg">
        Herramientas
      </button>
    );
  }
  return (
    <div className="fixed inset-x-3 bottom-16 z-[70] max-h-[52vh] overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0C1427] text-[#F7FAFF] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Studio · tools</div>
        <button type="button" onClick={function () { setOpen(false); }} className="grid h-9 w-9 place-items-center rounded-md border border-white/10">x</button>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-2 py-2">
        {TABS.map(function (t) {
          return (
            <button key={t[0]} type="button" onClick={function () { setTab(t[0] as any); }} className={"h-8 shrink-0 rounded-full px-3 text-[11px] " + (tab === t[0] ? "bg-cyan-400 text-[#070D18]" : "border border-white/10 text-[#AFC0D5]")}>
              {t[1]}
            </button>
          );
        })}
      </div>
      <div className="max-h-[36vh] overflow-y-auto p-3 text-xs leading-5">
        {tab === "outline" && blocks.map(function (b: any, i: number) {
          return <div key={i} className="mb-1 rounded-lg border border-white/10 px-3 py-2">{(b && (b.type || b.kind)) || "bloque"} · {String((b && b.title) || "sin título").slice(0, 48)}</div>;
        })}
        {tab === "snip" && (
          <div className="grid grid-cols-2 gap-2">
            {SNIPPETS.map(function (s) {
              return (
                <button key={s.id} type="button" onClick={function () { applyPulseDraft({ kind: s.id === "hero" ? "hero" : "cta", title: s.title, body: s.body, cta: s.cta }); }} className="rounded-xl border border-white/10 px-3 py-3 text-left">
                  <div className="font-semibold">{s.label}</div>
                  <div className="mt-1 text-[11px] text-[#AFC0D5]">{s.title}</div>
                </button>
              );
            })}
          </div>
        )}
        {tab === "audit" && (
          <div>
            <p className="font-semibold">Problems · {facts.score}/100</p>
            <pre className="mt-2 whitespace-pre-wrap text-[11px] text-[#AFC0D5]">{toolMap(facts)}</pre>
          </div>
        )}
        {tab === "seo" && (
          <div className="space-y-2">
            <input className="h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="Title" value={seo.title || ""} onChange={function (e) { setSeo(Object.assign({}, seo, { title: e.target.value })); }} />
            <textarea className="min-h-16 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2" placeholder="Description" value={seo.description || ""} onChange={function (e) { setSeo(Object.assign({}, seo, { description: e.target.value })); }} />
            <button type="button" onClick={function () { try { localStorage.setItem("db-page-seo-v1", JSON.stringify(seo)); } catch {} }} className="h-10 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Guardar SEO</button>
          </div>
        )}
        {tab === "tokens" && (
          <button type="button" onClick={function () { applyPulseDraft({ kind: "theme", title: "Noir", body: "Preset Noir", cta: "Aplicar Noir" }); }} className="h-10 w-full rounded-lg border border-white/10">Aplicar Noir</button>
        )}
      </div>
    </div>
  );
}

function boot() {
  if (typeof document === "undefined") return;
  if (document.getElementById("db-studio-dock")) return;
  const el = document.createElement("div");
  el.id = "db-studio-dock";
  document.body.appendChild(el);
  createRoot(el).render(<Dock />);
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
export default Dock;
""", encoding="utf-8")
print("LISTO FIX2 — dock en body, workspace sin JSX extra")
