import test from "node:test";
import assert from "node:assert/strict";

import {
  createPulseInferenceEvidence,
} from "../../src/ai/DigitalBoostPulseInferenceEvidence.ts";

import {
  createPulseInferenceEvidenceRecord,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceRegistry.ts";

import {
  consumePulseInferenceEvidence,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceConsumer.ts";

import {
  projectPulseInferenceSemanticObservation,
} from "../../src/ai/DigitalBoostPulseInferenceSemanticBoundary.ts";

import {
  reconcilePulseIntent,
} from "../../src/ai/DigitalBoostPulseIntentReconciliation.ts";

import {
  createPulseIntentReconciliationRecord,
  savePulseIntentReconciliationRecord,
  getPulseIntentReconciliationRecord,
  listPulseIntentReconciliationRecords,
  verifyPulseIntentReconciliationRecord,
  validatePulseIntentReconciliationRegistry,
  PulseIntentReconciliationRegistryError,
  PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION,
  PULSE_INTENT_RECONCILIATION_STORAGE,
} from "../../src/ai/DigitalBoostPulseIntentReconciliationRegistry.ts";

import {
  classifyPulseIntent,
} from "../../src/DigitalBoostPulseIntentEngine.ts";

type StorageMap = Map<string, string>;

const storageMap: StorageMap =
  new Map();

const localStorageMock = {
  getItem(key: string) {
    return storageMap.has(key)
      ? storageMap.get(key)!
      : null;
  },

  setItem(
    key: string,
    value: string,
  ) {
    storageMap.set(
      key,
      String(value),
    );
  },
};

Object.defineProperty(
  globalThis,
  "localStorage",
  {
    value: localStorageMock,
    configurable: true,
  },
);

const TENANT =
  "registry-tenant";

const OTHER_TENANT =
  "other-registry-tenant";

const STORE =
  "RegistryStore";

const CONTEXT_ID =
  "registry-context";

const CONTEXT_VERSION =
  "registry-context-version";

function reset() {
  storageMap.clear();
  storageMap.set(
    PULSE_INTENT_RECONCILIATION_STORAGE,
    "[]",
  );
}

function makeSemanticObservation(
  options: {
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
    label?: "analytics_sales" | "seo_audit";
  } = {},
) {
  const tenantId =
    options.tenantId ??
    TENANT;

  const contextId =
    options.contextId ??
    CONTEXT_ID;

  const contextVersion =
    options.contextVersion ??
    CONTEXT_VERSION;

  const receipt =
    createPulseInferenceEvidence({
      requestId:
        "registry-request",
      selectionFingerprint:
        "registry-selection",
      selectionModelRef:
        "ollama/qwen3",
      expectedRuntimeModelRef:
        "ollama/qwen3",
      runtimeModelRef:
        "ollama/qwen3",
      provider:
        "ollama",
      status:
        "COMPLETED",
      bindingStatus:
        "MATCH",
      output: {
        answer:
          "registry observation",
      },
    });

  const record =
    createPulseInferenceEvidenceRecord({
      tenantId,
      store: STORE,
      receipt,
    });

  const observation =
    consumePulseInferenceEvidence({
      tenantId,
      purpose:
        "CONTEXT",
      record,
    });

  return projectPulseInferenceSemanticObservation({
    observation,
    context: {
      tenantId,
      contextId,
      contextVersion,
      store: STORE,
      section:
        "dashboard",
    },
    candidate: {
      kind:
        "INTENT_CANDIDATE",
      label:
        options.label ??
        "analytics_sales",
      value:
        "Registry candidate",
      confidence:
        0.91,
    },
  });
}

function makeReconciliationForTenant(
  tenantId: string,
  label:
    | "analytics_sales"
    | "seo_audit" =
    "analytics_sales",
) {
  const context =
    makeSemanticObservation({
      tenantId,
      label,
    });

  const intent =
    classifyPulseIntent({
      q:
        "revisar ventas",
      section:
        "dashboard",
      store:
        STORE,
      tenantId,
      contextId:
        CONTEXT_ID,
      contextVersion:
        CONTEXT_VERSION,
    });

  return reconcilePulseIntent({
    intentClassification:
      intent,
    semanticObservation:
      context,
  });
}

function makeReconciliation(
  label:
    | "analytics_sales"
    | "seo_audit" =
    "analytics_sales",
) {
  return makeReconciliationForTenant(
    TENANT,
    label,
  );
}

test.beforeEach(
  () => {
    reset();
  },
);

test(
  "creates a valid durable reconciliation record",
  () => {
    const reconciliation =
      makeReconciliation();

    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        store: STORE,
        requestId:
          "cycle-request-1",
        reconciliation,
      });

    assert.equal(
      record.contractVersion,
      PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION,
    );

    assert.ok(
      record.recordId.startsWith(
        "pulse-intent-reconciliation:",
      ),
    );

    assert.equal(
      record.tenantId,
      TENANT,
    );

    assert.equal(
      record.relation,
      "AGREEMENT",
    );

    assert.ok(
      record.registryHash,
    );

    assert.equal(
      verifyPulseIntentReconciliationRecord(
        record,
      ),
      true,
    );
  },
);

