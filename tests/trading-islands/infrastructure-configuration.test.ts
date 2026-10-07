import assert from "node:assert/strict";
import test from "node:test";

import {
  createDisabledInfrastructureConfiguration,
  createInfrastructureProviderConfiguration,
  infrastructureProvidersReady,
  selectInfrastructureProviders,
} from "../../src/infrastructure/core/index.ts";

test(
  "infrastructure providers are disabled by default",
  () => {
    const config =
      createDisabledInfrastructureConfiguration(
        "development"
      );

    assert.equal(
      config.database.provider,
      "disabled"
    );

    assert.equal(
      config.cache.provider,
      "disabled"
    );

    assert.equal(
      config.objectStorage.provider,
      "disabled"
    );

    assert.equal(
      config.queue.provider,
      "disabled"
    );

    assert.equal(
      config.authoritative,
      false
    );
  }
);

test(
  "configured provider selection remains descriptive only",
  () => {
    const config =
      createInfrastructureProviderConfiguration({
        environment:
          "production",

        databaseProvider:
          "postgresql",

        databaseConnectionReference:
          "env:DATABASE_URL",

        cacheProvider:
          "redis",

        cacheConnectionReference:
          "env:REDIS_URL",

        objectStorageProvider:
          "s3-compatible",

        objectStorageEndpointReference:
          "env:OBJECT_STORAGE_ENDPOINT",

        objectStorageBucketReference:
          "env:OBJECT_STORAGE_BUCKET",

        queueProvider:
          "redis-queue",

        queueConnectionReference:
          "env:QUEUE_REDIS_URL",
      });

    const selection =
      selectInfrastructureProviders(
        config
      );

    assert.equal(
      selection.hasDurableDatabase,
      true
    );

    assert.equal(
      selection.hasDistributedCache,
      true
    );

    assert.equal(
      selection.hasDurableObjectStorage,
      true
    );

    assert.equal(
      selection.hasQueueTransport,
      true
    );

    assert.equal(
      selection.authoritative,
      false
    );

    assert.equal(
      infrastructureProvidersReady(
        selection
      ),
      true
    );
  }
);

test(
  "enabled providers require configuration references",
  () => {
    assert.throws(
      () =>
        createInfrastructureProviderConfiguration({
          environment:
            "production",

          databaseProvider:
            "postgresql",
        }),
      /Database connection reference/
    );

    assert.throws(
      () =>
        createInfrastructureProviderConfiguration({
          environment:
            "production",

          cacheProvider:
            "redis",
        }),
      /Cache connection reference/
    );

    assert.throws(
      () =>
        createInfrastructureProviderConfiguration({
          environment:
            "production",

          objectStorageProvider:
            "s3-compatible",

          objectStorageEndpointReference:
            "env:OBJECT_STORAGE_ENDPOINT",
        }),
      /Object storage bucket reference/
    );

    assert.throws(
      () =>
        createInfrastructureProviderConfiguration({
          environment:
            "production",

          queueProvider:
            "redis-queue",
        }),
      /Queue connection reference/
    );
  }
);

test(
  "disabled providers discard accidental references",
  () => {
    const config =
      createInfrastructureProviderConfiguration({
        environment:
          "test",

        databaseConnectionReference:
          "should-not-be-used",

        cacheConnectionReference:
          "should-not-be-used",

        objectStorageEndpointReference:
          "should-not-be-used",

        objectStorageBucketReference:
          "should-not-be-used",

        queueConnectionReference:
          "should-not-be-used",
      });

    assert.equal(
      config.database.connectionReference,
      null
    );

    assert.equal(
      config.cache.connectionReference,
      null
    );

    assert.equal(
      config.objectStorage.endpointReference,
      null
    );

    assert.equal(
      config.objectStorage.bucketReference,
      null
    );

    assert.equal(
      config.queue.connectionReference,
      null
    );
  }
);
