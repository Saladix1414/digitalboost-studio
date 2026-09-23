export type PulseMemoryKind =
  | "working" | "session" | "episodic" | "semantic" | "preference"
  | "decision" | "mission" | "operational" | "audit" | "playbook" | "lesson";
export type PulseMemoryStatus = "ACTIVE" | "STALE" | "SUPERSEDED" | "REJECTED";
export type PulseMemoryItem = {
  id: string; scope: string; kind: PulseMemoryKind; content: unknown;
  source: string; evidenceRefs: string[]; confidence: number;
  validFrom: string; validUntil?: string; verifiedAt?: string;
  supersedes?: string; status: PulseMemoryStatus;
};
const KEY = "db-pulse-memory-v1";
const ALLOWED_SOURCES = new Set(["merchant", "governance", "executor", "verification", "preference-ui"]);
function readAll(): PulseMemoryItem[] {
  if (typeof localStorage === "undefined") return [];
  try { const rows = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows : []; } catch { return []; }
}
function writeAll(rows: PulseMemoryItem[]) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-400))); } catch {}
}
function newId() { return "mem_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6); }
export function listPulseMemory(): PulseMemoryItem[] { return readAll(); }

export function queryPulseMemory(filter: { kind?: PulseMemoryKind; scope?: string; status?: PulseMemoryStatus } = {}): PulseMemoryItem[] {
  return readAll().filter(function (row) {
    if (filter.kind && row.kind !== filter.kind) return false;
    if (filter.scope && row.scope !== filter.scope) return false;
    if (filter.status && row.status !== filter.status) return false;
    return true;
  });
}
export function rememberPulse(input: {
  kind: PulseMemoryKind; scope: string; content: unknown; source: string;
  evidenceRefs?: string[]; confidence?: number; validUntil?: string; verifiedAt?: string; supersedes?: string;
}): PulseMemoryItem | null {
  if (!ALLOWED_SOURCES.has(input.source)) return null;
  if (input.kind === "working" || input.kind === "session") return null;
  const now = new Date().toISOString();
  const item: PulseMemoryItem = {
    id: newId(), scope: input.scope, kind: input.kind, content: input.content,
    source: input.source, evidenceRefs: input.evidenceRefs || [],
    confidence: typeof input.confidence === "number" ? input.confidence : 0.7,
    validFrom: now, validUntil: input.validUntil, verifiedAt: input.verifiedAt,
    supersedes: input.supersedes, status: "ACTIVE",
  };
  const rows = readAll();
  if (input.supersedes) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].id === input.supersedes && rows[i].status === "ACTIVE") rows[i] = Object.assign({}, rows[i], { status: "SUPERSEDED" });
    }
  }
  rows.push(item);
  writeAll(rows);
  return item;
}
export function markPulseMemoryStale(id: string): boolean {
  const rows = readAll();
  let found = false;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id === id && rows[i].status === "ACTIVE") { rows[i] = Object.assign({}, rows[i], { status: "STALE" }); found = true; }
  }
  if (found) writeAll(rows);
  return found;
}
export function rejectPulseMemory(id: string): boolean {
  const rows = readAll();
  let found = false;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id === id && rows[i].status !== "SUPERSEDED") { rows[i] = Object.assign({}, rows[i], { status: "REJECTED" }); found = true; }
  }
  if (found) writeAll(rows);
  return found;
}
export function expireStalePulseMemory(now = Date.now()): number {
  const rows = readAll();
  let n = 0;
  const next = rows.map(function (row) {
    if (row.status !== "ACTIVE" || !row.validUntil) return row;
    if (Date.parse(row.validUntil) <= now) { n += 1; return Object.assign({}, row, { status: "STALE" }); }
    return row;
  });
  if (n) writeAll(next);
  return n;
}
export function rememberDecision(input: { scope: string; action: string; policy: string; requestId: string; reason?: string }): PulseMemoryItem | null {
  return rememberPulse({
    kind: "decision", scope: input.scope, source: "governance",
    evidenceRefs: [input.requestId], confidence: 0.9,
    content: { action: input.action, policy: input.policy, reason: input.reason || "" },
  });
}

export type PulseMissionOutcomeMemoryInput = {
  scope: string;
  missionId: string;
  planId: string;
  requestId: string;
  outcome: "COMPLETED" | "FAILED" | "CANCELLED";
  planStatus: string;
  terminalStepIndex: number;
  lastError?: string;
  verificationStatus?: string;
  verified?: boolean;
  outcomeContractId?: string;
  proofStatus?: "PROVEN" | "UNPROVEN" | "FAILED";
  proofHash?: string;
  assuranceStatus?: "ASSURED" | "PARTIAL" | "UNASSURED";
  goalEvidenceBindingId?: string;
  goalEvidenceBindingHash?: string;
  source?: "merchant" | "executor" | "verification";
};

export function rememberMissionOutcome(
  input: PulseMissionOutcomeMemoryInput,
): PulseMemoryItem | null {
  const existing = queryPulseMemory({
    kind: "mission",
    scope: input.scope,
    status: "ACTIVE",
  }).find(function (row) {
    if (!row.content || typeof row.content !== "object") return false;

    const content = row.content as Record<string, unknown>;

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
    source:
      input.source ||
      (input.outcome === "CANCELLED" ? "merchant" : "executor"),
    evidenceRefs: [
      input.requestId,
      input.missionId,
      input.planId,
      ...(input.proofHash ? [input.proofHash] : []),
    ],
    confidence: 1,
    verifiedAt: new Date().toISOString(),
    content: {
      type: "mission-outcome",
      missionId: input.missionId,
      planId: input.planId,
      requestId: input.requestId,
      outcome: input.outcome,
      planStatus: input.planStatus,
      terminalStepIndex: input.terminalStepIndex,
      lastError: input.lastError || "",
      verificationStatus: input.verificationStatus || "",
      verified: input.verified,
      outcomeContractId: input.outcomeContractId || "",
      proofStatus: input.proofStatus || "",
      proofHash: input.proofHash || "",
      assuranceStatus: input.assuranceStatus || "",
      goalEvidenceBindingId: input.goalEvidenceBindingId || "",
      goalEvidenceBindingHash: input.goalEvidenceBindingHash || "",
    },
  });
}
export function rememberPreference(input: { scope: string; key: string; value: unknown }): PulseMemoryItem | null {
  const prev = queryPulseMemory({ kind: "preference", scope: input.scope, status: "ACTIVE" }).filter(function (row) {
    return row.content && typeof row.content === "object" && (row.content as any).key === input.key;
  })[0];
  return rememberPulse({
    kind: "preference", scope: input.scope, source: "preference-ui",
    confidence: 1, supersedes: prev ? prev.id : undefined,
    content: { key: input.key, value: input.value },
  });
}
