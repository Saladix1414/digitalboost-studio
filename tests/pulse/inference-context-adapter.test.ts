import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT,
  pulseInferenceObservationToContextItem,
} from "../../src/ai/DigitalBoostPulseInferenceContextAdapter";

import type {
  PulseInferenceEvidenceObservation,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceConsumer";

function observation(
  overrides: Partial<PulseInferenceEvidenceObservation> = {},
): PulseInferenceEvidenceObservation {
  return {
    contract: "p0.7.2.6",
    observationId: "obs-001",
    tenantId: "tenant-a",
    store: "store-a",
    purpose: "CONTEXT",
    recordId: "record-001",
    evidenceId: "evidence-001",
    requestId: "request-001",
    selectionModelRef: "model:example",
    expectedRuntimeModelRef: "model:example",
    runtimeModelRef: "model:example",
    provider: "rules",
    status: "COMPLETED",
    bindingStatus: "MATCH",
    outputPresent: true,
    outputHash: "output-hash-001",
    failure: undefined,
    decision: "ALLOW_OBSERVATION",
    consumptionClass:
      "MODEL_OUTPUT_OBSERVATION",
    authority: "NONE",
    canSupportSemanticClaim: false,
    canSupportExecution: false,
    source:
      "pulse-inference-evidence-consumer",
    observedAt:
      "2026-09-25T00:00:00.000Z",
    observationHash:
      "observation-hash-001",
    ...overrides,
  };
}

test(
  "contract identity",
  () => {
    assert.equal(
      PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT,
      "p0.7.2.7",
    );
  },
);

test(
  "valid observation becomes untrusted context item",
  () => {
    const item =
      pulseInferenceObservationToContextItem(
        observation(),
      );

    assert.equal(
      item.tenantId,
      "tenant-a",
    );

    assert.equal(
      item.trust,
      "untrusted",
    );

    assert.equal(
      item.mandatory,
      false,
    );

    assert.equal(
      item.source,
      "pulse-inference-evidence-context-adapter",
    );

    assert.deepEqual(
      item.evidenceRefs,
      [
        "record:record-001",
        "evidence:evidence-001",
      ],
    );
  },
);

test(
  "execution authority remains impossible",
  () => {
    const item =
      pulseInferenceObservationToContextItem(
        observation(),
      );

    assert.equal(
      item.value.authority,
      "NONE",
    );

    assert.equal(
      item.value.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      item.value.canSupportExecution,
      false,
    );
  },
);

test(
  "model output content is not transported",
  () => {
    const item =
      pulseInferenceObservationToContextItem(
        observation(),
      );

    assert.equal(
      "output" in item.value,
      false,
    );

    assert.equal(
      item.value.outputHash,
      "output-hash-001",
    );
  },
);

test(
  "failure observations remain observational",
  () => {
    const item =
      pulseInferenceObservationToContextItem(
        observation({
          status: "FAILED",
          bindingStatus: "UNAVAILABLE",
          outputPresent: false,
          outputHash: undefined,
          runtimeModelRef: undefined,
          failure: "BRIDGE_UNAVAILABLE",
          decision:
            "ALLOW_FAILURE_OBSERVATION",
          consumptionClass:
            "INFERENCE_FAILURE_OBSERVATION",
        }),
      );

    assert.equal(
      item.value.status,
      "FAILED",
    );

    assert.equal(
      item.value.outputPresent,
      false,
    );

    assert.equal(
      item.trust,
      "untrusted",
    );

    assert.equal(
      item.mandatory,
      false,
    );
  },
);

test(
  "non-context purpose is rejected",
  () => {
    assert.throws(
      () =>
        pulseInferenceObservationToContextItem(
          observation({
            purpose: "GOAL",
          }),
        ),
      /INVALID_CONTEXT_OBSERVATION_PURPOSE/,
    );
  },
);

test(
  "blocked observations are rejected",
  () => {
    assert.throws(
      () =>
        pulseInferenceObservationToContextItem(
          observation({
            decision: "BLOCK",
            consumptionClass: "BLOCKED",
          }),
        ),
      /BLOCKED_CONTEXT_OBSERVATION/,
    );
  },
);

test(
  "authority tampering is rejected",
  () => {
    assert.throws(
      () =>
        pulseInferenceObservationToContextItem(
          observation({
            authority: "NONE",
            canSupportSemanticClaim: true,
          }),
        ),
      /CONTEXT_OBSERVATION_AUTHORITY_VIOLATION/,
    );
  },
);

test(
  "wildcard tenant is rejected",
  () => {
    assert.throws(
      () =>
        pulseInferenceObservationToContextItem(
          observation({
            tenantId: "*",
          }),
        ),
      /INVALID_CONTEXT_OBSERVATION_TENANT/,
    );
  },
);

test(
  "relevance and ttl are validated",
  () => {
    assert.throws(
      () =>
        pulseInferenceObservationToContextItem(
          observation(),
          {
            relevance: 2,
          },
        ),
      /INVALID_CONTEXT_OBSERVATION_RELEVANCE/,
    );

    assert.throws(
      () =>
        pulseInferenceObservationToContextItem(
          observation(),
          {
            ttlMs: 0,
          },
        ),
      /INVALID_CONTEXT_OBSERVATION_TTL/,
    );
  },
);

test(
  "deterministic identity fields remain stable",
  () => {
    const a =
      pulseInferenceObservationToContextItem(
        observation(),
      );

    const b =
      pulseInferenceObservationToContextItem(
        observation(),
      );

    assert.equal(
      a.id,
      b.id,
    );

    assert.equal(
      a.provenance,
      b.provenance,
    );

    assert.deepEqual(
      a.evidenceRefs,
      b.evidenceRefs,
    );
  },
);
