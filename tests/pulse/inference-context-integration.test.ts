import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPulseContext,
} from "../../src/DigitalBoostPulseContext";

import {
  pulseInferenceObservationToContextItem,
} from "../../src/ai/DigitalBoostPulseInferenceContextAdapter";

import type {
  PulseInferenceEvidenceObservation,
} from "../../src/ai/DigitalBoostPulseInferenceEvidenceConsumer";

function makeObservation(
  overrides: Partial<PulseInferenceEvidenceObservation> = {},
): PulseInferenceEvidenceObservation {
  return {
    contract: "p0.7.2.6",
    observationId:
      "obs-context-integration-001",
    tenantId:
      "tenant-context-integration",
    store:
      "store-context-integration",
    purpose: "CONTEXT",
    recordId:
      "record-context-integration-001",
    evidenceId:
      "evidence-context-integration-001",
    requestId:
      "request-context-integration-001",
    selectionModelRef:
      "model:example",
    expectedRuntimeModelRef:
      "model:example",
    runtimeModelRef:
      "model:example",
    provider: "rules",
    status: "COMPLETED",
    bindingStatus: "MATCH",
    outputPresent: true,
    outputHash:
      "output-hash-context-integration-001",
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
      "observation-hash-context-integration-001",
    ...overrides,
  };
}

function makeBaseInput() {
  return {
    store:
      "store-context-integration",
    tenant:
      "tenant-context-integration",
    section:
      "website-builder",
  };
}

function makeItem(
  overrides: Partial<PulseInferenceEvidenceObservation> = {},
) {
  return pulseInferenceObservationToContextItem(
    makeObservation(overrides),
  );
}

test(
  "accepted inference observation enters Pulse context",
  () => {
    const inferenceItem = makeItem();

    const context =
      buildPulseContext({
        ...makeBaseInput(),
        inferenceObservationItems: [
          inferenceItem,
        ],
      });

    const observed =
      context.contextItems.find(
        (candidate) =>
          candidate.id ===
          inferenceItem.id,
      );

    assert.ok(observed);

    assert.equal(
      observed!.trust,
      "untrusted",
    );

    assert.equal(
      observed!.mandatory,
      false,
    );

    assert.equal(
      observed!.value.authority,
      "NONE",
    );

    assert.equal(
      observed!.value.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      observed!.value.canSupportExecution,
      false,
    );
  },
);

test(
  "inference observation changes assembly identity, not snapshot context version",
  () => {
    const inferenceItem = makeItem();

    const baseline =
      buildPulseContext(
        makeBaseInput(),
      );

    const enriched =
      buildPulseContext({
        ...makeBaseInput(),
        inferenceObservationItems: [
          inferenceItem,
        ],
      });

    assert.equal(
      enriched.summary.contextVersion,
      baseline.summary.contextVersion,
    );

    assert.notEqual(
      enriched.summary.assemblyVersion,
      baseline.summary.assemblyVersion,
    );

    assert.notEqual(
      enriched.contextId,
      baseline.contextId,
    );
  },
);

test(
  "same observation produces deterministic assembly identity",
  () => {
    const inferenceItem = makeItem();

    const first =
      buildPulseContext({
        ...makeBaseInput(),
        inferenceObservationItems: [
          inferenceItem,
        ],
      });

    const second =
      buildPulseContext({
        ...makeBaseInput(),
        inferenceObservationItems: [
          inferenceItem,
        ],
      });

    assert.equal(
      first.summary.assemblyVersion,
      second.summary.assemblyVersion,
    );

    assert.equal(
      first.contextId,
      second.contextId,
    );
  },
);

test(
  "tenant mismatch fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          tenant:
            "tenant-other",
          inferenceObservationItems: [
            inferenceItem,
          ],
        }),
      /CONTEXT_INFERENCE_TENANT_MISMATCH/,
    );
  },
);

