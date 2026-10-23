import { useEffect, useRef, useState } from "react";
import BrainBoostCanvas from "./BrainBoostCanvas";
import {
  isBrainBoostAudioEnabled,
  setBrainBoostAudioEnabled,
  subscribeBrainBoostAudioEnabled,
  startCyberAssaultMusic,
  stopBrainBoostMusic,
} from "./brainBoostAudio";

type GamePhase = "ready" | "showing" | "input" | "round-clear" | "game-over";

const CELL_COUNT = 9;
const BEST_SCORE_KEY = "digitalboost.brain-boost.memory-matrix.best.v1";

function createSequence(length: number): number[] {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * CELL_COUNT),
  );
}

function readBestScore(): number {
  if (typeof window === "undefined") return 0;

  try {
    const value = Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

const tileTones = [
  "border-cyan-300/40 bg-gradient-to-br from-cyan-300/20 via-cyan-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(34,211,238,.09)]",
  "border-violet-300/40 bg-gradient-to-br from-violet-300/20 via-violet-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(139,92,246,.09)]",
  "border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-300/20 via-fuchsia-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(217,70,239,.09)]",
  "border-sky-300/40 bg-gradient-to-br from-sky-300/20 via-sky-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(56,189,248,.09)]",
  "border-emerald-300/40 bg-gradient-to-br from-emerald-300/20 via-emerald-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(52,211,153,.09)]",
  "border-amber-300/40 bg-gradient-to-br from-amber-300/20 via-amber-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(251,191,36,.09)]",
  "border-rose-300/40 bg-gradient-to-br from-rose-300/20 via-rose-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(251,113,133,.09)]",
  "border-blue-300/40 bg-gradient-to-br from-blue-300/20 via-blue-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(96,165,250,.09)]",
  "border-teal-300/40 bg-gradient-to-br from-teal-300/20 via-teal-950/50 to-slate-950 shadow-[inset_0_0_28px_rgba(45,212,191,.09)]",
];

export default function MemoryMatrixGame() {
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState<number>(readBestScore);
  const [soundEnabled, setSoundEnabled] = useState(isBrainBoostAudioEnabled);
  const soundEnabledRef = useRef(soundEnabled);
  const [answerFeedback, setAnswerFeedback] = useState<{ cell: number; kind: "correct" | "incorrect" } | null>(null);
  const [message, setMessage] = useState(
    "Observá las señales, memorizá la ruta y reproducila en el mismo orden.",
  );

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!answerFeedback) return;

    const snapshot = answerFeedback;
    const timer = window.setTimeout(() => {
      setAnswerFeedback((current) => current === snapshot ? null : current);
    }, snapshot.kind === "incorrect" ? 520 : 260);

    return () => window.clearTimeout(timer);
  }, [answerFeedback]);
  const audioContextRef = useRef<AudioContext | null>(null);

  function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
      return null;
    }
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new window.AudioContext();
    }
    const context = audioContextRef.current;
    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }
    return context;
  }

  function playTeslaNote(
    frequency: number,
    duration = 0.16,
    level = 0.022,
    wave: OscillatorType = "triangle",
    delay = 0,
  ) {
    if (!soundEnabledRef.current) return;
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(Math.max(45, Math.min(1400, frequency)), now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
    oscillator.start(now);
    oscillator.stop(now + duration + 0.025);
  }

  function playTeslaPulse(cell: number, wrong = false) {
    const base = (230 + cell * 31) * (1 + Math.min(round - 1, 10) * 0.012);
    playTeslaNote(wrong ? base * 0.63 : base, wrong ? 0.2 : 0.14, wrong ? 0.012 : 0.022, wrong ? "sawtooth" : "square");
    if (!wrong) playTeslaNote(base * 2.02, 0.095, 0.006, "sine");
  }

  function playLevelMelody(roundNumber: number): number {
    if (!soundEnabledRef.current) return 0;

    const phrase = [0, 7, 12, 7, 10, 7, 5, 3, 0, 3, 7, 12, 14, 12, 7, 5, 3, 0];
    const count = Math.min(phrase.length, 6 + Math.max(0, roundNumber - 1));
    const octave = Math.min(2, Math.floor((roundNumber - 1) / 4));
    const gap = Math.max(0.125, 0.19 - Math.min(12, roundNumber - 1) * 0.004);
    const root = 196 * Math.pow(2, octave);

    phrase.slice(0, count).forEach((step, index) => {
      const delay = 0.12 + index * gap;
      const frequency = root * Math.pow(2, step / 12);
      playTeslaNote(frequency, gap * 0.72, 0.0105, "square", delay);

      if (index % 4 === 0) {
        playTeslaNote(root * 0.5, 0.18, 0.003, "triangle", delay);
      }
    });

    return (0.12 + (count - 1) * gap + gap * 0.72 + 0.12) * 1000;
  }

  useEffect(() => {
    return () => {
      stopBrainBoostMusic();
      if (transitionTimerRef.current !== null) clearTimeout(transitionTimerRef.current);
      if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current);
      if (audioContextRef.current) {
        const context = audioContextRef.current;
        audioContextRef.current = null;
        if (context.state !== "closed") void context.close().catch(() => undefined);
      }
    };
  }, []);



  useEffect(() => {
    if (phase === "ready" || phase === "game-over") {
      stopBrainBoostMusic();
    }
  }, [phase]);

  useEffect(() => {
    return subscribeBrainBoostAudioEnabled((enabled) => {
      soundEnabledRef.current = enabled;
      setSoundEnabled(enabled);

      if (!enabled) {
        stopBrainBoostMusic();
      } else if (phase !== "ready" && phase !== "game-over") {
        startCyberAssaultMusic();
      }
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "showing") return;

    if (playbackIndex >= sequence.length) {
      const timer = setTimeout(() => {
        setActiveCell(null);
        setInputIndex(0);
        setPhase("input");
        setMessage("Tu turno: reproducí la secuencia en el orden correcto.");
      }, 650);

      return () => clearTimeout(timer);
    }

    const cell = sequence[playbackIndex];
    setActiveCell(cell);
    playTeslaPulse(cell);

    const lightTimer = setTimeout(() => {
      setActiveCell((current) => current === cell ? null : current);
    }, 350);

    const nextTimer = setTimeout(() => {
      setPlaybackIndex((current) => current + 1);
    }, 680);

    return () => {
      clearTimeout(lightTimer);
      clearTimeout(nextTimer);
    };
  }, [phase, playbackIndex, sequence]);

  useEffect(() => {
    if (score <= bestScore) return;

    setBestScore(score);
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
    } catch {
      // El juego sigue funcionando si el navegador no permite almacenamiento.
    }
  }, [score, bestScore]);

  function clearPendingTimers() {
    if (transitionTimerRef.current !== null) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }

  function startGame() {
    clearPendingTimers();
    if (soundEnabled && isBrainBoostAudioEnabled()) {
      startCyberAssaultMusic();
    } else {
      stopBrainBoostMusic();
    }
    if (soundEnabled) playTeslaNote(110, 0.22, 0.014, "triangle");

    setRound(1);
    setSequence(createSequence(3));
    setPlaybackIndex(0);
    setInputIndex(0);
    setActiveCell(null);
    setScore(0);
    setLives(3);
    setMessage("Observá las luces. Después tendrás que repetir la secuencia.");
    setPhase("showing");
  }

  function handleCellPress(cell: number) {
    if (phase !== "input") return;

    playTeslaPulse(cell, cell !== sequence[inputIndex]);
    setActiveCell(cell);
    setAnswerFeedback({
      cell,
      kind: cell === sequence[inputIndex] ? "correct" : "incorrect",
    });

    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setActiveCell((current) => current === cell ? null : current);
    }, 170);

    if (cell !== sequence[inputIndex]) {
      setActiveCell(null);
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }

      if (lives <= 1) {
        setLives(0);
        setPhase("game-over");
        setMessage(`Partida terminada. Alcanzaste la ronda ${round}.`);
      } else {
        setLives((current) => current - 1);
        setInputIndex(0);
        setPlaybackIndex(0);
        setPhase("showing");
        setMessage("Señal incorrecta. Observá otra vez la secuencia.");
      }
      return;
    }

    const nextInputIndex = inputIndex + 1;

    if (nextInputIndex < sequence.length) {
      setInputIndex(nextInputIndex);
      setMessage(`Correcto: ${nextInputIndex} de ${sequence.length} señales.`);
      return;
    }

    const reward = sequence.length * 100 + round * 50;
    setScore((current) => current + reward);
    const melodyDurationMs = playLevelMelody(round);
    setPhase("round-clear");
    setMessage(`¡Secuencia completada! +${reward} puntos.`);

    transitionTimerRef.current = setTimeout(() => {
      const nextRound = round + 1;
      setRound(nextRound);
      setSequence(createSequence(sequence.length + 1));
      setPlaybackIndex(0);
      setInputIndex(0);
      setActiveCell(null);
      setMessage(`Ronda ${nextRound}: una señal más. ¡Prestá atención!`);
      setPhase("showing");
      transitionTimerRef.current = null;
    }, Math.max(1150, melodyDurationMs + 180));
  }

  const sequenceProgress =
    phase === "input" ? inputIndex :
    phase === "showing" ? playbackIndex :
    phase === "round-clear" ? sequence.length : 0;

  const statusLabel =
    phase === "ready" ? "READY" :
    phase === "showing" ? "MEMORIZÁ" :
    phase === "input" ? "TU TURNO" :
    phase === "round-clear" ? "ROUND CLEAR" :
    "GAME OVER";

  return (
    <section
      aria-labelledby="memory-matrix-title"
      className="relative isolate overflow-hidden rounded-3xl border border-cyan-200/25 bg-[#030817] p-5 shadow-[0_0_60px_rgba(34,211,238,.10),0_25px_80px_rgba(0,0,0,.38)] sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "linear-gradient(rgba(34,211,238,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.13) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
<BrainBoostCanvas theme="memory" intensity={0.25} seed={47} />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              BRAIN BOOST / NEURAL SIGNAL LAB
            </p>
            <h4 id="memory-matrix-title" className="mt-2 text-xl font-black text-white sm:text-2xl">
              Memory Matrix
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Nueve bobinas. Una descarga. ¿Podés recordar la secuencia?
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-md border px-2 py-1.5 text-[9px] font-black tracking-wider ${
              phase === "game-over"
                ? "border-rose-300/35 bg-rose-400/[0.08] text-rose-200"
                : phase === "input"
                  ? "border-emerald-300/35 bg-emerald-400/[0.08] text-emerald-200"
                  : "border-cyan-300/30 bg-cyan-300/[0.06] text-cyan-100"
            }`}>
              {statusLabel}
            </span>
            <button
              type="button"
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? "Desactivar música y efectos" : "Activar música y efectos"}
              onClick={() => {
                const next = !soundEnabled;
                soundEnabledRef.current = next;
                setSoundEnabled(next);
                setBrainBoostAudioEnabled(next);

                if (next) {
                  const context = getAudioContext();
                  if (context) void context.resume().catch(() => undefined);
                  if (phase !== "ready" && phase !== "game-over") {
                    startCyberAssaultMusic();
                  }
                } else {
                  stopBrainBoostMusic();
                  const context = audioContextRef.current;
                  audioContextRef.current = null;
                  if (context && context.state !== "closed") {
                    void context.close().catch(() => undefined);
                  }
                }
              }}
              className={`rounded-md border px-2 py-1.5 text-[9px] font-black tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                soundEnabled
                  ? "border-cyan-200/45 bg-cyan-300/[0.08] text-cyan-100"
                  : "border-violet-200/30 bg-violet-300/[0.05] text-violet-200"
              }`}
            >
              {soundEnabled ? "⚡ AUDIO ON" : "AUDIO OFF"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-cyan-300/20 bg-[#07152b]/90 p-2">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Ronda</p>
            <p className="mt-1 text-xl font-black text-cyan-100">{round}</p>
          </div>
          <div className="rounded-lg border border-violet-300/20 bg-[#0e102b]/90 p-2">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Score</p>
            <p className="mt-1 text-xl font-black text-violet-200">{score}</p>
          </div>
          <div className="rounded-lg border border-amber-300/20 bg-[#17152a]/90 p-2">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Vidas</p>
            <p className="mt-1 flex gap-1 text-lg leading-6" aria-label={`${lives} de 3 vidas restantes`}>
              {[0, 1, 2].map((life) => (
                <span key={life} className={life < lives ? "text-amber-200 drop-shadow-[0_0_5px_rgba(252,211,77,.55)]" : "text-slate-700"}>
                  ◆
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-gradient-to-b from-[#071426]/95 via-[#050b1b]/95 to-[#100a24]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_50px_rgba(0,0,0,.25)] sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100/80">
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-cyan-200 drop-shadow-[0_0_7px_rgba(34,211,238,.8)]" fill="none" aria-hidden="true">
                  <path d="M16 3v5M9 10h14M11 14h10M13 18h6M16 22v7M6 7l4 4M26 7l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M18 7l-6 9h5l-3 9 8-12h-5l2-6Z" stroke="#c4b5fd" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <span>TESLA ARRAY / 3 × 3 COILS</span>
              </span>
            </span>
            <span className="text-[9px] font-bold text-slate-500">
              {phase === "input" ? `${inputIndex}/${sequence.length}` : phase === "ready" ? "En espera" : `${sequence.length} señales`}
            </span>
          </div>

          {sequence.length > 0 && (
            <div
              className="mb-4 flex gap-1.5"
              role="progressbar"
              aria-label="Progreso de la secuencia"
              aria-valuemin={0}
              aria-valuemax={sequence.length}
              aria-valuenow={sequenceProgress}
            >
              {sequence.map((_, index) => {
                const complete = index < sequenceProgress;
                return (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={complete
                      ? phase === "round-clear"
                        ? "h-1.5 min-w-0 flex-1 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.7)]"
                        : "h-1.5 min-w-0 flex-1 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 shadow-[0_0_8px_rgba(34,211,238,.45)]"
                      : "h-1.5 min-w-0 flex-1 rounded-full bg-white/10 transition-colors duration-200"}
                  />
                );
              })}
            </div>
          )}

          <div className="mx-auto grid w-full max-w-[360px] grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: CELL_COUNT }, (_, cell) => {
              const answerKind =
                answerFeedback?.cell === cell ? answerFeedback.kind : null;
              const isWrongFeedback = answerKind === "incorrect";
              const isCorrectFeedback = answerKind === "correct";
              const isLit =
                activeCell === cell || isWrongFeedback || isCorrectFeedback;

              return (
                <button
                  key={cell}
                  type="button"
                  disabled={phase !== "input"}
                  aria-label={`Nodo ${cell + 1}`}
                  onClick={() => handleCellPress(cell)}
                  className={`group relative aspect-square overflow-hidden rounded-full border text-center transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed motion-reduce:transition-none ${
                    isWrongFeedback
                      ? "z-10 scale-[1.04] border-rose-100 bg-gradient-to-br from-rose-50 via-rose-200 to-rose-500 shadow-[0_0_20px_rgba(255,228,230,.95),0_0_48px_rgba(244,63,94,.85),0_0_75px_rgba(244,63,94,.4),inset_0_0_24px_white]"
                      : isCorrectFeedback
                        ? "z-10 scale-[1.04] border-emerald-50 bg-gradient-to-br from-white via-emerald-100 to-emerald-300 shadow-[0_0_20px_rgba(255,255,255,.95),0_0_48px_rgba(52,211,153,.75),0_0_75px_rgba(16,185,129,.4),inset_0_0_24px_white]"
                        : isLit
                          ? "z-10 scale-[1.04] border-white bg-gradient-to-br from-white via-cyan-100 to-sky-200 shadow-[0_0_20px_rgba(255,255,255,.95),0_0_48px_rgba(34,211,238,.85),0_0_75px_rgba(139,92,246,.4),inset_0_0_24px_white]"
                        : `${tileTones[cell % tileTones.length]} hover:border-cyan-200/65 hover:bg-cyan-300/[0.09]`
                  }`}
                >
                  <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                    <defs>
                      <radialGradient id={"coil-core-" + cell}>
                        <stop offset="0%" stopColor={isWrongFeedback ? "#fff1f2" : isCorrectFeedback ? "#ecfdf5" : "#e0faff"} stopOpacity={isLit ? 1 : 0.55} />
                        <stop offset="45%" stopColor={isWrongFeedback ? "#fb7185" : isCorrectFeedback ? "#34d399" : "#22d3ee"} stopOpacity={isLit ? 0.6 : 0.12} />
                        <stop offset="100%" stopColor="#071426" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="47" fill={"url(#coil-core-" + cell + ")"} />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#67e8f9" strokeOpacity={isLit ? 0.95 : 0.32} strokeWidth="1.2" strokeDasharray="2 4" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="#a78bfa" strokeOpacity="0.55" strokeWidth="1.5" />
                    <circle cx="50" cy="50" r="24" fill="none" stroke="#22d3ee" strokeOpacity="0.7" strokeWidth="1" />
                    <g transform={"rotate(" + (cell * 17) + " 50 50)"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLit ? 2.6 : 1.8}>
                      <path d="M43 33 L36 27 L40 21 L30 15 L34 9" stroke={isLit ? "#ffffff" : "#67e8f9"} />
                      <path d="M57 33 L64 27 L60 21 L70 15 L66 9" stroke={isLit ? "#ffffff" : "#a78bfa"} />
                      <path d="M33 43 L26 37 L20 43 L14 36 L9 40" stroke={isLit ? "#ffffff" : "#a78bfa"} />
                      <path d="M67 43 L74 37 L80 43 L86 36 L91 40" stroke={isLit ? "#ffffff" : "#67e8f9"} />
                      <path d="M43 67 L36 73 L40 79 L30 85 L34 91" stroke={isLit ? "#ffffff" : "#67e8f9"} />
                      <path d="M57 67 L64 73 L60 79 L70 85 L66 91" stroke={isLit ? "#ffffff" : "#a78bfa"} />
                    </g>
                    <circle cx="50" cy="50" r="18" fill={isWrongFeedback ? "#ffe4e6" : isCorrectFeedback ? "#d1fae5" : isLit ? "#dffbff" : "#0b263d"} stroke={isWrongFeedback ? "#fb7185" : isCorrectFeedback ? "#34d399" : isLit ? "#ffffff" : "#67e8f9"} strokeWidth="2" />
                    <circle cx="50" cy="50" r="12" fill="none" stroke={isLit ? "#0891b2" : "#164e63"} strokeWidth="1.2" />
                    <text x="50" y="54" textAnchor="middle" fontSize="10" fontWeight="900" fill={isWrongFeedback ? "#881337" : isLit ? "#082f49" : "#e0faff"}>{String(cell + 1).padStart(2, "0")}</text>
                    <text x="50" y="81" textAnchor="middle" fontSize="5.5" fontWeight="800" letterSpacing="1.2" fill={isLit ? "#ffffff" : "#a5f3fc"}>{isWrongFeedback ? "ERROR" : isCorrectFeedback ? "SYNC" : isLit ? "PULSE" : "TESLA"}</text>
                  </svg>
                  <span className="pointer-events-none absolute inset-0 rounded-full border border-white/10" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <p aria-live="polite" className="mt-4 min-h-10 text-center text-xs leading-5 text-slate-300">
            {message}
          </p>

          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={startGame}
              className="rounded-lg border border-cyan-100/35 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 py-2.5 text-xs font-black text-slate-950 shadow-[0_0_22px_rgba(34,211,238,.20)] transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(34,211,238,.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            >
              {phase === "ready" ? "Iniciar Memory Matrix" :
               phase === "game-over" ? "Jugar otra vez" :
               "Reiniciar partida"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[9px]">
          <span className="text-slate-500">Mejor puntuación local</span>
          <span className="font-black tracking-wider text-cyan-200">{bestScore}</span>
        </div>
        <p className="mt-2 text-[9px] leading-4 text-slate-500">
          Récord guardado en este navegador. El juego es recreativo y no constituye una evaluación médica.
        </p>
      </div>
    </section>
  );
}
