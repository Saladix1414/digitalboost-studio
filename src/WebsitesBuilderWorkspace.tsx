import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,} from "react";

import {
  CheckCircle2,
  CircleAlert,
  FileText,
  LayoutGrid,
  Loader2,
  Monitor,
  Palette,
  Search,
  Settings2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import WebsitesBuilderCanvas from "./WebsitesBuilderCanvas";

import "./websites-builder/websites-builder.css";
import "./websites-builder/sky-workshop-theme.css";

import {
  WEB_DESIGN_LANGUAGES,
  briefToBuilderBlocks,
  createDesignTokens,
  createFallbackBrief,
  normalizeBrief,
  verifyWebsitesBuilderProject,
  type WebsitesBuilderBrief,
  type WebsitesBuilderKind,
  type WebCanvasBlockSeed,
  type WebDesignLanguage,
  type WebDesignTokens,
  createWebsiteProjectFromBrief,
  getWebsiteHomePage,
  updateWebsiteProjectFromCanvas,
  updateWebsitePageSeo,
  websiteProjectToCanvasBlocks,
  type WebsiteProject,} from "./WebsitesBuilderModel";

type SkyIslandPosition = { x: number; y: number };
type SkyIslandDragStart = { pointerId: number; clientX: number; clientY: number; x: number; y: number };

type SkyDraggableIslandProps = {
  src: string;
  label: string;
  initial: SkyIslandPosition;
  width: number;
};

function SkyDraggableIsland({ src, label, initial, width }: SkyDraggableIslandProps) {
  const [position, setPosition] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<SkyIslandDragStart | null>(null);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: position.x, y: position.y };
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    const stage = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!start || start.pointerId !== event.pointerId || !stage || stage.width <= 0 || stage.height <= 0) return;
    const island = event.currentTarget.getBoundingClientRect();
    const maxX = Math.max(0, 100 - island.width / stage.width * 100);
    const maxY = Math.max(0, 100 - island.height / stage.height * 100);
    setPosition({
      x: Math.max(0, Math.min(maxX, start.x + (event.clientX - start.clientX) / stage.width * 100)),
      y: Math.max(0, Math.min(maxY, start.y + (event.clientY - start.clientY) / stage.height * 100)),
    });
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
    setDragging(false);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 5 : 1;
    const delta = { x: 0, y: 0 };
    if (event.key === "ArrowLeft") delta.x = -step;
    else if (event.key === "ArrowRight") delta.x = step;
    else if (event.key === "ArrowUp") delta.y = -step;
    else if (event.key === "ArrowDown") delta.y = step;
    else return;
    event.preventDefault();
    const stage = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!stage || stage.width <= 0 || stage.height <= 0) return;
    const island = event.currentTarget.getBoundingClientRect();
    const maxX = Math.max(0, 100 - island.width / stage.width * 100);
    const maxY = Math.max(0, 100 - island.height / stage.height * 100);
    setPosition((current) => ({ x: Math.max(0, Math.min(maxX, current.x + delta.x)), y: Math.max(0, Math.min(maxY, current.y + delta.y)) }));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label}. Arrastrá por todo el canvas; también podés usar las flechas.`}
      title="Arrastrá esta isla por todo el canvas"
      data-dragging={dragging}
      className="db-floating-island"
      style={{ left: `${position.x}%`, top: `${position.y}%`, width: `${width}%`, zIndex: dragging ? 40 : 21 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <img src={src} alt="" draggable={false} />
    </div>
  );
}

type Props = {
  onBack?: () => void;
  initialKind?: WebsitesBuilderKind;
};

type Proposal = {
  brief: WebsitesBuilderBrief;
  tokens: WebDesignTokens;
  source: "AI" | "FALLBACK";
};

const PROJECT_KEY =
  "digitalboost_websites_builder_project_v1";

const CANVAS_KEY =
  "digitalboost_websites_builder_canvas_v1";

const MODEL_KEY =
  "digitalboost_websites_builder_model_v1";

const railItems = [
  ["build", LayoutGrid, "Build"],
  ["pages", FileText, "Pages"],
  ["styles", Palette, "Styles"],
  ["seo", Search, "SEO"],
  ["settings", Settings2, "Setup"],
] as const;

type RailTool =
  (typeof railItems)[number][0];

export default function WebsitesBuilderWorkspace({
  onBack,
  initialKind = "web",
}: Props) {
  const [kind, setKind] =
    useState<WebsitesBuilderKind>(
      initialKind
    );

  const [activeTool, setActiveTool] =
    useState<RailTool>("build");

  const [prompt, setPrompt] =
    useState("");

  const [language, setLanguage] =
    useState<WebDesignLanguage>(
      "Soft Precision"
    );

  const [proposal, setProposal] =
    useState<Proposal | null>(null);

  const [applied, setApplied] =
    useState<Proposal | null>(() => {
      try {
        const raw =
          localStorage.getItem(
            PROJECT_KEY
          );

        return raw
          ? JSON.parse(raw)
          : null;
      } catch {
        return null;
      }
    });

  const [websiteProject, setWebsiteProject] =
    useState<WebsiteProject | null>(() => {
      try {
        const model = localStorage.getItem(MODEL_KEY);
        if (model) {
          const parsed = JSON.parse(model) as WebsiteProject;
          if (parsed?.schemaVersion === 1 && Array.isArray(parsed.pages) && parsed.pages.length) {
            return parsed;
          }
        }

        const savedProposal = localStorage.getItem(PROJECT_KEY);
        if (!savedProposal) return null;
        const parsedProposal = JSON.parse(savedProposal) as Proposal;
        return parsedProposal?.brief && parsedProposal?.tokens
          ? createWebsiteProjectFromBrief(parsedProposal.brief, parsedProposal.tokens)
          : null;
      } catch {
        return null;
      }
    });

  const [
    canvasBlocks,
    setCanvasBlocks,
  ] = useState<
    WebCanvasBlockSeed[]
  >(() => {
    try {
      if (websiteProject) {
        return websiteProjectToCanvasBlocks(websiteProject);
      }

      const raw =
        localStorage.getItem(
          CANVAS_KEY
        );

      if (raw) {
        const savedBlocks = JSON.parse(raw) as WebCanvasBlockSeed[];
        if (Array.isArray(savedBlocks) && savedBlocks.length) {
          return savedBlocks;
        }
      }

      return [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const handleCanvasBlocksChange = useCallback(
    (blocks: WebCanvasBlockSeed[]) => {
      setCanvasBlocks(blocks);
      setWebsiteProject((current) => {
        if (!current) return current;
        return updateWebsiteProjectFromCanvas(current, blocks);
      });
    },
    []
  );

  function updateHomeSeo(patch: {
    title?: string;
    description?: string;
    indexable?: boolean;
  }) {
    setWebsiteProject((current) => {
      if (!current) return current;
      const home = getWebsiteHomePage(current);
      return updateWebsitePageSeo(current, home.id, patch);
    });
  }

  useEffect(() => {
    try {
      localStorage.setItem(CANVAS_KEY, JSON.stringify(canvasBlocks));
      if (websiteProject) {
        localStorage.setItem(MODEL_KEY, JSON.stringify(websiteProject));
      }
    } catch {
      setNotice("No se pudo guardar el proyecto en este dispositivo.");
    }
  }, [canvasBlocks, websiteProject]);

  const active =
    applied || proposal;

  const verification =
    useMemo(() => {
      if (!applied)
        return null;

      return verifyWebsitesBuilderProject(
        prompt ||
          applied.brief.offer,
        applied.brief,
        applied.tokens,
        canvasBlocks.length
          ? canvasBlocks
          : briefToBuilderBlocks(
              applied.brief,
              applied.tokens
            )
      );
    }, [
      applied,
      canvasBlocks,
      prompt,
    ]);

  async function generateProposal() {
    if (!prompt.trim()) {
      setNotice(
        "Escribí primero la intención del sitio."
      );
      return;
    }

    setLoading(true);
    setNotice("");

    const fallbackBrief =
      createFallbackBrief(
        prompt,
        kind,
        language
      );

    const fallbackTokens =
      createDesignTokens(
        fallbackBrief.designLanguage
      );

    try {
      const response =
        await fetch(
          "/api/websites-builder/brief",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt,
              kind,
              preferredDesignLanguage:
                language,
            }),
          }
        );

      if (!response.ok)
        throw new Error(
          String(response.status)
        );

      const data =
        await response.json();

      const brief =
        normalizeBrief(
          data.brief,
          fallbackBrief
        );

      setProposal({
        brief,
        tokens:
          data.tokens &&
          typeof data.tokens ===
            "object"
            ? {
                ...createDesignTokens(
                  brief.designLanguage
                ),
                ...data.tokens,
              }
            : fallbackTokens,
        source: "AI",
      });

      setNotice(
        "Propuesta lista para revisión."
      );
    } catch {
      setProposal({
        brief: fallbackBrief,
        tokens: fallbackTokens,
        source: "FALLBACK",
      });

      setNotice(
        "IA no disponible. Se usó un fallback determinista."
      );
    } finally {
      setLoading(false);
    }
  }

  function applyProposal() {
    if (!proposal) return;

    const blocks =
      briefToBuilderBlocks(
        proposal.brief,
        proposal.tokens
      );

    setApplied(proposal);
    setCanvasBlocks(blocks);

    const project = createWebsiteProjectFromBrief(
      proposal.brief,
      proposal.tokens
    );
    setWebsiteProject(project);

    localStorage.setItem(
      PROJECT_KEY,
      JSON.stringify(proposal)
    );

    localStorage.setItem(
      CANVAS_KEY,
      JSON.stringify(blocks)
    );

    localStorage.setItem(
      MODEL_KEY,
      JSON.stringify(project)
    );

    setProposal(null);

    setNotice(
      "Dirección aplicada al canvas."
    );
  }

  function discardProposal() {
    setProposal(null);

    setNotice(
      "Propuesta descartada."
    );
  }

  return (
    <div className="db-websites-shell">
      <header className="db-topbar">
        <div className="db-topbar-inner">
          <div className="flex min-w-0 items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="db-secondary px-3 py-2 text-[10px]"
              >
                ← Studio
              </button>
            )}

            <div className="db-brand-mark">
              D
            </div>

            <div className="min-w-0">
              <div className="db-brand-title">
                DigitalBoost Websites
              </div>

              <div className="db-brand-subtitle">
                Professional Website Studio
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[.025] px-3 py-2 md:flex">
              <span className="db-status-dot" />
              <span className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">
                {applied
                  ? "Project active"
                  : "Draft workspace"}
              </span>
            </div>

            <div className="hidden rounded-full border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-slate-500 sm:block">
              Data · Empty
            </div>

            <div className="db-preview-status flex items-center gap-2 px-3 py-2.5 text-[10px]">
              <Monitor size={13} />
              {applied
                ? "Canvas ready"
                : "No preview yet"}
            </div>
          </div>
        </div>
      </header>

      <div className="db-shell-grid">
        <nav className="db-rail">
          <div className="space-y-2">
            {railItems.map(
              ([
                id,
                Icon,
                label,
              ]) => (
                <button
                  key={id}
                  type="button"
                  data-active={
                    activeTool === id
                  }
                  onClick={() =>
                    setActiveTool(id)
                  }
                  className="db-rail-button"
                  title={label}
                >
                  <Icon size={17} />
                  <span className="db-rail-label">
                    {label}
                  </span>
                </button>
              )
            )}
          </div>
        </nav>

        <aside className="db-operator">
          {activeTool === "build" && (
            <>
          <section className="db-panel p-4">
            <div className="db-panel-header">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#e8ff2f]/20 bg-[#e8ff2f]/[.06] text-[#e8ff2f]">
                  <WandSparkles size={16} />
                </div>

                <div>
                  <div className="text-xs font-bold">
                    Web Operator
                  </div>

                  <div className="db-kicker mt-1">
                    AI direction
                  </div>
                </div>
              </div>

              <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                Proposal
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {(
                [
                  "web",
                  "landing",
                ] as const
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  data-active={
                    kind === value
                  }
                  onClick={() =>
                    setKind(value)
                  }
                  className="db-chip px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                >
                  {value}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                Project direction
              </span>

              <textarea
                rows={7}
                value={prompt}
                onChange={(event) =>
                  setPrompt(
                    event.target.value
                  )
                }
                placeholder="Describe la marca, audiencia, oferta, objetivo y sensación visual..."
                className="db-input resize-none p-3 text-xs leading-relaxed"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-2 block text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                Design language
              </span>

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target
                      .value as WebDesignLanguage
                  )
                }
                className="db-select p-3 text-xs"
              >
                {WEB_DESIGN_LANGUAGES.map(
                  (item) => (
                    <option key={item}>
                      {item}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="button"
              disabled={loading}
              onClick={
                generateProposal
              }
              className="db-primary mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-xs disabled:opacity-50"
            >
              {loading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Sparkles size={15} />
              )}

              Generate direction
            </button>

            {notice && (
              <div className="mt-3 rounded-xl border border-white/[.07] bg-black/20 p-3 text-[10px] leading-relaxed text-slate-400">
                {notice}
              </div>
            )}
          </section>

          {/* SKY_WORKSHOP_LOCAL_TOOLS_V1 — mock controls only; no backend */}
          <section className="db-local-tools" aria-label="Herramientas gratuitas locales">
            <div className="db-local-tools-heading">
              <div>
                <strong>Herramientas gratuitas locales</strong>
                <small>Termux / Debian · interfaz visual</small>
              </div>
              <span className="db-local-tools-count" aria-label="6 herramientas">06</span>
            </div>

            <div className="db-local-tools-grid">
              <button type="button" className="db-local-tool" data-tone="sky" disabled aria-label="Image Optimizer, integración pendiente">
                <span className="db-local-tool-icon"><Sparkles size={15} /></span>
                <span className="db-local-tool-copy"><strong>Image Optimizer</strong><small>Compresión local</small><span className="db-local-tool-status">Integración pendiente</span></span>
              </button>
              <button type="button" className="db-local-tool" data-tone="green" disabled aria-label="SVG e iconos, integración pendiente">
                <span className="db-local-tool-icon"><Palette size={15} /></span>
                <span className="db-local-tool-copy"><strong>SVG &amp; Icons</strong><small>Recursos vectoriales</small><span className="db-local-tool-status">Integración pendiente</span></span>
              </button>
              <button type="button" className="db-local-tool" data-tone="gold" disabled aria-label="Favicon, integración pendiente">
                <span className="db-local-tool-icon"><WandSparkles size={15} /></span>
                <span className="db-local-tool-copy"><strong>Favicon</strong><small>Iconos del sitio</small><span className="db-local-tool-status">Integración pendiente</span></span>
              </button>
              <button type="button" className="db-local-tool" data-tone="coral" disabled aria-label="Color Contrast, integración pendiente">
                <span className="db-local-tool-icon"><Palette size={15} /></span>
                <span className="db-local-tool-copy"><strong>Color Contrast</strong><small>Accesibilidad visual</small><span className="db-local-tool-status">Integración pendiente</span></span>
              </button>
              <button type="button" className="db-local-tool" data-tone="violet" disabled aria-label="SEO Preview, integración pendiente">
                <span className="db-local-tool-icon"><Search size={15} /></span>
                <span className="db-local-tool-copy"><strong>SEO Preview</strong><small>Vista previa social</small><span className="db-local-tool-status">Integración pendiente</span></span>
              </button>
              <button type="button" className="db-local-tool" data-tone="aqua" disabled aria-label="Export, integración pendiente">
                <span className="db-local-tool-icon"><FileText size={15} /></span>
                <span className="db-local-tool-copy"><strong>Export</strong><small>Archivos del proyecto</small><span className="db-local-tool-status">Integración pendiente</span></span>
              </button>
            </div>
          </section>

          {active && (
            <section className="db-panel mt-4 p-4">
              <div className="db-panel-header">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">
                    Website brief
                  </div>

                  <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#e8ff2f]">
                    {active.source}
                  </div>
                </div>

                <Sparkles
                  size={14}
                  className="text-[#e8ff2f]"
                />
              </div>

              <div className="mt-4 text-sm font-semibold leading-snug">
                {active.brief.headline}
              </div>

              <div className="mt-2 text-[11px] leading-relaxed text-slate-500">
                {active.brief.subheadline}
              </div>

              <div className="mt-4 rounded-xl border border-white/[.06] bg-black/20 p-3">
                <div className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                  Proof state
                </div>

                <div className="mt-1 text-[10px] text-slate-400">
                  {active.brief.proof}
                </div>
              </div>

              {proposal && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={
                      applyProposal
                    }
                    className="db-primary px-3 py-2.5 text-[10px]"
                  >
                    Apply
                  </button>

                  <button
                    type="button"
                    onClick={
                      discardProposal
                    }
                    className="db-secondary px-3 py-2.5 text-[10px]"
                  >
                    Discard
                  </button>
                </div>
              )}
            </section>
          )}

          {verification && (
            <section className="db-panel mt-4 p-4">
              <div className="db-panel-header">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">
                    Verification
                  </div>

                  <div className="mt-1 text-xs font-semibold">
                    Project health
                  </div>
                </div>

                {verification.passed ? (
                  <CheckCircle2
                    size={17}
                    className="text-emerald-400"
                  />
                ) : (
                  <CircleAlert
                    size={17}
                    className="text-amber-400"
                  />
                )}
              </div>

              <div className="mt-4 space-y-2">
                {verification.checks.map(
                  (check) => (
                    <div
                      key={check.id}
                      className="rounded-xl border border-white/[.05] bg-black/15 p-2.5"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold">
                        <span
                          className={
                            check.passed
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }
                        >
                          {check.passed
                            ? "●"
                            : "!"}
                        </span>

                        {check.label}
                      </div>

                      <div className="mt-1 pl-4 text-[9px] leading-relaxed text-slate-600">
                        {check.detail}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}
            </>
          )}

          {activeTool === "pages" && (
            <div className="space-y-4">
              <section className="db-suite-heading">
                <div className="db-kicker">
                  Site structure
                </div>

                <h2 className="mt-2 text-base font-semibold">
                  Pages
                </h2>

                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Estructura actual del proyecto.
                  No se crean páginas ficticias.
                </p>
              </section>

              <section className="db-panel p-3">
                <div className="db-page-card" data-active="true">
                  <div className="flex items-center gap-3">
                    <div className="db-page-icon">
                      <FileText size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold">
                        Home
                      </div>

                      <div className="mt-1 truncate text-[9px] text-slate-600">
                        /
                      </div>
                    </div>

                    <span className="db-live-chip">
                      Active
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="db-metric-tile">
                      <span>Sections</span>
                      <strong>
                        {canvasBlocks.length}
                      </strong>
                    </div>

                    <div className="db-metric-tile">
                      <span>Status</span>
                      <strong>
                        {applied
                          ? "Draft"
                          : "Empty"}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="db-panel p-4">
                <div className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                  Page title
                </div>

                <div className="mt-2 text-xs leading-relaxed text-slate-300">
                  {active
                    ? active.brief.headline
                    : "No page direction applied yet."}
                </div>
              </section>
            </div>
          )}

          {activeTool === "styles" && (
            <div className="space-y-4">
              <section className="db-suite-heading">
                <div className="db-kicker">
                  Design system
                </div>

                <h2 className="mt-2 text-base font-semibold">
                  Styles
                </h2>

                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Tokens derivados de la dirección visual actual.
                </p>
              </section>

              {active ? (
                <>
                  <section className="db-panel p-4">
                    <div className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                      Design language
                    </div>

                    <div className="mt-2 text-sm font-semibold text-[#e8ff2f]">
                      {active.brief.designLanguage}
                    </div>
                  </section>

                  <section className="db-panel p-4">
                    <div className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                      Color tokens
                    </div>

                    <div className="mt-4 space-y-2">
                      {[
                        ["Background", active.tokens.background],
                        ["Surface", active.tokens.surface],
                        ["Foreground", active.tokens.foreground],
                        ["Muted", active.tokens.muted],
                        ["Accent", active.tokens.accent],
                        ["Border", active.tokens.border],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="db-token-row"
                        >
                          <div
                            className="db-token-swatch"
                            style={{
                              background:
                                value,
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-semibold">
                              {label}
                            </div>

                            <div className="mt-0.5 truncate text-[9px] text-slate-600">
                              {value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="db-panel p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="db-metric-tile">
                        <span>Radius</span>
                        <strong>
                          {active.tokens.radius}px
                        </strong>
                      </div>

                      <div className="db-metric-tile">
                        <span>Container</span>
                        <strong>
                          {active.tokens.container}px
                        </strong>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <section className="db-panel p-4">
                  <div className="text-xs text-slate-500">
                    Generá una dirección visual para inspeccionar el sistema de diseño.
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTool === "seo" && (
            <div className="space-y-4">
              <section className="db-suite-heading">
                <div className="db-kicker">
                  Search foundation
                </div>

                <h2 className="mt-2 text-base font-semibold">
                  SEO
                </h2>

                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Metadata derivada del brief.
                  No representa publicación activa.
                </p>
              </section>

              <section className="db-panel p-4">
                <div className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                  Title draft
                </div>

                <input
                  aria-label="SEO title"
                  disabled={!websiteProject}
                  value={websiteProject ? getWebsiteHomePage(websiteProject).seo.title : ""}
                  onChange={(event) => updateHomeSeo({ title: event.target.value })}
                  placeholder="No title available."
                  className="db-canvas-control mt-2 w-full rounded-xl p-3 text-xs"
                />

                <div className="mt-4 text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                  Description draft
                </div>

                <textarea
                  aria-label="SEO description"
                  disabled={!websiteProject}
                  value={websiteProject ? getWebsiteHomePage(websiteProject).seo.description : ""}
                  onChange={(event) => updateHomeSeo({ description: event.target.value })}
                  placeholder="No description available."
                  rows={3}
                  className="db-canvas-control mt-2 w-full resize-y rounded-xl p-3 text-[10px] leading-relaxed"
                />

                <label className="mt-4 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                  <span>Permitir indexación</span>
                  <input
                    type="checkbox"
                    disabled={!websiteProject}
                    checked={websiteProject ? getWebsiteHomePage(websiteProject).seo.indexable : false}
                    onChange={(event) => updateHomeSeo({ indexable: event.target.checked })}
                  />
                </label>
              </section>

              <section className="db-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold">
                      Publishing state
                    </div>

                    <div className="mt-1 text-[9px] text-slate-600">
                      Preview boundary only
                    </div>
                  </div>

                  <span className="db-neutral-chip">
                    Draft
                  </span>
                </div>
              </section>
            </div>
          )}

          {activeTool === "settings" && (
            <div className="space-y-4">
              <section className="db-suite-heading">
                <div className="db-kicker">
                  Workspace
                </div>

                <h2 className="mt-2 text-base font-semibold">
                  Setup
                </h2>

                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Estado real y límites operativos del proyecto.
                </p>
              </section>

              <section className="db-panel p-4">
                <div className="db-setting-row">
                  <span>Project type</span>
                  <strong>{kind}</strong>
                </div>

                <div className="db-setting-row">
                  <span>Data</span>
                  <strong>EMPTY</strong>
                </div>

                <div className="db-setting-row">
                  <span>Authority</span>
                  <strong>
                    Proposal only
                  </strong>
                </div>

                <div className="db-setting-row">
                  <span>Execution</span>
                  <strong>
                    User approved
                  </strong>
                </div>

                <div className="db-setting-row">
                  <span>Publishing</span>
                  <strong>
                    Preview only
                  </strong>
                </div>
              </section>

              <section className="db-panel p-4">
                <div className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">
                  Current canvas
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-semibold">
                      {canvasBlocks.length}
                    </div>

                    <div className="mt-1 text-[9px] text-slate-600">
                      Structured sections
                    </div>
                  </div>

                  <div
                    className={
                      applied
                        ? "db-live-chip"
                        : "db-neutral-chip"
                    }
                  >
                    {applied
                      ? "Active"
                      : "Empty"}
                  </div>
                </div>
              </section>
            </div>
          )}
        </aside>

        <main className="db-workstage">
          {applied ? (
            <WebsitesBuilderCanvas
              seedBlocks={
                canvasBlocks
              }
              storageKey={
                CANVAS_KEY
              }
              studioTitle="DigitalBoost Websites"
              studioEyebrow="Visual canvas"
              backLabel="← Operator"
              onBlocksChange={
                handleCanvasBlocksChange
              }
            />
          ) : (
            <div className="db-empty-stage">
              <div
                className="db-floating-islands"
                aria-label="Islas flotantes movibles por todo el canvas"
                data-sky-drag-surface="full-canvas"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", aspectRatio: "auto", overflow: "visible", clipPath: "none", zIndex: 20, pointerEvents: "none" }}
              >
                <div className="db-floating-islands-hint">↔ Arrastrá las islas</div>
                <SkyDraggableIsland
                  src="/websites-builder/sky-workshop/island-cluster.png"
                  label="Grupo de islas flotantes"
                  initial={{ x: 48, y: 32 }}
                  width={48}
                />
                <SkyDraggableIsland
                  src="/websites-builder/sky-workshop/island-emblem.png"
                  label="Isla principal con cascada"
                  initial={{ x: 42, y: 24 }}
                  width={36}
                />
                <SkyDraggableIsland
                  src="/websites-builder/sky-workshop/island-emblem.png"
                  label="Isla flotante con cascada"
                  initial={{ x: 76, y: 10 }}
                  width={20}
                />
              </div>
              <div className="max-w-sm px-8 text-center">
                <div className="db-neon-orb mx-auto">
                  <Sparkles size={22} />
                </div>

                <div className="db-kicker mt-5">
                  Ready to design
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  Convertí una dirección en una web profesional.
                </h2>

                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Definí la intención del sitio.
                  DigitalBoost prepara la dirección,
                  estructura y sistema visual antes
                  de aplicar cambios al canvas.
                </p>
              </div>
            </div>
          )}
        </main>

        {!applied && (
          <aside className="db-empty-inspector" aria-label="Inspector visual del canvas">
            <div className="db-empty-inspector-head">
              <div><strong>Inspector</strong><small>Propiedades del elemento</small></div>
              <span aria-hidden="true">☷</span>
            </div>
            <div className="db-empty-inspector-tabs" aria-label="Pestañas del inspector">
              <span data-active="true">Section</span><span>Style</span><span>Advanced</span>
            </div>
            <section className="db-empty-inspector-group">
              <small>Selected element</small>
              <div className="db-empty-inspector-field"><span>▣</span><strong>Hero Section</strong><em>Section</em></div>
            </section>
            <section className="db-empty-inspector-group">
              <small>Dimensions</small>
              <div className="db-empty-inspector-pair"><span>W <b>1200</b> px</span><span>H <b>640</b> px</span></div>
            </section>
            <section className="db-empty-inspector-group">
              <small>Position</small>
              <div className="db-empty-inspector-pair"><span>X <b>0</b> px</span><span>Y <b>0</b> px</span></div>
            </section>
            <section className="db-empty-inspector-group">
              <small>Layout</small>
              <div className="db-empty-inspector-field"><span>Content width</span><strong>Full width⌄</strong></div>
              <div className="db-empty-inspector-range"><span>Vertical padding</span><b>120 px</b><i><u /></i></div>
              <div className="db-empty-inspector-range"><span>Horizontal padding</span><b>80 px</b><i><u /></i></div>
            </section>
            <section className="db-empty-inspector-group">
              <small>Background</small>
              <div className="db-empty-inspector-field"><span>Image · Sky islands</span><strong>Change</strong></div>
              <div className="db-empty-inspector-range"><span>Overlay</span><b>20%</b><i><u /></i></div>
            </section>
            <section className="db-empty-inspector-group"><small>Border</small><div className="db-empty-inspector-field"><span>Style</span><strong>None⌄</strong></div></section>
            <section className="db-empty-inspector-group"><small>Effects <b>＋</b></small></section>
            <div className="db-empty-inspector-note">Muestra visual · los controles reales aparecen al seleccionar una sección.</div>
          </aside>
        )}
      </div>
    </div>
  );
}
