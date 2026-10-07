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

class FakeRedis
  implements RedisClientLike {
  readonly values =
    new Map<
      string,
      string
    >();

  lastSet:
    RedisSetInput | null =
    null;

  failPing =
    false;

  async get(
    key:
      string
  ):
    Promise<
      string | null
    > {
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
    this.lastSet =
      input;

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
  ):
    Promise<number> {
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
  ):
    Promise<boolean> {
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

  async ping():
    Promise<string> {
    if (
      this.failPing
    ) {
      throw new Error(
        "redis://secret failure"
      );
    }

    return "PONG";
  }
}

function operation() {
  return createInfrastructureOperationContext({
    requestedAt:
      "2026-10-07T23:30:00.000Z",
  });
}

test(
  "redis adapter reads and writes cache without authority",
  async () => {
    const redis =
      new FakeRedis();

    const cache =
      createRedisCacheAdapter(
        redis,
        {
          now:
            () =>
              "2026-10-07T23:31:00.000Z",
        }
      );

    await cache.set({
      key:
        "market:btc",

      value:
        "cached-value",

      ttlSeconds:
        30,

      operation:
        operation(),
    });

    const result =
      await cache.get(
        "market:btc",
        operation()
      );

    assert.equal(
      result.value,
      "cached-value"
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.metadata.source,
      "redis"
    );

    assert.equal(
      redis.lastSet?.ttlSeconds,
      30
    );
  }
);

test(
  "redis adapter validates TTL",
  async () => {
    const cache =
      createRedisCacheAdapter(
        new FakeRedis()
      );

    await assert.rejects(
      () =>
        cache.set({
          key:
            "invalid",

          value:
            "x",

          ttlSeconds:
            0,

          operation:
            operation(),
        }),
      /positive integer/
    );
  }
);

test(
  "redis health does not leak driver errors",
  async () => {
    const redis =
      new FakeRedis();

    redis.failPing =
      true;

    const cache =
      createRedisCacheAdapter(
        redis
      );

    const health =
      await cache.health();

    assert.equal(
      health.state,
      "unavailable"
    );

    assert.equal(
      health.detail,
      "Redis health check failed."
    );

    assert.doesNotMatch(
      JSON.stringify(
        health
      ),
      /secret/
    );
  }
);
