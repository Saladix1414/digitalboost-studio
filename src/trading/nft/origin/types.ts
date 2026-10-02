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

export type NftOriginRevisionReason =
  | "INITIAL_CAPTURE"
  | "CONTEXT_UPDATE"
  | "SOURCE_UPDATE"
  | "MODE_UPDATE"
  | "ARCHIVED";

export type NftOriginSnapshot = {
  readonly identityHash: string;
  readonly contextHash: string;
  readonly recordHash: string;

  readonly authoritative: false;
};

export type NftOriginHistoryEntry = {
  readonly id: string;

  readonly originId: string;

  readonly version: number;

  readonly previousEntryId:
    string | null;

  readonly reason:
    NftOriginRevisionReason;

  readonly snapshot:
    NftOriginSnapshot;

  readonly capturedAt: string;

  /**
   * Origin history records immutable capture state.
   * It does not establish provenance or ownership.
   */
  readonly authoritative: false;
};

export type NftOriginHistory = {
  readonly originId: string;

  readonly entries:
    readonly NftOriginHistoryEntry[];

  readonly authoritative: false;
};

export type NftOriginHistoryValidationIssueCode =
  | "INVALID_HISTORY_ORIGIN_ID"
  | "EMPTY_ORIGIN_HISTORY"
  | "INVALID_HISTORY_ENTRY_ID"
  | "INVALID_HISTORY_VERSION"
  | "INVALID_HISTORY_SEQUENCE"
  | "INVALID_HISTORY_LINK"
  | "INVALID_IDENTITY_HASH"
  | "INVALID_CONTEXT_HASH"
  | "INVALID_RECORD_HASH"
  | "INVALID_HISTORY_TIMESTAMP";

export type NftOriginHistoryValidationIssue = {
  readonly code:
    NftOriginHistoryValidationIssueCode;

  readonly message: string;
};

export type NftOriginHistoryValidationResult = {
  readonly valid: boolean;

  readonly issues:
    readonly NftOriginHistoryValidationIssue[];
};

export type NftOriginClassicConfig = {
  readonly workflow:
    "MANUAL" | "FORGE";

  readonly templateRef:
    string | null;
};

export type NftOriginGenerativeConfig = {
  readonly generatorRef: string;

  readonly seed: string;

  readonly deterministic:
    boolean;

  readonly rulesetVersion:
    number;
};

export type NftOriginLivingConfig = {
  readonly evolutionModel:
    "STATE_BASED" | "EVENT_DRIVEN";

  readonly initialState: string;

  readonly evolutionSchemaRef:
    string;
};

export type NftOriginImportedConfig = {
  readonly sourceSystem: string;

  readonly externalAssetRef:
    string;

  readonly importedAt: string;
};

export type NftOriginModeConfig =
  | {
      readonly mode:
        "CLASSIC";

      readonly config:
        NftOriginClassicConfig;
    }
  | {
      readonly mode:
        "GENERATIVE";

      readonly config:
        NftOriginGenerativeConfig;
    }
  | {
      readonly mode:
        "LIVING";

      readonly config:
        NftOriginLivingConfig;
    }
  | {
      readonly mode:
        "IMPORTED";

      readonly config:
        NftOriginImportedConfig;
    };

export type NftOriginModeValidationIssueCode =
  | "MODE_MISMATCH"
  | "INVALID_CLASSIC_WORKFLOW"
  | "INVALID_GENERATOR_REFERENCE"
  | "INVALID_GENERATIVE_SEED"
  | "INVALID_GENERATIVE_RULESET_VERSION"
  | "INVALID_LIVING_INITIAL_STATE"
  | "INVALID_LIVING_SCHEMA_REFERENCE"
  | "INVALID_IMPORT_SOURCE_SYSTEM"
  | "INVALID_IMPORT_ASSET_REFERENCE"
  | "INVALID_IMPORT_TIMESTAMP";

export type NftOriginModeValidationIssue = {
  readonly code:
    NftOriginModeValidationIssueCode;

  readonly message: string;
};

export type NftOriginModeValidationResult = {
  readonly valid: boolean;

  readonly issues:
    readonly NftOriginModeValidationIssue[];
};
