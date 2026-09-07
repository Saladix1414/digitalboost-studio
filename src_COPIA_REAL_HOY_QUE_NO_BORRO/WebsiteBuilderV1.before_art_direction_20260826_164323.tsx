import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Columns3,
  Copy,
  Eye,
  Globe2,
  GripVertical,
  Image,
  LayoutTemplate,
  Monitor,
  MousePointer2,
  Palette,
  PanelLeft,
  PanelRight,
  Plus,
  Redo2,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Type,
  Undo2,
  WandSparkles,
  Zap,
} from "lucide-react";

type DeviceMode = "desktop" | "tablet" | "mobile";

type BlockType =
  | "hero"
  | "text"
  | "image"
  | "features"
  | "products"
  | "cta"
  | "footer";

type BuilderBlock = {
  id: string;
  type: BlockType;
  title: string;
  visible: boolean;
};

type WebsiteBuilderV1Props = {
  onBack?: () => void;
};

const initialBlocks: BuilderBlock[] = [
  {
    id: "hero-1",
    type: "hero",
    title: "Hero principal",
    visible: true,
  },
  {
    id: "features-1",
    type: "features",
    title: "Beneficios",
    visible: true,
  },
  {
    id: "products-1",
    type: "products",
    title: "Productos destacados",
    visible: true,
  },
  {
    id: "cta-1",
    type: "cta",
    title: "Llamada a la acción",
    visible: true,
  },
  {
    id: "footer-1",
    type: "footer",
    title: "Footer",
    visible: true,
  },
];

