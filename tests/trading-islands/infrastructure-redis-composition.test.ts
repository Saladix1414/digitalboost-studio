import assert from "node:assert/strict";
import test from "node:test";

import {
  composeRedisCacheFromEnvironment,
} from "../../src/server/infrastructure/redis/RedisServerComposition.ts";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

import type {
  ManagedRedisClientLike,
  RedisClientFactory,
} from "../../src/server/infrastructure/redis/RedisServerComposition.ts";

import type {
  RedisSetInput,
} from "../../src/server/infrastructure/redis/index.ts";

function fakeClient(
  lifecycle?: {
    connects:
      number;

    quits:
      number;
  }
):
  ManagedRedisClientLike {
  const values =
    new Map<
      string,
      string
    >();

  return {
    async connect():
      Promise<void> {
      if (
        lifecycle
      ) {
        lifecycle.connects +=
          1;
      }
    },

    async get(
      key:
        string
    ) {
      return values.get(
        key
      ) ??
        null;
    },

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
        values.has(
          key
        )
      ) {
        return null;
      }

      values.set(
        key,
        value
      );

      return "OK";
    },

    async del(
      key:
        string
    ) {
      return values.delete(
        key
      )
        ? 1
        : 0;
    },

    async compareAndDelete(
      key:
        string,

      expected:
        string
    ) {
      if (
        values.get(
          key
        ) !==
          expected
      ) {
        return false;
      }

      values.delete(
        key
      );

      return true;
    },

    async ping() {
      return "PONG";
    },

    async quit():
      Promise<void> {
      if (
        lifecycle
      ) {
        lifecycle.quits +=
          1;
      }
    },
  };
}

test(
  "disabled cache configuration creates no Redis client",
  async () => {
    const config =
      readInfrastructureEnvironment({
        NODE_ENV:
          "development",
      });

    let factoryCalls =
      0;

    const factory:
      RedisClientFactory =
      () => {
        factoryCalls +=
          1;

        return fakeClient();
      };

    const composition =
      await composeRedisCacheFromEnvironment({
        configuration:
          config,

        source: {},

        clientFactory:
          factory,
      });

    assert.equal(
      composition.enabled,
      false
    );

    assert.equal(
      composition.cache,
      null
    );

    assert.equal(
      composition.authoritative,
      false
    );

    assert.equal(
      factoryCalls,
      0
    );

    await composition.close();
  }
);

test(
  "enabled Redis resolves secret only at server composition",
  async () => {
    const secret =
      "redis://private-user:private-password@cache.internal:6379";

    const source = {
      NODE_ENV:
        "production",

      DIGITALBOOST_INFRA_CACHE_PROVIDER:
        "redis",

      REDIS_URL:
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
      RedisClientFactory =
      input => {
        observedUrl =
          input.url;

        return fakeClient();
      };

    const composition =
      await composeRedisCacheFromEnvironment({
        configuration:
          config,

        source,

        clientFactory:
          factory,
      });

    assert.equal(
      composition.enabled,
      true
    );

    assert.notEqual(
      composition.cache,
      null
    );

    assert.equal(
      composition.authoritative,
      false
    );

    assert.equal(
      observedUrl,
      secret
    );

    assert.equal(
      config.cache.connectionReference,
      "env:REDIS_URL"
    );

    assert.doesNotMatch(
      JSON.stringify(
        config
      ),
      /private-user|private-password/
    );

    await composition.close();
  }
);

test(
  "Redis lifecycle connects and closes exactly once",
  async () => {
    const lifecycle = {
      connects:
        0,

      quits:
        0,
    };

    const source = {
      DIGITALBOOST_INFRA_CACHE_PROVIDER:
        "redis",

      REDIS_URL:
        "redis://placeholder",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    const composition =
      await composeRedisCacheFromEnvironment({
        configuration:
          config,

        source,

        clientFactory:
          () =>
            fakeClient(
              lifecycle
            ),
      });

    assert.equal(
      lifecycle.connects,
      1
    );

    await composition.close();
    await composition.close();

    assert.equal(
      lifecycle.quits,
      1
    );
  }
);

test(
  "Redis composition rejects mismatched reference",
  async () => {
    const source = {
      DIGITALBOOST_INFRA_CACHE_PROVIDER:
        "redis",

      REDIS_URL:
        "redis://placeholder",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    const malformed = {
      ...config,

      cache: {
        ...config.cache,

        connectionReference:
          "env:OTHER_REDIS_URL",
      },
    };

    await assert.rejects(
      () =>
        composeRedisCacheFromEnvironment({
          configuration:
            malformed,

          source,

          clientFactory:
            () =>
              fakeClient(),
        }),
      /env:REDIS_URL/
    );
  }
);
