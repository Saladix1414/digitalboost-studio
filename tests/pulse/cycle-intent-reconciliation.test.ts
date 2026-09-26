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
  runCycle,
} from "../../src/DigitalBoostPulseCycle.ts";

import {
  buildPulseGoal,
} from "../../src/DigitalBoostPulseGoalEngine.ts";

import {
  getPulseIntentReconciliationRecord,
  listPulseIntentReconciliationRecords,
  PULSE_INTENT_RECONCILIATION_STORAGE,
} from "../../src/ai/DigitalBoostPulseIntentReconciliationRegistry.ts";

const TENANT =
  "cycle-reconcile-tenant";

const STORE =
  "CycleReconcileStore";

const SECTION =
  "dashboard";

const CONTEXT_ID =
  "ctx-cycle-reconcile";

const storage = new Map<string, string>();

const localStorageMock = {
  getItem(key: string) {
    return storage.has(key)
      ? storage.get(key)!
      : null;
  },

  setItem(
    key: string,
    value: string,
  ) {
    storage.set(
      key,
      String(value),
    );
  },

  removeItem(key: string) {
    storage.delete(key);
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

function resetPersistence() {
  storage.clear();
  storage.set(
    PULSE_INTENT_RECONCILIATION_STORAGE,
    "[]",
  );
  storage.set(
    "db-pulse-audit-v1",
    "[]",
  );
}

function makeSemantic(
  options: {
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
    label?: string;
    value?: string;
    confidence?: number;
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
    "ctx-v-cycle-reconcile";

  const receipt =
    createPulseInferenceEvidence({
      requestId:
        "req-cycle-reconcile",

      selectionFingerprint:
        "pmi-cycle-reconcile",

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
          "semantic observation",
      },
    });

  const record =
    createPulseInferenceEvidenceRecord({
      tenantId,

      store:
        STORE,

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
      store:
        STORE,
      section:
        SECTION,
    },

    candidate: {
      kind:
        "INTENT_CANDIDATE",

      label:
        options.label ??
        "analytics_sales",

      value:
        options.value ??
        "The model hypothesizes a sales intent.",

      confidence:
        options.confidence ??
        0.91,
    },
  });
}

test.beforeEach(() => {
  resetPersistence();
});

function cycleInput(
  extra: Record<string, unknown> = {},
) {
  return {
    q:
      "revisar ventas",

    section:
      SECTION,

    store:
      STORE,

    tenantId:
      TENANT,

    action:
      "analytics",

    title:
      "Review sales",

    body:
      "Review current sales.",

    alreadyConfirm:
      false,

    contextId:
      CONTEXT_ID,

    ...extra,
  };
}

test(
  "cycle remains compatible without semantic observation",
  () => {
    const cycle =
      runCycle(
        cycleInput(),
      );

    assert.ok(
      cycle.intentClassification,
    );

    assert.equal(
      cycle.intentClassification?.primary,
      "analytics_sales",
    );

    assert.equal(
      cycle.intentReconciliation,
      undefined,
    );
  },
);

test(
  "cycle propagates context binding into deterministic intent",
  () => {
    const cycle =
      runCycle(
        cycleInput(),
      );

    assert.equal(
      cycle.intentClassification?.provenance.contextId,
      CONTEXT_ID,
    );

    assert.ok(
      cycle.intentClassification?.provenance.contextVersion,
    );

    assert.equal(
      cycle.intentClassification?.provenance.tenantId,
      TENANT,
    );
  },
);

test(
  "AGREEMENT is attached to cycle without changing rule intent",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    assert.equal(
      cycle.intentClassification?.primary,
      "analytics_sales",
    );

    assert.equal(
      cycle.intentReconciliation?.relation,
      "AGREEMENT",
    );

    assert.equal(
      cycle.intentReconciliation?.authority,
      "RULE_ENGINE",
    );

    assert.equal(
      cycle.intentReconciliation?.canOverrideIntent,
      false,
    );
  },
);

test(
  "semantic reconciliation is persisted with the cycle request binding",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    assert.ok(
      cycle.intentReconciliationRecordId,
    );

    const record =
      getPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        recordId:
          cycle.intentReconciliationRecordId!,
      });

    assert.equal(
      record.tenantId,
      TENANT,
    );

    assert.equal(
      record.store,
      STORE,
    );

    assert.equal(
      record.requestId,
      cycle.request_id,
    );

    assert.equal(
      record.reconciliationId,
      cycle.intentReconciliation?.reconciliationId,
    );

    assert.equal(
      record.relation,
      cycle.intentReconciliation?.relation,
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
  "general audit links reconciliation without execution authority",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    const auditRows =
      JSON.parse(
        storage.get(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    const row =
      auditRows.find(
        (candidate) =>
          candidate.request_id ===
          cycle.request_id,
      );

    assert.ok(row);

    assert.equal(
      row.context_version,
      cycle.intentClassification
        ?.provenance
        .contextVersion,
    );

    assert.match(
      String(
        row.result_summary,
      ),
      /reconciliation=/,
    );

    assert.match(
      String(
        row.result_summary,
      ),
      /relation=AGREEMENT/,
    );

    assert.equal(
      row.execution_issuer,
      undefined,
    );

    assert.equal(
      row.execution_audit_id,
      undefined,
    );

    assert.equal(
      cycle.intentReconciliation?.authority,
      "RULE_ENGINE",
    );

    assert.equal(
      cycle.intentReconciliation?.canSupportExecution,
      false,
    );
  },
);

test(
  "CONFLICT is observable but does not alter Goal or Intent",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,

        label:
          "seo_audit",
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    assert.equal(
      cycle.intentClassification?.primary,
      "analytics_sales",
    );

    assert.equal(
      cycle.intentReconciliation?.relation,
      "CONFLICT",
    );

    assert.equal(
      cycle.intentReconciliation?.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      cycle.plan?.goal.intent,
      "analytics_sales",
    );
  },
);

