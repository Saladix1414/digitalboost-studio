import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import BrainBoostCanvas from "./BrainBoostCanvas";
import SpatialRiftPhaserLayer from "./SpatialRiftPhaserLayer";
import {
  drawSpatialChoicePreview,
  drawSpatialRiftScene,
  generateSpatialPuzzle,
  type SpatialChoice,
  type SpatialPuzzle,
} from "./spatialRiftEngine";
import {
  getRoundsInRun,
  getUnlockedLevelAfterRun,
  MAX_LEVEL,
  normalizeCoreLevel,
  safeInteger,
} from "./logicReactorProgress";
import {
  createInitialLogicReactorSession,
  logicReactorSessionReducer,
} from "./logicReactorSession";

type Progress = {
  unlockedLevel: number;
  bestScore: number;
  completedRuns: number;
};

const STORAGE_KEY = "digitalboost:brain-boost:spatial-rift:v1";

function readProgress(): Progress {
  const fallback: Progress = {
    unlockedLevel: 1,
    bestScore: 0,
    completedRuns: 0,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<Progress>;
    return {
      unlockedLevel: normalizeCoreLevel(saved.unlockedLevel),
      bestScore: safeInteger(saved.bestScore, 0, 0, 1_000_000),
      completedRuns: safeInteger(saved.completedRuns, 0, 0, 1_000_000_000),
    };
  } catch {
    return fallback;
  }
}

function SpatialSceneCanvas({ puzzle }: { puzzle: SpatialPuzzle }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let active = true;
    let frameId = 0;
    const startTime = performance.now();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function render(elapsed: number) {
      if (!active) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSpatialRiftScene(ctx, width, height, puzzle, elapsed);
    }

    function tick(now: number) {
      if (!active) return;
      render(now - startTime);
      if (!reducedMotion) frameId = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => {
      render(reducedMotion ? 0 : performance.now() - startTime);
    });

    observer.observe(canvas);
    render(0);

    if (!reducedMotion) frameId = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [puzzle]);

  return (
    <div className="relative h-64 w-full sm:h-72">
      <canvas
        ref={canvasRef}
        width={720}
        height={320}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
      />
      <SpatialRiftPhaserLayer />
    </div>
  );
}

function SpatialChoiceCanvas({
  puzzle,
  choice,
}: {
  puzzle: SpatialPuzzle;
  choice: SpatialChoice;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function draw() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSpatialChoicePreview(ctx, width, height, puzzle, choice);
    }

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();

    return () => observer.disconnect();
  }, [puzzle, choice]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={140}
      aria-hidden="true"
      className="block h-28 w-full rounded-lg sm:h-32"
    />
  );
}

export default function SpatialRiftGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [coreLevel, setCoreLevel] = useState(
    () => readProgress().unlockedLevel,
  );
  const [seed, setSeed] = useState(733);
  const [session, dispatch] = useReducer(
    logicReactorSessionReducer,
    createInitialLogicReactorSession(),
  );

  const {
    phase,
    round,
    score,
    streak,
    correctCount,
    hintsUsed,
    selectedChoiceId,
    feedback,
  } = session;

  const puzzle = useMemo(
    () => generateSpatialPuzzle(coreLevel + round, seed + round * 41),
    [coreLevel, round, seed],
  );

  const roundsInRun = getRoundsInRun(coreLevel);
  const isFinalRun = coreLevel + roundsInRun - 1 >= MAX_LEVEL;

  function beginRun(level: number, nextSeed: number) {
    setCoreLevel(normalizeCoreLevel(level));
    setSeed(nextSeed);
    dispatch({ type: "START" });
  }

  function chooseAnswer(choiceId: string) {
    dispatch({
      type: "ANSWER",
      choiceId,
      correctChoiceId: puzzle.correctChoiceId,
    });
  }

  function advanceRound() {
    if (!feedback) return;

    if (round < roundsInRun - 1) {
      dispatch({ type: "ADVANCE", roundsInRun });
      return;
    }

    const nextProgress: Progress = {
      unlockedLevel: getUnlockedLevelAfterRun(
        progress.unlockedLevel,
        coreLevel,
        correctCount,
      ),
      bestScore: Math.max(progress.bestScore, score),
      completedRuns: progress.completedRuns + 1,
    };

    setProgress(nextProgress);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
    } catch {
      // El juego continúa si el almacenamiento no está disponible.
    }

    dispatch({ type: "ADVANCE", roundsInRun });
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.15),transparent_42%)]" />

