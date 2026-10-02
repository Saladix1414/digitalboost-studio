import type {
  NftBlockchainSendPreparation,
  NftBlockchainSubmissionEvidence,
} from "./types";

export function createFixtureBlockchainSubmission(
  preparation:
    NftBlockchainSendPreparation,
  input: {
    readonly txHash:
      string;

    readonly submittedAt:
      string;
  }
): NftBlockchainSubmissionEvidence {
  if (
    preparation.stage !==
      "SEND_PREPARED"
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_SEND_NOT_PREPARED"
    );
  }

  if (
    input.txHash.trim().length === 0
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_TX_HASH_REQUIRED"
    );
  }

  return {
    requestId:
      preparation.requestId,

    txHash:
      input.txHash,

    chainRef:
      preparation.chainRef,

    submittedAt:
      input.submittedAt,

    source:
      "FIXTURE",

    stage:
      "SUBMITTED",

    authoritative:
      false,
  };
}
