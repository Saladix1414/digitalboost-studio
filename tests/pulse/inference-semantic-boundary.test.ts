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
  verifyPulseInferenceEvidenceObservation,
  type PulseInferenceEvidenceObservation,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceConsumer.ts";

import {
  PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT,
  PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE,
  fingerprintPulseInferenceSemanticCandidate,
  projectPulseInferenceSemanticObservation,
  verifyPulseInferenceSemanticObservation,
  type PulseInferenceSemanticCandidateInput,
} from "../../src/ai/DigitalBoostPulseInferenceSemanticBoundary.ts";

const TEST_TENANT = "tenant-a";
const TEST_STORE = "store-a";
const TEST_CONTEXT_ID = "ctx-p078a";
const TEST_CONTEXT_VERSION = "ctx-version-p078a";

type SemanticPurpose =
  | "CONTEXT"
  | "GOAL"
  | "PLANNING"
  | "MEMORY"
  | "EVALUATION";

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
        "req-semantic-001",

      selectionFingerprint:
        "pmi_semantic",

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
                      "observable semantic source",
                  }
                : input.output
            ),

      failure:
        input.failure,
    });

  return createPulseInferenceEvidenceRecord({
    tenantId:
      input.tenantId ??
      TEST_TENANT,

    store:
      TEST_STORE,

    receipt,
  });
}

function observation(
  options: {
    tenantId?: string;
    purpose?: SemanticPurpose;
    status?: "COMPLETED" | "FAILED";
    bindingStatus?: "MATCH" | "MISMATCH" | "UNAVAILABLE";
    output?: unknown;
    hasOutput?: boolean;
    runtimeModelRef?: string;
    failure?: string;
  } = {},
): PulseInferenceEvidenceObservation {
  const record =
    makeRecord({
      tenantId:
        options.tenantId,
      status:
        options.status,
      bindingStatus:
        options.bindingStatus,
      output:
        options.output,
      hasOutput:
        options.hasOutput,
      runtimeModelRef:
        options.runtimeModelRef,
      failure:
        options.failure,
    });

  return consumePulseInferenceEvidence({
    tenantId:
      options.tenantId ??
      TEST_TENANT,

    purpose:
      options.purpose ??
      "CONTEXT",

    record,
  });
}

function makeContext(overrides: Partial<{
  tenantId: string;
  contextId: string;
  contextVersion: string;
  store: string;
  section: string;
}> = {}) {
  return {
    tenantId: TEST_TENANT,
    contextId: TEST_CONTEXT_ID,
    contextVersion: TEST_CONTEXT_VERSION,
    store: TEST_STORE,
    section: "store-builder",
    ...overrides,
  };
}

function makeCandidate(
  overrides: Partial<PulseInferenceSemanticCandidateInput> = {},
): PulseInferenceSemanticCandidateInput {
  return {
    kind: "INTENT_CANDIDATE",
    label: "store_builder_request",
    value:
      "The user appears to be asking for a store-building action.",
    confidence: 0.91,
    ...overrides,
  };
}

function project(
  options: {
    source?: Partial<{
      tenantId: string;
      purpose: SemanticPurpose;
      status: "COMPLETED" | "FAILED";
      bindingStatus: "MATCH" | "MISMATCH" | "UNAVAILABLE";
      output: unknown;
      hasOutput: boolean;
      runtimeModelRef: string;
      failure: string;
    }>;
    context?: Partial<{
      tenantId: string;
      contextId: string;
      contextVersion: string;
      store: string;
      section: string;
    }>;
    candidate?: Partial<PulseInferenceSemanticCandidateInput>;
  } = {},
) {
  return projectPulseInferenceSemanticObservation({
    observation:
      observation(
        options.source,
      ),

    context:
      makeContext(
        options.context,
      ),

    candidate:
      makeCandidate(
        options.candidate,
      ),
  });
}

test("contract constants are correct", () => {
  assert.equal(
    PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT,
    "p0.7.2.8",
  );

  assert.equal(
    PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE,
    "pulse-inference-semantic-boundary",
  );
});

