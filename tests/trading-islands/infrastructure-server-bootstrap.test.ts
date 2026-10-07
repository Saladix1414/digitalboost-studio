import assert from "node:assert/strict";
import test from "node:test";

import {
  bootstrapInfrastructureConfiguration,
  describeInfrastructureBootstrap,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureBootstrap.ts";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

test(
  "bootstrap creates no concrete clients",
  () => {
    const config =
      readInfrastructureEnvironment({
        NODE_ENV:
          "development",
      });

    const bootstrap =
      bootstrapInfrastructureConfiguration(
        config
      );

    assert.equal(
      bootstrap.concreteClientsCreated,
      false
    );

    assert.equal(
      bootstrap.authoritative,
      false
    );

    assert.equal(
      describeInfrastructureBootstrap(
        bootstrap
      ),
      "infrastructure providers disabled"
    );
  }
);

test(
  "configured bootstrap remains non authoritative",
  () => {
    const config =
      readInfrastructureEnvironment({
        NODE_ENV:
          "production",

        DIGITALBOOST_INFRA_DATABASE_PROVIDER:
          "postgresql",

        DATABASE_URL:
          "postgresql://placeholder",

        DIGITALBOOST_INFRA_CACHE_PROVIDER:
          "redis",

        REDIS_URL:
          "redis://placeholder",

        DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER:
          "s3-compatible",

        OBJECT_STORAGE_ENDPOINT:
          "https://storage.example",

        OBJECT_STORAGE_BUCKET:
          "bucket",

        DIGITALBOOST_INFRA_QUEUE_PROVIDER:
          "redis-queue",

        QUEUE_REDIS_URL:
          "redis://placeholder",
      });

    const bootstrap =
      bootstrapInfrastructureConfiguration(
        config
      );

    assert.equal(
      bootstrap.fullyConfigured,
      true
    );

    assert.equal(
      bootstrap.concreteClientsCreated,
      false
    );

    assert.equal(
      bootstrap.authoritative,
      false
    );
  }
);
