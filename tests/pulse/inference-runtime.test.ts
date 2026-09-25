import test from "node:test";
import assert from "node:assert/strict";

import {
  createPulseModelSelectionContract,
  type PulseModelSelectionContract,
} from "../../src/ai/DigitalBoostModelIntelligence.ts";

import {
  PULSE_RUNTIME_INFERENCE_CONTRACT,
  createPulseInferenceRuntimeRequest,
  executePulseInference,
  type PulseInferenceRuntimeBridge,
} from "../../src/ai/DigitalBoostPulseInferenceRuntime.ts";

function makeSelection(
  overrides:
    Partial<PulseModelSelectionContract> = {},
):
  PulseModelSelectionContract {
  const model = {
    provider: "ollama" as const,
    modelId: "qwen3",
    displayName: "qwen3",
    capabilities: [
      "general",
      "reasoning",
      "structured",
    ],
    contextWindow:
      32768,
    available: true,
    preferredTasks: [
      "reasoning",
    ],
    fallbackPriority:
      10,
    discoveredAt:
      "2026-01-01T00:00:00.000Z",
  };

  const base =
    createPulseModelSelectionContract({
      profile: {
        contract: "p0.7.0",
        task: "reason",
        taskKind: "reasoning",
        requiredCapabilities: [
          "reasoning",
        ],
        risk: "L1",
        requireTools: false,
        requireStructuredOutput: false,
      },

      rawSelection: {
        model,
        reason:
          "Modelo seleccionado.",
        fallbackUsed: false,
      },

      candidates: [
        model,
      ],
    });

  return {
    ...base,
    ...overrides,
  };
}

function makeRequest() {
  return createPulseInferenceRuntimeRequest({
    requestId:
      "req-p0722-001",

    task:
      "reason",

    prompt:
      "Explicá el contexto.",

    outputMode:
      "TEXT",

    context: {
      source:
        "runtime-test",
    },
  });
}

test(
  "runtime contract identity is p0.7.2.2",
  () => {
    assert.equal(
      PULSE_RUNTIME_INFERENCE_CONTRACT,
      "p0.7.2.2",
    );
  },
);

test(
  "runtime sends selected model with strict binding",
  async () => {
    let received:
      Record<string, unknown> |
      undefined;

    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask(input) {
          received =
            input as unknown as
              Record<string, unknown>;

          return {
            accepted: true,
            status: "completed",
            model:
              "ollama/qwen3",
            result:
              "Respuesta real.",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          makeSelection(),

        request:
          makeRequest(),

        bridge,
      });

    assert.equal(
      received?.model,
      "ollama/qwen3",
    );

    assert.equal(
      received?.strictModelBinding,
      true,
    );

    assert.equal(
      result.status,
      "COMPLETED",
    );

    assert.equal(
      result.modelRef,
      "ollama/qwen3",
    );
  },
);

test(
  "runtime preserves selection fingerprint",
  async () => {
    const selected =
      makeSelection();

    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask() {
          return {
            accepted: true,
            status: "completed",
            model:
              "ollama/qwen3",
            result:
              "Resultado.",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          selected,

        request:
          makeRequest(),

        bridge,
      });

    assert.equal(
      result.selectionFingerprint,
      selected.fingerprint,
    );
  },
);

