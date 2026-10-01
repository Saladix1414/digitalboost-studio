import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  createRemoteApprovalPersistence,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";

import {
  getApprovalRemoteRetryHistory,
  resetApprovalRemoteRetryHistoryForTests,
} from "../../src/trading/risk/approvalRemoteRetryHistoryStore.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import {
  activityFromRemoteRetryHistoryEntry,
} from "../../src/trading/activity/builders.ts";

import type {
  ApprovalBackendClient,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";


test(
  "all retry events from one mutation share one mutation reference",
  async () => {
    resetApprovalRemoteRetryHistoryForTests();

    let calls =
      0;

    const mutationId =
      "session-a:write:17";

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            null,

          authoritative:
            false,
        };
      },

      async write() {
        calls +=
          1;

        if (
          calls ===
          1
        ) {
          throw new ApprovalBackendError({
            message:
              "temporary outage",

            code:
              "unavailable",

            operation:
              "write",

            retryable:
              true,
          });
        }

        return {
          revision:
            1,

          authoritative:
            false,
        };
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      null,
      {
        mutationId,

        authoritative:
          false,
      }
    );

    const entries =
      getApprovalRemoteRetryHistory()
        .entries;

    assert.equal(
      entries.length,
      4
    );

    assert.deepEqual(
      entries.map(
        entry =>
          entry.mutationRef
      ),
      [
        mutationId,
        mutationId,
        mutationId,
        mutationId,
      ]
    );

    assert.deepEqual(
      entries.map(
        entry =>
          entry.status
      ),
      [
        "attempt",
        "retry",
        "attempt",
        "succeeded",
      ]
    );

    assert.ok(
      entries.every(
        entry =>
          entry.authoritative ===
          false
      )
    );
  }
);


test(
  "different mutations remain independently correlatable",
  async () => {
    resetApprovalRemoteRetryHistoryForTests();

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            null,

          authoritative:
            false,
        };
      },

      async write() {
        return {
          revision:
            1,

          authoritative:
            false,
        };
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      null,
      {
        mutationId:
          "session-a:write:1",

        authoritative:
          false,
      }
    );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      1,
      {
        mutationId:
          "session-a:write:2",

        authoritative:
          false,
      }
    );

    const entries =
      getApprovalRemoteRetryHistory()
        .entries;

    const refs =
      new Set(
        entries.map(
          entry =>
            entry.mutationRef
        )
      );

    assert.equal(
      refs.size,
      2
    );

    assert.ok(
      refs.has(
        "session-a:write:1"
      )
    );

    assert.ok(
      refs.has(
        "session-a:write:2"
      )
    );
  }
);


test(
  "legacy mutation without context remains explicitly untracked",
  async () => {
    resetApprovalRemoteRetryHistoryForTests();

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            null,

          authoritative:
            false,
        };
      },

      async write() {
        return {
          revision:
            1,

          authoritative:
            false,
        };
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.save(
      createEmptyApprovalRepositoryState(),
      null
    );

    const entries =
      getApprovalRemoteRetryHistory()
        .entries;

    assert.equal(
      entries.length,
      2
    );

    assert.ok(
      entries.every(
        entry =>
          entry.mutationRef ===
          null
      )
    );
  }
);


test(
  "activity items from one mutation share a correlation reference",
  () => {
    const first =
      activityFromRemoteRetryHistoryEntry(
        {
          sequence:
            1,

          operation:
            "write",

          attempt:
            1,

          status:
            "retry",

          reason:
            "retryable-backend",

          idempotencyProtected:
            true,

          mutationRef:
            "session-x:write:5",

          authoritative:
            false,
        },
        1
      );

    const second =
      activityFromRemoteRetryHistoryEntry(
        {
          sequence:
            2,

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

          mutationRef:
            "session-x:write:5",

          authoritative:
            false,
        },
        2
      );

    assert.equal(
      first.referenceId,
      second.referenceId
    );

    assert.equal(
      first.referenceId,
      "remote-mutation:session-x:write:5"
    );

    assert.equal(
      first.authority,
      "none"
    );

    assert.equal(
      second.authority,
      "none"
    );
  }
);
