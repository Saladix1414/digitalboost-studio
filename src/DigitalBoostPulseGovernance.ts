import {
  PULSE_POLICY_VERSION,
  parsePulseRisk,
  getActionContract,
  isKnownPulseAction,
  riskAtLeast,
  buildProposalBinding,
  diffProposalBinding,
  type PulseBindingInput,
  type PulseProposalBinding,
  type PulseReasonCode,
} from "./DigitalBoostPulseContracts";

export type PulseRiskLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export type PulseGovernanceState =
  | "PROPOSED"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED";

export type PulsePolicyDecision =
  | "ALLOW"
  | "REQUIRE_APPROVAL"
  | "REJECT";

export interface PulseDecisionEnvelope {
  binding?: PulseProposalBinding;
  reason_code?: PulseReasonCode;
  policy_version?: string;
  request_id: string;
  action: string;
  intent?: string;
  agent?: string;
  risk: PulseRiskLevel;
  reason?: string;
  requires_approval: boolean;
  approval_id?: string;
  policy: PulsePolicyDecision;
  state: PulseGovernanceState;
  metadata?: Record<string, unknown>;
}

export interface PulseApproval {
  binding?: PulseProposalBinding;
  approval_id: string;
  request_id: string;
  action: string;
  state: "AWAITING_APPROVAL" | "APPROVED" | "REJECTED";
  created_at: string;
  updated_at: string;
  reason?: string;
}

