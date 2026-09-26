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
  classifyPulseIntent,
} from "../../src/DigitalBoostPulseIntentEngine.ts";

import {
  reconcilePulseIntent,
} from "../../src/ai/DigitalBoostPulseIntentReconciliation.ts";

import {
  createPulseIntentReconciliationRecord,
} from "../../src/ai/DigitalBoostPulseIntentReconciliationRegistry.ts";

import {
  consumePulseIntentReconciliation,
  verifyPulseIntentReconciliationObservation,
  PulseIntentReconciliationConsumerError,
} from "../../src/ai/DigitalBoostPulseIntentReconciliationConsumer.ts";

const TENANT =
  "consumer-reconcile-tenant";

const OTHER_TENANT =
  "consumer-other-tenant";

const STORE =
  "ConsumerReconcileStore";

const SECTION =
  "dashboard";

const CONTEXT_ID =
  "consumer-reconcile-context";

const CONTEXT_VERSION =
  "consumer-reconcile-context-version";

type CandidateLabel =
  | "analytics_sales"
  | "seo_audit";

function makeReconciliation(
  options: {
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
    label?: CandidateLabel;
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
        "consumer-reconcile-request",

      selectionFingerprint:
        "consumer-reconcile-selection",

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
          "consumer reconciliation",
      },
    });

  const evidence =
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
      record:
        evidence,
    });

  const semantic =
    projectPulseInferenceSemanticObservation({
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
          "consumer reconciliation candidate",

        confidence:
          0.91,
      },
    });

  const intent =
    classifyPulseIntent({
      q:
        "revisar ventas",

      section:
        SECTION,

      store:
        STORE,

      tenantId,

      contextId,

      contextVersion,
    });

  return reconcilePulseIntent({
    intentClassification:
      intent,

    semanticObservation:
      semantic,
  });
}

function makeRecord(
  options: {
    tenantId?: string;
    contextId?: string;
    contextVersion?: string;
    label?: CandidateLabel;
  } = {},
) {
  const tenantId =
    options.tenantId ??
    TENANT;

  return createPulseIntentReconciliationRecord({
    tenantId,

    store:
      STORE,

    requestId:
      "consumer-cycle-request",

    reconciliation:
      makeReconciliation({
        ...options,
        tenantId,
      }),

    recordedAt:
      "2026-09-26T00:00:00.000Z",
  });
}

function expectConsumerError(
  callback: () => unknown,
  code:
    PulseIntentReconciliationConsumerError["code"],
) {
  assert.throws(
    callback,
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseIntentReconciliationConsumerError,
      );

      assert.equal(
        error.code,
        code,
      );

      return true;
    },
  );
}

test(
  "valid persisted reconciliation becomes observational",
  () => {
    const record =
      makeRecord();

    const observation =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "GOAL",
      });

    assert.equal(
      observation.contract,
      "p0.7.2.10",
    );

    assert.equal(
      observation.decision,
      "ALLOW_OBSERVATION",
    );

    assert.equal(
      observation.consumptionClass,
      "RECONCILIATION_OBSERVATION",
    );

    assert.equal(
      observation.authority,
      "RULE_ENGINE",
    );

    assert.equal(
      observation.canOverrideIntent,
      false,
    );

    assert.equal(
      observation.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      observation.canSupportExecution,
      false,
    );

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        observation,
      ),
      true,
    );
  },
);

test(
  "supported purposes remain observational only",
  () => {
    const record =
      makeRecord();

    for (
      const purpose of [
        "GOAL",
        "PLANNING",
        "EVALUATION",
      ] as const
    ) {
      const observation =
        consumePulseIntentReconciliation({
          tenantId:
            TENANT,
          record,
          purpose,
        });

      assert.equal(
        observation.decision,
        "ALLOW_OBSERVATION",
      );

      assert.equal(
        observation.authority,
        "RULE_ENGINE",
      );

      assert.equal(
        observation.canSupportExecution,
        false,
      );

      assert.equal(
        verifyPulseIntentReconciliationObservation(
          observation,
        ),
        true,
      );
    }
  },
);

test(
  "reconciliation relation does not override deterministic rule intent",
  () => {
    const agreement =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,

        record:
          makeRecord({
            label:
              "analytics_sales",
          }),

        purpose:
          "GOAL",
      });

    const conflict =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,

        record:
          makeRecord({
            label:
              "seo_audit",
          }),

        purpose:
          "PLANNING",
      });

    assert.equal(
      agreement.relation,
      "AGREEMENT",
    );

    assert.equal(
      conflict.relation,
      "CONFLICT",
    );

    assert.equal(
      agreement.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      conflict.ruleIntent.primary,
      "analytics_sales",
    );
  },
);

