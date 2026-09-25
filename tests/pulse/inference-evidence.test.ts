import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_INFERENCE_EVIDENCE_CONTRACT,
  createPulseInferenceEvidence,
  verifyPulseInferenceEvidence,
} from "../../src/ai/DigitalBoostPulseInferenceEvidence.ts";

import {
  PULSE_INFERENCE_CONTRACT,
  normalizePulseInferenceResult,
} from "../../src/ai/DigitalBoostPulseInference.ts";

test(
  "evidence contract identity is p0.7.2.4",
  () => {
    assert.equal(
      PULSE_INFERENCE_EVIDENCE_CONTRACT,
      "p0.7.2.4",
    );
  },
);

test(
  "completed inference evidence records exact runtime binding",
  () => {
    const receipt =
      createPulseInferenceEvidence({
        requestId:
          "req-evidence-001",

        selectionFingerprint:
          "pmi_abcd1234",

        selectionModelRef:
          "ollama/qwen3",

        expectedRuntimeModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/qwen3",

        provider:
          "openclaw",

        status:
          "COMPLETED",

        bindingStatus:
          "MATCH",

        output:
          "Respuesta verificable.",
      });

    assert.equal(
      receipt.contract,
      PULSE_INFERENCE_EVIDENCE_CONTRACT,
    );

    assert.equal(
      receipt.selectionModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      receipt.expectedRuntimeModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      receipt.runtimeModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      receipt.bindingStatus,
      "MATCH",
    );

    assert.equal(
      receipt.outputPresent,
      true,
    );

    assert.ok(
      receipt.outputHash,
    );

    assert.ok(
      receipt.evidenceHash,
    );

    assert.equal(
      verifyPulseInferenceEvidence(
        receipt,
      ),
      true,
    );
  },
);

test(
  "evidence detects runtime binding mismatch",
  () => {
    const receipt =
      createPulseInferenceEvidence({
        requestId:
          "req-evidence-002",

        selectionFingerprint:
          "pmi_abcd5678",

        selectionModelRef:
          "openclaw/tool-model",

        expectedRuntimeModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/other-model",

        provider:
          "openclaw",

        status:
          "FAILED",

        bindingStatus:
          "MISMATCH",

        error:
          "Runtime model does not match.",
      });

    assert.equal(
      receipt.bindingStatus,
      "MISMATCH",
    );

    assert.equal(
      verifyPulseInferenceEvidence(
        receipt,
      ),
      true,
    );
  },
);

test(
  "unavailable runtime evidence cannot claim a runtime model",
  () => {
    const receipt =
      createPulseInferenceEvidence({
        requestId:
          "req-evidence-003",

        selectionFingerprint:
          "pmi_unavailable",

        selectionModelRef:
          "openclaw/tool-model",

        expectedRuntimeModelRef:
          "ollama/qwen3",

        provider:
          "openclaw",

        status:
          "FAILED",

        bindingStatus:
          "UNAVAILABLE",

        failure:
          "MODEL_NOT_FOUND",
      });

    assert.equal(
      receipt.runtimeModelRef,
      undefined,
    );

    assert.equal(
      receipt.bindingStatus,
      "UNAVAILABLE",
    );

    assert.equal(
      verifyPulseInferenceEvidence(
        receipt,
      ),
      true,
    );
  },
);

test(
  "tampering with evidence fields invalidates evidence hash",
  () => {
    const receipt =
      createPulseInferenceEvidence({
        requestId:
          "req-evidence-004",

        selectionFingerprint:
          "pmi_tamper",

        selectionModelRef:
          "ollama/qwen3",

        expectedRuntimeModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/qwen3",

        provider:
          "openclaw",

        status:
          "COMPLETED",

        bindingStatus:
          "MATCH",

        output:
          "Original output.",
      });

    const tampered = {
      ...receipt,

      selectionFingerprint:
        "pmi_attacker",
    };

    assert.equal(
      verifyPulseInferenceEvidence(
        tampered,
      ),
      false,
    );
  },
);

