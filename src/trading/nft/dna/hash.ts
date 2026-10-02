/**
 * Deterministic local hash used only for fixtures
 * and domain tests.
 *
 * This is intentionally NOT presented as a
 * cryptographic or blockchain proof.
 */

export function deterministicDnaHash(
  value: string
): string {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(index);

    hash =
      Math.imul(
        hash,
        16777619
      ) >>> 0;
  }

  return `dna-${hash
    .toString(16)
    .padStart(8, "0")}`;
}
