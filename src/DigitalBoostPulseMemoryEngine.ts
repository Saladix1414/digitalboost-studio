import {
  findPulseExecutionAudit,
} from "./DigitalBoostPulseLog";

import {
  verifyPulseExecutionAttestation,
  type PulseExecutionAttestation,
} from "./DigitalBoostPulseOutcomeProof";

export const PULSE_MEMORY_ENGINE_CONTRACT = "p0.6";

export type PulseMemoryKind =
  | "working"
  | "session"
  | "episodic"
  | "semantic"
  | "preference"
  | "decision"
  | "mission"
  | "operational"
  | "audit"
  | "playbook"
  | "lesson";

export type PulseMemoryStatus =
  | "ACTIVE"
  | "STALE"
  | "SUPERSEDED"
  | "REJECTED";

export type PulseMemoryTrust =
  | "UNTRUSTED"
  | "OBSERVED"
  | "VERIFIED"
  | "GOVERNED";

export type PulseMemorySourceType =
  | "MERCHANT"
  | "GOVERNANCE"
  | "EXECUTOR"
  | "VERIFICATION"
  | "PREFERENCE_UI"
  | "LEGACY";

export type PulseMemoryIdentityMode =
  | "EXPLICIT_TENANT"
  | "LEGACY_SCOPE";

export type PulseMemoryReconciliationAction =
  | "REAFFIRM"
  | "REPLACE"
  | "EXPIRE"
  | "REJECT";

export type PulseMemoryReconciliationResult = {
  ok: boolean;
  action: PulseMemoryReconciliationAction;
  memory?: PulseMemoryItem;
  replacement?: PulseMemoryItem;
  conflictIds?: string[];
  reason?: string;
};

export type PulseMemoryReplacementInput = {
  scope?: string;
  store?: string;
  kind?: PulseMemoryKind;
  content?: unknown;
  source?: string;
  evidenceRefs?: string[];
  confidence?: number;
  validUntil?: string;
  contextId?: string;
  contextVersion?: string;
  goalId?: string;
  missionId?: string;
  outcomeId?: string;
  proofHash?: string;
};

export type PulseMemoryItem = {
  id: string;

  /*
   * Legacy compatibility.
   *
   * scope remains available because existing callers use store/scope
   * as the historical namespace.
   */
  scope: string;

  /*
   * P0.6 explicit isolation boundary.
   */
  tenantId: string;

  /*
   * Optional resource-level identity.
   */
  store?: string;

  kind: PulseMemoryKind;
  content: unknown;

  source: string;
  sourceType: PulseMemorySourceType;

  evidenceRefs: string[];

  confidence: number;

  validFrom: string;
  validUntil?: string;

  createdAt: string;
  verifiedAt?: string;

  contextId?: string;
  contextVersion?: string;

  goalId?: string;
  missionId?: string;
  outcomeId?: string;
  proofHash?: string;

  supersedes?: string;
  supersededBy?: string;

  /*
   * Claim-level identity used for lifecycle reconciliation.
   *
   * This is NOT a cryptographic authority.
   */
  reconciliationFingerprint: string;

  /*
   * Lifecycle provenance.
   */
  lifecycleReason?: string;
  lifecycleAt?: string;
  lifecycleVersion?: number;

  status: PulseMemoryStatus;
  trust: PulseMemoryTrust;

  memoryVersion: 2;
  identityMode: PulseMemoryIdentityMode;

  /*
   * Deterministic semantic identity.
   *
   * This is an integrity/identity fingerprint, NOT a cryptographic
   * authority and must never be treated as one.
   */
  semanticFingerprint: string;
};

const KEY = "db-pulse-memory-v1";
const MAX_ROWS = 400;

const ALLOWED_SOURCES = new Set([
  "merchant",
  "governance",
  "executor",
  "verification",
  "preference-ui",
]);

function assertTenantId(value: string): void {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("P0.6 memory tenantId must be a non-empty string.");
  }

  if (value.includes("\u0000")) {
    throw new Error("P0.6 memory tenantId contains a null byte.");
  }

  if (value === "*" || value === "global") {
    throw new Error("P0.6 memory wildcard/global tenants are forbidden.");
  }
}

function memoryExpiryState(
  row: PulseMemoryItem,
  now = Date.now(),
): "VALID" | "EXPIRED" | "INVALID" {
  if (!row.validUntil) return "VALID";

  const expiresAt = Date.parse(row.validUntil);

  if (!Number.isFinite(expiresAt)) {
    return "INVALID";
  }

  return expiresAt <= now ? "EXPIRED" : "VALID";
}

export type PulseMemoryVerificationEvidence = {
  executionAttestation?: PulseExecutionAttestation;
};

