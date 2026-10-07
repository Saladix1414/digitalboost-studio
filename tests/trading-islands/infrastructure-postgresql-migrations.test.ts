import assert from "node:assert/strict";
import test from "node:test";

import {
  createPostgresMigrationRegistry,
  planPostgresMigrations,
} from "../../src/server/infrastructure/postgresql/PostgresMigrationRegistry.ts";

import type {
  PostgresMigration,
} from "../../src/server/infrastructure/postgresql/PostgresMigrationTypes.ts";

function migration(
  version:
    number,

  name:
    string
):
  PostgresMigration {
  return {
    version,
    name,

    async up() {
      // fixture
    },

    authoritative:
      false,
  };
}

test(
  "migration registry sorts versions deterministically",
  () => {
    const registry =
      createPostgresMigrationRegistry([
        migration(
          2,
          "second"
        ),

        migration(
          1,
          "first"
        ),
      ]);

    assert.deepEqual(
      registry.map(
        item =>
          item.version
      ),
      [
        1,
        2,
      ]
    );
  }
);

test(
  "migration registry rejects duplicate versions",
  () => {
    assert.throws(
      () =>
        createPostgresMigrationRegistry([
          migration(
            1,
            "first"
          ),

          migration(
            1,
            "duplicate"
          ),
        ]),
      /Duplicate PostgreSQL migration version/
    );
  }
);

test(
  "migration plan only returns unapplied versions",
  () => {
    const plan =
      planPostgresMigrations({
        currentVersion:
          1,

        migrations: [
          migration(
            1,
            "first"
          ),

          migration(
            2,
            "second"
          ),

          migration(
            3,
            "third"
          ),
        ],
      });

    assert.deepEqual(
      plan.pending.map(
        item =>
          item.version
      ),
      [
        2,
        3,
      ]
    );

    assert.equal(
      plan.targetVersion,
      3
    );

    assert.equal(
      plan.authoritative,
      false
    );
  }
);
