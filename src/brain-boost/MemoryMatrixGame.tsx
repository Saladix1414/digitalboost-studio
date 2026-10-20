import { useEffect, useRef, useState } from "react";

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
  "border-cyan-300/30 bg-cyan-300/[0.035] shadow-[inset_0_0_18px_rgba(34,211,238,.025)]",
  "border-sky-300/30 bg-sky-300/[0.035] shadow-[inset_0_0_18px_rgba(56,189,248,.025)]",
  "border-violet-300/30 bg-violet-400/[0.035] shadow-[inset_0_0_18px_rgba(139,92,246,.025)]",
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [message, setMessage] = useState(
    "Observá las señales, memorizá la ruta y reproducila en el mismo orden.",
  );

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicStepRef = useRef(0);

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
  ) {
    if (!soundEnabled) return;
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
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

  function playTeslaMusicNote(roundNumber: number) {
    const scale = [164.81, 196, 246.94, 293.66, 329.63, 392, 440, 329.63];
    const step = musicStepRef.current++;
    const octave = Math.min(2, Math.floor((roundNumber - 1) / 3));
    const frequency = scale[step % scale.length] * Math.pow(2, octave);
    playTeslaNote(frequency, 0.27, 0.010, "triangle");
    if (roundNumber >= 3 && step % 4 === 0) {
      playTeslaNote(frequency * 1.5, 0.17, 0.0035, "sine");
    }
  }

  useEffect(() => {
    return () => {
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
    if (!soundEnabled || phase === "ready" || phase === "game-over") return;
    const intervalMs = Math.max(300, 680 - (round - 1) * 24);
    const timer = window.setInterval(() => playTeslaMusicNote(round), intervalMs);
    return () => window.clearInterval(timer);
  }, [soundEnabled, phase, round]);

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
    musicStepRef.current = 0;
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
    playTeslaNote(523.25, 0.19, 0.014, "triangle");
    playTeslaNote(783.99, 0.24, 0.010, "sine");
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
    }, 1150);
  }

  const statusLabel =
    phase === "ready" ? "READY" :
    phase === "showing" ? "MEMORIZÁ" :
    phase === "input" ? "TU TURNO" :
    phase === "round-clear" ? "ROUND CLEAR" :
    "GAME OVER";

  return (
    <section
      aria-labelledby="memory-matrix-title"
      className="relative isolate overflow-hidden rounded-xl border border-cyan-200/40 bg-gradient-to-br from-[#04172b] via-[#060b20] to-[#150a35] p-4 shadow-[0_0_38px_rgba(34,211,238,.14),0_0_60px_rgba(139,92,246,.09)] sm:p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(103,232,249,.8) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Neural Arcade / Tesla coil sequence
            </p>
            <h4 id="memory-matrix-title" className="mt-2 text-xl font-black text-white sm:text-2xl">
              Memory Matrix
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Memorizá la descarga y repetí la secuencia eléctrica.
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
                setSoundEnabled(next);
                if (next) {
                  const context = getAudioContext();
                  if (context) void context.resume().catch(() => undefined);
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

        <div className="mt-5 rounded-xl border border-cyan-300/20 bg-[#050b1b]/75 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100/80">
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-cyan-200 drop-shadow-[0_0_7px_rgba(34,211,238,.8)]" fill="none" aria-hidden="true">
                  <path d="M16 3v5M9 10h14M11 14h10M13 18h6M16 22v7M6 7l4 4M26 7l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M18 7l-6 9h5l-3 9 8-12h-5l2-6Z" stroke="#c4b5fd" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <span>Tesla coil / 3 × 3 node matrix</span>
              </span>
            </span>
            <span className="text-[9px] font-bold text-slate-500">
              {phase === "input" ? `${inputIndex}/${sequence.length}` : phase === "ready" ? "En espera" : `${sequence.length} señales`}
            </span>
          </div>

          <div className="mx-auto grid w-full max-w-[270px] grid-cols-3 gap-2.5">
            {Array.from({ length: CELL_COUNT }, (_, cell) => {
              const isLit = activeCell === cell;

              return (
                <button
                  key={cell}
                  type="button"
                  disabled={phase !== "input"}
                  aria-label={`Nodo ${cell + 1}`}
                  onClick={() => handleCellPress(cell)}
                  className={`aspect-square rounded-xl border transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed motion-reduce:transition-none ${
                    isLit
                      ? "scale-[1.04] border-white bg-[#bffaff] shadow-[0_0_12px_rgba(103,232,249,.98),0_0_34px_rgba(34,211,238,.82),0_0_58px_rgba(139,92,246,.28),inset_0_0_18px_rgba(255,255,255,.95)]"
                      : `${tileTones[cell % tileTones.length]} hover:border-cyan-200/65 hover:bg-cyan-300/[0.09]`
                  }`}
                >
                  <span className={`mx-auto block h-2 w-2 rounded-full transition-colors ${
                    isLit ? "bg-white shadow-[0_0_12px_rgba(255,255,255,.98)]" : "bg-cyan-100/35"
                  }`} />
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
