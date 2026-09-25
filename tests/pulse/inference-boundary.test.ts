import test from "node:test";
import assert from "node:assert/strict";

import type {
  OpenClawTaskResult,
} from "../../src/openclaw/DigitalBoostOpenClawBridge.ts";

import {
  PULSE_INFERENCE_CONTRACT,
  assertPulseInferenceModelBinding,
  classifyPulseInferenceBridgeFailure,
  extractPulseInferenceOutput,
  normalizePulseInferenceResult,
} from "../../src/ai/DigitalBoostPulseInference.ts";

function request(overrides = {}) {
  return {
    contract:
      PULSE_INFERENCE_CONTRACT,
    requestId:
      "req-p0720-001",
    modelRef:
      "ollama/qwen3",
    selectionFingerprint:
      "pmi_deadbeef",
    task:
      "reason",
    prompt:
      "Explain this.",
    outputMode:
      "TEXT" as const,
    ...overrides,
  };
}

test(
  "contract identity is p0.7.2.0",
  () => {
    assert.equal(
      PULSE_INFERENCE_CONTRACT,
      "p0.7.2.0",
    );
  },
);

test(
  "exact model binding is accepted",
  () => {
    const result =
      assertPulseInferenceModelBinding({
        requestedModelRef:
          "ollama/qwen3",
        runtimeModelRef:
          "ollama/qwen3",
      });

    assert.equal(
      result.valid,
      true,
    );
  },
);

test(
  "silent runtime model substitution is rejected",
  () => {
    const result =
      assertPulseInferenceModelBinding({
        requestedModelRef:
          "ollama/qwen3",
        runtimeModelRef:
          "ollama/other-model",
      });

    assert.equal(
      result.valid,
      false,
    );

    assert.equal(
      result.error,
      "MODEL_BINDING_MISMATCH",
    );
  },
);

test(
  "empty model binding is rejected",
  () => {
    const result =
      assertPulseInferenceModelBinding({
        requestedModelRef:
          "ollama/qwen3",
        runtimeModelRef:
          "",
      });

    assert.equal(
      result.valid,
      false,
    );
  },
);

test(
  "completed bridge output is extracted",
  () => {
    const bridge:
      OpenClawTaskResult = {
        accepted: true,
        status:
          "completed",
        result:
          "Respuesta real",
      };

    assert.equal(
      extractPulseInferenceOutput(
        bridge,
      ),
      "Respuesta real",
    );
  },
);

test(
  "non-completed bridge result has no output",
  () => {
    const bridge:
      OpenClawTaskResult = {
        accepted: false,
        status:
          "failed",
        error:
          "OpenClaw unavailable",
      };

    assert.equal(
      extractPulseInferenceOutput(
        bridge,
      ),
      undefined,
    );
  },
);

test(
  "timeout is classified",
  () => {
    assert.equal(
      classifyPulseInferenceBridgeFailure({
        accepted: false,
        status: "failed",
        error:
          "OpenClaw inference timeout",
      }),
      "TIMEOUT",
    );
  },
);

test(
  "model-not-found is classified",
  () => {
    assert.equal(
      classifyPulseInferenceBridgeFailure({
        accepted: false,
        status: "failed",
        error:
          "No local Ollama model available through OpenClaw",
      }),
      "MODEL_NOT_FOUND",
    );
  },
);

test(
  "canonical MODEL_NOT_FOUND code is classified",
  () => {
    assert.equal(
      classifyPulseInferenceBridgeFailure({
        accepted: false,
        status: "failed",
        error:
          "MODEL_NOT_FOUND",
      }),
      "MODEL_NOT_FOUND",
    );
  },
);

test(
  "waiting for approval is not treated as completed inference",
  () => {
    assert.equal(
      classifyPulseInferenceBridgeFailure({
        accepted: true,
        status:
          "awaiting_approval",
      }),
      "BRIDGE_REJECTED",
    );
  },
);

test(
  "executing status is treated as protocol mismatch",
  () => {
    assert.equal(
      classifyPulseInferenceBridgeFailure({
        accepted: true,
        status:
          "executing",
      }),
      "BRIDGE_PROTOCOL_ERROR",
    );
  },
);

test(
  "successful inference preserves model provenance",
  () => {
    const result =
      normalizePulseInferenceResult({
        request:
          request(),

        bridgeResult: {
          accepted: true,
          status:
            "completed",
          result:
            "Resultado verificable",
        },

        provider:
          "openclaw",

        runtimeModelRef:
          "ollama/qwen3",

        latencyMs:
          125,
      });

    assert.equal(
      result.status,
      "COMPLETED",
    );

    assert.equal(
      result.modelRef,
      "ollama/qwen3",
    );

    assert.equal(
      result.selectionFingerprint,
      "pmi_deadbeef",
    );

    assert.equal(
      result.output,
      "Resultado verificable",
    );
  },
);

test(
  "model substitution fails closed during normalization",
  () => {
    const result =
      normalizePulseInferenceResult({
        request:
          request(),

        bridgeResult: {
          accepted: true,
          status:
            "completed",
          result:
            "Response from wrong model",
        },

        provider:
          "openclaw",

        runtimeModelRef:
          "ollama/other-model",
      });

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "MODEL_BINDING_MISMATCH",
    );

    assert.equal(
      result.output,
      undefined,
    );
  },
);

test(
  "completed response without output fails closed",
  () => {
    const result =
      normalizePulseInferenceResult({
        request:
          request(),

        bridgeResult: {
          accepted: true,
          status:
            "completed",
        },

        provider:
          "openclaw",

        runtimeModelRef:
          "ollama/qwen3",
      });

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "EMPTY_RESPONSE",
    );
  },
);

test(
  "failed bridge result remains failed",
  () => {
    const result =
      normalizePulseInferenceResult({
        request:
          request(),

        bridgeResult: {
          accepted: false,
          status:
            "failed",
          error:
            "OpenClaw unavailable",
        },

        provider:
          "openclaw",

        runtimeModelRef:
          "ollama/qwen3",
      });

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "BRIDGE_REJECTED",
    );
  },
);
