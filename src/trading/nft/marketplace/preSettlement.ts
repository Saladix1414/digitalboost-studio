import type {
  NftMarketplaceOrderIntent,
  NftMarketplacePreSettlement,
} from "./types";

export function createMarketplacePreSettlement(
  order:
    NftMarketplaceOrderIntent,
  createdAt:
    string
): NftMarketplacePreSettlement {
  if (
    order.status !==
      "MATCHED"
  ) {
    throw new Error(
      "MARKETPLACE_PRE_SETTLEMENT_REQUIRES_MATCHED_ORDER"
    );
  }

  return {
    orderId:
      order.id,

    listingId:
      order.listingId,

    assetId:
      order.assetId,

    buyerId:
      order.buyer.buyerId,

    sellerId:
      order.sellerId,

    price:
      order.price,

    ready:
      true,

    createdAt,

    authoritative:
      false,
  };
}
