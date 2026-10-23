import { useEffect, useRef, useState } from "react";
import BrainBoostCanvas from "./BrainBoostCanvas";
import {
  isBrainBoostAudioEnabled,
  setBrainBoostAudioEnabled,
  subscribeBrainBoostAudioEnabled,
} from "./brainBoostAudio";

type MemoryPairsMode = "ocean" | "originx";
type Phase = "ready" | "playing" | "won";

type Species = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  soundFile?: string;
  soundRemote?: string;
  tone: "cyan" | "violet" | "blue" | "emerald" | "amber";
};

type MemoryCard = Species & { cardId: string };

const OCEAN_SPECIES: Species[] = [
  {
    id: "dolphin",
    name: "Delfín nariz de botella",
    subtitle: "Ocean Echo / 01",
    image: "/brain-boost/cards/ocean/dolphin.webp",
    soundFile: "/brain-boost/audio/bottlenose-dolphin.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Tutr-multisound-NOAA-PAGroup-03-bottlenose-dolphin-clip.mp3",
    tone: "cyan",
  },
  {
    id: "humpback-whale",
    name: "Ballena jorobada",
    subtitle: "Ocean Echo / 02",
    image: "/brain-boost/cards/ocean/humpback-whale.webp",
    soundFile: "/brain-boost/audio/humpback-whale.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Meno-song-NOAA-PAGroup-13-humpback-clip.mp3",
    tone: "violet",
  },
  {
    id: "atlantic-spotted-dolphin",
    name: "Delfín moteado del Atlántico",
    subtitle: "Ocean Echo / 03",
    image: "/brain-boost/cards/ocean/dolphin-spotted.webp",
    soundFile: "/brain-boost/audio/atlantic-spotted-dolphin.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Stfr-Multisound-NOAA-PAGroup-01-atlantic-spotted-dolphin-clip.mp3",
    tone: "blue",
  },
  {
    id: "killer-whale",
    name: "Orca",
    subtitle: "Ocean Echo / 04",
    image: "/brain-boost/cards/ocean/orca.webp",
    soundFile: "/brain-boost/audio/killer-whale.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Oror-Multisound-AWI-Van-Opzeeland-01-killer-clip.mp3",
    tone: "blue",
  },

  {
    id: "blue-whale",
    name: "Ballena azul",
    subtitle: "Ocean Echo / 05",
    image: "/brain-boost/cards/ocean/blue-whale.jpg",
    soundFile: "/brain-boost/audio/blue-whale.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Cornell-NY-LongIsland-20090123-000000-LPfilter20-amplified-x8speed-blue-clip.mp3",
    tone: "blue",
  },
  {
    id: "fin-whale",
    name: "Ballena de aleta",
    subtitle: "Ocean Echo / 06",
    image: "/brain-boost/cards/ocean/fin-whale.jpg",
    soundFile: "/brain-boost/audio/fin-whale.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Baph-song-NOAA-PAGroup-05-x5speed-fin-clip.mp3",
    tone: "violet",
  },
  {
    id: "minke-whale",
    name: "Ballena minke",
    subtitle: "Ocean Echo / 07",
    image: "/brain-boost/cards/ocean/minke-whale.jpg",
    soundFile: "/brain-boost/audio/minke-whale.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Baac-pulsetrains-NOAA-PAGroup-25-minke-clip.mp3",
    tone: "cyan",
  },
  {
    id: "north-atlantic-right-whale",
    name: "Ballena franca del Atlántico Norte",
    subtitle: "Ocean Echo / 08",
    image: "/brain-boost/cards/ocean/north-atlantic-right-whale.jpg",
    soundFile: "/brain-boost/audio/north-atlantic-right-whale.mp3",
    soundRemote: "https://www.fisheries.noaa.gov/s3/2023-04/Eugl-upcall-NOAA-PAGroup-01-right-clip-1.mp3",
    tone: "emerald",
  },
];