test(
  "tampering with output hash invalidates evidence",
  () => {
    const receipt =
      createPulseInferenceEvidence({
        requestId:
          "req-evidence-005",

        selectionFingerprint:
          "pmi_output",

        selectionModelRef:
          "ollama/qwen3",

        expectedRuntimeModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/qwen3",

        provider:
          "openclaw",

        status:
          "COMPLETED",

        bindingStatus:
          "MATCH",

        output:
          "Original output.",
      });

    const tampered = {
      ...receipt,

      outputHash:
        "fnv1a_fake",
    };

    assert.equal(
      verifyPulseInferenceEvidence(
        tampered,
      ),
      false,
    );
  },
);

test(
  "normalize result produces evidence for successful inference",
  () => {
    const result =
      normalizePulseInferenceResult({
        request: {
          contract:
            PULSE_INFERENCE_CONTRACT,

          requestId:
            "req-evidence-006",

          modelRef:
            "ollama/qwen3",

          expectedRuntimeModelRef:
            "ollama/qwen3",

          selectionFingerprint:
            "pmi_success",

          task:
            "reason",

          prompt:
            "Explicá.",

          outputMode:
            "TEXT",
        },

        bridgeResult: {
          accepted:
            true,

          status:
            "completed",

          model:
            "ollama/qwen3",

          result:
            "Resultado correcto.",
        },

        provider:
          "openclaw",

        runtimeModelRef:
          "ollama/qwen3",

        latencyMs:
          25,
      });

    assert.equal(
      result.status,
      "COMPLETED",
    );

    assert.ok(
      result.evidence,
    );

    assert.equal(
      result.evidence?.bindingStatus,
      "MATCH",
    );

    assert.equal(
      result.evidence?.outputPresent,
      true,
    );

    assert.equal(
      result.evidence?.runtimeModelRef,
      "ollama/qwen3",
    );

    assert.equal(
      verifyPulseInferenceEvidence(
        result.evidence!,
      ),
      true,
    );
  },
);

test(
  "normalize result preserves MODEL_NOT_FOUND evidence",
  () => {
    const result =
      normalizePulseInferenceResult({
        request: {
          contract:
            PULSE_INFERENCE_CONTRACT,

          requestId:
            "req-evidence-007",

          modelRef:
            "ollama/qwen3",

          expectedRuntimeModelRef:
            "ollama/qwen3",

          selectionFingerprint:
            "pmi_notfound",

          task:
            "reason",

          prompt:
            "Explicá.",

          outputMode:
            "TEXT",
        },

        bridgeResult: {
          accepted:
            false,

          status:
            "failed",

          error:
            "MODEL_NOT_FOUND",
        },

        provider:
          "openclaw",

        runtimeModelRef:
          "",

        latencyMs:
          10,
      });

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "MODEL_NOT_FOUND",
    );

    assert.ok(
      result.evidence,
    );

    assert.equal(
      result.evidence?.bindingStatus,
      "UNAVAILABLE",
    );

    assert.equal(
      result.evidence?.failure,
      "MODEL_NOT_FOUND",
    );

    assert.equal(
      verifyPulseInferenceEvidence(
        result.evidence!,
      ),
      true,
    );
  },
);

test(
  "evidence is observational and does not contain authority escalation",
  () => {
    const receipt =
      createPulseInferenceEvidence({
        requestId:
          "req-evidence-008",

        selectionFingerprint:
          "pmi_authority",

        selectionModelRef:
          "ollama/qwen3",

        expectedRuntimeModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/qwen3",

        provider:
          "openclaw",

        status:
          "COMPLETED",

        bindingStatus:
          "MATCH",

        output:
          "Resultado.",
      });

    const keys =
      Object.keys(
        receipt,
      );

    assert.equal(
      keys.includes(
        "executionAttestation",
      ),
      false,
    );

    assert.equal(
      keys.includes(
        "approval",
      ),
      false,
    );

    assert.equal(
      keys.includes(
        "policyMutation",
      ),
      false,
    );

    assert.equal(
      verifyPulseInferenceEvidence(
        receipt,
      ),
      true,
    );
  },
);
