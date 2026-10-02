import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidenceReconciliationHistoryCoordinator,
  getRuntimeEvidenceReconciliationHistory,
  getRuntimeEvidenceReconciliationHistoryCoordinationHealth,
  markRuntimeEvidenceReconciliationHistoryExternalChange,
  resetRuntimeEvidenceReconciliationHistoryForTests,
  subscribeRuntimeEvidenceReconciliationHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryStore.ts";

import {
  createLocalRuntimeEvidenceReconciliationHistoryCoordinator,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryCoordination.ts";


test(
  "local fallback reports degraded coordination",
  () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      createLocalRuntimeEvidenceReconciliationHistoryCoordinator()
    );

    const health =
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth();

    assert.equal(
      health.crossContextSafe,
      false
    );

    assert.equal(
      health.externalChangeDetected,
      false
    );

    assert.equal(
      health.authoritative,
      false
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "strong coordinator reports cross context safe",
  () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    configureRuntimeEvidenceReconciliationHistoryCoordinator({
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
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth();

    assert.equal(
      health.crossContextSafe,
      true
    );

    assert.equal(
      health.authoritative,
      false
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "external change updates health without fabricating history",
  () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const historyBefore =
      getRuntimeEvidenceReconciliationHistory();

    const healthBefore =
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth();

    let notifications =
      0;

    const unsubscribe =
      subscribeRuntimeEvidenceReconciliationHistory(
        () => {
          notifications +=
            1;
        }
      );

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    const healthAfter =
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth();

    assert.notEqual(
      healthAfter,
      healthBefore
    );

    assert.equal(
      healthAfter.externalChangeDetected,
      true
    );

    assert.equal(
      healthAfter.authoritative,
      false
    );

    assert.deepEqual(
      getRuntimeEvidenceReconciliationHistory(),
      historyBefore
    );

    assert.equal(
      historyBefore.entries.length,
      0
    );

    assert.ok(
      notifications >
        0
    );

    unsubscribe();

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "unchanged health preserves snapshot identity",
  () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const first =
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth();

    const second =
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth();

    assert.equal(
      first,
      second
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
