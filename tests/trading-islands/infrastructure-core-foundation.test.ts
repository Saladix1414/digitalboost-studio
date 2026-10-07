import assert from "node:assert/strict";
import test from "node:test";

import {
  WORKER_EXECUTION_BOUNDARY,
  createInfrastructureFoundation,
  createInfrastructureOperationContext,
  createQueueMessage,
} from "../../src/infrastructure/core/index.ts";

test(
  "infrastructure context remains non authoritative",
  () => {
    const context =
      createInfrastructureOperationContext({
        requestedAt:
          "2026-10-07T21:00:00.000Z",
      });

    assert.equal(
      context.authoritative,
      false
    );
  }
);

test(
  "foundation starts without concrete adapters",
  () => {
    const foundation =
      createInfrastructureFoundation();

    assert.equal(
      foundation.database,
      null
    );

    assert.equal(
      foundation.cache,
      null
    );

    assert.equal(
      foundation.objectStorage,
      null
    );

    assert.equal(
      foundation.queue,
      null
    );

    assert.equal(
      foundation.authoritative,
      false
    );
  }
);

test(
  "queue message is non authoritative",
  () => {
    const message =
      createQueueMessage({
        id:
          "msg_phase34b_001",

        type:
          "runtime-evidence.persist",

        payload: {
          sessionId:
            "runtime-session-1",
        },

        createdAt:
          "2026-10-07T21:01:00.000Z",
      });

    assert.equal(
      message.authoritative,
      false
    );
  }
);

test(
  "worker cannot bypass security controls",
  () => {
    assert.equal(
      WORKER_EXECUTION_BOUNDARY.mayBypassPolicy,
      false
    );

    assert.equal(
      WORKER_EXECUTION_BOUNDARY.mayBypassRisk,
      false
    );

    assert.equal(
      WORKER_EXECUTION_BOUNDARY.mayBypassApproval,
      false
    );

    assert.equal(
      WORKER_EXECUTION_BOUNDARY.mayExecuteExternalSideEffects,
      false
    );
  }
);
