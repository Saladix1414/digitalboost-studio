import test from "node:test";
import assert from "node:assert/strict";

import type {
  DigitalBoostModel,
  ModelSelectionResult,
} from "../../src/types/DigitalBoostAI.ts";

import {
  PULSE_MODEL_INTELLIGENCE_CONTRACT,
  normalizePulseModelTaskProfile,
  evaluatePulseModelCandidate,
  validatePulseModelSelection,
  buildPulseModelSelectionEvidence,
  fingerprintPulseModelSelection,
  classifyPulseModelFailure,
  createPulseModelSelectionContract,
  toLegacyModelSelectionRequest,
} from "../../src/ai/DigitalBoostModelIntelligence.ts";

function makeModel(
  overrides: Partial<DigitalBoostModel> = {},
): DigitalBoostModel {
  return {
    provider: "ollama",
    modelId: "qwen3",
    displayName: "qwen3",
    capabilities: [
      "general",
      "structured",
      "transformation",
      "products",
      "seo",
      "content",
      "conversation",
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
    ...overrides,
  };
}

test("P0.7.0 contract identity", () => {
  assert.equal(
    PULSE_MODEL_INTELLIGENCE_CONTRACT,
    "p0.7.0",
  );
});

test("task profile normalization is deterministic", () => {
  const a =
    normalizePulseModelTaskProfile({
      task: "  content   optimization ",
      requiredCapabilities: [
        "structured",
        "content",
        "structured",
      ],
      risk: "L1",
    });

  const b =
    normalizePulseModelTaskProfile({
      task: "content optimization",
      requiredCapabilities: [
        "content",
        "structured",
      ],
      risk: "L1",
    });

  assert.deepEqual(a, b);
});

test("missing capability blocks model", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "analytics",
      requiredCapabilities: [
        "analytics",
        "structured",
      ],
    });

  const result =
    evaluatePulseModelCandidate(
      profile,
      makeModel({
        capabilities: [
          "general",
          "structured",
        ],
      }),
    );

  assert.equal(result.eligible, false);
  assert.ok(
    result.reasons.includes(
      "MISSING_REQUIRED_CAPABILITIES",
    ),
  );

  const validation =
    validatePulseModelSelection(
      profile,
      makeModel({
        capabilities: [
          "general",
          "structured",
        ],
      }),
    );

  assert.equal(validation.valid, false);
});

test("tool requirement fails closed for Ollama", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "operator",
      requireTools: true,
    });

  const result =
    evaluatePulseModelCandidate(
      profile,
      makeModel({
        provider: "ollama",
      }),
    );

  assert.equal(
    result.toolsCompatible,
    false,
  );

  assert.equal(
    result.eligible,
    false,
  );
});

test("OpenClaw satisfies current tool boundary", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "operator",
      requireTools: true,
    });

  const result =
    evaluatePulseModelCandidate(
      profile,
      makeModel({
        provider: "openclaw",
      }),
    );

  assert.equal(
    result.toolsCompatible,
    true,
  );

  assert.equal(
    result.eligible,
    true,
  );
});

test("minimum context window is enforced", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "large-context reasoning",
      minimumContextWindow: 65536,
    });

  const result =
    evaluatePulseModelCandidate(
      profile,
      makeModel({
        contextWindow: 32768,
      }),
    );

  assert.equal(
    result.contextWindowCompatible,
    false,
  );

  assert.equal(
    result.eligible,
    false,
  );
});

test("provider preference is evidence, not authority", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "content",
      preferredProvider: "openclaw",
    });

  const result =
    evaluatePulseModelCandidate(
      profile,
      makeModel({
        provider: "ollama",
      }),
    );

  assert.equal(
    result.providerMatch,
    false,
  );

  assert.equal(
    result.eligible,
    true,
  );

  assert.ok(
    result.reasons.includes(
      "PREFERRED_PROVIDER_MISMATCH",
    ),
  );
});

test("selection evidence separates eligible and rejected candidates", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "content",
      requiredCapabilities: [
        "content",
        "structured",
      ],
    });

  const good =
    makeModel({
      modelId: "qwen3",
    });

  const bad =
    makeModel({
      modelId: "plain",
      capabilities: ["general"],
    });

  const raw: ModelSelectionResult = {
    model: good,
    reason: "legacy router selection",
    fallbackUsed: false,
  };

  const evidence =
    buildPulseModelSelectionEvidence(
      profile,
      raw,
      [good, bad],
    );

  assert.deepEqual(
    evidence.eligibleCandidates,
    ["ollama/qwen3"],
  );

  assert.deepEqual(
    evidence.rejectedCandidates,
    ["ollama/plain"],
  );

  assert.equal(
    evidence.selectedModelRef,
    "ollama/qwen3",
  );

  assert.equal(
    evidence.decision,
    "ALLOW_MODEL",
  );
});

