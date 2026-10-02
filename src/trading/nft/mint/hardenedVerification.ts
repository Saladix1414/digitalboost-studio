import {
  claimMintEvidence,
  inspectMintEvidenceSecurity,
} from "./evidenceRegistry";

import {
  confirmAndVerifyNftMint,
} from "./engine";

import type {
  NftMintEvidenceRegistry,
  NftMintRecord,
} from "./types";

export type HardenedMintVerificationResult = {
  readonly record:
    NftMintRecord;

  readonly registry:
    NftMintEvidenceRegistry;
};

export function verifyNftMintWithReplayProtection(
  record:
    NftMintRecord,
  registry:
    NftMintEvidenceRegistry,
  verifiedAt: string
): HardenedMintVerificationResult {
  if (!record.evidence) {
    throw new Error(
      "MINT_EVIDENCE_REQUIRED"
    );
  }

  const security =
    inspectMintEvidenceSecurity(
      registry,
      record.intent,
      record.evidence
    );

  if (!security.accepted) {
    throw new Error(
      `MINT_SECURITY_REJECTED:${security.issues
        .map(
          (issue) =>
            issue.code
        )
        .join(",")}`
    );
  }

  const verified =
    confirmAndVerifyNftMint(
      record,
      verifiedAt
    );

  if (
    verified.status !==
      "VERIFIED" ||
    verified.verification
      ?.verified !== true
  ) {
    return {
      record:
        verified,
      registry,
    };
  }

  return {
    record:
      verified,

    registry:
      claimMintEvidence(
        registry,
        verified.intent,
        verified.evidence!,
        verifiedAt
      ),
  };
}