function hasDurableVerificationEvidence(input: {
  tenantId: string;
  row: PulseMemoryItem;
  evidenceRefs: string[];
  evidence?: PulseMemoryVerificationEvidence;
}): boolean {
  const attestation =
    input.evidence?.executionAttestation;

  if (!attestation) {
    return false;
  }

  if (!verifyPulseExecutionAttestation(attestation)) {
    return false;
  }

  if (
    !input.evidenceRefs.includes(
      attestation.execution_audit_id,
    )
  ) {
    return false;
  }

  const audit = findPulseExecutionAudit({
    requestId:
      attestation.execution_request_id,
    missionId:
      attestation.mission_id,
    planId:
      attestation.plan_id,
    stepId:
      attestation.step_id,
    stepIndex:
      attestation.step_index,
    timestamp:
      attestation.execution_audit_timestamp,
    event:
      attestation.execution_audit_event,
    executionAuditId:
      attestation.execution_audit_id,
  });

  if (!audit) {
    return false;
  }

  if (audit.tenant_id !== input.tenantId) {
    return false;
  }

  if (
    input.row.store &&
    audit.store_id !== input.row.store
  ) {
    return false;
  }

  if (
    input.row.missionId &&
    audit.mission_id !== input.row.missionId
  ) {
    return false;
  }

  if (audit.status !== "COMPLETED") {
    return false;
  }

  if (audit.verified !== true) {
    return false;
  }

  return true;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeText(value);
    if (!normalized) continue;
    if (!result.includes(normalized)) result.push(normalized);
  }

  return result;
}

function clampConfidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.7;
  }

  return Math.max(0, Math.min(1, value));
}

function stableNormalize(value: unknown): unknown {
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map(stableNormalize);
  }

  if (typeof value === "object") {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(source).sort()) {
      const item = source[key];

      if (typeof item === "undefined") {
        continue;
      }

      result[key] = stableNormalize(item);
    }

    return result;
  }

  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableNormalize(value));
}

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function deriveSourceType(source: string): PulseMemorySourceType {
  switch (source) {
    case "merchant":
      return "MERCHANT";
    case "governance":
      return "GOVERNANCE";
    case "executor":
      return "EXECUTOR";
    case "verification":
      return "VERIFICATION";
    case "preference-ui":
      return "PREFERENCE_UI";
    default:
      return "LEGACY";
  }
}

function newId(): string {
  return (
    "mem_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function readRaw(): unknown[] {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeLegacyRow(raw: unknown): PulseMemoryItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const row = raw as Record<string, unknown>;

  const scope =
    normalizeText(row.scope) ||
    normalizeText(row.store) ||
    "";

  if (!scope) {
    return null;
  }

  const tenantId =
    normalizeText(row.tenantId) ||
    scope;

  const source = normalizeText(row.source);

  const evidenceRefs = uniqueStrings(row.evidenceRefs);

  const validFrom =
    normalizeText(row.validFrom) ||
    normalizeText(row.createdAt) ||
    new Date(0).toISOString();

  const createdAt =
    normalizeText(row.createdAt) ||
    validFrom;

  const content = row.content;

  const canonical = {
    scope,
    tenantId,
    store: normalizeText(row.store) || scope,
    kind: normalizeText(row.kind),
    content,
    source,
    sourceType:
      normalizeText(row.sourceType) ||
      deriveSourceType(source),
    evidenceRefs,
    confidence: clampConfidence(row.confidence),
    validFrom,
    validUntil:
      normalizeText(row.validUntil) || undefined,
    contextId:
      normalizeText(row.contextId) || undefined,
    contextVersion:
      normalizeText(row.contextVersion) || undefined,
    goalId:
      normalizeText(row.goalId) || undefined,
    missionId:
      normalizeText(row.missionId) || undefined,
    outcomeId:
      normalizeText(row.outcomeId) || undefined,
    proofHash:
      normalizeText(row.proofHash) || undefined,
    supersedes:
      normalizeText(row.supersedes) || undefined,
    supersededBy:
      normalizeText(row.supersededBy) || undefined,
    reconciliationFingerprint:
      normalizeText(row.reconciliationFingerprint) ||
      fingerprintMemoryClaim({
        ...row,
        scope,
        tenantId,
        store:
          normalizeText(row.store) || scope,
      }),
  };

  const semanticFingerprint =
    normalizeText(row.semanticFingerprint) ||
    fingerprintMemorySemantic(canonical);

  return {
    id:
      normalizeText(row.id) ||
      newId(),

    scope,

    tenantId,

    store:
      normalizeText(row.store) ||
      scope,

    kind:
      canonical.kind as PulseMemoryKind,

    content,

    source,

    sourceType:
      canonical.sourceType as PulseMemorySourceType,

    evidenceRefs,

    confidence:
      canonical.confidence,

    validFrom,

    validUntil:
      canonical.validUntil,

    createdAt,

    verifiedAt:
      normalizeText(row.verifiedAt) ||
      undefined,

    contextId:
      canonical.contextId,

    contextVersion:
      canonical.contextVersion,

    goalId:
      canonical.goalId,

    missionId:
      canonical.missionId,

    outcomeId:
      canonical.outcomeId,

    proofHash:
      canonical.proofHash,

    supersedes:
      canonical.supersedes,

    supersededBy:
      canonical.supersededBy,

    reconciliationFingerprint:
      canonical.reconciliationFingerprint,

    lifecycleReason:
      normalizeText(row.lifecycleReason) ||
      undefined,

    lifecycleAt:
      normalizeText(row.lifecycleAt) ||
      undefined,

    lifecycleVersion:
      typeof row.lifecycleVersion === "number"
        ? row.lifecycleVersion
        : undefined,

    status:
      (normalizeText(row.status) ||
        "ACTIVE") as PulseMemoryStatus,

    /*
     * Legacy persisted records are never automatically trusted.
     */
    trust:
      (normalizeText(row.trust) ||
        "UNTRUSTED") as PulseMemoryTrust,

    memoryVersion: 2,

    identityMode:
      row.tenantId
        ? "EXPLICIT_TENANT"
        : "LEGACY_SCOPE",

    semanticFingerprint,
  };
}

function readAll(): PulseMemoryItem[] {
  return readRaw()
    .map(normalizeLegacyRow)
    .filter(function (row): row is PulseMemoryItem {
      return row !== null;
    });
}

function writeAll(rows: PulseMemoryItem[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(rows.slice(-MAX_ROWS)),
    );
  } catch {
    /*
     * Preserve existing fail-safe storage semantics.
     */
  }
}

