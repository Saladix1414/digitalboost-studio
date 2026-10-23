export interface FocusProtocolChallenge {
  level: number;
  target: string;
  tiles: string[];
  correctIndex: number;
  gridSize: number;
}

const TARGETS = ["◆", "●", "▲", "✦", "⬟"] as const;

const SYMBOLS = [
  "◆", "◇", "●", "○", "▲", "△",
  "✦", "✧", "⬟", "⬢", "◈", "◉",
] as const;

function createRandom(seed: number): () => number {
  let state = (Math.trunc(seed) >>> 0) || 0x9e3779b9;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateFocusChallenge(
  levelInput: number,
  seedInput: number,
): FocusProtocolChallenge {
  const level = Number.isFinite(levelInput)
    ? Math.max(1, Math.min(99, Math.floor(levelInput)))
    : 1;

  const seed = Number.isFinite(seedInput) ? seedInput : 1;
  const random = createRandom(seed);
  const target = TARGETS[Math.floor(random() * TARGETS.length)];

  // La cuadrícula crece según el progreso, sin exceder 25 celdas.
  const gridSize = level <= 10 ? 3 : level <= 30 ? 4 : 5;
  const tileCount = gridSize * gridSize;
  const correctIndex = Math.floor(random() * tileCount);
  const distractors = SYMBOLS.filter((symbol) => symbol !== target);

  const tiles = Array.from(
    { length: tileCount },
    () => distractors[Math.floor(random() * distractors.length)],
  );

  // El objetivo aparece exactamente una vez en cada desafío.
  tiles[correctIndex] = target;

  return {
    level,
    target,
    tiles,
    correctIndex,
    gridSize,
  };
}
