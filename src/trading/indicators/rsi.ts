export function calculateRSI(
  values: readonly number[],
  period = 14
): number {
  if (period <= 0) {
    throw new Error(
      "RSI period must be greater than zero"
    );
  }

  if (values.length < 2) {
    return 50;
  }

  const start =
    Math.max(
      1,
      values.length - period
    );

  let gains = 0;
  let losses = 0;

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

  if (
    averageGain === 0 &&
    averageLoss === 0
  ) {
    return 50;
  }

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


export function calculateRSISeries(
  values: readonly number[],
  period = 14
): readonly number[] {
  if (values.length === 0) {
    return [];
  }

  return values.map(
    (_, index) =>
      calculateRSI(
        values.slice(
          0,
          index + 1
        ),
        period
      )
  );
}