test(
  "same record is idempotent",
  () => {
    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation:
          makeReconciliation(),
        recordedAt:
          "2026-09-26T00:00:00.000Z",
      });

    const first =
      savePulseIntentReconciliationRecord(
        record,
      );

    const second =
      savePulseIntentReconciliationRecord(
        record,
      );

    assert.deepEqual(
      second,
      first,
    );

    assert.equal(
      listPulseIntentReconciliationRecords({
        tenantId:
          TENANT,
      }).length,
      1,
    );
  },
);

test(
  "conflicting replay of same record id is rejected",
  () => {
    const reconciliation =
      makeReconciliation();

    const first =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation,
        recordedAt:
          "2026-09-26T00:00:00.000Z",
      });

    const conflictingReplay =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation,
        recordedAt:
          "2026-09-26T00:00:01.000Z",
      });

    assert.equal(
      conflictingReplay.recordId,
      first.recordId,
    );

    assert.notEqual(
      conflictingReplay.registryHash,
      first.registryHash,
    );

    savePulseIntentReconciliationRecord(
      first,
    );

    assert.throws(
      () =>
        savePulseIntentReconciliationRecord(
          conflictingReplay,
        ),
      (
        error: unknown,
      ) => {
        assert.ok(
          error instanceof
            PulseIntentReconciliationRegistryError,
        );

        assert.equal(
          error.code,
          "RECONCILIATION_REPLAY_CONFLICT",
        );

        return true;
      },
    );
  },
);

test(
  "tenant isolation prevents cross-tenant retrieval",
  () => {
    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation:
          makeReconciliation(),
      });

    savePulseIntentReconciliationRecord(
      record,
    );

    assert.throws(
      () =>
        getPulseIntentReconciliationRecord({
          tenantId:
            OTHER_TENANT,
          recordId:
            record.recordId,
        }),
      PulseIntentReconciliationRegistryError,
    );

    assert.equal(
      listPulseIntentReconciliationRecords({
        tenantId:
          OTHER_TENANT,
      }).length,
      0,
    );
  },
);

test(
  "listing requires an explicit tenant",
  () => {
    assert.throws(
      () =>
        listPulseIntentReconciliationRecords(
          {} as { tenantId: string },
        ),
      (
        error: unknown,
      ) => {
        assert.ok(
          error instanceof
            PulseIntentReconciliationRegistryError,
        );

        assert.equal(
          error.code,
          "INVALID_TENANT",
        );

        return true;
      },
    );
  },
);

test(
  "tenant containing a null byte is rejected",
  () => {
    assert.throws(
      () =>
        createPulseIntentReconciliationRecord({
          tenantId:
            "tenant-\u0000-invalid",
          reconciliation:
            makeReconciliation(),
        }),
      (
        error: unknown,
      ) => {
        assert.ok(
          error instanceof
            PulseIntentReconciliationRegistryError,
        );

        assert.equal(
          error.code,
          "INVALID_TENANT",
        );

        return true;
      },
    );
  },
);

