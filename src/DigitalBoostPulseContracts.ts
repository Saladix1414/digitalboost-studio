export const PULSE_POLICY_VERSION = "pulse-gov-v1";
export const PULSE_APPROVAL_TTL_MS = 15 * 60 * 1000;
export type PulseRiskLevel = "L0" | "L1" | "L2" | "L3" | "L4";
export type PulseActionClass = "read" | "navigate" | "mutate" | "system";
export type PulseReversibility = "reversible" | "compensatable" | "irreversible";
export type PulseReasonCode =
  | "UNKNOWN_ACTION" | "INVALID_RISK" | "POLICY_REJECT" | "APPROVAL_MISSING"
  | "APPROVAL_MISMATCH" | "APPROVAL_EXPIRED" | "STALE_PROPOSAL" | "TARGET_CHANGED"
  | "PERMISSION_MISMATCH" | "CONTEXT_STALE" | "POLICY_VERSION_MISMATCH"
  | "BINDING_MISSING" | "PRECONDITION_FAILED" | "VERIFICATION_FAILED"
  | "VERIFICATION_SKIPPED" | "OK";
export type PulseActionContract = {
  name: string; domain: string; class: PulseActionClass; minRisk: PulseRiskLevel;
  permissions: string[]; reversibility: PulseReversibility; known: true;
};
export type PulseProposalBinding = {
  request_id: string; action: string; target: string; risk: PulseRiskLevel;
  policy_version: string; proposal_hash: string; context_version: string;
  actor: string; tenant: string; expires_at: string;
};
export type PulseBindingInput = {
  request_id?: string; action: string; target?: string; actor?: string;
  tenant?: string; context_version?: string; proposal?: unknown; now?: number; ttl_ms?: number;
};
const RISK_RANK: Record<PulseRiskLevel, number> = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4 };
export function isPulseRiskLevel(value: unknown): value is PulseRiskLevel {
  return value === "L0" || value === "L1" || value === "L2" || value === "L3" || value === "L4";
}
export function parsePulseRisk(risk: unknown): { ok: true; risk: PulseRiskLevel } | { ok: false; reason: PulseReasonCode } {
  if (risk === undefined || risk === null || risk === "") return { ok: false, reason: "INVALID_RISK" };
  if (!isPulseRiskLevel(risk)) return { ok: false, reason: "INVALID_RISK" };
  return { ok: true, risk };
}
export function riskAtLeast(a: PulseRiskLevel, b: PulseRiskLevel): PulseRiskLevel {
  return RISK_RANK[a] >= RISK_RANK[b] ? a : b;
}
export function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) return "null";
  const t = typeof value;
  if (t === "number" || t === "boolean" || t === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableSerialize).join(",") + "]";
  if (t === "object") {
    const rec = value as Record<string, unknown>;
    const keys = Object.keys(rec).sort();
    return "{" + keys.map(function (k) { return JSON.stringify(k) + ":" + stableSerialize(rec[k]); }).join(",") + "}";
  }
  return JSON.stringify(String(value));
}
export function hashProposal(value: unknown): string {
  const input = stableSerialize(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return "fnv1a_" + (hash >>> 0).toString(16).padStart(8, "0");
}

export function hashPulseExecutionPayload(
  input: { proposal?: unknown; draft?: unknown },
): string | null {
  const payload =
    input.proposal !== undefined && input.proposal !== null
      ? input.proposal
      : input.draft;

  if (payload === undefined || payload === null) {
    return null;
  }

  return hashProposal(payload);
}
export function buildProposalBinding(input: PulseBindingInput, risk: PulseRiskLevel): PulseProposalBinding {
  const now = input.now ?? Date.now();
  const ttl = input.ttl_ms ?? PULSE_APPROVAL_TTL_MS;
  return {
    request_id: input.request_id ?? "", action: input.action, target: input.target ?? input.action,
    risk, policy_version: PULSE_POLICY_VERSION,
    proposal_hash: hashProposal(input.proposal ?? { action: input.action }),
    context_version: input.context_version ?? "ctx:unspecified",
    actor: input.actor ?? "merchant", tenant: input.tenant ?? "digitalboost",
    expires_at: new Date(now + ttl).toISOString(),
  };
}
export function bindingExpired(binding: PulseProposalBinding, now = Date.now()): boolean {
  const exp = Date.parse(binding.expires_at);
  return !Number.isFinite(exp) || exp <= now;
}

export function diffProposalBinding(expected: PulseProposalBinding, actual: Partial<PulseProposalBinding> | null | undefined, now = Date.now()): PulseReasonCode | "OK" {
  if (!actual) return "BINDING_MISSING";
  if (actual.policy_version !== expected.policy_version) return "POLICY_VERSION_MISMATCH";
  if (actual.request_id !== expected.request_id) return "APPROVAL_MISMATCH";
  if (actual.action !== expected.action) return "APPROVAL_MISMATCH";
  if (actual.target !== expected.target) return "TARGET_CHANGED";
  if (actual.risk !== expected.risk) return "APPROVAL_MISMATCH";
  if (actual.proposal_hash !== expected.proposal_hash) return "STALE_PROPOSAL";
  if (actual.context_version !== expected.context_version) return "CONTEXT_STALE";
  if (actual.actor !== expected.actor) return "PERMISSION_MISMATCH";
  if (actual.tenant !== expected.tenant) return "PERMISSION_MISMATCH";
  if (bindingExpired(expected, now) || bindingExpired(actual as PulseProposalBinding, now)) return "APPROVAL_EXPIRED";
  return "OK";
}
function contract(name: string, domain: string, actionClass: PulseActionClass, minRisk: PulseRiskLevel, permissions: string[], reversibility: PulseReversibility): PulseActionContract {
  return { name, domain, class: actionClass, minRisk, permissions, reversibility, known: true };
}
export const PULSE_ACTION_CONTRACTS: Record<string, PulseActionContract> = {
  analyze: contract("analyze", "pulse", "read", "L0", ["inference"], "reversible"),
  reason: contract("reason", "pulse", "read", "L0", ["inference"], "reversible"),
  explain: contract("explain", "pulse", "read", "L0", ["inference"], "reversible"),
  plan: contract("plan", "pulse", "read", "L0", ["inference"], "reversible"),
  propose: contract("propose", "pulse", "read", "L0", ["inference"], "reversible"),
  dashboard: contract("dashboard", "commerce", "navigate", "L0", ["navigate"], "reversible"),
  analytics: contract("analytics", "analytics", "navigate", "L0", ["navigate"], "reversible"),
  orders: contract("orders", "commerce", "navigate", "L0", ["navigate"], "reversible"),
  products: contract("products", "commerce", "navigate", "L0", ["navigate"], "reversible"),
  customers: contract("customers", "commerce", "navigate", "L0", ["navigate"], "reversible"),
  __health: contract("__health", "system", "navigate", "L0", ["navigate"], "reversible"),
  __search: contract("__search", "system", "navigate", "L0", ["navigate"], "reversible"),
  __automations: contract("__automations", "automation", "system", "L1", ["automations"], "compensatable"),
  __integrations: contract("__integrations", "integrations", "system", "L4", ["integrations"], "irreversible"),
  campaigns: contract("campaigns", "marketing", "mutate", "L3", ["campaigns.write"], "compensatable"),
  "website-builder": contract("website-builder", "store", "mutate", "L1", ["canvas.write"], "reversible"),
  seo: contract("seo", "seo", "navigate", "L0", ["seo.read"], "reversible"),
  "seo-fix": contract("seo-fix", "seo", "mutate", "L1", ["seo.write"], "reversible"),
  optimize: contract("optimize", "store", "mutate", "L1", ["canvas.write", "seo.write"], "reversible"),
  studio: contract("studio", "store", "navigate", "L0", ["navigate"], "reversible"),
  hero: contract("hero", "store", "mutate", "L1", ["canvas.write"], "reversible"),
  alerta: contract("alerta", "ops", "read", "L0", ["read"], "reversible"),
};
export function getActionContract(action: string): PulseActionContract | null {
  return PULSE_ACTION_CONTRACTS[action] ?? null;
}
export function isKnownPulseAction(action: string): boolean {
  return Object.prototype.hasOwnProperty.call(PULSE_ACTION_CONTRACTS, action);
}
