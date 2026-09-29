import {
  useMemo,
  useState,
} from "react";

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
} from "./WebsitesBuilderModel";

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

const railItems = [
  ["build", LayoutGrid, "Build"],
  ["pages", FileText, "Pages"],
  ["styles", Palette, "Styles"],
  ["seo", Search, "SEO"],
  ["settings", Settings2, "Setup"],
] as const;

export default function WebsitesBuilderWorkspace({
  onBack,
  initialKind = "web",
}: Props) {
  const [kind, setKind] =
    useState<WebsitesBuilderKind>(
      initialKind
    );

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

  const [
    canvasBlocks,
    setCanvasBlocks,
  ] = useState<
    WebCanvasBlockSeed[]
  >(() => {
    try {
      const raw =
        localStorage.getItem(
          CANVAS_KEY
        );

      return raw
        ? JSON.parse(raw)
        : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] =
    useState(false);

  const [notice, setNotice] =
    useState("");

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

    localStorage.setItem(
      PROJECT_KEY,
      JSON.stringify(proposal)
    );

    localStorage.setItem(
      CANVAS_KEY,
      JSON.stringify(blocks)
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

            <button
              type="button"
              className="db-primary flex items-center gap-2 px-4 py-2.5 text-[10px]"
            >
              <Monitor size={13} />
              Preview
            </button>
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
                    id === "build"
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
                setCanvasBlocks
              }
            />
          ) : (
            <div className="db-empty-stage">
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
      </div>
    </div>
  );
}
