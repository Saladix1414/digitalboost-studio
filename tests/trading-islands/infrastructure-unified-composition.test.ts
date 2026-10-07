import assert from "node:assert/strict";
import test from "node:test";

import {
  createDisabledInfrastructureConfiguration,
} from "../../src/infrastructure/core/configuration.ts";

import {
  composeUnifiedInfrastructure,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureComposition.ts";

test(
  "unified infrastructure composes disabled foundation safely",
  async () => {
    const configuration =
      createDisabledInfrastructureConfiguration(
        "test"
      );

    const composition =
      await composeUnifiedInfrastructure({
        configuration,

        source: {
          NODE_ENV:
            "test",
        },
      });

    assert.equal(
      composition.foundation.database,
      null
    );

    assert.equal(
      composition.foundation.cache,
      null
    );

    assert.equal(
      composition.foundation.objectStorage,
      null
    );

    assert.equal(
      composition.foundation.queue,
      null
    );

    assert.equal(
      composition.authoritative,
      false
    );

    assert.deepEqual(
      composition.providers,
      {
        database:
          false,

        cache:
          false,

        objectStorage:
          false,

        queue:
          false,
      }
    );

    await composition.close();
    await composition.close();
  }
);
