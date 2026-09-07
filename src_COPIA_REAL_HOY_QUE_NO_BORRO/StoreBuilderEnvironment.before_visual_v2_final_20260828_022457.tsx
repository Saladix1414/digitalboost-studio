import './store-builder-vibrant-global.css';
import React, { useEffect, useState } from "react";
import VisualBuilderShell from "./VisualBuilderShell";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  Eye,
  Globe2,
  LayoutDashboard,
  Monitor,
  MoreHorizontal,
  PanelLeft,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Store,
  Terminal,
  Wand2,
  Wifi,
  X,
} from "lucide-react";

type StoreBuilderEnvironmentProps = {
  children: React.ReactNode;
};

const bootSteps = [
  "Inicializando Store Builder",
  "Conectando Commerce OS",
  "Preparando motor visual",
  "Cargando módulos inteligentes",
  "Preparando entorno de edición",
];

export default function StoreBuilderEnvironment({
  children,
}: StoreBuilderEnvironmentProps) {
  const [booting, setBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [preview, setPreview] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [leftPanel, setLeftPanel] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      for (let i = 0; i < bootSteps.length; i++) {
        if (cancelled) return;

        setBootStep(i);

        await new Promise((resolve) =>
          setTimeout(resolve, i === bootSteps.length - 1 ? 500 : 350)
        );
      }

      if (!cancelled) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setBooting(false);
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (booting) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#081528] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.07] blur-[110px]" />
          <div className="absolute left-[15%] top-[15%] h-72 w-72 rounded-full bg-violet-500/[0.05] blur-[100px]" />
          <div className="absolute bottom-[10%] right-[12%] h-80 w-80 rounded-full bg-blue-500/[0.04] blur-[110px]" />
        </div>

        <div className="relative w-full max-w-xl px-6">
          <div className="mb-8 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border border-cyan-400/20 bg-[#07111f] shadow-[0_0_90px_rgba(34,211,238,.08)]">
              <div className="absolute inset-0 animate-ping rounded-[26px] border border-cyan-400/10" />
              <Store size={30} className="text-cyan-300" />
            </div>
          </div>

          <div className="text-center">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
              DIGITALBOOST
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Store Builder
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Preparando tu entorno inteligente de creación.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-white/[0.07] bg-[#10213f]/90 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {bootSteps[bootStep]}
              </span>

              <span className="font-mono text-[10px] text-cyan-300">
                {Math.round(((bootStep + 1) / bootSteps.length) * 100)}%
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 transition-all duration-500"
                style={{
                  width: `${((bootStep + 1) / bootSteps.length) * 100}%`,
                }}
              />
            </div>

            <div className="mt-4 space-y-1">
              {bootSteps.map((step, index) => {
                const done = index < bootStep;
                const active = index === bootStep;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[10px] ${
                      active
                        ? "bg-cyan-400/[0.06] text-cyan-200"
                        : done
                          ? "text-emerald-300"
                          : "text-slate-700"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={13} />
                    ) : active ? (
                      <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-current opacity-40" />
                    )}

                    {step}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-700">
            <Wifi size={12} />
            Entorno seguro · Commerce OS conectado
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-store-builder-vibrant="true" className="min-h-screen bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[20%] top-[-180px] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.025] blur-[120px]" />
        <div className="absolute right-[8%] top-[20%] h-[380px] w-[380px] rounded-full bg-violet-500/[0.025] blur-[120px]" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* APPLICATION BAR */}
        <header className="sticky top-0 z-50 h-14 border-b border-white/[0.07] bg-[#0d1d3a]/95 backdrop-blur-2xl">
          <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setLeftPanel((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 transition hover:text-white"
              >
                <PanelLeft size={15} />
              </button>

              <div className="hidden h-5 w-px bg-white/[0.08] sm:block" />

              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-400/20 text-cyan-300">
                  <Store size={15} />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-[11px] font-semibold">
                    Store Builder
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Entorno activo
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-[9px] text-slate-500 md:flex">
                <Globe2 size={11} />
                Mi tienda
                <ChevronDown size={11} />
              </div>
            </div>

            <div className="hidden flex-1 justify-center px-5 lg:flex">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="flex w-full max-w-md items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-left text-[10px] text-slate-600 transition hover:text-slate-400"
              >
                <span className="flex items-center gap-2">
                  <Search size={12} />
                  Buscar herramientas, páginas o acciones...
                </span>

                <kbd className="rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[8px]">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
                className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-medium transition sm:flex ${
                  preview
                    ? "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400"
                }`}
              >
                <Eye size={13} />
                {preview ? "Preview activo" : "Vista previa"}
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.05] text-violet-300"
              >
                <Sparkles size={14} />
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-500"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* INNER APPLICATION */}
        <div className="relative flex flex-1">
          {leftPanel && (
            <aside className="hidden w-14 shrink-0 border-r border-white/[0.06] bg-[#0a1730] lg:flex lg:flex-col lg:items-center lg:py-3">
              <div className="flex flex-col items-center gap-2">
                {[
                  [LayoutDashboard, "Workspace"],
                  [Wand2, "Diseño"],
                  [Monitor, "Preview"],
                  [Bot, "IA"],
                  [Terminal, "Código"],
                  [Settings2, "Ajustes"],
                ].map(([Icon, label], index) => {
                  const ItemIcon = Icon as React.ElementType;

                  return (
                    <button
                      key={label as string}
                      type="button"
                      title={label as string}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                        index === 0
                          ? "bg-cyan-400/[0.08] text-cyan-300"
                          : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-300"
                      }`}
                    >
                      <ItemIcon size={15} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  title="Publicar"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/10 to-violet-400/10 text-cyan-300"
                >
                  <Rocket size={15} />
                </button>
              </div>
            </aside>
          )}

          <main className="min-w-0 flex-1 bg-[#0b1a34]">
            <div className="mx-auto min-h-full max-w-[1800px]">
              {children}
            </div>
          </main>
        </div>

        <footer className="flex h-7 items-center justify-between border-t border-white/[0.06] bg-[#02050a] px-3 text-[8px] text-slate-700 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-500/70">
              <Activity size={10} />
              Sistema operativo
            </span>

            <span className="hidden sm:inline">
              Commerce OS · Store Builder Engine
            </span>
          </div>

          <span>Auto-save activo</span>
        </footer>
      </div>

      {/* COMMAND CENTER */}
      {commandOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={() => setCommandOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#10213f] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-4">
              <Search size={16} className="text-slate-500" />

              <input
                autoFocus
                placeholder="¿Qué querés hacer?"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-700"
              />

              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="text-slate-600 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-2">
              {[
                [Wand2, "Diseñar una nueva sección", "Editor visual"],
                [Bot, "Pedirle algo a la IA", "AI Store Builder"],
                [Monitor, "Abrir vista previa", "Live preview"],
                [Rocket, "Publicar cambios", "Deployment"],
              ].map(([Icon, title, description]) => {
                const ActionIcon = Icon as React.ElementType;

                return (
                  <button
                    key={title as string}
                    type="button"
                    onClick={() => setCommandOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-cyan-300">
                      <ActionIcon size={15} />
                    </div>

                    <div>
                      <div className="text-xs font-medium text-white">
                        {title as string}
                      </div>

                      <div className="mt-0.5 text-[10px] text-slate-600">
                        {description as string}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
