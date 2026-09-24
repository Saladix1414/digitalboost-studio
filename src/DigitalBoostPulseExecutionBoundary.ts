/**
 * PULSE — Server Execution Integration Boundary
 * P0.4.19
 *
 * Responsabilidad:
 * - definir el contrato entre PULSE/cliente y la autoridad de ejecución
 *   del lado servidor;
 * - transportar contexto suficiente para validar la operación;
 * - mantener tenant, approval, request, mission, plan y step vinculados;
 * - impedir que una respuesta de transporte sea confundida con ejecución real.
 *
 * IMPORTANTE:
 * Este módulo NO ejecuta mutaciones.
 * Este módulo NO concede autorización.
 * Este módulo NO valida una aprobación contra una base persistente.
 * Este módulo NO declara COMPLETED.
 *
 * P0.4.20 conectará este contrato con el executor servidor real.
 */

export const PULSE_EXECUTION_BOUNDARY_VERSION =
  "pulse-execution-boundary-v1" as const;

export type PulseExecutionBoundaryResult =
  | "READY_FOR_SERVER_EXECUTOR"
  | "REJECTED";

export type PulseExecutionBoundaryRejectCode =
  | "INVALID_VERSION"
  | "MISSING_REQUEST_ID"
  | "MISSING_TENANT_ID"
  | "INVALID_TENANT_ID"
  | "MISSING_APPROVAL_ID"
  | "MISSING_ACTION"
  | "MISSING_PROPOSAL_HASH"
  | "MISSING_POLICY_VERSION"
  | "MISSING_CONTEXT_VERSION"
  | "MISSING_MISSION_ID"
  | "MISSING_PLAN_ID"
  | "INVALID_STEP_INDEX"
  | "MISSING_STEP_ID"
  | "INVALID_REQUEST";

export interface PulseServerExecutionRequest {
  readonly boundary_version: typeof PULSE_EXECUTION_BOUNDARY_VERSION;
  readonly request_id: string;
  readonly tenant_id: string;

  /**
   * Approval is represented by ID only.
   * The client never gets to supply a trusted approval decision.
   */
  readonly approval_id: string;

  readonly action: string;
  readonly proposal_hash: string;
  readonly policy_version: string;
  readonly expected_context_version: string;

  readonly mission_id: string;
  readonly plan_id: string;
  readonly step_id: string;
  readonly step_index: number;

  readonly issued_at: string;
}

export interface PulseExecutionBoundaryAccepted {
  readonly result: "READY_FOR_SERVER_EXECUTOR";
  readonly boundary_version: typeof PULSE_EXECUTION_BOUNDARY_VERSION;
  readonly request_id: string;
  readonly tenant_id: string;
  readonly approval_id: string;
  readonly authority: "server_executor";
}

export interface PulseExecutionBoundaryRejected {
  readonly result: "REJECTED";
  readonly boundary_version: typeof PULSE_EXECUTION_BOUNDARY_VERSION;
  readonly request_id: string | null;
  readonly tenant_id: string | null;
  readonly code: PulseExecutionBoundaryRejectCode;
  readonly reason: string;
}

export type PulseExecutionBoundaryResponse =
  | PulseExecutionBoundaryAccepted
  | PulseExecutionBoundaryRejected;

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validTenantId(value: string): boolean {
  if (!nonEmptyString(value)) return false;

  /*
   * Tenant IDs are opaque identifiers here.
   * Cross-tenant authorization remains a server responsibility.
   */
  if (value === "*" || value === "all" || value === "global") {
    return false;
  }

  return value.length <= 256;
}

function reject(
  input: Partial<PulseServerExecutionRequest>,
  code: PulseExecutionBoundaryRejectCode,
  reason: string,
): PulseExecutionBoundaryRejected {
  return {
    result: "REJECTED",
    boundary_version: PULSE_EXECUTION_BOUNDARY_VERSION,
    request_id: nonEmptyString(input.request_id) ? input.request_id : null,
    tenant_id: nonEmptyString(input.tenant_id) ? input.tenant_id : null,
    code,
    reason,
  };
}

