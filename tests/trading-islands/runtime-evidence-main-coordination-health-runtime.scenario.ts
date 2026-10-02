import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidenceCoordinator,
  getRuntimeEvidenceCoordinationHealth,
  resetRuntimeEvidenceHistoryForTests,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";


test(
  "main coordinator health reflects degraded local fallback",
  () => {
    resetRuntimeEvidenceHistoryForTests();

    configureRuntimeEvidenceCoordinator({
      crossContextSafe:
        false,

      authoritative:
        false,

      async runExclusive<T>(
        operation:
          () => Promise<T>
      ):
        Promise<T> {
        return operation();
      },
    });

    const health =
      getRuntimeEvidenceCoordinationHealth();

    assert.equal(
      health.crossContextSafe,
      false
    );

    assert.equal(
      health.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);


test(
  "main coordinator health reflects cross context safe coordinator",
  () => {
    resetRuntimeEvidenceHistoryForTests();

    configureRuntimeEvidenceCoordinator({
      crossContextSafe:
        true,

      authoritative:
        false,

      async runExclusive<T>(
        operation:
          () => Promise<T>
      ):
        Promise<T> {
        return operation();
      },
    });

    const health =
      getRuntimeEvidenceCoordinationHealth();

    assert.equal(
      health.crossContextSafe,
      true
    );

    assert.equal(
      health.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);
