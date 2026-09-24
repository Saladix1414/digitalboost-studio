/**
 * PULSE — Server-Side Executor
 * P0.4.20
 *
 * Autoridad de ejecución del lado servidor.
 *
 * IMPORTANTE:
 * - PULSE propone.
 * - Policy decide si requiere aprobación.
 * - Approval autoriza.
 * - ServerExecutionClaimStore consume la autorización una sola vez.
 * - Este executor ejecuta.
 * - Verify produce evidencia.
 *
 * Este módulo no usa Vitest/Jest ni depende del browser.
 */

import {
  type PulseServerExecutionRequest,
  validatePulseServerExecutionRequest,
} from "./DigitalBoostPulseExecutionBoundary";

export const PULSE_SERVER_EXECUTOR_VERSION =
  "pulse-server-executor-v1" as const;

export type PulseServerExecutionStatus =
  | "EXECUTED"
  | "REJECTED"
  | "REPLAY_REJECTED"
  | "FAILED"
  | "FAILED_UNVERIFIED";

export type PulseServerExecutorCode =
  | "INVALID_REQUEST"
  | "AUTHENTICATION_REQUIRED"
  | "TENANT_ACCESS_DENIED"
  | "ACTION_NOT_AUTHORIZED"
  | "CLAIM_STORE_UNAVAILABLE"
  | "CLAIM_REJECTED"
  | "EXECUTION_FAILED"
  | "EXECUTION_UNVERIFIED";

export interface PulseServerExecutionClaimInput {
  readonly approval_id: string;
  readonly request_id: string;
  readonly tenant_id: string;
  readonly action: string;
  readonly mission_id: string;
  readonly plan_id: string;
  readonly step_id: string;
  readonly step_index: number;
}

export interface PulseServerExecutionClaimResult {
  readonly claimed: boolean;
  readonly reason?: "replay" | "unavailable";
}

export interface PulseServerExecutionClaimStore {
  /**
   * Contract intentionally matches the server claim boundary.
   *
   * The concrete implementation in:
   * src/server/DigitalBoostPulseServerExecutionClaimStore.ts
   * is injected by the server composition layer.
   */
  claim(
    input: PulseServerExecutionClaimInput,
  ):
    | PulseServerExecutionClaimResult
    | Promise<PulseServerExecutionClaimResult>;
}

export interface PulseServerExecutionEvidence {
  readonly completed: boolean;
  readonly verified: boolean;
  readonly evidence_id?: string;
}

export interface PulseServerExecutionResult {
  readonly version: typeof PULSE_SERVER_EXECUTOR_VERSION;
  readonly status: PulseServerExecutionStatus;
  readonly request_id: string | null;
  readonly tenant_id: string | null;
  readonly approval_id: string | null;
  readonly mission_id: string | null;
  readonly plan_id: string | null;
  readonly step_id: string | null;
  readonly code?: PulseServerExecutorCode;
  readonly evidence?: PulseServerExecutionEvidence;
}

export interface PulseServerExecutorDependencies {
  readonly claimStore: PulseServerExecutionClaimStore;

  /**
   * Real server action.
   *
   * It is invoked only after the claim succeeds.
   */
  readonly executeAction: (
    request: PulseServerExecutionRequest,
  ) =>
    | PulseServerExecutionEvidence
    | Promise<PulseServerExecutionEvidence>;
}

function rejected(
  status: PulseServerExecutionStatus,
  code?: PulseServerExecutorCode,
): PulseServerExecutionResult {
  return {
    version: PULSE_SERVER_EXECUTOR_VERSION,
    status,
    request_id: null,
    tenant_id: null,
    approval_id: null,
    mission_id: null,
    plan_id: null,
    step_id: null,
    ...(code ? { code } : {}),
  };
}

function contextual(
  request: PulseServerExecutionRequest,
  status: PulseServerExecutionStatus,
  code?: PulseServerExecutorCode,
  evidence?: PulseServerExecutionEvidence,
): PulseServerExecutionResult {
  return {
    version: PULSE_SERVER_EXECUTOR_VERSION,
    status,
    request_id: request.request_id,
    tenant_id: request.tenant_id,
    approval_id: request.approval_id,
    mission_id: request.mission_id,
    plan_id: request.plan_id,
    step_id: request.step_id,
    ...(code ? { code } : {}),
    ...(evidence ? { evidence } : {}),
  };
}

/**
 * Executes a server request only after:
 *
 * boundary validation
 *        ↓
 * atomic/persistent server claim
 *        ↓
 * real action
 *        ↓
 * evidence
 *        ↓
 * verification
 */
export async function executePulseServerRequest(
  input: unknown,
  dependencies: PulseServerExecutorDependencies,
): Promise<PulseServerExecutionResult> {
  const validation = validatePulseServerExecutionRequest(input);

  if (!validation.ok) {
    return rejected("REJECTED", "INVALID_REQUEST");
  }

  const request = validation.request;

  let claimResult: PulseServerExecutionClaimResult;

  try {
    claimResult = await dependencies.claimStore.claim({
      approval_id: request.approval_id,
      request_id: request.request_id,
      tenant_id: request.tenant_id,
      action: request.action,
      mission_id: request.mission_id,
      plan_id: request.plan_id,
      step_id: request.step_id,
      step_index: request.step_index,
    });
  } catch {
    return contextual(
      request,
      "REJECTED",
      "CLAIM_STORE_UNAVAILABLE",
    );
  }

  if (!claimResult.claimed) {
    if (claimResult.reason === "unavailable") {
      return contextual(
        request,
        "REJECTED",
        "CLAIM_STORE_UNAVAILABLE",
      );
    }

    return contextual(
      request,
      "REPLAY_REJECTED",
      "CLAIM_REJECTED",
    );
  }

  let evidence: PulseServerExecutionEvidence;

  try {
    evidence = await dependencies.executeAction(request);
  } catch {
    return contextual(
      request,
      "FAILED",
      "EXECUTION_FAILED",
    );
  }

  if (!evidence.completed || !evidence.verified) {
    return contextual(
      request,
      "FAILED_UNVERIFIED",
      "EXECUTION_UNVERIFIED",
      evidence,
    );
  }

  return contextual(
    request,
    "EXECUTED",
    undefined,
    evidence,
  );
}