export function validatePulseServerExecutionRequest(
  input: unknown,
):
  | { readonly ok: true; readonly request: PulseServerExecutionRequest }
  | { readonly ok: false; readonly response: PulseExecutionBoundaryRejected } {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      response: reject({}, "INVALID_REQUEST", "request must be an object"),
    };
  }

  const candidate = input as Partial<PulseServerExecutionRequest>;

  if (candidate.boundary_version !== PULSE_EXECUTION_BOUNDARY_VERSION) {
    return {
      ok: false,
      response: reject(
        candidate,
        "INVALID_VERSION",
        "unsupported execution boundary version",
      ),
    };
  }

  if (!nonEmptyString(candidate.request_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_REQUEST_ID",
        "request_id is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.tenant_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_TENANT_ID",
        "tenant_id is required",
      ),
    };
  }

  if (!validTenantId(candidate.tenant_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "INVALID_TENANT_ID",
        "tenant_id is invalid",
      ),
    };
  }

  if (!nonEmptyString(candidate.approval_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_APPROVAL_ID",
        "approval_id is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.action)) {
    return {
      ok: false,
      response: reject(candidate, "MISSING_ACTION", "action is required"),
    };
  }

  if (!nonEmptyString(candidate.proposal_hash)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_PROPOSAL_HASH",
        "proposal_hash is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.policy_version)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_POLICY_VERSION",
        "policy_version is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.expected_context_version)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_CONTEXT_VERSION",
        "expected_context_version is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.mission_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_MISSION_ID",
        "mission_id is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.plan_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_PLAN_ID",
        "plan_id is required",
      ),
    };
  }

  if (!nonEmptyString(candidate.step_id)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "MISSING_STEP_ID",
        "step_id is required",
      ),
    };
  }

  if (
    typeof candidate.step_index !== "number" ||
    !Number.isInteger(candidate.step_index) ||
    candidate.step_index < 0
  ) {
    return {
      ok: false,
      response: reject(
        candidate,
        "INVALID_STEP_INDEX",
        "step_index must be a non-negative integer",
      ),
    };
  }

  if (!nonEmptyString(candidate.issued_at)) {
    return {
      ok: false,
      response: reject(
        candidate,
        "INVALID_REQUEST",
        "issued_at is required",
      ),
    };
  }

  return {
    ok: true,
    request: {
      boundary_version: PULSE_EXECUTION_BOUNDARY_VERSION,
      request_id: candidate.request_id,
      tenant_id: candidate.tenant_id,
      approval_id: candidate.approval_id,
      action: candidate.action,
      proposal_hash: candidate.proposal_hash,
      policy_version: candidate.policy_version,
      expected_context_version: candidate.expected_context_version,
      mission_id: candidate.mission_id,
      plan_id: candidate.plan_id,
      step_id: candidate.step_id,
      step_index: candidate.step_index,
      issued_at: candidate.issued_at,
    },
  };
}

/**
 * Validates the transport envelope only.
 *
 * A successful result means:
 * "the request is structurally eligible to reach the server executor".
 *
 * It does NOT mean:
 * - approved;
 * - claimed;
 * - executed;
 * - verified;
 * - completed.
 */
export function acceptPulseServerExecutionRequest(
  input: unknown,
): PulseExecutionBoundaryResponse {
  const validation = validatePulseServerExecutionRequest(input);

  if (!validation.ok) {
    return validation.response;
  }

  return {
    result: "READY_FOR_SERVER_EXECUTOR",
    boundary_version: PULSE_EXECUTION_BOUNDARY_VERSION,
    request_id: validation.request.request_id,
    tenant_id: validation.request.tenant_id,
    approval_id: validation.request.approval_id,
    authority: "server_executor",
  };
}

/**
 * Canonical request constructor.
 *
 * It deliberately accepts only the execution context and never accepts
 * a trusted "approved: true" flag.
 */
export function createPulseServerExecutionRequest(input: {
  request_id: string;
  tenant_id: string;
  approval_id: string;
  action: string;
  proposal_hash: string;
  policy_version: string;
  expected_context_version: string;
  mission_id: string;
  plan_id: string;
  step_id: string;
  step_index: number;
  issued_at?: string;
}): PulseServerExecutionRequest {
  const request: PulseServerExecutionRequest = {
    boundary_version: PULSE_EXECUTION_BOUNDARY_VERSION,
    request_id: input.request_id,
    tenant_id: input.tenant_id,
    approval_id: input.approval_id,
    action: input.action,
    proposal_hash: input.proposal_hash,
    policy_version: input.policy_version,
    expected_context_version: input.expected_context_version,
    mission_id: input.mission_id,
    plan_id: input.plan_id,
    step_id: input.step_id,
    step_index: input.step_index,
    issued_at: input.issued_at ?? new Date().toISOString(),
  };

  const validation = validatePulseServerExecutionRequest(request);

  if (!validation.ok) {
    throw new Error(
      `${validation.response.code}: ${validation.response.reason}`,
    );
  }

  return validation.request;
}