export function fingerprintMemoryClaim(
  input: Partial<PulseMemoryItem>,
): string {
  const canonical = {
    scope: normalizeText(input.scope),
    tenantId: normalizeText(input.tenantId),
    store: normalizeText(input.store),
    kind: input.kind || "",
    content: input.content,
    contextId:
      normalizeText(input.contextId) || undefined,
    contextVersion:
      normalizeText(input.contextVersion) || undefined,
    goalId:
      normalizeText(input.goalId) || undefined,
    missionId:
      normalizeText(input.missionId) || undefined,
    outcomeId:
      normalizeText(input.outcomeId) || undefined,
  };

  return "p0.6-claim-fnv1a32:" +
    fnv1a32(stableStringify(canonical));
}

export function fingerprintMemorySemantic(
  input: Partial<PulseMemoryItem>,
): string {
  const canonical = {
    scope: normalizeText(input.scope),
    tenantId: normalizeText(input.tenantId),
    store: normalizeText(input.store),
    kind: input.kind || "",
    content: input.content,
    source: normalizeText(input.source),
    sourceType:
      input.sourceType ||
      deriveSourceType(normalizeText(input.source)),
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    confidence: clampConfidence(input.confidence),
    validFrom: normalizeText(input.validFrom),
    validUntil:
      normalizeText(input.validUntil) || undefined,
    contextId:
      normalizeText(input.contextId) || undefined,
    contextVersion:
      normalizeText(input.contextVersion) || undefined,
    goalId:
      normalizeText(input.goalId) || undefined,
    missionId:
      normalizeText(input.missionId) || undefined,
    outcomeId:
      normalizeText(input.outcomeId) || undefined,
    proofHash:
      normalizeText(input.proofHash) || undefined,
    supersedes:
      normalizeText(input.supersedes) || undefined,
  };

  return "p0.6-fnv1a32:" + fnv1a32(stableStringify(canonical));
}

export function listPulseMemory(): PulseMemoryItem[] {
  return readAll();
}

export type PulseMemoryQuery = {
  kind?: PulseMemoryKind;
  scope?: string;
  status?: PulseMemoryStatus;
  tenantId?: string;
  store?: string;
  trust?: PulseMemoryTrust;
};

export function queryPulseMemory(
  filter: PulseMemoryQuery = {},
): PulseMemoryItem[] {
  if (filter.tenantId) {
    assertTenantId(filter.tenantId);
  }

  return readAll().filter(function (row) {
    if (filter.kind && row.kind !== filter.kind) {
      return false;
    }

    if (filter.scope && row.scope !== filter.scope) {
      return false;
    }

    if (filter.status && row.status !== filter.status) {
      return false;
    }

    if (filter.tenantId && row.tenantId !== filter.tenantId) {
      return false;
    }

    if (filter.store && row.store !== filter.store) {
      return false;
    }

    if (filter.trust && row.trust !== filter.trust) {
      return false;
    }

    return true;
  });
}

export type RememberPulseInput = {
  kind: PulseMemoryKind;
  scope: string;

  /*
   * P0.6 explicit tenant boundary.
   *
   * Optional only for backwards compatibility.
   * Omission activates LEGACY_SCOPE mode.
   */
  tenantId?: string;

  store?: string;

  content: unknown;
  source: string;

  evidenceRefs?: string[];
  confidence?: number;
  validUntil?: string;
  verifiedAt?: string;
  supersedes?: string;

  contextId?: string;
  contextVersion?: string;
  goalId?: string;
  missionId?: string;
  outcomeId?: string;
  proofHash?: string;
};

