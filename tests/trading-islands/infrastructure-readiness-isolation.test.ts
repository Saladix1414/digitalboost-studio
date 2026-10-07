import assert from "node:assert/strict";
import test from "node:test";

import {
  createInfrastructureFoundation,
} from "../../src/infrastructure/core/foundation.ts";

import {
  checkUnifiedInfrastructureReadiness,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureReadiness.ts";

test(
  "readiness isolates a throwing database health check",
  async () => {
    let cacheChecked =
      false;

    let queueChecked =
      false;

    const foundation =
      createInfrastructureFoundation({
        database: {
          async health() {
            throw new Error(
              "database secret failure"
            );
          },

          async query() {
            throw new Error(
              "unused"
            );
          },

          async mutate() {
            throw new Error(
              "unused"
            );
          },

          async transaction() {
            throw new Error(
              "unused"
            );
          },
        },

        cache: {
          async health() {
            cacheChecked =
              true;

            return {
              state:
                "ready",

              checkedAt:
                "2026-10-08T02:00:00.000Z",

              detail:
                null,

              authoritative:
                false,
            };
          },

          async get() {
            throw new Error(
              "unused"
            );
          },

          async set() {
            throw new Error(
              "unused"
            );
          },

          async delete() {
            throw new Error(
              "unused"
            );
          },

          async acquireLock() {
            throw new Error(
              "unused"
            );
          },

          async releaseLock() {
            throw new Error(
              "unused"
            );
          },
        },

        objectStorage:
          null,

        queue: {
          async health() {
            queueChecked =
              true;

            return {
              state:
                "degraded",

              checkedAt:
                "2026-10-08T02:00:00.000Z",

              detail:
                "fixture",

              authoritative:
                false,
            };
          },

          async publish() {
            throw new Error(
              "unused"
            );
          },
        },
      });

    const readiness =
      await checkUnifiedInfrastructureReadiness({
        foundation,

        providers: {
          database:
            true,

          cache:
            true,

          objectStorage:
            false,

          queue:
            true,
        },

        now:
          () =>
            "2026-10-08T02:01:00.000Z",
      });

    assert.equal(
      readiness.status,
      "unavailable"
    );

    assert.equal(
      readiness.database,
      "unavailable"
    );

    assert.equal(
      readiness.cache,
      "ready"
    );

    assert.equal(
      readiness.queue,
      "degraded"
    );

    assert.equal(
      cacheChecked,
      true
    );

    assert.equal(
      queueChecked,
      true
    );

    assert.doesNotMatch(
      JSON.stringify(
        readiness
      ),
      /secret failure/
    );

    assert.equal(
      readiness.authoritative,
      false
    );
  }
);

test(
  "degraded provider produces degraded aggregate when none unavailable",
  async () => {
    const foundation =
      createInfrastructureFoundation({
        queue: {
          async health() {
            return {
              state:
                "degraded",

              checkedAt:
                "2026-10-08T02:02:00.000Z",

              detail:
                null,

              authoritative:
                false,
            };
          },

          async publish() {
            throw new Error(
              "unused"
            );
          },
        },
      });

    const readiness =
      await checkUnifiedInfrastructureReadiness({
        foundation,

        providers: {
          database:
            false,

          cache:
            false,

          objectStorage:
            false,

          queue:
            true,
        },
      });

    assert.equal(
      readiness.status,
      "degraded"
    );

    assert.equal(
      readiness.queue,
      "degraded"
    );
  }
);
