import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxEconomyOperatorView,
} from "../../src/trading/dbx/health/operatorView";

test(
  "operator view remains derived and non-authoritative",
  () => {
    const view =
      createDbxEconomyOperatorView({
        report: {
          id:
            "operator-report",

          reconciledAt:
            "2026-10-02T23:20:00.000Z",

          healthy:
            true,

          sections:
            [],

          issues:
            [],

          accountingSystemOfRecord:
            "DBX_LEDGER",

          authoritative:
            false,
        },

        evaluatedAt:
          "2026-10-02T23:21:00.000Z",
      });

    assert.equal(
      view.health,
      "HEALTHY"
    );

    assert.equal(
      view
        .newEconomicOperationsAllowed,
      true
    );

    assert.equal(
      view
        .accountingSystemOfRecord,
      "DBX_LEDGER"
    );

    assert.equal(
      view.authoritative,
      false
    );
  }
);