export interface PulseExecutionResult {
  request_id: string;
  action: string;
  state: "COMPLETED" | "FAILED";
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface PulseAuditEvent {
  request_id: string;
  event: string;
  state: PulseGovernanceState;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const KNOWN_ACTIONS = new Set([
  // Capacidades cognitivas
  "analyze",
  "reason",
  "explain",
  "plan",
  "propose",

  // Navegacion / lectura PULSE existente
  "dashboard",
  "analytics",
  "orders",
  "products",
  "customers",
  "__health",
  "__search",

  // Automatizaciones / integraciones: siempre pasan por policy
  "__automations",
  "__integrations",

  // Commerce / marketing
  "campaigns",

  // Builders
  "website-builder",

  // Rutas/skills existentes
  "seo",
  "seo-fix",
  "optimize",
  "studio",
  "hero",
  "alerta",
]);

function now(): string {
  return new Date().toISOString();
}

function makeApprovalId(requestId: string): string {
  return `approval_${requestId}_${Date.now()}`;
}

function normalizeRisk(risk?: string): PulseRiskLevel {
  const parsed = parsePulseRisk(risk);
  if (!parsed.ok) return "L4";
  return parsed.risk;
}

export function evaluatePulsePolicy(
  action: string,
  risk?: string,
  requiresApproval?: boolean,
  requestIdOverride?: string,
  bindingInput?: PulseBindingInput,
): PulseDecisionEnvelope {
  const requestId = requestIdOverride ?? ("pulse_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10));
  const parsedRisk = parsePulseRisk(risk);
  if (!parsedRisk.ok) {
    return { request_id: requestId, action, risk: "L4", requires_approval: false, policy: "REJECT", state: "REJECTED", reason_code: "INVALID_RISK" };
  }
  if (!isKnownPulseAction(action) && !KNOWN_ACTIONS.has(action)) {
    return { request_id: requestId, action, risk: parsedRisk.risk, requires_approval: false, policy: "REJECT", state: "REJECTED", reason_code: "UNKNOWN_ACTION" };
  }
  const contract = getActionContract(action);
  const normalizedRisk = contract ? riskAtLeast(parsedRisk.risk, contract.minRisk) : parsedRisk.risk;
  const binding = buildProposalBinding(Object.assign({}, bindingInput || { action: action }, { request_id: requestId, action: action }), normalizedRisk);
  const approvalRequired = requiresApproval === true || normalizedRisk === "L2" || normalizedRisk === "L3" || normalizedRisk === "L4";
  if (approvalRequired) {
    return { request_id: requestId, action, risk: normalizedRisk, requires_approval: true, approval_id: makeApprovalId(requestId), policy: "REQUIRE_APPROVAL", state: "AWAITING_APPROVAL", binding: binding, policy_version: PULSE_POLICY_VERSION };
  }
  return { request_id: requestId, action, risk: normalizedRisk, requires_approval: false, policy: "ALLOW", state: "PROPOSED", binding: binding, policy_version: PULSE_POLICY_VERSION };
}

export function createPulseApproval(
  envelope: PulseDecisionEnvelope,
): PulseApproval | null {
  if (
    envelope.policy !== "REQUIRE_APPROVAL" ||
    !envelope.requires_approval ||
    !envelope.approval_id
  ) {
    return null;
  }

  const timestamp = now();

  return {
    binding: envelope.binding,
    approval_id: envelope.approval_id,
    request_id: envelope.request_id,
    action: envelope.action,
    state: "AWAITING_APPROVAL",
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export function approvePulseAction(
  approval: PulseApproval,
): PulseApproval {
  if (approval.state !== "AWAITING_APPROVAL") {
    return approval;
  }

  return {
    ...approval,
    state: "APPROVED",
    updated_at: now(),
  };
}

export function rejectPulseAction(
  approval: PulseApproval,
): PulseApproval {
  if (approval.state !== "AWAITING_APPROVAL") {
    return approval;
  }

  return {
    ...approval,
    state: "REJECTED",
    updated_at: now(),
  };
}

export function beginPulseExecution(
  envelope: PulseDecisionEnvelope,
  approval?: PulseApproval | null,
): PulseDecisionEnvelope {
  if (envelope.policy === "REJECT") {
    return Object.assign({}, envelope, { state: "REJECTED", reason_code: envelope.reason_code || "POLICY_REJECT" });
  }
  if (envelope.requires_approval) {
    if (!approval || approval.approval_id !== envelope.approval_id) {
      return Object.assign({}, envelope, {
        state: "AWAITING_APPROVAL",
        reason_code: "APPROVAL_MISSING",
      });
    }

    if (approval.state !== "APPROVED") {
      return Object.assign({}, envelope, {
        state:
          approval.state === "REJECTED"
            ? "REJECTED"
            : "AWAITING_APPROVAL",
        reason_code:
          approval.state === "REJECTED"
            ? "POLICY_REJECT"
            : "APPROVAL_MISSING",
      });
    }

    if (!envelope.binding || !approval.binding) {
      return Object.assign({}, envelope, {
        policy: "REJECT",
        state: "REJECTED",
        reason_code: "BINDING_MISSING",
      });
    }

    const mismatch = diffProposalBinding(
      envelope.binding,
      approval.binding,
    );

    if (mismatch !== "OK") {
      return Object.assign({}, envelope, {
        policy: "REJECT",
        state: "REJECTED",
        reason_code: mismatch,
      });
    }
  } else if (envelope.binding && approval?.binding) {
    const mismatch = diffProposalBinding(
      envelope.binding,
      approval.binding,
    );

    if (mismatch !== "OK") {
      return Object.assign({}, envelope, {
        policy: "REJECT",
        state: "REJECTED",
        reason_code: mismatch,
      });
    }
  }
  return Object.assign({}, envelope, { state: "EXECUTING" });
}

export function completePulseExecution(
  envelope: PulseDecisionEnvelope,
  result?: unknown,
): PulseExecutionResult {
  return {
    request_id: envelope.request_id,
    action: envelope.action,
    state: "COMPLETED",
    success: true,
    result,
  };
}

export function failPulseExecution(
  envelope: PulseDecisionEnvelope,
  error: unknown,
): PulseExecutionResult {
  return {
    request_id: envelope.request_id,
    action: envelope.action,
    state: "FAILED",
    success: false,
    error: error instanceof Error ? error.message : String(error),
  };
}

export function createPulseAuditEvent(
  envelope: PulseDecisionEnvelope,
  event: string,
  metadata?: Record<string, unknown>,
): PulseAuditEvent {
  return {
    request_id: envelope.request_id,
    event,
    state: envelope.state,
    action: envelope.action,
    timestamp: now(),
    metadata,
  };
}
