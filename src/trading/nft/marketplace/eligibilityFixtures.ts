import {
  updateMarketplaceListingStatus,
} from "./engine";

import {
  nftMarketplaceListingFixture,
} from "./fixtures";

export const nftMarketplaceReadyListingFixture =
  updateMarketplaceListingStatus(
    nftMarketplaceListingFixture,
    "READY",
    "2026-10-14T10:05:00.000Z"
  );

export const nftMarketplaceAssetMismatchFixture = {
  ...nftMarketplaceReadyListingFixture,

  asset: {
    ...nftMarketplaceReadyListingFixture.asset,

    assetId:
      "asset-mismatch-999",
  },
};

export const nftMarketplaceCollectionMismatchFixture = {
  ...nftMarketplaceReadyListingFixture,

  asset: {
    ...nftMarketplaceReadyListingFixture.asset,

    collectionId:
      "collection-mismatch-999",
  },
};

export const nftMarketplaceMissingWalletFixture = {
  ...nftMarketplaceReadyListingFixture,

  seller: {
    ...nftMarketplaceReadyListingFixture.seller,

    walletRef:
      null,
  },
};

export const nftMarketplaceMissingProvenanceFixture = {
  ...nftMarketplaceReadyListingFixture,

  asset: {
    ...nftMarketplaceReadyListingFixture.asset,

    provenanceId:
      null,
  },
};
