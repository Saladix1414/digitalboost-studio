/**
 * DigitalBoostPulseInferenceEvidenceRegistry
 *
 * P0.7.2.5 — Durable Inference Evidence Registry.
 *
 * Responsabilidades:
 * - persistir Runtime Evidence Receipts;
 * - mantener aislamiento explícito por tenant;
 * - permitir recuperación determinista;
 * - detectar tampering;
 * - conservar idempotencia;
 * - rechazar replay conflictivo.
 *
 * NO:
 * - concede permisos;
 * - aprueba acciones;
 * - crea Execution Attestation;
 * - modifica Governance;
 * - modifica Policy;
 * - ejecuta herramientas;
 * - convierte evidencia de inferencia en PROVEN o ASSURED.
 *
 * El registry es una capa de persistencia/verificación observacional.
 */

import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

import {
  verifyPulseInferenceEvidence,
  type PulseInferenceEvidenceReceipt,
} from "./DigitalBoostPulseInferenceEvidence";

export const PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT =
  "p0.7.2.5" as const;

const STORAGE_KEY =
  "db-pulse-inference-evidence-v1";

const MAX_RECORDS = 800;

export interface PulseInferenceEvidenceRecord {
  contract:
    typeof PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT;

  recordId:
    string;

  tenantId:
    string;

  store?:
    string;

  contextId?:
    string;

  contextVersion?:
    number;

  requestId:
    string;

  evidenceId:
    string;

  evidence:
    PulseInferenceEvidenceReceipt;

  recordedAt:
    string;

  registryHash:
    string;
}

export interface CreatePulseInferenceEvidenceRecordInput {
  tenantId:
    string;

  store?:
    string;

  contextId?:
    string;

  contextVersion?:
    number;

  receipt:
    PulseInferenceEvidenceReceipt;
}

export interface PulseInferenceEvidenceRegistryFilter {
  tenantId:
    string;

  requestId?:
    string;

  evidenceId?:
    string;
}

export interface PulseInferenceEvidenceRegistryValidation {
  valid:
    boolean;

  totalRecords:
    number;

  validRecords:
    number;

  invalidRecordIds:
    string[];
}

function normalizeText(
  value:
    unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function assertTenantId(
  value:
    string,
): void {
  if (!value) {
    throw new Error(
      "P0.7.2.5 tenantId must be non-empty.",
    );
  }

  if (value.includes("\u0000")) {
    throw new Error(
      "P0.7.2.5 tenantId contains a null byte.",
    );
  }

  if (
    value === "*" ||
    value === "global"
  ) {
    throw new Error(
      "P0.7.2.5 wildcard/global tenants are forbidden.",
    );
  }
}

function stableRecordId(
  tenantId:
    string,

  evidenceId:
    string,
): string {
  return (
    "pier_" +
    hashProposal({
      tenantId,
      evidenceId,
    })
  );
}

function calculateRegistryHash(
  base:
    Omit<
      PulseInferenceEvidenceRecord,
      "registryHash"
    >,
): string {
  return hashProposal(base);
}

function readRaw(): unknown[] {
  if (
    typeof localStorage ===
    "undefined"
  ) {
    return [];
  }

  try {
    const value =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY,
        ) || "[]",
      );

    return Array.isArray(value)
      ? value
      : [];
  } catch {
    return [];
  }
}

function writeRaw(
  records:
    PulseInferenceEvidenceRecord[],
): void {
  if (
    typeof localStorage ===
    "undefined"
  ) {
    throw new Error(
      "P0.7.2.5 localStorage is unavailable.",
    );
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      records.slice(
        -MAX_RECORDS,
      ),
    ),
  );
}

