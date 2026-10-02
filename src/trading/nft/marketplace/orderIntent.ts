import type {
  NftMarketplaceBuyer,
  NftMarketplaceListing,
  NftMarketplaceOrderIntent,
} from "./types";

export function createMarketplaceOrderIntent(
  id:
    string,
  listing:
    NftMarketplaceListing,
  buyer:
    NftMarketplaceBuyer,
  createdAt:
    string
): NftMarketplaceOrderIntent {
  return {
    id,

    listingId:
      listing.id,

    assetId:
      listing.asset.assetId,

    buyer,

    sellerId:
      listing.seller.sellerId,

    price:
      listing.price,

    status:
      "CREATED",

    createdAt,

    updatedAt:
      createdAt,

    authoritative:
      false,
  };
}
