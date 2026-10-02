import type {
  NftBlockchainIndexEvidence,
  NftBlockchainVerificationEvidence,
} from "./types";

export function indexVerifiedBlockchainEvidence(
  verification:
    NftBlockchainVerificationEvidence,
  indexedAt:
    string
): NftBlockchainIndexEvidence {
  if (
    !verification.verified
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_VERIFICATION_REQUIRED"
    );
  }

  if (
    !verification.blockRef
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_BLOCK_REFERENCE_REQUIRED"
    );
  }

  return {
    requestId:
      verification.requestId,

    txHash:
      verification.txHash,

    chainRef:
      verification.chainRef,

    blockRef:
      verification.blockRef,

    indexRef:
      `index:${verification.chainRef}:${verification.txHash}`,

    indexedAt,

    stage:
      "INDEXED",

    authoritative:
      false,
  };
}
