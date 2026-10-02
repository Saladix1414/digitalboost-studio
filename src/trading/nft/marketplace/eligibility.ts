import type {
  NftProvenanceClosureResult,
} from "../provenance/closure";

import type {
  NftMarketplaceEligibilityIssue,
  NftMarketplaceEligibilityResult,
  NftMarketplaceListing,
} from "./types";

import {
  validateMarketplaceListing,
} from "./validation";

function hasText(
  value:
    string | null
): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function validateMarketplaceEligibility(
  listing:
    NftMarketplaceListing,
  provenanceClosure:
    NftProvenanceClosureResult
): NftMarketplaceEligibilityResult {
  const issues:
    NftMarketplaceEligibilityIssue[] = [];

  const listingValidation =
    validateMarketplaceListing(
      listing
    );

  if (!listingValidation.valid) {
    issues.push({
      code:
        "LISTING_INVALID",

      message:
        "Listing failed marketplace validation.",
    });
  }

  if (
    !hasText(
      listing.asset
        .provenanceId
    )
  ) {
    issues.push({
      code:
        "PROVENANCE_REFERENCE_MISSING",

      message:
        "Listing requires a provenance reference before publication.",
    });
  }

  if (
    !hasText(
      listing.asset
        .dnaId
    )
  ) {
    issues.push({
      code:
        "DNA_REFERENCE_MISSING",

      message:
        "Listing requires a DNA reference before publication.",
    });
  }

  if (
    !hasText(
      listing.seller
        .sellerId
    )
  ) {
    issues.push({
      code:
        "SELLER_REFERENCE_MISSING",

      message:
        "Listing requires a seller reference.",
    });
  }

  if (
    !hasText(
      listing.seller
        .walletRef
    )
  ) {
    issues.push({
      code:
        "WALLET_REFERENCE_MISSING",

      message:
        "Listing requires a wallet reference identifier.",
    });
  }

  if (
    listing.status !==
      "READY"
  ) {
    issues.push({
      code:
        "LISTING_NOT_READY",

      message:
        "Only READY listings may become eligible for publication.",
    });
  }

  if (
    listing.price.amount <=
      0
  ) {
    issues.push({
      code:
        "PRICE_NOT_POSITIVE",

      message:
        "Listing price must be positive.",
    });
  }

  if (
    listing.expiresAt !==
      null &&
    listing.expiresAt <=
      listing.updatedAt
  ) {
    issues.push({
      code:
        "EXPIRED_LISTING",

      message:
        "Listing expiration must remain later than its current update time.",
    });
  }

  if (
    !provenanceClosure.valid
  ) {
    issues.push({
      code:
        "PROVENANCE_CLOSURE_INVALID",

      message:
        "Marketplace eligibility requires a valid provenance closure.",
    });
  }

  return {
    eligible:
      issues.length === 0,

    issues,

    authoritative:
      false,
  };
}
