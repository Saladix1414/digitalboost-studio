export type NftProvenanceEvidenceKind =
  | "ORIGIN"
  | "DNA_IDENTITY"
  | "DNA_INTEGRITY"
  | "BLOCKCHAIN_PROOF"
  | "IMPORT_REFERENCE"
  | "CREATOR_ASSERTION";

export type NftProvenanceEvidenceReference = {
  readonly id: string;

  readonly kind:
    NftProvenanceEvidenceKind;

  readonly reference:
    string;

  readonly observedAt:
    string;

  readonly authoritative:
    false;
};

export type NftProvenanceLinkType =
  | "CREATED_FROM"
  | "DERIVED_FROM"
  | "CAPTURED_FROM"
  | "VERIFIED_AGAINST"
  | "REFERENCES";

export type NftProvenanceLink = {
  readonly id: string;

  readonly fromEvidenceId:
    string;

  readonly toEvidenceId:
    string;

  readonly type:
    NftProvenanceLinkType;

  readonly authoritative:
    false;
};

export type NftProvenanceStatus =
  | "DRAFT"
  | "ASSEMBLED"
  | "VALIDATED"
  | "ARCHIVED";

export type NftProvenanceRecord = {
  readonly id: string;

  readonly assetId: string;

  readonly collectionId: string;

  readonly creatorRef: string;

  readonly evidence:
    readonly NftProvenanceEvidenceReference[];

  readonly links:
    readonly NftProvenanceLink[];

  readonly version: number;

  readonly status:
    NftProvenanceStatus;

  readonly createdAt: string;

  readonly authoritative:
    false;
};

export type NftProvenanceValidationIssueCode =
  | "EMPTY_PROVENANCE_ID"
  | "EMPTY_ASSET_ID"
  | "EMPTY_COLLECTION_ID"
  | "EMPTY_CREATOR_REF"
  | "EMPTY_EVIDENCE"
  | "DUPLICATE_EVIDENCE_ID"
  | "DUPLICATE_LINK_ID"
  | "BROKEN_LINK_SOURCE"
  | "BROKEN_LINK_TARGET"
  | "SELF_REFERENTIAL_LINK"
  | "INVALID_VERSION"
  | "EMPTY_CREATED_AT"
  | "AUTHORITY_ESCALATION";

export type NftProvenanceValidationIssue = {
  readonly code:
    NftProvenanceValidationIssueCode;

  readonly message:
    string;
};

export type NftProvenanceValidationResult = {
  readonly valid:
    boolean;

  readonly issues:
    readonly NftProvenanceValidationIssue[];
};
