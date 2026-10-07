import {
  createInfrastructureFoundation,
} from "../../infrastructure/core/foundation";

import type {
  InfrastructureFoundation,
} from "../../infrastructure/core/foundation";

import type {
  InfrastructureProviderConfiguration,
} from "../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironmentSource,
} from "./DigitalBoostInfrastructureEnvironment";

import {
  composePostgresDatabaseFromEnvironment,
} from "./postgresql/PostgresServerComposition";

import {
  composeRedisCacheFromEnvironment,
} from "./redis/RedisServerComposition";

import {
  composeS3ObjectStorageFromEnvironment,
} from "./object-storage/S3ServerComposition";

import {
  composeQueueFromEnvironment,
} from "./queue/BullMqServerComposition";

type DatabaseComposition =
  Awaited<
    ReturnType<
      typeof composePostgresDatabaseFromEnvironment
    >
  >;

type CacheComposition =
  Awaited<
    ReturnType<
      typeof composeRedisCacheFromEnvironment
    >
  >;

type ObjectStorageComposition =
  Awaited<
    ReturnType<
      typeof composeS3ObjectStorageFromEnvironment
    >
  >;

type QueueComposition =
  Awaited<
    ReturnType<
      typeof composeQueueFromEnvironment
    >
  >;

export type InfrastructureComposers = {
  readonly database:
    typeof composePostgresDatabaseFromEnvironment;

  readonly cache:
    typeof composeRedisCacheFromEnvironment;

  readonly objectStorage:
    typeof composeS3ObjectStorageFromEnvironment;

  readonly queue:
    typeof composeQueueFromEnvironment;
};

export type UnifiedInfrastructureComposition = {
  readonly foundation:
    InfrastructureFoundation;

  readonly providers: {
    readonly database:
      boolean;

    readonly cache:
      boolean;

    readonly objectStorage:
      boolean;

    readonly queue:
      boolean;
  };

  readonly authoritative:
    false;

  close():
    Promise<void>;
};

const DEFAULT_COMPOSERS:
  InfrastructureComposers = {
    database:
      composePostgresDatabaseFromEnvironment,

    cache:
      composeRedisCacheFromEnvironment,

    objectStorage:
      composeS3ObjectStorageFromEnvironment,

    queue:
      composeQueueFromEnvironment,
  };

async function settleInfrastructureClose(
  resources:
    readonly {
      close():
        Promise<void>;
    }[]
):
  Promise<number> {
  const results =
    await Promise.allSettled(
      resources.map(
        resource =>
          resource.close()
      )
    );

  return results.filter(
    result =>
      result.status ===
        "rejected"
  ).length;
}

export async function composeUnifiedInfrastructure(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;

    readonly composers?:
      Partial<InfrastructureComposers>;
  }
):
  Promise<
    UnifiedInfrastructureComposition
  > {
  const composers:
    InfrastructureComposers = {
    ...DEFAULT_COMPOSERS,
    ...input.composers,
  };

  let database:
    DatabaseComposition | null =
    null;

  let cache:
    CacheComposition | null =
    null;

  let objectStorage:
    ObjectStorageComposition | null =
    null;

  let queue:
    QueueComposition | null =
    null;

  try {
    database =
      await composers.database({
        configuration:
          input.configuration,

        source:
          input.source,
      });

    cache =
      await composers.cache({
        configuration:
          input.configuration,

        source:
          input.source,
      });

    objectStorage =
      await composers.objectStorage({
        configuration:
          input.configuration,

        source:
          input.source,
      });

    queue =
      await composers.queue({
        configuration:
          input.configuration,

        source:
          input.source,
      });
  } catch (
    error
  ) {
    const initialized = [
      database,
      cache,
      objectStorage,
      queue,
    ].filter(
      (
        resource
      ):
        resource is
          | DatabaseComposition
          | CacheComposition
          | ObjectStorageComposition
          | QueueComposition =>
        resource !==
          null
    );

    await settleInfrastructureClose(
      initialized
    );

    throw error;
  }

  const foundation =
    createInfrastructureFoundation({
      database:
        database.database,

      cache:
        cache.cache,

      objectStorage:
        objectStorage.storage,

      queue:
        queue.queue,
    });

  let closed =
    false;

  return {
    foundation,

    providers: {
      database:
        database.enabled,

      cache:
        cache.enabled,

      objectStorage:
        objectStorage.enabled,

      queue:
        queue.enabled,
    },

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

      const rejected =
        await settleInfrastructureClose([
          database,
          cache,
          objectStorage,
          queue,
        ]);

      if (
        rejected >
          0
      ) {
        throw new Error(
          `Infrastructure shutdown failed for ${rejected} provider(s).`
        );
      }
    },
  };
}
