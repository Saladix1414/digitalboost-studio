export interface SignalHuntChannel {
  id: string;
  pulses: number[];
}

export interface SignalHuntChallenge {
  level: number;
  targetPulses: number[];
  pulseCount: number;
  channelCount: number;
  correctChannelId: string;
  channels: SignalHuntChannel[];
}

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

export function generateSignalHuntChallenge(
  levelInput: number,
  seedInput: number,
): SignalHuntChallenge {
  const level = normalizeLevel(levelInput);
  const seed = Number.isFinite(seedInput) ? seedInput : 1;
  const random = createRandom(seed);

  const channelCount =
    level <= 10 ? 3 :
    level <= 30 ? 4 :
    level <= 60 ? 5 : 6;

  const pulseCount =
    level <= 10 ? 3 :
    level <= 30 ? 4 :
    level <= 60 ? 5 : 6;

  const targetPulses = Array.from(
    { length: pulseCount },
    () => Math.floor(random() * 4),
  );

  const correctIndex = Math.floor(random() * channelCount);
  const correctChannelId = `channel-${correctIndex + 1}`;
  const seen = new Set<string>([targetPulses.join("")]);
  const channels: SignalHuntChannel[] = [];

  for (let index = 0; index < channelCount; index++) {
    const id = `channel-${index + 1}`;

    if (index === correctIndex) {
      channels.push({ id, pulses: [...targetPulses] });
      continue;
    }

    let candidate: number[] | null = null;

    for (let attempt = 0; attempt < 500 && !candidate; attempt++) {
      const minChanges =
        level <= 10 ? 1 :
        level <= 30 ? 1 :
        level <= 60 ? 2 : 3;

      const extraChanges = level <= 10
        ? 0
        : Math.floor(random() * 2);

      const changeCount = Math.min(
        pulseCount,
        minChanges + extraChanges,
      );

      const positions = new Set<number>();

      while (positions.size < changeCount) {
        positions.add(Math.floor(random() * pulseCount));
      }

      const proposed = [...targetPulses];

      for (const position of positions) {
        proposed[position] = (
          proposed[position] + 1 + Math.floor(random() * 3)
        ) % 4;
      }

      const signature = proposed.join("");

      if (!seen.has(signature)) {
        candidate = proposed;
      }
    }

    // Fallback determinista: garantiza un patrón distinto si los
    // intentos aleatorios encuentran coincidencias repetidas.
    if (!candidate) {
      const combinations = 4 ** pulseCount;

      for (let code = 0; code < combinations; code++) {
        let value = code;
        const proposed = Array.from(
          { length: pulseCount },
          () => {
            const pulse = value % 4;
            value = Math.floor(value / 4);
            return pulse;
          },
        );

        if (!seen.has(proposed.join(""))) {
          candidate = proposed;
          break;
        }
      }
    }

    // Siempre existen patrones suficientes para los seis canales.
    const pulses = candidate ?? [...targetPulses];
    seen.add(pulses.join(""));
    channels.push({ id, pulses });
  }

  return {
    level,
    targetPulses,
    pulseCount,
    channelCount,
    correctChannelId,
    channels,
  };
}
