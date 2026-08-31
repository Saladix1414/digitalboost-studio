import "./digitalboost-studio-pro.css";
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { applyPulseDraft, appendPulseBlock, undoPulseApply, applyBlockAt, moveBlock, duplicateBlock, removeBlock, toggleHidden } from './DigitalBoostPulseApply';
import { toolInspect, toolMap } from "./DigitalBoostPulseTools";

const SNIPPETS = [
  { id: "hero", kind: "hero", label: "Hero corto", title: "La coleccion que no pide permiso.", body: "Una promesa. Un boton.", cta: "Entrar" },
  { id: "cta", kind: "cta", label: "Banner drop", title: "Listo para el drop?", body: "Stock corto. Envio 48h.", cta: "Comprar ahora" },
  { id: "faq", kind: "cta", label: "FAQ", title: "Preguntas reales", body: "Envios, cambios, talles.", cta: "Escribir" },
  { id: "trust", kind: "cta", label: "Confianza", title: "Checkout seguro", body: "Soporte humano.", cta: "Ver politica" },
  { id: "envios", kind: "cta", label: "Envios", title: "Llega en 48h", body: "AMBA y interior.", cta: "Calcular envio" },
  { id: "vip", kind: "cta", label: "VIP", title: "Lista del drop", body: "Entra antes. Sin spam.", cta: "Anotarme" }
];
const PAGES = ["Inicio", "Productos", "Colecciones", "Nosotros", "Contacto"];
const TABS = [
  ["outline", "Outline"], ["pages", "Pages"], ["snip", "Snippets"],
  ["audit", "Problems"], ["seo", "SEO"], ["copy", "Copy"],
  ["media", "Media"], ["export", "Export"], ["insp", "Inspector"]
];

