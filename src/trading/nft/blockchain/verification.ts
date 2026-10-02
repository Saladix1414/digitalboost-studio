import type {
  NftBlockchainSubmissionEvidence,
  NftBlockchainVerificationCheck,
  NftBlockchainVerificationEvidence,
} from "./types";

export function verifyFixtureBlockchainSubmission(
  submission:
    NftBlockchainSubmissionEvidence,
  input: {
    readonly requestId:
      string;

    readonly chainRef:
      string;

    readonly blockRef:
      string | null;
  }
): NftBlockchainVerificationEvidence {
  const checks:
    NftBlockchainVerificationCheck[] = [
      {
        code:
          "REQUEST_BINDING",

        passed:
          submission.requestId ===
          input.requestId,

        message:
          "Submission request must match verification request.",

        authoritative:
          false,
      },

      {
        code:
          "CHAIN_BINDING",

        passed:
          submission.chainRef ===
          input.chainRef,

        message:
          "Submission chain must match verification chain.",

        authoritative:
          false,
      },

      {
        code:
          "TX_HASH_PRESENT",

        passed:
          submission.txHash.trim()
            .length > 0,

        message:
          "Transaction hash must be present.",

        authoritative:
          false,
      },

      {
        code:
          "BLOCK_REFERENCE_PRESENT",

        passed:
          typeof input.blockRef ===
            "string" &&
          input.blockRef.trim()
            .length > 0,

        message:
          "Verification requires a block reference.",

        authoritative:
          false,
      },
    ];

  const verified =
    checks.every(
      (check) =>
        check.passed
    );

  return {
    requestId:
      input.requestId,

    txHash:
      submission.txHash,

    chainRef:
      input.chainRef,

    blockRef:
      input.blockRef,

    checks,

    verified,

    stage:
      "VERIFIED",

    authoritative:
      false,
  };
}
