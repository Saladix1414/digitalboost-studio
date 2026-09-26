import {
  hashProposal,
} from "./../DigitalBoostPulseContracts";

import {
  verifyPulseIntentReconciliation,
  type PulseIntentReconciliationResult,
} from "./DigitalBoostPulseIntentReconciliation";

export const PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION =
  "p0.7.2.9";

export const PULSE_INTENT_RECONCILIATION_STORAGE =
  "db-pulse-intent-reconciliation-v1";

const MAX_RECORDS = 800;

const WILDCARD_TENANTS = new Set([
  "*",
  "global",
  "all",
]);

export interface PulseIntentReconciliationRecord {
  readonly contractVersion: typeof PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION;
  readonly recordId: string;
  readonly tenantId: string;
  readonly store?: string;
  readonly contextId: string;
  readonly contextVersion: string;
  readonly requestId?: string;
  readonly reconciliationId: string;
  readonly relation:
    PulseIntentReconciliationResult["relation"];
  readonly reconciliation:
    PulseIntentReconciliationResult;
  readonly recordedAt: string;
  readonly registryHash: string;
}

export class PulseIntentReconciliationRegistryError
  extends Error
{
  readonly code:
    | "INVALID_TENANT"
    | "WILDCARD_TENANT"
    | "TENANT_MISMATCH"
    | "INVALID_RECONCILIATION"
    | "INVALID_RECORD"
    | "RECORD_NOT_FOUND"
    | "RECONCILIATION_REPLAY_CONFLICT"
    | "REGISTRY_TAMPERED";

  constructor(
    code: PulseIntentReconciliationRegistryError["code"],
    message: string,
  ) {
    super(message);
    this.name =
      "PulseIntentReconciliationRegistryError";
    this.code = code;
  }
}

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function storage(): StorageLike {
  const candidate = (
    globalThis as {
      localStorage?: StorageLike;
    }
  ).localStorage;

  if (
    candidate === undefined ||
    typeof candidate.getItem !== "function" ||
    typeof candidate.setItem !== "function"
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "localStorage is unavailable for the reconciliation registry.",
    );
  }

  return candidate;
}

function normalizeTenantId(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_TENANT",
      "tenantId must be a non-empty string.",
    );
  }

  const tenantId = value.trim();

  if (!tenantId) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_TENANT",
      "tenantId must be a non-empty string.",
    );
  }

  if (tenantId.includes("\u0000")) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_TENANT",
      "tenantId contains a null byte.",
    );
  }

  if (
    WILDCARD_TENANTS.has(
      tenantId.toLowerCase(),
    )
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "WILDCARD_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenantId;
}

function normalizeOptionalString(
  value: unknown,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Optional string fields must be strings or undefined.",
    );
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function canonicalize(
  value: unknown,
): unknown {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== "object"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  const object =
    value as Record<
      string,
      unknown
    >;

  return Object.keys(object)
    .sort()
    .reduce(
      (
        output,
        key,
      ) => {
        output[key] =
          canonicalize(object[key]);
        return output;
      },
      {} as Record<
        string,
        unknown
      >,
    );
}

function canonicalJson(
  value: unknown,
): string {
  return JSON.stringify(
    canonicalize(value),
  );
}

function recordHashInput(
  record: Omit<
    PulseIntentReconciliationRecord,
    "registryHash"
  >,
): string {
  return canonicalJson({
    contractVersion:
      record.contractVersion,
    recordId:
      record.recordId,
    tenantId:
      record.tenantId,
    store:
      record.store,
    contextId:
      record.contextId,
    contextVersion:
      record.contextVersion,
    requestId:
      record.requestId,
    reconciliationId:
      record.reconciliationId,
    relation:
      record.relation,
    reconciliation:
      record.reconciliation,
    recordedAt:
      record.recordedAt,
  });
}

function calculateRegistryHash(
  record: Omit<
    PulseIntentReconciliationRecord,
    "registryHash"
  >,
): string {
  return hashProposal(
    recordHashInput(record),
  );
}

function calculateRecordId(
  input: {
    tenantId: string;
    contextId: string;
    contextVersion: string;
    reconciliationId: string;
  },
): string {
  return (
    "pulse-intent-reconciliation:" +
    hashProposal(
      canonicalJson({
        tenantId:
          input.tenantId,
        contextId:
          input.contextId,
        contextVersion:
          input.contextVersion,
        reconciliationId:
          input.reconciliationId,
      }),
    )
  );
}

