import assert from "node:assert/strict";
import test from "node:test";

import {
  summarizeDbxEconomyReconciliation,
} from "../../src/trading/dbx/reconciliation/summary";

test(
  "reconciliation summary remains non-authoritative",
  () => {
    const summary =
      summarizeDbxEconomyReconciliation({
        id:
          "summary-report",

        reconciledAt:
          "2026-10-02T22:20:00.000Z",

        healthy:
          true,

        sections: [
          {
            name:
              "LEDGER",

            checked:
              1,

            issueCount:
              0,

            healthy:
              true,

            authoritative:
              false,
          },
        ],

        issues:
          [],

        accountingSystemOfRecord:
          "DBX_LEDGER",

        authoritative:
          false,
      });

    assert.equal(
      summary.healthy,
      true
    );

    assert.equal(
      summary.authoritative,
      false
    );
  }
);