test(
  "canonical P0.7.2.6 source observation is valid before semantic projection",
  () => {
    const source =
      observation();

    assert.equal(
      source.decision,
      "ALLOW_OBSERVATION",
    );

    assert.equal(
      source.status,
      "COMPLETED",
    );

    assert.equal(
      source.bindingStatus,
      "MATCH",
    );

    assert.equal(
      source.outputPresent,
      true,
    );

    assert.ok(
      source.outputHash,
    );

    assert.equal(
      verifyPulseInferenceEvidenceObservation(
        source,
      ),
      true,
    );
  },
);

test(
  "valid CONTEXT observation projects to a semantic hypothesis candidate",
  () => {
    const result =
      project();

    assert.equal(
      result.contract,
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT,
    );

    assert.equal(
      result.role,
      "HYPOTHESIS",
    );

    assert.equal(
      result.status,
      "CANDIDATE",
    );

    assert.equal(
      result.authority,
      "NONE",
    );

    assert.equal(
      result.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      result.canSupportExecution,
      false,
    );

    assert.equal(
      result.source,
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE,
    );

    assert.equal(
      result.sourceStatus,
      "COMPLETED",
    );

    assert.equal(
      result.sourceBindingStatus,
      "MATCH",
    );

    assert.ok(
      result.candidate.candidateHash.length > 0,
    );

    assert.ok(
      result.semanticObservationHash.length > 0,
    );

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        result,
      ),
      true,
    );
  },
);

for (const purpose of [
  "CONTEXT",
  "GOAL",
  "PLANNING",
  "EVALUATION",
] as const) {
  test(
    `purpose ${purpose} remains eligible for hypothesis projection`,
    () => {
      const result =
        project({
          source: {
            purpose,
          },
        });

      assert.equal(
        result.role,
        "HYPOTHESIS",
      );

      assert.equal(
        result.status,
        "CANDIDATE",
      );

      assert.equal(
        result.authority,
        "NONE",
      );
    },
  );
}

test(
  "MEMORY source is explicitly rejected",
  () => {
    assert.throws(() => {
      project({
        source: {
          purpose:
            "MEMORY",
        },
      });
    });
  },
);

test(
  "tampered source observation hash is rejected",
  () => {
    const source =
      observation();

    const tampered = {
      ...source,
      outputHash:
        "tampered-output-hash",
    };

    assert.throws(() => {
      projectPulseInferenceSemanticObservation({
        observation:
          tampered,
        context:
          makeContext(),
        candidate:
          makeCandidate(),
      });
    });
  },
);

test(
  "FAILED source cannot become positive semantic hypothesis",
  () => {
    assert.throws(() => {
      project({
        source: {
          status:
            "FAILED",
          hasOutput:
            false,
          failure:
            "MODEL_FAILURE",
        },
      });
    });
  },
);

test(
  "ALLOW_FAILURE_OBSERVATION cannot become positive semantic hypothesis",
  () => {
    assert.throws(() => {
      project({
        source: {
          status:
            "FAILED",
          hasOutput:
            false,
          failure:
            "MODEL_FAILURE",
        },
      });
    });
  },
);

test(
  "BLOCK source cannot become semantic hypothesis",
  () => {
    const source =
      observation();

    const blocked = {
      ...source,
      decision:
        "BLOCK" as never,
    };

    assert.throws(() => {
      projectPulseInferenceSemanticObservation({
        observation:
          blocked,
        context:
          makeContext(),
        candidate:
          makeCandidate(),
      });
    });
  },
);

test(
  "tenant mismatch is rejected",
  () => {
    assert.throws(() => {
      project({
        context: {
          tenantId:
            "tenant-foreign",
        },
      });
    });
  },
);

test(
  "wildcard tenant context is rejected",
  () => {
    assert.throws(() => {
      project({
        context: {
          tenantId:
            "*",
        },
      });
    });

    assert.throws(() => {
      project({
        context: {
          tenantId:
            "global",
        },
      });
    });
  },
);

test(
  "empty contextId is rejected",
  () => {
    assert.throws(() => {
      project({
        context: {
          contextId:
            "",
        },
      });
    });
  },
);