export function rememberPulse(
  input: RememberPulseInput,
): PulseMemoryItem | null {
  if (!ALLOWED_SOURCES.has(input.source)) {
    return null;
  }

  if (
    input.kind === "working" ||
    input.kind === "session"
  ) {
    return null;
  }

  const scope = normalizeText(input.scope);

  if (!scope) {
    return null;
  }

  const explicitTenant =
    normalizeText(input.tenantId);

  const tenantId =
    explicitTenant ||
    scope;

  try {
    assertTenantId(tenantId);
  } catch {
    return null;
  }

  const now = new Date().toISOString();

  const itemWithoutFingerprint: Partial<PulseMemoryItem> = {
    scope,
    tenantId,
    store:
      normalizeText(input.store) ||
      scope,
    kind: input.kind,
    content: input.content,
    source: input.source,
    sourceType:
      deriveSourceType(input.source),
    evidenceRefs:
      uniqueStrings(input.evidenceRefs),
    confidence:
      clampConfidence(input.confidence),
    validFrom: now,
    validUntil:
      normalizeText(input.validUntil) ||
      undefined,
    contextId:
      normalizeText(input.contextId) ||
      undefined,
    contextVersion:
      normalizeText(input.contextVersion) ||
      undefined,
    goalId:
      normalizeText(input.goalId) ||
      undefined,
    missionId:
      normalizeText(input.missionId) ||
      undefined,
    outcomeId:
      normalizeText(input.outcomeId) ||
      undefined,
    proofHash:
      normalizeText(input.proofHash) ||
      undefined,
    supersedes:
      normalizeText(input.supersedes) ||
      undefined,

    reconciliationFingerprint:
      fingerprintMemoryClaim({
        scope,
        tenantId,
        store:
          normalizeText(input.store) ||
          scope,
        kind: input.kind,
        content: input.content,
        contextId:
          normalizeText(input.contextId) ||
          undefined,
        contextVersion:
          normalizeText(input.contextVersion) ||
          undefined,
        goalId:
          normalizeText(input.goalId) ||
          undefined,
        missionId:
          normalizeText(input.missionId) ||
          undefined,
        outcomeId:
          normalizeText(input.outcomeId) ||
          undefined,
      }),
  };

  const semanticFingerprint =
    fingerprintMemorySemantic(
      itemWithoutFingerprint,
    );

  const item: PulseMemoryItem = {
    ...(itemWithoutFingerprint as Omit<
      PulseMemoryItem,
      | "id"
      | "createdAt"
      | "status"
      | "trust"
      | "memoryVersion"
      | "identityMode"
      | "semanticFingerprint"
    >),

    id: newId(),

    createdAt: now,

    /*
     * IMPORTANT:
     * caller-provided verifiedAt is metadata only.
     * It NEVER promotes trust.
     */
    verifiedAt:
      normalizeText(input.verifiedAt) ||
      undefined,

    status: "ACTIVE",

    trust: "OBSERVED",

    lifecycleVersion: 1,

    memoryVersion: 2,

    identityMode:
      explicitTenant
        ? "EXPLICIT_TENANT"
        : "LEGACY_SCOPE",

    semanticFingerprint,
  };

  const rows = readAll();

  if (input.supersedes) {
    const previousIndex = rows.findIndex(
      function (row) {
        return row.id === input.supersedes;
      },
    );

    if (previousIndex >= 0) {
      const previous = rows[previousIndex];

      if (
        previous.tenantId !== item.tenantId ||
        previous.scope !== item.scope
      ) {
        /*
         * Cross-tenant / cross-scope supersession is forbidden.
         */
        return null;
      }

      if (previous.status === "ACTIVE") {
        const lifecycleAt =
          new Date().toISOString();

        rows[previousIndex] = {
          ...previous,
          status: "SUPERSEDED",
          supersededBy: item.id,
          lifecycleReason: "REPLACED",
          lifecycleAt,
          lifecycleVersion:
            (previous.lifecycleVersion || 0) + 1,
        };
      }
    }
  }

  rows.push(item);

  writeAll(rows);

  return item;
}


export function findPulseMemoryActiveConflicts(input: {
  tenantId: string;
  reconciliationFingerprint: string;
  excludeId?: string;
}): PulseMemoryItem[] {
  try {
    assertTenantId(input.tenantId);
  } catch {
    return [];
  }

  return readAll().filter(function (row) {
    return (
      row.tenantId === input.tenantId &&
      row.status === "ACTIVE" &&
      row.reconciliationFingerprint ===
        input.reconciliationFingerprint &&
      row.id !== input.excludeId
    );
  });
}

