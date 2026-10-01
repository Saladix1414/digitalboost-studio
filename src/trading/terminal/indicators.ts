import type {
  Candle,
} from "../types/trading";

export function calculateEMA(
  values: readonly number[],
  period: number
): readonly number[] {
  if (values.length === 0) {
    return [];
  }

  const multiplier =
    2 / (period + 1);

  const result: number[] = [
    values[0],
  ];

  for (
    let index = 1;
    index < values.length;
    index += 1
  ) {
    result.push(
      (
        values[index] -
        result[index - 1]
      ) *
        multiplier +
        result[index - 1]
    );
  }

  return result;
}

export function calculateRSI(
  values: readonly number[],
  period = 14
): number {
  if (values.length < 2) {
    return 50;
  }

  let gains = 0;
  let losses = 0;

  const start =
    Math.max(
      1,
      values.length - period
    );

  for (
    let index = start;
    index < values.length;
    index += 1
  ) {
    const delta =
      values[index] -
      values[index - 1];

    if (delta >= 0) {
      gains += delta;
    } else {
      losses += Math.abs(
        delta
      );
    }
  }

  const samples =
    Math.max(
      1,
      values.length - start
    );

  const averageGain =
    gains / samples;

  const averageLoss =
    losses / samples;

  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength =
    averageGain /
    averageLoss;

  return (
    100 -
    100 /
      (
        1 +
        relativeStrength
      )
  );
}

export function getTerminalIndicators(
  candles: readonly Candle[]
) {
  const closes =
    candles.map(
      (candle) =>
        candle.close
    );

  const ema20 =
    calculateEMA(
      closes,
      20
    );

  const ema50 =
    calculateEMA(
      closes,
      50
    );

  return {
    ema20:
      ema20[
        ema20.length - 1
      ] ?? 0,

    ema50:
      ema50[
        ema50.length - 1
      ] ?? 0,

    rsi:
      calculateRSI(
        closes
      ),

    volume:
      candles[
        candles.length - 1
      ]?.volume ?? 0,
  };
}
