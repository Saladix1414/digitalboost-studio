import assert from "node:assert/strict";
import test from "node:test";

import {
  assertDbxEconomyOperational,
  evaluateDbxEconomySafetyInterlock,
} from "../../src/trading/dbx/health/interlock";

function makeReport(
  severity:
    "ERROR" | "WARNING" | null
) {
  const issues =
    severity
      ? [
          {
            code:
              "LEDGER_GLOBAL_IMBALANCE",

            severity,

            reference:
              "fixture",

            message:
              "fixture",

            authoritative:
              false,
          },
        ]
      : [];

  return {
    id:
      "interlock-report",

    reconciledAt:
      "2026-10-02T23:10:00.000Z",

    healthy:
      issues.length === 0,

    sections:
      [],

    issues,

    accountingSystemOfRecord:
      "DBX_LEDGER",

    authoritative:
      false,
  } as any;
}

test(
  "healthy economy allows new economic operations",
  () => {
    const decision =
      evaluateDbxEconomySafetyInterlock({
        report:
          makeReport(null),

        evaluatedAt:
          "2026-10-02T23:11:00.000Z",
      });

    assert.equal(
      decision
        .newEconomicOperationsAllowed,
      true
    );

    assert.equal(
      assertDbxEconomyOperational(
        decision
      ).operational,
      true
    );
  }
);

test(
  "degraded economy remains operational",
  () => {
    const decision =
      evaluateDbxEconomySafetyInterlock({
        report:
          makeReport("WARNING"),

        evaluatedAt:
          "2026-10-02T23:11:00.000Z",
      });

    assert.equal(
      decision.health,
      "DEGRADED"
    );

    assert.equal(
      decision
        .newEconomicOperationsAllowed,
      true
    );
  }
);

test(
  "critical economy blocks new economic operations",
  () => {
    const decision =
      evaluateDbxEconomySafetyInterlock({
        report:
          makeReport("ERROR"),

        evaluatedAt:
          "2026-10-02T23:11:00.000Z",
      });

    assert.equal(
      decision.health,
      "CRITICAL"
    );

    assert.equal(
      decision
        .newEconomicOperationsAllowed,
      false
    );

    assert.throws(
      () =>
        assertDbxEconomyOperational(
          decision
        ),

      /DBX_ECONOMY_SAFETY_INTERLOCK_BLOCKED/
    );
  }
);