test(
  "runtime fails closed on different runtime model",
  async () => {
    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask() {
          return {
            accepted: true,
            status: "completed",
            model:
              "ollama/other-model",
            result:
              "Respuesta incorrecta.",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          makeSelection(),

        request:
          makeRequest(),

        bridge,
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
  "runtime preserves MODEL_NOT_FOUND",
  async () => {
    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask() {
          return {
            accepted: false,
            status: "failed",
            error:
              "MODEL_NOT_FOUND",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          makeSelection(),

        request:
          makeRequest(),

        bridge,
      });

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "MODEL_NOT_FOUND",
    );
  },
);

test(
  "runtime blocks contradictory selection evidence",
  async () => {
    const selected =
      makeSelection();

    const contradictory:
      PulseModelSelectionContract = {
      ...selected,

      evidence: {
        ...selected.evidence,

        selectedModelRef:
          "ollama/different-model",
      },
    };

    let executed =
      false;

    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask() {
          executed = true;

          return {
            accepted: true,
            status: "completed",
            model:
              "ollama/qwen3",
            result:
              "No debería ejecutarse.",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          contradictory,

        request:
          makeRequest(),

        bridge,
      });

    assert.equal(
      executed,
      false,
    );

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "MODEL_BINDING_MISMATCH",
    );
  },
);


test(
  "runtime blocks OpenClaw selection without explicit binding",
  async () => {
    const base =
      makeSelection();

    const unboundSelection = {
      ...base,

      rawSelection: {
        ...base.rawSelection,

        model: {
          ...base.rawSelection.model!,
          provider:
            "openclaw" as const,
          modelId:
            "tool-model",
        },
      },

      runtimeBinding: {
        contract:
          "p0.7.2.3" as const,

        selectionModelRef:
          "openclaw/tool-model",

        mode:
          "UNBOUND" as const,
      },
    };

    let executed =
      false;

    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask() {
          executed = true;

          return {
            accepted: true,
            status: "completed",
            model:
              "ollama/qwen3",
            result:
              "No debería ejecutarse.",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          unboundSelection,

        request:
          makeRequest(),

        bridge,
      });

    assert.equal(
      executed,
      false,
    );

    assert.equal(
      result.status,
      "FAILED",
    );

    assert.equal(
      result.failure,
      "MODEL_RUNTIME_BINDING_UNAVAILABLE",
    );
  },
);

test(
  "explicit adapter sends runtime identity",
  async () => {
    const model = {
      provider:
        "openclaw" as const,

      modelId:
        "tool-model",

      displayName:
        "tool-model",

      capabilities: [
        "general",
        "reasoning",
        "structured",
      ] as const,

      contextWindow:
        32768,

      available:
        true,

      preferredTasks: [
        "reasoning",
      ],

      fallbackPriority:
        20,

      discoveredAt:
        "2026-01-01T00:00:00.000Z",
    };

    const adaptedSelection =
      createPulseModelSelectionContract({
        profile: {
          contract:
            "p0.7.0",

          task:
            "reason",

          taskKind:
            "reasoning",

          requiredCapabilities: [
            "reasoning",
          ],

          risk:
            "L1",

          requireTools:
            false,

          requireStructuredOutput:
            false,
        },

        rawSelection: {
          model,

          reason:
            "Explicit runtime adapter selected.",

          fallbackUsed:
            false,
        },

        candidates: [
          model,
        ],

        runtimeBinding: {
          mode:
            "EXPLICIT_ADAPTER",

          runtimeModelRef:
            "ollama/qwen3",

          adapterId:
            "openclaw-local-ollama-v1",
        },
      });

    assert.equal(
      adaptedSelection.evidence.selectedModelRef,
      "openclaw/tool-model",
    );

    assert.equal(
      adaptedSelection.runtimeBinding?.selectionModelRef,
      "openclaw/tool-model",
    );

    assert.equal(
      adaptedSelection.runtimeBinding?.runtimeModelRef,
      "ollama/qwen3",
    );

    let received:
      Record<string, unknown> |
      undefined;

    const bridge:
      PulseInferenceRuntimeBridge = {
        async runTask(input) {
          received =
            input as unknown as
              Record<string, unknown>;

          return {
            accepted:
              true,

            status:
              "completed",

            model:
              "ollama/qwen3",

            result:
              "Resultado adaptado.",
          };
        },
      };

    const result =
      await executePulseInference({
        selection:
          adaptedSelection,

        request:
          makeRequest(),

        bridge,
      });

    assert.equal(
      received?.model,
      "ollama/qwen3",
    );

    assert.equal(
      received?.strictModelBinding,
      true,
    );

    assert.equal(
      result.status,
      "COMPLETED",
    );

    assert.equal(
      result.modelRef,
      "openclaw/tool-model",
    );

    assert.equal(
      result.runtimeModelRef,
      "ollama/qwen3",
    );
  },
);
