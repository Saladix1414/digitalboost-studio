import assert from "node:assert/strict";
import test from "node:test";

import {
  composeQueueFromEnvironment,
} from "../../src/server/infrastructure/queue/BullMqServerComposition.ts";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

import type {
  BullMqQueueDriverFactory,
  ManagedQueueDriver,
} from "../../src/server/infrastructure/queue/BullMqQueueDriver.ts";

function fakeDriver(
  lifecycle?: {
    closes:
      number;
  }
):
  ManagedQueueDriver {
  return {
    async publish(
      input
    ) {
      return {
        accepted:
          true,

        messageId:
          input.id,
      };
    },

    async ping() {
      return "READY";
    },

    async close() {
      if (
        lifecycle
      ) {
        lifecycle.closes +=
          1;
      }
    },
  };
}

test(
  "disabled queue creates no transport",
  async () => {
    const config =
      readInfrastructureEnvironment({});

    let calls =
      0;

    const composition =
      await composeQueueFromEnvironment({
        configuration:
          config,

        source: {},

        driverFactory:
          async () => {
            calls +=
              1;

            return fakeDriver();
          },
      });

    assert.equal(
      composition.enabled,
      false
    );

    assert.equal(
      composition.queue,
      null
    );

    assert.equal(
      calls,
      0
    );

    assert.equal(
      composition.authoritative,
      false
    );
  }
);

test(
  "enabled queue resolves Redis URL only at server edge",
  async () => {
    const secret =
      "redis://private:password@queue.internal:6379";

    const source = {
      DIGITALBOOST_INFRA_QUEUE_PROVIDER:
        "redis-queue",

      QUEUE_REDIS_URL:
        secret,
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    let observedUrl:
      string | null =
      null;

    const factory:
      BullMqQueueDriverFactory =
      async input => {
        observedUrl =
          input.redisUrl;

        return fakeDriver();
      };

    const composition =
      await composeQueueFromEnvironment({
        configuration:
          config,

        source,

        driverFactory:
          factory,
      });

    assert.equal(
      composition.enabled,
      true
    );

    assert.notEqual(
      composition.queue,
      null
    );

    assert.equal(
      observedUrl,
      secret
    );

    assert.equal(
      config.queue.connectionReference,
      "env:QUEUE_REDIS_URL"
    );

    assert.doesNotMatch(
      JSON.stringify(
        config
      ),
      /private|password/
    );

    await composition.close();
  }
);

test(
  "queue shutdown is idempotent",
  async () => {
    const lifecycle = {
      closes:
        0,
    };

    const source = {
      DIGITALBOOST_INFRA_QUEUE_PROVIDER:
        "redis-queue",

      QUEUE_REDIS_URL:
        "redis://placeholder",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    const composition =
      await composeQueueFromEnvironment({
        configuration:
          config,

        source,

        driverFactory:
          async () =>
            fakeDriver(
              lifecycle
            ),
      });

    await composition.close();
    await composition.close();

    assert.equal(
      lifecycle.closes,
      1
    );
  }
);
