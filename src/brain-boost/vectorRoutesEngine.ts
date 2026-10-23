export type VectorRouteNodeKind =
  | "source"
  | "portal"
  | "relay"
  | "checkpoint"
  | "hazard";

export interface VectorRouteNode {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: VectorRouteNodeKind;
  checkpointOrder?: number;
}

export interface VectorRouteEdge {
  from: string;
  to: string;
}

export interface VectorRoutesChallenge {
  level: number;
  sourceNodeId: string;
  portalNodeId: string;
  checkpointIds: string[];
  nodes: VectorRouteNode[];
  edges: VectorRouteEdge[];
  maxMoves: number;
  title: string;
  prompt: string;
}

const NODE_LAYOUT: VectorRouteNode[] = [
  { id: "start", label: "S", x: 8, y: 50, kind: "source" },
  { id: "a", label: "A", x: 26, y: 25, kind: "relay" },
  { id: "b", label: "B", x: 26, y: 75, kind: "relay" },
  { id: "c", label: "C", x: 45, y: 13, kind: "relay" },
  { id: "d", label: "D", x: 45, y: 50, kind: "relay" },
  { id: "e", label: "E", x: 45, y: 87, kind: "relay" },
  { id: "f", label: "F", x: 66, y: 25, kind: "relay" },
  { id: "g", label: "G", x: 66, y: 75, kind: "relay" },
  { id: "portal", label: "Ω", x: 92, y: 50, kind: "portal" },
  { id: "hazard-c", label: "×", x: 66, y: 5, kind: "hazard" },
  { id: "hazard-d", label: "×", x: 66, y: 50, kind: "hazard" },
  { id: "hazard-e", label: "×", x: 66, y: 95, kind: "hazard" },
];

const BASE_EDGES: VectorRouteEdge[] = [
  { from: "start", to: "a" },
  { from: "start", to: "b" },
  { from: "a", to: "c" },
  { from: "a", to: "d" },
  { from: "b", to: "d" },
  { from: "b", to: "e" },
  { from: "c", to: "f" },
  { from: "d", to: "f" },
  { from: "d", to: "g" },
  { from: "e", to: "g" },
  { from: "f", to: "portal" },
  { from: "g", to: "portal" },
  { from: "c", to: "hazard-c" },
  { from: "d", to: "hazard-d" },
  { from: "e", to: "hazard-e" },
];

function createRandom(seed: number): () => number {
  let state = (Math.trunc(seed) >>> 0) || 0x9e3779b9;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function normalizeLevel(value: number): number {
  return Number.isFinite(value)
    ? Math.max(1, Math.min(99, Math.floor(value)))
    : 1;
}

export function generateVectorRoutesChallenge(
  levelInput: number,
  seedInput: number,
): VectorRoutesChallenge {
  const level = normalizeLevel(levelInput);
  const seed = Number.isFinite(seedInput) ? seedInput : 1;
  const random = createRandom(seed);
  const leftBranch = random() < 0.5;

  let checkpointIds: string[];

  if (level <= 10) {
    checkpointIds = [leftBranch ? "c" : "e"];
  } else if (level <= 30) {
    checkpointIds = leftBranch ? ["a", "c"] : ["b", "e"];
  } else if (level <= 60) {
    checkpointIds = leftBranch ? ["a", "c", "f"] : ["b", "e", "g"];
  } else {
    checkpointIds = leftBranch ? ["a", "d", "g"] : ["b", "d", "f"];
  }

  const order = new Map(
    checkpointIds.map((id, index) => [id, index + 1]),
  );

  const nodes = NODE_LAYOUT
    .filter((node) => level > 20 || node.kind !== "hazard")
    .map((node): VectorRouteNode => {
      const checkpointOrder = order.get(node.id);

      return {
        ...node,
        x: Math.max(4, Math.min(96, node.x + (random() - 0.5) * 2.4)),
        y: Math.max(4, Math.min(96, node.y + (random() - 0.5) * 2.4)),
        kind: checkpointOrder !== undefined
          ? "checkpoint"
          : node.kind,
        ...(checkpointOrder !== undefined ? { checkpointOrder } : {}),
      };
    });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = BASE_EDGES.filter(
    (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to),
  );

  const maxMoves =
    level <= 30 ? 5 :
    level <= 60 ? 6 : 7;

  const title =
    level <= 10 ? "Ruta de iniciación" :
    level <= 30 ? "Red de bifurcaciones" :
    level <= 60 ? "Corredor de intercepción" :
    "Red vectorial avanzada";

  const labels = checkpointIds
    .map((id) => nodes.find((node) => node.id === id)?.label ?? id)
    .join(" → ");

  return {
    level,
    sourceNodeId: "start",
    portalNodeId: "portal",
    checkpointIds,
    nodes,
    edges,
    maxMoves,
    title,
    prompt: `Visitá los checkpoints ${labels} en ese orden y alcanzá el portal Ω. Evitá los callejones sin salida.`,
  };
}

export function isVectorRouteValid(
  challenge: VectorRoutesChallenge,
  path: string[],
): boolean {
  if (
    path.length < 2 ||
    path[0] !== challenge.sourceNodeId ||
    path[path.length - 1] !== challenge.portalNodeId ||
    path.length - 1 > challenge.maxMoves ||
    new Set(path).size !== path.length
  ) {
    return false;
  }

  const nodes = new Map(challenge.nodes.map((node) => [node.id, node]));

  if (path.some((id) => {
    const node = nodes.get(id);
    return !node || node.kind === "hazard";
  })) {
    return false;
  }

  for (let index = 1; index < path.length; index++) {
    const connected = challenge.edges.some(
      (edge) => edge.from === path[index - 1] && edge.to === path[index],
    );

    if (!connected) return false;
  }

  let nextCheckpoint = 0;

  for (const id of path) {
    if (id === challenge.checkpointIds[nextCheckpoint]) {
      nextCheckpoint++;
    } else if (challenge.checkpointIds.includes(id)) {
      return false;
    }
  }

  return nextCheckpoint === challenge.checkpointIds.length;
}