// Ilustraciones originales de concepto para el primer prototipo de Origin X.
// Se pueden sustituir por el arte canónico de Origin X cuando esté disponible.
const ORIGINX_SPECIES: Species[] = [
  {
    id: "dragon-ice",
    name: "Draco de hielo",
    subtitle: "Origin X / Cryo",
    image: "/brain-boost/cards/originx/dragon-ice.webp",
    tone: "cyan",
  },
  {
    id: "dragon-cosmic",
    name: "Draco cósmico",
    subtitle: "Origin X / Astral",
    image: "/brain-boost/cards/originx/dragon-cosmic.webp",
    tone: "violet",
  },
  {
    id: "dragon-forest",
    name: "Draco del bosque",
    subtitle: "Origin X / Verdant",
    image: "/brain-boost/cards/originx/dragon-forest.webp",
    tone: "emerald",
  },
  {
    id: "dragon-fire",
    name: "Draco de fuego",
    subtitle: "Origin X / Ember",
    image: "/brain-boost/cards/originx/dragon-fire.webp",
    tone: "amber",
  },
];

const BEST_SCORE_PREFIX = "digitalboost.brain-boost.memory-pairs.v1";

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createDeck(mode: MemoryPairsMode): MemoryCard[] {
  const species = mode === "ocean" ? OCEAN_SPECIES : ORIGINX_SPECIES;
  return shuffle(
    species.flatMap((entry) => [
      { ...entry, cardId: `${entry.id}-a` },
      { ...entry, cardId: `${entry.id}-b` },
    ]),
  );
}