function normalizeRecord(
  raw: unknown,
): PulseIntentReconciliationRecord {
  if (
    raw === null ||
    typeof raw !== "object"
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Persisted reconciliation record is not an object.",
    );
  }

  const value =
    raw as Record<
      string,
      unknown
    >;

  const tenantId =
    normalizeTenantId(
      value.tenantId,
    );

  const store =
    normalizeOptionalString(
      value.store,
    );

  const requestId =
    normalizeOptionalString(
      value.requestId,
    );

  const contextId =
    typeof value.contextId ===
      "string"
      ? value.contextId.trim()
      : "";

  const contextVersion =
    typeof value.contextVersion ===
      "string"
      ? value.contextVersion.trim()
      : "";

  const recordId =
    typeof value.recordId ===
      "string"
      ? value.recordId.trim()
      : "";

  const reconciliationId =
    typeof value.reconciliationId ===
      "string"
      ? value.reconciliationId.trim()
      : "";

  const recordedAt =
    typeof value.recordedAt ===
      "string"
      ? value.recordedAt
      : "";

  const contractVersion =
    value.contractVersion;

  const reconciliation =
    value.reconciliation;

  const relation =
    value.relation;

  const registryHash =
    typeof value.registryHash ===
      "string"
      ? value.registryHash
      : "";

  if (
    contractVersion !==
    PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Invalid reconciliation registry contract.",
    );
  }

  if (!recordId) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "recordId is required.",
    );
  }

  if (!contextId) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "contextId is required.",
    );
  }

  if (!contextVersion) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "contextVersion is required.",
    );
  }

  if (!reconciliationId) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "reconciliationId is required.",
    );
  }

  if (!recordedAt) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "recordedAt is required.",
    );
  }

  if (!reconciliation) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "reconciliation is required.",
    );
  }

  if (
    !verifyPulseIntentReconciliation(
      reconciliation as PulseIntentReconciliationResult,
    )
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECONCILIATION",
      "Persisted reconciliation failed canonical verification.",
    );
  }

  if (
    (
      reconciliation as PulseIntentReconciliationResult
    ).tenantId !== tenantId
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "TENANT_MISMATCH",
      "Reconciliation tenant does not match record tenant.",
    );
  }

  if (
    (
      reconciliation as PulseIntentReconciliationResult
    ).contextId !== contextId
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Reconciliation contextId does not match record contextId.",
    );
  }

  if (
    (
      reconciliation as PulseIntentReconciliationResult
    ).contextVersion !==
    contextVersion
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Reconciliation contextVersion does not match record contextVersion.",
    );
  }

  if (
    (
      reconciliation as PulseIntentReconciliationResult
    ).reconciliationId !==
    reconciliationId
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Reconciliation ID does not match record reconciliationId.",
    );
  }

  if (
    relation !==
    (
      reconciliation as PulseIntentReconciliationResult
    ).relation
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECORD",
      "Record relation does not match reconciliation relation.",
    );
  }

  if (!registryHash) {
    throw new PulseIntentReconciliationRegistryError(
      "REGISTRY_TAMPERED",
      "Registry hash is missing.",
    );
  }

  const withoutHash =
    {
      contractVersion:
        PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION,
      recordId,
      tenantId,
      store,
      contextId,
      contextVersion,
      requestId,
      reconciliationId,
      relation:
        relation as PulseIntentReconciliationResult["relation"],
      reconciliation:
        reconciliation as PulseIntentReconciliationResult,
      recordedAt,
    };

  const expectedHash =
    calculateRegistryHash(
      withoutHash,
    );

  if (
    expectedHash !==
    registryHash
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "REGISTRY_TAMPERED",
      "Reconciliation registry hash verification failed.",
    );
  }

  return {
    contractVersion:
      PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION,
    recordId,
    tenantId,
    store,
    contextId,
    contextVersion,
    requestId,
    reconciliationId,
    relation:
      relation as PulseIntentReconciliationResult["relation"],
    reconciliation:
      reconciliation as PulseIntentReconciliationResult,
    recordedAt,
    registryHash,
  };
}

function readAllRaw(): unknown[] {
  const raw =
    storage().getItem(
      PULSE_INTENT_RECONCILIATION_STORAGE,
    );

  if (raw === null) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(raw);
  } catch {
    throw new PulseIntentReconciliationRegistryError(
      "REGISTRY_TAMPERED",
      "Reconciliation registry JSON could not be parsed.",
    );
  }

  if (!Array.isArray(parsed)) {
    throw new PulseIntentReconciliationRegistryError(
      "REGISTRY_TAMPERED",
      "Reconciliation registry root must be an array.",
    );
  }

  return parsed;
}

function readAllValidated(): PulseIntentReconciliationRecord[] {
  return readAllRaw().map(
    normalizeRecord,
  );
}

function writeAll(
  records: PulseIntentReconciliationRecord[],
): void {
  storage().setItem(
    PULSE_INTENT_RECONCILIATION_STORAGE,
    JSON.stringify(records),
  );
}

