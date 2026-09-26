/**
 * DigitalBoostPulseInferenceEvidenceConsumer
 *
 * P0.7.2.6 — Inference Evidence Consumption Boundary.
 *
 * Esta capa convierte un Runtime Evidence Record válido en una
 * observación consumible por capas superiores.
 *
 * Permitido:
 * - Context
 * - Goal
 * - Planning
 * - Memory
 * - Evaluation
 *
 * El resultado sigue siendo:
 * - observacional;
 * - tenant-bound;
 * - verificable;
 * - sin autoridad ejecutiva.
 *
 * NO:
 * - concede permisos;
 * - crea approvals;
 * - crea execution attestations;
 * - modifica policy;
 * - modifica governance;
 * - ejecuta tools;
 * - declara PROVEN;
 * - declara ASSURED;
 * - convierte outputHash en contenido confiable.
 */

import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

import {
  verifyPulseInferenceEvidenceRecord,
  type PulseInferenceEvidenceRecord,
} from "./DigitalBoostPulseInferenceEvidenceRegistry";

export const PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT =
  "p0.7.2.6" as const;

export type PulseInferenceEvidenceConsumerPurpose =
  | "CONTEXT"
  | "GOAL"
  | "PLANNING"
  | "MEMORY"
  | "EVALUATION";

export type PulseInferenceEvidenceConsumptionDecision =
  | "ALLOW_OBSERVATION"
  | "ALLOW_FAILURE_OBSERVATION"
  | "BLOCK";

export type PulseInferenceEvidenceConsumptionClass =
  | "MODEL_OUTPUT_OBSERVATION"
  | "INFERENCE_FAILURE_OBSERVATION"
  | "BLOCKED";

export interface PulseInferenceEvidenceObservation {
  contract:
    typeof PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT;

  observationId:
    string;

  tenantId:
    string;

  store?:
    string;

  purpose:
    PulseInferenceEvidenceConsumerPurpose;

  recordId:
    string;

  evidenceId:
    string;

  requestId:
    string;

  selectionModelRef:
    string;

  expectedRuntimeModelRef:
    string;

  runtimeModelRef?:
    string;

  provider:
    string;

  status:
    "COMPLETED"
    | "FAILED";

  bindingStatus:
    "MATCH"
    | "MISMATCH"
    | "UNAVAILABLE";

  outputPresent:
    boolean;

  outputHash?:
    string;

  failure?:
    string;

  decision:
    PulseInferenceEvidenceConsumptionDecision;

  consumptionClass:
    PulseInferenceEvidenceConsumptionClass;

  /*
   * Explicit authority boundary.
   */
  authority:
    "NONE";

  canSupportSemanticClaim:
    false;

  canSupportExecution:
    false;

  source:
    "pulse-inference-evidence-consumer";

  observedAt:
    string;

  observationHash:
    string;
}

export interface ConsumePulseInferenceEvidenceInput {
  tenantId:
    string;

  purpose:
    PulseInferenceEvidenceConsumerPurpose;

  record:
    PulseInferenceEvidenceRecord;
}

