import assert from "node:assert/strict";
import test from "node:test";

import {
  projectDbxConsumptionActivity,
  projectDbxMarketplaceSettlementActivity,
} from "../../src/trading/activity/liveProjection";

import {
  getTradingActivityStore,
  resetTradingActivityStoreForTests,
} from "../../src/trading/activity/sharedActivityStore";

test(
  "DBX domain evidence projects into shared Activity Center store",
  () => {
    resetTradingActivityStoreForTests();

    projectDbxConsumptionActivity({
      id:
        "live-consumption-record",

      intentId:
        "live-intent",

      idempotencyKey:
        "live-key",

      userAccountId:
        "dbx-user-001",

      destinationAccountId:
        "dbx-platform-treasury",

      amountMinor:
        1_000_000,

      purpose:
        "SERVICE",

      transactionId:
        "dbx-consumption:live-intent",

      status:
        "POSTED",

      postedAt:
        "2026-10-03T03:10:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    });

    projectDbxMarketplaceSettlementActivity({
      planId:
        "live-plan",

      marketplaceOrderId:
        "live-order",

      transactionId:
        "live-settlement-tx",

      status:
        "SETTLED",

      settledAt:
        "2026-10-03T03:11:00.000Z",

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    });

    const store =
      getTradingActivityStore();

    assert.equal(
      store.events.length,
      2
    );

    assert.equal(
      store.events[0].domain,
      "DBX"
    );

    assert.equal(
      store.events[1].domain,
      "MARKETPLACE"
    );

    assert.equal(
      store.events[1].sequence,
      2
    );
  }
);