test("invalid selection becomes BLOCK_MODEL", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "analytics",
      requiredCapabilities: [
        "analytics",
      ],
    });

  const bad =
    makeModel({
      modelId: "plain",
      capabilities: ["general"],
    });

  const raw: ModelSelectionResult = {
    model: bad,
    reason: "legacy router selection",
    fallbackUsed: false,
  };

  const contract =
    createPulseModelSelectionContract({
      profile,
      rawSelection: raw,
      candidates: [bad],
    });

  assert.equal(
    contract.evidence.decision,
    "BLOCK_MODEL",
  );

  assert.match(
    contract.fingerprint,
    /^pmi_[0-9a-f]{8}$/,
  );
});

test("no model falls back to Rules Engine", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "content",
    });

  const raw: ModelSelectionResult = {
    model: null,
    reason: "no models available",
    fallbackUsed: true,
  };

  const evidence =
    buildPulseModelSelectionEvidence(
      profile,
      raw,
      [],
    );

  assert.equal(
    evidence.decision,
    "USE_RULES",
  );
});

test("fingerprint ignores runtime discovery metadata and explanatory reason", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "content",
      requiredCapabilities: [
        "content",
        "structured",
      ],
    });

  const a =
    makeModel({
      discoveredAt:
        "2026-01-01T00:00:00.000Z",
    });

  const b =
    makeModel({
      discoveredAt:
        "2026-09-25T18:00:00.000Z",
    });

  const rawA: ModelSelectionResult = {
    model: a,
    reason: "selected",
    fallbackUsed: false,
  };

  const rawB: ModelSelectionResult = {
    model: b,
    reason: "selected at later discovery",
    fallbackUsed: false,
  };

  const evidenceA =
    buildPulseModelSelectionEvidence(
      profile,
      rawA,
      [a],
    );

  const evidenceB =
    buildPulseModelSelectionEvidence(
      profile,
      rawB,
      [b],
    );

  const fpA =
    fingerprintPulseModelSelection({
      contract:
        PULSE_MODEL_INTELLIGENCE_CONTRACT,
      taskProfile: profile,
      rawSelection: rawA,
      evidence: evidenceA,
    });

  const fpB =
    fingerprintPulseModelSelection({
      contract:
        PULSE_MODEL_INTELLIGENCE_CONTRACT,
      taskProfile: profile,
      rawSelection: rawB,
      evidence: evidenceB,
    });

  assert.equal(fpA, fpB);

  const reversedEvidence = {
    ...evidenceA,
    eligibleCandidates: [
      ...evidenceA.eligibleCandidates,
    ].reverse(),
    rejectedCandidates: [
      ...evidenceA.rejectedCandidates,
    ].reverse(),
  };

  const fpReordered =
    fingerprintPulseModelSelection({
      contract:
        PULSE_MODEL_INTELLIGENCE_CONTRACT,
      taskProfile: profile,
      rawSelection: rawA,
      evidence: reversedEvidence,
    });

  assert.equal(fpA, fpReordered);
});

test("failure classifier distinguishes runtime failures", () => {
  assert.equal(
    classifyPulseModelFailure({
      status: 429,
      message: "rate limit",
    }),
    "RATE_LIMIT",
  );

  assert.equal(
    classifyPulseModelFailure({
      status: 404,
      message: "model not found",
    }),
    "MODEL_NOT_FOUND",
  );

  assert.equal(
    classifyPulseModelFailure({
      status: 408,
      message: "request timeout",
    }),
    "TIMEOUT",
  );

  assert.equal(
    classifyPulseModelFailure({
      message: "context window exceeded",
    }),
    "CONTEXT_OVERFLOW",
  );

  assert.equal(
    classifyPulseModelFailure({
      message: "invalid JSON output",
    }),
    "INVALID_OUTPUT",
  );

  assert.equal(
    classifyPulseModelFailure({
      message: "provider unavailable",
    }),
    "UNAVAILABLE",
  );
});

test("authentication failure is classified separately", () => {
  assert.equal(
    classifyPulseModelFailure({
      status: 401,
      message: "unauthorized",
    }),
    "AUTHENTICATION",
  );
});

test("empty response is classified separately", () => {
  assert.equal(
    classifyPulseModelFailure({
      message: "empty response",
    }),
    "EMPTY_RESPONSE",
  );
});

test("legacy router request remains compatible", () => {
  const profile =
    normalizePulseModelTaskProfile({
      task: "operator",
      requiredCapabilities: [
        "reasoning",
      ],
      preferredProvider:
        "ollama",
      risk: "L3",
      requireTools: true,
    });

  const request =
    toLegacyModelSelectionRequest(
      profile,
    );

  assert.deepEqual(
    request,
    {
      task: "operator",
      capabilities: [
        "reasoning",
      ],
      preferredProvider:
        "ollama",
      risk: "high",
      requireTools: true,
    },
  );
});
