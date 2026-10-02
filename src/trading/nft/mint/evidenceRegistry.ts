import type {
  NftMintEvidenceClaim,
  NftMintEvidenceFingerprint,
  NftMintEvidenceRegistry,
  NftMintEvidenceSecurityResult,
  NftMintIntent,
  NftMintTransactionEvidence,
} from "./types";

function normalize(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

export function fingerprintMintEvidence(
  evidence:
    NftMintTransactionEvidence
): NftMintEvidenceFingerprint | null {
  if (
    evidence.tokenId === null ||
    evidence.tokenId
      .trim()
      .length === 0
  ) {
    return null;
  }

  return {
    chainId:
      normalize(
        evidence.chainId
      ),

    contractAddress:
      normalize(
        evidence.contractAddress
      ),

    transactionHash:
      normalize(
        evidence.transactionHash
      ),

    tokenId:
      normalize(
        evidence.tokenId
      ),
  };
}

function sameTransaction(
  left:
    NftMintEvidenceFingerprint,
  right:
    NftMintEvidenceFingerprint
): boolean {
  return (
    left.chainId ===
      right.chainId &&
    left.transactionHash ===
      right.transactionHash
  );
}

function sameToken(
  left:
    NftMintEvidenceFingerprint,
  right:
    NftMintEvidenceFingerprint
): boolean {
  return (
    left.chainId ===
      right.chainId &&
    left.contractAddress ===
      right.contractAddress &&
    left.tokenId ===
      right.tokenId
  );
}

export function inspectMintEvidenceSecurity(
  registry:
    NftMintEvidenceRegistry,
  intent:
    NftMintIntent,
  evidence:
    NftMintTransactionEvidence
): NftMintEvidenceSecurityResult {
  const fingerprint =
    fingerprintMintEvidence(
      evidence
    );

  if (!fingerprint) {
    return {
      accepted: true,
      issues: [],
    };
  }

  const issues:
    NftMintEvidenceSecurityResult["issues"][number][] =
      [];

  for (
    const claim of
    registry.claims
  ) {
    if (
      sameTransaction(
        claim.fingerprint,
        fingerprint
      )
    ) {
      if (
        claim.intentId ===
        intent.id
      ) {
        issues.push({
          code:
            "EVIDENCE_ALREADY_CLAIMED",
          message:
            "Transaction evidence is already claimed by this mint intent.",
        });
      } else {
        issues.push({
          code:
            "DUPLICATE_TRANSACTION",
          message:
            "Transaction evidence is already associated with another mint intent.",
        });

        issues.push({
          code:
            "EVIDENCE_REPLAY",
          message:
            "Transaction evidence cannot be replayed across mint intents.",
        });
      }
    }

    if (
      sameToken(
        claim.fingerprint,
        fingerprint
      ) &&
      claim.intentId !==
        intent.id
    ) {
      issues.push({
        code:
          "DUPLICATE_TOKEN",
        message:
          "Token evidence is already associated with another mint intent.",
      });
    }
  }

  return {
    accepted:
      issues.length === 0,
    issues,
  };
}

export function claimMintEvidence(
  registry:
    NftMintEvidenceRegistry,
  intent:
    NftMintIntent,
  evidence:
    NftMintTransactionEvidence,
  claimedAt: string
): NftMintEvidenceRegistry {
  const fingerprint =
    fingerprintMintEvidence(
      evidence
    );

  if (!fingerprint) {
    throw new Error(
      "MINT_EVIDENCE_NOT_CLAIMABLE"
    );
  }

  const security =
    inspectMintEvidenceSecurity(
      registry,
      intent,
      evidence
    );

  if (!security.accepted) {
    throw new Error(
      `MINT_EVIDENCE_REJECTED:${security.issues
        .map(
          (issue) =>
            issue.code
        )
        .join(",")}`
    );
  }

  const claim:
    NftMintEvidenceClaim = {
      fingerprint,
      intentId:
        intent.id,
      assetId:
        intent.assetId,
      collectionId:
        intent.collectionId,
      claimedAt,
      authoritative: false,
    };

  return {
    claims: [
      ...registry.claims,
      claim,
    ],
  };
}
