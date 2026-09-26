import type { PulseContextItem } from "../DigitalBoostPulseContextEngine";

const PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT =
  "p0.7.2.7";

const PULSE_INFERENCE_CONTEXT_ADAPTER_SOURCE =
  "pulse-inference-evidence-context-adapter";

export function assertInferenceObservationItem(
  item: PulseContextItem,
  tenantId: string,
): void {
  if (item.tenantId !== tenantId) {
    throw new Error(
      "CONTEXT_INFERENCE_TENANT_MISMATCH",
    );
  }

  if (
    item.source !==
    PULSE_INFERENCE_CONTEXT_ADAPTER_SOURCE
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_SOURCE_VIOLATION",
    );
  }

  if (
    !item.id.startsWith(
      "pulse-inference-observation:",
    )
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_ID_VIOLATION",
    );
  }

  if (
    !item.key.startsWith(
      "pulse.inference.observation.",
    )
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_KEY_VIOLATION",
    );
  }

  if (item.trust !== "untrusted") {
    throw new Error(
      "CONTEXT_INFERENCE_TRUST_VIOLATION",
    );
  }

  if (item.mandatory !== false) {
    throw new Error(
      "CONTEXT_INFERENCE_MANDATORY_VIOLATION",
    );
  }

  if (item.freshness !== "unknown") {
    throw new Error(
      "CONTEXT_INFERENCE_FRESHNESS_VIOLATION",
    );
  }

  const expectedConstraints = [
    "observational-only",
    "no-semantic-claim",
    "no-execution-authority",
  ];

  if (
    JSON.stringify(item.constraints) !==
    JSON.stringify(expectedConstraints)
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_CONSTRAINT_VIOLATION",
    );
  }

  if (
    !Array.isArray(item.evidenceRefs) ||
    item.evidenceRefs.length !== 2
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_EVIDENCE_REFS_VIOLATION",
    );
  }

  const value =
    item.value &&
    typeof item.value === "object"
      ? (item.value as Record<string, unknown>)
      : undefined;

  if (!value) {
    throw new Error(
      "CONTEXT_INFERENCE_VALUE_VIOLATION",
    );
  }

  if (
    value.adapterContract !==
    PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_CONTRACT_VIOLATION",
    );
  }

  if (value.purpose !== "CONTEXT") {
    throw new Error(
      "CONTEXT_INFERENCE_PURPOSE_VIOLATION",
    );
  }

  if (
    value.authority !== "NONE" ||
    value.canSupportSemanticClaim !== false ||
    value.canSupportExecution !== false
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_AUTHORITY_VIOLATION",
    );
  }

  if (
    typeof value.observationId !== "string" ||
    value.observationId.trim() === ""
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_OBSERVATION_ID_VIOLATION",
    );
  }

  if (
    item.id !==
      `pulse-inference-observation:${value.observationId}` ||
    item.key !==
      `pulse.inference.observation.${value.observationId}`
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_IDENTITY_VIOLATION",
    );
  }

  if (
    typeof value.recordId !== "string" ||
    value.recordId.trim() === "" ||
    typeof value.evidenceId !== "string" ||
    value.evidenceId.trim() === "" ||
    typeof value.observationHash !== "string" ||
    value.observationHash.trim() === ""
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_PROVENANCE_VIOLATION",
    );
  }

  if (
    typeof value.tenantId !== "string" ||
    value.tenantId !== tenantId
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_VALUE_TENANT_VIOLATION",
    );
  }

  if (
    value.decision !== "ALLOW_OBSERVATION" &&
    value.decision !== "ALLOW_FAILURE_OBSERVATION"
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_DECISION_VIOLATION",
    );
  }

  if (
    value.source !==
    "pulse-inference-evidence-consumer"
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_PROVENANCE_SOURCE_VIOLATION",
    );
  }

  if (
    typeof value.observedAt !== "string" ||
    value.observedAt.trim() === "" ||
    item.timestamp !== value.observedAt
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_TIMESTAMP_VIOLATION",
    );
  }

  if (
    item.provenance !==
    `${PULSE_INFERENCE_CONTEXT_ADAPTER_CONTRACT}:${value.observationHash}`
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_PROVENANCE_HASH_VIOLATION",
    );
  }

  if (
    item.evidenceRefs[0] !==
      `record:${value.recordId}` ||
    item.evidenceRefs[1] !==
      `evidence:${value.evidenceId}`
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_EVIDENCE_BINDING_VIOLATION",
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      value,
      "output",
    )
  ) {
    throw new Error(
      "CONTEXT_INFERENCE_OUTPUT_CONTENT_VIOLATION",
    );
  }
}
