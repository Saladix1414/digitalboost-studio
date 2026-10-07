import assert from "node:assert/strict";
import test from "node:test";

import {
  describeInfrastructurePhase34Closure,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureClosure.ts";

test(
  "Phase 34 closure records the canonical provider matrix",
  () => {
    const status =
      describeInfrastructurePhase34Closure();

    assert.equal(
      status.phase,
      "34"
    );

    assert.equal(
      status.state,
      "closed"
    );

    assert.deepEqual(
      status.capabilities,
      {
        database:
          "postgresql",

        cache:
          "redis",

        objectStorage:
          "s3-compatible",

        queue:
          "redis-queue",

        workers:
          "explicit-only",
      }
    );
  }
);

test(
  "Phase 34 closure records fail-closed lifecycle guarantees",
  () => {
    const guarantees =
      describeInfrastructurePhase34Closure()
        .guarantees;

    assert.equal(
      guarantees.providersOptIn,
      true
    );

    assert.equal(
      guarantees.disabledByDefault,
      true
    );

    assert.equal(
      guarantees.configurationFailClosed,
      true
    );

    assert.equal(
      guarantees.startupCleanup,
      true
    );

    assert.equal(
      guarantees.readinessIsolated,
      true
    );

    assert.equal(
      guarantees.shutdownAllSettled,
      true
    );

    assert.equal(
      guarantees.secretValuesServerSideOnly,
      true
    );

    assert.equal(
      guarantees.rawErrorsSanitized,
      true
    );
  }
);
