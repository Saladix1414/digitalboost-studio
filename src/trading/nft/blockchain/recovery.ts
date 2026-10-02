import {
  evaluateBlockchainRetry,
} from "./retry";

import {
  createBlockchainFallbackRecord,
} from "./fallback";

import type {
  NftBlockchainGatewayRequest,
  NftBlockchainRetryPolicy,
} from "./types";

export function evaluateBlockchainRecovery(
  request:
    NftBlockchainGatewayRequest,
  policy:
    NftBlockchainRetryPolicy,
  attempt:
    number
) {
  const retry =
    evaluateBlockchainRetry(
      policy,
      attempt
    );

  if (
    retry.decision ===
      "FALLBACK"
  ) {
    const fallback =
      createBlockchainFallbackRecord(
        request,
        `fallback:${request.chainRef}:${request.id}`,
        retry.reason
      );

    return {
      retry,

      fallback,

      authoritative:
        false as const,
    };
  }

  return {
    retry,

    fallback:
      null,

    authoritative:
      false as const,
  };
}
