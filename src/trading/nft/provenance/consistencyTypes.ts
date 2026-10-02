export type NftProvenanceConsistencyIssueCode =
  | "ASSET_ID_MISMATCH"
  | "COLLECTION_ID_MISMATCH"
  | "CREATOR_REF_MISMATCH"
  | "ORIGIN_EVIDENCE_MISSING"
  | "DNA_IDENTITY_EVIDENCE_MISSING"
  | "DNA_INTEGRITY_EVIDENCE_MISSING"
  | "BLOCKCHAIN_PROOF_EVIDENCE_MISSING"
  | "HISTORY_EMPTY"
  | "HISTORY_LATEST_VERSION_MISMATCH"
  | "HISTORY_RECORD_HASH_MISMATCH";

export type NftProvenanceConsistencyIssue = {
  readonly code:
    NftProvenanceConsistencyIssueCode;

  readonly message:
    string;
};

export type NftProvenanceConsistencyResult = {
  readonly consistent:
    boolean;

  readonly issues:
    readonly NftProvenanceConsistencyIssue[];
};
