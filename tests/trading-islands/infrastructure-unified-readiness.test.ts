import assert from "node:assert/strict";
import test from "node:test";

import {
  createInfrastructureFoundation,
} from "../../src/infrastructure/core/foundation.ts";

import {
  checkUnifiedInfrastructureReadiness,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureReadiness.ts";

test(
  "all disabled providers are healthy from infrastructure perspective",
  async () => {
    const readiness =
      await checkUnifiedInfrastructureReadiness({
        foundation:
          createInfrastructureFoundation(),

        providers: {
          database:
            false,

          cache:
            false,

          objectStorage:
            false,

          queue:
            false,
        },

        now:
          () =>
            "2026-10-08T01:00:00.000Z",
      });

    assert.equal(
      readiness.status,
      "ready"
    );

    assert.equal(
      readiness.database,
      "disabled"
    );

    assert.equal(
      readiness.cache,
      "disabled"
    );

    assert.equal(
      readiness.objectStorage,
      "disabled"
    );

    assert.equal(
      readiness.queue,
      "disabled"
    );

    assert.equal(
      readiness.authoritative,
      false
    );
  }
);

test(
  "enabled provider without adapter is unavailable",
  async () => {
    const readiness =
      await checkUnifiedInfrastructureReadiness({
        foundation:
          createInfrastructureFoundation(),

        providers: {
          database:
            true,

          cache:
            false,

          objectStorage:
            false,

          queue:
            false,
        },
      });

    assert.equal(
      readiness.status,
      "unavailable"
    );

    assert.equal(
      readiness.database,
      "unavailable"
    );
  }
);
