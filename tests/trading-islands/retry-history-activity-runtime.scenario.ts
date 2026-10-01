import assert from "node:assert/strict";
import test from "node:test";

import {
  activityFromRemoteRetryHistoryEntry,
} from "../../src/trading/activity/builders.ts";


test(
  "retry attempt projects as informational non-authoritative activity",
  () => {
    const item =
      activityFromRemoteRetryHistoryEntry(
        {
          sequence:
            8,

          operation:
            "write",

          attempt:
            1,

          status:
            "attempt",

          reason:
            null,

          idempotencyProtected:
            true,

          authoritative:
            false,
        },
        17
      );

    assert.equal(
      item.source,
      "remote-retry"
    );

    assert.equal(
      item.authority,
      "none"
    );

    assert.equal(
      item.severity,
      "info"
    );

    assert.equal(
      item.sequence,
      17
    );

    assert.match(
      item.message,
      /Attempt 1/
    );

    assert.match(
      item.message,
      /Idempotency protected yes/
    );
  }
);


test(
  "retry decision projects as warning evidence",
  () => {
    const item =
      activityFromRemoteRetryHistoryEntry(
        {
          sequence:
            9,

          operation:
            "clear",

          attempt:
            1,

          status:
            "retry",

          reason:
            "retryable-backend",

          idempotencyProtected:
            true,

          authoritative:
            false,
        },
        18
      );

    assert.equal(
      item.severity,
      "warning"
    );

    assert.equal(
      item.authority,
      "none"
    );

    assert.match(
      item.message,
      /retryable-backend/
    );
  }
);


test(
  "successful retry mutation projects as success",
  () => {
    const item =
      activityFromRemoteRetryHistoryEntry(
        {
          sequence:
            10,

          operation:
            "write",

          attempt:
            2,

          status:
            "succeeded",

          reason:
            null,

          idempotencyProtected:
            true,

          authoritative:
            false,
        },
        19
      );

    assert.equal(
      item.severity,
      "success"
    );

    assert.equal(
      item.authority,
      "none"
    );
  }
);


test(
  "failed non-idempotent mutation remains evidence only",
  () => {
    const item =
      activityFromRemoteRetryHistoryEntry(
        {
          sequence:
            11,

          operation:
            "write",

          attempt:
            1,

          status:
            "failed",

          reason:
            "missing-idempotency",

          idempotencyProtected:
            false,

          authoritative:
            false,
        },
        20
      );

    assert.equal(
      item.severity,
      "warning"
    );

    assert.equal(
      item.authority,
      "none"
    );

    assert.match(
      item.message,
      /Idempotency protected no/
    );
  }
);
