import { useEffect, useMemo, useReducer, useRef, useState } from "react";
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
  generateVectorRoutesChallenge,
  isVectorRouteValid,
  type VectorRoutesChallenge,
} from "./vectorRoutesEngine";
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

const STORAGE_KEY = "digitalboost:brain-boost:vector-routes:v1";

function readProgress(): Progress {
  const fallback = { unlockedLevel: 1, bestScore: 0, completedRuns: 0 };
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

function findSolution(challenge: VectorRoutesChallenge): string[] {
  function visit(path: string[]): string[] | null {
    const current = path[path.length - 1];
    if (current === challenge.portalNodeId) {
      return isVectorRouteValid(challenge, path) ? path : null;
    }
    for (const edge of challenge.edges) {
      if (edge.from !== current || path.includes(edge.to)) continue;
      const node = challenge.nodes.find((item) => item.id === edge.to);
      if (!node || node.kind === "hazard") continue;
      const result = visit([...path, edge.to]);
      if (result) return result;
    }
    return null;
  }
  return visit([challenge.sourceNodeId]) ?? [challenge.sourceNodeId];
}

export default function VectorRoutesGame() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [coreLevel, setCoreLevel] = useState(() => readProgress().unlockedLevel);
  const [seed, setSeed] = useState(113);
  const [remainingMs, setRemainingMs] = useState(16000);
  const [path, setPath] = useState<string[]>(["start"]);
  const [hintedNodeId, setHintedNodeId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const finishedRef = useRef(false);
  const [session, dispatch] = useReducer(
    logicReactorSessionReducer,
    createInitialLogicReactorSession(),
  );

  const { phase, round, score, streak, correctCount, hintsUsed,
    feedback } = session;

  const challenge = useMemo(
    () => generateVectorRoutesChallenge(coreLevel + round, seed + round * 43),
    [coreLevel, round, seed],
  );
  const solutionPath = useMemo(() => findSolution(challenge), [challenge]);
  const nodesById = useMemo(
    () => new Map(challenge.nodes.map((node) => [node.id, node])),
    [challenge],
  );
  const roundsInRun = getRoundsInRun(coreLevel);
  const isFinalRun = coreLevel + roundsInRun - 1 >= MAX_LEVEL;
  const timeLimitMs = Math.max(5500, 16000 - (challenge.level - 1) * 100);
  const expectedCheckpoint = challenge.checkpointIds.find((id) => !path.includes(id));
  const pathEdges = useMemo(
    () => new Set(path.slice(1).map((id, index) => `${path[index]}>${id}`)),
    [path],
  );

  useEffect(() => {
    const syncAudio = (enabled: boolean) => {
      if (phase === "playing" && enabled) {
        startBrainBoostAmbience("vector-routes");
        startBrainBoostMusic("vector-routes");
      } else {
        stopBrainBoostMusic("vector-routes");
        stopBrainBoostAmbience("vector-routes");
      }
    };
    syncAudio(isBrainBoostAudioEnabled());
    return subscribeBrainBoostAudioEnabled(syncAudio);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || feedback !== null || finishedRef.current) return;
    const deadline = Date.now() + timeLimitMs;
    let submitted = false;
    setRemainingMs(timeLimitMs);

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);
      if (remaining === 0 && !submitted) {
        submitted = true;
        finishedRef.current = true;
        window.clearInterval(timer);
        playBrainBoostSfx("vector-routes", "incorrect");
        setNotice("Tiempo agotado. La red se reiniciará en el próximo desafío.");
        dispatch({
          type: "ANSWER",
          choiceId: "timeout",
          correctChoiceId: "valid-route",
        });
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [phase, feedback, timeLimitMs]);

  function beginRun(level: number, nextSeed: number) {
    setCoreLevel(normalizeCoreLevel(level));
    setSeed(nextSeed);
    setRemainingMs(16000);
    setPath(["start"]);
    setHintedNodeId(null);
    setNotice("");
    finishedRef.current = false;
    playBrainBoostSfx("vector-routes", "start");
    dispatch({ type: "START" });
  }

  function finishRoute(valid: boolean, message: string) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setNotice(message);
    playBrainBoostSfx("vector-routes", valid ? "correct" : "incorrect");
    dispatch({
      type: "ANSWER",
      choiceId: valid ? "valid-route" : "invalid-route",
      correctChoiceId: "valid-route",
    });
  }

  function chooseNode(nodeId: string) {
    if (phase !== "playing" || feedback !== null || finishedRef.current) return;
    if (nodeId === challenge.sourceNodeId || path.includes(nodeId)) return;

    const current = path[path.length - 1];
    const connected = challenge.edges.some(
      (edge) => edge.from === current && edge.to === nodeId,
    );
    if (!connected) {
      playBrainBoostSfx("vector-routes", "tap");
      setNotice("No hay una conexión directa desde el nodo actual.");
      return;
    }

    const node = nodesById.get(nodeId);
    if (!node) return;
    const nextPath = [...path, nodeId];
    setPath(nextPath);
    setHintedNodeId(null);
    setNotice("");

    if (node.kind === "hazard") {
      finishRoute(false, "Callejón sin salida. La ruta quedó bloqueada.");
      return;
    }
    if (node.kind === "checkpoint" && nodeId !== expectedCheckpoint) {
      finishRoute(false, "Checkpoint fuera de orden. La ruta fue rechazada.");
      return;
    }
    if (nodeId === challenge.portalNodeId) {
      const valid = isVectorRouteValid(challenge, nextPath);
      finishRoute(
        valid,
        valid
          ? "Ruta confirmada. Llegaste al portal respetando los checkpoints."
          : "El portal rechazó el recorrido. Revisá los checkpoints y los movimientos.",
      );
      return;
    }
    if (nextPath.length - 1 >= challenge.maxMoves) {
      finishRoute(false, "Superaste el límite de movimientos sin alcanzar el portal.");
    }
  }

  function revealHint() {
    if (phase !== "playing" || feedback !== null || hintsUsed >= 2) return;
    const prefixMatches = path.every((nodeId, index) => solutionPath[index] === nodeId);
    const nextNode = prefixMatches ? solutionPath[path.length] : solutionPath[1];

    if (nextNode) {
      setHintedNodeId(nextNode);
      setNotice(`Pista: el siguiente nodo recomendado es ${nodesById.get(nextNode)?.label ?? nextNode}.`);
    } else {
      setNotice("Comenzá en S y alcanzá el portal Ω.");
    }
    playBrainBoostSfx("vector-routes", "hint");
    dispatch({ type: "REVEAL_HINT" });
  }

  function undoStep() {
    if (phase !== "playing" || feedback !== null || path.length <= 1) return;
    setPath((current) => current.slice(0, -1));
    setHintedNodeId(null);
    setNotice("Último movimiento deshecho.");
    playBrainBoostSfx("vector-routes", "tap");
  }

  function advanceRound() {
    if (feedback === null) return;
    playBrainBoostSfx(
      "vector-routes",
      round < roundsInRun - 1 ? "advance" : "complete",
    );

    if (round < roundsInRun - 1) {
      setPath(["start"]);
      setHintedNodeId(null);
      setNotice("");
      finishedRef.current = false;
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
      // El juego sigue siendo utilizable si el almacenamiento no está disponible.
    }
    dispatch({ type: "ADVANCE", roundsInRun });
  }

  const timePercent = Math.max(0, Math.min(100, (remainingMs / timeLimitMs) * 100));

  const positionFor = (nodeId: string) => {
    const index = challenge.nodes.findIndex((node) => node.id === nodeId);
    if (index < 0) return { x: 50, y: 50 };
    return { x: 11 + (index % 4) * 26, y: 18 + Math.floor(index / 4) * 32 };
  };

  return (
    <BrainBoostCanvas theme="focus">
      <main className="mx-auto w-full max-w-5xl space-y-5 px-3 py-4 text-slate-100 sm:px-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">NEURAL ARCADE / VECTOR ROUTES</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{challenge.title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{challenge.prompt}</p>
          </div>
          <div className="rounded-xl border border-cyan-400/30 bg-slate-950/70 px-4 py-2">
            <p className="text-xs text-slate-400">NIVEL</p>
            <p className="text-2xl font-black text-cyan-300">{coreLevel}</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">TIEMPO</p>
            <p className="text-xl font-bold">{Math.max(0, Math.ceil(remainingMs / 1000))}s</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">MOVIMIENTOS</p>
            <p className="text-xl font-bold">{path.length - 1}/{challenge.maxMoves}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">RONDA</p>
            <p className="text-xl font-bold">{roundsInRun}/5</p>
          </div>
        </div>

        {phase === "results" ? (
          <section className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-7 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">MISSION REPORT</p>
            <h3 className="mt-3 text-2xl font-black">
              {isFinalRun ? "VECTOR ROUTES COMPLETADO" : "MISIÓN FINALIZADA"}
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Rondas completadas: {roundsInRun} de 5.
            </p>
            <p className="mt-1 text-sm text-slate-400">Nivel actual: {coreLevel}</p>
            <button type="button" onClick={() => beginRun(coreLevel, seed + 1)}
              className="mt-6 rounded-xl bg-cyan-300 px-6 py-3 font-black text-slate-950">
              Volver a jugar
            </button>
          </section>
        ) : phase === "playing" ? (
          <section className="overflow-hidden rounded-2xl border border-cyan-400/25 bg-slate-950/80">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <p className="font-bold text-cyan-200">VECTOR GRID</p>
                <p className="text-xs text-slate-400">Conecta la fuente con el portal.</p>
              </div>
              <span className="text-xs text-slate-400">{challenge.nodes.length} nodos</span>
            </div>

            <div className="relative h-[340px] overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.16),transparent_70%)] sm:h-[390px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {challenge.edges.map((edge, index) => {
                  const from = positionFor(edge.from);
                  const to = positionFor(edge.to);
                  const active = path.some((id, i) => i < path.length - 1 && id === edge.from && path[i + 1] === edge.to);
                  return <line key={`${edge.from}-${edge.to}-${index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? "#67e8f9" : "#334155"} strokeWidth={active ? 0.9 : 0.45} strokeDasharray={active ? "0" : "1.5 1.5"} />;
                })}
              </svg>

              {challenge.nodes.map((node) => {
                const pos = positionFor(node.id);
                const selectedIndex = path.indexOf(node.id);
                const selected = selectedIndex >= 0;
                const hazard = node.kind === "hazard";
                const source = node.kind === "source";
                const portal = node.kind === "portal";
                const hint = hintedNodeId === node.id;
                const label = node.label ?? node.id;
                const colors = hazard
                  ? "border-rose-500 bg-rose-950 text-rose-200"
                  : portal
                    ? "border-violet-300 bg-violet-950 text-violet-100"
                    : source
                      ? "border-emerald-300 bg-emerald-950 text-emerald-100"
                      : selected
                        ? "border-cyan-200 bg-cyan-900 text-cyan-100"
                        : hint
                          ? "border-amber-300 bg-amber-950 text-amber-100 animate-pulse"
                          : "border-slate-600 bg-slate-900 text-slate-300";
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => chooseNode(node.id)}
                    aria-label={`Nodo ${label}`}
                    className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border text-[10px] font-black shadow-lg sm:h-14 sm:w-14 ${colors}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span className="opacity-70">{selected ? selectedIndex + 1 : hazard ? "!" : source ? "IN" : portal ? "OUT" : "NODE"}</span>
                    <span className="max-w-full truncate px-1">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-1.5 bg-slate-800">
              <div className="h-full bg-cyan-300 transition-all" style={{ width: `${timePercent}%` }} />
            </div>

            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={revealHint} className="rounded-lg border border-amber-300/40 px-3 py-2 text-sm text-amber-200">Revelar pista</button>
                <button type="button" onClick={undoStep} disabled={path.length <= 1} className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">Deshacer paso</button>
                <button type="button" onClick={() => beginRun(coreLevel, seed + 1)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">Reiniciar</button>
              </div>
              {notice ? (
                <p role="status" className="rounded-lg border border-cyan-400/20 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-100">{notice}</p>
              ) : (
                <p className="text-xs text-slate-400">Sigue los enlaces permitidos. Evita los nodos peligrosos.</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400">Ruta:</span>
                {path.map((id, index) => (
                  <React.Fragment key={`${id}-${index}`}>
                    {index > 0 ? <span className="text-cyan-400">→</span> : null}
                    <span className="rounded border border-slate-700 bg-slate-900 px-2 py-1">{nodesById.get(id)?.label ?? id}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-cyan-400/25 bg-slate-950/80 p-6 text-center sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">INICIAR MISIÓN</p>
            <h3 className="mt-3 text-2xl font-black">Traza la ruta. Evita las anomalías.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">Conecta la fuente con el portal, respeta los puntos de control y completa el recorrido dentro del límite de movimientos.</p>
            <button type="button" onClick={() => beginRun(coreLevel, seed + 1)} className="mt-6 rounded-xl bg-cyan-300 px-6 py-3 font-black text-slate-950">Iniciar Vector Routes</button>
          </section>
        )}
      </main>
    </BrainBoostCanvas>
  );
}
