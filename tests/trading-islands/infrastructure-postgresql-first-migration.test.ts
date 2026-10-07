import assert from "node:assert/strict";
import test from "node:test";

import {
  infrastructureFoundationMigration,
} from "../../src/server/infrastructure/postgresql/migrations/0001InfrastructureFoundation.ts";

test(
  "first infrastructure migration has deterministic identity",
  () => {
    assert.equal(
      infrastructureFoundationMigration.version,
      1
    );

    assert.equal(
      infrastructureFoundationMigration.name,
      "infrastructure-foundation"
    );

    assert.equal(
      infrastructureFoundationMigration.authoritative,
      false
    );
  }
);
