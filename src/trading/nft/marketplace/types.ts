export type NftMarketplaceListingStatus =
  | "DRAFT"
  | "READY"
  | "LISTED"
  | "PAUSED"
  | "SOLD"
  | "CANCELLED"
  | "EXPIRED";

export type NftMarketplaceSaleType =
  | "FIXED_PRICE"
  | "AUCTION";

export type NftMarketplaceCurrency =
  | "DBX"
  | "USDT"
  | "NATIVE";

export type NftMarketplacePrice = {
  readonly amount:
    number;

  readonly currency:
    NftMarketplaceCurrency;

  readonly authoritative:
    false;
};

export type NftMarketplaceSeller = {
  readonly sellerId:
    string;

  readonly walletRef:
    string | null;

  readonly authoritative:
    false;
};

export type NftMarketplaceAssetReference = {
  readonly assetId:
    string;

  readonly collectionId:
    string;

  readonly provenanceId:
    string | null;

  readonly dnaId:
    string | null;

  readonly authoritative:
    false;
};

export type NftMarketplaceListing = {
  readonly id:
    string;

  readonly asset:
    NftMarketplaceAssetReference;

  readonly seller:
    NftMarketplaceSeller;

  readonly saleType:
    NftMarketplaceSaleType;

  readonly price:
    NftMarketplacePrice;

  readonly status:
    NftMarketplaceListingStatus;

  readonly version:
    number;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;

  readonly expiresAt:
    string | null;

  readonly authoritative:
    false;
};

export type NftMarketplaceValidationIssueCode =
  | "EMPTY_LISTING_ID"
  | "EMPTY_ASSET_ID"
  | "EMPTY_COLLECTION_ID"
  | "EMPTY_SELLER_ID"
  | "INVALID_PRICE"
  | "INVALID_VERSION"
  | "EMPTY_CREATED_AT"
  | "EMPTY_UPDATED_AT"
  | "INVALID_EXPIRATION"
  | "AUTHORITY_ESCALATION";

export type NftMarketplaceValidationIssue = {
  readonly code:
    NftMarketplaceValidationIssueCode;

  readonly message:
    string;
};

export type NftMarketplaceValidationResult = {
  readonly valid:
    boolean;

  readonly issues:
    readonly NftMarketplaceValidationIssue[];
};
