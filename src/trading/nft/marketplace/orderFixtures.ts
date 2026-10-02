import {
  updateMarketplaceListingStatus,
} from "./engine";

import {
  nftMarketplaceReadyListingFixture,
} from "./eligibilityFixtures";

import {
  createMarketplaceOrderIntent,
} from "./orderIntent";

const listed =
  updateMarketplaceListingStatus(
    nftMarketplaceReadyListingFixture,
    "LISTED",
    "2026-10-14T10:10:00.000Z"
  );

export const nftMarketplaceListedFixture =
  listed;

export const nftMarketplaceBuyerFixture = {
  buyerId:
    "buyer-local-001",

  walletRef:
    "wallet:local:buyer-001",

  authoritative:
    false as const,
};

export const nftMarketplaceOrderFixture =
  createMarketplaceOrderIntent(
    "order-listing-001",
    listed,
    nftMarketplaceBuyerFixture,
    "2026-10-14T10:11:00.000Z"
  );

export const nftMarketplaceBuyerEqualsSellerFixture =
  createMarketplaceOrderIntent(
    "order-self-trade-001",
    listed,
    {
      buyerId:
        listed.seller.sellerId,

      walletRef:
        "wallet:local:self-trade",

      authoritative:
        false,
    },
    "2026-10-14T10:12:00.000Z"
  );

export const nftMarketplacePriceMismatchFixture = {
  ...nftMarketplaceOrderFixture,

  price: {
    ...nftMarketplaceOrderFixture.price,

    amount:
      nftMarketplaceOrderFixture.price.amount + 1,
  },
};

export const nftMarketplaceSellerMismatchFixture = {
  ...nftMarketplaceOrderFixture,

  sellerId:
    "seller-mismatch-999",
};

export const nftMarketplaceAssetMismatchOrderFixture = {
  ...nftMarketplaceOrderFixture,

  assetId:
    "asset-mismatch-999",
};
