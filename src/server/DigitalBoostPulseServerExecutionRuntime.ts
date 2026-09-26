import { PersistentApprovalRepository } from "./DigitalBoostPulsePersistentApprovalRepository";
import { reconcilePulseServerApproval } from "./DigitalBoostPulseServerApprovalReconciliation";

import { assertPulseTenantIsolation } from "./DigitalBoostPulseTenantIsolation";
/**
 * PULSE — Server Execution Runtime Composition
 * P0.4.20
 *
 * Une:
 *
 * Execution Boundary
 *        ↓
 * ServerExecutionClaimStore real
 *        ↓
 * DigitalBoostPulseServerExecutor
 *
 * IMPORTANTE:
 * - no implementa autenticación;
 * - no implementa autorización;
 * - no expone por sí mismo un endpoint HTTP;
 * - no ejecuta una acción por defecto;
 * - no crea un segundo claim store.
 *
 * P0.4.21 deberá colocar identidad + authorization antes de llamar
 * a executePulseServerRequestWithServerClaimStore().
 */

import {
  type PulseServerExecutionRequest,
  validatePulseServerExecutionRequest,
} from "../DigitalBoostPulseExecutionBoundary";

import {
  executePulseServerRequest,
  type PulseServerExecutionClaimStore,
  type PulseServerExecutionEvidence,
  type PulseServerExecutionResult,
} from "../DigitalBoostPulseServerExecutor";

import { ServerExecutionClaimStore } from "./DigitalBoostPulseServerExecutionClaimStore";

export interface PulseServerExecutionRuntimeOptions {
  readonly executeAction: (
    request: PulseServerExecutionRequest,
  ) =>
    | PulseServerExecutionEvidence
    | Promise<PulseServerExecutionEvidence>;

  /**
   * Test/runtime composition override.
   *
   * Production defaults to the real persistent server store.
   */
  readonly createClaimStore?: (
    tenantId: string,
  ) => PulseServerExecutionClaimStore;

  readonly createApprovalRepository?: (
    tenantId: string,
  ) => PersistentApprovalRepository;
}

export function createPulseServerClaimStore(
  tenantId: string,
): PulseServerExecutionClaimStore {
  return new ServerExecutionClaimStore({
    tenantId,
  });
}

/**
 * Canonical server composition entrypoint.
 *
 * The request is validated first so the tenant used to select the
 * persistent claim store comes from the validated execution boundary.
 *
 * No "approved=true" field is consulted here.
 * Approval resolution remains a later authorization concern.
 */
export async function executePulseServerRequestWithServerClaimStore(
  input: unknown,
  options: PulseServerExecutionRuntimeOptions,
): Promise<PulseServerExecutionResult> {
  const validation = validatePulseServerExecutionRequest(input);

  if (!validation.ok) {
    /*
     * Let the canonical executor produce the standard rejected response.
     * The claim store is deliberately not instantiated for invalid input.
     */
    const neverClaimStore: PulseServerExecutionClaimStore = {
      claim() {
        throw new Error("invalid request must not claim");
      },
    };

    return executePulseServerRequest(input, {
      claimStore: neverClaimStore,
      executeAction: options.executeAction,
    });
  }

  const createClaimStore =
    options.createClaimStore ?? createPulseServerClaimStore;

  const claimStore = createClaimStore(
    validation.request.tenant_id,
  );

  return executePulseServerRequest(
    validation.request,
    {
      claimStore,
      executeAction: options.executeAction,
    },
  );
}

import {
  authorizePulseServerExecution,
  type PulseActionAuthorizer,
  type PulsePrincipal,
} from "./DigitalBoostPulseAuthorizationBoundary";

/**
 * P0.4.21
 *
 * Server-authorized execution entrypoint.
 *
 * La identidad y el tenant provienen de `principal`, no del request.
 * El request tenant solo puede coincidir con ese contexto confiable.
 *
 * Esta función sigue sin ser un endpoint HTTP:
 * el mecanismo de autenticación HTTP debe resolver primero el principal.
 */
export async function executeAuthorizedPulseServerRequest(
  input: unknown,
  principal: PulsePrincipal,
  options: PulseServerExecutionRuntimeOptions & {
    readonly authorizeAction: PulseActionAuthorizer;
  },
): Promise<PulseServerExecutionResult> {
  const validation = validatePulseServerExecutionRequest(input);

  if (!validation.ok) {
    return executePulseServerRequest(input, {
      claimStore: {
        claim() {
          throw new Error("invalid request must not claim");
        },
      },
      executeAction: options.executeAction,
    });
  }

  const authorization = await authorizePulseServerExecution(
    principal,
    validation.request,
    options.authorizeAction,
  );

  if (!authorization.ok) {
    return {
      version: "pulse-server-executor-v1",
      status: "REJECTED",
      request_id: validation.request.request_id,
      tenant_id: validation.request.tenant_id,
      approval_id: validation.request.approval_id,
      mission_id: validation.request.mission_id,
      plan_id: validation.request.plan_id,
      step_id: validation.request.step_id,
      code:
        authorization.code === "AUTHENTICATION_REQUIRED"
          ? "AUTHENTICATION_REQUIRED"
          : authorization.code === "TENANT_ACCESS_DENIED"
            ? "TENANT_ACCESS_DENIED"
            : authorization.code === "ACTION_NOT_AUTHORIZED"
              ? "ACTION_NOT_AUTHORIZED"
              : "INVALID_REQUEST",
    };
  }

  /*
   * Rebind tenant from trusted principal context.
   * This removes any ambiguity before claim-store selection.
   */

    // P0.4.22 — authorization tenant must equal resource tenant.
    assertPulseTenantIsolation(
      authorization.tenant_id,
      input.tenant_id,
    );

const trustedRequest: PulseServerExecutionRequest = {
    ...validation.request,
    tenant_id: authorization.tenant_id,
  };

  // P1.1-B — persisted approval is mandatory before claim.
  const createApprovalRepository =
    options.createApprovalRepository ??
    ((tenantId: string) =>
      new PersistentApprovalRepository({
        tenantId,
      }));

  let approvalRepository: PersistentApprovalRepository;

  try {
    approvalRepository = createApprovalRepository(
      authorization.tenant_id,
    );
  } catch {
    return {
      version: "pulse-server-executor-v1",
      status: "REJECTED",
      request_id: trustedRequest.request_id,
      tenant_id: trustedRequest.tenant_id,
      approval_id: trustedRequest.approval_id,
      mission_id: trustedRequest.mission_id,
      plan_id: trustedRequest.plan_id,
      step_id: trustedRequest.step_id,
      code: "APPROVAL_STORAGE_ERROR",
    };
  }

  const approval = reconcilePulseServerApproval(
    approvalRepository,
    trustedRequest,
  );

  if (!approval.ok) {
    return {
      version: "pulse-server-executor-v1",
      status: "REJECTED",
      request_id: trustedRequest.request_id,
      tenant_id: trustedRequest.tenant_id,
      approval_id: trustedRequest.approval_id,
      mission_id: trustedRequest.mission_id,
      plan_id: trustedRequest.plan_id,
      step_id: trustedRequest.step_id,
      code: approval.code,
    };
  }

  return executePulseServerRequestWithServerClaimStore(
    trustedRequest,
    options,
  );
}