function normalizeRecord(
  raw:
    unknown,
): PulseInferenceEvidenceRecord | null {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return null;
  }

  const record =
    raw as Record<
      string,
      unknown
    >;

  if (
    typeof record.evidence !==
    "object" ||
    record.evidence === null
  ) {
    return null;
  }

  const rawEvidence =
    record.evidence as Record<
      string,
      unknown
    >;

  /*
   * JSON persistence drops properties whose value is undefined.
   *
   * The P0.7.2.4 evidence hash was generated over the canonical
   * object shape where optional properties existed as undefined.
   *
   * Rehydrate those optional keys before verification so the
   * exact same semantic object is reconstructed after persistence.
   */
  const evidence:
    PulseInferenceEvidenceReceipt = {
    contract:
      rawEvidence.contract as
        PulseInferenceEvidenceReceipt["contract"],

    evidenceId:
      String(
        rawEvidence.evidenceId || "",
      ),

    source:
      "pulse-inference-runtime",

    authority:
      "runtime-observation",

    requestId:
      String(
        rawEvidence.requestId || "",
      ),

    selectionFingerprint:
      String(
        rawEvidence.selectionFingerprint || "",
      ),

    selectionModelRef:
      String(
        rawEvidence.selectionModelRef || "",
      ),

    expectedRuntimeModelRef:
      String(
        rawEvidence.expectedRuntimeModelRef || "",
      ),

    runtimeModelRef:
      rawEvidence.runtimeModelRef ===
      undefined
        ? undefined
        : String(
            rawEvidence.runtimeModelRef,
          ),

    provider:
      String(
        rawEvidence.provider || "",
      ),

    status:
      rawEvidence.status as
        PulseInferenceEvidenceReceipt["status"],

    bindingStatus:
      rawEvidence.bindingStatus as
        PulseInferenceEvidenceReceipt["bindingStatus"],

    outputPresent:
      Boolean(
        rawEvidence.outputPresent,
      ),

    outputHash:
      rawEvidence.outputHash ===
      undefined
        ? undefined
        : String(
            rawEvidence.outputHash,
          ),

    failure:
      rawEvidence.failure ===
      undefined
        ? undefined
        : String(
            rawEvidence.failure,
          ),

    error:
      rawEvidence.error ===
      undefined
        ? undefined
        : String(
            rawEvidence.error,
          ),

    startedAt:
      rawEvidence.startedAt ===
      undefined
        ? undefined
        : String(
            rawEvidence.startedAt,
          ),

    completedAt:
      rawEvidence.completedAt ===
      undefined
        ? undefined
        : String(
            rawEvidence.completedAt,
          ),

    latencyMs:
      typeof rawEvidence.latencyMs ===
      "number"
        ? rawEvidence.latencyMs
        : undefined,

    issuedAt:
      String(
        rawEvidence.issuedAt || "",
      ),

    evidenceHash:
      String(
        rawEvidence.evidenceHash || "",
      ),
  };

  return {
    contract:
      record.contract as
        PulseInferenceEvidenceRecord["contract"],

    recordId:
      String(
        record.recordId || "",
      ),

    tenantId:
      String(
        record.tenantId || "",
      ),

    store:
      record.store === undefined
        ? undefined
        : String(
            record.store,
          ),

    contextId:
      record.contextId === undefined
        ? undefined
        : String(
            record.contextId,
          ),

    contextVersion:
      typeof record.contextVersion ===
      "number"
        ? record.contextVersion
        : undefined,

    requestId:
      String(
        record.requestId || "",
      ),

    evidenceId:
      String(
        record.evidenceId || "",
      ),

    evidence,

    recordedAt:
      String(
        record.recordedAt || "",
      ),

    registryHash:
      String(
        record.registryHash || "",
      ),
  };
}

function readRecords(): PulseInferenceEvidenceRecord[] {
  return readRaw()
    .map(normalizeRecord)
    .filter(
      (
        record,
      ): record is PulseInferenceEvidenceRecord =>
        record !== null,
    );
}

export function createPulseInferenceEvidenceRecord(
  input:
    CreatePulseInferenceEvidenceRecordInput,
): PulseInferenceEvidenceRecord {
  const tenantId =
    normalizeText(
      input.tenantId,
    );

  assertTenantId(
    tenantId,
  );

  if (
    !verifyPulseInferenceEvidence(
      input.receipt,
    )
  ) {
    throw new Error(
      "P0.7.2.5 cannot persist invalid inference evidence.",
    );
  }

  const requestId =
    normalizeText(
      input.receipt.requestId,
    );

  const evidenceId =
    normalizeText(
      input.receipt.evidenceId,
    );

  if (
    !requestId ||
    !evidenceId
  ) {
    throw new Error(
      "P0.7.2.5 inference evidence identity is incomplete.",
    );
  }

  const base: Omit<
    PulseInferenceEvidenceRecord,
    "registryHash"
  > = {
    contract:
      PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT,

    recordId:
      stableRecordId(
        tenantId,
        evidenceId,
      ),

    tenantId,

    store:
      normalizeText(
        input.store,
      ) || undefined,

    contextId:
      normalizeText(
        input.contextId,
      ) || undefined,

    contextVersion:
      input.contextVersion,

    requestId,

    evidenceId,

    evidence:
      input.receipt,

    recordedAt:
      new Date().toISOString(),
  };

  return {
    ...base,

    registryHash:
      calculateRegistryHash(
        base,
      ),
  };
}

