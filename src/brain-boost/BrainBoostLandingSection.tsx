import { useEffect, useState } from "react";

type Game = {
  id: string;
  title: string;
  description: string;
  area: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  symbol: string;
  games: Game[];
};

const categories: Category[] = [
  {
    id: "memory",
    name: "Memory Lab",
    description: "Memoria y reconocimiento de patrones",
    symbol: "◈",
    games: [
      { id: "sequence", title: "Sequence Recall", description: "Práctica de recuerdo de secuencias.", area: "Memoria" },
      { id: "pairs", title: "Pattern Pairs", description: "Exploración de asociaciones visuales.", area: "Memoria" },
    ],
  },
  {
    id: "logic",
    name: "Logic Puzzles",
    description: "Razonamiento y resolución de problemas",
    symbol: "⌘",
    games: [
      { id: "deduction", title: "Deduction Grid", description: "Introducción a problemas de deducción.", area: "Lógica" },
      { id: "number", title: "Number Patterns", description: "Exploración de patrones numéricos.", area: "Lógica" },
    ],
  },
  {
    id: "spatial",
    name: "Spatial Lab",
    description: "Orientación y relaciones espaciales",
    symbol: "◇",
    games: [
      { id: "rotation", title: "Shape Rotation", description: "Reconocimiento de formas rotadas.", area: "Espacial" },
      { id: "routes", title: "Spatial Routes", description: "Exploración de recorridos espaciales.", area: "Espacial" },
    ],
  },
  {
    id: "focus",
    name: "Focus Lab",
    description: "Atención selectiva y concentración",
    symbol: "◎",
    games: [
      { id: "targets", title: "Target Focus", description: "Identificación de objetivos visuales.", area: "Atención" },
      { id: "signals", title: "Signal Search", description: "Búsqueda de señales entre distractores.", area: "Atención" },
    ],
  },
  {
    id: "tests",
    name: "Cognitive Tests",
    description: "Actividades estructuradas por habilidades",
    symbol: "▦",
    games: [
      { id: "baseline", title: "Baseline Challenge", description: "Recorrido inicial por distintas habilidades.", area: "Evaluación recreativa" },
      { id: "mixed", title: "Mixed Challenge", description: "Desafío conceptual de varias áreas.", area: "Multiarea" },
    ],
  },
];

const dailyCategory: Category = {
  id: "daily",
  name: "Daily Brain Boost",
  description: "Una rutina mixta que recorre las cinco áreas.",
  symbol: "✦",
  games: [
    { id: "daily-memory", title: "1. Memory", description: "Bloque dedicado a memoria.", area: "Memory Lab" },
    { id: "daily-logic", title: "2. Logic", description: "Bloque dedicado a razonamiento.", area: "Logic Puzzles" },
    { id: "daily-spatial", title: "3. Spatial", description: "Bloque dedicado a habilidades espaciales.", area: "Spatial Lab" },
    { id: "daily-focus", title: "4. Focus", description: "Bloque dedicado a atención.", area: "Focus Lab" },
    { id: "daily-review", title: "5. Review", description: "Cierre y revisión de la sesión.", area: "Cognitive Tests" },
  ],
};

