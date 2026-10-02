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

export type NftMarketplaceEligibilityIssueCode =
  | "LISTING_INVALID"
  | "PROVENANCE_REFERENCE_MISSING"
  | "DNA_REFERENCE_MISSING"
  | "SELLER_REFERENCE_MISSING"
  | "WALLET_REFERENCE_MISSING"
  | "LISTING_NOT_READY"
  | "PRICE_NOT_POSITIVE"
  | "EXPIRED_LISTING"
  | "PROVENANCE_CLOSURE_INVALID"
  | "ASSET_ID_MISMATCH"
  | "COLLECTION_ID_MISMATCH";

export type NftMarketplaceEligibilityIssue = {
  readonly code:
    NftMarketplaceEligibilityIssueCode;

  readonly message:
    string;
};

export type NftMarketplaceEligibilityResult = {
  readonly eligible:
    boolean;

  readonly issues:
    readonly NftMarketplaceEligibilityIssue[];

  readonly authoritative:
    false;
};

export type NftMarketplaceSaleIntent = {
  readonly listingId:
    string;

  readonly assetId:
    string;

  readonly sellerId:
    string;

  readonly saleType:
    NftMarketplaceSaleType;

  readonly price:
    NftMarketplacePrice;

  readonly createdAt:
    string;

  readonly authoritative:
    false;
};

export type NftMarketplaceOrderStatus =
  | "CREATED"
  | "MATCHED"
  | "READY_FOR_SETTLEMENT"
  | "CANCELLED"
  | "REJECTED";

export type NftMarketplaceBuyer = {
  readonly buyerId:
    string;

  readonly walletRef:
    string | null;

  readonly authoritative:
    false;
};

export type NftMarketplaceOrderIntent = {
  readonly id:
    string;

  readonly listingId:
    string;

  readonly assetId:
    string;

  readonly buyer:
    NftMarketplaceBuyer;

  readonly sellerId:
    string;

  readonly price:
    NftMarketplacePrice;

  readonly status:
    NftMarketplaceOrderStatus;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;

  readonly authoritative:
    false;
};

export type NftMarketplaceOrderIssueCode =
  | "EMPTY_ORDER_ID"
  | "EMPTY_LISTING_ID"
  | "EMPTY_ASSET_ID"
  | "EMPTY_BUYER_ID"
  | "EMPTY_SELLER_ID"
  | "BUYER_EQUALS_SELLER"
  | "BUYER_WALLET_MISSING"
  | "PRICE_MISMATCH"
  | "LISTING_NOT_LISTED"
  | "ASSET_MISMATCH"
  | "SELLER_MISMATCH";

export type NftMarketplaceOrderIssue = {
  readonly code:
    NftMarketplaceOrderIssueCode;

  readonly message:
    string;
};

export type NftMarketplaceOrderValidationResult = {
  readonly valid:
    boolean;

  readonly issues:
    readonly NftMarketplaceOrderIssue[];

  readonly authoritative:
    false;
};

export type NftMarketplacePreSettlement = {
  readonly orderId:
    string;

  readonly listingId:
    string;

  readonly assetId:
    string;

  readonly buyerId:
    string;

  readonly sellerId:
    string;

  readonly price:
    NftMarketplacePrice;

  readonly ready:
    boolean;

  readonly createdAt:
    string;

  readonly authoritative:
    false;
};
