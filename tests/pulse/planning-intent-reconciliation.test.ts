import test from "node:test";
import assert from "node:assert/strict";

import {
  runCycle,
} from "../../src/DigitalBoostPulseCycle.ts";

import {
  buildPulseGoal,
} from "../../src/DigitalBoostPulseGoalEngine.ts";

import {
  preparePulsePlan,
} from "../../src/DigitalBoostPulsePlanningEngine.ts";

import {
  getPulseIntentReconciliationRecord,
  PULSE_INTENT_RECONCILIATION_STORAGE,
} from "../../src/ai/DigitalBoostPulseIntentReconciliationRegistry.ts";

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

const TENANT =
  "planning-reconcile-tenant";

const STORE =
  "PlanningReconcileStore";

const SECTION =
  "dashboard";

const CONTEXT_ID =
  "ctx-planning-reconcile";

const CONTEXT_VERSION =
  "ctx-v-planning-reconcile";

const storage =
  new Map<string, string>();

const localStorageMock = {
  getItem(
    key: string,
  ) {
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

  removeItem(
    key: string,
  ) {
    storage.delete(key);
  },
};

Object.defineProperty(
  globalThis,
  "localStorage",
  {
    value:
      localStorageMock,
    configurable:
      true,
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
  label =
    "analytics_sales",
  contextVersion =
    CONTEXT_VERSION,
) {
  const receipt =
    createPulseInferenceEvidence({
      requestId:
        "req-planning-reconcile",

      selectionFingerprint:
        "pmi-planning-reconcile",

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
          "planning semantic observation",
      },
    });

  const record =
    createPulseInferenceEvidenceRecord({
      tenantId:
        TENANT,

      store:
        STORE,

      receipt,
    });

  const observation =
    consumePulseInferenceEvidence({
      tenantId:
        TENANT,

      purpose:
        "CONTEXT",

      record,
    });

  return projectPulseInferenceSemanticObservation({
    observation,

    context: {
      tenantId:
        TENANT,

      contextId:
        CONTEXT_ID,

      contextVersion,

      store:
        STORE,

      section:
        SECTION,
    },

    candidate: {
      kind:
        "INTENT_CANDIDATE",

      label,

      value:
        "Planning candidate",

      confidence:
        0.91,
    },
  });
}

function cycleFor(
  label =
    "analytics_sales",
) {
  const base =
    runCycle({
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
    });

  const contextVersion =
    base.intentClassification
      ?.provenance
      .contextVersion;

  if (!contextVersion) {
    throw new Error(
      "TEST_CONTEXT_VERSION_MISSING",
    );
  }

  return runCycle({
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

    semanticObservation:
      makeSemantic(
        label,
        contextVersion,
      ),
  });
}

function goalFromCycle(
  cycle: ReturnType<
    typeof cycleFor
  >,
) {
  const record =
    getPulseIntentReconciliationRecord({
      tenantId:
        TENANT,

      recordId:
        cycle.intentReconciliationRecordId!,
    });

  const result =
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
        record,
    });

  return {
    goal:
      result.goal,

    record,
  };
}

function makePlan(
  goal: ReturnType<
    typeof buildPulseGoal
  >["goal"],
) {
  return {
    id:
      "planning-test-plan",

    goal,

    steps: [
      {
        id:
          "step-inspect",

        action:
          "analyze",

        title:
          "Inspect",

        dependsOn:
          [],

        expected: {
          inspected:
            true,
        },

        checkpoint:
          false,

        approvalLikely:
          false,
      },

      {
        id:
          "step-propose",

        action:
          "analytics",

        title:
          "Propose",

        dependsOn:
          ["step-inspect"],

        expected: {
          proposed:
            true,
        },

        checkpoint:
          false,

        approvalLikely:
          false,
      },

      {
        id:
          "step-verify",

        action:
          "explain",

        title:
          "Verify",

        dependsOn:
          ["step-propose"],

        expected: {
          verified:
            true,
        },

        checkpoint:
          true,

        approvalLikely:
          false,
      },
    ],

    status:
      "READY" as const,

    createdAt:
      "2026-09-26T00:00:00.000Z",
  };
}

