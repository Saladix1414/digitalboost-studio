import "./website-builder-v2-light.css";
import "./websites-builder/websites-builder-canvas.css";
import React, { useEffect, useMemo, useState } from "react";
import type { WebDesignTokens } from "./WebsitesBuilderModel";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  GripVertical,
  Layout,
  Monitor,
  Move,
  Palette,
  Plus,
  Redo2,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";

type DeviceMode = "desktop" | "tablet" | "mobile";

type BlockType =
  | "hero"
  | "text"
  | "image"
  | "button"
  | "products"
  | "features"
  | "banner"
  | "footer";

export type BuilderBlock = {
  id: string;
  type: BlockType;
  label: string;
  text: string;
  background: string;
  color: string;
  fontSize: number;
  padding: number;
  align: "left" | "center" | "right";
  width: number;
  minHeight?: number;
  offsetX?: number;
  offsetY?: number;
  paddingX?: number;
  paddingY?: number;
  borderStyle?: "none" | "solid";
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadow?: "none" | "soft" | "glow";
  hidden?: boolean;
};

type Props = {
  onBack?: () => void;
  seedBlocks?: BuilderBlock[];
  storageKey?: string;
  studioTitle?: string;
  studioEyebrow?: string;
  backLabel?: string;
  onBlocksChange?: (blocks: BuilderBlock[]) => void;
  designTokens?: WebDesignTokens;
};

const initialBlocks: BuilderBlock[] = [
  {
    id: "hero-1",
    type: "hero",
    label: "Hero principal",
    text: "Tu tienda. Tu marca. Tu negocio.",
    background: "#071326",
    color: "#ffffff",
    fontSize: 42,
    padding: 72,
    align: "center",
    width: 100,
  },
  {
    id: "text-1",
    type: "text",
    label: "Texto",
    text: "Presentá tus productos y conectá con tus clientes desde una experiencia moderna.",
    background: "#030914",
    color: "#cbd5e1",
    fontSize: 18,
    padding: 40,
    align: "center",
    width: 100,
  },
  {
    id: "products-1",
    type: "products",
    label: "Productos",
    text: "Productos destacados",
    background: "#070b14",
    color: "#ffffff",
    fontSize: 24,
    padding: 40,
    align: "left",
    width: 100,
  },
];

type BlockCategory =
  | "All"
  | "Structure"
  | "Content"
  | "Media"
  | "Conversion";

const blockCategories: BlockCategory[] = [
  "All",
  "Structure",
  "Content",
  "Media",
  "Conversion",
];

const blockLibrary: Array<{
  type: BlockType;
  label: string;
  description: string;
  category: Exclude<BlockCategory, "All">;
  icon: React.ElementType;
}> = [
  {
    type: "hero",
    label: "Hero",
    description: "Primary introduction and value proposition",
    category: "Structure",
    icon: Layout,
  },
  {
    type: "features",
    label: "Features",
    description: "Benefits, capabilities or service pillars",
    category: "Content",
    icon: Palette,
  },
  {
    type: "text",
    label: "Editorial",
    description: "Long-form copy and supporting narrative",
    category: "Content",
    icon: Type,
  },
  {
    type: "image",
    label: "Media",
    description: "Visual asset or image-led composition",
    category: "Media",
    icon: Eye,
  },
  {
    type: "products",
    label: "Collection",
    description: "Structured visual collection or catalog",
    category: "Content",
    icon: Layout,
  },
  {
    type: "banner",
    label: "Statement",
    description: "High-impact message or announcement",
    category: "Conversion",
    icon: Layout,
  },
  {
    type: "button",
    label: "CTA",
    description: "Focused conversion action",
    category: "Conversion",
    icon: Move,
  },
  {
    type: "footer",
    label: "Footer",
    description: "Closing navigation and information",
    category: "Structure",
    icon: Layout,
  },
];

