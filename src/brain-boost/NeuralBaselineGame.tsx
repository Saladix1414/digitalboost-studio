import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  evaluateNeuralBaseline,
  generateNeuralBaselineChallenge,
  type NeuralBaselineResponse,
  type NeuralBaselineResult,
} from "./neuralBaselineEngine";
import {
  MAX_LEVEL,
  normalizeCoreLevel,
  safeInteger,
} from "./logicReactorProgress";

type HistoryEntry = {
  timestamp: number;
  level: number;
  score: number;
  accuracy: number;
  meanReactionMs: number | null;
  falseAlarms: number;
  anticipations: number;
};

type Progress = {
  unlockedLevel: number;
  bestScore: number;
  completedRuns: number;
  history: HistoryEntry[];
};

type Phase = "briefing" | "playing" | "results";

const STORAGE_KEY = "digitalboost:brain-boost:neural-baseline:v1";
const HISTORY_LIMIT = 8;

function readProgress(): Progress {
  const fallback: Progress = {
    unlockedLevel: 1,
    bestScore: 0,
    completedRuns: 0,
    history: [],
  };

  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const saved = JSON.parse(raw) as Partial<Progress>;
    const history = Array.isArray(saved.history)
      ? saved.history
          .filter((entry): entry is HistoryEntry =>
            !!entry &&
            typeof entry === "object" &&
            Number.isFinite(entry.timestamp) &&
            Number.isFinite(entry.score) &&
            Number.isFinite(entry.accuracy),
          )
          .slice(-HISTORY_LIMIT)
          .map((entry) => ({
            timestamp: safeInteger(entry.timestamp, 0, 0, 9_000_000_000_000_000),
            level: normalizeCoreLevel(entry.level),
            score: safeInteger(entry.score, 0, 0, 100),
            accuracy: safeInteger(entry.accuracy, 0, 0, 100),
            meanReactionMs:
              typeof entry.meanReactionMs === "number" &&
              Number.isFinite(entry.meanReactionMs)
                ? safeInteger(entry.meanReactionMs, 0, 0, 60_000)
                : null,
            falseAlarms: safeInteger(entry.falseAlarms, 0, 0, 15),
            anticipations: safeInteger(entry.anticipations, 0, 0, 15),
          }))
      : [];

    return {
      unlockedLevel: normalizeCoreLevel(saved.unlockedLevel),
      bestScore: safeInteger(saved.bestScore, 0, 0, 100),
      completedRuns: safeInteger(
        saved.completedRuns, 0, 0, 1_000_000_000,
      ),
      history,
    };
  } catch {
    return fallback;
  }
}