export function getPulseMemoryLineage(input: {
  id: string;
  tenantId: string;
  maxDepth?: number;
}): PulseMemoryItem[] {
  try {
    assertTenantId(input.tenantId);
  } catch {
    return [];
  }

  const rows = readAll().filter(
    (row) => row.tenantId === input.tenantId,
  );

  const current = rows.find(
    (row) => row.id === input.id,
  );

  if (!current) return [];

  const maxDepth = Math.max(
    1,
    Math.min(
      input.maxDepth || 50,
      100,
    ),
  );

  const byId = new Map(
    rows.map((row) => [row.id, row]),
  );

  /*
   * Phase 1:
   * walk backward through supersedes until the oldest
   * reachable ancestor is found.
   */
  const backward: PulseMemoryItem[] = [];
  const backwardSeen = new Set<string>();

  let cursor: PulseMemoryItem | undefined =
    current;

  while (
    cursor &&
    !backwardSeen.has(cursor.id) &&
    backward.length < maxDepth
  ) {
    backwardSeen.add(cursor.id);
    backward.push(cursor);

    cursor = cursor.supersedes
      ? byId.get(cursor.supersedes)
      : undefined;
  }

  /*
   * Phase 2:
   * start at the oldest ancestor and walk forward
   * exclusively through supersededBy.
   *
   * This makes the lineage order deterministic:
   * oldest -> newest.
   */
  const lineage =
    [...backward].reverse();

  const forwardSeen =
    new Set(
      lineage.map(
        (row) => row.id,
      ),
    );

  cursor =
    lineage[lineage.length - 1];

  while (
    cursor &&
    lineage.length < maxDepth
  ) {
    const successorId =
      cursor.supersededBy;

    if (!successorId) {
      break;
    }

    if (forwardSeen.has(successorId)) {
      break;
    }

    const successor =
      byId.get(successorId);

    if (!successor) {
      break;
    }

    forwardSeen.add(
      successor.id,
    );

    lineage.push(
      successor,
    );

    cursor = successor;
  }

  return lineage;
}

