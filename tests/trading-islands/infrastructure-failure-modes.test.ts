import assert from "node:assert/strict";
import test from "node:test";

import {
  createDisabledInfrastructureConfiguration,
} from "../../src/infrastructure/core/configuration.ts";

import {
  composeUnifiedInfrastructure,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureComposition.ts";

test(
  "startup failure closes already initialized providers",
  async () => {
    const configuration =
      createDisabledInfrastructureConfiguration(
        "test"
      );

    const closed = {
      database:
        0,

      cache:
        0,

      objectStorage:
        0,
    };

    await assert.rejects(
      () =>
        composeUnifiedInfrastructure({
          configuration,

          source: {
            NODE_ENV:
              "test",
          },

          composers: {
            database:
              async () => ({
                enabled:
                  false,

                database:
                  null,

                authoritative:
                  false,

                async close() {
                  closed.database +=
                    1;
                },
              }),

            cache:
              async () => ({
                enabled:
                  false,

                cache:
                  null,

                authoritative:
                  false,

                async close() {
                  closed.cache +=
                    1;
                },
              }),

            objectStorage:
              () => ({
                enabled:
                  false,

                storage:
                  null,

                authoritative:
                  false,

                async close() {
                  closed.objectStorage +=
                    1;
                },
              }),

            queue:
              async () => {
                throw new Error(
                  "queue initialization failed"
                );
              },
          },
        }),
      /queue initialization failed/
    );

    assert.deepEqual(
      closed,
      {
        database:
          1,

        cache:
          1,

        objectStorage:
          1,
      }
    );
  }
);

test(
  "startup preserves original failure even when cleanup also fails",
  async () => {
    const configuration =
      createDisabledInfrastructureConfiguration(
        "test"
      );

    await assert.rejects(
      () =>
        composeUnifiedInfrastructure({
          configuration,

          source: {
            NODE_ENV:
              "test",
          },

          composers: {
            database:
              async () => ({
                enabled:
                  false,

                database:
                  null,

                authoritative:
                  false,

                async close() {
                  throw new Error(
                    "cleanup failure"
                  );
                },
              }),

            cache:
              async () => {
                throw new Error(
                  "cache initialization failed"
                );
              },
          },
        }),
      /cache initialization failed/
    );
  }
);

test(
  "shutdown attempts every provider even when one close fails",
  async () => {
    const configuration =
      createDisabledInfrastructureConfiguration(
        "test"
      );

    const closed = {
      database:
        0,

      cache:
        0,

      objectStorage:
        0,

      queue:
        0,
    };

    const composition =
      await composeUnifiedInfrastructure({
        configuration,

        source: {
          NODE_ENV:
            "test",
        },

        composers: {
          database:
            async () => ({
              enabled:
                false,

              database:
                null,

              authoritative:
                false,

              async close() {
                closed.database +=
                  1;

                throw new Error(
                  "database close failed"
                );
              },
            }),

          cache:
            async () => ({
              enabled:
                false,

              cache:
                null,

              authoritative:
                false,

              async close() {
                closed.cache +=
                  1;
              },
            }),

          objectStorage:
            () => ({
              enabled:
                false,

              storage:
                null,

              authoritative:
                false,

              async close() {
                closed.objectStorage +=
                  1;
              },
            }),

          queue:
            async () => ({
              enabled:
                false,

              queue:
                null,

              authoritative:
                false,

              async close() {
                closed.queue +=
                  1;
              },
            }),
        },
      });

    await assert.rejects(
      () =>
        composition.close(),
      /shutdown failed for 1 provider/
    );

    assert.deepEqual(
      closed,
      {
        database:
          1,

        cache:
          1,

        objectStorage:
          1,

        queue:
          1,
      }
    );
  }
);