<BrainBoostCanvas theme="spatial" intensity={0.32} seed={17} />

      <div className="relative">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              Brain Boost · Spatial Lab
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Spatial Rift
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Entrá en un espacio vectorial. Interpretá giros, reconocé
              reflejos y encontrá la transformación correcta.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-violet-200">
              Nivel desbloqueado
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {progress.unlockedLevel}
            </p>
          </div>
        </header>

        {phase === "briefing" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Preparación de misión
            </p>
            <h3 className="mt-3 text-xl font-bold">
              Rift Sequence · Núcleo {coreLevel}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Completá {roundsInRun} desafíos de rotación mental. La dificultad
              evoluciona desde giros amplios hasta ángulos más precisos.
              Necesitás cuatro aciertos para desbloquear el próximo núcleo.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Desafíos</p>
                <p className="mt-1 text-xl font-black">
                  {String(roundsInRun).padStart(2, "0")}
                </p>
              </div>
              <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Pistas por desafío</p>
                <p className="mt-1 text-xl font-black">02</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-400">Récord local</p>
                <p className="mt-1 text-xl font-black">{progress.bestScore}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => beginRun(coreLevel, seed)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              Entrar al Rift
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Rift Sequence
                </p>
                <p className="mt-1 text-sm font-bold">
                  Desafío {round + 1} de {roundsInRun}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="text-xl font-black text-cyan-200">{score}</p>
              </div>
            </div>

            <div
              className="mb-4 h-2 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Progreso de la misión"
              aria-valuemin={0}
              aria-valuemax={roundsInRun}
              aria-valuenow={round + 1}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-300"
                style={{ width: `${((round + 1) / roundsInRun) * 100}%` }}
              />
            </div>

            <div className="mb-5 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071020] shadow-[0_0_36px_rgba(34,211,238,.08)]">
              <SpatialSceneCanvas puzzle={puzzle} />
              <div className="border-t border-white/[0.07] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                  {puzzle.title} · Nivel {puzzle.level}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {puzzle.prompt}
                </p>
              </div>
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Elegí la pieza transformada correcta
            </p>

            <div className="grid grid-cols-2 gap-3">
              {puzzle.choices.map((choice) => {
                const selected = selectedChoiceId === choice.id;
                const correct = choice.id === puzzle.correctChoiceId;

                let style =
                  "border-white/10 bg-slate-900/70 hover:border-cyan-200/50 hover:bg-cyan-300/[0.05]";

                if (feedback && correct) {
                  style = "border-emerald-300/70 bg-emerald-300/[0.08]";
                } else if (feedback && selected && !correct) {
                  style = "border-rose-300/70 bg-rose-300/[0.08]";
                }

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={feedback !== null}
                    aria-pressed={selected}
                    aria-label={`Opción ${choice.label}, pieza transformada`}
                    onClick={() => chooseAnswer(choice.id)}
                    className={`min-w-0 overflow-hidden rounded-xl border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-default sm:p-3 ${style}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 px-1">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-200">
                        Opción {choice.label}
                      </span>
                      {feedback && correct && (
                        <span className="text-xs font-bold text-emerald-200">
                          Correcta
                        </span>
                      )}
                      {feedback && selected && !correct && (
                        <span className="text-xs font-bold text-rose-200">
                          Elegida
                        </span>
                      )}
                    </div>
                    <SpatialChoiceCanvas puzzle={puzzle} choice={choice} />
                  </button>
                );
              })}
            </div>

            {!feedback && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REVEAL_HINT" })}
                  disabled={hintsUsed >= 2}
                  className="rounded-lg border border-violet-300/25 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-violet-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {hintsUsed >= 2
                    ? "Pistas agotadas"
                    : `Revelar pista ${hintsUsed + 1} de 2`}
                </button>

                {hintsUsed > 0 && (
                  <div className="mt-3 rounded-lg border border-violet-300/15 bg-violet-300/[0.05] p-3 text-sm leading-6 text-violet-100">
                    {puzzle.hints.slice(0, hintsUsed).map((hint, index) => (
                      <p
                        key={index}
                        className={
                          index === 0
                            ? ""
                            : "mt-2 border-t border-violet-300/10 pt-2"
                        }
                      >
                        <span className="font-bold text-violet-200">
                          Pista {index + 1}:
                        </span>{" "}
                        {hint}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {feedback && (
              <div
                className={`mt-5 rounded-xl border p-4 ${
                  feedback.correct
                    ? "border-emerald-300/25 bg-emerald-300/[0.07]"
                    : "border-rose-300/25 bg-rose-300/[0.07]"
                }`}
                aria-live="polite"
              >
                <p className="font-bold">
                  {feedback.correct
                    ? "¡Transformación correcta!"
                    : "No era esa. Compará los vértices y fijate si la pieza está reflejada."}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {puzzle.explanation}
                </p>
                <button
                  type="button"
                  onClick={advanceRound}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
                >
                  {round < roundsInRun - 1
                    ? "Siguiente desafío"
                    : "Ver resultados"}
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
              <span>Racha actual: {streak}</span>
              <span>Pistas utilizadas: {hintsUsed}/2</span>
            </div>
          </div>
        )}

        {phase === "results" && (
          <div className="rounded-2xl border border-violet-300/20 bg-slate-900/85 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-200">
              Informe de misión
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">
              {correctCount >= 4
                ? isFinalRun
                  ? "Rift dominado"
                  : "Núcleo estabilizado"
                : "Misión completada"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {correctCount >= 4
                ? isFinalRun
                  ? "Completaste todos los niveles de Spatial Rift. Podés repetir el tramo final para mejorar tu puntuación."
                  : "Superaste el objetivo. El siguiente núcleo ya está disponible."
                : isFinalRun
                  ? "Necesitás cuatro aciertos para completar el núcleo final. Podés volver a intentarlo."
                  : "Necesitás cuatro respuestas correctas para desbloquear el próximo núcleo. Podés intentarlo de nuevo."}
            </p>

            <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="mt-1 text-2xl font-black text-cyan-100">
                  {score}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Aciertos</p>
                <p className="mt-1 text-2xl font-black text-emerald-100">
                  {correctCount}/{roundsInRun}
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.05] p-4 sm:col-span-1">
                <p className="text-xs text-slate-400">Récord local</p>
                <p className="mt-1 text-2xl font-black text-violet-100">
                  {progress.bestScore}
                </p>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              La puntuación pertenece al juego y no representa una medición
              clínica de inteligencia.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {progress.unlockedLevel > coreLevel && (
                <button
                  type="button"
                  onClick={() => beginRun(progress.unlockedLevel, seed + 131)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Desbloquear núcleo {progress.unlockedLevel}
                </button>
              )}
              <button
                type="button"
                onClick={() => beginRun(coreLevel, seed + 173)}
                className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Repetir misión
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "RETURN_TO_BRIEFING" })}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
