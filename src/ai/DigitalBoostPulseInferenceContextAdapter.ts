import type {
  PulseContextItem,
} from "../DigitalBoostPulseContextEngine";

import {
  type PulseInferenceEvidenceObservation,
} from "./DigitalBoostPulseInferenceEvidenceConsumer";

export const PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT =
  "p0.7.2.7";

export const PULSE_INFERENCE_CONTEXT_ADAPTER_SOURCE =
  "pulse-inference-evidence-context-adapter";

export type PulseInferenceContextAdapterOptions = {
  relevance?: number;
  ttlMs?: number;
};

function assertTenant(
  value: unknown,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim() === "" ||
    value === "*" ||
    value === "global" ||
    value.includes("\u0000")
  ) {
    throw new Error(
      "INVALID_CONTEXT_OBSERVATION_TENANT",
    );
  }
}

function assertAllowedObservation(
  observation: PulseInferenceEvidenceObservation,
): void {
  if (
    observation.purpose !== "CONTEXT"
  ) {
    throw new Error(
      "INVALID_CONTEXT_OBSERVATION_PURPOSE",
    );
  }

  if (
    observation.decision !==
      "ALLOW_OBSERVATION" &&
    observation.decision !==
      "ALLOW_FAILURE_OBSERVATION"
  ) {
    throw new Error(
      "BLOCKED_CONTEXT_OBSERVATION",
    );
  }

  if (
    observation.authority !== "NONE" ||
    observation.canSupportSemanticClaim !==
      false ||
    observation.canSupportExecution !==
      false
  ) {
    throw new Error(
      "CONTEXT_OBSERVATION_AUTHORITY_VIOLATION",
    );
  }

  if (
    typeof observation.observationId !==
      "string" ||
    observation.observationId.trim() === ""
  ) {
    throw new Error(
      "INVALID_CONTEXT_OBSERVATION_ID",
    );
  }

  if (
    typeof observation.observationHash !==
      "string" ||
    observation.observationHash.trim() === ""
  ) {
    throw new Error(
      "INVALID_CONTEXT_OBSERVATION_HASH",
    );
  }

  if (
    typeof observation.recordId !==
      "string" ||
    observation.recordId.trim() === ""
  ) {
    throw new Error(
      "INVALID_CONTEXT_RECORD_ID",
    );
  }

  if (
    typeof observation.evidenceId !==
      "string" ||
    observation.evidenceId.trim() === ""
  ) {
    throw new Error(
      "INVALID_CONTEXT_EVIDENCE_ID",
    );
  }
}

function normalizeRelevance(
  value: number | undefined,
): number {
  if (
    value === undefined
  ) {
    return 0.5;
  }

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      "INVALID_CONTEXT_OBSERVATION_RELEVANCE",
    );
  }

  return value;
}

function normalizeTtl(
  value: number | undefined,
): number {
  const ttl =
    value ?? 300000;

  if (
    !Number.isFinite(ttl) ||
    !Number.isInteger(ttl) ||
    ttl <= 0
  ) {
    throw new Error(
      "INVALID_CONTEXT_OBSERVATION_TTL",
    );
  }

  return ttl;
}

export function pulseInferenceObservationToContextItem(
  observation: PulseInferenceEvidenceObservation,
  options: PulseInferenceContextAdapterOptions = {},
): PulseContextItem {
  assertTenant(
    observation.tenantId,
  );

  assertAllowedObservation(
    observation,
  );

  const relevance =
    normalizeRelevance(
      options.relevance,
    );

  const ttlMs =
    normalizeTtl(
      options.ttlMs,
    );

  const value = {
    adapterContract:
      PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT,

    observationId:
      observation.observationId,

    tenantId:
      observation.tenantId,

    store:
      observation.store,

    purpose:
      observation.purpose,

    recordId:
      observation.recordId,

    evidenceId:
      observation.evidenceId,

    requestId:
      observation.requestId,

    selectionModelRef:
      observation.selectionModelRef,

    expectedRuntimeModelRef:
      observation.expectedRuntimeModelRef,

    runtimeModelRef:
      observation.runtimeModelRef,

    provider:
      observation.provider,

    status:
      observation.status,

    bindingStatus:
      observation.bindingStatus,

    outputPresent:
      observation.outputPresent,

    outputHash:
      observation.outputHash,

    failure:
      observation.failure,

    decision:
      observation.decision,

    consumptionClass:
      observation.consumptionClass,

    authority:
      observation.authority,

    canSupportSemanticClaim:
      observation.canSupportSemanticClaim,

    canSupportExecution:
      observation.canSupportExecution,

    source:
      observation.source,

    observedAt:
      observation.observedAt,

    observationHash:
      observation.observationHash,
  };

  return {
    id:
      `pulse-inference-observation:${observation.observationId}`,

    key:
      `pulse.inference.observation.${observation.observationId}`,

    tenantId:
      observation.tenantId,

    value,

    source:
      PULSE_INFERENCE_CONTEXT_ADAPTER_SOURCE,

    provenance:
      `${PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT}:${observation.observationHash}`,

    timestamp:
      observation.observedAt,

    /*
     * Inference output is observational evidence, not
     * semantic truth. Context must therefore never treat
     * this item as trusted.
     */
    trust:
      "untrusted",

    /*
     * Stable durable identifiers are used as evidence
     * references. These are references only and grant
     * no execution authority.
     */
    evidenceRefs: [
      `record:${observation.recordId}`,
      `evidence:${observation.evidenceId}`,
    ],

    constraints: [
      "observational-only",
      "no-semantic-claim",
      "no-execution-authority",
    ],

    relevance,

    /*
     * Model observations are never mandatory context
     * merely because an inference completed.
     */
    mandatory:
      false,

    ttlMs,

    freshness:
      "unknown",
  };
}
