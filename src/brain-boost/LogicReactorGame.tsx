import { useMemo, useState } from "react";
import {
  generateLogicPuzzle,
  type LogicPuzzle,
} from "./logicReactorEngine";

type Progress = {
  unlockedLevel: number;
  bestScore: number;
  completedRuns: number;
};

type Feedback = {
  correct: boolean;
};

const STORAGE_KEY = "digitalboost:brain-boost:logic-reactor:v1";

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
      unlockedLevel:
        typeof saved.unlockedLevel === "number"
          ? Math.max(1, saved.unlockedLevel)
          : 1,
      bestScore:
        typeof saved.bestScore === "number"
          ? Math.max(0, saved.bestScore)
          : 0,
      completedRuns:
        typeof saved.completedRuns === "number"
          ? Math.max(0, saved.completedRuns)
          : 0,
    };
  } catch {
    return fallback;
  }
}

export default function LogicReactorGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [coreLevel, setCoreLevel] = useState(
    () => readProgress().unlockedLevel,
  );
  const [seed, setSeed] = useState(103);
  const [phase, setPhase] = useState<"briefing" | "playing" | "results">(
    "briefing",
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const puzzle: LogicPuzzle = useMemo(
    () => generateLogicPuzzle(coreLevel + round, seed + round * 31),
    [coreLevel, round, seed],
  );

  function beginRun(level: number, nextSeed: number) {
    setCoreLevel(level);
    setSeed(nextSeed);
    setRound(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setHintsUsed(0);
    setSelectedChoiceId(null);
    setFeedback(null);
    setPhase("playing");
  }

  function chooseAnswer(choiceId: string) {
    if (feedback) return;

    const correct = choiceId === puzzle.correctChoiceId;
    setSelectedChoiceId(choiceId);
    setFeedback({ correct });

    if (correct) {
      setScore((current) => current + 100 + streak * 15);
      setStreak((current) => current + 1);
      setCorrectCount((current) => current + 1);
    } else {
      setStreak(0);
    }
  }

  function revealHint() {
    setHintsUsed((current) => Math.min(2, current + 1));
  }

  function advanceRound() {
    if (!feedback) return;

    if (round < 4) {
      setRound((current) => current + 1);
      setHintsUsed(0);
      setSelectedChoiceId(null);
      setFeedback(null);
      return;
    }

    const nextProgress: Progress = {
      unlockedLevel:
        correctCount >= 4
          ? Math.max(progress.unlockedLevel, coreLevel + 1)
          : progress.unlockedLevel,
      bestScore: Math.max(progress.bestScore, score),
      completedRuns: progress.completedRuns + 1,
    };

    setProgress(nextProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
    } catch {
      // El juego sigue funcionando si el almacenamiento no está disponible.
    }
    setPhase("results");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.10),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.12),transparent_40%)]" />

      <div className="relative">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              Brain Boost · Logic Core
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Logic Reactor
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Detectá patrones, deducí reglas y activá el núcleo lógico.
              Cada respuesta cuenta.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-violet-200">
              Núcleo disponible
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
              Núcleo lógico {coreLevel}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Superá cinco desafíos. Vas a encontrar patrones numéricos,
              reglas simbólicas y deducciones condicionales. Necesitás
              cuatro respuestas correctas para desbloquear el siguiente núcleo.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Desafíos</p>
                <p className="mt-1 text-xl font-black">05</p>
              </div>
              <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Pistas por desafío</p>
                <p className="mt-1 text-xl font-black">02</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-400">Récord local</p>
                <p className="mt-1 text-xl font-black">
                  {progress.bestScore}
                </p>
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
                  Desafío {round + 1} de 5
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
              aria-valuemax={5}
              aria-valuenow={round + 1}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-300"
                style={{ width: `${((round + 1) / 5) * 100}%` }}
              />
            </div>

            <article className="rounded-2xl border border-white/10 bg-slate-900/85 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                  {puzzle.kind === "number-pattern"
                    ? "Patrones numéricos"
                    : puzzle.kind === "symbol-rule"
                      ? "Reglas simbólicas"
                      : "Lógica condicional"}
                </span>
                <span className="text-xs text-slate-500">
                  Nivel {puzzle.level}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black sm:text-2xl">
                {puzzle.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {puzzle.subtitle}
              </p>
              <p className="mt-5 text-base leading-7 text-slate-100">
                {puzzle.prompt}
              </p>

              {puzzle.sequence && (
                <div className="my-5 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-cyan-300/15 bg-black/20 p-4 sm:gap-3">
                  {puzzle.sequence.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-300/[0.07] px-3 text-lg font-black text-cyan-100 sm:min-h-14 sm:min-w-14 sm:text-xl"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {puzzle.logicLines && (
                <div className="my-5 space-y-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.04] p-4">
                  {puzzle.logicLines.map((line, index) => (
                    <p
                      key={`${index}-${line}`}
                      className="text-sm leading-6 text-violet-100"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}

              <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                Seleccioná una respuesta
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
                    onClick={revealHint}
                    disabled={hintsUsed >= 2}
                    className="rounded-lg border border-violet-300/25 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-violet-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {hintsUsed >= 2
                      ? "Pistas agotadas"
                      : `Revelar pista ${hintsUsed + 1} de 2`}
                  </button>

                  {hintsUsed > 0 && (
                    <p className="mt-3 rounded-lg border border-violet-300/15 bg-violet-300/[0.05] p-3 text-sm leading-6 text-violet-100">
                      {puzzle.hints[hintsUsed - 1]}
                    </p>
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
                      : "El núcleo sigue activo: aprendé de este intento."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {puzzle.explanation}
                  </p>
                  <button
                    type="button"
                    onClick={advanceRound}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
                  >
                    {round < 4 ? "Siguiente desafío" : "Ver resultados"}
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
              {correctCount >= 4 ? "Núcleo estabilizado" : "Misión completada"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {correctCount >= 4
                ? "Superaste el objetivo. El siguiente núcleo ya está disponible."
                : "Necesitás cuatro respuestas correctas para desbloquear el siguiente núcleo. Podés volver a intentarlo."}
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
                  {correctCount}/5
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
              La puntuación es propia de este juego; no representa un diagnóstico
              ni una medición clínica de inteligencia.
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
                onClick={() => setPhase("briefing")}
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
