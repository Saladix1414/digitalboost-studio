import type {
  NftMarketplaceListing,
  NftMarketplaceListingStatus,
} from "./types";

import {
  canTransitionMarketplaceListing,
} from "./stateMachine";

import {
  validateMarketplaceListing,
} from "./validation";

export function updateMarketplaceListingStatus(
  listing:
    NftMarketplaceListing,
  nextStatus:
    NftMarketplaceListingStatus,
  updatedAt:
    string
): NftMarketplaceListing {
  const validation =
    validateMarketplaceListing(
      listing
    );

  if (!validation.valid) {
    throw new Error(
      "MARKETPLACE_LISTING_INVALID"
    );
  }

  if (
    !canTransitionMarketplaceListing(
      listing.status,
      nextStatus
    )
  ) {
    throw new Error(
      "MARKETPLACE_INVALID_STATUS_TRANSITION"
    );
  }

  return {
    ...listing,

    status:
      nextStatus,

    version:
      listing.version + 1,

    updatedAt,
  };
}
