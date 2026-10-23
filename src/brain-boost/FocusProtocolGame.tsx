import { useEffect, useMemo, useReducer, useState } from "react";
import BrainBoostCanvas from "./BrainBoostCanvas";
import {
  isBrainBoostAudioEnabled,
  playBrainBoostSfx,
  startBrainBoostAmbience,
  startBrainBoostMusic,
  stopBrainBoostAmbience,
  stopBrainBoostMusic,
  subscribeBrainBoostAudioEnabled,
} from "./brainBoostAudio";
import { generateFocusChallenge } from "./focusProtocolEngine";
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

const STORAGE_KEY = "digitalboost:brain-boost:focus-protocol:v1";

function readProgress(): Progress {
  const fallback: Progress = {
    unlockedLevel: 1,
    bestScore: 0,
    completedRuns: 0,
  };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

export default function FocusProtocolGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [coreLevel, setCoreLevel] = useState(
    () => readProgress().unlockedLevel,
  );
  const [seed, setSeed] = useState(41);
  const [remainingMs, setRemainingMs] = useState(12000);
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

  const challenge = useMemo(
    () => generateFocusChallenge(coreLevel + round, seed + round * 31),
    [coreLevel, round, seed],
  );

  const roundsInRun = getRoundsInRun(coreLevel);
  const isFinalRun = coreLevel + roundsInRun - 1 >= MAX_LEVEL;
  const timeLimitMs = Math.max(
    3500,
    12000 - (challenge.level - 1) * 90,
  );

  const eliminatedIndices = useMemo(
    () => challenge.tiles
      .map((symbol, index) => ({ symbol, index }))
      .filter((tile) => tile.symbol !== challenge.target)
      .slice(0, hintsUsed)
      .map((tile) => tile.index),
    [challenge, hintsUsed],
  );

  useEffect(() => {
    const syncAudio = (enabled: boolean) => {
      if (phase === "playing" && enabled) {
        startBrainBoostAmbience("focus-protocol");
        startBrainBoostMusic("focus-protocol");
      } else {
        stopBrainBoostMusic("focus-protocol");
        stopBrainBoostAmbience("focus-protocol");
      }
    };

    syncAudio(isBrainBoostAudioEnabled());
    const unsubscribe = subscribeBrainBoostAudioEnabled(syncAudio);

    return () => {
      unsubscribe();
      stopBrainBoostMusic("focus-protocol");
      stopBrainBoostAmbience("focus-protocol");
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || feedback !== null) return;

    const deadline = Date.now() + timeLimitMs;
    let submitted = false;
    setRemainingMs(timeLimitMs);

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);

      if (remaining === 0 && !submitted) {
        submitted = true;
        window.clearInterval(timer);
        playBrainBoostSfx("focus-protocol", "incorrect");
        dispatch({
          type: "ANSWER",
          choiceId: "timeout",
          correctChoiceId: String(challenge.correctIndex),
        });
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [phase, feedback, timeLimitMs, challenge.correctIndex]);

  function beginRun(level: number, nextSeed: number) {
    setCoreLevel(normalizeCoreLevel(level));
    setSeed(nextSeed);
    setRemainingMs(12000);
    playBrainBoostSfx("focus-protocol", "start");
    dispatch({ type: "START" });
  }

  function chooseCell(index: number) {
    if (phase !== "playing" || feedback !== null) return;

    const correct = index === challenge.correctIndex;

    playBrainBoostSfx(
      "focus-protocol",
      correct ? "correct" : "incorrect",
    );

    dispatch({
      type: "ANSWER",
      choiceId: String(index),
      correctChoiceId: String(challenge.correctIndex),
    });
  }

  function revealHint() {
    if (phase !== "playing" || feedback !== null || hintsUsed >= 2) return;

    playBrainBoostSfx("focus-protocol", "hint");
    dispatch({ type: "REVEAL_HINT" });
  }

  function advanceRound() {
    if (feedback === null) return;

    playBrainBoostSfx(
      "focus-protocol",
      round < roundsInRun - 1 ? "advance" : "complete",
    );

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
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextProgress),
      );
    } catch {
      // El juego sigue funcionando si el almacenamiento no está disponible.
    }

    dispatch({ type: "ADVANCE", roundsInRun });
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-300/25 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.13),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.10),transparent_40%)]" />
      <BrainBoostCanvas theme="focus" intensity={0.24} seed={47} />

      <div className="relative">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
              Brain Boost · Focus Lab
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Focus Protocol
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Detectá el símbolo objetivo entre distractores. La precisión
              y el tiempo ponen a prueba tu atención selectiva.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-emerald-200">
              Nivel desbloqueado
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {progress.unlockedLevel}
            </p>
          </div>
        </header>

        {phase === "briefing" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Preparación de misión
            </p>
            <h3 className="mt-3 text-xl font-bold">
              Protocolo de atención · Nivel {coreLevel}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Resolvé {roundsInRun} pruebas. Encontrá el único símbolo que
              coincide con el objetivo antes de que termine el tiempo.
              Cuatro aciertos desbloquean el siguiente núcleo.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Desafíos</p>
                <p className="mt-1 text-xl font-black">
                  {String(roundsInRun).padStart(2, "0")}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Pistas por ronda</p>
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
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              Iniciar protocolo
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
                  Desafío {round + 1} de {roundsInRun} · Nivel {challenge.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="text-xl font-black text-emerald-200">{score}</p>
              </div>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all duration-300"
                style={{ width: `${((round + 1) / roundsInRun) * 100}%` }}
              />
            </div>

            <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-[#061611]/90 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                  Detectá este objetivo
                </p>
                <p
                  className={`font-mono text-sm font-black tabular-nums ${
                    remainingMs < timeLimitMs * 0.25
                      ? "text-rose-300"
                      : "text-cyan-100"
                  }`}
                >
                  {(remainingMs / 1000).toFixed(1)} s
                </p>
              </div>

              <div className="mt-4 flex min-h-24 items-center justify-center rounded-xl border border-emerald-200/20 bg-emerald-200/[0.04]">
                <span className="text-6xl font-black text-emerald-100 drop-shadow-[0_0_18px_rgba(52,211,153,.4)]">
                  {challenge.target}
                </span>
              </div>
            </div>

            <div
              className="grid gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${challenge.gridSize}, minmax(0, 1fr))`,
              }}
              aria-label="Cuadrícula de búsqueda"
            >
              {challenge.tiles.map((symbol, index) => {
                const selected = selectedChoiceId === String(index);
                const eliminated = eliminatedIndices.includes(index);
                let style = "border-white/10 bg-white/[0.035] text-slate-100 hover:border-emerald-200/50 hover:bg-emerald-300/[0.08]";

                if (feedback !== null && index === challenge.correctIndex) {
                  style = "border-emerald-200/80 bg-emerald-300/20 text-emerald-100";
                } else if (feedback !== null && selected) {
                  style = "border-rose-300/70 bg-rose-300/15 text-rose-100";
                } else if (eliminated) {
                  style = "border-amber-200/20 bg-slate-950/60 text-slate-600 opacity-40";
                }

                return (
                  <button
                    key={`${challenge.level}-${index}`}
                    type="button"
                    disabled={feedback !== null || eliminated}
                    aria-label={`Casilla ${index + 1}, símbolo ${symbol}`}
                    aria-pressed={selected}
                    onClick={() => chooseCell(index)}
                    className={`relative flex aspect-square items-center justify-center rounded-xl border text-2xl font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 sm:rounded-2xl sm:text-4xl ${style}`}
                  >
                    {symbol}
                    {eliminated && feedback === null && (
                      <span className="absolute right-1 top-1 text-[10px] text-amber-200">
                        ×
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {feedback === null && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Racha: {streak} · Pistas: {hintsUsed}/2
                </p>
                <button
                  type="button"
                  onClick={revealHint}
                  disabled={hintsUsed >= 2}
                  className="rounded-lg border border-amber-200/25 px-4 py-2.5 text-sm font-bold text-amber-100 transition hover:bg-amber-200/10 disabled:opacity-40"
                >
                  {hintsUsed >= 2
                    ? "Pistas agotadas"
                    : `Descartar distractor · ${hintsUsed + 1}/2`}
                </button>
              </div>
            )}

            {feedback !== null && (
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
                    ? "¡Objetivo localizado!"
                    : selectedChoiceId === "timeout"
                      ? "Tiempo agotado"
                      : "Ese símbolo no coincide."}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {feedback.correct
                    ? "Buena detección. Prepará la atención para el próximo desafío."
                    : `El objetivo era ${challenge.target}. Compará la forma exacta antes de elegir.`}
                </p>
                <button
                  type="button"
                  onClick={advanceRound}
                  className="mt-4 rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-3 text-sm font-black text-slate-950"
                >
                  {round < roundsInRun - 1 ? "Siguiente desafío" : "Ver resultados"}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "results" && (
          <div className="rounded-2xl border border-emerald-300/20 bg-slate-900/85 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Informe de misión
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">
              {correctCount >= 4
                ? isFinalRun ? "Protocolo dominado" : "Protocolo estabilizado"
                : "Misión completada"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {correctCount >= 4
                ? isFinalRun
                  ? "Completaste los niveles de Focus Protocol."
                  : `El siguiente núcleo quedó desbloqueado: nivel ${progress.unlockedLevel}.`
                : "Necesitás cuatro aciertos para desbloquear el siguiente núcleo. Podés repetir la misión."}
            </p>

            <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="mt-1 text-2xl font-black text-emerald-100">{score}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Aciertos</p>
                <p className="mt-1 text-2xl font-black text-cyan-100">
                  {correctCount}/{roundsInRun}
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.05] p-4 sm:col-span-1">
                <p className="text-xs text-slate-400">Récord local</p>
                <p className="mt-1 text-2xl font-black text-violet-100">{progress.bestScore}</p>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Desafío recreativo de atención; no es una evaluación médica ni diagnóstica.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {progress.unlockedLevel > coreLevel && (
                <button
                  type="button"
                  onClick={() => beginRun(progress.unlockedLevel, seed + 131)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-3 text-sm font-black text-slate-950"
                >
                  Desbloquear nivel {progress.unlockedLevel}
                </button>
              )}
              <button
                type="button"
                onClick={() => beginRun(coreLevel, seed + 173)}
                className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold"
              >
                Repetir misión
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
