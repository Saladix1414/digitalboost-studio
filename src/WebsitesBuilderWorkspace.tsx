import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import WebsitesBuilderCanvas from "./WebsitesBuilderCanvas";

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
        "Propuesta generada. Todavía no modificó el canvas."
      );
    } catch {
      setProposal({
        brief: fallbackBrief,
        tokens: fallbackTokens,
        source: "FALLBACK",
      });

      setNotice(
        "IA no disponible. Se usó un fallback determinista sin inventar evidencia."
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
      "Propuesta aplicada al proyecto editable."
    );
  }

  function discardProposal() {
    setProposal(null);

    setNotice(
      "Propuesta descartada. El canvas existente no cambió."
    );
  }

  return (
    <div className="min-h-screen bg-[#030308] text-white">

      <header className="border-b border-white/10 bg-[#05050b] px-4 py-3">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400"
              >
                ← Volver
              </button>
            )}

            <div>
              <div className="text-sm font-bold">
                DigitalBoost Web Builder
              </div>

              <div className="text-[10px] uppercase tracking-[.18em] text-cyan-300">
                Canonical Workspace
              </div>
            </div>

          </div>

          <div className="text-[10px] text-emerald-300">
            DATA · EMPTY
          </div>

        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 xl:grid-cols-[350px_minmax(0,1fr)]">

        <aside className="space-y-4">

          <section className="rounded-2xl border border-white/10 bg-[#080812] p-4">

            <div className="mb-4 flex items-center gap-2">
              <WandSparkles
                size={17}
                className="text-violet-300"
              />

              <div>
                <div className="text-sm font-semibold">
                  Web Operator
                </div>

                <div className="text-[10px] text-slate-500">
                  Proposal only
                </div>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">

              {(
                [
                  "web",
                  "landing",
                ] as const
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setKind(value)
                  }
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    kind === value
                      ? "border-violet-400 bg-violet-500/10"
                      : "border-white/10 text-slate-500"
                  }`}
                >
                  {value}
                </button>
              ))}

            </div>

            <textarea
              rows={7}
              value={prompt}
              onChange={(event) =>
                setPrompt(
                  event.target.value
                )
              }
              placeholder="Describe el sitio, audiencia, oferta y objetivo..."
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none"
            />

            <select
              value={language}
              onChange={(event) =>
                setLanguage(
                  event.target
                    .value as WebDesignLanguage
                )
              }
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#0b0b16] p-3 text-xs"
            >
              {WEB_DESIGN_LANGUAGES.map(
                (item) => (
                  <option key={item}>
                    {item}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              disabled={loading}
              onClick={
                generateProposal
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-xs font-bold"
            >
              {loading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Sparkles size={15} />
              )}

              Generar propuesta
            </button>

            {notice && (
              <div className="mt-3 rounded-lg border border-white/10 p-3 text-[11px] text-slate-400">
                {notice}
              </div>
            )}

          </section>

          {active && (
            <section className="rounded-2xl border border-white/10 bg-[#080812] p-4">

              <div className="flex justify-between text-xs font-semibold">
                <span>
                  Website brief
                </span>

                <span className="text-cyan-300">
                  {active.source}
                </span>
              </div>

              <div className="mt-3 text-sm font-semibold">
                {active.brief.headline}
              </div>

              <div className="mt-2 text-xs leading-relaxed text-slate-500">
                {active.brief.subheadline}
              </div>

              <div className="mt-3 text-[10px] text-slate-600">
                Proof:{" "}
                {active.brief.proof}
              </div>

              {proposal && (
                <div className="mt-4 grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={
                      applyProposal
                    }
                    className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-300"
                  >
                    Aplicar
                  </button>

                  <button
                    type="button"
                    onClick={
                      discardProposal
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs"
                  >
                    Descartar
                  </button>

                </div>
              )}

            </section>
          )}

          {verification && (
            <section className="rounded-2xl border border-white/10 bg-[#080812] p-4">

              <div className="flex items-center justify-between text-xs font-semibold">
                Verification

                {verification.passed ? (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                  />
                ) : (
                  <CircleAlert
                    size={16}
                    className="text-amber-400"
                  />
                )}
              </div>

              <div className="mt-3 space-y-2">

                {verification.checks.map(
                  (check) => (
                    <div
                      key={check.id}
                      className="text-[10px]"
                    >
                      <span
                        className={
                          check.passed
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      >
                        {check.passed
                          ? "✓ "
                          : "! "}
                      </span>

                      {check.label}

                      <div className="ml-4 text-slate-600">
                        {check.detail}
                      </div>
                    </div>
                  )
                )}

              </div>

            </section>
          )}

        </aside>

        <main className="min-w-0">

          {applied ? (
            <WebsitesBuilderCanvas
              seedBlocks={
                canvasBlocks
              }
              storageKey={
                CANVAS_KEY
              }
              studioTitle="DigitalBoost Web Builder"
              studioEyebrow="Canonical visual canvas"
              backLabel="← Web Operator"
              onBlocksChange={
                setCanvasBlocks
              }
            />
          ) : (
            <div className="flex min-h-[700px] items-center justify-center rounded-2xl border border-dashed border-white/10">

              <div className="max-w-md text-center">

                <Sparkles
                  size={28}
                  className="mx-auto text-violet-300"
                />

                <h2 className="mt-4 font-semibold">
                  Canvas esperando dirección
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Generá, revisá y aplicá
                  una propuesta antes de
                  modificar el canvas.
                </p>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