export function verifyPulseInferenceEvidenceRecord(
  record:
    PulseInferenceEvidenceRecord,
): boolean {
  const {
    registryHash,
    ...base
  } = record;

  try {
    assertTenantId(
      normalizeText(
        record.tenantId,
      ),
    );
  } catch {
    return false;
  }

  if (
    record.contract !==
    PULSE_INFERENCE_EVIDENCE_REGISTRY_CONTRACT
  ) {
    return false;
  }

  if (
    !normalizeText(
      record.recordId,
    ) ||
    !normalizeText(
      record.requestId,
    ) ||
    !normalizeText(
      record.evidenceId,
    ) ||
    !normalizeText(
      record.recordedAt,
    )
  ) {
    return false;
  }

  if (
    record.recordId !==
    stableRecordId(
      record.tenantId,
      record.evidenceId,
    )
  ) {
    return false;
  }

  if (
    record.requestId !==
    record.evidence.requestId
  ) {
    return false;
  }

  if (
    record.evidenceId !==
    record.evidence.evidenceId
  ) {
    return false;
  }

  if (
    !verifyPulseInferenceEvidence(
      record.evidence,
    )
  ) {
    return false;
  }

  return (
    calculateRegistryHash(
      base,
    ) ===
    registryHash
  );
}

export function savePulseInferenceEvidenceRecord(
  record:
    PulseInferenceEvidenceRecord,
): PulseInferenceEvidenceRecord {
  if (
    !verifyPulseInferenceEvidenceRecord(
      record,
    )
  ) {
    throw new Error(
      "P0.7.2.5 cannot persist an invalid evidence record.",
    );
  }

  const records =
    readRecords();

  const existingIndex =
    records.findIndex(
      existing =>
        existing.recordId ===
        record.recordId,
    );

  if (
    existingIndex >= 0
  ) {
    const existing =
      records[
        existingIndex
      ];

    if (
      existing.registryHash !==
      record.registryHash
    ) {
      throw new Error(
        "P0.7.2.5 EVIDENCE_REPLAY_CONFLICT",
      );
    }

    return existing;
  }

  records.push(
    record,
  );

  writeRaw(
    records,
  );

  return record;
}

export function recordPulseInferenceEvidence(
  input:
    CreatePulseInferenceEvidenceRecordInput,
): PulseInferenceEvidenceRecord {
  const record =
    createPulseInferenceEvidenceRecord(
      input,
    );

  return savePulseInferenceEvidenceRecord(
    record,
  );
}

export function listPulseInferenceEvidenceRecords(
  filter:
    PulseInferenceEvidenceRegistryFilter,
): PulseInferenceEvidenceRecord[] {
  const tenantId =
    normalizeText(
      filter.tenantId,
    );

  assertTenantId(
    tenantId,
  );

  return readRecords()
    .filter(
      record =>
        record.tenantId ===
        tenantId,
    )
    .filter(
      record =>
        !filter.requestId ||
        record.requestId ===
          filter.requestId,
    )
    .filter(
      record =>
        !filter.evidenceId ||
        record.evidenceId ===
          filter.evidenceId,
    )
    .filter(
      record =>
        verifyPulseInferenceEvidenceRecord(
          record,
        ),
    );
}

export function findPulseInferenceEvidenceRecord(
  input:
    PulseInferenceEvidenceRegistryFilter & {
      evidenceId: string;
    },
): PulseInferenceEvidenceRecord | null {
  const rows =
    listPulseInferenceEvidenceRecords({
      tenantId:
        input.tenantId,
      requestId:
        input.requestId,
      evidenceId:
        input.evidenceId,
    });

  return rows[0] || null;
}

export function validatePulseInferenceEvidenceRegistry(
  tenantId?:
    string,
): PulseInferenceEvidenceRegistryValidation {
  const records =
    readRecords();

  const scoped =
    tenantId
      ? records.filter(
          record =>
            record.tenantId ===
            tenantId,
        )
      : records;

  const invalidRecordIds =
    scoped
      .filter(
        record =>
          !verifyPulseInferenceEvidenceRecord(
            record,
          ),
      )
      .map(
        record =>
          record.recordId,
      );

  return {
    valid:
      invalidRecordIds.length ===
      0,

    totalRecords:
      scoped.length,

    validRecords:
      scoped.length -
      invalidRecordIds.length,

    invalidRecordIds,
  };
}

export function countPulseInferenceEvidenceRecords(
  tenantId:
    string,
): number {
  return listPulseInferenceEvidenceRecords({
    tenantId,
  }).length;
}

export default
  recordPulseInferenceEvidence;