export function createPulseIntentReconciliationRecord(
  input: {
    tenantId: string;
    store?: string;
    requestId?: string;
    reconciliation:
      PulseIntentReconciliationResult;
    recordedAt?: string;
  },
): PulseIntentReconciliationRecord {
  const tenantId =
    normalizeTenantId(
      input.tenantId,
    );

  const reconciliation =
    input.reconciliation;

  if (
    !verifyPulseIntentReconciliation(
      reconciliation,
    )
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECONCILIATION",
      "Cannot persist an invalid intent reconciliation.",
    );
  }

  if (
    reconciliation.tenantId !==
    tenantId
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "TENANT_MISMATCH",
      "Reconciliation tenant does not match registry tenant.",
    );
  }

  const store =
    normalizeOptionalString(
      input.store,
    );

  const requestId =
    normalizeOptionalString(
      input.requestId,
    );

  const contextId =
    reconciliation.contextId.trim();

  const contextVersion =
    reconciliation.contextVersion.trim();

  const reconciliationId =
    reconciliation.reconciliationId.trim();

  if (
    !contextId ||
    !contextVersion ||
    !reconciliationId
  ) {
    throw new PulseIntentReconciliationRegistryError(
      "INVALID_RECONCILIATION",
      "Reconciliation must contain contextId, contextVersion and reconciliationId.",
    );
  }

  const recordId =
    calculateRecordId({
      tenantId,
      contextId,
      contextVersion,
      reconciliationId,
    });

  const withoutHash: Omit<
    PulseIntentReconciliationRecord,
    "registryHash"
  > = {
    contractVersion:
      PULSE_INTENT_RECONCILIATION_REGISTRY_VERSION,
    recordId,
    tenantId,
    store,
    contextId,
    contextVersion,
    requestId,
    reconciliationId,
    relation:
      reconciliation.relation,
    reconciliation,
    recordedAt:
      input.recordedAt ??
      new Date().toISOString(),
  };

  return {
    ...withoutHash,
    registryHash:
      calculateRegistryHash(
        withoutHash,
      ),
  };
}

export function verifyPulseIntentReconciliationRecord(
  record:
    PulseIntentReconciliationRecord,
): boolean {
  try {
    normalizeRecord(record);
    return true;
  } catch {
    return false;
  }
}

export function validatePulseIntentReconciliationRegistry(): number {
  const records =
    readAllValidated();

  const seen = new Set<string>();

  for (const record of records) {
    const tenantKey =
      `${record.tenantId}::${record.recordId}`;

    if (seen.has(tenantKey)) {
      throw new PulseIntentReconciliationRegistryError(
        "RECONCILIATION_REPLAY_CONFLICT",
        `Duplicate reconciliation record: ${tenantKey}`,
      );
    }

    seen.add(tenantKey);
  }

  return records.length;
}

export function savePulseIntentReconciliationRecord(
  record:
    PulseIntentReconciliationRecord,
): PulseIntentReconciliationRecord {
  const normalized =
    normalizeRecord(record);

  const records =
    readAllValidated();

  const index =
    records.findIndex(
      (candidate) =>
        candidate.tenantId ===
          normalized.tenantId &&
        candidate.recordId ===
          normalized.recordId,
    );

  if (index >= 0) {
    const existing =
      records[index];

    if (
      existing.registryHash ===
      normalized.registryHash
    ) {
      return existing;
    }

    throw new PulseIntentReconciliationRegistryError(
      "RECONCILIATION_REPLAY_CONFLICT",
      `Record ${normalized.recordId} already exists with different durable state.`,
    );
  }

  const next = [
    ...records,
    normalized,
  ];

  while (
    next.length >
    MAX_RECORDS
  ) {
    next.shift();
  }

  writeAll(next);

  return normalized;
}

export function getPulseIntentReconciliationRecord(
  input: {
    tenantId: string;
    recordId: string;
  },
): PulseIntentReconciliationRecord {
  const tenantId =
    normalizeTenantId(
      input.tenantId,
    );

  const recordId =
    typeof input.recordId ===
    "string"
      ? input.recordId.trim()
      : "";

  if (!recordId) {
    throw new PulseIntentReconciliationRegistryError(
      "RECORD_NOT_FOUND",
      "recordId is required.",
    );
  }

  const records =
    readAllValidated();

  const record =
    records.find(
      (candidate) =>
        candidate.tenantId ===
          tenantId &&
        candidate.recordId ===
          recordId,
    );

  if (!record) {
    throw new PulseIntentReconciliationRegistryError(
      "RECORD_NOT_FOUND",
      `Reconciliation record ${recordId} was not found for tenant ${tenantId}.`,
    );
  }

  return record;
}

export function listPulseIntentReconciliationRecords(
  input: {
    tenantId: string;
  },
): PulseIntentReconciliationRecord[] {
  const tenantId =
    normalizeTenantId(
      input.tenantId,
    );

  return readAllValidated().filter(
    (record) =>
      record.tenantId ===
      tenantId,
  );
}

