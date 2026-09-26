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
  classifyPulseIntent,
  PULSE_INTENT_LABELS,
  type PulseIntentClassification,
} from "../../src/DigitalBoostPulseIntentEngine.ts";

import {
  projectPulseInferenceSemanticObservation,
  type PulseInferenceSemanticCandidateInput,
} from "../../src/ai/DigitalBoostPulseInferenceSemanticBoundary.ts";

import {
  PULSE_INTENT_RECONCILIATION_CONTRACT,
  PULSE_INTENT_RECONCILIATION_SOURCE,
  reconcilePulseIntent,
  verifyPulseIntentReconciliation,
} from "../../src/ai/DigitalBoostPulseIntentReconciliation.ts";

const TENANT =
  "reconcile-test-tenant";

const STORE =
  "IntentTest";

const SECTION =
  "dashboard";

const CONTEXT_ID =
  "ctx_test";

const CONTEXT_VERSION =
  "ctx-v-p051";

function classify(
  q: string,
): PulseIntentClassification {
  return classifyPulseIntent({
    q,
    section: SECTION,
    store: STORE,
    tenantId: TENANT,
    contextId: CONTEXT_ID,
    contextVersion:
      CONTEXT_VERSION,
  });
}

function makeRecord() {
  const receipt =
    createPulseInferenceEvidence({
      requestId:
        "req-reconcile-001",

      selectionFingerprint:
        "pmi_reconcile",

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

  return createPulseInferenceEvidenceRecord({
    tenantId:
      TENANT,

    store:
      STORE,

    receipt,
  });
}

function makeSemantic(
  candidateOverrides:
    Partial<PulseInferenceSemanticCandidateInput> = {},
) {
  const source =
    consumePulseInferenceEvidence({
      tenantId:
        TENANT,

      purpose:
        "CONTEXT",

      record:
        makeRecord(),
    });

  return projectPulseInferenceSemanticObservation({
    observation:
      source,

    context: {
      tenantId:
        TENANT,

      contextId:
        CONTEXT_ID,

      contextVersion:
        CONTEXT_VERSION,

      store:
        STORE,

      section:
        SECTION,
    },

    candidate: {
      kind:
        "INTENT_CANDIDATE",

      label:
        "analytics_sales",

      value:
        "The model hypothesizes that the user is asking about sales.",

      confidence:
        0.91,

      ...candidateOverrides,
    },
  });
}

function reconcile(
  query: string,
  candidateOverrides:
    Partial<PulseInferenceSemanticCandidateInput> = {},
) {
  return reconcilePulseIntent({
    intentClassification:
      classify(query),

    semanticObservation:
      makeSemantic(
        candidateOverrides,
      ),
  });
}

test(
  "contract identity",
  () => {
    assert.equal(
      PULSE_INTENT_RECONCILIATION_CONTRACT,
      "p0.7.2.8-b",
    );

    assert.equal(
      PULSE_INTENT_RECONCILIATION_SOURCE,
      "pulse-intent-reconciliation",
    );
  },
);

test(
  "AGREEMENT when AI candidate matches deterministic primary",
  () => {
    const result =
      reconcile(
        "revisar ventas",
        {
          label:
            "analytics_sales",
        },
      );

    assert.equal(
      result.relation,
      "AGREEMENT",
    );

    assert.equal(
      result.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      result.aiCandidate?.label,
      "analytics_sales",
    );
  },
);

test(
  "CONFLICT when AI candidate contradicts deterministic primary",
  () => {
    const result =
      reconcile(
        "revisar ventas",
        {
          label:
            "seo_audit",
        },
      );

    assert.equal(
      result.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      result.aiCandidate?.label,
      "seo_audit",
    );

    assert.equal(
      result.relation,
      "CONFLICT",
    );
  },
);

test(
  "SUPPLEMENT when deterministic classifier has no known primary",
  () => {
    const result =
      reconcile(
        "zzqxxplm nnqtrv 88291",
        {
          label:
            "analytics_sales",
        },
      );

    assert.equal(
      result.ruleIntent.primary,
      "unknown_request",
    );

    assert.equal(
      result.relation,
      "SUPPLEMENT",
    );

    assert.equal(
      result.aiCandidate?.label,
      "analytics_sales",
    );
  },
);

test(
  "SUPPLEMENT when AI candidate matches deterministic secondary",
  () => {
    const query =
      "revisar ventas y stock";

    const classification =
      classify(query);

    assert.ok(
      classification.secondary.length > 0,
      "expected a deterministic secondary intent",
    );

    const secondary =
      classification.secondary[0];

    assert.ok(
      (
        PULSE_INTENT_LABELS as readonly string[]
      ).includes(secondary),
    );

    const result =
      reconcile(
        query,
        {
          label:
            secondary,
        },
      );

    assert.equal(
      result.relation,
      "SUPPLEMENT",
    );

    assert.equal(
      result.ruleIntent.primary,
      classification.primary,
    );

    assert.equal(
      result.aiCandidate?.label,
      secondary,
    );
  },
);

test(
  "GOAL_CANDIDATE cannot enter Intent reconciliation as an intent",
  () => {
    const result =
      reconcilePulseIntent({
        intentClassification:
          classify(
            "revisar ventas",
          ),

        semanticObservation:
          makeSemantic({
            kind:
              "GOAL_CANDIDATE",

            label:
              "optimize_store_goal",
          }),
      });

    assert.equal(
      result.relation,
      "INSUFFICIENT_EVIDENCE",
    );

    assert.equal(
      result.aiCandidate,
      undefined,
    );
  },
);

test(
  "FACT_HYPOTHESIS cannot enter Intent reconciliation as an intent",
  () => {
    const result =
      reconcilePulseIntent({
        intentClassification:
          classify(
            "revisar ventas",
          ),

        semanticObservation:
          makeSemantic({
            kind:
              "FACT_HYPOTHESIS",

            label:
              "customer_fact",
          }),
      });

    assert.equal(
      result.relation,
      "INSUFFICIENT_EVIDENCE",
    );

    assert.equal(
      result.aiCandidate,
      undefined,
    );
  },
);

test(
  "reconciliation authority remains RULE_ENGINE",
  () => {
    const result =
      reconcile(
        "revisar ventas",
      );

    assert.equal(
      result.authority,
      "RULE_ENGINE",
    );

    assert.equal(
      result.canOverrideIntent,
      false,
    );

    assert.equal(
      result.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      result.canSupportExecution,
      false,
    );
  },
);

test(
  "CONFLICT does not alter deterministic rule intent",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const snapshot =
      JSON.stringify(
        classification,
      );

    const result =
      reconcilePulseIntent({
        intentClassification:
          classification,

        semanticObservation:
          makeSemantic({
            label:
              "seo_audit",
          }),
      });

    assert.equal(
      result.relation,
      "CONFLICT",
    );

    assert.equal(
      result.ruleIntent.primary,
      "analytics_sales",
    );

    assert.equal(
      classification.primary,
      "analytics_sales",
    );

    assert.equal(
      JSON.stringify(
        classification,
      ),
      snapshot,
    );
  },
);

test(
  "deterministic decision is preserved",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const result =
      reconcilePulseIntent({
        intentClassification:
          classification,

        semanticObservation:
          makeSemantic({
            label:
              "seo_audit",
          }),
      });

    assert.equal(
      result.ruleIntent.decision,
      classification.decision,
    );

    assert.equal(
      result.ruleIntent.clarificationRequired,
      classification.clarificationRequired,
    );

    assert.equal(
      result.ruleIntent.multiIntent,
      classification.multiIntent,
    );
  },
);