export default function NeuralBaselineGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [level, setLevel] = useState(
    () => readProgress().unlockedLevel,
  );
  const [seed, setSeed] = useState(101);
  const [phase, setPhase] = useState<Phase>("briefing");
  const [trialIndex, setTrialIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [responses, setResponses] = useState<NeuralBaselineResponse[]>([]);
  const [result, setResult] = useState<NeuralBaselineResult | null>(null);
  const [notice, setNotice] = useState("");

  const challenge = useMemo(
    () => generateNeuralBaselineChallenge(level, seed),
    [level, seed],
  );

  const responsesRef = useRef<NeuralBaselineResponse[]>([]);
  const onsetAtRef = useRef<number | null>(null);
  const answeredRef = useRef(false);

  const currentStimulus = challenge.stimuli[trialIndex];
  const totalTrials = challenge.totalTrials;
  const correctRate = result?.accuracy ?? 0;

  useEffect(() => {
    const syncAudio = (enabled: boolean) => {
      if (phase === "playing" && enabled) {
        startBrainBoostAmbience("neural-baseline");
        startBrainBoostMusic("neural-baseline");
      } else {
        stopBrainBoostMusic("neural-baseline");
        stopBrainBoostAmbience("neural-baseline");
      }
    };

    syncAudio(isBrainBoostAudioEnabled());
    const unsubscribe = subscribeBrainBoostAudioEnabled(syncAudio);

    return () => {
      unsubscribe();
      stopBrainBoostMusic("neural-baseline");
      stopBrainBoostAmbience("neural-baseline");
    };
  }, [phase]);

  function beginRun() {
    const nextLevel = normalizeCoreLevel(progress.unlockedLevel);
    const nextSeed = seed + 37;
    const nextChallenge = generateNeuralBaselineChallenge(
      nextLevel,
      nextSeed,
    );
    const cleanResponses = nextChallenge.stimuli.map(
      () => ({ reactionMs: null }),
    );

    setLevel(nextLevel);
    setSeed(nextSeed);
    responsesRef.current = cleanResponses;
    setResponses(cleanResponses);
    setTrialIndex(0);
    setVisible(false);
    setResult(null);
    setRemainingMs(0);
    setNotice("");
    onsetAtRef.current = null;
    answeredRef.current = false;
    playBrainBoostSfx("neural-baseline", "start");
    setPhase("playing");
  }

  function recordResponse() {
    if (
      phase !== "playing" ||
      answeredRef.current ||
      !currentStimulus
    ) {
      return;
    }

    const onset = onsetAtRef.current;
    let reactionMs: number;

    if (onset === null) {
      reactionMs = -1;
    } else {
      const elapsed = Math.max(0, Date.now() - onset);
      reactionMs = elapsed <= currentStimulus.responseWindowMs
        ? elapsed
        : currentStimulus.responseWindowMs + 1;
    }

    answeredRef.current = true;
    const nextResponses = [...responsesRef.current];
    nextResponses[trialIndex] = { reactionMs };
    responsesRef.current = nextResponses;
    setResponses(nextResponses);

    if (reactionMs < 0) {
      setNotice("Anticipación registrada: esperá a que aparezca la señal.");
      playBrainBoostSfx("neural-baseline", "incorrect");
    } else if (reactionMs > currentStimulus.responseWindowMs) {
      setNotice("Respuesta tardía registrada.");
      playBrainBoostSfx("neural-baseline", "incorrect");
    } else if (currentStimulus.isTarget) {
      setNotice("Respuesta registrada.");
      playBrainBoostSfx("neural-baseline", "correct");
    } else {
      setNotice("Falsa alarma registrada.");
      playBrainBoostSfx("neural-baseline", "incorrect");
    }
  }

  function completeRun() {
    const evaluated = evaluateNeuralBaseline(
      challenge,
      responsesRef.current,
    );

    const nextUnlockedLevel = evaluated.score >= 60
      ? Math.min(MAX_LEVEL, Math.max(progress.unlockedLevel, level + 1))
      : progress.unlockedLevel;

    const entry: HistoryEntry = {
      timestamp: Date.now(),
      level,
      score: evaluated.score,
      accuracy: evaluated.accuracy,
      meanReactionMs: evaluated.meanReactionMs,
      falseAlarms: evaluated.falseAlarms,
      anticipations: evaluated.anticipations,
    };

    const nextProgress: Progress = {
      unlockedLevel: nextUnlockedLevel,
      bestScore: Math.max(progress.bestScore, evaluated.score),
      completedRuns: progress.completedRuns + 1,
      history: [...progress.history, entry].slice(-HISTORY_LIMIT),
    };

    setProgress(nextProgress);
    setResult(evaluated);
    setVisible(false);
    setRemainingMs(0);
    setNotice("Calibración completada.");

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
    } catch {
      // La sesión sigue disponible aunque el almacenamiento falle.
    }

    playBrainBoostSfx("neural-baseline", "complete");
    setPhase("results");
  }

  useEffect(() => {
    if (phase !== "playing" || !currentStimulus) return;

    let onsetTimer = 0;
    let pollTimer = 0;
    let advanceTimer = 0;
    let onsetReached = false;
    let closed = false;

    const trialStartedAt = Date.now();

    onsetAtRef.current = null;
    answeredRef.current = false;
    setVisible(false);
    setRemainingMs(currentStimulus.onsetDelayMs);

    const closeTrial = () => {
      if (closed) return;
      closed = true;
      window.clearTimeout(onsetTimer);
      window.clearInterval(pollTimer);
      setVisible(false);

      advanceTimer = window.setTimeout(() => {
        if (trialIndex + 1 < totalTrials) {
          setTrialIndex((index) => index + 1);
        } else {
          completeRun();
        }
      }, 420);
    };

    onsetTimer = window.setTimeout(() => {
      if (closed || answeredRef.current) {
        closeTrial();
        return;
      }

      onsetReached = true;
      onsetAtRef.current = Date.now();
      setVisible(true);
      setRemainingMs(currentStimulus.responseWindowMs);
    }, currentStimulus.onsetDelayMs);

    pollTimer = window.setInterval(() => {
      if (closed) return;

      if (answeredRef.current) {
        closeTrial();
        return;
      }

      if (!onsetReached) {
        setRemainingMs(
          Math.max(
            0,
            currentStimulus.onsetDelayMs - (Date.now() - trialStartedAt),
          ),
        );
        return;
      }

      const elapsed = Date.now() - (onsetAtRef.current ?? Date.now());
      const visibleRemaining = Math.max(0, currentStimulus.displayMs - elapsed);
      const remaining = Math.max(0, currentStimulus.responseWindowMs - elapsed);

      if (visibleRemaining <= 0) setVisible(false);
      setRemainingMs(remaining);

      if (remaining <= 0) {
        answeredRef.current = true;
        setVisible(false);
        setNotice(
          currentStimulus.isTarget
            ? "Señal omitida. Mantené la atención."
            : "Distractor ignorado correctamente.",
        );
      }
    }, 25);

    return () => {
      closed = true;
      window.clearTimeout(onsetTimer);
      window.clearTimeout(advanceTimer);
      window.clearInterval(pollTimer);
    };
  }, [phase, trialIndex, challenge]);

  const meanPreviousReaction = progress.history
    .filter((entry) => entry.meanReactionMs !== null)
    .map((entry) => entry.meanReactionMs as number);

  const previousAverage = meanPreviousReaction.length
    ? Math.round(
        meanPreviousReaction.reduce((sum, value) => sum + value, 0)
          / meanPreviousReaction.length,
      )
    : null;
  return (
    <BrainBoostCanvas theme="focus" intensity={0.3} seed={103}>
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.13),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.10),transparent_42%)]" />
        <div className="relative space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                Brain Boost · Cognitive Lab
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Neural Baseline
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Calibrá tu respuesta ante señales visuales. Medí precisión,
                tiempo de reacción y control de impulsos en una sesión breve.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-3">
              <p className="text-xs text-slate-400">NIVEL DESBLOQUEADO</p>
              <p className="text-2xl font-black text-cyan-200">
                {progress.unlockedLevel}/{MAX_LEVEL}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <p className="text-xs text-slate-400">MEJOR PUNTAJE</p>
              <p className="mt-1 text-xl font-black">{progress.bestScore}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <p className="text-xs text-slate-400">SESIONES</p>
              <p className="mt-1 text-xl font-black">{progress.completedRuns}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <p className="text-xs text-slate-400">ÚLTIMA PRECISIÓN</p>
              <p className="mt-1 text-xl font-black">
                {progress.history.at(-1)?.accuracy ?? "—"}{progress.history.length ? "%" : ""}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <p className="text-xs text-slate-400">REACCIÓN ANTERIOR</p>
              <p className="mt-1 text-xl font-black">
                {previousAverage === null ? "—" : `${previousAverage} ms`}
              </p>
            </div>
          </div>

          {phase === "briefing" ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Protocolo de calibración
              </p>
              <h3 className="mt-3 text-xl font-black">Detectá. Respondé. Mantené el control.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                En cada ronda aparecerá un símbolo. Tocá el panel únicamente
                cuando coincida con la señal objetivo. Ignorá los distractores
                y esperá a que aparezca el estímulo antes de responder.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <p className="text-sm font-bold text-emerald-300">Acierto</p>
                  <p className="mt-1 text-xs text-slate-400">Detectar el símbolo objetivo.</p>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <p className="text-sm font-bold text-amber-300">Anticipación</p>
                  <p className="mt-1 text-xs text-slate-400">Responder antes de ver la señal.</p>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <p className="text-sm font-bold text-rose-300">Falsa alarma</p>
                  <p className="mt-1 text-xs text-slate-400">Responder a un distractor.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={beginRun}
                className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-200 sm:w-auto"
              >
                Iniciar calibración
              </button>
            </div>
          ) : phase === "playing" && currentStimulus ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/75 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Calibración activa · Nivel {level}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Prueba {trialIndex + 1} de {totalTrials}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">OBJETIVO</p>
                  <p className="text-3xl font-black text-cyan-200">
                    {challenge.targetGlyph}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-all"
                  style={{ width: `${((trialIndex + 1) / totalTrials) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={recordResponse}
                aria-label={visible ? "Responder al estímulo" : "Esperar el estímulo"}
                className={`mt-5 flex min-h-[230px] w-full flex-col items-center justify-center rounded-2xl border transition-colors sm:min-h-[280px] ${
                  visible
                    ? "border-cyan-300/60 bg-cyan-300/[0.09] shadow-[inset_0_0_45px_rgba(34,211,238,0.09)]"
                    : "border-slate-700 bg-slate-950/70"
                }`}
              >
                {visible ? (
                  <>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                      ¡Señal!
                    </span>
                    <span className="mt-3 animate-pulse text-7xl font-black text-white sm:text-8xl">
                      {currentStimulus.glyph}
                    </span>
                    <span className="mt-4 text-xs text-slate-400">
                      Tocá solo si coincide con el objetivo.
                    </span>
                  </>
                ) : onsetAtRef.current !== null && !answeredRef.current ? (
                  <>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Señal presentada
                    </span>
                    <span className="mt-3 text-sm text-slate-300">
                      La señal desapareció. Todavía podés responder.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                      Preparando estímulo
                    </span>
                    <span className="mt-3 text-5xl font-black text-slate-700">···</span>
                    <span className="mt-3 text-sm text-slate-400">
                      Esperá la señal. No respondas todavía.
                    </span>
                  </>
                )}
              </button>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Respuestas registradas: {responses.filter((item) => item.reactionMs !== null).length}/{totalTrials}</span>
                <span>Ventana: {Math.ceil(remainingMs)} ms</span>
              </div>

              <p aria-live="polite" className="mt-3 min-h-6 text-sm text-cyan-100">
                {notice || "Mantené la atención y respondé solo ante el objetivo."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/80 p-5 sm:p-7">
              {result ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Informe de calibración
                  </p>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">Sesión completada</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Puntaje recreativo · nivel {level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">PUNTAJE</p>
                      <p className="text-4xl font-black text-cyan-200">{result.score}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-xs text-slate-400">PRECISIÓN</p>
                      <p className="mt-1 text-2xl font-black">{correctRate}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-xs text-slate-400">REACCIÓN MEDIA</p>
                      <p className="mt-1 text-2xl font-black">
                        {result.meanReactionMs === null ? "—" : `${result.meanReactionMs} ms`}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-xs text-slate-400">CONSISTENCIA</p>
                      <p className="mt-1 text-2xl font-black">{result.reactionConsistency}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-xs text-slate-400">ACIERTOS</p>
                      <p className="mt-1 text-xl font-bold text-emerald-300">{result.hits}/{result.targetCount}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-xs text-slate-400">FALSAS ALARMAS</p>
                      <p className="mt-1 text-xl font-bold text-rose-300">{result.falseAlarms}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/80 p-3">
                      <p className="text-xs text-slate-400">ANTICIPACIONES</p>
                      <p className="mt-1 text-xl font-bold text-amber-300">{result.anticipations}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {result.accuracy >= 90 && result.anticipations === 0
                      ? "Buena precisión en esta sesión. Compará los próximos resultados para observar tu estabilidad."
                      : result.falseAlarms > 2
                        ? "Se registraron varias falsas alarmas. Priorizá confirmar la señal antes de responder."
                        : result.anticipations > 0
                          ? "Hubo respuestas anticipadas. Esperar a que aparezca el estímulo puede mejorar tu precisión."
                          : "Esta sesión establece una referencia inicial. Repetí la calibración para comparar tu evolución."}
                  </p>

                  {previousAverage !== null && result.meanReactionMs !== null && (
                    <p className="mt-2 text-xs text-slate-400">
                      Reacción media previa: {previousAverage} ms.
                      {" "}{result.meanReactionMs < previousAverage
                        ? `Esta sesión fue ${previousAverage - result.meanReactionMs} ms más rápida.`
                        : result.meanReactionMs > previousAverage
                          ? `Esta sesión fue ${result.meanReactionMs - previousAverage} ms más lenta.`
                          : "El tiempo de reacción coincide con la media anterior."}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={beginRun}
                    className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200"
                  >
                    Repetir calibración
                  </button>
                </>
              ) : null}
            </div>
          )}

          {progress.history.length > 0 && (
            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">Historial reciente</h3>
                <span className="text-xs text-slate-500">
                  Últimas {progress.history.length} sesiones guardadas
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {[...progress.history].reverse().map((entry) => (
                  <div
                    key={entry.timestamp}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        Nivel {entry.level} · {entry.accuracy}% de precisión
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                        {" · "}
                        {entry.meanReactionMs === null ? "Sin reacción medida" : `${entry.meanReactionMs} ms de media`}
                      </p>
                    </div>
                    <p className="text-lg font-black text-cyan-200">{entry.score}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Indicadores recreativos, sensibles al dispositivo y al entorno.
                No constituyen una evaluación ni un diagnóstico clínico.
              </p>
            </section>
          )}
        </div>
      </section>
    </BrainBoostCanvas>
  );
}
