import type {
  NftBlockchainFallbackRecord,
  NftBlockchainGatewayRequest,
} from "./types";

export function createBlockchainFallbackRecord(
  request:
    NftBlockchainGatewayRequest,
  fallbackRef:
    string,
  reason:
    string
): NftBlockchainFallbackRecord {
  if (
    fallbackRef.trim().length === 0
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_FALLBACK_REFERENCE_REQUIRED"
    );
  }

  return {
    requestId:
      request.id,

    fromChainRef:
      request.chainRef,

    fallbackRef,

    reason,

    executable:
      false,

    authoritative:
      false,
  };
}