test(
  "foreign source fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              source:
                "foreign-context-source",
            },
          ],
        }),
      /CONTEXT_INFERENCE_SOURCE_VIOLATION/,
    );
  },
);

test(
  "trusted observation fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              trust:
                "trusted",
            },
          ],
        }),
      /CONTEXT_INFERENCE_TRUST_VIOLATION/,
    );
  },
);

test(
  "mandatory escalation fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              mandatory:
                true,
            },
          ],
        }),
      /CONTEXT_INFERENCE_MANDATORY_VIOLATION/,
    );
  },
);

test(
  "authority escalation fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              value: {
                ...inferenceItem.value,
                authority:
                  "EXECUTOR",
              },
            },
          ],
        }),
      /CONTEXT_INFERENCE_AUTHORITY_VIOLATION/,
    );
  },
);

test(
  "semantic-claim escalation fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              value: {
                ...inferenceItem.value,
                canSupportSemanticClaim:
                  true,
              },
            },
          ],
        }),
      /CONTEXT_INFERENCE_AUTHORITY_VIOLATION/,
    );
  },
);

test(
  "execution escalation fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              value: {
                ...inferenceItem.value,
                canSupportExecution:
                  true,
              },
            },
          ],
        }),
      /CONTEXT_INFERENCE_AUTHORITY_VIOLATION/,
    );
  },
);

test(
  "provenance tampering fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              provenance:
                "p0.7.2.7:forged-hash",
            },
          ],
        }),
      /CONTEXT_INFERENCE_PROVENANCE_HASH_VIOLATION/,
    );
  },
);

test(
  "record/evidence binding tampering fails closed",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              evidenceRefs: [
                "record:forged-record",
                "evidence:forged-evidence",
              ],
            },
          ],
        }),
      /CONTEXT_INFERENCE_EVIDENCE_BINDING_VIOLATION/,
    );
  },
);

test(
  "raw model output content is not accepted into context",
  () => {
    const inferenceItem = makeItem();

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            {
              ...inferenceItem,
              value: {
                ...inferenceItem.value,
                output:
                  "FORGED_RAW_MODEL_OUTPUT",
              },
            },
          ],
        }),
      /CONTEXT_INFERENCE_OUTPUT_CONTENT_VIOLATION/,
    );
  },
);

test(
  "failed inference remains observational",
  () => {
    const inferenceItem =
      makeItem({
        status:
          "FAILED",
        bindingStatus:
          "UNAVAILABLE",
        outputPresent:
          false,
        outputHash:
          undefined,
        runtimeModelRef:
          undefined,
        failure:
          "BRIDGE_UNAVAILABLE",
        decision:
          "ALLOW_FAILURE_OBSERVATION",
        consumptionClass:
          "INFERENCE_FAILURE_OBSERVATION",
      });

    const context =
      buildPulseContext({
        ...makeBaseInput(),
        inferenceObservationItems: [
          inferenceItem,
        ],
      });

    const observed =
      context.contextItems.find(
        (candidate) =>
          candidate.id ===
          inferenceItem.id,
      );

    assert.ok(observed);

    assert.equal(
      observed!.value.status,
      "FAILED",
    );

    assert.equal(
      observed!.value.authority,
      "NONE",
    );

    assert.equal(
      observed!.value.canSupportSemanticClaim,
      false,
    );

    assert.equal(
      observed!.value.canSupportExecution,
      false,
    );
  },
);

test(
  "tampered non-context purpose fails closed",
  () => {
    const inferenceItem = makeItem();

    const tamperedItem = {
      ...inferenceItem,
      value: {
        ...inferenceItem.value,
        purpose:
          "PLANNING",
      },
    };

    assert.throws(
      () =>
        buildPulseContext({
          ...makeBaseInput(),
          inferenceObservationItems: [
            tamperedItem,
          ],
        }),
      /CONTEXT_INFERENCE_PURPOSE_VIOLATION/,
    );
  },
);