function readBlocks() {
  try {
    const page = localStorage.getItem("db-store-page-v1") || "Inicio";
    const raw = localStorage.getItem("db-store-canvas-v1:" + page) || localStorage.getItem("db-store-canvas-v1") || "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function Dock() {
  const [tab, setTab] = useState(null as string | null);
  const [sel, setSel] = useState(0);
  const [filt, setFilt] = useState('all');
  const [seo, setSeo] = useState(function () {
    try { return JSON.parse(localStorage.getItem("db-page-seo-v1") || "{}"); } catch { return {}; }
  });
  const facts = useMemo(function () { return toolInspect(); }, [tab]);
  const blocks = readBlocks();
  function passFilt(b: any) {
    const tp = String((b && (b.type || b.kind)) || '');
    if (filt === 'hero') return tp === 'hero';
    if (filt === 'cta') return !(b && String(b.cta || '').trim());
    if (filt === 'hide') return !!(b && b.hidden);
    return true;
  }
  const open = tab !== null;
  if (typeof document !== 'undefined' && (document.body.classList.contains('db-pulse-open') || document.body.classList.contains('db-seo-open'))) return null;
  
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] p-2 pb-[max(10px,env(safe-area-inset-bottom))]">
      {open && (
        <div className="pointer-events-auto mb-2 max-h-[48vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Studio</div>
              <div className="text-xs text-[#AFC0D5]">{facts.store} · {facts.page} · {blocks.length} bloques · {facts.score}/100</div>
            </div>
            <button type="button" onClick={function () { setTab(null); }} className="grid h-9 w-9 place-items-center rounded-md border border-white/10">x</button>
          </div>
          <div className="max-h-[40vh] overflow-y-auto p-3 text-[13px] leading-6">
            {tab === "outline" && blocks.map(function (b: any, i: number) { if (!passFilt(b)) return null;
              const mute = !(b && String(b.cta || '').trim());
              return (
                <div key={i} onClick={function () { setSel(i); setTab("insp"); }} className={"mb-1 flex items-center justify-between rounded-lg border px-3 py-2 " + ((sel === i ? "border-cyan-400 bg-cyan-400/10 " : "") + (mute ? "border-amber-400/30" : "border-white/10"))}>
                  <span>{i + 1}. {(b && (b.type || b.kind)) || 'bloque'} · {String((b && b.title) || 'sin titulo').slice(0, 40)}</span>
                  <span className={mute ? "text-amber-200 text-[10px]" : "text-cyan-300 text-[10px]"}>{(b && b.hidden) ? "oculto" : (mute ? "sin CTA" : "CTA")}</span>
                </div>
              );
            })}
            {tab === "pages" && (
              <div className="grid grid-cols-2 gap-2">
                {PAGES.map(function (name) {
                  return (
                    <button key={name} type="button" onClick={function () { try { localStorage.setItem("db-store-page-v1", name); try { const w = window; if (w.__dbSetPage) w.__dbSetPage(name); w.dispatchEvent(new CustomEvent("db-page", { detail: name })); } catch {} window.dispatchEvent(new Event("db-canvas-reload")); } catch {} }} className={"rounded-xl border px-3 py-3 text-left " + (facts.page === name ? "border-cyan-400 bg-cyan-400/10" : "border-white/10")}>{name}</button>
                  );
                })}
              </div>
            )}
            {tab === "snip" && (
              <div className="grid grid-cols-2 gap-2">
                {SNIPPETS.map(function (s) {
                  return (
                    <button key={s.id} type="button" onClick={function () { if (s.kind === 'hero') applyPulseDraft({ kind: 'hero', title: s.title, body: s.body, cta: s.cta }); else appendPulseBlock({ type: s.id, title: s.title, body: s.body, cta: s.cta }); }} className="rounded-xl border border-white/10 px-3 py-3 text-left">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-cyan-300">Emmet</div>
                      <div className="font-semibold">{s.label}</div>
                      <div className="text-[11px] text-[#AFC0D5]">{s.title}</div>
                    </button>
                  );
                })}
              </div>
            )}
            {tab === "audit" && (
              <div>
                <p className="font-semibold">Problems · {facts.score}/100</p>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] text-[#AFC0D5]">{toolMap(facts)}</pre>
                {facts.notes.map(function (n) { return <p key={n} className="text-amber-200">· {n}</p>; })}
                <button type="button" className="mt-3 h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]" onClick={function () { try { localStorage.setItem('db-pulse-seed', 'inspeccionar'); window.dispatchEvent(new Event('db-open-pulse')); } catch {} }}>Preguntar a PULSE</button>
              </div>
            )}
            {tab === "seo" && (
              <div className="space-y-2">
                <input className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="Title" value={seo.title || ""} onChange={function (e) { setSeo(Object.assign({}, seo, { title: e.target.value })); }} />
                <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2" placeholder="Description" value={seo.description || ""} onChange={function (e) { setSeo(Object.assign({}, seo, { description: e.target.value })); }} />
                <button type="button" onClick={function () { try { localStorage.setItem("db-page-seo-v1", JSON.stringify(seo)); } catch {} }} className="h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Guardar SEO</button>
              </div>
            )}
            {tab === "copy" && (
              <div className="space-y-2">
                <p>Hero actual: «{facts.heroTitle || '-'}»</p>
                <button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { applyPulseDraft({ kind: "hero", title: "La coleccion que no pide permiso.", body: "Una promesa. Un boton.", cta: "Entrar" }); }}>Pegar voz corta</button>
                <button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { applyPulseDraft({ kind: "cta", title: "CTA unico", body: "Comprar ahora.", cta: "Comprar ahora" }); }}>Unificar CTA</button>
              </div>
            )}
            {tab === "media" && <p className="text-[#AFC0D5]">Checklist: usa +Media en la barra del studio. PULSE no sube fotos.</p>}
            {tab === "export" && (<div className="space-y-2"><button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { try { navigator.clipboard.writeText(localStorage.getItem("db-store-canvas-v1:" + facts.page) || "[]"); } catch {} }}>Copiar JSON</button><button type="button" className="h-11 w-full rounded-lg border border-white/10" onClick={function () { undoPulseApply(); }}>Deshacer ultimo apply</button></div>)}{tab === "insp" && (<div className="space-y-2"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Bloque · {(blocks[sel] && (blocks[sel].type || blocks[sel].kind)) || "hero"} · {sel + 1}/{blocks.length}</p><label className="block text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Titulo</label><input id="db-insp-title" className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" defaultValue={(blocks[sel] && blocks[sel].title) || facts.heroTitle} key={sel + '-' + ((blocks[sel] && blocks[sel].title) || '')} /><label className="block text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Cuerpo</label><textarea id="db-insp-body" className="min-h-16 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2" defaultValue={(blocks[sel] && (blocks[sel].body || blocks[sel].text)) || facts.heroBody} key={sel + '-b'} /><label className="block text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">Boton</label><input id="db-insp-cta" className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" defaultValue={(blocks[sel] && blocks[sel].cta) || facts.heroCta || "Entrar"} key={sel + "-c"} /><button type="button" className="h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]" onClick={function () { const title = (document.getElementById("db-insp-title") as HTMLInputElement).value; const body = (document.getElementById("db-insp-body") as HTMLTextAreaElement).value; const cta = (document.getElementById("db-insp-cta") as HTMLInputElement).value; applyBlockAt(sel, { title: title, body: body, cta: cta }); }}>Aplicar al canvas</button><div className="mt-2 grid grid-cols-5 gap-1"><button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { setSel(moveBlock(sel, -1)); }}>Subir</button><button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { setSel(moveBlock(sel, 1)); }}>Bajar</button><button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { setSel(duplicateBlock(sel)); }}>Dup</button><button type="button" className="h-10 rounded-lg border border-white/10 text-[10px]" onClick={function () { toggleHidden(sel); }}>Ojo</button><button type="button" className="h-10 rounded-lg border border-amber-400/30 text-[10px] text-amber-200" onClick={function () { setSel(removeBlock(sel)); }}>Borrar</button></div><p className="text-[11px] text-[#AFC0D5]">L1 · History / Export · Deshacer</p></div>)}
          </div>
        </div>
      )}
      <div className="db-ide-bar pointer-events-auto flex gap-1 overflow-x-auto rounded-xl p-1">
        {TABS.map(function (t) {
          return (
            <button key={t[0]} type="button" onClick={function () { setTab(tab === t[0] ? null : t[0]); }} className={"h-10 shrink-0 rounded-xl px-3 text-[11px] font-medium " + (tab === t[0] ? "bg-cyan-400 text-[#070D18]" : "text-[#AFC0D5]")}>{t[1]}</button>
          );
        })}
      </div>
    </div>
  );
}
function readSection() {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get('section') || localStorage.getItem('db-os-section-v1') || localStorage.getItem('digitalboost_store_section') || '';
  } catch { return ''; }
}
function inStudio() {
  // FIX A: Gated por sección, no por data-attr global
  try {
    const s = readSection();
    return s === 'website-builder';
  } catch { return false; }
}

let studioDockRoot: ReturnType<typeof createRoot> | null = null;
function bootStudioDock() {
  if (typeof document === 'undefined') return;
  if (!inStudio()) return;
  if (document.getElementById('db-studio-dock')) return;
  const el = document.createElement('div');
  el.id = 'db-studio-dock';
  document.body.appendChild(el);
  studioDockRoot = createRoot(el);
  studioDockRoot.render(<Dock />);
}
function unbootStudioDock() {
  const el = document.getElementById('db-studio-dock');
  if (studioDockRoot) { try { studioDockRoot.unmount(); } catch {} studioDockRoot = null; }
  if (el && el.parentNode) el.parentNode.removeChild(el);
}
function syncStudioDock() {
  if (inStudio()) bootStudioDock();
  else unbootStudioDock();
}
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', syncStudioDock);
  window.addEventListener('hashchange', syncStudioDock);
  window.addEventListener('db-section', syncStudioDock);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncStudioDock);
  else syncStudioDock();
  setInterval(syncStudioDock, 400);
}
export default Dock;
