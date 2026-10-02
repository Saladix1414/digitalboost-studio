export type NftOriginDnaConsistencyIssueCode =
  | "ASSET_ID_MISMATCH"
  | "COLLECTION_ID_MISMATCH"
  | "CREATOR_MISMATCH"
  | "ORIGIN_VERSION_INVALID"
  | "DNA_ASSET_VERSION_INVALID"
  | "FORGE_CONFIG_HASH_MISMATCH"
  | "ORIGIN_CREATED_AT_MISSING"
  | "DNA_CREATED_AT_MISSING";

export type NftOriginDnaConsistencyIssue = {
  readonly code:
    NftOriginDnaConsistencyIssueCode;

  readonly message: string;
};

export type NftOriginDnaConsistencyResult = {
  readonly consistent: boolean;

  readonly issues:
    readonly NftOriginDnaConsistencyIssue[];
};
