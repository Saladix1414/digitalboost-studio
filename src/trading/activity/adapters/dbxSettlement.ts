import type {
  DbxMarketplaceSettlementResult,
} from "../../dbx/settlement/types";

import {
  createTradingActivityEvent,
} from "../factory";

export function activityFromDbxMarketplaceSettlement(
  result:
    DbxMarketplaceSettlementResult,
  sequence:
    number
) {
  return createTradingActivityEvent({
    id:
      `activity-marketplace-settlement:${result.marketplaceOrderId}`,

    domain:
      "MARKETPLACE",

    type:
      "SETTLED",

    severity:
      "SUCCESS",

    title:
      "Marketplace settlement completed",

    description:
      "Marketplace DBX settlement was posted to the accounting ledger.",

    actor: {
      type:
        "SYSTEM",

      ref:
        "digitalboost:marketplace",
    },

    references: [
      {
        kind:
          "marketplaceOrder",

        ref:
          result.marketplaceOrderId,
      },

      {
        kind:
          "settlementPlan",

        ref:
          result.planId,
      },

      {
        kind:
          "transaction",

        ref:
          result.transactionId,
      },
    ],

    occurredAt:
      result.settledAt,

    sequence,
  });
}