export function reconcilePulseMemory(input: {
  id: string;
  tenantId: string;
  action: PulseMemoryReconciliationAction;
  reason: string;
  now?: number;
  replacement?: PulseMemoryReplacementInput;
}): PulseMemoryReconciliationResult {
  try {
    assertTenantId(input.tenantId);
  } catch {
    return {
      ok: false,
      action: input.action,
      reason: "INVALID_TENANT",
    };
  }

  const rows = readAll();

  const index = rows.findIndex(
    (row) =>
      row.id === input.id &&
      row.tenantId === input.tenantId,
  );

  if (index < 0) {
    return {
      ok: false,
      action: input.action,
      reason: "MEMORY_NOT_FOUND",
    };
  }

  const current = rows[index];
  const now =
    input.now ?? Date.now();
  const lifecycleAt =
    new Date(now).toISOString();

  if (
    input.action === "REAFFIRM"
  ) {
    if (current.status !== "ACTIVE") {
      return {
        ok: false,
        action: input.action,
        reason: "MEMORY_NOT_ACTIVE",
      };
    }

    if (
      memoryExpiryState(
        current,
        now,
      ) !== "VALID"
    ) {
      return {
        ok: false,
        action: input.action,
        reason: "MEMORY_EXPIRED",
      };
    }

    const next = {
      ...current,
      lifecycleReason: input.reason,
      lifecycleAt,
      lifecycleVersion:
        (current.lifecycleVersion || 0) + 1,
    };

    rows[index] = next;
    writeAll(rows);

    return {
      ok: true,
      action: input.action,
      memory: next,
    };
  }

  if (
    input.action === "EXPIRE"
  ) {
    if (current.status !== "ACTIVE") {
      return {
        ok: false,
        action: input.action,
        reason: "MEMORY_NOT_ACTIVE",
      };
    }

    const next = {
      ...current,
      status: "STALE" as const,
      lifecycleReason: input.reason,
      lifecycleAt,
      lifecycleVersion:
        (current.lifecycleVersion || 0) + 1,
    };

    rows[index] = next;
    writeAll(rows);

    return {
      ok: true,
      action: input.action,
      memory: next,
    };
  }

  if (
    input.action === "REJECT"
  ) {
    if (
      current.status ===
      "SUPERSEDED"
    ) {
      return {
        ok: false,
        action: input.action,
        reason: "MEMORY_SUPERSEDED",
      };
    }

    const next = {
      ...current,
      status: "REJECTED" as const,
      lifecycleReason: input.reason,
      lifecycleAt,
      lifecycleVersion:
        (current.lifecycleVersion || 0) + 1,
    };

    rows[index] = next;
    writeAll(rows);

    return {
      ok: true,
      action: input.action,
      memory: next,
    };
  }

  if (
    input.action === "REPLACE"
  ) {
    if (current.status !== "ACTIVE") {
      return {
        ok: false,
        action: input.action,
        reason: "MEMORY_NOT_ACTIVE",
      };
    }

    const replacement =
      input.replacement || {};

    const source =
      normalizeText(
        replacement.source,
      ) || current.source;

    if (!ALLOWED_SOURCES.has(source)) {
      return {
        ok: false,
        action: input.action,
        reason: "INVALID_SOURCE",
      };
    }

    const kind =
      replacement.kind ||
      current.kind;

    if (
      kind === "working" ||
      kind === "session"
    ) {
      return {
        ok: false,
        action: input.action,
        reason: "INVALID_MEMORY_KIND",
      };
    }

    const scope =
      normalizeText(
        replacement.scope,
      ) || current.scope;

    const store =
      normalizeText(
        replacement.store,
      ) ||
      current.store ||
      scope;

    const content =
      "content" in replacement
        ? replacement.content
        : current.content;

    const evidenceRefs =
      uniqueStrings(
        "evidenceRefs" in replacement
          ? replacement.evidenceRefs
          : current.evidenceRefs,
      );

    const confidence =
      clampConfidence(
        "confidence" in replacement
          ? replacement.confidence
          : current.confidence,
      );

    const validUntil =
      normalizeText(
        replacement.validUntil,
      ) ||
      current.validUntil ||
      undefined;

    const contextId =
      normalizeText(
        replacement.contextId,
      ) ||
      current.contextId ||
      undefined;

    const contextVersion =
      normalizeText(
        replacement.contextVersion,
      ) ||
      current.contextVersion ||
      undefined;

    const goalId =
      normalizeText(
        replacement.goalId,
      ) ||
      current.goalId ||
      undefined;

    const missionId =
      normalizeText(
        replacement.missionId,
      ) ||
      current.missionId ||
      undefined;

    const outcomeId =
      normalizeText(
        replacement.outcomeId,
      ) ||
      current.outcomeId ||
      undefined;

    const proofHash =
      normalizeText(
        replacement.proofHash,
      ) ||
      current.proofHash ||
      undefined;

    const reconciliationFingerprint =
      fingerprintMemoryClaim({
        scope,
        tenantId:
          current.tenantId,
        store,
        kind,
        content,
        contextId,
        contextVersion,
        goalId,
        missionId,
        outcomeId,
      });

    const conflicts =
      findPulseMemoryActiveConflicts({
        tenantId:
          current.tenantId,
        reconciliationFingerprint,
        excludeId:
          current.id,
      });

    if (conflicts.length > 0) {
      return {
        ok: false,
        action: input.action,
        conflictIds:
          conflicts.map(
            (row) => row.id,
          ),
        reason:
          "ACTIVE_RECONCILIATION_CONFLICT",
      };
    }

    const itemBase = {
      scope,
      tenantId:
        current.tenantId,
      store,
      kind,
      content,
      source,
      sourceType:
        deriveSourceType(source),
      evidenceRefs,
      confidence,
      validFrom:
        lifecycleAt,
      validUntil,
      createdAt:
        lifecycleAt,
      contextId,
      contextVersion,
      goalId,
      missionId,
      outcomeId,
      proofHash,
      supersedes:
        current.id,
      reconciliationFingerprint,
    };

    const replacementItem: PulseMemoryItem = {
      ...itemBase,
      id: newId(),
      status: "ACTIVE",
      trust: "OBSERVED",
      memoryVersion: 2,
      identityMode:
        current.identityMode,
      lifecycleVersion: 1,
      semanticFingerprint:
        fingerprintMemorySemantic(
          itemBase,
        ),
    };

    const supersededCurrent: PulseMemoryItem = {
      ...current,
      status:
        "SUPERSEDED",
      supersededBy:
        replacementItem.id,
      lifecycleReason:
        input.reason,
      lifecycleAt,
      lifecycleVersion:
        (current.lifecycleVersion || 0) + 1,
    };

    /*
     * Single write:
     * old memory + replacement are committed together.
     */
    rows[index] =
      supersededCurrent;

    rows.push(
      replacementItem,
    );

    writeAll(rows);

    return {
      ok: true,
      action: input.action,
      memory:
        supersededCurrent,
      replacement:
        replacementItem,
    };
  }

  return {
    ok: false,
    action: input.action,
    reason: "UNSUPPORTED_ACTION",
  };
}