test(
  "wildcard and global tenants are rejected",
  () => {
    const reconciliation =
      makeReconciliation();

    for (
      const tenantId of [
        "*",
        "global",
      ]
    ) {
      assert.throws(
        () =>
          createPulseIntentReconciliationRecord({
            tenantId,
            reconciliation,
          }),
        (
          error: unknown,
        ) => {
          assert.ok(
            error instanceof
              PulseIntentReconciliationRegistryError,
          );

          assert.equal(
            error.code,
            "WILDCARD_TENANT",
          );

          return true;
        },
      );
    }
  },
);

test(
  "tenant mismatch is rejected",
  () => {
    assert.throws(
      () =>
        createPulseIntentReconciliationRecord({
          tenantId:
            OTHER_TENANT,
          reconciliation:
            makeReconciliation(),
        }),
      (
        error: unknown,
      ) => {
        assert.ok(
          error instanceof
            PulseIntentReconciliationRegistryError,
        );

        assert.equal(
          error.code,
          "TENANT_MISMATCH",
        );

        return true;
      },
    );
  },
);

test(
  "tampering with registry fields invalidates the record",
  () => {
    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation:
          makeReconciliation(),
      });

    const tampered = {
      ...record,
      store:
        "tampered-store",
    };

    assert.equal(
      verifyPulseIntentReconciliationRecord(
        tampered,
      ),
      false,
    );

    storageMap.set(
      PULSE_INTENT_RECONCILIATION_STORAGE,
      JSON.stringify([
        tampered,
      ]),
    );

    assert.throws(
      () =>
        validatePulseIntentReconciliationRegistry(),
      (
        error: unknown,
      ) => {
        assert.ok(
          error instanceof
            PulseIntentReconciliationRegistryError,
        );

        assert.equal(
          error.code,
          "REGISTRY_TAMPERED",
        );

        return true;
      },
    );
  },
);

test(
  "tampering with reconciliation payload invalidates the record",
  () => {
    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation:
          makeReconciliation(),
      });

    const tampered = {
      ...record,
      reconciliation: {
        ...record.reconciliation,
        relation:
          "CONFLICT" as const,
      },
    };

    assert.equal(
      verifyPulseIntentReconciliationRecord(
        tampered,
      ),
      false,
    );
  },
);

test(
  "registry survives JSON serialization and recreation",
  () => {
    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        store:
          STORE,
        requestId:
          "request-recreate",
        reconciliation:
          makeReconciliation(),
        recordedAt:
          "2026-09-26T00:00:00.000Z",
      });

    savePulseIntentReconciliationRecord(
      record,
    );

    const persisted =
      storageMap.get(
        PULSE_INTENT_RECONCILIATION_STORAGE,
      );

    assert.ok(
      persisted,
    );

    const fresh =
      listPulseIntentReconciliationRecords({
        tenantId:
          TENANT,
      });

    assert.equal(
      fresh.length,
      1,
    );

    assert.deepEqual(
      fresh[0],
      record,
    );
  },
);

test(
  "registry validation returns record count",
  () => {
    savePulseIntentReconciliationRecord(
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation:
          makeReconciliation(),
      }),
    );

    savePulseIntentReconciliationRecord(
      createPulseIntentReconciliationRecord({
        tenantId:
          OTHER_TENANT,
        reconciliation:
          makeReconciliationForTenant(
            OTHER_TENANT,
          ),
      }),
    );

    assert.equal(
      validatePulseIntentReconciliationRegistry(),
      2,
    );
  },
);

test(
  "reconciliation authority remains rule engine",
  () => {
    const record =
      createPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        reconciliation:
          makeReconciliation(),
      });

    assert.equal(
      record.reconciliation.authority,
      "RULE_ENGINE",
    );

    assert.equal(
      record.reconciliation.canOverrideIntent,
      false,
    );

    assert.equal(
      record.reconciliation.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      record.reconciliation.canSupportExecution,
      false,
    );
  },
);

test(
  "registry does not change deterministic rule intent",
  () => {
    const agreement =
      makeReconciliation(
        "analytics_sales",
      );

    const conflict =
      makeReconciliation(
        "seo_audit",
      );

    assert.equal(
      agreement.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      conflict.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      agreement.relation,
      "AGREEMENT",
    );

    assert.equal(
      conflict.relation,
      "CONFLICT",
    );
  },
);