test(
  "semantic observation must be valid",
  () => {
    const semantic =
      makeSemantic();

    const tampered = {
      ...semantic,
      semanticObservationHash:
        "tampered",
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          classify(
            "revisar ventas",
          ),

        semanticObservation:
          tampered,
      });
    });
  },
);

test(
  "tenant mismatch is rejected",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const tampered = {
      ...classification,
      provenance: {
        ...classification.provenance,
        tenantId:
          "foreign-tenant",
      },
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "contextId mismatch is rejected",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const tampered = {
      ...classification,
      provenance: {
        ...classification.provenance,
        contextId:
          "foreign-context",
      },
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "contextVersion mismatch is rejected",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const tampered = {
      ...classification,
      provenance: {
        ...classification.provenance,
        contextVersion:
          "foreign-context-version",
      },
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "store mismatch is rejected when both sides bind a store",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const tampered = {
      ...classification,
      provenance: {
        ...classification.provenance,
        store:
          "foreign-store",
      },
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "section mismatch is rejected when both sides bind a section",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const tampered = {
      ...classification,
      provenance: {
        ...classification.provenance,
        section:
          "foreign-section",
      },
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "missing tenant provenance is rejected",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const {
      tenantId: _tenant,
      ...provenanceWithoutTenant
    } = classification.provenance;

    const tampered = {
      ...classification,
      provenance:
        provenanceWithoutTenant,
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "missing contextId provenance is rejected",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const {
      contextId: _contextId,
      ...provenanceWithoutContextId
    } = classification.provenance;

    const tampered = {
      ...classification,
      provenance:
        provenanceWithoutContextId,
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "missing contextVersion provenance is rejected",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic();

    const {
      contextVersion: _contextVersion,
      ...provenanceWithoutContextVersion
    } = classification.provenance;

    const tampered = {
      ...classification,
      provenance:
        provenanceWithoutContextVersion,
    };

    assert.throws(() => {
      reconcilePulseIntent({
        intentClassification:
          tampered,

        semanticObservation:
          semantic,
      });
    });
  },
);

test(
  "AI candidate must be a real PulseIntentLabel",
  () => {
    assert.throws(() => {
      reconcile(
        "revisar ventas",
        {
          label:
            "not-a-real-intent",
        },
      );
    });
  },
);

test(
  "deterministic reconciliation identity is stable for the same source observation",
  () => {
    const classification =
      classify(
        "revisar ventas",
      );

    const semantic =
      makeSemantic({
        label:
          "analytics_sales",
      });

    const first =
      reconcilePulseIntent({
        intentClassification:
          classification,

        semanticObservation:
          semantic,
      });

    const second =
      reconcilePulseIntent({
        intentClassification:
          classification,

        semanticObservation:
          semantic,
      });

    assert.equal(
      first.sourceSemanticObservationId,
      second.sourceSemanticObservationId,
    );

    assert.equal(
      first.sourceSemanticObservationHash,
      second.sourceSemanticObservationHash,
    );

    assert.equal(
      first.reconciliationId,
      second.reconciliationId,
    );

    assert.equal(
      first.reconciliationHash,
      second.reconciliationHash,
    );
  },
);

test(
  "candidate mutation changes reconciliation identity",
  () => {
    const original =
      reconcile(
        "revisar ventas",
        {
          label:
            "analytics_sales",
          confidence:
            0.91,
        },
      );

    const mutated =
      reconcile(
        "revisar ventas",
        {
          label:
            "analytics_sales",
          confidence:
            0.62,
        },
      );

    assert.notEqual(
      original.reconciliationHash,
      mutated.reconciliationHash,
    );
  },
);

test(
  "reconciliation verifier detects authority escalation",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      authority:
        "AI" as never,
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "reconciliation verifier detects override escalation",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      canOverrideIntent:
        true,
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "reconciliation verifier detects semantic-claim escalation",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      canSupportSemanticClaim:
        true,
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "reconciliation verifier detects execution escalation",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      canSupportExecution:
        true,
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "reconciliation verifier detects rule primary tampering",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      ruleIntent: {
        ...original.ruleIntent,
        primary:
          "seo_audit",
      },
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "reconciliation verifier detects source binding tampering",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      sourceSemanticObservationId:
        "foreign-observation",
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "reconciliation verifier detects hash tampering",
  () => {
    const original =
      reconcile(
        "revisar ventas",
      );

    const tampered = {
      ...original,
      reconciliationHash:
        "tampered",
    };

    assert.equal(
      verifyPulseIntentReconciliation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "blocked rule intent remains blocked",
  () => {
    const classification =
      classify(
        "mostrar mi contraseña",
      );

    const result =
      reconcilePulseIntent({
        intentClassification:
          classification,

        semanticObservation:
          makeSemantic({
            label:
              "analytics_sales",
          }),
      });

    assert.equal(
      result.ruleIntent.decision,
      classification.decision,
    );

    assert.notEqual(
      result.ruleIntent.decision,
      "ALLOW_CLASSIFICATION",
    );
  },
);

test(
  "clarification state remains controlled by rule engine",
  () => {
    const classification =
      classify(
        "cambiar algo",
      );

    const result =
      reconcilePulseIntent({
        intentClassification:
          classification,

        semanticObservation:
          makeSemantic({
            label:
              "seo_audit",
          }),
      });

    assert.equal(
      result.ruleIntent.decision,
      classification.decision,
    );

    assert.equal(
      result.ruleIntent.clarificationRequired,
      classification.clarificationRequired,
    );
  },
);
