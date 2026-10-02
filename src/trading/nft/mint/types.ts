export type NftMintMode =
  | "BASIC"
  | "MINT_ON_SALE";

export type NftMintStatus =
  | "DRAFT"
  | "READY"
  | "PREPARING"
  | "AWAITING_SIGNATURE"
  | "SUBMITTED"
  | "CONFIRMING"
  | "VERIFIED"
  | "FAILED"
  | "REJECTED"
  | "CANCELLED";

export type NftMintPricingIntent = {
  readonly mode: NftMintMode;

  /**
   * Economic intent only.
   * This does not debit DBX.
   */
  readonly upfrontDbx: number;

  readonly gasRequired: boolean;

  readonly authoritative: false;
};

export type NftMintIntent = {
  readonly id: string;
  readonly assetId: string;
  readonly collectionId: string;
  readonly mode: NftMintMode;
  readonly expectedOwner: string;
  readonly expectedMetadataRef: string;
  readonly requestedAt: string;
  readonly pricing: NftMintPricingIntent;
};

export type NftMintPrepared = {
  readonly intentId: string;
  readonly assetId: string;
  readonly collectionId: string;
  readonly mode: NftMintMode;
  readonly expectedOwner: string;
  readonly expectedMetadataRef: string;
  readonly preparedAt: string;

  /**
   * This is a deterministic preparation artifact,
   * not a blockchain transaction.
   */
  readonly authoritative: false;
};

export type NftMintTransactionEvidence = {
  readonly chainId: string;
  readonly contractAddress: string;
  readonly transactionHash: string;
  readonly blockNumber: number;
  readonly receiptStatus:
    | "SUCCESS"
    | "FAILED";
  readonly tokenId: string | null;
  readonly owner: string | null;
  readonly metadataRef: string | null;
  readonly mintEventFound: boolean;

  /**
   * Evidence is not authority by itself.
   */
  readonly authoritative: false;
};

export type NftMintVerificationIssueCode =
  | "RECEIPT_FAILED"
  | "MISSING_TOKEN_ID"
  | "MISSING_OWNER"
  | "MISSING_METADATA"
  | "MISSING_MINT_EVENT"
  | "OWNER_MISMATCH"
  | "METADATA_MISMATCH"
  | "INVALID_CONTRACT"
  | "INVALID_TRANSACTION_HASH"
  | "INVALID_BLOCK_NUMBER";

export type NftMintVerificationIssue = {
  readonly code:
    NftMintVerificationIssueCode;
  readonly message: string;
};

export type NftMintVerificationResult = {
  readonly verified: boolean;
  readonly issues:
    readonly NftMintVerificationIssue[];
};

export type NftMintRecord = {
  readonly intent:
    NftMintIntent;

  readonly status:
    NftMintStatus;

  readonly prepared:
    NftMintPrepared | null;

  readonly evidence:
    NftMintTransactionEvidence | null;

  readonly verification:
    NftMintVerificationResult | null;

  readonly updatedAt: string;
};

export type NftMintEvidenceFingerprint = {
  readonly chainId: string;
  readonly contractAddress: string;
  readonly transactionHash: string;
  readonly tokenId: string;
};

export type NftMintEvidenceClaim = {
  readonly fingerprint:
    NftMintEvidenceFingerprint;

  readonly intentId: string;
  readonly assetId: string;
  readonly collectionId: string;

  readonly claimedAt: string;

  /**
   * Registry claims prevent duplicate/replayed
   * deterministic evidence from being accepted.
   * They are not blockchain authority.
   */
  readonly authoritative: false;
};

export type NftMintEvidenceRegistry = {
  readonly claims:
    readonly NftMintEvidenceClaim[];
};

export type NftMintSecurityIssueCode =
  | "DUPLICATE_TRANSACTION"
  | "DUPLICATE_TOKEN"
  | "EVIDENCE_REPLAY"
  | "INTENT_EVIDENCE_MISMATCH"
  | "EVIDENCE_ALREADY_CLAIMED";

export type NftMintSecurityIssue = {
  readonly code:
    NftMintSecurityIssueCode;

  readonly message: string;
};

export type NftMintEvidenceSecurityResult = {
  readonly accepted: boolean;

  readonly issues:
    readonly NftMintSecurityIssue[];
};
