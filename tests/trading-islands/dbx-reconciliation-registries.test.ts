import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxLedger,
} from "../../src/trading/dbx/ledger/ledger";

import {
  dbxLedgerAccountFixtures,
} from "../../src/trading/dbx/ledger/fixtures";

import {
  reconcileDbxConsumption,
} from "../../src/trading/dbx/reconciliation/consumption";

import {
  reconcileDbxMarketplaceSettlements,
} from "../../src/trading/dbx/reconciliation/marketplace";

import {
  reconcileDbxRewardPool,
} from "../../src/trading/dbx/reconciliation/rewardPool";

test(
  "orphan economic records are detected",
  () => {
    const ledger =
      createDbxLedger(
        "orphan-ledger",
        dbxLedgerAccountFixtures
      );

    const consumption =
      reconcileDbxConsumption(
        ledger,
        {
          records: [
            {
              id:
                "consumption-record",

              intentId:
                "intent",

              idempotencyKey:
                "key",

              userAccountId:
                "dbx-user-001",

              destinationAccountId:
                "dbx-platform-treasury",

              amountMinor:
                1_000_000,

              purpose:
                "SERVICE",

              transactionId:
                "missing-consumption-tx",

              status:
                "POSTED",

              postedAt:
                "2026-10-02T22:10:00.000Z",

              systemOfRecord:
                "DBX_LEDGER",

              governanceAuthority:
                false,
            },
          ],
        }
      );

    const marketplace =
      reconcileDbxMarketplaceSettlements(
        ledger,
        {
          results: [
            {
              planId:
                "plan",

              marketplaceOrderId:
                "order",

              transactionId:
                "missing-marketplace-tx",

              status:
                "SETTLED",

              settledAt:
                "2026-10-02T22:10:00.000Z",

              systemOfRecord:
                "DBX_LEDGER",

              governanceAuthority:
                false,
            },
          ],
        }
      );

    const rewardPool =
      reconcileDbxRewardPool(
        ledger,
        {
          records: [
            {
              id:
                "reward-record",

              intentId:
                "reward-intent",

              idempotencyKey:
                "reward-key",

              transactionId:
                "missing-reward-tx",

              status:
                "DISTRIBUTED",

              amountMinor:
                1_000_000,

              sourceAccountId:
                "dbx-reward-pool",

              destinationAccountId:
                "dbx-creator-001",

              postedAt:
                "2026-10-02T22:10:00.000Z",

              systemOfRecord:
                "DBX_LEDGER",

              governanceAuthority:
                false,
            },
          ],
        }
      );

    assert.equal(
      consumption.issues[0]?.code,
      "CONSUMPTION_TRANSACTION_MISSING"
    );

    assert.equal(
      marketplace.issues[0]?.code,
      "SETTLEMENT_TRANSACTION_MISSING"
    );

    assert.equal(
      rewardPool.issues[0]?.code,
      "REWARD_POOL_TRANSACTION_MISSING"
    );
  }
);
