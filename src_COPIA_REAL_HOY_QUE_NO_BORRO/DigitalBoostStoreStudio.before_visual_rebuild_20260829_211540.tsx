import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import {
  BLOCK_META,
  defaultBlock,
  loadCanvas,
  saveCanvas,
  seedHome,
  type BlockType,
  type CanvasBlock,
} from "./DigitalBoostStoreCanvas";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function CanvasView({
  blocks,
  selected,
  onSelect,
}: {
  blocks: CanvasBlock[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-[#F4F1EA] text-[#101820]">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-[11px] font-semibold tracking-[0.18em]">NIMBUS</span>
        <span className="text-[10px] text-black/40">Inicio · Productos · Contacto</span>
      </div>
      {blocks.filter(function (b) { return !(b && b.hidden); }).map((b) => {
        const active = selected === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id)}
            className={cx("block w-full text-left", active && "ring-2 ring-cyan-400 ring-inset")}
          >
            {b.type === "hero" && (
              <div className="bg-gradient-to-b from-violet-200 via-[#F4F1EA] to-cyan-100 px-6 py-10">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">Nueva colección</div>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{b.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-black/70">{b.body}</p>
                {b.cta ? <span className="mt-6 inline-flex rounded-full bg-[#101820] px-4 py-2 text-xs font-medium text-[#F4F1EA]">{b.cta}</span> : null}
              </div>
            )}
            {b.type === "features" && (
              <div className="grid grid-cols-3 gap-px bg-black/10 text-center text-[10px]">
                {b.body.split("·").map((t) => (
                  <div key={t} className="bg-[#F4F1EA] px-2 py-4 font-medium">{t.trim()}</div>
                ))}
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
                      <div className={`aspect-[3/4] rounded-lg bg-gradient-to-b ${g} to-slate-200`} />
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

  const [blocks, setBlocks] = useState<CanvasBlock[]>(() => seedHome());
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBlocks(loadCanvas());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCanvas(blocks);
  }, [blocks, ready]);

  const current = useMemo(() => blocks.find((b) => b.id === selected) ?? null, [blocks, selected]);

  function add(type: BlockType) {
    const next = defaultBlock(type);
    setBlocks((list) => {
      if (!selected) return [...list, next];
      const i = list.findIndex((b) => b.id === selected);
      const copy = [...list];
      copy.splice(i + 1, 0, next);
      return copy;
    });
    setSelected(next.id);
  }

  function patch(partial: Partial<CanvasBlock>) {
    if (!selected) return;
    setBlocks((list) => list.map((b) => (b.id === selected ? { ...b, ...partial } : b)));
  }

  function move(dir: -1 | 1) {
    if (!selected) return;
    setBlocks((list) => {
      const i = list.findIndex((b) => b.id === selected);
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      const [item] = copy.splice(i, 1);
      copy.splice(j, 0, item);
      return copy;
    });
  }

  function remove() {
    if (!selected) return;
    setBlocks((list) => list.filter((b) => b.id !== selected));
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
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-slate-400" aria-label="Volver">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-xs font-semibold tracking-[0.14em] text-cyan-300">STORE BUILDER</div>
            <div className="text-[10px] text-slate-500">Visual Studio · {page}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {([
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ] as const).map(([id, Icon]) => (
            <button key={id} type="button" onClick={() => setDevice(id)} className={cx("grid h-10 w-10 place-items-center rounded-md", device === id ? "bg-[#101B32] text-cyan-300" : "text-slate-500")} aria-label={id}>
              <Icon size={15} />
            </button>
          ))}
          <button type="button" onClick={() => setPreview((v) => !v)} className="ml-2 hidden h-10 items-center gap-1 rounded-md border border-white/10 px-3 text-xs text-slate-400 sm:inline-flex">
            <Eye size={13} /> {preview ? "Editar" : "Preview"}
          </button>
          <button type="button" onClick={publish} className="ml-1 h-10 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-[#070d18]">
            {saved ? "Guardado" : "Publicar"}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[220px_minmax(0,1fr)_250px]">
        <aside className="hidden overflow-y-auto border-r border-white/10 p-3 lg:block">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Bloques</div>
          <div className="space-y-1.5">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="flex w-full items-center justify-between rounded-md border border-white/10 bg-[#101B32] px-3 py-2.5 text-left hover:border-cyan-400/30">
                <span>
                  <span className="block text-xs">{BLOCK_META[type].label}</span>
                  <span className="block text-[10px] text-slate-500">{BLOCK_META[type].hint}</span>
                </span>
                <Plus size={13} className="text-slate-500" />
              </button>
            ))}
          </div>
          <div className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Páginas</div>
          {pages.map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)} className={cx("mb-1 w-full rounded-md px-3 py-2 text-left text-xs", page === p ? "bg-violet-500/20 text-violet-300" : "text-slate-400")}>
              {p}
            </button>
          ))}
        </aside>

        <div className="flex min-h-0 flex-col overflow-auto bg-[#0A1020] p-3 sm:p-6">
          <div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="shrink-0 rounded-full border border-white/10 bg-[#101B32] px-3 py-2 text-xs">
                + {BLOCK_META[type].label}
              </button>
            ))}
          </div>
          <div className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl", device === "mobile" && "w-full max-w-sm", device === "tablet" && "w-full max-w-xl", device === "desktop" && "w-full max-w-3xl")}>
            <CanvasView blocks={blocks} selected={preview ? null : selected} onSelect={(id) => { if (!preview) setSelected(id); }} />
          </div>
        </div>

        <aside className="hidden overflow-y-auto border-l border-white/10 p-3 lg:block">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspector</div>
          {!current ? (
            <p className="mt-4 text-xs leading-5 text-slate-400">Seleccioná un bloque en el canvas o agregá uno desde la izquierda.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-white/10 bg-[#101B32] p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-cyan-300">{BLOCK_META[current.type].label}</div>
                <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">Título</label>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm outline-none" value={current.title} onChange={(e) => patch({ title: e.target.value })} />
                <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">Texto</label>
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 py-2 text-sm outline-none" value={current.body} onChange={(e) => patch({ body: e.target.value })} />
                <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">CTA</label>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm outline-none" value={current.cta} onChange={(e) => patch({ cta: e.target.value })} />
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Subir"><ChevronUp size={16} /></button>
                <button type="button" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Bajar"><ChevronDown size={16} /></button>
                <button type="button" onClick={remove} className="ml-auto grid h-11 w-11 place-items-center rounded-md border border-pink-500/40 text-pink-400" aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
