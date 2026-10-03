import assert from "node:assert/strict";
import test from "node:test";

import {
  appendDbxConsumptionTraceEvent,
  createDbxConsumptionAuditTrace,
} from "../../src/trading/dbx/consumption/observability/trace";

import {
  findDbxConsumptionTraceEvents,
  getDbxConsumptionTraceSummary,
} from "../../src/trading/dbx/consumption/observability/queries";

test(
  "trace ids and sequence are deterministic",
  () => {
    let trace =
      createDbxConsumptionAuditTrace(
        "query-intent"
      );

    trace =
      appendDbxConsumptionTraceEvent(
        trace,
        {
          eventType:
            "ATTEMPT_STARTED",

          recoveryId:
            "query-recovery",

          holdId:
            "query-hold",

          attempt:
            1,

          transactionId:
            null,

          failureCode:
            null,

          occurredAt:
            "2026-10-02T21:30:00.000Z",
        }
      );

    trace =
      appendDbxConsumptionTraceEvent(
        trace,
        {
          eventType:
            "RETRY_PENDING",

          recoveryId:
            "query-recovery",

          holdId:
            "query-hold",

          attempt:
            1,

          transactionId:
            null,

          failureCode:
            "LEDGER_TEMPORARY_FAILURE",

          occurredAt:
            "2026-10-02T21:31:00.000Z",
        }
      );

    assert.equal(
      trace.events[0].sequence,
      1
    );

    assert.equal(
      trace.events[1].sequence,
      2
    );

    assert.equal(
      findDbxConsumptionTraceEvents(
        trace,
        "RETRY_PENDING"
      ).length,
      1
    );

    const summary =
      getDbxConsumptionTraceSummary(
        trace
      );

    assert.equal(
      summary.latestEventType,
      "RETRY_PENDING"
    );

    assert.equal(
      summary.authoritative,
      false
    );
  }
);
