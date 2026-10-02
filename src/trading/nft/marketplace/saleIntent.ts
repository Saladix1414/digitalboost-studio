import type {
  NftMarketplaceEligibilityResult,
  NftMarketplaceListing,
  NftMarketplaceSaleIntent,
} from "./types";

export function createMarketplaceSaleIntent(
  listing:
    NftMarketplaceListing,
  eligibility:
    NftMarketplaceEligibilityResult,
  createdAt:
    string
): NftMarketplaceSaleIntent {
  if (
    !eligibility.eligible
  ) {
    throw new Error(
      "MARKETPLACE_LISTING_NOT_ELIGIBLE"
    );
  }

  if (
    listing.status !==
      "READY"
  ) {
    throw new Error(
      "MARKETPLACE_SALE_INTENT_REQUIRES_READY_LISTING"
    );
  }

  return {
    listingId:
      listing.id,

    assetId:
      listing.asset.assetId,

    sellerId:
      listing.seller.sellerId,

    saleType:
      listing.saleType,

    price:
      listing.price,

    createdAt,

    authoritative:
      false,
  };
}
