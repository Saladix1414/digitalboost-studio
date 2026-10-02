import type {
  NftMarketplaceListing,
  NftMarketplaceValidationIssue,
  NftMarketplaceValidationResult,
} from "./types";

function hasText(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateMarketplaceListing(
  listing:
    NftMarketplaceListing
): NftMarketplaceValidationResult {
  const issues:
    NftMarketplaceValidationIssue[] = [];

  if (!hasText(listing.id)) {
    issues.push({
      code:
        "EMPTY_LISTING_ID",

      message:
        "Marketplace listing requires an id.",
    });
  }

  if (!hasText(listing.asset.assetId)) {
    issues.push({
      code:
        "EMPTY_ASSET_ID",

      message:
        "Marketplace listing requires an asset id.",
    });
  }

  if (!hasText(listing.asset.collectionId)) {
    issues.push({
      code:
        "EMPTY_COLLECTION_ID",

      message:
        "Marketplace listing requires a collection id.",
    });
  }

  if (!hasText(listing.seller.sellerId)) {
    issues.push({
      code:
        "EMPTY_SELLER_ID",

      message:
        "Marketplace listing requires a seller id.",
    });
  }

  if (
    !Number.isFinite(
      listing.price.amount
    ) ||
    listing.price.amount <= 0
  ) {
    issues.push({
      code:
        "INVALID_PRICE",

      message:
        "Marketplace price must be greater than zero.",
    });
  }

  if (
    !Number.isInteger(
      listing.version
    ) ||
    listing.version < 1
  ) {
    issues.push({
      code:
        "INVALID_VERSION",

      message:
        "Marketplace listing version must be >= 1.",
    });
  }

  if (!hasText(listing.createdAt)) {
    issues.push({
      code:
        "EMPTY_CREATED_AT",

      message:
        "Marketplace listing requires a creation timestamp.",
    });
  }

  if (!hasText(listing.updatedAt)) {
    issues.push({
      code:
        "EMPTY_UPDATED_AT",

      message:
        "Marketplace listing requires an update timestamp.",
    });
  }

  if (
    listing.expiresAt !== null &&
    listing.expiresAt <=
      listing.createdAt
  ) {
    issues.push({
      code:
        "INVALID_EXPIRATION",

      message:
        "Marketplace expiration must be later than creation time.",
    });
  }

  if (
    listing.authoritative !==
      false
  ) {
    issues.push({
      code:
        "AUTHORITY_ESCALATION",

      message:
        "Marketplace listing must remain non-authoritative.",
    });
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
