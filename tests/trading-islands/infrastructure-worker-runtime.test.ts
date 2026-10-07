import assert from "node:assert/strict";
import test from "node:test";

import {
  createWorkerRuntime,
} from "../../src/server/infrastructure/queue/index.ts";

import {
  createQueueMessage,
} from "../../src/infrastructure/core/queue.ts";

import type {
  WorkerPort,
} from "../../src/infrastructure/core/worker.ts";

test(
  "worker runtime returns completed result without authority",
  async () => {
    const worker:
      WorkerPort<{
        readonly value:
          number;
      }> = {
      async process() {
        return {
          state:
            "completed",

          detail:
            "done",

          authoritative:
            false,
        };
      },
    };

    const runtime =
      createWorkerRuntime(
        worker
      );

    const message =
      createQueueMessage({
        id:
          "job-2",

        type:
          "calculate",

        payload: {
          value:
            5,
        },

        createdAt:
          "2026-10-08T00:11:00.000Z",

        correlationId:
          null,
      });

    const result =
      await runtime.process(
        message
      );

    assert.equal(
      result.job.state,
      "completed"
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      runtime.boundary.mayBypassPolicy,
      false
    );

    assert.equal(
      runtime.boundary.mayBypassRisk,
      false
    );

    assert.equal(
      runtime.boundary.mayBypassApproval,
      false
    );

    assert.equal(
      runtime.boundary.mayExecuteExternalSideEffects,
      false
    );
  }
);

test(
  "worker runtime bounds retries",
  async () => {
    let calls =
      0;

    const worker:
      WorkerPort<null> = {
      async process() {
        calls +=
          1;

        return {
          state:
            "retry",

          detail:
            "temporary failure",

          authoritative:
            false,
        };
      },
    };

    const runtime =
      createWorkerRuntime(
        worker,
        {
          maxAttempts:
            2,
        }
      );

    const result =
      await runtime.process(
        createQueueMessage({
          id:
            "job-3",

          type:
            "retry",

          payload:
            null,

          createdAt:
            "2026-10-08T00:12:00.000Z",

          correlationId:
            null,
        })
      );

    assert.equal(
      calls,
      2
    );

    assert.equal(
      result.job.state,
      "failed"
    );

    assert.equal(
      result.attempts,
      2
    );
  }
);