function normalizeText(
  value:
    unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isAllowedPurpose(
  value:
    unknown,
): value is PulseInferenceEvidenceConsumerPurpose {
  return (
    value === "CONTEXT" ||
    value === "GOAL" ||
    value === "PLANNING" ||
    value === "MEMORY" ||
    value === "EVALUATION"
  );
}

function observationId(
  tenantId:
    string,

  recordId:
    string,

  purpose:
    PulseInferenceEvidenceConsumerPurpose,
): string {
  return (
    "piec_" +
    hashProposal({
      tenantId,
      recordId,
      purpose,
    })
  );
}

function observationHashBase(
  observation:
    Omit<
      PulseInferenceEvidenceObservation,
      "observationHash"
    >,
): Omit<
  PulseInferenceEvidenceObservation,
  "observationHash"
> {
  return observation;
}

function calculateObservationHash(
  observation:
    Omit<
      PulseInferenceEvidenceObservation,
      "observationHash"
    >,
): string {
  return hashProposal(
    observationHashBase(
      observation,
    ),
  );
}

function buildBlockedObservation(
  input:
    ConsumePulseInferenceEvidenceInput,

  reason:
    PulseInferenceEvidenceConsumptionDecision,
): PulseInferenceEvidenceObservation {
  const record =
    input.record;

  const receipt =
    record.evidence;

  const observedAt =
    new Date().toISOString();

  const base:
    Omit<
      PulseInferenceEvidenceObservation,
      "observationHash"
    > = {
    contract:
      PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT,

    observationId:
      observationId(
        input.tenantId,
        record.recordId,
        input.purpose,
      ),

    tenantId:
      input.tenantId,

    store:
      record.store,

    purpose:
      input.purpose,

    recordId:
      record.recordId,

    evidenceId:
      receipt.evidenceId,

    requestId:
      receipt.requestId,

    selectionModelRef:
      receipt.selectionModelRef,

    expectedRuntimeModelRef:
      receipt.expectedRuntimeModelRef,

    runtimeModelRef:
      receipt.runtimeModelRef,

    provider:
      receipt.provider,

    status:
      receipt.status,

    bindingStatus:
      receipt.bindingStatus,

    outputPresent:
      receipt.outputPresent,

    outputHash:
      receipt.outputHash,

    failure:
      receipt.failure,

    decision:
      reason,

    consumptionClass:
      "BLOCKED",

    authority:
      "NONE",

    canSupportSemanticClaim:
      false,

    canSupportExecution:
      false,

    source:
      "pulse-inference-evidence-consumer",

    observedAt,
  };

  return {
    ...base,

    observationHash:
      calculateObservationHash(
        base,
      ),
  };
}

export function consumePulseInferenceEvidence(
  input:
    ConsumePulseInferenceEvidenceInput,
): PulseInferenceEvidenceObservation {
  const tenantId =
    normalizeText(
      input.tenantId,
    );

  if (!tenantId) {
    return buildBlockedObservation(
      {
        ...input,
        tenantId,
      },
      "BLOCK",
    );
  }

  if (
    tenantId === "*" ||
    tenantId === "global" ||
    tenantId.includes("\u0000")
  ) {
    return buildBlockedObservation(
      input,
      "BLOCK",
    );
  }

  if (
    !isAllowedPurpose(
      input.purpose,
    )
  ) {
    return buildBlockedObservation(
      input,
      "BLOCK",
    );
  }

  if (
    !verifyPulseInferenceEvidenceRecord(
      input.record,
    )
  ) {
    return buildBlockedObservation(
      input,
      "BLOCK",
    );
  }

  if (
    input.record.tenantId !==
    tenantId
  ) {
    return buildBlockedObservation(
      input,
      "BLOCK",
    );
  }

  const receipt =
    input.record.evidence;

  /*
   * Completed inference is consumable only when the runtime binding
   * is exact and the output actually exists.
   */
  if (
    receipt.status ===
      "COMPLETED" &&
    receipt.bindingStatus ===
      "MATCH" &&
    receipt.outputPresent
  ) {
    const observedAt =
      new Date().toISOString();

    const base:
      Omit<
        PulseInferenceEvidenceObservation,
        "observationHash"
      > = {
      contract:
        PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT,

      observationId:
        observationId(
          tenantId,
          input.record.recordId,
          input.purpose,
        ),

      tenantId,

      store:
        input.record.store,

      purpose:
        input.purpose,

      recordId:
        input.record.recordId,

      evidenceId:
        receipt.evidenceId,

      requestId:
        receipt.requestId,

      selectionModelRef:
        receipt.selectionModelRef,

      expectedRuntimeModelRef:
        receipt.expectedRuntimeModelRef,

      runtimeModelRef:
        receipt.runtimeModelRef,

      provider:
        receipt.provider,

      status:
        receipt.status,

      bindingStatus:
        receipt.bindingStatus,

      outputPresent:
        receipt.outputPresent,

      outputHash:
        receipt.outputHash,

      decision:
        "ALLOW_OBSERVATION",

      consumptionClass:
        "MODEL_OUTPUT_OBSERVATION",

      authority:
        "NONE",

      canSupportSemanticClaim:
        false,

      canSupportExecution:
        false,

      source:
        "pulse-inference-evidence-consumer",

      observedAt,
    };

    return {
      ...base,

      observationHash:
        calculateObservationHash(
          base,
        ),
    };
  }

  /*
   * Failures are useful as operational observations, but they must
   * never become semantic truth or execution authority.
   */
  if (
    receipt.status ===
    "FAILED"
  ) {
    const observedAt =
      new Date().toISOString();

    const base:
      Omit<
        PulseInferenceEvidenceObservation,
        "observationHash"
      > = {
      contract:
        PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT,

      observationId:
        observationId(
          tenantId,
          input.record.recordId,
          input.purpose,
        ),

      tenantId,

      store:
        input.record.store,

      purpose:
        input.purpose,

      recordId:
        input.record.recordId,

      evidenceId:
        receipt.evidenceId,

      requestId:
        receipt.requestId,

      selectionModelRef:
        receipt.selectionModelRef,

      expectedRuntimeModelRef:
        receipt.expectedRuntimeModelRef,

      runtimeModelRef:
        receipt.runtimeModelRef,

      provider:
        receipt.provider,

      status:
        receipt.status,

      bindingStatus:
        receipt.bindingStatus,

      outputPresent:
        receipt.outputPresent,

      outputHash:
        receipt.outputHash,

      failure:
        receipt.failure,

      decision:
        "ALLOW_FAILURE_OBSERVATION",

      consumptionClass:
        "INFERENCE_FAILURE_OBSERVATION",

      authority:
        "NONE",

      canSupportSemanticClaim:
        false,

      canSupportExecution:
        false,

      source:
        "pulse-inference-evidence-consumer",

      observedAt,
    };

    return {
      ...base,

      observationHash:
        calculateObservationHash(
          base,
        ),
    };
  }

  return buildBlockedObservation(
    input,
    "BLOCK",
  );
}

export function verifyPulseInferenceEvidenceObservation(
  observation:
    PulseInferenceEvidenceObservation,
): boolean {
  if (
    observation.contract !==
    PULSE_INFERENCE_EVIDENCE_CONSUMPTION_CONTRACT
  ) {
    return false;
  }

  if (
    !normalizeText(
      observation.observationId,
    ) ||
    !normalizeText(
      observation.tenantId,
    ) ||
    !normalizeText(
      observation.recordId,
    ) ||
    !normalizeText(
      observation.evidenceId,
    ) ||
    !normalizeText(
      observation.requestId,
    ) ||
    !normalizeText(
      observation.observedAt,
    )
  ) {
    return false;
  }

  if (
    observation.authority !==
    "NONE"
  ) {
    return false;
  }

  if (
    observation.canSupportSemanticClaim !==
    false
  ) {
    return false;
  }

  if (
    observation.canSupportExecution !==
    false
  ) {
    return false;
  }

  if (
    observation.source !==
    "pulse-inference-evidence-consumer"
  ) {
    return false;
  }

  if (
    observation.observationId !==
    observationId(
      observation.tenantId,
      observation.recordId,
      observation.purpose,
    )
  ) {
    return false;
  }

  if (
    observation.decision ===
      "ALLOW_OBSERVATION" &&
    (
      observation.status !==
        "COMPLETED" ||
      observation.bindingStatus !==
        "MATCH" ||
      !observation.outputPresent ||
      observation.consumptionClass !==
        "MODEL_OUTPUT_OBSERVATION"
    )
  ) {
    return false;
  }

  if (
    observation.decision ===
      "ALLOW_FAILURE_OBSERVATION" &&
    (
      observation.status !==
        "FAILED" ||
      observation.consumptionClass !==
        "INFERENCE_FAILURE_OBSERVATION"
    )
  ) {
    return false;
  }

  if (
    observation.decision ===
    "BLOCK"
  ) {
    if (
      observation.consumptionClass !==
      "BLOCKED"
    ) {
      return false;
    }
  }

  const {
    observationHash,
    ...base
  } = observation;

  return (
    calculateObservationHash(
      base,
    ) ===
    observationHash
  );
}

export default
  consumePulseInferenceEvidence;
