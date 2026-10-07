import assert from "node:assert/strict";
import test from "node:test";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

import {
  inspectInfrastructureRuntimeSecurity,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureSecurity.ts";

test(
  "disabled infrastructure requires no runtime secrets",
  () => {
    const configuration =
      readInfrastructureEnvironment(
        {}
      );

    const issues =
      inspectInfrastructureRuntimeSecurity({
        configuration,

        source: {},
      });

    assert.deepEqual(
      issues,
      []
    );
  }
);

test(
  "enabled PostgreSQL fails closed before composition without DATABASE_URL",
  () => {
    const source = {
      DIGITALBOOST_INFRA_DATABASE_PROVIDER:
        "postgresql",
    };

    assert.throws(
      () =>
        readInfrastructureEnvironment(
          source
        ),
      /Database connection reference is required when its provider is enabled/
    );
  }
);

test(
  "Redis cache rejects unsupported URL protocols",
  () => {
    const source = {
      DIGITALBOOST_INFRA_CACHE_PROVIDER:
        "redis",

      REDIS_URL:
        "https://redis.example",
    };

    const configuration =
      readInfrastructureEnvironment(
        source
      );

    const issues =
      inspectInfrastructureRuntimeSecurity({
        configuration,

        source,
      });

    assert.equal(
      issues.some(
        issue =>
          issue.provider ===
            "cache" &&
          issue.code ===
            "unsafe-protocol"
      ),
      true
    );
  }
);

test(
  "object storage endpoint cannot embed credentials",
  () => {
    const source = {
      DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER:
        "s3-compatible",

      OBJECT_STORAGE_ENDPOINT:
        "https://user:secret@storage.example",

      OBJECT_STORAGE_BUCKET:
        "assets",
    };

    const configuration =
      readInfrastructureEnvironment(
        source
      );

    const issues =
      inspectInfrastructureRuntimeSecurity({
        configuration,

        source,
      });

    assert.equal(
      issues.some(
        issue =>
          issue.provider ===
            "object-storage" &&
          issue.code ===
            "credentials-in-endpoint"
      ),
      true
    );
  }
);
