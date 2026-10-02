export type NftForgeSection =
  | "create"
  | "collections"
  | "drafts"
  | "assets"
  | "generative"
  | "living"
  | "origin"
  | "certificates";

export type NftAssetStatus =
  | "DRAFT"
  | "READY"
  | "ARCHIVED";

export type NftCollectionStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ARCHIVED";

export type NftTrait = {
  readonly traitType: string;
  readonly value: string;
};

export type NftMetadata = {
  readonly name: string;
  readonly description: string;
  readonly externalUrl?: string;
  readonly attributes: readonly NftTrait[];
};

export type NftAsset = {
  readonly id: string;
  readonly title: string;
  readonly collectionId: string | null;
  readonly creator: string;
  readonly mediaKind:
    | "image"
    | "video"
    | "audio"
    | "interactive";
  readonly status: NftAssetStatus;
  readonly traits: readonly NftTrait[];
  readonly metadata: NftMetadata;
  readonly version: number;
  readonly updatedAt: string;
};

export type NftCollection = {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly description: string;
  readonly creator: string;
  readonly status: NftCollectionStatus;
  readonly version: number;
  readonly assetIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NftCollectionActivityKind =
  | "collection.created"
  | "collection.updated"
  | "collection.archived"
  | "asset.attached"
  | "asset.detached"
  | "asset.updated";

export type NftForgeActivity = {
  readonly id: string;
  readonly kind: NftCollectionActivityKind;
  readonly collectionId?: string;
  readonly assetId?: string;
  readonly label: string;
  readonly timestamp: string;

  /**
   * Local Forge activity is evidence only.
   * It is not blockchain proof and never becomes
   * mint, ownership or provenance authority.
   */
  readonly authoritative: false;
};

export type NftCollectionValidationIssue = {
  readonly code:
    | "INVALID_ID"
    | "INVALID_NAME"
    | "INVALID_SYMBOL"
    | "INVALID_DESCRIPTION"
    | "INVALID_CREATOR"
    | "INVALID_VERSION"
    | "DUPLICATE_ASSET_ID"
    | "UNKNOWN_ASSET_ID"
    | "ASSET_COLLECTION_MISMATCH";

  readonly message: string;
  readonly field?: string;
};

export type NftCollectionValidationResult = {
  readonly valid: boolean;
  readonly issues:
    readonly NftCollectionValidationIssue[];
};

export type NftCollectionRepositoryState = {
  readonly collections:
    readonly NftCollection[];

  readonly assets:
    readonly NftAsset[];

  readonly activity:
    readonly NftForgeActivity[];
};
