import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MemoryMatrixGame from "./MemoryMatrixGame";
import MemoryPairsGame from "./MemoryPairsGame";
import LogicReactorGame from "./LogicReactorGame";
import NumberPatternsGame from "./NumberPatternsGame";
import SpatialRiftGame from "./SpatialRiftGame";

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

type GameArtDirection = {
  primary: string;
  secondary: string;
  surface: string;
  glow: string;
};

const gameArtDirections: Record<string, GameArtDirection> = {
  sequence: { primary: "#22d3ee", secondary: "#e879f9", surface: "#07152c", glow: "rgba(34,211,238,.24)" },
  pairs: { primary: "#2dd4bf", secondary: "#60a5fa", surface: "#05202b", glow: "rgba(45,212,191,.23)" },
  "originx-dragons": { primary: "#fbbf24", secondary: "#fb7185", surface: "#21101a", glow: "rgba(251,191,36,.24)" },
  number: { primary: "#fbbf24", secondary: "#22d3ee", surface: "#171a2b", glow: "rgba(245,158,11,.24)" },
  deduction: { primary: "#a3e635", secondary: "#60a5fa", surface: "#0a2020", glow: "rgba(163,230,53,.22)" },
  rotation: { primary: "#e879f9", secondary: "#22d3ee", surface: "#160d35", glow: "rgba(217,70,239,.24)" },
};

const categories: Category[] = [
  {
    id: "memory",
    name: "Memory Lab",
    description: "Memoria y reconocimiento de patrones",
    symbol: "◈",
    games: [
      { id: "sequence", title: "Memory Matrix", description: "Memorizá y reproducí secuencias de señales luminosas.", area: "Memoria" },
      { id: "pairs", title: "Ocean Echoes", description: "Encontrá parejas de animales marinos y escuchá sus sonidos reales.", area: "Memoria sonora" },
      { id: "originx-dragons", title: "Origin X: Dragon Relics", description: "Descubrí las parejas de dragones elementales de Origin X.", area: "Dragon memory" },
    ],
  },
  {
    id: "logic",
    name: "Logic Core",
    description: "Razonamiento y resolución de problemas",
    symbol: "⌘",
    games: [
      { id: "deduction", title: "Logic Reactor", description: "Activá el reactor resolviendo patrones y relaciones lógicas.", area: "Lógica" },
      { id: "number", title: "Number Patterns", description: "Exploración de patrones numéricos.", area: "Lógica" },
    ],
  },
  {
    id: "spatial",
    name: "Spatial Lab",
    description: "Orientación y relaciones espaciales",
    symbol: "◇",
    games: [
      { id: "rotation", title: "Spatial Rift", description: "Rotá formas holográficas y reconocé relaciones espaciales.", area: "Espacial" },
      { id: "routes", title: "Vector Routes", description: "Encontrá rutas entre nodos y portales.", area: "Espacial" },
    ],
  },
  {
    id: "focus",
    name: "Focus Lab",
    description: "Atención selectiva y concentración",
    symbol: "◎",
    games: [
      { id: "targets", title: "Focus Protocol", description: "Identificá el objetivo correcto entre señales visuales.", area: "Atención" },
      { id: "signals", title: "Signal Hunt", description: "Encontrá la señal correcta entre distractores.", area: "Atención" },
    ],
  },
  {
    id: "tests",
    name: "Cognitive Lab",
    description: "Actividades estructuradas por habilidades",
    symbol: "▦",
    games: [
      { id: "baseline", title: "Neural Baseline", description: "Recorrido inicial para explorar distintas habilidades.", area: "Evaluación recreativa" },
      { id: "mixed", title: "Neural Boss", description: "Desafío combinado que conecta varias disciplinas.", area: "Multiarea" },
    ],
  },
];

