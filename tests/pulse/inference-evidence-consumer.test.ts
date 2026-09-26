import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT,
  consumePulseInferenceEvidence,
  verifyPulseInferenceEvidenceObservation,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceConsumer.ts";

import {
  createPulseInferenceEvidence,
} from "../../src/ai/DigitalBoostPulseInferenceEvidence.ts";

import {
  createPulseInferenceEvidenceRecord,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceRegistry.ts";

function makeRecord(input: {
  tenantId?: string;
  status?: "COMPLETED" | "FAILED";
  bindingStatus?: "MATCH" | "MISMATCH" | "UNAVAILABLE";
  output?: unknown;
    hasOutput?: boolean;
  runtimeModelRef?: string;
  failure?: string;
}) {
  const receipt =
    createPulseInferenceEvidence({
      requestId:
        "req-consumer-001",

      selectionFingerprint:
        "pmi_consumer",

      selectionModelRef:
        "ollama/qwen3",

      expectedRuntimeModelRef:
        "ollama/qwen3",

      runtimeModelRef:
        input.runtimeModelRef ??
        (
          input.bindingStatus ===
          "UNAVAILABLE"
            ? undefined
            : "ollama/qwen3"
        ),

      provider:
        "ollama",

      status:
        input.status ??
        "COMPLETED",

      bindingStatus:
        input.bindingStatus ??
        "MATCH",

      output:
        input.hasOutput === false
          ? undefined
          : (
              input.output === undefined
                ? {
                    answer:
                      "observable",
                  }
                : input.output
            ),

      failure:
        input.failure,
    });

  return createPulseInferenceEvidenceRecord({
    tenantId:
      input.tenantId ??
      "tenant-a",

    store:
      "store-a",

    receipt,
  });
}

test(
  "consumer contract identity is p0.7.2.6",
  () => {
    assert.equal(
      PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT,
      "p0.7.2.6",
    );
  },
);

test(
  "valid completed matching evidence becomes an observation",
  () => {
    const record =
      makeRecord({});

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "CONTEXT",

        record,
      });

    assert.equal(
      observation.decision,
      "ALLOW_OBSERVATION",
    );

    assert.equal(
      observation.consumptionClass,
      "MODEL_OUTPUT_OBSERVATION",
    );

    assert.equal(
      observation.outputPresent,
      true,
    );

    assert.ok(
      observation.outputHash,
    );

    assert.equal(
      verifyPulseInferenceEvidenceObservation(
        observation,
      ),
      true,
    );
  },
);

test(
  "observation preserves runtime identity and binding",
  () => {
    const record =
      makeRecord({});

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "EVALUATION",

        record,
      });

    assert.equal(
      observation.selectionModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      observation.expectedRuntimeModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      observation.runtimeModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      observation.bindingStatus,
      "MATCH",
    );
  },
);

test(
  "failure evidence remains consumable only as failure observation",
  () => {
    const record =
      makeRecord({
        status:
          "FAILED",

        bindingStatus:
          "UNAVAILABLE",

        output:
          undefined,

        failure:
          "MODEL_NOT_FOUND",
      });

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "CONTEXT",

        record,
      });

    assert.equal(
      observation.decision,
      "ALLOW_FAILURE_OBSERVATION",
    );

    assert.equal(
      observation.consumptionClass,
      "INFERENCE_FAILURE_OBSERVATION",
    );

    assert.equal(
      observation.canSupportSemanticClaim,
      false,
    );
  },
);

test(
  "cross-tenant evidence is blocked",
  () => {
    const record =
      makeRecord({
        tenantId:
          "tenant-a",
      });

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-b",

        purpose:
          "CONTEXT",

        record,
      });

    assert.equal(
      observation.decision,
      "BLOCK",
    );

    assert.equal(
      observation.consumptionClass,
      "BLOCKED",
    );
  },
);

test(
  "wildcard tenant is blocked",
  () => {
    const record =
      makeRecord({});

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "*",

        purpose:
          "CONTEXT",

        record,
      });

    assert.equal(
      observation.decision,
      "BLOCK",
    );
  },
);

test(
  "invalid purpose is blocked",
  () => {
    const record =
      makeRecord({});

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "UNKNOWN" as never,

        record,
      });

    assert.equal(
      observation.decision,
      "BLOCK",
    );

    assert.equal(
      observation.consumptionClass,
      "BLOCKED",
    );
  },
);

test(
  "tampered registry record is blocked",
  () => {
    const record =
      makeRecord({});

    const tampered =
      {
        ...record,
        store:
          "other-store",
      };

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "GOAL",

        record:
          tampered,
      });

    assert.equal(
      observation.decision,
      "BLOCK",
    );
  },
);

test(
  "completed evidence without output cannot be consumed as model observation",
  () => {
    const record =
      makeRecord({
        status:
          "COMPLETED",

        bindingStatus:
          "MATCH",

        hasOutput:
          false,
      });

    /*
     * The current P0.7.2.4 creator represents undefined output as
     * outputPresent=false. The consumer must fail closed instead
     * of treating a completed/no-output record as semantic evidence.
     */
    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "PLANNING",

        record,
      });

    assert.equal(
      observation.decision,
      "BLOCK",
    );
  },
);

test(
  "mismatch evidence is never promoted to a model-output observation",
  () => {
    const record =
      makeRecord({
        status:
          "FAILED",

        bindingStatus:
          "MISMATCH",

        runtimeModelRef:
          "ollama/other-model",

        output:
          undefined,

        failure:
          "MODEL_BINDING_MISMATCH",
      });

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "MEMORY",

        record,
      });

    assert.notEqual(
      observation.decision,
      "ALLOW_OBSERVATION",
    );

    assert.notEqual(
      observation.consumptionClass,
      "MODEL_OUTPUT_OBSERVATION",
    );
  },
);

test(
  "consumer never grants execution authority",
  () => {
    const record =
      makeRecord({});

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "PLANNING",

        record,
      });

    const json =
      JSON.stringify(
        observation,
      );

    assert.equal(
      observation.authority,
      "NONE",
    );

    assert.equal(
      observation.canSupportExecution,
      false,
    );

    assert.equal(
      json.includes(
        "executionAttestation",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "approval_id",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "execution_issuer",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "PROVEN",
      ),
      false,
    );

    assert.equal(
      json.includes(
        "ASSURED",
      ),
      false,
    );
  },
);

test(
  "tampering observation fields invalidates observation",
  () => {
    const record =
      makeRecord({});

    const observation =
      consumePulseInferenceEvidence({
        tenantId:
          "tenant-a",

        purpose:
          "CONTEXT",

        record,
      });

    const tampered =
      {
        ...observation,
        outputHash:
          "tampered",
      };

    assert.equal(
      verifyPulseInferenceEvidenceObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "all supported purposes preserve observational-only semantics",
  () => {
    const purposes = [
      "CONTEXT",
      "GOAL",
      "PLANNING",
      "MEMORY",
      "EVALUATION",
    ] as const;

    for (const purpose of purposes) {
      const record =
        makeRecord({
          requestId:
            undefined,
        });

      const observation =
        consumePulseInferenceEvidence({
          tenantId:
            "tenant-a",

          purpose,

          record,
        });

      assert.equal(
        observation.canSupportSemanticClaim,
        false,
      );

      assert.equal(
        observation.canSupportExecution,
        false,
      );

      assert.equal(
        observation.authority,
        "NONE",
      );
    }
  },
);
