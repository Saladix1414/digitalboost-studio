/**
 * DigitalBoostPulseInferenceEvidence
 *
 * P0.7.2.4 — Runtime Evidence Receipt.
 *
 * Esta capa registra evidencia observable de una inferencia.
 *
 * NO:
 * - concede permisos;
 * - aprueba acciones;
 * - emite execution attestation;
 * - cambia Governance;
 * - convierte una inferencia en PROVEN o ASSURED.
 *
 * La evidencia:
 * - vincula selection fingerprint;
 * - conserva identidad del modelo seleccionado;
 * - conserva identidad del modelo runtime observado;
 * - registra el binding esperado;
 * - registra estado/fallo;
 * - hashea la salida sin persistir su contenido;
 * - puede verificarse de forma determinista.
 */

import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

export const PULSE_INFERENCE_EVIDENCE_CONTRACT =
  "p0.7.2.4" as const;

export type PulseInferenceEvidenceBindingStatus =
  | "MATCH"
  | "MISMATCH"
  | "UNAVAILABLE";

export interface PulseInferenceEvidenceReceipt {
  contract:
    typeof PULSE_INFERENCE_EVIDENCE_CONTRACT;

  evidenceId:
    string;

  source:
    "pulse-inference-runtime";

  authority:
    "runtime-observation";

  requestId:
    string;

  selectionFingerprint:
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
    PulseInferenceEvidenceBindingStatus;

  outputPresent:
    boolean;

  outputHash?:
    string;

  failure?:
    string;

  error?:
    string;

  startedAt?:
    string;

  completedAt?:
    string;

  latencyMs?:
    number;

  issuedAt:
    string;

  evidenceHash:
    string;
}

export interface CreatePulseInferenceEvidenceInput {
  requestId:
    string;

  selectionFingerprint:
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
    PulseInferenceEvidenceBindingStatus;

  output?:
    unknown;

  failure?:
    string;

  error?:
    string;

  startedAt?:
    string;

  completedAt?:
    string;

  latencyMs?:
    number;
}

function normalize(
  value:
    string | undefined,
): string {
  return String(
    value || "",
  ).trim();
}

function outputHash(
  output:
    unknown,
): string | undefined {
  if (
    output === undefined
  ) {
    return undefined;
  }

  return hashProposal(
    output,
  );
}

function calculateEvidenceHash(
  base:
    Omit<
      PulseInferenceEvidenceReceipt,
      "evidenceHash"
    >,
): string {
  return hashProposal(
    base,
  );
}

export function createPulseInferenceEvidence(
  input:
    CreatePulseInferenceEvidenceInput,
): PulseInferenceEvidenceReceipt {
  const issuedAt =
    new Date().toISOString();

  const normalizedOutputHash =
    outputHash(input.output);

  const bindingStatus =
    input.bindingStatus;

  const base: Omit<
    PulseInferenceEvidenceReceipt,
    "evidenceHash"
  > = {
    contract:
      PULSE_INFERENCE_EVIDENCE_CONTRACT,

    evidenceId:
      "pie_" +
      input.requestId +
      "_" +
      hashProposal({
        requestId:
          input.requestId,

        selectionFingerprint:
          input.selectionFingerprint,

        issuedAt,
      }),

    source:
      "pulse-inference-runtime",

    authority:
      "runtime-observation",

    requestId:
      normalize(
        input.requestId,
      ),

    selectionFingerprint:
      normalize(
        input.selectionFingerprint,
      ),

    selectionModelRef:
      normalize(
        input.selectionModelRef,
      ),

    expectedRuntimeModelRef:
      normalize(
        input.expectedRuntimeModelRef,
      ),

    runtimeModelRef:
      normalize(
        input.runtimeModelRef,
      ) || undefined,

    provider:
      normalize(
        input.provider,
      ),

    status:
      input.status,

    bindingStatus,

    outputPresent:
      input.output !== undefined,

    outputHash:
      normalizedOutputHash,

    failure:
      normalize(
        input.failure,
      ) || undefined,

    error:
      normalize(
        input.error,
      ) || undefined,

    startedAt:
      input.startedAt,

    completedAt:
      input.completedAt,

    latencyMs:
      input.latencyMs,

    issuedAt,
  };

  return {
    ...base,

    evidenceHash:
      calculateEvidenceHash(
        base,
      ),
  };
}

export function verifyPulseInferenceEvidence(
  receipt:
    PulseInferenceEvidenceReceipt,
): boolean {
  const {
    evidenceHash,
    ...base
  } = receipt;

  if (
    receipt.contract !==
      PULSE_INFERENCE_EVIDENCE_CONTRACT ||
    receipt.source !==
      "pulse-inference-runtime" ||
    receipt.authority !==
      "runtime-observation" ||
    !normalize(receipt.evidenceId) ||
    !normalize(receipt.requestId) ||
    !normalize(
      receipt.selectionFingerprint,
    ) ||
    !normalize(
      receipt.selectionModelRef,
    ) ||
    !normalize(
      receipt.expectedRuntimeModelRef,
    ) ||
    !normalize(receipt.provider) ||
    !normalize(receipt.issuedAt)
  ) {
    return false;
  }

  if (
    receipt.bindingStatus ===
      "MATCH" &&
    (
      !receipt.runtimeModelRef ||
      receipt.runtimeModelRef !==
        receipt.expectedRuntimeModelRef
    )
  ) {
    return false;
  }

  if (
    receipt.bindingStatus ===
      "MISMATCH" &&
    (
      !receipt.runtimeModelRef ||
      receipt.runtimeModelRef ===
        receipt.expectedRuntimeModelRef
    )
  ) {
    return false;
  }

  if (
    receipt.bindingStatus ===
      "UNAVAILABLE" &&
    receipt.runtimeModelRef
  ) {
    return false;
  }

  if (
    receipt.outputPresent &&
    !receipt.outputHash
  ) {
    return false;
  }

  if (
    !receipt.outputPresent &&
    receipt.outputHash
  ) {
    return false;
  }

  return (
    calculateEvidenceHash(
      base,
    ) ===
    evidenceHash
  );
}

export default
  createPulseInferenceEvidence;