function createBlock(type: BlockType, index: number, tokens?: WebDesignTokens): BuilderBlock {
  const defaults: Record<BlockType, Partial<BuilderBlock>> = {
    hero: {
      label: "Hero",
      text: "Una experiencia digital creada con DigitalBoost.",
      fontSize: 38,
      padding: 64,
      align: "center",
      background: "#071326",
      color: "#ffffff",
    },
    text: {
      label: "Texto",
      text: "Escribí contenido para tu sitio.",
      fontSize: 18,
      padding: 32,
      align: "left",
      background: "#030914",
      color: "#cbd5e1",
    },
    image: {
      label: "Imagen",
      text: "Imagen destacada",
      fontSize: 18,
      padding: 48,
      align: "center",
      background: "#0b1220",
      color: "#ffffff",
    },
    button: {
      label: "Botón",
      text: "Comprar ahora",
      fontSize: 16,
      padding: 24,
      align: "center",
      background: "#0b1630",
      color: "#ffffff",
    },
    products: {
      label: "Productos",
      text: "Productos destacados",
      fontSize: 24,
      padding: 40,
      align: "left",
      background: "#070b14",
      color: "#ffffff",
    },
    features: {
      label: "Características",
      text: "Todo lo que tu negocio necesita.",
      fontSize: 24,
      padding: 40,
      align: "center",
      background: "#07101e",
      color: "#ffffff",
    },
    banner: {
      label: "Banner",
      text: "Oferta especial",
      fontSize: 28,
      padding: 36,
      align: "center",
      background: "#10182b",
      color: "#ffffff",
    },
    footer: {
      label: "Footer",
      text: "© Tu marca",
      fontSize: 14,
      padding: 36,
      align: "center",
      background: "#02050a",
      color: "#94a3b8",
    },
  };

  return {
    id: `${type}-${Date.now()}-${index}`,
    type,
    label: defaults[type].label || type,
    text: defaults[type].text || "",
    background: type === "button"
      ? tokens?.accent || defaults[type].background || "#070b14"
      : type === "hero"
        ? tokens?.background || defaults[type].background || "#070b14"
        : type === "footer"
          ? tokens?.foreground || defaults[type].background || "#070b14"
          : tokens?.surface || defaults[type].background || "#070b14",
    color: type === "button"
      ? tokens?.accentForeground || defaults[type].color || "#ffffff"
      : type === "footer"
        ? tokens?.background || defaults[type].color || "#ffffff"
        : tokens?.foreground || defaults[type].color || "#ffffff",
    fontSize: defaults[type].fontSize || 18,
    padding: defaults[type].padding || 32,
    align: defaults[type].align || "left",
    width: 100,
    minHeight: 0,
    offsetX: 0,
    offsetY: 0,
    paddingX: defaults[type].padding || 32,
    paddingY: defaults[type].padding || 32,
    borderStyle: "none",
    borderWidth: 1,
    borderColor: tokens?.border || "#d9e8f7",
    borderRadius: tokens?.radius || 0,
    shadow: "none",
  };
}

function getBlockStyle(block: BuilderBlock): React.CSSProperties {
  const verticalPadding = block.paddingY ?? block.padding;
  const horizontalPadding = block.paddingX ?? block.padding;
  const shadow = block.shadow === "glow"
    ? "0 0 28px rgba(33, 143, 232, .28)"
    : block.shadow === "soft"
      ? "0 12px 30px rgba(10, 30, 55, .16)"
      : undefined;

  return {
    background: block.background,
    color: block.color,
    padding: `${verticalPadding}px ${horizontalPadding}px`,
    textAlign: block.align,
    fontSize: `${block.fontSize}px`,
    width: `${block.width}%`,
    minHeight: block.minHeight ? `${block.minHeight}px` : undefined,
    transform: block.offsetX || block.offsetY
      ? `translate(${block.offsetX ?? 0}px, ${block.offsetY ?? 0}px)`
      : undefined,
    borderStyle: block.borderStyle === "solid" ? "solid" : "none",
    borderWidth: `${block.borderWidth ?? 1}px`,
    borderColor: block.borderColor ?? "#d9e8f7",
    borderRadius: `${block.borderRadius ?? 0}px`,
    boxShadow: shadow,
  };
}