test(
  "empty contextVersion is rejected",
  () => {
    assert.throws(() => {
      project({
        context: {
          contextVersion:
            "",
        },
      });
    });
  },
);

test(
  "candidate confidence below zero is rejected",
  () => {
    assert.throws(() => {
      project({
        candidate: {
          confidence:
            -0.01,
        },
      });
    });
  },
);

test(
  "candidate confidence above one is rejected",
  () => {
    assert.throws(() => {
      project({
        candidate: {
          confidence:
            1.01,
        },
      });
    });
  },
);

test(
  "candidate label containing NUL is rejected",
  () => {
    assert.throws(() => {
      project({
        candidate: {
          label:
            "intent\u0000candidate",
        },
      });
    });
  },
);

test(
  "candidate value containing NUL is rejected",
  () => {
    assert.throws(() => {
      project({
        candidate: {
          value:
            "semantic\u0000candidate",
        },
      });
    });
  },
);

test(
  "unsupported candidate kind is rejected",
  () => {
    assert.throws(() => {
      project({
        candidate: {
          kind:
            "UNTRUSTED_SEMANTIC_TRUTH" as never,
        },
      });
    });
  },
);

test(
  "candidate fingerprint is deterministic",
  () => {
    const input = {
      tenantId:
        TEST_TENANT,
      contextId:
        TEST_CONTEXT_ID,
      contextVersion:
        TEST_CONTEXT_VERSION,
      sourceObservationId:
        "source-observation-001",
      sourceObservationHash:
        "source-observation-hash-001",
      candidate:
        makeCandidate(),
    };

    const first =
      fingerprintPulseInferenceSemanticCandidate(
        input,
      );

    const second =
      fingerprintPulseInferenceSemanticCandidate(
        input,
      );

    assert.equal(
      first,
      second,
    );
  },
);

test(
  "semantic observation identity is deterministic for the same source observation",
  () => {
    const source =
      observation();

    const context =
      makeContext();

    const candidate =
      makeCandidate();

    const first =
      projectPulseInferenceSemanticObservation({
        observation:
          source,

        context,

        candidate,
      });

    const second =
      projectPulseInferenceSemanticObservation({
        observation:
          source,

        context,

        candidate,
      });

    assert.equal(
      first.candidate.candidateHash,
      second.candidate.candidateHash,
    );

    assert.equal(
      first.semanticObservationId,
      second.semanticObservationId,
    );

    assert.equal(
      first.semanticObservationHash,
      second.semanticObservationHash,
    );
  },
);

test(
  "candidate mutation changes candidate hash and semantic observation identity",
  () => {
    const original =
      project();

    const mutated =
      project({
        candidate: {
          value:
            "The user appears to be asking for a different action.",
        },
      });

    assert.notEqual(
      original.candidate.candidateHash,
      mutated.candidate.candidateHash,
    );

    assert.notEqual(
      original.semanticObservationId,
      mutated.semanticObservationId,
    );

    assert.notEqual(
      original.semanticObservationHash,
      mutated.semanticObservationHash,
    );
  },
);

test(
  "semantic observation authority cannot be escalated",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      authority:
        "EXECUTION" as never,
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "semantic claim capability cannot be escalated",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      canSupportSemanticClaim:
        true,
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "execution capability cannot be escalated",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      canSupportExecution:
        true,
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "source observation binding cannot be changed without invalidating identity",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      sourceObservationId:
        "foreign-source-observation",
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "tenant binding cannot be changed without invalidating identity",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      tenantId:
        "foreign-tenant",
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "context binding cannot be changed without invalidating identity",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      contextVersion:
        "foreign-context-version",
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "candidate hash tampering is detected",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      candidate: {
        ...original.candidate,
        candidateHash:
          "tampered-candidate-hash",
      },
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);

test(
  "semantic observation hash tampering is detected",
  () => {
    const original =
      project();

    const tampered = {
      ...original,
      semanticObservationHash:
        "tampered-semantic-observation-hash",
    };

    assert.equal(
      verifyPulseInferenceSemanticObservation(
        tampered,
      ),
      false,
    );
  },
);