export function verifyPulseMemory(input: {
  id: string;
  tenantId: string;
  evidenceRefs?: string[];
  evidence?: PulseMemoryVerificationEvidence;
  now?: number;
}): boolean {
  try {
    assertTenantId(input.tenantId);
  } catch {
    return false;
  }

  const rows = readAll();

  const index = rows.findIndex(
    function (row) {
      return (
        row.id === input.id &&
        row.tenantId === input.tenantId
      );
    },
  );

  if (index < 0) {
    return false;
  }

  const current = rows[index];

  /*
   * VERIFIED is a live trust state.
   *
   * Stale, superseded and rejected memories cannot be
   * re-promoted to VERIFIED.
   */
  if (current.status !== "ACTIVE") {
    return false;
  }

  if (
    memoryExpiryState(
      current,
      input.now ?? Date.now(),
    ) !== "VALID"
  ) {
    return false;
  }

  const evidence =
    uniqueStrings([
      ...current.evidenceRefs,
      ...(input.evidenceRefs || []),
    ]);

  /*
   * Evidence references alone are never sufficient.
   *
   * A durable executor-issued attestation must exist,
   * verify against its persisted execution audit, match
   * the requested tenant and correspond to this memory's
   * resource identity where available.
   */
  if (
    !hasDurableVerificationEvidence({
      tenantId: input.tenantId,
      row: current,
      evidenceRefs: evidence,
      evidence: input.evidence,
    })
  ) {
    return false;
  }

  rows[index] = {
    ...current,
    evidenceRefs: evidence,
    trust: "VERIFIED",
    verifiedAt: new Date(
      input.now ?? Date.now(),
    ).toISOString(),
  };

  writeAll(rows);

  return true;
}

export function governPulseMemory(input: {
  id: string;
  tenantId: string;
  now?: number;
}): boolean {
  try {
    assertTenantId(input.tenantId);
  } catch {
    return false;
  }

  const rows = readAll();

  const index = rows.findIndex(
    function (row) {
      return (
        row.id === input.id &&
        row.tenantId === input.tenantId
      );
    },
  );

  if (index < 0) {
    return false;
  }

  const current = rows[index];

  if (current.status !== "ACTIVE") {
    return false;
  }

  if (
    memoryExpiryState(
      current,
      input.now ?? Date.now(),
    ) !== "VALID"
  ) {
    return false;
  }

  if (current.trust !== "VERIFIED") {
    return false;
  }

  rows[index] = {
    ...current,
    trust: "GOVERNED",
  };

  writeAll(rows);

  return true;
}

export function queryTrustedPulseMemory(
  input: {
    tenantId: string;
    kind?: PulseMemoryKind;
    scope?: string;
    store?: string;
    includeStale?: boolean;
    minimumTrust?: PulseMemoryTrust;
    now?: number;
  },
): PulseMemoryItem[] {
  try {
    assertTenantId(input.tenantId);
  } catch {
    return [];
  }

  const trustRank: Record<PulseMemoryTrust, number> = {
    UNTRUSTED: 0,
    OBSERVED: 1,
    VERIFIED: 2,
    GOVERNED: 3,
  };

  const minimumTrust =
    input.minimumTrust || "VERIFIED";

  const now =
    input.now ?? Date.now();

  const rows = queryPulseMemory({
    tenantId: input.tenantId,
    kind: input.kind,
    scope: input.scope,
    store: input.store,
  }).filter(function (row) {
    /*
     * Trusted retrieval is permanently fail-closed for
     * terminal lifecycle states. includeStale never revives
     * REJECTED or SUPERSEDED memory.
     */
    if (
      row.status === "REJECTED" ||
      row.status === "SUPERSEDED"
    ) {
      return false;
    }

    /*
     * Expired or malformed validity metadata is never
     * returned as trusted, even when includeStale=true.
     */
    if (
      memoryExpiryState(row, now) !== "VALID"
    ) {
      return false;
    }

    if (
      row.status === "STALE" &&
      !input.includeStale
    ) {
      return false;
    }

    return (
      trustRank[row.trust] >=
      trustRank[minimumTrust]
    );
  });

  return rows.sort(function (a, b) {
    const trustDelta =
      trustRank[b.trust] -
      trustRank[a.trust];

    if (trustDelta !== 0) {
      return trustDelta;
    }

    const confidenceDelta =
      b.confidence -
      a.confidence;

    if (confidenceDelta !== 0) {
      return confidenceDelta;
    }

    const verifiedDelta =
      Date.parse(b.verifiedAt || "") -
      Date.parse(a.verifiedAt || "");

    if (
      Number.isFinite(verifiedDelta) &&
      verifiedDelta !== 0
    ) {
      return verifiedDelta;
    }

    return a.semanticFingerprint.localeCompare(
      b.semanticFingerprint,
    );
  });
}

export function markPulseMemoryStale(input: {
  id: string;
  tenantId: string;
}): boolean {
  return reconcilePulseMemory({
    id: input.id,
    tenantId: input.tenantId,
    action: "EXPIRE",
    reason: "MANUAL_STALE",
  }).ok;
}

export function rejectPulseMemory(input: {
  id: string;
  tenantId: string;
}): boolean {
  return reconcilePulseMemory({
    id: input.id,
    tenantId: input.tenantId,
    action: "REJECT",
    reason: "MANUAL_REJECT",
  }).ok;
}