test(
  "semantic observation context mismatch fails closed",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,

        contextId:
          "foreign-cycle-context",
      });

    assert.throws(() => {
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );
    });
  },
);

test(
  "semantic observation tenant mismatch fails closed",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,

        tenantId:
          "foreign-tenant",
      });

    assert.throws(() => {
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );
    });
  },
);

test(
  "invalid semantic observation cannot enter cycle",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const tampered = {
      ...semantic,
      semanticObservationHash:
        "tampered",
    };

    assert.throws(() => {
      runCycle(
        cycleInput({
          semanticObservation:
            tampered,
        }),
      );
    });
  },
);

test(
  "Goal receives the same deterministic intent classification path",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,

        label:
          "seo_audit",
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    assert.equal(
      cycle.plan?.goal.intent,
      cycle.intentClassification?.primary,
    );
  },
);


test(
  "P0.7.2.11 Goal consumes persisted reconciliation as provenance only",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    const evidence =
      cycle.plan?.goal
        .provenance
        ?.intentReconciliation;

    assert.ok(
      evidence,
    );

    assert.equal(
      evidence?.contract,
      "p0.7.2.11",
    );

    assert.equal(
      evidence?.relation,
      "AGREEMENT",
    );

    assert.equal(
      evidence?.source,
      "pulse-intent-reconciliation-goal",
    );

    assert.ok(
      evidence?.observationId,
    );

    assert.equal(
      cycle.plan?.goal.intent,
      "analytics_sales",
    );

    assert.equal(
      cycle.plan?.goal.decision,
      "ALLOW_GOAL",
    );
  },
);

test(
  "P0.7.2.11 CONFLICT remains observational",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        label:
          "design_hero",
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    assert.equal(
      cycle.intentClassification?.primary,
      "analytics_sales",
    );

    assert.equal(
      cycle.intentReconciliation?.relation,
      "CONFLICT",
    );

    assert.equal(
      cycle.plan?.goal.intent,
      "analytics_sales",
    );

    assert.equal(
      cycle.plan?.goal.decision,
      "ALLOW_GOAL",
    );

    assert.equal(
      cycle.plan?.goal
        .provenance
        ?.intentReconciliation
        ?.relation,
      "CONFLICT",
    );
  },
);

test(
  "P0.7.2.11 tampered registry record is rejected by Goal",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    const record =
      getPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        recordId:
          cycle.intentReconciliationRecordId!,
      });

    const tampered = {
      ...record,
      registryHash:
        "tampered-registry-hash",
    };

    assert.throws(
      () =>
        buildPulseGoal({
          q:
            "revisar ventas",
          action:
            "analytics",
          section:
            SECTION,
          store:
            STORE,
          tenantId:
            TENANT,
          contextId:
            CONTEXT_ID,
          contextVersion:
            cycle.intentClassification
              ?.provenance
              .contextVersion,
          intentClassification:
            cycle.intentClassification,
          intentReconciliationRecord:
            tampered,
        }),
      /Persisted reconciliation record failed registry verification/,
    );
  },
);

test(
  "P0.7.2.11 cross-tenant record is rejected by Goal",
  () => {
    const base =
      runCycle(
        cycleInput(),
      );

    const semantic =
      makeSemantic({
        contextVersion:
          base.intentClassification
            ?.provenance
            .contextVersion,
      });

    const cycle =
      runCycle(
        cycleInput({
          semanticObservation:
            semantic,
        }),
      );

    const record =
      getPulseIntentReconciliationRecord({
        tenantId:
          TENANT,
        recordId:
          cycle.intentReconciliationRecordId!,
      });

    const tampered = {
      ...record,
      tenantId:
        "attacker-tenant",
    };

    assert.throws(
      () =>
        buildPulseGoal({
          q:
            "revisar ventas",
          action:
            "analytics",
          section:
            SECTION,
          store:
            STORE,
          tenantId:
            TENANT,
          contextId:
            CONTEXT_ID,
          contextVersion:
            cycle.intentClassification
              ?.provenance
              .contextVersion,
          intentClassification:
            cycle.intentClassification,
          intentReconciliationRecord:
            tampered,
        }),
      /Persisted reconciliation record failed registry verification|TENANT_MISMATCH/,
    );
  },
);
