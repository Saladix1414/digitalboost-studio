import type {
  NftAssetDetail,
  NftDetailValidationIssue,
  NftDetailValidationResult,
} from "./types";

function hasText(
  value:
    string
): boolean {
  return value.trim().length > 0;
}

export function validateNftAssetDetail(
  detail:
    NftAssetDetail
): NftDetailValidationResult {
  const issues:
    NftDetailValidationIssue[] = [];

  if (!hasText(detail.id)) {
    issues.push({
      code:
        "EMPTY_DETAIL_ID",

      message:
        "NFT detail requires an id.",
    });
  }

  if (
    !hasText(
      detail.identity.assetId
    )
  ) {
    issues.push({
      code:
        "EMPTY_ASSET_ID",

      message:
        "NFT detail requires an asset id.",
    });
  }

  if (
    !hasText(
      detail.identity.collectionId
    )
  ) {
    issues.push({
      code:
        "EMPTY_COLLECTION_ID",

      message:
        "NFT detail requires a collection id.",
    });
  }

  if (
    !hasText(
      detail.identity.creatorRef
    )
  ) {
    issues.push({
      code:
        "EMPTY_CREATOR_REF",

      message:
        "NFT detail requires a creator reference.",
    });
  }

  if (
    !hasText(
      detail.market.listingId
    )
  ) {
    issues.push({
      code:
        "EMPTY_LISTING_ID",

      message:
        "NFT detail requires a listing id.",
    });
  }

  if (
    !hasText(
      detail.market.sellerId
    )
  ) {
    issues.push({
      code:
        "EMPTY_SELLER_ID",

      message:
        "NFT detail requires a seller id.",
    });
  }

  if (
    !Number.isFinite(
      detail.market.priceAmount
    ) ||
    detail.market.priceAmount <= 0
  ) {
    issues.push({
      code:
        "INVALID_PRICE",

      message:
        "NFT detail requires a positive marketplace price.",
    });
  }

  if (
    detail.market.status !==
      "LISTED"
  ) {
    issues.push({
      code:
        "LISTING_NOT_LISTED",

      message:
        "NFT detail marketplace context must reference a LISTED asset.",
    });
  }

  if (
    detail.authoritative !==
      false ||
    detail.identity.authoritative !==
      false ||
    detail.integrity.authoritative !==
      false ||
    detail.market.authoritative !==
      false
  ) {
    issues.push({
      code:
        "AUTHORITY_ESCALATION",

      message:
        "NFT detail must remain non-authoritative.",
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