function loadBestScore(mode: MemoryPairsMode): number {
  if (typeof window === "undefined") return 0;
  try {
    const value = Number(window.localStorage.getItem(`${BEST_SCORE_PREFIX}.${mode}`) ?? 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function toneClasses(tone: Species["tone"], revealed: boolean): string {
  const palette = {
    cyan: revealed ? "border-cyan-200 shadow-[0_0_25px_rgba(34,211,238,.25)]" : "border-cyan-300/25",
    violet: revealed ? "border-violet-200 shadow-[0_0_25px_rgba(167,139,250,.25)]" : "border-violet-300/25",
    blue: revealed ? "border-blue-200 shadow-[0_0_25px_rgba(96,165,250,.25)]" : "border-blue-300/25",
    emerald: revealed ? "border-emerald-200 shadow-[0_0_25px_rgba(52,211,153,.25)]" : "border-emerald-300/25",
    amber: revealed ? "border-amber-200 shadow-[0_0_25px_rgba(251,191,36,.25)]" : "border-amber-300/25",
  };
  return palette[tone];
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function MemoryPairsGame({ mode }: { mode: MemoryPairsMode }) {
  const isOcean = mode === "ocean";
  const [deck, setDeck] = useState<MemoryCard[]>(() => createDeck(mode));
  const [phase, setPhase] = useState<Phase>("ready");
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(isBrainBoostAudioEnabled);
  const [bestScore, setBestScore] = useState(() => loadBestScore(mode));
  const [message, setMessage] = useState(
    isOcean
      ? "Encontrá las parejas marinas. Cada pareja descubierta revela su sonido real."
      : "Descubrí los cuatro linajes de dragones y reuní sus parejas.",
  );

  const lockedRef = useRef(false);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundFadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => () => {
    if (flipTimerRef.current !== null) window.clearTimeout(flipTimerRef.current);
    if (soundFadeTimerRef.current !== null) window.clearInterval(soundFadeTimerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioContextRef.current) {
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context.state !== "closed") {
        void context.close().catch(() => undefined);
      }
    }
  }, []);

  useEffect(() => {
    return subscribeBrainBoostAudioEnabled((enabled) => {
      setSoundEnabled(enabled);
      if (enabled) return;

      if (soundFadeTimerRef.current !== null) {
        window.clearInterval(soundFadeTimerRef.current);
        soundFadeTimerRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (audioContextRef.current) {
        const context = audioContextRef.current;
        audioContextRef.current = null;
        if (context.state !== "closed") {
          void context.close().catch(() => undefined);
        }
      }
    });
  }, []);

  function clearPendingFlipTimer() {
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
  }

  function playSpeciesSound(card: MemoryCard) {
    if (!isOcean || !soundEnabled || !isBrainBoostAudioEnabled() || !card.soundFile) return;

    if (soundFadeTimerRef.current !== null) {
      window.clearInterval(soundFadeTimerRef.current);
      soundFadeTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const player = new Audio(card.soundFile);
    const targetVolume = 0.48;
    const maxDurationMs = 4200;
    const fadeDurationMs = 700;
    player.volume = targetVolume;
    audioRef.current = player;
    let triedRemote = false;

    const useRemoteFallback = () => {
      if (triedRemote || !card.soundRemote) return;
      triedRemote = true;
      player.src = card.soundRemote;
      player.load();
      void player.play().catch(() => undefined);
    };

    player.addEventListener("error", useRemoteFallback, { once: true });

    const startedAt = Date.now();
    soundFadeTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const fadeStartsAt = maxDurationMs - fadeDurationMs;

      if (elapsed >= fadeStartsAt) {
        const remaining = Math.max(
          0,
          (maxDurationMs - elapsed) / fadeDurationMs,
        );
        player.volume = targetVolume * remaining;
      }

      if (elapsed >= maxDurationMs || player.ended) {
        if (soundFadeTimerRef.current !== null) {
          window.clearInterval(soundFadeTimerRef.current);
          soundFadeTimerRef.current = null;
        }
        player.pause();
        try {
          player.currentTime = 0;
        } catch {
          // El navegador puede no permitir reiniciar un recurso todavía no cargado.
        }
      }
    }, 50);

    void player.play().catch(useRemoteFallback);
  }

  function getSynthContext(): AudioContext | null {
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

  function playDragonEffect(
    effect: "start" | "reveal" | "match" | "miss" | "win",
    tone: Species["tone"] = "cyan",
  ) {
    if (isOcean || !soundEnabled || !isBrainBoostAudioEnabled()) return;
    const context = getSynthContext();
    if (!context) return;

    const roots: Record<Species["tone"], number> = {
      cyan: 220,
      violet: 196,
      blue: 174.61,
      emerald: 164.81,
      amber: 246.94,
    };

    const scales: Record<Species["tone"], number[]> = {
      cyan: [0, 7, 12, 16],
      violet: [0, 3, 7, 10],
      blue: [0, 5, 7, 12],
      emerald: [0, 4, 7, 11],
      amber: [0, 2, 7, 9],
    };

    const root = roots[tone];
    const scale = scales[tone];
    const startAt = context.currentTime + 0.02;

    function note(
      frequency: number,
      offset: number,
      duration: number,
      level: number,
      wave: OscillatorType = "sine",
      detune = 0,
    ) {
      const at = startAt + offset;
      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(
        Math.max(55, Math.min(1760, frequency)),
        at,
      );
      oscillator.detune.setValueAtTime(detune, at);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(
        Math.min(5200, Math.max(850, frequency * 5.5)),
        at,
      );
      filter.Q.setValueAtTime(0.55, at);

      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(level, at + 0.035);
      gain.gain.setValueAtTime(level, at + duration * 0.42);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      oscillator.addEventListener("ended", () => {
        oscillator.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, { once: true });

      oscillator.start(at);
      oscillator.stop(at + duration + 0.04);
    }

    if (effect === "reveal") {
      scale.slice(0, 3).forEach((interval, index) => {
        note(
          root * Math.pow(2, interval / 12),
          index * 0.085,
          0.34,
          0.008,
          "sine",
          index % 2 ? 4 : -4,
        );
      });
      note(root * 0.5, 0, 0.44, 0.003, "triangle");
      return;
    }

    if (effect === "start") {
      note(root * 0.5, 0, 0.68, 0.005, "sine", -3);
      scale.slice(0, 3).forEach((interval, index) => {
        note(
          root * Math.pow(2, interval / 12),
          0.13 + index * 0.12,
          0.48,
          0.006,
          "triangle",
        );
      });
      return;
    }

    if (effect === "match") {
      [0, 1, 2].forEach((index) => {
        note(
          root * Math.pow(2, scale[index] / 12),
          index * 0.075,
          0.43,
          0.008,
          "sine",
          index === 1 ? 3 : 0,
        );
      });
      note(root * 0.5, 0, 0.52, 0.0035, "triangle");
      return;
    }

    if (effect === "miss") {
      note(root * Math.pow(2, -3 / 12), 0, 0.28, 0.006, "triangle");
      note(root * Math.pow(2, -7 / 12), 0.12, 0.38, 0.005, "sine");
      note(root * 0.5, 0.02, 0.36, 0.0025, "sine");
      return;
    }

    note(root * 0.5, 0, 0.78, 0.004, "sine", -4);
    scale.forEach((interval, index) => {
      note(
        root * Math.pow(2, interval / 12),
        index * 0.085,
        0.62,
        0.007,
        "triangle",
        index % 2 ? 3 : -2,
      );
    });
    note(root * 2, 0.16, 0.58, 0.0025, "sine", 5);
  }

  function startGame() {
    clearPendingFlipTimer();
    if (!isOcean) playDragonEffect("start");
    lockedRef.current = false;
    setDeck(createDeck(mode));
    setFlippedIds([]);
    setMatchedIds([]);
    setErrorIds([]);
    setMoves(0);
    setScore(0);
    setElapsed(0);
    setMessage(isOcean
      ? "¡Inmersión iniciada! Encontrá las cuatro parejas marinas y escuchá sus llamadas."
      : "¡Cacería iniciada! Encontrá las cuatro parejas de Origin X.");
    setPhase("playing");
  }

  function flipCard(card: MemoryCard) {
    if (phase !== "playing" || lockedRef.current) return;
    if (flippedIds.includes(card.cardId) || matchedIds.includes(card.cardId)) return;

    if (isOcean) {
      playSpeciesSound(card);
    } else {
      playDragonEffect("reveal", card.tone);
    }
    setErrorIds([]);
    const nextFlipped = [...flippedIds, card.cardId];
    setFlippedIds(nextFlipped);
    if (nextFlipped.length < 2) {
      setMessage("Primera carta revelada. Elegí otra para encontrar la pareja.");
      return;
    }

    lockedRef.current = true;
    setMoves((value) => value + 1);
    const first = deck.find((entry) => entry.cardId === nextFlipped[0]);
    if (!first) {
      lockedRef.current = false;
      setFlippedIds([]);
      return;
    }

    if (first.id === card.id) {
      const nextMatched = [...matchedIds, first.cardId, card.cardId];
      const nextScore = score + 100;
      setMatchedIds(nextMatched);
      setScore(nextScore);
      setMessage(isOcean
        ? `¡Pareja encontrada! Escuchá: ${card.name}. +100 puntos.`
        : `¡Relic sincronizada! ${card.name}. +100 puntos.`);

      if (!isOcean) playDragonEffect("match", card.tone);

      flipTimerRef.current = window.setTimeout(() => {
        setFlippedIds([]);
        setErrorIds([]);
        lockedRef.current = false;
        flipTimerRef.current = null;

        if (nextMatched.length === deck.length) {
          setPhase("won");
          if (!isOcean) playDragonEffect("win", card.tone);
          setMessage(isOcean
            ? "¡Misión completada! El océano respondió a todos tus ecos."
            : "¡Colección sincronizada! Todos los linajes fueron encontrados.");
          if (nextScore > bestScore) {
            setBestScore(nextScore);
            try {
              window.localStorage.setItem(`${BEST_SCORE_PREFIX}.${mode}`, String(nextScore));
            } catch {
              // Guardado local opcional; la partida sigue funcionando si está bloqueado.
            }
          }
        } else {
          setMessage(isOcean ? "Buscá la siguiente pareja marina." : "Buscá el siguiente linaje.");
        }
      }, 620);
      return;
    }

    setScore((value) => Math.max(0, value - 15));
    setErrorIds([first.cardId, card.cardId]);
    setMessage("No coinciden. Observá las imágenes e intentá otra vez.");
    if (!isOcean) playDragonEffect("miss", card.tone);
    flipTimerRef.current = window.setTimeout(() => {
      setFlippedIds([]);
      setErrorIds([]);
      lockedRef.current = false;
      flipTimerRef.current = null;
      setMessage("Memorizá las posiciones y buscá otra pareja.");
    }, 900);
  }

  const pairCount = deck.length / 2;
  const foundPairs = matchedIds.length / 2;
  const progress = pairCount > 0 ? (foundPairs / pairCount) * 100 : 0;
  const title = isOcean ? "Ocean Echoes" : "Origin X · Dragon Relics";
  const subtitle = isOcean
    ? "Memoria sonora · Delfines, ballenas y orcas"
    : "Colección de memoria · Linajes elementales";

  return (
    <section
      aria-labelledby="memory-pairs-title"
      className={`relative isolate overflow-hidden rounded-2xl border p-3 shadow-[0_0_46px_rgba(34,211,238,.12)] sm:p-5 ${
        isOcean
          ? "border-cyan-300/35 bg-gradient-to-br from-[#06324a] via-[#07162d] to-[#160e38]"
          : "border-violet-300/35 bg-gradient-to-br from-[#101b43] via-[#0a1029] to-[#2a102b]"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(165,243,252,.8) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

<BrainBoostCanvas theme={isOcean ? "ocean" : "dragon"} intensity={0.24} seed={59} />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isOcean ? "text-cyan-200" : "text-violet-200"}`}>
              {isOcean ? "Neural Arcade / Ocean Echoes" : "Origin X / Dragon Relics"}
            </p>
            <h4 id="memory-pairs-title" className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
              {title}
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-300">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Desactivar sonidos" : "Activar sonidos"}
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              setBrainBoostAudioEnabled(next);
              if (!next && audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
              }
              if (!next && audioContextRef.current) {
                const context = audioContextRef.current;
                audioContextRef.current = null;
                if (context.state !== "closed") {
                  void context.close().catch(() => undefined);
                }
              }
              if (next && !isOcean) {
                const context = getSynthContext();
                if (context) void context.resume().catch(() => undefined);
              }
            }}
            className={`rounded-lg border px-3 py-2 text-[9px] font-black uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isOcean
                ? "border-cyan-200/30 bg-cyan-200/[0.06] text-cyan-100 hover:bg-cyan-200/[0.12]"
                : "border-violet-200/30 bg-violet-200/[0.06] text-violet-100 hover:bg-violet-200/[0.12]"
            }`}
          >
            {soundEnabled ? (isOcean ? "♫ Sonido ON" : "⚡ FX ON") : "Sonido OFF"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-cyan-200/20 bg-[#06162a]/80 p-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Parejas</p>
            <p className="mt-1 text-lg font-black text-cyan-100">{foundPairs}<span className="text-xs text-slate-500">/{pairCount}</span></p>
          </div>
          <div className="rounded-xl border border-violet-200/20 bg-[#12112c]/80 p-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Intentos</p>
            <p className="mt-1 text-lg font-black text-violet-100">{moves}</p>
          </div>
          <div className="rounded-xl border border-amber-200/20 bg-[#21172a]/80 p-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Tiempo</p>
            <p className="mt-1 text-lg font-black text-amber-100">{formatTime(elapsed)}</p>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-900/80">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${isOcean ? "bg-gradient-to-r from-cyan-300 to-teal-200" : "bg-gradient-to-r from-violet-300 to-fuchsia-300"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative mt-4 rounded-2xl border border-white/10 bg-[#040a1a]/75 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-300">{isOcean ? "Ocean memory grid" : "Dragon relic archive"}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{phase === "won" ? "Mission clear" : phase === "playing" ? "Find matching pairs" : "System ready"}</span>
          </div>

          <div className="relative">
            <div className={`grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 ${isOcean ? "max-w-2xl" : "max-w-3xl"} mx-auto`}>
              {deck.map((card) => {
                const isMatched = matchedIds.includes(card.cardId);
                const isFlipped = flippedIds.includes(card.cardId) || isMatched;
                const isError = errorIds.includes(card.cardId);

                return (
                  <button
                    key={card.cardId}
                    type="button"
                    disabled={phase !== "playing" || lockedRef.current || isMatched}
                    onClick={() => flipCard(card)}
                    aria-label={isFlipped ? `${card.name}${isMatched ? ", pareja encontrada" : ""}` : "Carta oculta; revelar carta"}
                    className={`group relative aspect-[4/5] min-w-0 overflow-hidden rounded-xl border bg-[#07152b] text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none ${
                      isError
                        ? "border-rose-300 shadow-[0_0_24px_rgba(251,113,133,.45)]"
                        : isMatched
                          ? "border-emerald-200 shadow-[0_0_24px_rgba(52,211,153,.35)]"
                          : toneClasses(card.tone, isFlipped)
                    } ${!isFlipped && phase === "playing" ? "hover:-translate-y-0.5 hover:border-cyan-100/60" : ""}`}
                    style={{ perspective: "800px" }}
                  >
                    <span
                      className="absolute inset-0 block transition-transform duration-500"
                      style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transformStyle: "preserve-3d" }}
                    >
                      <span
                        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[inherit]"
                        style={{ backfaceVisibility: "hidden", background: isOcean ? "radial-gradient(circle at 50% 35%,rgba(34,211,238,.18),transparent 55%),linear-gradient(145deg,#0a2940,#091127 72%)" : "radial-gradient(circle at 50% 35%,rgba(167,139,250,.20),transparent 55%),linear-gradient(145deg,#191a43,#0b1128 72%)" }}
                      >
                        <span className={`absolute inset-2 rounded-lg border ${isOcean ? "border-cyan-200/20" : "border-violet-200/20"}`} />
                        <span className={`relative flex h-10 w-10 items-center justify-center rounded-xl border text-2xl shadow-[0_0_22px_rgba(34,211,238,.12)] ${isOcean ? "border-cyan-200/30 bg-cyan-300/[0.08] text-cyan-100" : "border-violet-200/30 bg-violet-300/[0.08] text-violet-100"}`}>
                          {isOcean ? "≈" : "✧"}
                        </span>
                        <span className="relative mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">{isOcean ? "Ocean echo" : "Dragon relic"}</span>
                        <span className="absolute bottom-2 right-2 font-mono text-[8px] text-slate-500">{card.cardId.endsWith("-a") ? "A" : "B"}</span>
                      </span>

                      <span
                        className="absolute inset-0 overflow-hidden rounded-[inherit]"
                        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                      >
                        <img src={card.image} alt={card.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        <span className="absolute inset-0 bg-gradient-to-t from-[#030817]/95 via-[#030817]/10 to-transparent" />
                        {isMatched && <span className="absolute right-1.5 top-1.5 rounded-md border border-emerald-100/70 bg-emerald-300/90 px-1.5 py-1 text-[7px] font-black uppercase tracking-wider text-emerald-950">Match</span>}
                        <span className="absolute inset-x-1 bottom-2 text-center">
                          <span className="block text-[9px] font-black leading-tight text-white drop-shadow sm:text-[10px]">{card.name}</span>
                          <span className="mt-1 block text-[7px] font-bold uppercase tracking-wider text-cyan-100/80">{card.subtitle}</span>
                        </span>
                        {isError && <span className="absolute inset-0 border-2 border-rose-400 bg-rose-400/10" />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {phase !== "playing" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[#030818]/78 p-4 text-center backdrop-blur-sm">
                <div className="max-w-sm">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl shadow-[0_0_32px_rgba(34,211,238,.18)] ${isOcean ? "border-cyan-200/40 bg-cyan-300/[0.10] text-cyan-100" : "border-violet-200/40 bg-violet-300/[0.10] text-violet-100"}`}>
                    {phase === "won" ? "✦" : isOcean ? "≈" : "♢"}
                  </div>
                  <p className={`mt-4 text-[9px] font-black uppercase tracking-[0.22em] ${isOcean ? "text-cyan-200" : "text-violet-200"}`}>
                    {phase === "won" ? "Neural Arcade / mission clear" : isOcean ? "Ocean Echoes / dive ready" : "Origin X / relic hunt ready"}
                  </p>
                  <h5 className="mt-2 text-xl font-black text-white sm:text-2xl">
                    {phase === "won" ? "¡Colección completa!" : isOcean ? "¿Listo para sumergirte?" : "¿Listo para la cacería?"}
                  </h5>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    {phase === "won"
                      ? `Puntuación ${score} · ${moves} intentos · ${formatTime(elapsed)}.`
                      : isOcean
                        ? "Encontrá el delfín nariz de botella, la ballena jorobada, el delfín moteado del Atlántico y la orca. Al completar cada pareja escucharás su grabación real de NOAA."
                        : "Descubrí los cuatro dragones elementales y reuní cada pareja de cartas."}
                  </p>
                  {phase === "won" && score >= bestScore && score > 0 && (
                    <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-emerald-200">Nuevo récord local</p>
                  )}
                  <button
                    type="button"
                    onClick={startGame}
                    className={`mt-5 rounded-xl border px-5 py-3 text-xs font-black text-slate-950 shadow-[0_0_26px_rgba(34,211,238,.22)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isOcean ? "border-cyan-100/60 bg-gradient-to-r from-cyan-200 via-teal-200 to-sky-300" : "border-violet-100/60 bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200"}`}
                  >
                    {phase === "won" ? "Jugar otra vez →" : isOcean ? "Iniciar Ocean Echoes →" : "Iniciar Dragon Relics →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[9px]">
            <div>
              <span className="text-slate-400">Score </span>
              <span className="font-black text-cyan-100">{score}</span>
              <span className="mx-2 text-slate-700">·</span>
              <span className="text-slate-400">Mejor marca </span>
              <span className="font-black text-violet-100">{bestScore}</span>
            </div>
            <span className="text-slate-500">El récord se guarda en este navegador.</span>
          </div>
        </div>

        {isOcean && (
          <p className="mt-3 text-[8px] leading-4 text-slate-500">
            Sonidos reales: NOAA Fisheries. Los clips se usan conforme a la política de audio de NOAA; consultar SOURCES.md para las fuentes.
          </p>
        )}
      </div>
    </section>
  );
}
