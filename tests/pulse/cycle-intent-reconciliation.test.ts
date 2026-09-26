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

const TENANT =
  "cycle-reconcile-tenant";

const STORE =
  "CycleReconcileStore";

const SECTION =
  "dashboard";

const CONTEXT_ID =
  "ctx-cycle-reconcile";

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
