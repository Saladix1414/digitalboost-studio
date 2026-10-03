import type {
  DbxFeePolicy,
} from "./types";

export const dbxMarketplaceFeePolicyFixture:
  DbxFeePolicy = {
    id:
      "dbx-marketplace-fee-policy-v1",

    version:
      "1",

    enabled:
      true,

    allocations: [
      {
        role:
          "CREATOR",

        basisPoints:
          8200,

        accountId:
          "creator-001",
      },

      {
        role:
          "PLATFORM_REVENUE",

        basisPoints:
          800,

        accountId:
          "platform-revenue",
      },

      {
        role:
          "TREASURY",

        basisPoints:
          500,

        accountId:
          "platform-treasury",
      },

      {
        role:
          "INFRASTRUCTURE",

        basisPoints:
          300,

        accountId:
          "infrastructure-pool",
      },

      {
        role:
          "REWARD_POOL",

        basisPoints:
          200,

        accountId:
          "reward-pool",
      },
    ],

    authoritative:
      false,
  };
