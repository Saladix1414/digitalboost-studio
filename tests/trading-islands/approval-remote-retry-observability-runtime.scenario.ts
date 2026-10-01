import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
  ApprovalBackendRevisionConflictError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  createRemoteApprovalPersistence,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";

import {
  APPROVAL_REMOTE_RETRY_HISTORY_LIMIT,
} from "../../src/trading/risk/approvalRemoteRetryHistory.ts";

import {
  getApprovalRemoteRetryHistory,
  recordApprovalRemoteRetryAttempt,
  resetApprovalRemoteRetryHistoryForTests,
} from "../../src/trading/risk/approvalRemoteRetryHistoryStore.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import type {
  ApprovalBackendClient,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";


test(
  "retrying write records truthful ordered attempt evidence",
  async () => {
    resetApprovalRemoteRetryHistoryForTests();

    let calls =
      0;

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
        mutationId:
          "observability-write-1",

        authoritative:
          false,
      }
    );

    const history =
      getApprovalRemoteRetryHistory();

    assert.deepEqual(
      history.entries.map(
        entry => [
          entry.operation,
          entry.attempt,
          entry.status,
          entry.reason,
          entry.idempotencyProtected,
          entry.authoritative,
        ]
      ),
      [
        [
          "write",
          1,
          "attempt",
          null,
          true,
          false,
        ],
        [
          "write",
          1,
          "retry",
          "retryable-backend",
          true,
          false,
        ],
        [
          "write",
          2,
          "attempt",
          null,
          true,
          false,
        ],
        [
          "write",
          2,
          "succeeded",
          null,
          true,
          false,
        ],
      ]
    );
  }
);


test(
  "non-retryable conflict records one failed attempt",
  async () => {
    resetApprovalRemoteRetryHistoryForTests();

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,
          revision:
            3,
          authoritative:
            false,
        };
      },

      async write() {
        throw new ApprovalBackendRevisionConflictError({
          operation:
            "write",

          expectedRevision:
            3,

          actualRevision:
            4,
        });
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await assert.rejects(
      () =>
        persistence.save(
          createEmptyApprovalRepositoryState(),
          3,
          {
            mutationId:
              "observability-write-conflict",

            authoritative:
              false,
          }
        ),
      ApprovalBackendRevisionConflictError
    );

    const history =
      getApprovalRemoteRetryHistory();

    assert.equal(
      history.entries.length,
      2
    );

    assert.equal(
      history.entries[0]?.status,
      "attempt"
    );

    assert.equal(
      history.entries[1]?.status,
      "failed"
    );

    assert.equal(
      history.entries[1]?.reason,
      "non-retryable"
    );
  }
);


test(
  "legacy non-idempotent failure records missing-idempotency evidence",
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
      },

      async clear() {},
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await assert.rejects(
      () =>
        persistence.save(
          createEmptyApprovalRepositoryState(),
          null
        ),
      ApprovalBackendError
    );

    const history =
      getApprovalRemoteRetryHistory();

    assert.equal(
      history.entries.at(
        -1
      )?.reason,
      "missing-idempotency"
    );

    assert.equal(
      history.entries.at(
        -1
      )?.idempotencyProtected,
      false
    );
  }
);


test(
  "retry history is bounded and monotonic",
  () => {
    resetApprovalRemoteRetryHistoryForTests();

    for (
      let index =
        0;
      index <
        APPROVAL_REMOTE_RETRY_HISTORY_LIMIT +
          8;
      index +=
        1
    ) {
      recordApprovalRemoteRetryAttempt(
        "clear",
        true,
        {
          attempt:
            1,

          status:
            "attempt",

          reason:
            null,

          authoritative:
            false,
        }
      );
    }

    const history =
      getApprovalRemoteRetryHistory();

    assert.equal(
      history.entries.length,
      APPROVAL_REMOTE_RETRY_HISTORY_LIMIT
    );

    for (
      let index =
        1;
      index <
        history.entries.length;
      index +=
        1
    ) {
      assert.equal(
        history.entries[index]!.sequence,
        history.entries[index - 1]!.sequence +
          1
      );
    }

    assert.equal(
      history.authoritative,
      false
    );
  }
);
