import "./digitalboost-store-theme.css";
import "./digitalboost-os.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Eye, Monitor, Plus, Redo2, Smartphone, Tablet, Trash2, Undo2 } from "lucide-react";
import { BLOCK_META, defaultBlock, loadCanvas, saveCanvas, loadCanvasPage, saveCanvasPage, seedPage, seedHome, newId, type BlockType, type CanvasBlock } from "./DigitalBoostStoreCanvas";
import { loadHistory, pushSnapshot, type Snapshot } from "./DigitalBoostHistory";
import DigitalBoostHistoryPanel from "./DigitalBoostHistoryPanel";
import { loadTheme, saveTheme, PRESETS, type StoreTheme } from "./DigitalBoostTheme";
import DigitalBoostThemePanel from "./DigitalBoostThemePanel";

function cx(...p: Array<string | false | null | undefined>) { return p.filter(Boolean).join(" "); }

function CanvasView({ blocks, selected, hover, onSelect, onHover }: {
  blocks: CanvasBlock[]; selected: string | null; hover: string | null;
  onSelect: (id: string) => void; onHover: (id: string | null) => void;
}) {
  return (
    <div className="db-store-paper">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-[11px] font-semibold tracking-[0.18em]">NIMBUS</span>
        <span className="text-[10px] text-black/40">Inicio · Productos · Contacto</span>
      </div>
      {blocks.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="text-sm font-semibold">Pagina vacia</div>
              <p className="mt-2 text-xs text-black/50">Agrega un bloque o carga la plantilla de {page}.</p>
            </div>
          )}
          {blocks.filter(function (b) { return !(b && b.hidden); }).map((b) => {
        const on = selected === b.id;
        const hv = hover === b.id;
        return (
          <button key={b.id} type="button" onClick={() => onSelect(b.id)} onMouseEnter={() => onHover(b.id)} onMouseLeave={() => onHover(null)}
            className={cx("relative block w-full text-left", on && "ring-2 ring-cyan-400 ring-inset", hv && !on && "ring-1 ring-violet-400/70 ring-inset")}>
            {(on || hv) && (
              <span className="absolute left-2 top-2 z-10 rounded bg-[#0A1020] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">{BLOCK_META[b.type].label}</span>
            )}
            {b.type === "hero" && (
              <div className="bg-gradient-to-b from-violet-200 via-[#F4F1EA] to-cyan-100 px-6 py-10">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">Nueva coleccion</div>
                <h2 className="mt-3 break-words text-3xl font-semibold leading-tight tracking-tight">{b.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-black/70">{b.body}</p>
                {b.cta ? <span className="mt-6 inline-flex rounded-full bg-[#101820] px-4 py-2 text-xs font-medium text-[#F4F1EA]">{b.cta}</span> : null}
              </div>
            )}
            {b.type === "features" && (
              <div className="grid grid-cols-3 gap-px bg-black/10 text-center text-[10px]">
                {b.body.split("·").map((t) => <div key={t} className="bg-[color:var(--store-surface,#F4F1EA)] px-2 py-4 font-medium">{t.trim()}</div>)}
              </div>
            )}
            {b.type === "products" && (
              <div className="px-6 py-8">
                <div className="mb-4 flex items-end justify-between">
                  <div className="text-lg font-semibold">{b.title}</div>
                  <div className="text-[11px] text-black/40">{b.cta || "Ver todo"}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["from-cyan-300", "from-violet-300", "from-pink-300"].map((g, i) => (
                    <div key={i}>
                      <div className={"aspect-[3/4] rounded-lg bg-gradient-to-b to-slate-200 " + g} />
                      <div className="mt-2 text-[11px]">{b.body.split("·")[i]?.trim() || "Producto"}</div>
                      <div className="text-[11px] font-semibold tabular-nums">$ 49.900</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {b.type === "text" && (
              <div className="px-6 py-10">
                <h3 className="text-2xl font-semibold tracking-tight">{b.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-black/70">{b.body}</p>
              </div>
            )}
            {b.type === "cta" && (
              <div className="mx-5 my-6 rounded-2xl bg-[#101820] px-5 py-8 text-[#F4F1EA]">
                <div className="text-xl font-semibold">{b.title}</div>
                <p className="mt-2 text-sm text-white/70">{b.body}</p>
                {b.cta ? <span className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#070d18]">{b.cta}</span> : null}
              </div>
            )}
            {b.type === "media" && (
              <div className="relative mx-5 my-6 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 px-5 py-16 text-white">
                <div className="text-[10px] uppercase tracking-[0.2em]">{b.body}</div>
                <div className="mt-2 text-2xl font-semibold">{b.title}</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function DigitalBoostStoreStudio({ onBack }: { onBack?: () => void }) {
  const catalog: BlockType[] = ["hero", "features", "products", "text", "cta", "media"];
  const pages = ["Inicio", "Productos", "Colecciones", "Nosotros", "Contacto"];
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("mobile");
  const [page, setPage] = useState("Inicio");
  useEffect(function () {
    try { (window as any).__dbSetPage = setPage; } catch {}
    function onPage(ev) {
      const name = ev && ev.detail;
      if (typeof name === 'string' && name) setPage(name);
    }
    window.addEventListener('db-page', onPage);
    return function () { window.removeEventListener('db-page', onPage); };
  }, []);

  const [tab, setTab] = useState<"content" | "style">("content");
  const [blocks, setBlocks] = useState<CanvasBlock[]>(() => seedHome());
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const inspectRef = useRef<HTMLElement | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState<StoreTheme>(() => PRESETS[0]);
  const [showTheme, setShowTheme] = useState(false);
  const [ready, setReady] = useState(false);
  const [past, setPast] = useState<CanvasBlock[][]>([]);
  const [future, setFuture] = useState<CanvasBlock[][]>([]);

  useEffect(() => { setBlocks(loadCanvasPage(page)); setHistory(loadHistory()); setTheme(loadTheme()); setReady(true); }, []);
  useEffect(() => {
    function pull(next?: unknown) {
      if (Array.isArray(next) && next.length) {
        setBlocks(next as CanvasBlock[]);
        return;
      }
      setBlocks(loadCanvasPage(page));
    }
    function onReload(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      pull(detail);
    }
    try { (window as any).__dbSetBlocks = function (next: CanvasBlock[]) { pull(next); }; } catch {}
    window.addEventListener("db-canvas-reload", onReload);
    window.addEventListener("db-pulse-apply", onReload);
    return function () {
      window.removeEventListener("db-canvas-reload", onReload);
      window.removeEventListener("db-pulse-apply", onReload);
      try { delete (window as any).__dbSetBlocks; } catch {}
    };
  }, [page]);
  useEffect(() => { if (ready) saveCanvasPage(page, blocks); }, [blocks, ready]);
  useEffect(() => { if (selected && inspectRef.current) inspectRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [selected]);
  useEffect(() => { if (ready) saveTheme(theme); }, [theme, ready]);

  const current = useMemo(() => blocks.find((b) => b.id === selected) ?? null, [blocks, selected]);

  function commit(next: CanvasBlock[]) {
    setPast((p) => [...p.slice(-29), blocks]);
    setFuture([]);
    setBlocks(next);
  }
  function undo() {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [blocks, ...f]);
    setBlocks(prev);
  }
  function redo() {
    if (!future.length) return;
    const nxt = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, blocks]);
    setBlocks(nxt);
  }
  function add(type: BlockType) {
    const next = defaultBlock(type);
    const copy = [...blocks];
    const i = selected ? copy.findIndex((b) => b.id === selected) : copy.length - 1;
    copy.splice(i + 1, 0, next);
    commit(copy);
    setSelected(next.id);
  }
  function patch(partial: Partial<CanvasBlock>) {
    if (!selected) return;
    commit(blocks.map((b) => (b.id === selected ? { ...b, ...partial } : b)));
  }
  function move(dir: -1 | 1) {
    if (!selected) return;
    const i = blocks.findIndex((b) => b.id === selected);
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const copy = [...blocks];
    const [item] = copy.splice(i, 1);
    copy.splice(j, 0, item);
    commit(copy);
  }
  function duplicate() {
    if (!current) return;
    const next = { ...current, id: newId() };
    const i = blocks.findIndex((b) => b.id === selected);
    const copy = [...blocks];
    copy.splice(i + 1, 0, next);
    commit(copy);
    setSelected(next.id);
  }
  function remove() {
    if (!selected) return;
    commit(blocks.filter((b) => b.id !== selected));
    setSelected(null);
  }
  function publish() {
    saveCanvasPage(page, blocks);
    setHistory(pushSnapshot({ label: "Publicado · " + page, source: "publish", blocks, theme: (typeof theme !== "undefined" ? theme : undefined) }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  const paper = { ['--store-bg' as string]: theme.bg, ['--store-surface' as string]: theme.surface, ['--store-text' as string]: theme.text, ['--store-muted' as string]: theme.muted, ['--store-primary' as string]: theme.primary, ['--store-accent' as string]: theme.accent } as React.CSSProperties;
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">
      {showHistory && <DigitalBoostHistoryPanel items={history} currentCount={blocks.length} onRestore={(s) => { setBlocks(s.blocks || []); setHistory(pushSnapshot({ label: "Restore · " + s.label, source: "user", blocks: s.blocks || [] })); setShowHistory(false); }} onClose={() => setShowHistory(false)} />}
      {showTheme && <DigitalBoostThemePanel theme={theme} onChange={setTheme} onClose={() => setShowTheme(false)} />}
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-slate-400" aria-label="Volver"><ArrowLeft size={16} /></button>
          <div>
            <div className="text-xs font-semibold tracking-[0.14em] text-cyan-300">STORE BUILDER</div>
            <div className="text-[10px] text-slate-500">Ecommerce Studio · {page}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={undo} disabled={!past.length} className="grid h-10 w-10 place-items-center rounded-md text-slate-400 disabled:opacity-30" aria-label="Undo"><Undo2 size={15} /></button>
          <button type="button" onClick={redo} disabled={!future.length} className="grid h-10 w-10 place-items-center rounded-md text-slate-400 disabled:opacity-30" aria-label="Redo"><Redo2 size={15} /></button>
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
            <button key={id} type="button" onClick={() => setDevice(id)} className={cx("grid h-10 w-10 place-items-center rounded-md", device === id ? "bg-[#101B32] text-cyan-300" : "text-slate-500")} aria-label={id}><Icon size={15} /></button>
          ))}
          <button type="button" onClick={() => setShowTheme(true)} className="h-10 items-center rounded-md border border-white/10 px-3 text-xs text-slate-400 inline-flex">Theme</button>
          <button type="button" onClick={() => setPreview((v) => !v)} className="ml-1 h-10 items-center gap-1 rounded-md border border-white/10 px-3 text-xs text-slate-400 inline-flex"><Eye size={13} /> {preview ? "Editar" : "Preview"}</button>
          <button type="button" onClick={publish} className="ml-1 h-10 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-[#070d18]">{saved ? "Guardado" : "Publicar"}</button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[220px_minmax(0,1fr)_250px]">
        <aside className="hidden overflow-y-auto border-r border-white/10 p-3 lg:block">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Build</div>
          <div className="space-y-1.5">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="flex w-full items-center justify-between rounded-md border border-white/10 bg-[#101B32] px-3 py-2.5 text-left hover:border-cyan-400/30">
                <span><span className="block text-xs">{BLOCK_META[type].label}</span><span className="block text-[10px] text-slate-500">{BLOCK_META[type].hint}</span></span>
                <Plus size={13} className="text-slate-500" />
              </button>
            ))}
          </div>
          <div className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pages</div>
          {pages.map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)} className={cx("mb-1 w-full rounded-md px-3 py-2 text-left text-xs", page === p ? "bg-violet-500/20 text-violet-300" : "text-slate-400")}>{p}</button>
          ))}
          <div className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Structure</div>
          {blocks.map((b, n) => (
            <button key={b.id} type="button" onClick={() => setSelected(b.id)} className={cx("mb-1 w-full truncate rounded-md px-3 py-2 text-left text-[11px]", selected === b.id ? "bg-[#101B32] text-cyan-300" : "text-slate-400")}>{n + 1}. {BLOCK_META[b.type].label}</button>
          ))}
        </aside>

        <div className="flex min-h-0 flex-col overflow-auto bg-[#0A1020] p-3 sm:p-6">
          <div className="mb-2 flex gap-2 overflow-x-auto lg:hidden">
            {pages.map((p) => (
              <button key={p} type="button" onClick={() => setPage(p)} className={cx("shrink-0 rounded-full px-3 py-2 text-xs", page === p ? "bg-violet-500/30 text-violet-200" : "border border-white/10 text-slate-400")}>{p}</button>
            ))}
          </div>
          <div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="shrink-0 rounded-full border border-white/10 bg-[#101B32] px-3 py-2 text-xs">+ {BLOCK_META[type].label}</button>
            ))}
            <button type="button" onClick={() => setShowTheme(true)} className="shrink-0 rounded-full border border-cyan-400/40 px-3 py-2 text-xs text-cyan-300">Theme</button>
            <button type="button" onClick={() => { commit(typeof seedPage === "function" ? seedPage(page) : seedHome()); setSelected(null); }} className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-xs">Plantilla</button>
            <button type="button" onClick={() => setShowHistory(true)} className="shrink-0 rounded-full border border-emerald-400/40 px-3 py-2 text-xs text-emerald-300">History</button>
          </div>
          <div style={paper} className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl", device === "mobile" && "w-full max-w-sm", device === "tablet" && "w-full max-w-xl", device === "desktop" && "w-full max-w-3xl")}>
            <CanvasView blocks={blocks} selected={preview ? null : selected} hover={preview ? null : hover} onSelect={(id) => { if (!preview) setSelected(id); }} onHover={setHover} />
          </div>
        </div>

        <aside ref={inspectRef} className={cx("overflow-y-auto border-white/10 p-3", current ? "block border-t lg:border-l lg:border-t-0" : "hidden lg:block lg:border-l")}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspector</div>
            {current ? (
              <button type="button" className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-slate-400" aria-label="Cerrar inspector" onClick={function () { setSelected(null); }}>x</button>
            ) : null}
          </div>
          {!current ? (
            <p className="mt-4 text-xs leading-5 text-slate-400">Selecciona un bloque en el canvas o agrega uno.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="flex gap-1 rounded-md bg-[#101B32] p-1">
                <button type="button" onClick={() => setTab("content")} className={cx("h-8 flex-1 rounded text-[11px]", tab === "content" ? "bg-violet-500/30 text-violet-200" : "text-slate-400")}>Content</button>
                <button type="button" onClick={() => setTab("style")} className={cx("h-8 flex-1 rounded text-[11px]", tab === "style" ? "bg-violet-500/30 text-violet-200" : "text-slate-400")}>Style</button>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#101B32] p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-cyan-300">{BLOCK_META[current.type].label}</div>
                {tab === "content" ? (
                  <>
                    <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">Titulo</label>
                    <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm outline-none" value={current.title} onChange={(e) => patch({ title: e.target.value })} />
                    <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">Texto</label>
                    <textarea className="mt-1 min-h-20 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 py-2 text-sm outline-none" value={current.body} onChange={(e) => patch({ body: e.target.value })} />
                    <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">CTA</label>
                    <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm outline-none" value={current.cta} onChange={(e) => patch({ cta: e.target.value })} />
                  </>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-slate-400">El canvas usa el theme Nimbus: paper #F4F1EA, tinta #101820, acento cyan. Tokens editables en la fase Theme System.</p>
                )}
              </div>
              <button type="button" className="h-11 w-full rounded-md bg-cyan-400 text-xs font-semibold text-[#070d18]" onClick={function () {
                try {
                  const q = "reescribi el bloque " + current.type + " titulado " + current.title + " para la tienda nimbus";
                  localStorage.setItem("db-pulse-seed", q);
                  window.dispatchEvent(new Event("db-open-pulse"));
                } catch {}
              }}>PULSE · reescribir este bloque</button>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Subir"><ChevronUp size={16} /></button>
                <button type="button" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Bajar"><ChevronDown size={16} /></button>
                <button type="button" onClick={duplicate} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Duplicar"><Copy size={16} /></button>
                <button type="button" onClick={remove} className="ml-auto grid h-11 w-11 place-items-center rounded-md border border-pink-500/40 text-pink-400" aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