test.beforeEach(
  () => {
    resetPersistence();
  },
);

test(
  "P0.7.2.12 planning consumes persisted reconciliation as observation",
  () => {
    const cycle =
      cycleFor();

    const {
      goal,
    } = goalFromCycle(
      cycle,
    );

    const result =
      preparePulsePlan({
        plan:
          makePlan(goal),
      });

    const evidence =
      result.plan
        .planningProvenance
        ?.intentReconciliation;

    assert.ok(
      evidence,
    );

    assert.equal(
      evidence?.contract,
      "p0.7.2.12",
    );

    assert.equal(
      evidence?.source,
      "pulse-intent-reconciliation-planning",
    );

    assert.equal(
      evidence?.relation,
      "AGREEMENT",
    );

    assert.ok(
      evidence?.observationId,
    );

    assert.equal(
      result.decision,
      "ALLOW_PLAN",
    );
  },
);

test(
  "P0.7.2.12 CONFLICT remains observational",
  () => {
    const cycle =
      cycleFor(
        "seo_audit",
      );

    const {
      goal,
    } = goalFromCycle(
      cycle,
    );

    const result =
      preparePulsePlan({
        plan:
          makePlan(goal),
      });

    const evidence =
      result.plan
        .planningProvenance
        ?.intentReconciliation;

    assert.equal(
      evidence?.relation,
      "CONFLICT",
    );

    assert.equal(
      result.plan.goal.intent,
      "analytics_sales",
    );

    assert.equal(
      result.decision,
      "ALLOW_PLAN",
    );
  },
);

test(
  "P0.7.2.12 deterministic re-preparation preserves planning identity",
  () => {
    const cycle =
      cycleFor();

    const {
      goal,
    } = goalFromCycle(
      cycle,
    );

    const first =
      preparePulsePlan({
        plan:
          makePlan(goal),
      }).plan;

    const second =
      preparePulsePlan({
        plan:
          makePlan(goal),
      }).plan;

    assert.equal(
      first.planFingerprint,
      second.planFingerprint,
    );

    assert.deepEqual(
      first.planningProvenance
        ?.intentReconciliation,
      second.planningProvenance
        ?.intentReconciliation,
    );
  },
);

test(
  "P0.7.2.12 missing persisted reconciliation fails closed",
  () => {
    const cycle =
      cycleFor();

    const {
      goal,
      record,
    } = goalFromCycle(
      cycle,
    );

    const missingGoal = {
      ...goal,

      provenance: {
        ...goal.provenance!,

        intentReconciliation: {
          ...goal.provenance!
            .intentReconciliation!,

          recordId:
            record.recordId +
            "-missing",
        },
      },
    };

    assert.throws(
      () =>
        preparePulsePlan({
          plan:
            makePlan(
              missingGoal,
            ),
        }),
    );
  },
);

test(
  "P0.7.2.12 tampered registry record fails closed",
  () => {
    const cycle =
      cycleFor();

    const {
      goal,
      record,
    } = goalFromCycle(
      cycle,
    );

    storage.set(
      PULSE_INTENT_RECONCILIATION_STORAGE,
      JSON.stringify([
        {
          ...record,

          registryHash:
            "tampered-registry-hash",
        },
      ]),
    );

    assert.throws(
      () =>
        preparePulsePlan({
          plan:
            makePlan(goal),
        }),
    );
  },
);

test(
  "P0.7.2.12 tenant drift cannot recover reconciliation",
  () => {
    const cycle =
      cycleFor();

    const {
      goal,
    } = goalFromCycle(
      cycle,
    );

    const foreignGoal = {
      ...goal,

      tenantId:
        "foreign-planning-tenant",
    };

    assert.throws(
      () =>
        preparePulsePlan({
          plan:
            makePlan(
              foreignGoal,
            ),
        }),
    );
  },
);
