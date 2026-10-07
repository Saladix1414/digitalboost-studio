import assert from "node:assert/strict";
import test from "node:test";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

test(
  "server infrastructure defaults to disabled providers",
  () => {
    const config =
      readInfrastructureEnvironment({
        NODE_ENV:
          "development",
      });

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
  "environment secrets become references only",
  () => {
    const config =
      readInfrastructureEnvironment({
        NODE_ENV:
          "production",

        DIGITALBOOST_INFRA_DATABASE_PROVIDER:
          "postgresql",

        DATABASE_URL:
          "postgresql://secret:secret@db/private",

        DIGITALBOOST_INFRA_CACHE_PROVIDER:
          "redis",

        REDIS_URL:
          "redis://secret@cache",

        DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER:
          "s3-compatible",

        OBJECT_STORAGE_ENDPOINT:
          "https://objects.example",

        OBJECT_STORAGE_BUCKET:
          "private-bucket",

        DIGITALBOOST_INFRA_QUEUE_PROVIDER:
          "redis-queue",

        QUEUE_REDIS_URL:
          "redis://secret@queue",
      });

    assert.equal(
      config.database.connectionReference,
      "env:DATABASE_URL"
    );

    assert.equal(
      config.cache.connectionReference,
      "env:REDIS_URL"
    );

    assert.equal(
      config.queue.connectionReference,
      "env:QUEUE_REDIS_URL"
    );

    assert.doesNotMatch(
      JSON.stringify(config),
      /secret@|secret:secret/
    );
  }
);

test(
  "enabled providers fail closed without required environment",
  () => {
    assert.throws(
      () =>
        readInfrastructureEnvironment({
          DIGITALBOOST_INFRA_DATABASE_PROVIDER:
            "postgresql",
        }),
      /Database connection reference/
    );

    assert.throws(
      () =>
        readInfrastructureEnvironment({
          DIGITALBOOST_INFRA_CACHE_PROVIDER:
            "redis",
        }),
      /Cache connection reference/
    );
  }
);

test(
  "unknown provider names are rejected",
  () => {
    assert.throws(
      () =>
        readInfrastructureEnvironment({
          DIGITALBOOST_INFRA_DATABASE_PROVIDER:
            "unknown",
        }),
      /Unsupported database provider/
    );
  }
);