export default function WebsitesBuilderCanvas({
  onBack,
  seedBlocks,
  storageKey = "digitalboost_websites_builder_canvas_v1",
  studioTitle = "Websites Builder",
  studioEyebrow = "Visual website studio",
  backLabel = "← Websites Builder",
  onBlocksChange,
  designTokens,
}: Props) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() => {
    try {
      if (seedBlocks !== undefined) return seedBlocks;
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      return initialBlocks;
    } catch {
      return seedBlocks !== undefined ? seedBlocks : initialBlocks;
    }
  });

  const [selectedId, setSelectedId] = useState<string | null>(
    blocks[0]?.id || null
  );

  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [preview, setPreview] = useState(false);
  const [inspectorOpen, setInspectorOpen] =
    useState(true);

  const [libraryQuery, setLibraryQuery] =
    useState("");

  const [libraryOpen, setLibraryOpen] =
    useState(false);

  const [
    libraryCategory,
    setLibraryCategory,
  ] = useState<BlockCategory>("All");
  const [history, setHistory] = useState<BuilderBlock[][]>([]);
  const [future, setFuture] = useState<BuilderBlock[][]>([]);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedId) || null,
    [blocks, selectedId]
  );

  const filteredLibrary = useMemo(() => {
    const query =
      libraryQuery.trim().toLowerCase();

    return blockLibrary.filter((item) => {
      const categoryMatches =
        libraryCategory === "All" ||
        item.category === libraryCategory;

      const queryMatches =
        !query ||
        item.label
          .toLowerCase()
          .includes(query) ||
        item.description
          .toLowerCase()
          .includes(query) ||
        item.category
          .toLowerCase()
          .includes(query);

      return categoryMatches && queryMatches;
    });
  }, [libraryCategory, libraryQuery]);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(blocks)
    );
    onBlocksChange?.(blocks);
  }, [blocks, storageKey, onBlocksChange]);

  const commit = (next: BuilderBlock[]) => {
    setHistory((current) => [...current.slice(-29), blocks]);
    setFuture([]);
    setBlocks(next);
  };

  const updateSelected = (patch: Partial<BuilderBlock>) => {
    if (!selectedId) return;

    commit(
      blocks.map((block) =>
        block.id === selectedId ? { ...block, ...patch } : block
      )
    );
  };

  const addBlock = (type: BlockType) => {
    const block = createBlock(type, blocks.length, designTokens);
    commit([...blocks, block]);
    setSelectedId(block.id);
  };

  const duplicateSelected = () => {
    if (!selectedBlock) return;

    const clone = {
      ...selectedBlock,
      id: `${selectedBlock.type}-${Date.now()}`,
      label: `${selectedBlock.label} copia`,
    };

    const index = blocks.findIndex((b) => b.id === selectedBlock.id);
    const next = [...blocks];
    next.splice(index + 1, 0, clone);

    commit(next);
    setSelectedId(clone.id);
  };

  const removeSelected = () => {
    if (!selectedId) return;

    const index = blocks.findIndex((b) => b.id === selectedId);
    const next = blocks.filter((b) => b.id !== selectedId);

    commit(next);

    const fallback = next[Math.max(0, index - 1)];
    setSelectedId(fallback?.id || null);
  };

  const moveSelected = (direction: -1 | 1) => {
    if (!selectedId) return;

    const index = blocks.findIndex((b) => b.id === selectedId);
    const target = index + direction;

    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];

    commit(next);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;

    setFuture((current) => [...current, blocks]);
    setBlocks(previous);
    setHistory((current) => current.slice(0, -1));

    if (!previous.some((b) => b.id === selectedId)) {
      setSelectedId(previous[0]?.id || null);
    }
  };

  const redo = () => {
    const next = future[future.length - 1];
    if (!next) return;

    setHistory((current) => [...current, blocks]);
    setBlocks(next);
    setFuture((current) => current.slice(0, -1));
  };

  const canvasWidth =
    device === "desktop"
      ? "w-full"
      : device === "tablet"
      ? "w-[768px] max-w-full"
      : "w-[390px] max-w-full";

  if (preview) {
    return (
      <div data-websites-builder-canvas className="db-canvas-preview min-h-screen">
        <div className="db-preview-toolbar sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 backdrop-blur">
          <div className="text-sm font-semibold">Preview del sitio</div>

          <button
            type="button"
            onClick={() => setPreview(false)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
          >
            <X size={14} />
            Volver al editor
          </button>
        </div>

        <div className="db-canvas-preview-frame" style={{ maxWidth: designTokens?.container ? `${designTokens.container}px` : undefined }}>
          {blocks.filter(function (block) { return !(block && block.hidden); }).map((block) => (
            <div
              key={block.id}
              style={getBlockStyle(block)}
            >
              {block.type === "image" ? (
                <div className="mx-auto flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[.03] text-sm text-slate-500">
                  {block.text}
                </div>
              ) : block.type === "button" ? (
                <button className="db-site-cta rounded-xl px-6 py-3 text-sm font-semibold">
                  {block.text}
                </button>
              ) : (
                block.text
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-websites-builder-canvas className="db-canvas-studio flex min-h-[calc(100vh-100px)] flex-col overflow-hidden">
      {/* TOP BAR */}
      <header className="db-canvas-toolbar flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5"
            >
              {backLabel}
            </button>
          )}

          <div>
            <div className="text-sm font-semibold">{studioTitle}</div>
            <div className="db-canvas-eyebrow text-[10px] uppercase tracking-[.18em]">
              {studioEyebrow}
            </div>
          </div>
        </div>

        <div className="db-toolbar-cluster flex items-center gap-1 rounded-xl p-1">
          <button
            type="button"
            title="Deshacer"
            onClick={undo}
            disabled={!history.length}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 disabled:opacity-30"
          >
            <Undo2 size={16} />
          </button>

          <button
            type="button"
            title="Rehacer"
            onClick={redo}
            disabled={!future.length}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 disabled:opacity-30"
          >
            <Redo2 size={16} />
          </button>

          <div className="mx-1 h-5 w-px bg-white/10" />

          {(
            [
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as const
          ).map(([mode, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDevice(mode)}
              className={`rounded-lg p-2 ${
                device === mode
                  ? "db-canvas-device-active"
                  : "text-slate-500 hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}

          <div className="mx-1 h-5 w-px bg-white/10" />

          <button
            type="button"
            onClick={() =>
              setInspectorOpen(
                (current) => !current
              )
            }
            className={`db-inspector-toggle flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              inspectorOpen
                ? "db-canvas-device-active"
                : ""
            }`}
            aria-pressed={inspectorOpen}
          >
            <Settings2 size={14} />
            Inspector
          </button>

          <button
            type="button"
            onClick={() => setPreview(true)}
            className="db-canvas-preview-button flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
          >
            <Eye size={14} />
            Preview
          </button>
        </div>
      </header>

      {/* MAIN EDITOR */}
      <div className="db-editor-grid grid min-h-0 flex-1">
        {/* SECTION LIBRARY */}
        <aside className="db-canvas-library db-left-tools border-b p-3">
          <div className="db-library-compact">
            <button
              type="button"
              className="db-library-trigger"
              data-open={libraryOpen}
              onClick={() =>
                setLibraryOpen(
                  (current) => !current
                )
              }
              aria-expanded={libraryOpen}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="db-canvas-icon grid h-8 w-8 flex-none place-items-center rounded-lg">
                  <Plus size={14} />
                </span>

                <span className="min-w-0 text-left">
                  <span className="block text-[11px] font-semibold">
                    Add section
                  </span>

                  <span className="mt-0.5 block truncate text-[9px] text-slate-500">
                    Browse structured website sections
                  </span>
                </span>
              </span>

              <span className="flex items-center gap-2">
                <span className="db-library-count">
                  {filteredLibrary.length}
                </span>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    libraryOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </span>
            </button>

            {libraryOpen && (
              <div className="db-library-dropdown">
                <div className="db-library-search">
                  <input
                    type="search"
                    value={libraryQuery}
                    onChange={(event) =>
                      setLibraryQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search sections..."
                    aria-label="Search sections"
                    autoFocus
                  />
                </div>

                <div className="db-library-categories">
                  {blockCategories.map(
                    (category) => (
                      <button
                        key={category}
                        type="button"
                        data-active={
                          libraryCategory ===
                          category
                        }
                        onClick={() =>
                          setLibraryCategory(
                            category
                          )
                        }
                      >
                        {category}
                      </button>
                    )
                  )}
                </div>

                <div className="db-library-results">
                  {filteredLibrary.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <button
                          key={item.type}
                          type="button"
                          data-section={
                            item.type
                          }
                          onClick={() => {
                            addBlock(
                              item.type
                            );
                            setLibraryOpen(
                              false
                            );
                          }}
                          className="db-section-card group w-full text-left"
                        >
                          <div
                            className="db-section-preview"
                            data-section={
                              item.type
                            }
                          >
                            <span />
                            <span />
                            <span />
                            <span />
                          </div>

                          <div className="mt-2 flex items-start gap-2">
                            <span className="db-canvas-icon rounded-lg p-2">
                              <Icon
                                size={13}
                              />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold">
                                  {
                                    item.label
                                  }
                                </span>

                                <span className="db-section-category">
                                  {
                                    item.category
                                  }
                                </span>
                              </span>

                              <span className="mt-1 block text-[8px] leading-relaxed text-slate-500">
                                {
                                  item.description
                                }
                              </span>
                            </span>

                            <Plus
                              size={13}
                              className="mt-1 text-slate-600 transition group-hover:text-[#e8ff2f]"
                            />
                          </div>
                        </button>
                      );
                    }
                  )}

                  {!filteredLibrary.length && (
                    <div className="db-library-empty">
                      No sections match this filter.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CANVAS */}
        <main className="db-canvas-stage relative min-h-[600px] overflow-auto p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.05),transparent_40%)]" />

          <div className="relative mx-auto flex min-h-[700px] justify-center">
            <div
              className={`${canvasWidth} db-canvas-artboard min-h-[700px] overflow-hidden transition-all`}
              style={{ maxWidth: designTokens?.container ? `${designTokens.container}px` : undefined, borderRadius: designTokens?.radius ? `${designTokens.radius}px` : undefined }}
            >
              {blocks.map((block, index) => {
                const selected = selectedId === block.id;

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedId(block.id)}
                    style={getBlockStyle(block)}
                    className={`db-canvas-block group relative cursor-pointer border transition ${
                      selected
                        ? ""
                        : "border-transparent"
                    }`}
                    data-selected={selected}
                  >
                    {selected && (
                      <div className="db-canvas-label absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] backdrop-blur">
                        <Move size={10} />
                        {block.label}
                      </div>
                    )}

                    <div className="mx-auto max-w-4xl">
                      {block.type === "image" ? (
                        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[.03] text-xs text-slate-500">
                          {block.text}
                        </div>
                      ) : block.type === "button" ? (
                        <button
                          type="button"
                          className="db-site-cta rounded-xl px-6 py-3 text-sm font-semibold"
                        >
                          {block.text}
                        </button>
                      ) : (
                        <div
                          className={
                            block.type === "hero"
                              ? "font-bold tracking-tight"
                              : ""
                          }
                        >
                          {block.text}
                        </div>
                      )}
                    </div>

                    {selected && (
                      <div className="db-canvas-actionbar absolute bottom-2 right-2 flex items-center gap-1 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            moveSelected(-1);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-white/10"
                        >
                          <ChevronUp size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            moveSelected(1);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-white/10"
                        >
                          <ChevronDown size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            duplicateSelected();
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-white/10"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeSelected();
                          }}
                          className="rounded p-1 text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}

                    <div className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 opacity-0 transition group-hover:opacity-100">
                      <GripVertical size={14} className="text-[#e8ff2f]" />
                    </div>

                    {index === 0 && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#e8ff2f]/20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* INSPECTOR */}
        {inspectorOpen && (
        <aside className="db-canvas-inspector db-right-inspector overflow-y-auto p-4">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold">
                Inspector
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                Propiedades del elemento seleccionado
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setInspectorOpen(false)
              }
              className="db-inspector-close"
              title="Cerrar Inspector"
              aria-label="Cerrar Inspector"
            >
              <X size={14} />
            </button>
          </div>

          {!selectedBlock ? (
            <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
              Seleccioná un bloque del canvas.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="db-canvas-inspector-card rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-[#e8ff2f]">
                  Elemento
                </div>
                <input
                  aria-label="Nombre de la sección"
                  value={selectedBlock.label}
                  onChange={(event) => updateSelected({ label: event.target.value })}
                  className="db-canvas-control mt-2 w-full rounded-lg px-2 py-2 text-xs"
                />
                <label className="mt-3 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                  <span>Visible en la web</span>
                  <input
                    type="checkbox"
                    checked={!selectedBlock.hidden}
                    onChange={(event) => updateSelected({ hidden: !event.target.checked })}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Texto
                </span>
                <textarea
                  value={selectedBlock.text}
                  onChange={(event) =>
                    updateSelected({ text: event.target.value })
                  }
                  rows={4}
                  className="db-canvas-control w-full resize-none rounded-xl px-3 py-2 text-xs"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Alto mínimo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedBlock.minHeight ? `${selectedBlock.minHeight}px` : "Auto"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="20"
                  value={selectedBlock.minHeight ?? 0}
                  onChange={(event) => updateSelected({ minHeight: Number(event.target.value) })}
                  className="w-full"
                />
              </label>

              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Posición · desplazamiento
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[9px] text-slate-500">
                    X · {selectedBlock.offsetX ?? 0}px
                    <input
                      type="range"
                      min="-160"
                      max="160"
                      value={selectedBlock.offsetX ?? 0}
                      onChange={(event) => updateSelected({ offsetX: Number(event.target.value) })}
                      className="mt-2 w-full"
                    />
                  </label>
                  <label className="text-[9px] text-slate-500">
                    Y · {selectedBlock.offsetY ?? 0}px
                    <input
                      type="range"
                      min="-160"
                      max="160"
                      value={selectedBlock.offsetY ?? 0}
                      onChange={(event) => updateSelected({ offsetY: Number(event.target.value) })}
                      className="mt-2 w-full"
                    />
                  </label>
                </div>
              </div>

              <label className="block">
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Tamaño
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedBlock.fontSize}px
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="72"
                  value={selectedBlock.fontSize}
                  onChange={(event) =>
                    updateSelected({
                      fontSize: Number(event.target.value),
                    })
                  }
                  className="w-full"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-[9px] text-slate-500">
                  Padding vertical · {selectedBlock.paddingY ?? selectedBlock.padding}px
                  <input
                    type="range"
                    min="8"
                    max="160"
                    value={selectedBlock.paddingY ?? selectedBlock.padding}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateSelected({ paddingY: value, padding: value });
                    }}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block text-[9px] text-slate-500">
                  Padding horizontal · {selectedBlock.paddingX ?? selectedBlock.padding}px
                  <input
                    type="range"
                    min="8"
                    max="160"
                    value={selectedBlock.paddingX ?? selectedBlock.padding}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      updateSelected({ paddingX: value, padding: value });
                    }}
                    className="mt-2 w-full"
                  />
                </label>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Alineación
                </div>

                <div className="db-toolbar-cluster grid grid-cols-3 gap-1 rounded-xl p-1">
                  {(
                    [
                      ["left", AlignLeft],
                      ["center", AlignCenter],
                      ["right", AlignRight],
                    ] as const
                  ).map(([align, Icon]) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateSelected({ align })}
                      className={`flex justify-center rounded-lg p-2 ${
                        selectedBlock.align === align
                          ? "db-canvas-device-active"
                          : "text-slate-500 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Ancho
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedBlock.width}%
                  </span>
                </div>

                <input
                  type="range"
                  min="40"
                  max="100"
                  value={selectedBlock.width}
                  onChange={(event) =>
                    updateSelected({
                      width: Number(event.target.value),
                    })
                  }
                  className="w-full"
                />
              </label>

              <section className="space-y-3 rounded-xl border border-white/10 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Borde
                </div>
                <label className="block text-[9px] text-slate-500">
                  Estilo
                  <select
                    value={selectedBlock.borderStyle ?? "none"}
                    onChange={(event) => updateSelected({ borderStyle: event.target.value as "none" | "solid" })}
                    className="db-canvas-control mt-1 w-full rounded-lg px-2 py-2 text-xs"
                  >
                    <option value="none">Sin borde</option>
                    <option value="solid">Sólido</option>
                  </select>
                </label>
                <label className="block text-[9px] text-slate-500">
                  Color · {selectedBlock.borderColor ?? "#d9e8f7"}
                  <input
                    type="color"
                    value={selectedBlock.borderColor ?? "#d9e8f7"}
                    onChange={(event) => updateSelected({ borderColor: event.target.value })}
                    className="db-canvas-control mt-1 h-9 w-full rounded-lg p-1"
                  />
                </label>
                <label className="block text-[9px] text-slate-500">
                  Grosor · {selectedBlock.borderWidth ?? 1}px
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={selectedBlock.borderWidth ?? 1}
                    onChange={(event) => updateSelected({ borderWidth: Number(event.target.value) })}
                    className="mt-2 w-full"
                  />
                </label>
                <label className="block text-[9px] text-slate-500">
                  Radio · {selectedBlock.borderRadius ?? 0}px
                  <input
                    type="range"
                    min="0"
                    max="64"
                    value={selectedBlock.borderRadius ?? 0}
                    onChange={(event) => updateSelected({ borderRadius: Number(event.target.value) })}
                    className="mt-2 w-full"
                  />
                </label>
              </section>

              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Efecto
                <select
                  value={selectedBlock.shadow ?? "none"}
                  onChange={(event) => updateSelected({ shadow: event.target.value as "none" | "soft" | "glow" })}
                  className="db-canvas-control mt-2 w-full rounded-lg px-2 py-2 text-xs normal-case"
                >
                  <option value="none">Sin efecto</option>
                  <option value="soft">Sombra suave</option>
                  <option value="glow">Resplandor</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Fondo
                </span>
                <input
                  type="text"
                  value={selectedBlock.background}
                  onChange={(event) =>
                    updateSelected({
                      background: event.target.value,
                    })
                  }
                  className="db-canvas-control w-full rounded-xl px-3 py-2 text-xs"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Color
                </span>
                <input
                  type="text"
                  value={selectedBlock.color}
                  onChange={(event) =>
                    updateSelected({
                      color: event.target.value,
                    })
                  }
                  className="db-canvas-control w-full rounded-xl px-3 py-2 text-xs"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  localStorage.setItem(
                    storageKey,
                    JSON.stringify(blocks)
                  )
                }
                className="db-canvas-save flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold"
              >
                <Save size={14} />
                Guardar sitio
              </button>
            </div>
          )}
        </aside>
        )}
      </div>
    </div>
  );
}
