import assert from "node:assert/strict";
import test from "node:test";

import {
  createQueueAdapter,
} from "../../src/server/infrastructure/queue/index.ts";

import {
  createQueueMessage,
} from "../../src/infrastructure/core/queue.ts";

import type {
  QueueDriverLike,
  QueueDriverPublishInput,
} from "../../src/server/infrastructure/queue/index.ts";

class FakeQueue
  implements QueueDriverLike {
  published:
    QueueDriverPublishInput | null =
    null;

  async publish(
    input:
      QueueDriverPublishInput
  ) {
    this.published =
      input;

    return {
      accepted:
        true,

      messageId:
        input.id,
    };
  }

  async ping() {
    return "PONG";
  }
}

test(
  "queue adapter publishes non authoritative message",
  async () => {
    const driver =
      new FakeQueue();

    const queue =
      createQueueAdapter(
        driver,
        {
          now:
            () =>
              "2026-10-08T00:10:00.000Z",
        }
      );

    const message =
      createQueueMessage({
        id:
          "job-1",

        type:
          "rebuild-index",

        payload: {
          target:
            "market-data",
        },

        createdAt:
          "2026-10-08T00:09:00.000Z",

        correlationId:
          "corr-1",
      });

    const result =
      await queue.publish(
        message
      );

    assert.equal(
      result.accepted,
      true
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      driver.published?.type,
      "rebuild-index"
    );
  }
);

test(
  "queue health remains observational",
  async () => {
    const queue =
      createQueueAdapter(
        new FakeQueue()
      );

    const health =
      await queue.health();

    assert.equal(
      health.state,
      "ready"
    );

    assert.equal(
      health.authoritative,
      false
    );
  }
);
