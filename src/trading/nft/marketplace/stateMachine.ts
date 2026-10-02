import type {
  NftMarketplaceListingStatus,
} from "./types";

const transitions:
  Readonly<
    Record<
      NftMarketplaceListingStatus,
      readonly NftMarketplaceListingStatus[]
    >
  > = {
    DRAFT: [
      "READY",
      "CANCELLED",
    ],

    READY: [
      "LISTED",
      "CANCELLED",
    ],

    LISTED: [
      "PAUSED",
      "SOLD",
      "CANCELLED",
      "EXPIRED",
    ],

    PAUSED: [
      "LISTED",
      "CANCELLED",
    ],

    SOLD:
      [],

    CANCELLED:
      [],

    EXPIRED:
      [],
  };

export function canTransitionMarketplaceListing(
  current:
    NftMarketplaceListingStatus,
  next:
    NftMarketplaceListingStatus
): boolean {
  return transitions[
    current
  ].includes(
    next
  );
}