export function expireStalePulseMemory(
  now = Date.now(),
): number {
  const rows = readAll();

  let count = 0;

  const next = rows.map(function (row) {
    if (
      row.status !== "ACTIVE" ||
      !row.validUntil
    ) {
      return row;
    }

    const expiresAt = Date.parse(
      row.validUntil,
    );

    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= now
    ) {
      count += 1;

      return {
        ...row,
        status: "STALE",
        lifecycleReason:
          !Number.isFinite(expiresAt)
            ? "INVALID_VALID_UNTIL"
            : "VALID_UNTIL_EXPIRED",
        lifecycleAt:
          new Date(now).toISOString(),
        lifecycleVersion:
          (row.lifecycleVersion || 0) + 1,
      };
    }

    return row;
  });

  if (count > 0) {
    writeAll(next);
  }

  return count;
}

export function rememberDecision(input: {
  scope: string;
  tenantId?: string;
  store?: string;
  action: string;
  policy: string;
  requestId: string;
  reason?: string;
}): PulseMemoryItem | null {
  return rememberPulse({
    kind: "decision",
    scope: input.scope,
    tenantId: input.tenantId,
    store: input.store || input.scope,
    source: "governance",
    evidenceRefs: [input.requestId],
    confidence: 0.9,
    content: {
      action: input.action,
      policy: input.policy,
      reason: input.reason || "",
    },
  });
}

export type PulseMissionOutcomeMemoryInput = {
  scope: string;
  tenantId?: string;
  store?: string;

  missionId: string;
  planId: string;
  requestId: string;

  outcome:
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

  planStatus: string;
  terminalStepIndex: number;

  lastError?: string;
  verificationStatus?: string;
  verified?: boolean;

  outcomeContractId?: string;

  proofStatus?:
    | "PROVEN"
    | "UNPROVEN"
    | "FAILED";

  proofHash?: string;

  assuranceStatus?:
    | "ASSURED"
    | "PARTIAL"
    | "UNASSURED";

  goalEvidenceBindingId?: string;
  goalEvidenceBindingHash?: string;

  source?:
    | "merchant"
    | "executor"
    | "verification";
};

export function rememberMissionOutcome(
  input: PulseMissionOutcomeMemoryInput,
): PulseMemoryItem | null {
  const existing = queryPulseMemory({
    kind: "mission",
    scope: input.scope,
    tenantId: input.tenantId,
    status: "ACTIVE",
  }).find(function (row) {
    if (
      !row.content ||
      typeof row.content !== "object"
    ) {
      return false;
    }

    const content =
      row.content as Record<string, unknown>;

    return (
      content.type === "mission-outcome" &&
      content.missionId === input.missionId &&
      content.outcome === input.outcome
    );
  });

  if (existing) {
    return existing;
  }

  return rememberPulse({
    kind: "mission",

    scope: input.scope,

    tenantId: input.tenantId,

    store:
      input.store ||
      input.scope,

    source:
      input.source ||
      (input.outcome === "CANCELLED"
        ? "merchant"
        : "executor"),

    evidenceRefs: [
      input.requestId,
      input.missionId,
      input.planId,
      ...(input.proofHash
        ? [input.proofHash]
        : []),
    ],

    confidence: 1,

    /*
     * Kept only as historical metadata.
     * It does not make trust VERIFIED.
     */
    verifiedAt:
      new Date().toISOString(),

    missionId:
      input.missionId,

    proofHash:
      input.proofHash,

    content: {
      type: "mission-outcome",
      missionId: input.missionId,
      planId: input.planId,
      requestId: input.requestId,
      outcome: input.outcome,
      planStatus: input.planStatus,
      terminalStepIndex:
        input.terminalStepIndex,
      lastError:
        input.lastError || "",
      verificationStatus:
        input.verificationStatus || "",
      verified: input.verified,
      outcomeContractId:
        input.outcomeContractId || "",
      proofStatus:
        input.proofStatus || "",
      proofHash:
        input.proofHash || "",
      assuranceStatus:
        input.assuranceStatus || "",
      goalEvidenceBindingId:
        input.goalEvidenceBindingId || "",
      goalEvidenceBindingHash:
        input.goalEvidenceBindingHash || "",
    },
  });
}

export function rememberPreference(input: {
  scope: string;
  tenantId?: string;
  store?: string;
  key: string;
  value: unknown;
}): PulseMemoryItem | null {
  const prev = queryPulseMemory({
    kind: "preference",
    scope: input.scope,
    tenantId: input.tenantId,
    status: "ACTIVE",
  }).find(function (row) {
    return (
      row.content &&
      typeof row.content === "object" &&
      (row.content as Record<string, unknown>)
        .key === input.key
    );
  });

  return rememberPulse({
    kind: "preference",
    scope: input.scope,
    tenantId: input.tenantId,
    store:
      input.store ||
      input.scope,
    source: "preference-ui",
    confidence: 1,
    supersedes:
      prev ? prev.id : undefined,
    content: {
      key: input.key,
      value: input.value,
    },
  });
}
