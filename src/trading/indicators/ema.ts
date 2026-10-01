export function calculateEMA(
  values: readonly number[],
  period: number
): readonly number[] {
  if (values.length === 0) {
    return [];
  }

  if (period <= 0) {
    throw new Error(
      "EMA period must be greater than zero"
    );
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
