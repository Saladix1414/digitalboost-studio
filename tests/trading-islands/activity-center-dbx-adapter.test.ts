import assert from "node:assert/strict";
import test from "node:test";

import {
  activityFromDbxConsumptionPosting,
} from "../../src/trading/activity/adapters/dbxConsumption";

import {
  activityFromDbxMarketplaceSettlement,
} from "../../src/trading/activity/adapters/dbxSettlement";

test(
  "DBX consumption projects into Activity Center",
  () => {
    const event =
      activityFromDbxConsumptionPosting(
        {
          id:
            "record-1",

          intentId:
            "intent-1",

          idempotencyKey:
            "key-1",

          userAccountId:
            "dbx-user-001",

          destinationAccountId:
            "dbx-platform-treasury",

          amountMinor:
            2_000_000,

          purpose:
            "AI_RUNTIME",

          transactionId:
            "dbx-consumption:intent-1",

          status:
            "POSTED",

          postedAt:
            "2026-10-03T00:10:00.000Z",

          systemOfRecord:
            "DBX_LEDGER",

          governanceAuthority:
            false,
        },
        1
      );

    assert.equal(
      event.domain,
      "DBX"
    );

    assert.equal(
      event.type,
      "POSTED"
    );

    assert.equal(
      event.authoritative,
      false
    );
  }
);

test(
  "DBX marketplace settlement projects into Activity Center",
  () => {
    const event =
      activityFromDbxMarketplaceSettlement(
        {
          planId:
            "plan-1",

          marketplaceOrderId:
            "order-1",

          transactionId:
            "settlement-tx-1",

          status:
            "SETTLED",

          settledAt:
            "2026-10-03T00:11:00.000Z",

          systemOfRecord:
            "DBX_LEDGER",

          governanceAuthority:
            false,
        },
        1
      );

    assert.equal(
      event.domain,
      "MARKETPLACE"
    );

    assert.equal(
      event.type,
      "SETTLED"
    );
  }
);
