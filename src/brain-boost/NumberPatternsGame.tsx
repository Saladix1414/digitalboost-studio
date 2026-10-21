import { useMemo, useReducer, useState } from "react";
import BrainBoostCanvas from "./BrainBoostCanvas";
import { generateNumberPatternPuzzle } from "./logicReactorEngine";
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

const STORAGE_KEY = "digitalboost:brain-boost:number-patterns:v1";

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

export default function NumberPatternsGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [coreLevel, setCoreLevel] = useState(
    () => readProgress().unlockedLevel,
  );
  const [seed, setSeed] = useState(271);
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
    () => generateNumberPatternPuzzle(coreLevel + round, seed + round * 37),
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
      // La misión sigue siendo jugable si el almacenamiento no está disponible.
    }

    dispatch({ type: "ADVANCE", roundsInRun });
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.10),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.12),transparent_40%)]" />

<BrainBoostCanvas theme="numbers" intensity={0.28} seed={23} />

      <div className="relative">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              Brain Boost · Logic Core
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Number Patterns
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Descubrí la regla detrás de cada secuencia. Afiná tu razonamiento
              numérico y avanzá hacia desafíos más complejos.
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
              Secuencias · Núcleo {coreLevel}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Resolvé {roundsInRun} desafíos numéricos. Las reglas pueden usar
              diferencias constantes, incrementos alternados, cuadrados o
              relaciones entre términos. Necesitás cuatro aciertos para
              desbloquear el siguiente núcleo.
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
              Iniciar misión
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Progreso de misión
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
              className="mb-6 h-2 overflow-hidden rounded-full bg-white/10"
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

            <article className="rounded-2xl border border-white/10 bg-slate-900/85 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                  Patrón numérico
                </span>
                <span className="text-xs text-slate-500">
                  Nivel {puzzle.level}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black sm:text-2xl">
                {puzzle.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{puzzle.subtitle}</p>
              <p className="mt-5 text-base leading-7 text-slate-100">
                {puzzle.prompt}
              </p>

              <div className="my-5 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-cyan-300/15 bg-black/20 p-4 sm:gap-3">
                {puzzle.sequence?.map((item, index) => (
                  <div
                    key={`${index}-${item}`}
                    className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-300/[0.07] px-3 text-lg font-black text-cyan-100 sm:min-h-14 sm:min-w-14 sm:text-xl"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                ¿Qué número continúa la secuencia?
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {puzzle.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isCorrect = choice.id === puzzle.correctChoiceId;

                  let choiceStyle =
                    "border-white/10 bg-white/[0.03] hover:border-cyan-200/40 hover:bg-cyan-300/[0.06]";

                  if (feedback && isCorrect) {
                    choiceStyle =
                      "border-emerald-300/60 bg-emerald-300/10 text-emerald-100";
                  } else if (feedback && isSelected && !isCorrect) {
                    choiceStyle =
                      "border-rose-300/60 bg-rose-300/10 text-rose-100";
                  }

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={feedback !== null}
                      aria-pressed={isSelected}
                      onClick={() => chooseAnswer(choice.id)}
                      className={`min-h-14 rounded-xl border p-4 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-default ${choiceStyle}`}
                    >
                      <span className="mr-3 text-xs text-slate-500">
                        {choice.id.toUpperCase()}
                      </span>
                      {choice.label}
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
                      ? "¡Respuesta correcta!"
                      : "No era esa. Revisá la regla y aprendé del intento."}
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
            </article>

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
                  ? "Núcleo maestro dominado"
                  : "Núcleo estabilizado"
                : "Misión completada"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {correctCount >= 4
                ? isFinalRun
                  ? "Completaste todos los niveles de Number Patterns. Podés repetir el tramo final para mejorar tu puntuación."
                  : "Superaste el objetivo. El siguiente núcleo ya está disponible."
                : "Necesitás cuatro respuestas correctas para desbloquear el siguiente núcleo. Podés volver a intentarlo."}
            </p>

            <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="mt-1 text-2xl font-black text-cyan-100">{score}</p>
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
              Esta puntuación pertenece al juego y no representa una medición
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
