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
