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

export async function composeUnifiedInfrastructure(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;
  }
):
  Promise<
    UnifiedInfrastructureComposition
  > {
  const database =
    composePostgresDatabaseFromEnvironment({
      configuration:
        input.configuration,

      source:
        input.source,
    });

  const cache =
    await composeRedisCacheFromEnvironment({
      configuration:
        input.configuration,

      source:
        input.source,
    });

  const objectStorage =
    composeS3ObjectStorageFromEnvironment({
      configuration:
        input.configuration,

      source:
        input.source,
    });

  const queue =
    await composeQueueFromEnvironment({
      configuration:
        input.configuration,

      source:
        input.source,
    });

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

      const results =
        await Promise.allSettled([
          database.close(),
          cache.close(),
          objectStorage.close(),
          queue.close(),
        ]);

      const rejected =
        results.filter(
          result =>
            result.status ===
              "rejected"
        );

      if (
        rejected.length >
          0
      ) {
        throw new Error(
          `Infrastructure shutdown failed for ${rejected.length} provider(s).`
        );
      }
    },
  };
}
