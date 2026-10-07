import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

import {
  describeSafeInfrastructureRuntime,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureSecurity.ts";

test(
  "safe runtime description never includes secret values",
  () => {
    const source = {
      DIGITALBOOST_INFRA_DATABASE_PROVIDER:
        "postgresql",

      DATABASE_URL:
        "postgresql://admin:super-secret@db.internal/app",

      DIGITALBOOST_INFRA_CACHE_PROVIDER:
        "redis",

      REDIS_URL:
        "rediss://cache-user:cache-secret@cache.internal:6379",

      DIGITALBOOST_INFRA_QUEUE_PROVIDER:
        "redis-queue",

      QUEUE_REDIS_URL:
        "rediss://queue-user:queue-secret@queue.internal:6379",
    };

    const configuration =
      readInfrastructureEnvironment(
        source
      );

    const description =
      describeSafeInfrastructureRuntime({
        configuration,
      });

    const serialized =
      JSON.stringify(
        description
      );

    assert.doesNotMatch(
      serialized,
      /super-secret|cache-secret|queue-secret|admin|cache-user|queue-user/
    );

    assert.equal(
      description.authoritative,
      false
    );
  }
);

test(
  "server infrastructure security module does not expose process env values",
  () => {
    const source =
      fs.readFileSync(
        new URL(
          "../../src/server/infrastructure/DigitalBoostInfrastructureSecurity.ts",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      source,
      /console\.log\s*\(\s*input\.source|JSON\.stringify\s*\(\s*input\.source/
    );
  }
);
