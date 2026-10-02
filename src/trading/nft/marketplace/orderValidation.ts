import type {
  NftMarketplaceListing,
  NftMarketplaceOrderIntent,
  NftMarketplaceOrderIssue,
  NftMarketplaceOrderValidationResult,
} from "./types";

function hasText(
  value:
    string | null
): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function validateMarketplaceOrderIntent(
  order:
    NftMarketplaceOrderIntent,
  listing:
    NftMarketplaceListing
): NftMarketplaceOrderValidationResult {
  const issues:
    NftMarketplaceOrderIssue[] = [];

  if (!hasText(order.id)) {
    issues.push({
      code:
        "EMPTY_ORDER_ID",

      message:
        "Order requires an id.",
    });
  }

  if (!hasText(order.listingId)) {
    issues.push({
      code:
        "EMPTY_LISTING_ID",

      message:
        "Order requires a listing id.",
    });
  }

  if (!hasText(order.assetId)) {
    issues.push({
      code:
        "EMPTY_ASSET_ID",

      message:
        "Order requires an asset id.",
    });
  }

  if (!hasText(order.buyer.buyerId)) {
    issues.push({
      code:
        "EMPTY_BUYER_ID",

      message:
        "Order requires a buyer id.",
    });
  }

  if (!hasText(order.sellerId)) {
    issues.push({
      code:
        "EMPTY_SELLER_ID",

      message:
        "Order requires a seller id.",
    });
  }

  if (
    order.buyer.buyerId ===
      order.sellerId
  ) {
    issues.push({
      code:
        "BUYER_EQUALS_SELLER",

      message:
        "Buyer and seller must be different identities.",
    });
  }

  if (
    !hasText(
      order.buyer.walletRef
    )
  ) {
    issues.push({
      code:
        "BUYER_WALLET_MISSING",

      message:
        "Buyer requires a wallet reference identifier.",
    });
  }

  if (
    order.price.amount !==
      listing.price.amount ||
    order.price.currency !==
      listing.price.currency
  ) {
    issues.push({
      code:
        "PRICE_MISMATCH",

      message:
        "Order price must match the current listing price.",
    });
  }

  if (
    listing.status !==
      "LISTED"
  ) {
    issues.push({
      code:
        "LISTING_NOT_LISTED",

      message:
        "Orders require a LISTED marketplace listing.",
    });
  }

  if (
    order.assetId !==
      listing.asset.assetId
  ) {
    issues.push({
      code:
        "ASSET_MISMATCH",

      message:
        "Order asset must match listing asset.",
    });
  }

  if (
    order.sellerId !==
      listing.seller.sellerId
  ) {
    issues.push({
      code:
        "SELLER_MISMATCH",

      message:
        "Order seller must match listing seller.",
    });
  }

  return {
    valid:
      issues.length === 0,

    issues,

    authoritative:
      false,
  };
}
