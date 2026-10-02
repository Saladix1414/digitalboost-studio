export type NftOriginMode =
  | "CLASSIC"
  | "GENERATIVE"
  | "LIVING"
  | "IMPORTED";

export type NftOriginStatus =
  | "DRAFT"
  | "CAPTURED"
  | "VALIDATED"
  | "ARCHIVED";

export type NftOriginSourceType =
  | "FORGE"
  | "IMPORT"
  | "GENERATOR"
  | "MANUAL";

export type NftOriginSourceReference = {
  readonly type:
    NftOriginSourceType;

  readonly reference: string;

  readonly authoritative: false;
};

export type NftOriginIdentity = {
  readonly assetId: string;
  readonly collectionId: string;
  readonly creator: string;

  readonly authoritative: false;
};

export type NftOriginContext = {
  readonly mode:
    NftOriginMode;

  readonly createdAt: string;

  readonly forgeConfig: string;

  readonly source:
    NftOriginSourceReference;

  readonly authoritative: false;
};

export type NftOriginRecord = {
  readonly id: string;

  readonly identity:
    NftOriginIdentity;

  readonly context:
    NftOriginContext;

  readonly version: number;

  readonly status:
    NftOriginStatus;

  readonly capturedAt: string;

  /**
   * Origin records creation context only.
   *
   * Origin does not establish:
   * - provenance
   * - ownership
   * - legal authenticity
   * - blockchain authority
   */
  readonly authoritative: false;
};

export type NftOriginValidationIssueCode =
  | "INVALID_ORIGIN_ID"
  | "INVALID_ASSET_ID"
  | "INVALID_COLLECTION_ID"
  | "INVALID_CREATOR"
  | "INVALID_CREATED_AT"
  | "INVALID_CAPTURED_AT"
  | "INVALID_FORGE_CONFIG"
  | "INVALID_SOURCE_REFERENCE"
  | "INVALID_VERSION";

export type NftOriginValidationIssue = {
  readonly code:
    NftOriginValidationIssueCode;

  readonly message: string;
};

export type NftOriginValidationResult = {
  readonly valid: boolean;

  readonly issues:
    readonly NftOriginValidationIssue[];
};
