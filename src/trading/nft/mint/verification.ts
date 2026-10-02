import type {
  NftMintIntent,
  NftMintTransactionEvidence,
  NftMintVerificationIssue,
  NftMintVerificationResult,
} from "./types";

function nonEmpty(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function verifyNftMintEvidence(
  intent: NftMintIntent,
  evidence:
    NftMintTransactionEvidence
): NftMintVerificationResult {
  const issues:
    NftMintVerificationIssue[] = [];

  if (
    evidence.receiptStatus !==
    "SUCCESS"
  ) {
    issues.push({
      code:
        "RECEIPT_FAILED",
      message:
        "Transaction receipt did not report success.",
    });
  }

  if (
    evidence.tokenId === null ||
    !nonEmpty(evidence.tokenId)
  ) {
    issues.push({
      code:
        "MISSING_TOKEN_ID",
      message:
        "Verified mint requires a token id.",
    });
  }

  if (
    evidence.owner === null ||
    !nonEmpty(evidence.owner)
  ) {
    issues.push({
      code:
        "MISSING_OWNER",
      message:
        "Verified mint requires an owner.",
    });
  }

  if (
    evidence.metadataRef === null ||
    !nonEmpty(
      evidence.metadataRef
    )
  ) {
    issues.push({
      code:
        "MISSING_METADATA",
      message:
        "Verified mint requires metadata evidence.",
    });
  }

  if (
    !evidence.mintEventFound
  ) {
    issues.push({
      code:
        "MISSING_MINT_EVENT",
      message:
        "Verified mint requires a mint event.",
    });
  }

  if (
    evidence.owner !== null &&
    evidence.owner !==
      intent.expectedOwner
  ) {
    issues.push({
      code:
        "OWNER_MISMATCH",
      message:
        "Mint owner does not match the requested owner.",
    });
  }

  if (
    evidence.metadataRef !== null &&
    evidence.metadataRef !==
      intent.expectedMetadataRef
  ) {
    issues.push({
      code:
        "METADATA_MISMATCH",
      message:
        "Mint metadata does not match the expected metadata reference.",
    });
  }

  if (
    !nonEmpty(
      evidence.contractAddress
    )
  ) {
    issues.push({
      code:
        "INVALID_CONTRACT",
      message:
        "Contract address is required.",
    });
  }

  if (
    !nonEmpty(
      evidence.transactionHash
    )
  ) {
    issues.push({
      code:
        "INVALID_TRANSACTION_HASH",
      message:
        "Transaction hash is required.",
    });
  }

  if (
    !Number.isInteger(
      evidence.blockNumber
    ) ||
    evidence.blockNumber < 1
  ) {
    issues.push({
      code:
        "INVALID_BLOCK_NUMBER",
      message:
        "Block number must be a positive integer.",
    });
  }

  return {
    verified:
      issues.length === 0,
    issues,
  };
}
