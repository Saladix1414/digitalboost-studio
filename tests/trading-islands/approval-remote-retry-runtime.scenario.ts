import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
  ApprovalBackendRevisionConflictError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  ApprovalHttpClientError,
} from "../../src/trading/risk/approvalHttpClient.ts";

import {
  resolveApprovalRemoteRetryDecision,
  runApprovalRemoteMutationWithRetry,
} from "../../src/trading/risk/approvalRemoteRetry.ts";


test(
  "retryable backend failure gets one retry",
  async () => {
    let calls =
      0;

    const result =
      await runApprovalRemoteMutationWithRetry({
        idempotencyKey:
          "approval:write:null:mutation-1",

        execute:
          async () => {
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

            return "ok";
          },
      });

    assert.equal(
      result,
      "ok"
    );

    assert.equal(
      calls,
      2
    );
  }
);


test(
  "retryable HTTP failure gets one retry",
  async () => {
    let calls =
      0;

    await runApprovalRemoteMutationWithRetry({
      idempotencyKey:
        "approval:clear:3:mutation-2",

      execute:
        async () => {
          calls +=
            1;

          if (
            calls ===
            1
          ) {
            throw new ApprovalHttpClientError({
              message:
                "network failure",

              code:
                "network",

              retryable:
                true,
            });
          }
        },
    });

    assert.equal(
      calls,
      2
    );
  }
);


test(
  "retryable failure without idempotency is not automatically retried",
  async () => {
    let calls =
      0;

    await assert.rejects(
      () =>
        runApprovalRemoteMutationWithRetry({
          idempotencyKey:
            null,

          execute:
            async () => {
              calls +=
                1;

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
        }),
      ApprovalBackendError
    );

    assert.equal(
      calls,
      1
    );
  }
);


test(
  "revision conflict is never retried",
  async () => {
    let calls =
      0;

    await assert.rejects(
      () =>
        runApprovalRemoteMutationWithRetry({
          idempotencyKey:
            "approval:write:3:mutation-3",

          execute:
            async () => {
              calls +=
                1;

              throw new ApprovalBackendRevisionConflictError({
                operation:
                  "write",

                expectedRevision:
                  3,

                actualRevision:
                  4,
              });
            },
        }),
      ApprovalBackendRevisionConflictError
    );

    assert.equal(
      calls,
      1
    );
  }
);


test(
  "attempt limit stops persistent retryable failures",
  async () => {
    let calls =
      0;

    await assert.rejects(
      () =>
        runApprovalRemoteMutationWithRetry({
          idempotencyKey:
            "approval:write:null:mutation-4",

          execute:
            async () => {
              calls +=
                1;

              throw new ApprovalBackendError({
                message:
                  "still unavailable",

                code:
                  "unavailable",

                operation:
                  "write",

                retryable:
                  true,
              });
            },
        }),
      ApprovalBackendError
    );

    assert.equal(
      calls,
      2
    );
  }
);


test(
  "retry decision remains non authoritative",
  () => {
    const decision =
      resolveApprovalRemoteRetryDecision({
        error:
          new ApprovalBackendError({
            message:
              "temporary",

            code:
              "unavailable",

            operation:
              "write",

            retryable:
              true,
          }),

        attempt:
          1,

        hasIdempotencyKey:
          true,
      });

    assert.equal(
      decision.retry,
      true
    );

    assert.equal(
      decision.authoritative,
      false
    );
  }
);


import {
  createRemoteApprovalPersistence,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import type {
  ApprovalBackendClient,
} from "../../src/trading/risk/remoteApprovalPersistence.ts";


test(
  "remote persistence retries write with the exact same idempotency key",
  async () => {
    const keys:
      Array<string | null> =
        [];

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

      async write(
        input
      ) {
        calls +=
          1;

        keys.push(
          input.idempotencyKey
        );

        if (
          calls ===
          1
        ) {
          throw new ApprovalBackendError({
            message:
              "temporary",

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
          "session-r:write:1",

        authoritative:
          false,
      }
    );

    assert.equal(
      calls,
      2
    );

    assert.deepEqual(
      keys,
      [
        "approval:write:null:session-r:write:1",
        "approval:write:null:session-r:write:1",
      ]
    );
  }
);


test(
  "remote persistence retries clear with the exact same idempotency key",
  async () => {
    const keys:
      Array<string | null> =
        [];

    let calls =
      0;

    const client:
      ApprovalBackendClient = {
      async read() {
        return {
          state:
            null,

          revision:
            4,

          authoritative:
            false,
        };
      },

      async write() {
        return {
          revision:
            5,

          authoritative:
            false,
        };
      },

      async clear(
        input
      ) {
        calls +=
          1;

        keys.push(
          input.idempotencyKey
        );

        if (
          calls ===
          1
        ) {
          throw new ApprovalBackendError({
            message:
              "temporary",

            code:
              "unavailable",

            operation:
              "clear",

            retryable:
              true,
          });
        }
      },
    };

    const persistence =
      createRemoteApprovalPersistence(
        client
      );

    await persistence.clear(
      4,
      {
        mutationId:
          "session-r:clear:2",

        authoritative:
          false,
      }
    );

    assert.equal(
      calls,
      2
    );

    assert.deepEqual(
      keys,
      [
        "approval:clear:4:session-r:clear:2",
        "approval:clear:4:session-r:clear:2",
      ]
    );
  }
);
