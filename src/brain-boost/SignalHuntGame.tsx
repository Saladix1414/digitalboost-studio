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
import { generateSignalHuntChallenge } from "./signalHuntEngine";
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

const STORAGE_KEY = "digitalboost:brain-boost:signal-hunt:v1";
const PULSE_LABELS = ["●", "◆", "▲", "✦"];

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

export default function SignalHuntGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [coreLevel, setCoreLevel] = useState(() => readProgress().unlockedLevel);
  const [seed, setSeed] = useState(71);
  const [remainingMs, setRemainingMs] = useState(15000);
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
    () => generateSignalHuntChallenge(coreLevel + round, seed + round * 37),
    [coreLevel, round, seed],
  );

  const roundsInRun = getRoundsInRun(coreLevel);
  const isFinalRun = coreLevel + roundsInRun - 1 >= MAX_LEVEL;
  const timeLimitMs = Math.max(
    4500,
    15000 - (challenge.level - 1) * 100,
  );

  const eliminatedIds = useMemo(() => {
    return challenge.channels
      .filter((channel) => channel.id !== challenge.correctChannelId)
      .slice(0, hintsUsed)
      .map((channel) => channel.id);
  }, [challenge, hintsUsed]);

  useEffect(() => {
    const syncAudio = (enabled: boolean) => {
      if (phase === "playing" && enabled) {
        startBrainBoostAmbience("signal-hunt");
        startBrainBoostMusic("signal-hunt");
      } else {
        stopBrainBoostMusic("signal-hunt");
        stopBrainBoostAmbience("signal-hunt");
      }
    };

    syncAudio(isBrainBoostAudioEnabled());
    return subscribeBrainBoostAudioEnabled(syncAudio);
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
        playBrainBoostSfx("signal-hunt", "incorrect");
        dispatch({
          type: "ANSWER",
          choiceId: "timeout",
          correctChoiceId: challenge.correctChannelId,
        });
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [phase, feedback, timeLimitMs, challenge.correctChannelId]);

  function beginRun(level: number, nextSeed: number) {
    setCoreLevel(normalizeCoreLevel(level));
    setSeed(nextSeed);
    setRemainingMs(15000);
    playBrainBoostSfx("signal-hunt", "start");
    dispatch({ type: "START" });
  }

  function chooseChannel(channelId: string) {
    if (phase !== "playing" || feedback !== null) return;

    playBrainBoostSfx(
      "signal-hunt",
      channelId === challenge.correctChannelId ? "correct" : "incorrect",
    );

    dispatch({
      type: "ANSWER",
      choiceId: channelId,
      correctChoiceId: challenge.correctChannelId,
    });
  }

  function revealHint() {
    if (phase !== "playing" || feedback !== null || hintsUsed >= 2) return;

    playBrainBoostSfx("signal-hunt", "hint");
    dispatch({ type: "REVEAL_HINT" });
  }

  function advanceRound() {
    if (feedback === null) return;

    playBrainBoostSfx(
      "signal-hunt",
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
    } catch {
      // El progreso de la sesión sigue disponible aunque falle el almacenamiento.
    }

    dispatch({ type: "ADVANCE", roundsInRun });
  }

  const timePercent = Math.max(0, Math.min(100, (remainingMs / timeLimitMs) * 100));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.15),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.12),transparent_40%)]" />
      <BrainBoostCanvas theme="focus" intensity={0.3} seed={83} />

      <div className="relative">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              Brain Boost · Focus Lab
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Signal Hunt</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Interceptá el canal cuya secuencia coincide exactamente con la señal objetivo.
              Los canales falsos imitan el patrón, pero cambian algunos pulsos.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3">
            <p className="text-xs text-slate-400">Núcleo desbloqueado</p>
            <p className="text-2xl font-black text-cyan-100">{progress.unlockedLevel}</p>
          </div>
        </header>

        {phase === "briefing" && (
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/85 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
              Protocolo de intercepción
            </p>
            <h3 className="mt-3 text-xl font-black sm:text-2xl">
              Encontrá la transmisión auténtica
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Compará el orden y la forma de los pulsos. Una diferencia mínima
              significa que el canal es falso. Completá la ronda antes de que se agote
              el tiempo para mantener tu racha.
            </p>
            <div className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-400">Rondas</p>
                <p className="mt-1 text-xl font-black">{roundsInRun}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-400">Canales iniciales</p>
                <p className="mt-1 text-xl font-black">3</p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-1">
                <p className="text-xs text-slate-400">Récord local</p>
                <p className="mt-1 text-xl font-black">{progress.bestScore}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => beginRun(progress.unlockedLevel, seed + 1)}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-3 font-black text-slate-950 transition hover:brightness-110"
            >
              Iniciar intercepción
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-400">Ronda</p>
                <p className="text-xl font-black">{round + 1}/{roundsInRun}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="text-xl font-black text-cyan-100">{score}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-400">Racha</p>
                <p className="text-xl font-black text-emerald-200">{streak}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-400">Nivel</p>
                <p className="text-xl font-black">{challenge.level}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.05] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                    Señal objetivo · TX-Ω
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Memoriza la secuencia y localizá su canal exacto.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-cyan-100">
                  {Math.ceil(remainingMs / 1000)}s
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 transition-[width]"
                  style={{ width: `${timePercent}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Secuencia objetivo">
                {challenge.targetPulses.map((pulse, index) => (
                  <span
                    key={index}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-200/30 bg-cyan-300/10 text-lg text-cyan-100 sm:h-12 sm:w-12"
                  >
                    {PULSE_LABELS[pulse]}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {challenge.channels.map((channel, index) => {
                const eliminated = eliminatedIds.includes(channel.id);
                const selected = selectedChoiceId === channel.id;
                const isCorrect = channel.id === challenge.correctChannelId;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    disabled={feedback !== null || eliminated}
                    onClick={() => chooseChannel(channel.id)}
                    className={[
                      "min-w-0 rounded-2xl border p-4 text-left transition duration-200",
                      selected
                        ? feedback?.correct
                          ? "border-emerald-300 bg-emerald-300/10"
                          : "border-rose-300 bg-rose-300/10"
                        : "border-white/10 bg-slate-900/80 hover:border-cyan-300/50 hover:bg-cyan-300/[0.05]",
                      eliminated ? "cursor-not-allowed opacity-25" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Canal {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-xs text-cyan-300/70">
                        {`SIG-${index + 1}A`}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {channel.pulses.map((pulse, pulseIndex) => (
                        <span
                          key={pulseIndex}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-300/15 bg-blue-400/[0.06] text-sm text-blue-100 sm:h-9 sm:w-9"
                        >
                          {PULSE_LABELS[pulse]}
                        </span>
                      ))}
                    </div>
                    {eliminated && (
                      <p className="mt-3 text-xs font-bold text-rose-300">Canal descartado</p>
                    )}
                    {feedback !== null && isCorrect && (
                      <p className="mt-3 text-xs font-bold text-emerald-300">Señal auténtica</p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Pistas usadas: {hintsUsed}/2 · Aciertos: {correctCount}
              </p>
              <button
                type="button"
                disabled={feedback !== null || hintsUsed >= 2}
                onClick={revealHint}
                className="rounded-xl border border-violet-300/25 bg-violet-300/[0.06] px-4 py-2.5 text-sm font-bold text-violet-100 disabled:opacity-40"
              >
                Revelar pista
              </button>
            </div>

            {feedback !== null && (
              <div
                aria-live="polite"
                className={[
                  "rounded-2xl border p-4 sm:p-5",
                  feedback.correct
                    ? "border-emerald-300/25 bg-emerald-300/[0.06]"
                    : "border-rose-300/25 bg-rose-300/[0.06]",
                ].join(" ")}
              >
                <p className="font-bold">
                  {feedback.correct
                    ? "¡Señal interceptada!"
                    : selectedChoiceId === "timeout"
                      ? "Tiempo agotado"
                      : "Canal incorrecto"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {feedback.correct
                    ? "La transmisión coincide. Mantené la concentración para la próxima ronda."
                    : "La señal auténtica era la secuencia objetivo. Compará cada pulso en el próximo intento."}
                </p>
                <button
                  type="button"
                  onClick={advanceRound}
                  className="mt-4 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-3 text-sm font-black text-slate-950"
                >
                  {round < roundsInRun - 1 ? "Siguiente señal" : "Ver resultados"}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "results" && (
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/85 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
              Informe de intercepción
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">
              {correctCount >= 4
                ? isFinalRun ? "Red dominada" : "Transmisión estabilizada"
                : "Intercepción completada"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {correctCount >= 4
                ? isFinalRun
                  ? "Completaste todos los niveles de Signal Hunt."
                  : `Nuevo núcleo desbloqueado: nivel ${progress.unlockedLevel}.`
                : "Necesitás cuatro aciertos para desbloquear el siguiente núcleo. Podés repetir la misión."}
            </p>

            <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="mt-1 text-2xl font-black text-cyan-100">{score}</p>
              </div>
              <div className="rounded-xl border border-blue-300/15 bg-blue-300/[0.05] p-4">
                <p className="text-xs text-slate-400">Aciertos</p>
                <p className="mt-1 text-2xl font-black text-blue-100">
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
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-3 font-black text-slate-950"
                >
                  Desbloquear nivel {progress.unlockedLevel}
                </button>
              )}
              <button
                type="button"
                onClick={() => beginRun(coreLevel, seed + 173)}
                className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-bold"
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
