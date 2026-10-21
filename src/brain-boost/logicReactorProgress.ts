export const MAX_LEVEL = 99;
export const MAX_ROUNDS_PER_RUN = 5;

export function safeInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(value)));
}

export function normalizeCoreLevel(value: unknown): number {
  const level = safeInteger(value, 1, 1, MAX_LEVEL);
  const lastCoreLevel =
    1 + Math.floor((MAX_LEVEL - 1) / MAX_ROUNDS_PER_RUN) * MAX_ROUNDS_PER_RUN;

  // Migra el progreso guardado por la versión anterior a bloques de cinco.
  return Math.min(
    lastCoreLevel,
    1 + Math.ceil((level - 1) / MAX_ROUNDS_PER_RUN) * MAX_ROUNDS_PER_RUN,
  );
}

export function getRoundsInRun(coreLevel: unknown): number {
  const start = normalizeCoreLevel(coreLevel);
  return Math.min(MAX_ROUNDS_PER_RUN, MAX_LEVEL - start + 1);
}

export function getUnlockedLevelAfterRun(
  currentUnlockedLevel: unknown,
  coreLevel: unknown,
  correctCount: unknown,
): number {
  const current = normalizeCoreLevel(currentUnlockedLevel);
  const correct = safeInteger(correctCount, 0, 0, MAX_ROUNDS_PER_RUN);

  if (correct < 4) return current;

  const start = normalizeCoreLevel(coreLevel);
  const nextLevel = start + getRoundsInRun(start);

  // El nivel 99 es el final; no se desbloquea un nivel 100 inexistente.
  if (nextLevel > MAX_LEVEL) return current;

  return Math.max(current, nextLevel);
}
