import type {
  CacheDeleteInput,
  CacheLockResult,
  CachePort,
  CacheReadResult,
  CacheWriteInput,
} from "../../../infrastructure/core/cache";

import type {
  InfrastructureHealth,
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "../../../infrastructure/core/types";

import type {
  RedisClientLike,
} from "./RedisDriverTypes";

export type RedisCacheAdapterOptions = {
  readonly source?:
    string;

  readonly now?:
    () => string;

  readonly createLockToken?:
    () => string;
};

function metadata(
  source:
    string,

  now:
    () => string
):
  InfrastructureResultMetadata {
  return {
    observedAt:
      now(),

    source,

    authoritative:
      false,
  };
}

function assertPositiveTtl(
  ttlSeconds:
    number
):
  void {
  if (
    !Number.isInteger(
      ttlSeconds
    ) ||
    ttlSeconds <=
      0
  ) {
    throw new Error(
      "Redis TTL must be a positive integer."
    );
  }
}

function defaultLockToken():
  string {
  return [
    "lock",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join(
    ":"
  );
}

export function createRedisCacheAdapter(
  client:
    RedisClientLike,

  options:
    RedisCacheAdapterOptions = {}
):
  CachePort {
  const source =
    options.source ??
    "redis";

  const now =
    options.now ??
    (() =>
      new Date().toISOString());

  const createLockToken =
    options.createLockToken ??
    defaultLockToken;

  return {
    async health():
      Promise<
        InfrastructureHealth
      > {
      try {
        const pong =
          await client.ping();

        return {
          state:
            pong ===
              "PONG"
              ? "ready"
              : "degraded",

          checkedAt:
            now(),

          detail:
            pong ===
              "PONG"
              ? null
              : "Redis health response was unexpected.",

          authoritative:
            false,
        };
      } catch {
        return {
          state:
            "unavailable",

          checkedAt:
            now(),

          detail:
            "Redis health check failed.",

          authoritative:
            false,
        };
      }
    },

    async get(
      key:
        string,

      _operation:
        InfrastructureOperationContext
    ):
      Promise<
        CacheReadResult
      > {
      const value =
        await client.get(
          key
        );

      return {
        value,

        metadata:
          metadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },

    async set(
      input:
        CacheWriteInput
    ):
      Promise<void> {
      if (
        input.ttlSeconds !==
          null
      ) {
        assertPositiveTtl(
          input.ttlSeconds
        );
      }

      const result =
        await client.set(
          input.key,
          input.value,
          {
            ttlSeconds:
              input.ttlSeconds,

            mode:
              null,
          }
        );

      if (
        result !==
          "OK"
      ) {
        throw new Error(
          "Redis cache write was not acknowledged."
        );
      }
    },

    async delete(
      input:
        CacheDeleteInput
    ):
      Promise<void> {
      await client.del(
        input.key
      );
    },

    async acquireLock(
      input: {
        readonly key:
          string;

        readonly ttlSeconds:
          number;

        readonly operation:
          InfrastructureOperationContext;
      }
    ):
      Promise<
        CacheLockResult
      > {
      assertPositiveTtl(
        input.ttlSeconds
      );

      const token =
        createLockToken();

      if (
        token.trim().length ===
          0
      ) {
        throw new Error(
          "Redis lock token cannot be empty."
        );
      }

      const result =
        await client.set(
          input.key,
          token,
          {
            ttlSeconds:
              input.ttlSeconds,

            mode:
              "NX",
          }
        );

      const acquired =
        result ===
          "OK";

      return {
        acquired,

        token:
          acquired
            ? token
            : null,

        expiresAt:
          acquired
            ? new Date(
                Date.parse(
                  now()
                ) +
                input.ttlSeconds *
                  1000
              ).toISOString()
            : null,

        metadata:
          metadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },

    async releaseLock(
      input: {
        readonly key:
          string;

        readonly token:
          string;

        readonly operation:
          InfrastructureOperationContext;
      }
    ):
      Promise<boolean> {
      if (
        input.token.trim().length ===
          0
      ) {
        return false;
      }

      return client.compareAndDelete(
        input.key,
        input.token
      );
    },
  };
}
