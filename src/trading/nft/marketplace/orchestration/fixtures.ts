import {
  nftMarketplaceReadyListingFixture,
} from "../eligibilityFixtures";

import type {
  NftMarketplaceEngineInput,
} from "./types";

export const nftMarketplaceEngineInputFixture:
  NftMarketplaceEngineInput = {
    listing:
      nftMarketplaceReadyListingFixture,

    buyer: {
      buyerId:
        "buyer-local-001",

      walletRef:
        "wallet:local:buyer-001",

      authoritative:
        false,
    },

    orderId:
      "order-marketplace-engine-001",

    presentation: {
      title:
        "Origin Marketplace Asset",

      subtitle:
        "Deterministic marketplace engine fixture",

      imageRef:
        null,

      featured:
        true,
    },

    clock: {
      saleIntentAt:
        "2026-10-14T10:06:00.000Z",

      listedAt:
        "2026-10-14T10:07:00.000Z",

      orderCreatedAt:
        "2026-10-14T10:08:00.000Z",

      orderMatchedAt:
        "2026-10-14T10:09:00.000Z",

      preSettlementAt:
        "2026-10-14T10:10:00.000Z",
    },
  };