export default function BrainBoostLandingSection() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  function openCategory(category: Category) {
    setActiveCategory(category);
    setActiveGame(null);
  }

  function closeWindow() {
    setActiveCategory(null);
    setActiveGame(null);
  }

  useEffect(() => {
    if (!activeCategory) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeWindow();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeCategory]);

  return (
    <section id="resources" className="relative isolate overflow-hidden bg-[#050c22] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-10"
      style={{ backgroundImage: "radial-gradient(ellipse at 0% 20%, rgba(0,153,255,0.20) 0%, transparent 40%), radial-gradient(ellipse at 100% 55%, rgba(131,59,255,0.20) 0%, transparent 42%), radial-gradient(ellipse at 50% 100%, rgba(0,211,255,0.12) 0%, transparent 44%), linear-gradient(155deg, #07132b 0%, #050a1b 48%, #0b0a22 100%)" }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-violet-500/[0.23] blur-3xl motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="absolute -right-24 top-[28rem] h-80 w-80 rounded-full bg-cyan-400/[0.20] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.065]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,.30) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.30) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-300/30 bg-gradient-to-r from-[#081a30]/95 to-[#100d2b]/95 px-4 py-3 shadow-[0_0_25px_rgba(0,190,255,.08)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 motion-safe:animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200 sm:text-xs">Neural system / ready</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1.5">05 disciplinas</span>
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1.5">Modo exploración</span>
          </div>
        </div>
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
            DIGITALBOOST ORIGIN / NEURAL TRAINING SYSTEM
          </p>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Brain <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">Boost</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Explorá desafíos recreativos de memoria, lógica, orientación espacial,
            atención y habilidades cognitivas.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_235px]">
          <nav aria-label="Categorías de Brain Boost" className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Áreas de entrenamiento
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => openCategory(category)}
                  className="group flex min-w-[172px] flex-none items-center gap-3 rounded-xl border border-cyan-300/20 bg-[#07152c]/80 px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-400/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:w-full lg:min-w-0 lg:flex-1 motion-reduce:transition-none"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl ${
                    category.id === "memory" ? "border-violet-400/30 bg-violet-400/[0.10] text-violet-200" :
                    category.id === "logic" ? "border-cyan-400/30 bg-cyan-400/[0.10] text-cyan-200" :
                    category.id === "spatial" ? "border-blue-400/30 bg-blue-400/[0.10] text-blue-200" :
                    category.id === "focus" ? "border-emerald-400/30 bg-emerald-400/[0.10] text-emerald-200" :
                    "border-amber-400/30 bg-amber-400/[0.10] text-amber-200"
                  }`}>{category.symbol}</span>
                  <span className="text-sm font-semibold">{category.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => openCategory(dailyCategory)}
                className="relative w-full overflow-hidden rounded-xl border border-violet-300/50 bg-gradient-to-br from-violet-500/[0.24] via-violet-500/[0.12] to-fuchsia-500/[0.18] p-4 text-left transition duration-200 hover:border-violet-300/55 hover:bg-violet-400/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 motion-reduce:transition-none"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">✦ DAILY QUEST / SESIÓN MIXTA</span>
                <span className="mt-2 block text-sm font-bold">Daily Brain Boost</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">Cinco etapas, cinco áreas.</span>
              </button>
            </div>
          </nav>

          <main className="relative isolate flex min-h-[390px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400/[0.17] via-[#081329] to-violet-500/[0.22] px-6 py-12 text-center shadow-[0_0_50px_rgba(34,211,238,0.045)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/[0.20] blur-3xl" />
              <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-400/[0.20] blur-3xl" />
            </div>
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30">
              <div className="absolute inset-2 rounded-full border border-dashed border-violet-300/35" />
              <div className="absolute inset-4 rounded-full border border-cyan-300/15" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-[#073348] text-3xl text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.32)]">✦</span>
            </div>
            <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Mission control / ready</p>
            <h3 className="relative mt-3 text-2xl font-black tracking-tight sm:text-3xl">Elegí tu próxima misión</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
              Seleccioná un área del menú para explorar sus actividades. Los desafíos
              se abrirán en una ventana cuando elijas una categoría.
            </p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-2">
              <span className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.05] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-100">5 disciplinas</span>
              <span className="rounded-md border border-violet-300/15 bg-violet-300/[0.05] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-100">Ruta mixta</span>
            </div>
            <button
              type="button"
              onClick={() => openCategory(dailyCategory)}
              className="relative mt-6 rounded-xl border border-cyan-100/30 bg-gradient-to-r from-cyan-300 to-cyan-200 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(34,211,238,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            >
              Iniciar Daily Brain Boost →
            </button>
          </main>

          <aside className="relative min-w-0 overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-b from-[#0c1630] to-[#0a0d21] p-5 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tu progreso</p>
            <h3 className="mt-3 text-xl font-bold">Cognitive Score</h3>
            <div className="relative mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full border border-cyan-300/20">
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-300/30" />
              <div className="absolute inset-5 rounded-full border border-violet-300/20" />
              <div className="relative text-center">
                <p className="text-4xl font-black tracking-tight text-cyan-200">—</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">/ 1000</p>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">Calibración pendiente</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              El puntaje estará disponible cuando se implemente el sistema de actividades y medición.
            </p>
            <div className="my-5 border-t border-white/10" />
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Áreas</p>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-2 border-b border-white/[0.06] py-3 last:border-0">
                <span className="flex min-w-0 items-center gap-2 text-xs text-slate-200">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${
                    category.id === "memory" ? "bg-violet-300" :
                    category.id === "logic" ? "bg-cyan-300" :
                    category.id === "spatial" ? "bg-blue-300" :
                    category.id === "focus" ? "bg-emerald-300" : "bg-amber-300"
                  }`} />
                  {category.name}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400">Sin datos</span>
              </div>
            ))}
          </aside>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Experiencia recreativa de entrenamiento cognitivo; no es una evaluación médica ni diagnóstica.
          Cognitive Score no equivale a IQ.
        </p>
      </div>

      {activeCategory && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWindow();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="brain-boost-dialog-title"
            className="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-cyan-300/25 bg-[#080d20] p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Brain Boost · Catálogo</p>
                <h3 id="brain-boost-dialog-title" className="mt-2 text-2xl font-black">{activeCategory.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{activeCategory.description}</p>
              </div>
              <button type="button" onClick={closeWindow} aria-label="Cerrar ventana" className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="grid content-start gap-3 sm:grid-cols-2 md:grid-cols-1">
                {activeCategory.games.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setActiveGame(game)}
                    className={`group rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none ${
                      activeGame?.id === game.id
                        ? "border-cyan-300/60 bg-cyan-300/[0.08] shadow-[0_0_22px_rgba(34,211,238,0.08)]"
                        : "border-white/10 bg-white/[0.02] hover:border-violet-300/35 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">{game.area}</span>
                    <span className="mt-2 block font-bold">{game.title}</span>
                    <span className="mt-2 block text-xs leading-5 text-slate-400">{game.description}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-48 rounded-xl border border-white/10 bg-black/20 p-5">
                {activeGame ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Ficha de actividad</p>
                    <h4 className="mt-3 text-xl font-bold">{activeGame.title}</h4>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{activeGame.description}</p>
                    <p className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100">
                      Actividad en catálogo. La mecánica interactiva y el registro de resultados todavía deben desarrollarse.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Vista previa</p>
                    <h4 className="mt-3 text-lg font-bold">Seleccioná una actividad</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Elegí una ficha de la lista para consultar sus detalles.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
