#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

def bak(rel):
    p = root / rel
    if p.is_file():
        d = p.with_name(p.stem + ".before_visual_rebuild_" + stamp + p.suffix)
        shutil.copy2(p, d)
        print("backup", d.name)

bak("src/DigitalBoostStoreStudio.tsx")
bak("src/DigitalBoostStoreCanvas.ts")
bak("src/StoreBuilderWorkspace.tsx")

(root / "src" / "DigitalBoostStoreCanvas.ts").write_text("""
export type BlockType = "hero" | "features" | "products" | "text" | "cta" | "media";
export type CanvasBlock = { id: string; type: BlockType; title: string; body: string; cta: string };
export const BLOCK_META: Record<BlockType, { label: string; hint: string }> = {
  hero: { label: "Hero", hint: "Titular + CTA" },
  features: { label: "Section", hint: "Tres pilares" },
  products: { label: "Productos", hint: "Grilla" },
  text: { label: "Text", hint: "Historia" },
  cta: { label: "CTA", hint: "Conversion" },
  media: { label: "Media", hint: "Lookbook" },
};
export function newId() { return "b-" + Math.random().toString(36).slice(2, 9); }
export function defaultBlock(type: BlockType): CanvasBlock {
  const map: Record<BlockType, Omit<CanvasBlock, "id" | "type">> = {
    hero: { title: "Crea algo extraordinario.", body: "Disena una tienda con la identidad de tu marca.", cta: "Comprar ahora" },
    features: { title: "Por que Aura", body: "Envios simples · Checkout seguro · Soporte humano", cta: "" },
    products: { title: "Destacados", body: "Campera Aura · Tote Cyan · Hoodie Violet", cta: "Ver todo" },
    text: { title: "Una tienda tambien puede contar quien sos.", body: "Usa contenido e imagenes para convertir identidad en experiencia.", cta: "" },
    cta: { title: "Listo para publicar.", body: "Lanza la coleccion de temporada.", cta: "Publicar tienda" },
    media: { title: "Drop Studio 09", body: "Lookbook en movimiento", cta: "" },
  };
  return { id: newId(), type, ...map[type] };
}
export function seedHome(): CanvasBlock[] {
  return [defaultBlock("hero"), defaultBlock("features"), defaultBlock("products"), defaultBlock("text")];
}
const KEY = "db-store-canvas-v1";
export function loadCanvas(): CanvasBlock[] {
  if (typeof localStorage === "undefined") return seedHome();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedHome();
    const parsed = JSON.parse(raw) as CanvasBlock[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedHome();
    return parsed;
  } catch { return seedHome(); }
}
export function saveCanvas(blocks: CanvasBlock[]) {
  try { localStorage.setItem(KEY, JSON.stringify(blocks)); } catch {}
}
""", encoding="utf-8")
print("ok canvas")

(root / "src" / "DigitalBoostStoreStudio.tsx").write_text("""
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Eye, Monitor, Plus, Redo2, Smartphone, Tablet, Trash2, Undo2 } from "lucide-react";
import { BLOCK_META, defaultBlock, loadCanvas, saveCanvas, seedHome, newId, type BlockType, type CanvasBlock } from "./DigitalBoostStoreCanvas";

function cx(...p: Array<string | false | null | undefined>) { return p.filter(Boolean).join(" "); }

function CanvasView({ blocks, selected, hover, onSelect, onHover }: {
  blocks: CanvasBlock[]; selected: string | null; hover: string | null;
  onSelect: (id: string) => void; onHover: (id: string | null) => void;
}) {
  return (
    <div className="bg-[#F4F1EA] text-[#101820]">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-[11px] font-semibold tracking-[0.18em]">AURA</span>
        <span className="text-[10px] text-black/40">Inicio · Productos · Contacto</span>
      </div>
      {blocks.map((b) => {
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
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{b.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-black/70">{b.body}</p>
                {b.cta ? <span className="mt-6 inline-flex rounded-full bg-[#101820] px-4 py-2 text-xs font-medium text-[#F4F1EA]">{b.cta}</span> : null}
              </div>
            )}
            {b.type === "features" && (
              <div className="grid grid-cols-3 gap-px bg-black/10 text-center text-[10px]">
                {b.body.split("·").map((t) => <div key={t} className="bg-[#F4F1EA] px-2 py-4 font-medium">{t.trim()}</div>)}
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
  const [tab, setTab] = useState<"content" | "style">("content");
  const [blocks, setBlocks] = useState<CanvasBlock[]>(() => seedHome());
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [past, setPast] = useState<CanvasBlock[][]>([]);
  const [future, setFuture] = useState<CanvasBlock[][]>([]);

  useEffect(() => { setBlocks(loadCanvas()); setReady(true); }, []);
  useEffect(() => { if (ready) saveCanvas(blocks); }, [blocks, ready]);

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
    saveCanvas(blocks);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">
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
          <button type="button" onClick={() => setPreview((v) => !v)} className="ml-1 hidden h-10 items-center gap-1 rounded-md border border-white/10 px-3 text-xs text-slate-400 sm:inline-flex"><Eye size={13} /> {preview ? "Editar" : "Preview"}</button>
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
          <div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="shrink-0 rounded-full border border-white/10 bg-[#101B32] px-3 py-2 text-xs">+ {BLOCK_META[type].label}</button>
            ))}
          </div>
          <div className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl", device === "mobile" && "w-full max-w-sm", device === "tablet" && "w-full max-w-xl", device === "desktop" && "w-full max-w-3xl")}>
            <CanvasView blocks={blocks} selected={preview ? null : selected} hover={preview ? null : hover} onSelect={(id) => { if (!preview) setSelected(id); }} onHover={setHover} />
          </div>
        </div>

        <aside className={cx("overflow-y-auto border-white/10 p-3", current ? "block border-t lg:border-l lg:border-t-0" : "hidden lg:block lg:border-l")}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspector</div>
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
                  <p className="mt-3 text-xs leading-5 text-slate-400">El canvas usa el theme Aura: paper #F4F1EA, tinta #101820, acento cyan. Tokens editables en la fase Theme System.</p>
                )}
              </div>
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
""", encoding="utf-8")
print("ok studio")

txt = ws.read_text(encoding="utf-8")
if "DigitalBoostStoreStudio from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostStoreStudio from "./DigitalBoostStoreStudio";',
        1,
    )
if 'case "website-builder":' in txt and "<DigitalBoostStoreStudio" not in txt:
    import re
    txt = re.sub(
        r'case "website-builder":\s*return \(\s*<StoreBuilderDirectFinal[\s\S]*?/>\s*\);',
        'case "website-builder":\n        return (\n          <DigitalBoostStoreStudio onBack={() => setSection("dashboard")} />\n        );',
        txt,
        count=1,
    )
ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO FASE 8-10")
print("Undo Redo, duplicar, outline, inspector mobile")