test(
  "cross-tenant consumption is rejected",
  () => {
    const record =
      makeRecord();

    expectConsumerError(
      () =>
        consumePulseIntentReconciliation({
          tenantId:
            OTHER_TENANT,
          record,
          purpose:
            "GOAL",
        }),
      "TENANT_MISMATCH",
    );
  },
);

test(
  "wildcard/global/null tenants are rejected",
  () => {
    const record =
      makeRecord();

    for (
      const tenantId of [
        "*",
        "global",
        "all",
        "tenant-\u0000-invalid",
      ]
    ) {
      expectConsumerError(
        () =>
          consumePulseIntentReconciliation({
            tenantId,
            record,
            purpose:
              "GOAL",
          }),
        "INVALID_TENANT",
      );
    }
  },
);

test(
  "unsupported purpose is rejected",
  () => {
    const record =
      makeRecord();

    expectConsumerError(
      () =>
        consumePulseIntentReconciliation({
          tenantId:
            TENANT,
          record,
          purpose:
            "MEMORY" as never,
        }),
      "INVALID_PURPOSE",
    );
  },
);

test(
  "tampered registry hash is rejected",
  () => {
    const record =
      makeRecord();

    const tampered = {
      ...record,
      registryHash:
        "tampered-registry-hash",
    };

    expectConsumerError(
      () =>
        consumePulseIntentReconciliation({
          tenantId:
            TENANT,
          record:
            tampered,
          purpose:
            "GOAL",
        }),
      "INVALID_RECORD",
    );
  },
);

test(
  "tampered reconciliation authority is rejected",
  () => {
    const record =
      makeRecord();

    const tampered = {
      ...record,

      reconciliation: {
        ...record.reconciliation,

        authority:
          "AI" as never,
      },
    };

    expectConsumerError(
      () =>
        consumePulseIntentReconciliation({
          tenantId:
            TENANT,
          record:
            tampered,
          purpose:
            "GOAL",
        }),
      "INVALID_RECORD",
    );
  },
);

test(
  "tampered execution capability is rejected",
  () => {
    const record =
      makeRecord();

    const tampered = {
      ...record,

      reconciliation: {
        ...record.reconciliation,

        canSupportExecution:
          true as never,
      },
    };

    expectConsumerError(
      () =>
        consumePulseIntentReconciliation({
          tenantId:
            TENANT,
          record:
            tampered,
          purpose:
            "PLANNING",
        }),
      "INVALID_RECORD",
    );
  },
);

test(
  "tampered context binding is rejected",
  () => {
    const record =
      makeRecord();

    const tampered = {
      ...record,

      contextVersion:
        "foreign-context-version",
    };

    expectConsumerError(
      () =>
        consumePulseIntentReconciliation({
          tenantId:
            TENANT,
          record:
            tampered,
          purpose:
            "EVALUATION",
        }),
      "INVALID_RECORD",
    );
  },
);

test(
  "observation identity is deterministic for the same record and purpose",
  () => {
    const record =
      makeRecord();

    const first =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "GOAL",
      });

    const second =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "GOAL",
      });

    assert.equal(
      first.observationId,
      second.observationId,
    );

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        first,
      ),
      true,
    );

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        second,
      ),
      true,
    );
  },
);

test(
  "observation identity changes with purpose",
  () => {
    const record =
      makeRecord();

    const goal =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "GOAL",
      });

    const planning =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "PLANNING",
      });

    assert.notEqual(
      goal.observationId,
      planning.observationId,
    );
  },
);

test(
  "observer cannot escalate authority",
  () => {
    const record =
      makeRecord();

    const observation =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "EVALUATION",
      });

    const authorityEscalation = {
      ...observation,
      authority:
        "AI" as never,
    };

    const overrideEscalation = {
      ...observation,
      canOverrideIntent:
        true as never,
    };

    const semanticEscalation = {
      ...observation,
      canSupportSemanticClaim:
        true as never,
    };

    const executionEscalation = {
      ...observation,
      canSupportExecution:
        true as never,
    };

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        authorityEscalation,
      ),
      false,
    );

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        overrideEscalation,
      ),
      false,
    );

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        semanticEscalation,
      ),
      false,
    );

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        executionEscalation,
      ),
      false,
    );
  },
);

test(
  "tampering with consumed relation invalidates observation",
  () => {
    const record =
      makeRecord();

    const observation =
      consumePulseIntentReconciliation({
        tenantId:
          TENANT,
        record,
        purpose:
          "GOAL",
      });

    const tampered = {
      ...observation,
      relation:
        "CONFLICT" as never,
    };

    assert.equal(
      verifyPulseIntentReconciliationObservation(
        tampered,
      ),
      false,
    );
  },
);
