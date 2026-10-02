import assert from "node:assert/strict";
import test from "node:test";

import {
  addDbxMarketplaceSettlementResult,
  createDbxMarketplaceSettlementRegistry,
} from "../../src/trading/dbx/settlement/registry";

const result = {
  planId:
    "plan-1",

  marketplaceOrderId:
    "order-1",

  transactionId:
    "tx-1",

  status:
    "SETTLED" as const,

  settledAt:
    "2026-10-02T13:01:00.000Z",

  systemOfRecord:
    "DBX_LEDGER" as const,

  governanceAuthority:
    false as const,
};

test(
  "marketplace order can settle only once",
  () => {
    const registry =
      addDbxMarketplaceSettlementResult(
        createDbxMarketplaceSettlementRegistry(),
        result
      );

    assert.throws(
      () =>
        addDbxMarketplaceSettlementResult(
          registry,
          {
            ...result,

            planId:
              "plan-2",

            transactionId:
              "tx-2",
          }
        ),

      /DBX_MARKETPLACE_ORDER_ALREADY_SETTLED/
    );
  }
);
