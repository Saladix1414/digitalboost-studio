import {
  nftProvenanceClosureFixture,
} from "../provenance/closureFixtures";

import {
  buildMarketplaceListing,
} from "./builder";

export const nftMarketplaceListingFixture =
  buildMarketplaceListing({
    id:
      "listing-asset-origin-001",

    asset: {
      assetId:
        nftProvenanceClosureFixture
          .provenance.assetId,

      collectionId:
        nftProvenanceClosureFixture
          .provenance.collectionId,

      provenanceId:
        nftProvenanceClosureFixture
          .provenance.id,

      dnaId:
        nftProvenanceClosureFixture
          .dna.id,

      authoritative:
        false,
    },

    seller: {
      sellerId:
        nftProvenanceClosureFixture
          .provenance.creatorRef,

      walletRef:
        "wallet:local:seller-001",

      authoritative:
        false,
    },

    saleType:
      "FIXED_PRICE",

    price: {
      amount:
        250,

      currency:
        "DBX",

      authoritative:
        false,
    },

    createdAt:
      "2026-10-14T10:00:00.000Z",

    expiresAt:
      "2026-10-21T10:00:00.000Z",
  });
