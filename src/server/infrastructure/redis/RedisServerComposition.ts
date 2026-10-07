import {
  createClient,
} from "redis";

import type {
  CachePort,
} from "../../../infrastructure/core/cache";

import type {
  InfrastructureProviderConfiguration,
} from "../../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironmentSource,
} from "../DigitalBoostInfrastructureEnvironment";

import {
  createRedisCacheAdapter,
} from "./RedisCacheAdapter";

import type {
  RedisClientLike,
  RedisSetInput,
} from "./RedisDriverTypes";

export type ManagedRedisClientLike =
  RedisClientLike & {
    connect():
      Promise<void>;

    quit():
      Promise<void>;
  };

export type RedisClientFactory =
  (
    input: {
      readonly url:
        string;
    }
  ) =>
    ManagedRedisClientLike;

export type RedisServerComposition = {
  readonly enabled:
    boolean;

  readonly cache:
    CachePort | null;

  readonly authoritative:
    false;

  close():
    Promise<void>;
};

const COMPARE_AND_DELETE_SCRIPT =
  `if redis.call("GET", KEYS[1]) == ARGV[1] then
     return redis.call("DEL", KEYS[1])
   end
   return 0`;

function requireRedisUrl(
  source:
    InfrastructureEnvironmentSource
):
  string {
  const value =
    source.REDIS_URL?.trim();

  if (
    value === undefined ||
    value.length ===
      0
  ) {
    throw new Error(
      "REDIS_URL is required when Redis infrastructure is enabled."
    );
  }

  return value;
}

function createNodeRedisClient(
  input: {
    readonly url:
      string;
  }
):
  ManagedRedisClientLike {
  const client =
    createClient({
      url:
        input.url,
    });

  client.on(
    "error",
    () => {
      // Runtime health is surfaced through CachePort.health().
      // Connection details and secrets are deliberately not logged here.
    }
  );

  return {
    async connect():
      Promise<void> {
      if (
        !client.isOpen
      ) {
        await client.connect();
      }
    },

    async get(
      key:
        string
    ):
      Promise<
        string | null
      > {
      return client.get(
        key
      );
    },

    async set(
      key:
        string,

      value:
        string,

      options:
        RedisSetInput
    ):
      Promise<
        "OK" | null
      > {
      const commandOptions: {
        EX?:
          number;

        NX?:
          true;
      } = {};

      if (
        options.ttlSeconds !==
          null
      ) {
        commandOptions.EX =
          options.ttlSeconds;
      }

      if (
        options.mode ===
          "NX"
      ) {
        commandOptions.NX =
          true;
      }

      return client.set(
        key,
        value,
        commandOptions
      );
    },

    async del(
      key:
        string
    ):
      Promise<number> {
      return client.del(
        key
      );
    },

    async compareAndDelete(
      key:
        string,

      expectedValue:
        string
    ):
      Promise<boolean> {
      const result =
        await client.eval(
          COMPARE_AND_DELETE_SCRIPT,
          {
            keys: [
              key,
            ],

            arguments: [
              expectedValue,
            ],
          }
        );

      return Number(
        result
      ) ===
        1;
    },

    async ping():
      Promise<string> {
      return client.ping();
    },

    async quit():
      Promise<void> {
      if (
        client.isOpen
      ) {
        await client.quit();
      }
    },
  };
}

export async function composeRedisCacheFromEnvironment(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;

    readonly clientFactory?:
      RedisClientFactory;
  }
):
  Promise<
    RedisServerComposition
  > {
  if (
    input.configuration.cache.provider ===
      "disabled"
  ) {
    return {
      enabled:
        false,

      cache:
        null,

      authoritative:
        false,

      async close():
        Promise<void> {
        // No Redis client exists in disabled mode.
      },
    };
  }

  if (
    input.configuration.cache.provider !==
      "redis"
  ) {
    throw new Error(
      "Unsupported server cache provider."
    );
  }

  if (
    input.configuration.cache.connectionReference !==
      "env:REDIS_URL"
  ) {
    throw new Error(
      "Redis server composition requires env:REDIS_URL."
    );
  }

  const url =
    requireRedisUrl(
      input.source
    );

  const clientFactory =
    input.clientFactory ??
    createNodeRedisClient;

  const client =
    clientFactory({
      url,
    });

  await client.connect();

  const cache =
    createRedisCacheAdapter(
      client,
      {
        source:
          "redis",
      }
    );

  let closed =
    false;

  return {
    enabled:
      true,

    cache,

    authoritative:
      false,

    async close():
      Promise<void> {
      if (
        closed
      ) {
        return;
      }

      closed =
        true;

      await client.quit();
    },
  };
}
