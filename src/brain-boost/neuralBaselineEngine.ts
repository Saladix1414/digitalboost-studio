export type NeuralBaselineStimulus = {
  id: string;
  glyph: string;
  isTarget: boolean;
  onsetDelayMs: number;
  displayMs: number;
  responseWindowMs: number;
};

export type NeuralBaselineChallenge = {
  level: number;
  seed: number;
  targetGlyph: string;
  totalTrials: number;
  targetCount: number;
  distractorCount: number;
  stimuli: NeuralBaselineStimulus[];
};

export type NeuralBaselineResponse = {
  reactionMs: number | null;
};

export type NeuralBaselineResult = {
  totalTrials: number;
  targetCount: number;
  distractorCount: number;
  hits: number;
  omissions: number;
  falseAlarms: number;
  anticipations: number;
  lateResponses: number;
  correctRejections: number;
  accuracy: number;
  meanReactionMs: number | null;
  reactionConsistency: number;
  score: number;
};

const TOTAL_TRIALS = 15;
const TARGET_COUNT = 9;
const GLYPHS = ["◆", "●", "▲", "✦", "⬟"];

function normalizeLevel(value: number): number {
  return Number.isFinite(value)
    ? Math.max(1, Math.min(99, Math.floor(value)))
    : 1;
}

function createRandom(seedInput: number): () => number {
  const normalizedSeed = Number.isFinite(seedInput)
    ? Math.trunc(seedInput) >>> 0
    : 1;
  let state = normalizedSeed || 0x9e3779b9;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateNeuralBaselineChallenge(
  levelInput: number,
  seedInput: number,
): NeuralBaselineChallenge {
  const level = normalizeLevel(levelInput);
  const seed = Number.isFinite(seedInput) ? Math.trunc(seedInput) : 1;
  const random = createRandom(seed);
  const targetGlyph = GLYPHS[Math.floor(random() * GLYPHS.length)];
  const otherGlyphs = GLYPHS.filter((glyph) => glyph !== targetGlyph);

  const kinds = [
    ...Array.from({ length: TARGET_COUNT }, () => true),
    ...Array.from({ length: TOTAL_TRIALS - TARGET_COUNT }, () => false),
  ];

  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }

  const displayMs = Math.max(340, 1100 - level * 7);
  const responseWindowMs = Math.max(350, 1400 - level * 9);

  const stimuli = kinds.map((isTarget, index) => ({
    id: `baseline-${index + 1}`,
    glyph: isTarget
      ? targetGlyph
      : otherGlyphs[Math.floor(random() * otherGlyphs.length)],
    isTarget,
    onsetDelayMs: 500 + Math.floor(random() * 651),
    displayMs,
    responseWindowMs,
  }));

  return {
    level,
    seed,
    targetGlyph,
    totalTrials: TOTAL_TRIALS,
    targetCount: TARGET_COUNT,
    distractorCount: TOTAL_TRIALS - TARGET_COUNT,
    stimuli,
  };
}

function boundedReaction(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

export function evaluateNeuralBaseline(
  challenge: NeuralBaselineChallenge,
  responses: readonly NeuralBaselineResponse[],
): NeuralBaselineResult {
  let hits = 0;
  let omissions = 0;
  let falseAlarms = 0;
  let anticipations = 0;
  let lateResponses = 0;
  let correctRejections = 0;
  const validReactionTimes: number[] = [];

  for (let index = 0; index < challenge.stimuli.length; index++) {
    const stimulus = challenge.stimuli[index];
    const reaction = boundedReaction(responses[index]?.reactionMs);

    if (reaction !== null && reaction < 0) {
      anticipations++;
    }

    if (stimulus.isTarget) {
      if (reaction === null) {
        omissions++;
      } else if (reaction < 0) {
        omissions++;
      } else if (reaction < 120) {
        anticipations++;
        omissions++;
      } else if (reaction > stimulus.responseWindowMs) {
        lateResponses++;
        omissions++;
      } else {
        hits++;
        validReactionTimes.push(reaction);
      }
    } else if (reaction !== null) {
      falseAlarms++;
    } else {
      correctRejections++;
    }
  }

  const totalTrials = challenge.stimuli.length;
  const accuracy = totalTrials > 0
    ? (hits + correctRejections) / totalTrials
    : 0;

  const meanReactionMs = validReactionTimes.length > 0
    ? validReactionTimes.reduce((sum, value) => sum + value, 0)
      / validReactionTimes.length
    : null;

  let reactionConsistency = 0;
  if (validReactionTimes.length >= 2 && meanReactionMs !== null) {
    const variance = validReactionTimes.reduce(
      (sum, value) => sum + (value - meanReactionMs) ** 2,
      0,
    ) / validReactionTimes.length;

    reactionConsistency = Math.max(
      0,
      Math.min(100, 100 - (Math.sqrt(variance) / meanReactionMs) * 100),
    );
  } else if (validReactionTimes.length === 1) {
    reactionConsistency = 50;
  }

  const speedScore = meanReactionMs === null
    ? 0
    : Math.max(0, Math.min(100, 100 - (meanReactionMs - 200) / 6));

  const score = Math.round(
    accuracy * 70 + speedScore * 0.2 + reactionConsistency * 0.1,
  );

  return {
    totalTrials,
    targetCount: challenge.stimuli.filter((item) => item.isTarget).length,
    distractorCount: challenge.stimuli.filter((item) => !item.isTarget).length,
    hits,
    omissions,
    falseAlarms,
    anticipations,
    lateResponses,
    correctRejections,
    accuracy: Math.round(accuracy * 100),
    meanReactionMs: meanReactionMs === null
      ? null
      : Math.round(meanReactionMs),
    reactionConsistency: Math.round(reactionConsistency),
    score: Math.max(0, Math.min(100, score)),
  };
}
