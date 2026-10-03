import assert from "node:assert/strict";
import test from "node:test";

import {
  assessDbxEconomyHealth,
} from "../../src/trading/dbx/health/assessment";

function report(
  issues: any[] = []
) {
  return {
    id:
      "health-report",

    reconciledAt:
      "2026-10-02T23:00:00.000Z",

    healthy:
      issues.length === 0,

    sections: [
      {
        name:
          "LEDGER",

        checked:
          1,

        issueCount:
          issues.length,

        healthy:
          issues.length === 0,

        authoritative:
          false,
      },
    ],

    issues,

    accountingSystemOfRecord:
      "DBX_LEDGER",

    authoritative:
      false,
  } as const;
}

test(
  "clean reconciliation produces HEALTHY",
  () => {
    const result =
      assessDbxEconomyHealth({
        report:
          report() as any,

        evaluatedAt:
          "2026-10-02T23:01:00.000Z",
      });

    assert.equal(
      result.health,
      "HEALTHY"
    );
  }
);

test(
  "warning-only reconciliation produces DEGRADED",
  () => {
    const result =
      assessDbxEconomyHealth({
        report:
          report([
            {
              code:
                "LEDGER_GLOBAL_IMBALANCE",

              severity:
                "WARNING",

              reference:
                "fixture",

              message:
                "fixture warning",

              authoritative:
                false,
            },
          ]) as any,

        evaluatedAt:
          "2026-10-02T23:01:00.000Z",
      });

    assert.equal(
      result.health,
      "DEGRADED"
    );
  }
);

test(
  "error reconciliation produces CRITICAL",
  () => {
    const result =
      assessDbxEconomyHealth({
        report:
          report([
            {
              code:
                "LEDGER_GLOBAL_IMBALANCE",

              severity:
                "ERROR",

              reference:
                "fixture",

              message:
                "fixture error",

              authoritative:
                false,
            },
          ]) as any,

        evaluatedAt:
          "2026-10-02T23:01:00.000Z",
      });

    assert.equal(
      result.health,
      "CRITICAL"
    );
  }
);