const dailyCategory: Category = {
  id: "daily",
  name: "Daily Neural Run",
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
  const activeArt = activeGame ? gameArtDirections[activeGame.id] : undefined;

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
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(103,232,249,.8) 1px, transparent 1.5px)",
          backgroundSize: "43px 43px",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-violet-500/[0.23] blur-3xl motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="absolute -right-24 top-[28rem] h-80 w-80 rounded-full bg-cyan-400/[0.20] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,.30) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.30) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-300/30 bg-gradient-to-r from-[#081a30]/95 to-[#100d2b]/95 px-4 py-3 shadow-[0_0_32px_rgba(0,190,255,.16),inset_0_1px_0_rgba(255,255,255,.05)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 motion-safe:animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200 sm:text-xs">Neural system / ready</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1.5">05 disciplinas</span>
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1.5">Modo arcade</span>
          </div>
        </div>
        <header className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
            DIGITALBOOST ARCADE / NEURAL GAMING SYSTEM
          </p>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Brain <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">Boost</span> <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">Gamez</span>
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-fuchsia-400/35 bg-fuchsia-400/[0.08] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200 shadow-[0_0_20px_rgba(217,70,239,.13)]">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,.9)]" />
            Neural Arcade / Player 01
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Explorá desafíos recreativos de memoria, lógica, orientación espacial,
            atención y habilidades cognitivas.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_235px]">
          <nav aria-label="Categorías de Brain Boost" className="relative isolate min-w-0 overflow-hidden rounded-2xl border border-cyan-300/45 bg-gradient-to-br from-[#0c2040]/95 via-[#081126]/95 to-[#130b2c]/95 p-3 shadow-[0_0_34px_rgba(0,180,255,.13),inset_0_1px_0_rgba(255,255,255,.05)]">
            <div className="mb-3 flex items-center justify-between gap-2 px-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Neural Arcade / Select Mode</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Elegí tu siguiente desafío</p>
              </div>
              <span className="shrink-0 rounded-md border border-cyan-300/30 bg-cyan-300/[0.06] px-2 py-1.5 text-[8px] font-black tracking-wider text-cyan-100">05 MODOS</span>
            </div>
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => openCategory(category)}
                  className="group relative flex min-w-[172px] flex-none snap-start items-center gap-3 overflow-hidden rounded-xl border border-cyan-300/25 bg-gradient-to-br from-[#0b2040]/90 via-[#07152c]/90 to-[#110c2a]/90 px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200/70 hover:bg-cyan-300/[0.10] hover:shadow-[0_0_22px_rgba(0,200,255,.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:w-full lg:min-w-0 lg:flex-1 motion-reduce:transition-none"
                >
                  <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl ${
                    category.id === "memory" ? "border-violet-400/30 bg-violet-400/[0.10] text-violet-200" :
                    category.id === "logic" ? "border-cyan-400/30 bg-cyan-400/[0.10] text-cyan-200" :
                    category.id === "spatial" ? "border-blue-400/30 bg-blue-400/[0.10] text-blue-200" :
                    category.id === "focus" ? "border-emerald-400/30 bg-emerald-400/[0.10] text-emerald-200" :
                    "border-amber-400/30 bg-amber-400/[0.10] text-amber-200"
                  }`}>{category.symbol}<span className="absolute -right-1 -top-1 rounded border border-cyan-100/35 bg-[#061329] px-1 py-0.5 text-[7px] font-black leading-none text-cyan-100">{String(index + 1).padStart(2, "0")}</span></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-black uppercase tracking-wide text-slate-100 sm:text-[11px]">{category.name}</span>
                    <span className="mt-1 block truncate text-[8px] font-bold uppercase tracking-[0.12em] text-cyan-200/60">
                      {category.id === "memory" ? "Memoria / secuencias" :
                       category.id === "logic" ? "Lógica / patrones" :
                       category.id === "spatial" ? "Espacial / rotación" :
                       category.id === "focus" ? "Atención / señales" :
                       "Multidisciplina / reto"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => openCategory(dailyCategory)}
                className="relative w-full overflow-hidden rounded-xl border border-violet-300/50 bg-gradient-to-br from-violet-500/[0.24] via-violet-500/[0.12] to-fuchsia-500/[0.18] p-4 text-left transition duration-200 hover:border-violet-300/55 hover:bg-violet-400/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 motion-reduce:transition-none shadow-[0_0_24px_rgba(139,92,246,.13)] hover:shadow-[0_0_32px_rgba(217,70,239,.22)]"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">✦ DAILY QUEST / SESIÓN MIXTA</span>
                <span className="mt-2 block text-sm font-bold">Daily Neural Run</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">Cinco etapas, cinco áreas.</span>
              </button>
            </div>
          </nav>

          <main className="relative isolate flex min-h-[390px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/55 bg-gradient-to-br from-cyan-400/[0.22] via-[#081329] to-violet-500/[0.28] px-6 py-12 text-center shadow-[0_0_68px_rgba(34,211,238,.16),inset_0_0_42px_rgba(139,92,246,.12)]">
            <div aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-cyan-200/[0.13]"
            />
            <div aria-hidden="true"
              className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent"
            />

            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/[0.20] blur-3xl" />
              <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-400/[0.20] blur-3xl" />
            </div>
            {/* NEURAL CORE — emblema de Neural Arcade */}
            <div
              role="img"
              aria-label="Neural Core, núcleo de Neural Arcade"
              className="relative mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-cyan-300/40 bg-[#06152a]/80 shadow-[0_0_38px_rgba(34,211,238,.18)]"
            >
              <div className="absolute inset-1 rounded-full border border-cyan-200/25" />
              <div className="absolute inset-2 rounded-full border border-dashed border-violet-300/55 motion-safe:animate-[spin_18s_linear_infinite] motion-reduce:animate-none" />
              <div className="absolute inset-4 rounded-full border border-cyan-300/30 shadow-[inset_0_0_18px_rgba(34,211,238,.14)]" />
              <div className="absolute inset-6 rounded-full border border-violet-300/25" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/45 bg-gradient-to-br from-cyan-300/25 via-[#073348] to-violet-500/30 shadow-[0_0_28px_rgba(34,211,238,.35)]">
                <svg aria-hidden="true" viewBox="0 0 64 64" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(103,232,249,.65)]" fill="none">
                  <path d="M32 11V23M32 41V53M11 32H23M41 32H53M17 17L26 26M38 38L47 47M47 17L38 26M26 38L17 47" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
                  <path d="M32 23L40 32L32 41L24 32Z" stroke="#C4B5FD" strokeWidth="2" />
                  <circle cx="32" cy="32" r="4" fill="#A5F3FC" />
                  <circle cx="32" cy="8" r="2.5" fill="#67E8F9" />
                  <circle cx="32" cy="56" r="2.5" fill="#C4B5FD" />
                  <circle cx="8" cy="32" r="2.5" fill="#67E8F9" />
                  <circle cx="56" cy="32" r="2.5" fill="#C4B5FD" />
                </svg>
              </span>
            </div>
            <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Neural Core / mission select</p>
            <h3 className="relative mt-3 text-2xl font-black tracking-tight sm:text-3xl">Elegí tu próxima misión</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
              Elegí una disciplina para abrir sus actividades. Cada nodo te lleva a un modo diferente de Neural Arcade.
            </p>

            {/* MISSION MAP — conecta las cinco disciplinas existentes */}
            <div className="relative mt-7 w-full max-w-2xl" aria-label="Mapa de misiones Neural Arcade">
              <div aria-hidden="true" className="pointer-events-none absolute left-[10%] right-[10%] top-[30px] h-px bg-gradient-to-r from-violet-400/20 via-cyan-300/80 to-amber-300/30 shadow-[0_0_10px_rgba(34,211,238,.4)]" />
              <div className="relative grid grid-cols-5 gap-0.5 sm:gap-3">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => openCategory(category)}
                    aria-label={`Abrir disciplina ${category.name}`}
                    title={category.name}
                    className="group relative z-10 flex min-w-0 flex-col items-center rounded-xl px-0.5 py-1.5 text-center transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 motion-reduce:transition-none"
                  >
                    <span className={`relative flex h-12 w-12 max-w-full items-center justify-center rounded-2xl border bg-[#08162d] text-xl transition duration-200 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(34,211,238,.20)] ${
                      category.id === "memory" ? "border-violet-300/60 text-violet-200 group-hover:bg-violet-400/20" :
                      category.id === "logic" ? "border-cyan-300/60 text-cyan-200 group-hover:bg-cyan-400/20" :
                      category.id === "spatial" ? "border-blue-300/60 text-blue-200 group-hover:bg-blue-400/20" :
                      category.id === "focus" ? "border-emerald-300/60 text-emerald-200 group-hover:bg-emerald-400/20" :
                      "border-amber-300/60 text-amber-200 group-hover:bg-amber-400/20"
                    }`}>
                      {category.symbol}
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-cyan-200/35 bg-[#0a1830] px-0.5 text-[8px] font-black text-cyan-100">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="mt-2 text-[8px] font-black uppercase leading-3 tracking-wide text-slate-300 transition-colors group-hover:text-cyan-100 sm:text-[10px]">
                      {category.id === "tests" ? "Cognitive" : category.name.replace(" Lab", "").replace(" Puzzles", "")}
                    </span>
                    <span className="mt-1 text-[8px] text-slate-500 group-hover:text-cyan-200/80">
                      {category.id === "memory" ? "Recall" :
                       category.id === "logic" ? "Solve" :
                       category.id === "spatial" ? "Explore" :
                       category.id === "focus" ? "Target" : "Master"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Neural route <span className="text-cyan-300/80">/ 05 modes available</span>
              </p>
            </div>

            <div className="relative mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.05] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-100">5 disciplinas</span>
              <span className="rounded-md border border-violet-300/15 bg-violet-300/[0.05] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-100">Ruta mixta</span>
            </div>
            <button
              type="button"
              onClick={() => openCategory(dailyCategory)}
              className="relative mt-6 rounded-xl border border-cyan-100/30 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_32px_rgba(34,211,238,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(34,211,238,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            >
              Iniciar Daily Neural Run →
            </button>
          </main>

          <aside
            className="relative isolate min-w-0 overflow-hidden rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-[#0a1c36] via-[#0b1028] to-[#170d38] p-5 shadow-[0_0_42px_rgba(0,190,255,.13),0_0_55px_rgba(139,92,246,.10),inset_0_1px_0_rgba(255,255,255,.06)]"
            style={{ backgroundImage: "radial-gradient(ellipse at 100% 0%, rgba(34,211,238,.15), transparent 42%), radial-gradient(ellipse at 0% 100%, rgba(139,92,246,.17), transparent 45%), linear-gradient(145deg,#0a1c36,#0b1028 55%,#170d38)" }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-10 w-10 border-r border-t border-cyan-200/30" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 h-10 w-10 border-b border-l border-violet-300/25" />
            <div aria-hidden="true" className="pointer-events-none absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/80">Neural metrics / player data</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-white">Cognitive Score</h3>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-300/30 bg-amber-300/[0.07] px-2 py-1.5 text-[8px] font-black uppercase tracking-wider text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.65)]" />
                Standby
              </span>
            </div>
            <div
              className="relative mx-auto mt-7 flex h-40 w-40 items-center justify-center rounded-full border border-cyan-300/35 bg-[#061329]/75 shadow-[0_0_34px_rgba(34,211,238,.13),inset_0_0_32px_rgba(34,211,238,.07)]"
              role="img"
              aria-label="Cognitive Score: puntuación pendiente de calibración"
            >
              <div className="absolute inset-1.5 rounded-full border border-cyan-200/20" />
              <div className="absolute inset-3 rounded-full border border-dashed border-cyan-300/45 motion-safe:animate-[spin_24s_linear_infinite] motion-reduce:animate-none" />
              <div className="absolute inset-5 rounded-full border border-violet-300/30" />
              <div className="absolute inset-7 rounded-full border border-cyan-200/15 shadow-[inset_0_0_20px_rgba(34,211,238,.09)]" />
              <span aria-hidden="true" className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(103,232,249,.9)]" />
              <span aria-hidden="true" className="absolute bottom-4 right-5 h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,.8)]" />
              <div className="relative text-center">
                <p className="text-5xl font-black tracking-tight text-cyan-100 drop-shadow-[0_0_16px_rgba(34,211,238,.45)]">—</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">/ 1000</p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">Core index</p>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-100 shadow-[0_0_18px_rgba(252,211,77,.07)]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Calibración pendiente
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              El puntaje estará disponible cuando se implemente el sistema de actividades y medición.
            </p>
            <div className="my-5 border-t border-cyan-200/15" />
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/70">Discipline signals</p>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">05 channels</span>
            </div>
            {categories.map((category, index) => (
              <div key={category.id} className="group flex items-center justify-between gap-2 border-b border-cyan-100/[0.07] py-3 transition-colors last:border-0 hover:border-cyan-200/20">
                <span className="flex min-w-0 items-center gap-2 text-xs text-slate-200">
                  <span className="font-mono text-[9px] font-bold text-cyan-300/60">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${
                    category.id === "memory" ? "bg-violet-300" :
                    category.id === "logic" ? "bg-cyan-300" :
                    category.id === "spatial" ? "bg-blue-300" :
                    category.id === "focus" ? "bg-emerald-300" : "bg-amber-300"
                  }`} />
                  {category.name}
                </span>
                <span className="shrink-0 rounded border border-slate-400/15 bg-slate-400/[0.04] px-1.5 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">Sin datos</span>
              </div>
            ))}
          </aside>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Experiencia recreativa de entrenamiento cognitivo; no es una evaluación médica ni diagnóstica.
          Cognitive Score no equivale a IQ.
        </p>
      </div>

      {activeCategory && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#01040c]/90 p-3 backdrop-blur-lg sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWindow();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="brain-boost-dialog-title"
            className={`relative isolate flex w-full flex-col overflow-y-auto rounded-2xl border border-cyan-300/40 bg-[#050b1c] p-4 shadow-[0_0_70px_rgba(0,180,255,.18),0_0_100px_rgba(139,92,246,.16)] sm:rounded-3xl sm:p-6 ${
              activeGame ? "max-h-[calc(100dvh-24px)] max-w-5xl" : "max-h-[82dvh] max-w-3xl"
            }` }
            style={activeArt ? { borderColor: activeArt.primary, backgroundColor: activeArt.surface, boxShadow: `0 0 80px ${activeArt.glow}` } : undefined}
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">{activeGame?.id === "rotation" ? "NEURAL ARCADE / SPATIAL RIFT" : activeGame?.id === "number" ? "NEURAL ARCADE / NUMBER PATTERNS" : activeGame?.id === "deduction" ? "NEURAL ARCADE / LOGIC REACTOR" : activeGame?.id === "sequence" ? "NEURAL ARCADE / MEMORY MATRIX" : activeGame?.id === "pairs" ? "NEURAL ARCADE / OCEAN ECHOES" : activeGame?.id === "originx-dragons" ? "ORIGIN X / DRAGON RELICS" : activeCategory.id === "daily" ? "NEURAL ARCADE / DAILY RUN" : "NEURAL ARCADE / MODE SELECT"}</p>
                <h3 id="brain-boost-dialog-title" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{activeGame ? activeGame.title : activeCategory.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{activeGame ? activeGame.description : activeCategory.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {activeGame && (
                  <button
                    type="button"
                    onClick={() => setActiveGame(null)}
                    className="rounded-lg border border-cyan-300/30 bg-cyan-300/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                  >
                    ← Modos
                  </button>
                )}
                <button type="button" onClick={closeWindow} aria-label="Cerrar ventana" className="rounded-lg border border-cyan-300/25 bg-[#071329]/80 px-3 py-2 text-sm text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.10]">
                  ✕
                </button>
              </div>
            </div>

            <div className={`relative z-10 mt-6 grid flex-1 content-start gap-5 ${
              activeGame ? "grid-cols-1" : "md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]"
            }`}>
              <div className={activeGame ? "hidden" : "grid content-start gap-3 sm:grid-cols-2 md:grid-cols-1"}>
                {activeCategory.games.map((game, index) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setActiveGame(game)}
                    className="group relative isolate overflow-hidden rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none"
                    style={{
                      borderColor: gameArtDirections[game.id]?.primary ?? "#22d3ee",
                      backgroundColor: gameArtDirections[game.id]?.surface ?? "#080e20",
                      backgroundImage: gameArtDirections[game.id]
                        ? "radial-gradient(ellipse at top left, " + gameArtDirections[game.id].primary + "42, transparent 72%), linear-gradient(145deg, " + gameArtDirections[game.id].surface + ", #060b1c)"
                        : undefined,
                      boxShadow: gameArtDirections[game.id]?.glow,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: gameArtDirections[game.id]?.primary ?? "#a5f3fc" }}>{game.area}</span>
                      <span className="rounded border px-1.5 py-1 font-mono text-[8px] font-black" style={{ borderColor: gameArtDirections[game.id]?.primary, backgroundColor: gameArtDirections[game.id]?.surface, color: gameArtDirections[game.id]?.primary }}>
                        MODE {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="block font-black tracking-tight text-white">{game.title}</span>
                        <span className="mt-2 block text-xs leading-5 text-slate-400">{game.description}</span>
                      </div>
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/[0.07] text-lg text-cyan-100 transition group-hover:bg-cyan-300/[0.16]">↗</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Neural arcade</span>
                      <span className="text-[8px] font-black uppercase tracking-wider text-cyan-200">
                        {game.id === "sequence" ? "Play now →" : "Select mode →"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div
                className={activeGame ? "relative min-w-0 overflow-hidden rounded-2xl border p-3 transition-colors duration-300 sm:p-5" : "relative isolate flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-[#0b1d3a] via-[#070d20] to-[#180d35] p-5 text-center shadow-[0_0_38px_rgba(34,211,238,.12),inset_0_0_34px_rgba(139,92,246,.09)]"}
                style={activeArt ? {
                  borderColor: activeArt.primary,
                  backgroundImage: "radial-gradient(ellipse at 15% 0%, " + activeArt.primary + "42, transparent 62%), radial-gradient(ellipse at 100% 100%, " + activeArt.secondary + "28, transparent 54%), linear-gradient(145deg, " + activeArt.surface + ", #050b1b)",
                  boxShadow: "inset 0 0 42px " + activeArt.glow,
                } : undefined}
              >
                {activeGame?.id === "rotation" ? (
                  <SpatialRiftGame />
                ) : activeGame?.id === "number" ? (
                  <NumberPatternsGame />
                ) : activeGame?.id === "deduction" ? (
                  <LogicReactorGame />
                ) : activeGame?.id === "pairs" ? (
                  <MemoryPairsGame mode="ocean" />
                ) : activeGame?.id === "originx-dragons" ? (
                  <MemoryPairsGame mode="originx" />
                ) : activeGame?.id === "sequence" ? (
                  <MemoryMatrixGame />
                ) : activeGame ? (
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
                    <div aria-hidden="true" className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/40 bg-[#061329]/90 shadow-[0_0_36px_rgba(34,211,238,.18)]">
                      <span className="absolute inset-2 rounded-full border border-dashed border-violet-300/55 motion-safe:animate-[spin_24s_linear_infinite] motion-reduce:animate-none" />
                      <span className="absolute inset-4 rounded-full border border-cyan-300/30" />
                      <svg viewBox="0 0 64 64" className="relative h-12 w-12 drop-shadow-[0_0_10px_rgba(103,232,249,.7)]" fill="none">
                        <path d="M32 8V22M32 42V56M8 32H22M42 32H56M15 15L25 25M39 39L49 49M49 15L39 25M25 39L15 49" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M32 22L42 32L32 42L22 32Z" stroke="#C4B5FD" strokeWidth="2"/>
                        <circle cx="32" cy="32" r="4" fill="#A5F3FC"/>
                      </svg>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">Neural Core / Ready</p>
                    <h4 className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl">Seleccioná tu modo</h4>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
                      Elegí una actividad para entrar a su experiencia. Cada nodo tiene su propio desafío.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      <span className="rounded-md border border-cyan-300/25 bg-cyan-300/[0.06] px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-cyan-100">Touch to select</span>
                      <span className="rounded-md border border-violet-300/25 bg-violet-300/[0.06] px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider text-violet-100">Arcade online</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
        ), document.body)}
    </section>
  );
}