const blockCatalog: Array<{
  type: BlockType;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    type: "hero",
    title: "Hero",
    description: "Presentación principal",
    icon: LayoutTemplate,
  },
  {
    type: "text",
    title: "Texto",
    description: "Título y contenido",
    icon: Type,
  },
  {
    type: "image",
    title: "Imagen",
    description: "Imagen destacada",
    icon: Image,
  },
  {
    type: "features",
    title: "Beneficios",
    description: "Características y ventajas",
    icon: Columns3,
  },
  {
    type: "products",
    title: "Productos",
    description: "Catálogo destacado",
    icon: Globe2,
  },
  {
    type: "cta",
    title: "CTA",
    description: "Conversión y acción",
    icon: Zap,
  },
  {
    type: "footer",
    title: "Footer",
    description: "Pie de página",
    icon: PanelLeft,
  },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function WebsiteBuilderV1({
  onBack,
}: WebsiteBuilderV1Props) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [blocks, setBlocks] = useState<BuilderBlock[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState("hero-1");
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<BuilderBlock[][]>([]);
  const [future, setFuture] = useState<BuilderBlock[][]>([]);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const selected = useMemo(
    () => blocks.find((block) => block.id === selectedId) ?? null,
    [blocks, selectedId]
  );

  const commit = (next: BuilderBlock[]) => {
    setHistory((current) => [...current.slice(-19), blocks]);
    setFuture([]);
    setBlocks(next);
  };

  const addBlock = (type: BlockType) => {
    const catalog = blockCatalog.find((item) => item.type === type);

    const block: BuilderBlock = {
      id: uid(type),
      type,
      title: catalog?.title ?? "Nuevo bloque",
      visible: true,
    };

    commit([...blocks, block]);
    setSelectedId(block.id);
  };

  const duplicateBlock = () => {
    if (!selected) return;

    const clone: BuilderBlock = {
      ...selected,
      id: uid(selected.type),
      title: `${selected.title} copia`,
    };

    const index = blocks.findIndex((block) => block.id === selected.id);
    const next = [...blocks];
    next.splice(index + 1, 0, clone);

    commit(next);
    setSelectedId(clone.id);
  };

  const deleteBlock = () => {
    if (!selected) return;

    const index = blocks.findIndex((block) => block.id === selected.id);
    const next = blocks.filter((block) => block.id !== selected.id);

    commit(next);

    const replacement = next[index] ?? next[index - 1] ?? null;
    setSelectedId(replacement?.id ?? "");
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;

    setFuture((current) => [...current, blocks]);
    setBlocks(previous);
    setHistory((current) => current.slice(0, -1));

    const nextSelected = previous.find((block) => block.id === selectedId);
    setSelectedId(nextSelected?.id ?? previous[0]?.id ?? "");
  };

  const redo = () => {
    const next = future[future.length - 1];
    if (!next) return;

    setHistory((current) => [...current, blocks]);
    setBlocks(next);
    setFuture((current) => current.slice(0, -1));

    const nextSelected = next.find((block) => block.id === selectedId);
    setSelectedId(nextSelected?.id ?? next[0]?.id ?? "");
  };

  const save = () => {
    localStorage.setItem(
      "digitalboost_website_builder_v1",
      JSON.stringify(blocks)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  const width =
    device === "desktop"
      ? "min(100%, 980px)"
      : device === "tablet"
        ? "min(100%, 680px)"
        : "min(100%, 390px)";

  return (
    <div className="min-h-[720px] overflow-hidden rounded-2xl border border-white/[.08] bg-[#020711] text-white shadow-2xl">
      {/* APPLICATION TOP BAR */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.09] bg-[#050a13]/95 px-3 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.11] bg-white/[.03] text-slate-400 transition hover:border-cyan-400/30 hover:text-white"
            title="Volver"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-200">
              <WandSparkles size={17} />
            </div>

            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">
                Website Builder
              </div>
              <div className="hidden text-[10px] text-slate-400 sm:block">
                DigitalBoost Studio
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-1 rounded-xl border border-white/[0.09] bg-white/[0.025] p-1 md:flex">
          {[
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ].map(([value, Icon]) => {
            const mode = value as DeviceMode;
            const IconComponent = Icon as React.ElementType;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setDevice(mode)}
                className={`flex h-8 items-center gap-2 rounded-lg px-3 text-[11px] transition ${
                  device === mode
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <IconComponent size={14} />
                <span className="hidden lg:block capitalize">
                  {value}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!history.length}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30 sm:flex"
            title="Deshacer"
          >
            <Undo2 size={16} />
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!future.length}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30 sm:flex"
            title="Rehacer"
          >
            <Redo2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => setPreview((value) => !value)}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs transition ${
              preview
                ? "border-cyan-400/30 bg-cyan-400/[0.12] text-cyan-200"
                : "border-white/[0.11] bg-white/[.03] text-slate-400 hover:text-white"
            }`}
          >
            <Eye size={15} />
            <span className="hidden sm:inline">
              {preview ? "Editor" : "Preview"}
            </span>
          </button>

          <button
            type="button"
            onClick={save}
            className="flex h-9 items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/[0.13] px-3 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/[0.24]"
          >
            <Save size={15} />
            <span className="hidden sm:inline">
              {saved ? "Guardado" : "Guardar"}
            </span>
          </button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex min-h-[650px]">
        {/* LEFT PANEL */}
        {!preview && showLeft && (
          <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.09] bg-[#040912] lg:block">
            <div className="flex h-12 items-center justify-between border-b border-white/[0.08] px-4">
              <div className="text-[11px] font-semibold uppercase tracking-[.15em] text-slate-400">
                Elementos
              </div>

              <button
                type="button"
                onClick={() => setShowLeft(false)}
                className="text-slate-500 hover:text-white"
              >
                <PanelLeft size={15} />
              </button>
            </div>

            <div className="space-y-2 p-3">
              <div className="mb-4 rounded-xl border border-cyan-400/30 bg-cyan-400/[.035] p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-200">
                  <Sparkles size={13} />
                  Constructor visual
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                  Construí tu web agregando secciones desde este panel.
                </p>
              </div>

              {blockCatalog.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addBlock(item.type)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[.015] p-3 text-left transition hover:border-cyan-400/30 hover:bg-white/[.035]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[.03] text-slate-400 transition group-hover:text-cyan-200">
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-200">
                        {item.title}
                      </div>
                      <div className="mt-0.5 truncate text-[10px] text-slate-500">
                        {item.description}
                      </div>
                    </div>

                    <Plus
                      size={14}
                      className="text-slate-700 transition group-hover:text-cyan-200"
                    />
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* CANVAS */}
        <main className="relative min-w-0 flex-1 bg-[#080d16]">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative flex h-full flex-col">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#070c15]/80 px-3 sm:px-5">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Globe2 size={13} className="text-cyan-300" />
                <span>Mi sitio</span>
                <ChevronRight size={12} />
                <span className="text-slate-300">
                  Página principal
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!showLeft && !preview && (
                  <button
                    type="button"
                    onClick={() => setShowLeft(true)}
                    className="text-slate-400 hover:text-white lg:hidden"
                  >
                    <PanelLeft size={16} />
                  </button>
                )}

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1 text-[9px] font-medium text-emerald-400">
                  LIVE EDITOR
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8">
              <div
                className="mx-auto overflow-hidden rounded-xl border border-white/[0.11] bg-white shadow-2xl transition-all duration-300"
                style={{ width }}
              >
                {/* WEBSITE PREVIEW */}
                <div className="min-h-[600px] bg-[#0a1020] text-white">
                  {blocks
                    .filter((block) => block.visible)
                    .map((block, index) => {
                      const isSelected =
                        selectedId === block.id && !preview;

                      return (
                        <section
                          key={block.id}
                          onClick={() => !preview && setSelectedId(block.id)}
                          className={`relative cursor-pointer transition ${
                            isSelected
                              ? "ring-2 ring-inset ring-cyan-400/70"
                              : "hover:ring-1 hover:ring-inset hover:ring-cyan-400/30"
                          }`}
                        >
                          {!preview && (
                            <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-md border border-white/[0.11] bg-black/70 px-2 py-1 text-[9px] text-slate-300 opacity-0 backdrop-blur group-hover:opacity-100">
                              <GripVertical size={11} />
                              {block.title}
                            </div>
                          )}

                          {block.type === "hero" && (
                            <div className="relative flex min-h-[310px] items-center overflow-hidden bg-gradient-to-br from-[#111c3d] via-[#11142c] to-[#190d2c] px-8 py-12 sm:px-12">
                              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
                              <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/[0.24] blur-3xl" />

                              <div className="relative max-w-xl">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-semibold text-cyan-200">
                                  <Sparkles size={11} />
                                  TU MARCA
                                </div>

                                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                                  Una tienda que
                                  <span className="block bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                                    trabaja por vos.
                                  </span>
                                </h1>

                                <p className="mt-4 max-w-md text-xs leading-6 text-slate-300 sm:text-sm">
                                  Diseñá experiencias digitales modernas y
                                  convertí visitantes en clientes desde
                                  DigitalBoost.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-slate-950"
                                  >
                                    Comprar ahora
                                  </button>

                                  <button
                                    type="button"
                                    className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-semibold text-white"
                                  >
                                    Conocer más
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === "text" && (
                            <div className="bg-white px-8 py-12 text-slate-900 sm:px-14">
                              <div className="mx-auto max-w-2xl text-center">
                                <div className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-600">
                                  Nuestra propuesta
                                </div>
                                <h2 className="mt-3 text-2xl font-black">
                                  Todo lo que necesitás, en un solo lugar.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                  Una sección completamente editable desde el
                                  constructor visual.
                                </p>
                              </div>
                            </div>
                          )}

                          {block.type === "image" && (
                            <div className="flex min-h-[240px] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                              <div className="text-center text-slate-400">
                                <Image size={42} className="mx-auto mb-3" />
                                <div className="text-xs">
                                  Imagen destacada
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === "features" && (
                            <div className="bg-[#f8fafc] px-6 py-12 text-slate-900 sm:px-10">
                              <div className="mx-auto max-w-3xl">
                                <div className="text-center">
                                  <div className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-600">
                                    Beneficios
                                  </div>
                                  <h2 className="mt-2 text-2xl font-black">
                                    Pensado para vender más.
                                  </h2>
                                </div>

                                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                  {[
                                    ["01", "Simple"],
                                    ["02", "Rápido"],
                                    ["03", "Potente"],
                                  ].map(([number, title]) => (
                                    <div
                                      key={number}
                                      className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                      <div className="text-xs font-bold text-cyan-600">
                                        {number}
                                      </div>
                                      <div className="mt-3 text-sm font-bold">
                                        {title}
                                      </div>
                                      <p className="mt-1 text-[10px] leading-4 text-slate-400">
                                        Experiencia creada con DigitalBoost.
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === "products" && (
                            <div className="bg-white px-6 py-12 text-slate-900 sm:px-10">
                              <div className="mx-auto max-w-3xl">
                                <div className="flex items-end justify-between">
                                  <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-600">
                                      Catálogo
                                    </div>
                                    <h2 className="mt-2 text-2xl font-black">
                                      Productos destacados
                                    </h2>
                                  </div>

                                  <button
                                    type="button"
                                    className="text-[10px] font-bold text-cyan-600"
                                  >
                                    Ver todos
                                  </button>
                                </div>

                                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  {[1, 2, 3].map((item) => (
                                    <div key={item}>
                                      <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
                                      <div className="mt-2 text-xs font-bold">
                                        Producto {item}
                                      </div>
                                      <div className="mt-1 text-[10px] text-slate-400">
                                        $24.990
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === "cta" && (
                            <div className="bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-12 text-center">
                              <h2 className="text-2xl font-black">
                                Tu próximo cliente está acá.
                              </h2>
                              <p className="mx-auto mt-2 max-w-md text-xs text-white/75">
                                Convertí tráfico en ventas con una experiencia
                                diseñada para tu negocio.
                              </p>
                              <button
                                type="button"
                                className="mt-5 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-slate-950"
                              >
                                Empezar ahora
                              </button>
                            </div>
                          )}

                          {block.type === "footer" && (
                            <footer className="bg-[#050914] px-8 py-10 text-center">
                              <div className="text-sm font-bold">
                                TU MARCA
                              </div>
                              <div className="mt-2 text-[10px] text-slate-400">
                                Creado con DigitalBoost Studio
                              </div>
                            </footer>
                          )}

                          {!preview && isSelected && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-cyan-400" />
                          )}

                          {!preview && index === 0 && (
                            <div className="absolute left-3 top-3 z-30 flex items-center gap-1 rounded-md border border-cyan-400/30 bg-[#06111d]/90 px-2 py-1 text-[9px] font-medium text-cyan-200 shadow-xl">
                              <MousePointer2 size={10} />
                              {block.title}
                            </div>
                          )}
                        </section>
                      );
                    })}

                  {blocks.length === 0 && (
                    <div className="flex min-h-[600px] items-center justify-center bg-[#0a1020]">
                      <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200">
                          <Plus size={22} />
                        </div>
                        <div className="mt-4 text-sm font-semibold">
                          Tu página está vacía
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Agregá un bloque desde el panel izquierdo.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT INSPECTOR */}
        {!preview && showRight && (
          <aside className="hidden w-[260px] shrink-0 border-l border-white/[0.09] bg-[#040912] xl:block">
            <div className="flex h-12 items-center justify-between border-b border-white/[0.08] px-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.15em] text-slate-400">
                <PanelRight size={14} />
                Inspector
              </div>

              <button
                type="button"
                onClick={() => setShowRight(false)}
                className="text-slate-500 hover:text-white"
              >
                <PanelRight size={15} />
              </button>
            </div>

            <div className="p-4">
              {selected ? (
                <>
                  <div className="rounded-xl border border-violet-400/25 bg-violet-400/[.04] p-4">
                    <div className="text-[9px] font-semibold uppercase tracking-[.18em] text-violet-200">
                      Elemento seleccionado
                    </div>

                    <div className="mt-2 text-sm font-semibold text-white">
                      {selected.title}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400">
                      {selected.type}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400">
                      Acciones
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={duplicateBlock}
                        className="flex w-full items-center gap-3 rounded-lg border border-white/[0.09] bg-white/[.02] px-3 py-2.5 text-left text-xs text-slate-400 transition hover:border-cyan-400/30 hover:text-white"
                      >
                        <Copy size={14} />
                        Duplicar sección
                      </button>

                      <button
                        type="button"
                        onClick={deleteBlock}
                        className="flex w-full items-center gap-3 rounded-lg border border-red-400/10 bg-red-400/[.02] px-3 py-2.5 text-left text-xs text-red-300 transition hover:bg-red-400/[.06]"
                      >
                        <Trash2 size={14} />
                        Eliminar sección
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/[0.08] pt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-[.15em] text-slate-400">
                        Propiedades
                      </div>
                      <Palette size={14} className="text-slate-500" />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500">
                          Nombre
                        </label>

                        <input
                          value={selected.title}
                          onChange={(event) => {
                            const value = event.target.value;

                            commit(
                              blocks.map((block) =>
                                block.id === selected.id
                                  ? { ...block, title: value }
                                  : block
                              )
                            );
                          }}
                          className="mt-1.5 w-full rounded-lg border border-white/[.08] bg-white/[0.025] px-3 py-2 text-xs text-white outline-none transition focus:border-cyan-400/30"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500">
                          Estado
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            commit(
                              blocks.map((block) =>
                                block.id === selected.id
                                  ? {
                                      ...block,
                                      visible: !block.visible,
                                    }
                                  : block
                              )
                            );
                          }}
                          className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-white/[.08] bg-white/[0.025] px-3 py-2 text-xs"
                        >
                          <span className="text-slate-400">
                            Visibilidad
                          </span>
                          <span
                            className={
                              selected.visible
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }
                          >
                            {selected.visible ? "Visible" : "Oculto"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <MousePointer2
                    size={24}
                    className="mx-auto text-slate-700"
                  />
                  <p className="mt-3 text-xs text-slate-400">
                    Seleccioná una sección para editarla.
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* BOTTOM STATUS */}
      <div className="flex h-9 items-center justify-between border-t border-white/[0.08] bg-[#030710] px-4 text-[9px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Sistema listo
          </span>

          <span className="hidden sm:inline">
            {blocks.length} secciones
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>DigitalBoost Engine</span>
          <span>V1</span>
        </div>
      </div>
    </div>
  );
}
