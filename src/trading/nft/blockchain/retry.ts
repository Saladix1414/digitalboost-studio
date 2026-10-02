import type {
  NftBlockchainRetryPolicy,
  NftBlockchainRetryResult,
} from "./types";

export function evaluateBlockchainRetry(
  policy:
    NftBlockchainRetryPolicy,
  attempt:
    number
): NftBlockchainRetryResult {
  if (
    policy.maxAttempts <= 0
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_INVALID_RETRY_POLICY"
    );
  }

  if (
    attempt < policy.maxAttempts
  ) {
    return {
      attempt,

      decision:
        "RETRY",

      reason:
        "Retry budget remains.",

      authoritative:
        false,
    };
  }

  if (
    policy.fallbackEnabled
  ) {
    return {
      attempt,

      decision:
        "FALLBACK",

      reason:
        "Retry budget exhausted; fallback permitted.",

      authoritative:
        false,
    };
  }

  return {
    attempt,

    decision:
      "STOP",

    reason:
      "Retry budget exhausted and fallback disabled.",

    authoritative:
      false,
  };
}
