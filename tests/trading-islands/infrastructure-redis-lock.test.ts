import assert from "node:assert/strict";
import test from "node:test";

import {
  createRedisCacheAdapter,
} from "../../src/server/infrastructure/redis/index.ts";

import {
  createInfrastructureOperationContext,
} from "../../src/infrastructure/core/index.ts";

import type {
  RedisClientLike,
  RedisSetInput,
} from "../../src/server/infrastructure/redis/index.ts";

class LockRedis
  implements RedisClientLike {
  readonly values =
    new Map<
      string,
      string
    >();

  async get(
    key:
      string
  ) {
    return this.values.get(
      key
    ) ??
      null;
  }

  async set(
    key:
      string,

    value:
      string,

    input:
      RedisSetInput
  ):
    Promise<
      "OK" | null
    > {
    if (
      input.mode ===
        "NX" &&
      this.values.has(
        key
      )
    ) {
      return null;
    }

    this.values.set(
      key,
      value
    );

    return "OK";
  }

  async del(
    key:
      string
  ) {
    return this.values.delete(
      key
    )
      ? 1
      : 0;
  }

  async compareAndDelete(
    key:
      string,

    expectedValue:
      string
  ) {
    if (
      this.values.get(
        key
      ) !==
        expectedValue
    ) {
      return false;
    }

    this.values.delete(
      key
    );

    return true;
  }

  async ping() {
    return "PONG";
  }
}

const operation =
  createInfrastructureOperationContext({
    requestedAt:
      "2026-10-07T23:40:00.000Z",
  });

test(
  "redis lock uses NX and finite TTL",
  async () => {
    const redis =
      new LockRedis();

    const cache =
      createRedisCacheAdapter(
        redis,
        {
          now:
            () =>
              "2026-10-07T23:40:00.000Z",

          createLockToken:
            () =>
              "lock-token-1",
        }
      );

    const first =
      await cache.acquireLock({
        key:
          "lock:job:1",

        ttlSeconds:
          15,

        operation,
      });

    const second =
      await cache.acquireLock({
        key:
          "lock:job:1",

        ttlSeconds:
          15,

        operation,
      });

    assert.equal(
      first.acquired,
      true
    );

    assert.equal(
      first.token,
      "lock-token-1"
    );

    assert.equal(
      second.acquired,
      false
    );

    assert.equal(
      second.token,
      null
    );

    assert.equal(
      first.authoritative,
      false
    );
  }
);

test(
  "redis lock release requires matching token",
  async () => {
    const redis =
      new LockRedis();

    const cache =
      createRedisCacheAdapter(
        redis,
        {
          createLockToken:
            () =>
              "correct-token",
        }
      );

    await cache.acquireLock({
      key:
        "lock:job:2",

      ttlSeconds:
        10,

      operation,
    });

    assert.equal(
      await cache.releaseLock({
        key:
          "lock:job:2",

        token:
          "wrong-token",

        operation,
      }),
      false
    );

    assert.equal(
      await cache.releaseLock({
        key:
          "lock:job:2",

        token:
          "correct-token",

        operation,
      }),
      true
    );
  }
);

test(
  "redis lock rejects invalid TTL",
  async () => {
    const cache =
      createRedisCacheAdapter(
        new LockRedis()
      );

    await assert.rejects(
      () =>
        cache.acquireLock({
          key:
            "lock:invalid",

          ttlSeconds:
            -1,

          operation,
        }),
      /positive integer/
    );
  }
);
