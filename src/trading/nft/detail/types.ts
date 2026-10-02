import type {
  NftMarketplaceCatalogItem,
} from "../marketplace/catalog/types";

export type NftDetailIdentity = {
  readonly assetId:
    string;

  readonly collectionId:
    string;

  readonly creatorRef:
    string;

  readonly authoritative:
    false;
};

export type NftDetailIntegrity = {
  readonly dnaId:
    string | null;

  readonly provenanceId:
    string | null;

  readonly originId:
    string | null;

  readonly authoritative:
    false;
};

export type NftDetailMarketContext = {
  readonly listingId:
    string;

  readonly sellerId:
    string;

  readonly walletRef:
    string | null;

  readonly priceAmount:
    number;

  readonly currency:
    string;

  readonly saleType:
    string;

  readonly status:
    string;

  readonly authoritative:
    false;
};

export type NftAssetDetail = {
  readonly id:
    string;

  readonly title:
    string;

  readonly subtitle:
    string;

  readonly imageRef:
    string | null;

  readonly featured:
    boolean;

  readonly identity:
    NftDetailIdentity;

  readonly integrity:
    NftDetailIntegrity;

  readonly market:
    NftDetailMarketContext;

  readonly authoritative:
    false;
};

export type NftDetailValidationIssueCode =
  | "EMPTY_DETAIL_ID"
  | "EMPTY_ASSET_ID"
  | "EMPTY_COLLECTION_ID"
  | "EMPTY_CREATOR_REF"
  | "EMPTY_LISTING_ID"
  | "EMPTY_SELLER_ID"
  | "INVALID_PRICE"
  | "LISTING_NOT_LISTED"
  | "AUTHORITY_ESCALATION";

export type NftDetailValidationIssue = {
  readonly code:
    NftDetailValidationIssueCode;

  readonly message:
    string;
};

export type NftDetailValidationResult = {
  readonly valid:
    boolean;

  readonly issues:
    readonly NftDetailValidationIssue[];

  readonly authoritative:
    false;
};

export type NftDetailSource = {
  readonly catalogItem:
    NftMarketplaceCatalogItem;
};
