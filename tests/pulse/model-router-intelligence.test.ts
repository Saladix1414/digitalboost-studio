import test from "node:test";
import assert from "node:assert/strict";

import DigitalBoostModelRegistry from "../../src/ai/DigitalBoostModelRegistry.ts";
import DigitalBoostModelRouter from "../../src/ai/DigitalBoostModelRouter.ts";

function createRegistry() {
  const registry =
    new DigitalBoostModelRegistry();

  registry.register({
    provider: "ollama",
    modelId: "qwen3",
    displayName: "qwen3",
    capabilities: [
      "general",
      "content",
      "structured",
      "reasoning",
    ],
    contextWindow: 32768,
    available: true,
    preferredTasks: [
      "content",
      "reasoning",
    ],
    fallbackPriority: 10,
    discoveredAt:
      "2026-01-01T00:00:00.000Z",
  });

  registry.register({
    provider: "ollama",
    modelId: "plain",
    displayName: "plain",
    capabilities: [
      "general",
    ],
    contextWindow: 8192,
    available: true,
    preferredTasks: [
      "content",
    ],
    fallbackPriority: 1,
    discoveredAt:
      "2026-01-01T00:00:00.000Z",
  });

  registry.register({
    provider: "openclaw",
    modelId: "tool-model",
    displayName: "tool-model",
    capabilities: [
      "general",
      "reasoning",
      "structured",
    ],
    contextWindow: 32768,
    available: true,
    preferredTasks: [
      "operator",
      "reasoning",
    ],
    fallbackPriority: 20,
    discoveredAt:
      "2026-01-01T00:00:00.000Z",
  });

  return registry;
}

test(
  "router blocks high-scoring incompatible model",
  () => {
    const router =
      new DigitalBoostModelRouter(
        createRegistry(),
      );

    const result =
      router.select({
        task: "analytics",
        capabilities: [
          "analytics",
        ],
      });

    assert.equal(
      result.model,
      null,
    );

    assert.equal(
      result.fallbackUsed,
      true,
    );
  },
);

test(
  "router selects compatible candidate",
  () => {
    const router =
      new DigitalBoostModelRouter(
        createRegistry(),
      );

    const result =
      router.select({
        task: "content optimization",
        capabilities: [
          "content",
          "structured",
        ],
      });

    assert.ok(result.model);
    assert.equal(
      result.model?.modelId,
      "qwen3",
    );
    assert.equal(
      result.fallbackUsed,
      false,
    );
  },
);

test(
  "preferred provider remains a preference, not a hard requirement",
  () => {
    const router =
      new DigitalBoostModelRouter(
        createRegistry(),
      );

    const result =
      router.selectIntelligent({
        contract: "p0.7.0",
        task: "operator",
        taskKind: "reasoning",
        requiredCapabilities: [
          "reasoning",
        ],
        preferredProvider:
          "ollama",
        risk: "L2",
        requireTools: true,
        requireStructuredOutput: false,
      });

    assert.ok(
      result.rawSelection.model,
    );

    assert.equal(
      result.rawSelection.model?.provider,
      "openclaw",
    );

    assert.equal(
      result.rawSelection.fallbackUsed,
      true,
    );

    assert.equal(
      result.evidence.decision,
      "USE_FALLBACK",
    );
  },
);

test(
  "tool requirement rejects Ollama-only candidates",
  () => {
    const router =
      new DigitalBoostModelRouter(
        createRegistry(),
      );

    const result =
      router.selectIntelligent({
        contract: "p0.7.0",
        task: "operator",
        taskKind: "reasoning",
        requiredCapabilities: [
          "reasoning",
        ],
        risk: "L3",
        requireTools: true,
        requireStructuredOutput: false,
      });

    assert.ok(
      result.rawSelection.model,
    );

    assert.equal(
      result.rawSelection.model?.provider,
      "openclaw",
    );
  },
);

test(
  "selection contract exposes evaluated candidates",
  () => {
    const router =
      new DigitalBoostModelRouter(
        createRegistry(),
      );

    const result =
      router.selectIntelligent({
        contract: "p0.7.0",
        task: "content",
        taskKind: "content",
        requiredCapabilities: [
          "content",
          "structured",
        ],
        risk: "L1",
        requireTools: false,
        requireStructuredOutput: false,
      });

    assert.ok(
      result.evidence.evaluatedCandidates.length >=
        3,
    );

    assert.equal(
      result.evidence.selectedModelRef,
      "ollama/qwen3",
    );

    assert.ok(
      result.evidence.rejectedCandidates.includes(
        "ollama/plain",
      ),
    );
  },
);

test(
  "legacy selectForTask remains compatible",
  () => {
    const router =
      new DigitalBoostModelRouter(
        createRegistry(),
      );

    const result =
      router.selectForTask(
        "reasoning",
        ["reasoning"],
      );

    assert.ok(result.model);
    assert.equal(
      result.model?.modelId,
      "qwen3",
    );
  },
);
