import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPulseModelRuntimeBinding,
  PULSE_MODEL_RUNTIME_BINDING_CONTRACT,
  validatePulseModelRuntimeBinding,
} from "../../src/ai/DigitalBoostModelRuntimeBinding.ts";

import {
  createPulseModelSelectionContract,
} from "../../src/ai/DigitalBoostModelIntelligence.ts";

function makeModel(
  provider:
    | "ollama"
    | "openclaw",
  modelId:
    string,
) {
  return {
    provider,
    modelId,
    displayName:
      modelId,
    capabilities: [
      "general",
    ],
    available: true,
    preferredTasks: [],
    fallbackPriority:
      10,
    discoveredAt:
      "2026-01-01T00:00:00.000Z",
  };
}

test(
  "runtime binding contract identity is p0.7.2.3",
  () => {
    assert.equal(
      PULSE_MODEL_RUNTIME_BINDING_CONTRACT,
      "p0.7.2.3",
    );
  },
);

test(
  "Ollama model receives exact runtime binding",
  () => {
    const binding =
      buildPulseModelRuntimeBinding(
        makeModel(
          "ollama",
          "qwen3",
        ),
      );

    assert.deepEqual(
      binding,
      {
        contract:
          PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

        selectionModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/qwen3",

        mode:
          "EXACT",
      },
    );

    assert.equal(
      validatePulseModelRuntimeBinding(
        binding,
      ).valid,
      true,
    );
  },
);

test(
  "OpenClaw model without adapter is UNBOUND",
  () => {
    const binding =
      buildPulseModelRuntimeBinding(
        makeModel(
          "openclaw",
          "tool-model",
        ),
      );

    assert.deepEqual(
      binding,
      {
        contract:
          PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

        selectionModelRef:
          "openclaw/tool-model",

        mode:
          "UNBOUND",
      },
    );

    assert.equal(
      validatePulseModelRuntimeBinding(
        binding,
      ).valid,
      false,
    );
  },
);

test(
  "explicit adapter creates valid cross-runtime binding",
  () => {
    const binding =
      buildPulseModelRuntimeBinding(
        makeModel(
          "openclaw",
          "tool-model",
        ),
        {
          mode:
            "EXPLICIT_ADAPTER",

          runtimeModelRef:
            "ollama/qwen3",

          adapterId:
            "openclaw-local-ollama-v1",
        },
      );

    assert.deepEqual(
      binding,
      {
        contract:
          PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

        selectionModelRef:
          "openclaw/tool-model",

        runtimeModelRef:
          "ollama/qwen3",

        mode:
          "EXPLICIT_ADAPTER",

        adapterId:
          "openclaw-local-ollama-v1",
      },
    );

    assert.equal(
      validatePulseModelRuntimeBinding(
        binding,
      ).valid,
      true,
    );
  },
);

test(
  "explicit adapter without adapter id is invalid",
  () => {
    const binding =
      buildPulseModelRuntimeBinding(
        makeModel(
          "openclaw",
          "tool-model",
        ),
        {
          mode:
            "EXPLICIT_ADAPTER",

          runtimeModelRef:
            "ollama/qwen3",
        },
      );

    const result =
      validatePulseModelRuntimeBinding(
        binding,
      );

    assert.equal(
      result.valid,
      false,
    );

    assert.ok(
      result.errors.includes(
        "ADAPTER_ID_MISSING",
      ),
    );
  },
);

test(
  "EXACT mode rejects different runtime identity",
  () => {
    const result =
      validatePulseModelRuntimeBinding({
        contract:
          PULSE_MODEL_RUNTIME_BINDING_CONTRACT,

        selectionModelRef:
          "ollama/qwen3",

        runtimeModelRef:
          "ollama/other",

        mode:
          "EXACT",
      });

    assert.equal(
      result.valid,
      false,
    );

    assert.ok(
      result.errors.includes(
        "EXACT_BINDING_MISMATCH",
      ),
    );
  },
);

test(
  "runtime binding changes selection fingerprint",
  () => {
    const model =
      makeModel(
        "openclaw",
        "tool-model",
      );

    const profile = {
      contract:
        "p0.7.0" as const,

      task:
        "reason",

      taskKind:
        "reasoning" as const,

      requiredCapabilities:
        [
          "general" as const,
        ],

      risk:
        "L1" as const,

      requireTools:
        false,

      requireStructuredOutput:
        false,
    };

    const first =
      createPulseModelSelectionContract({
        profile,

        rawSelection: {
          model,

          reason:
            "Selected.",

          fallbackUsed:
            false,
        },

        candidates:
          [model],

        runtimeBinding: {
          mode:
            "EXPLICIT_ADAPTER",

          runtimeModelRef:
            "ollama/qwen3",

          adapterId:
            "adapter-a",
        },
      });

    const second =
      createPulseModelSelectionContract({
        profile,

        rawSelection:
          first.rawSelection,

        candidates:
          [model],

        runtimeBinding: {
          mode:
            "EXPLICIT_ADAPTER",

          runtimeModelRef:
            "ollama/llama3.2",

          adapterId:
            "adapter-b",
        },
      });

    assert.notEqual(
      first.fingerprint,
      second.fingerprint,
    );
  },
);
