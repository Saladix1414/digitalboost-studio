/**
 * PULSE — Authentication / Authorization Boundary
 * P0.4.21
 *
 * Esta capa NO autentica por sí sola.
 *
 * Recibe un Principal que debe haber sido resuelto por una capa
 * de autenticación confiable del servidor.
 *
 * El cliente nunca puede crear autoridad enviando:
 *
 *   approved=true
 *   role=admin
 *   permission=*
 *   tenant_id distinto
 *
 * Reglas:
 * - principal autenticado obligatorio;
 * - subject_id obligatorio;
 * - active_tenant_id obligatorio;
 * - active_tenant_id debe pertenecer a tenant_ids;
 * - request tenant debe coincidir con active tenant;
 * - autorización de acción debe pasar por una política explícita;
 * - ningún dato del request concede privilegios.
 */

import type {
  PulseServerExecutionRequest,
} from "../DigitalBoostPulseExecutionBoundary";

export const PULSE_AUTHORIZATION_BOUNDARY_VERSION =
  "pulse-authorization-boundary-v1" as const;

export type PulseAuthorizationRejectCode =
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_PRINCIPAL"
  | "TENANT_ACCESS_DENIED"
  | "ACTION_NOT_AUTHORIZED";

export interface PulsePrincipal {
  readonly authenticated: boolean;
  readonly subject_id: string;
  readonly active_tenant_id: string;
  readonly tenant_ids: readonly string[];
}

export type PulseActionAuthorizer = (
  principal: PulsePrincipal,
  request: PulseServerExecutionRequest,
) => boolean | Promise<boolean>;

export interface PulseAuthorizationAccepted {
  readonly ok: true;
  readonly boundary_version:
    typeof PULSE_AUTHORIZATION_BOUNDARY_VERSION;
  readonly subject_id: string;
  readonly tenant_id: string;
}

export interface PulseAuthorizationRejected {
  readonly ok: false;
  readonly boundary_version:
    typeof PULSE_AUTHORIZATION_BOUNDARY_VERSION;
  readonly code: PulseAuthorizationRejectCode;
  readonly reason: string;
}

export type PulseAuthorizationDecision =
  | PulseAuthorizationAccepted
  | PulseAuthorizationRejected;

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function reject(
  code: PulseAuthorizationRejectCode,
  reason: string,
): PulseAuthorizationRejected {
  return {
    ok: false,
    boundary_version: PULSE_AUTHORIZATION_BOUNDARY_VERSION,
    code,
    reason,
  };
}

export async function authorizePulseServerExecution(
  principal: unknown,
  request: PulseServerExecutionRequest,
  authorizeAction: PulseActionAuthorizer,
): Promise<PulseAuthorizationDecision> {
  if (!principal || typeof principal !== "object") {
    return reject(
      "AUTHENTICATION_REQUIRED",
      "authenticated server principal is required",
    );
  }

  const candidate = principal as Partial<PulsePrincipal>;

  if (candidate.authenticated !== true) {
    return reject(
      "AUTHENTICATION_REQUIRED",
      "server principal is not authenticated",
    );
  }

  if (!nonEmpty(candidate.subject_id)) {
    return reject(
      "INVALID_PRINCIPAL",
      "principal subject_id is required",
    );
  }

  if (!nonEmpty(candidate.active_tenant_id)) {
    return reject(
      "INVALID_PRINCIPAL",
      "principal active_tenant_id is required",
    );
  }

  if (!Array.isArray(candidate.tenant_ids)) {
    return reject(
      "INVALID_PRINCIPAL",
      "principal tenant_ids must be an array",
    );
  }

  if (!candidate.tenant_ids.includes(candidate.active_tenant_id)) {
    return reject(
      "INVALID_PRINCIPAL",
      "active tenant is not present in principal tenant_ids",
    );
  }

  /*
   * The request tenant is untrusted input.
   * It must not select a different tenant than the trusted principal.
   */
  if (request.tenant_id !== candidate.active_tenant_id) {
    return reject(
      "TENANT_ACCESS_DENIED",
      "request tenant does not match authenticated active tenant",
    );
  }

  let authorized = false;

  try {
    authorized = await authorizeAction(
      candidate as PulsePrincipal,
      request,
    );
  } catch {
    authorized = false;
  }

  if (!authorized) {
    return reject(
      "ACTION_NOT_AUTHORIZED",
      "principal is not authorized for requested action",
    );
  }

  return {
    ok: true,
    boundary_version:
      PULSE_AUTHORIZATION_BOUNDARY_VERSION,
    subject_id: candidate.subject_id,
    tenant_id: candidate.active_tenant_id,
  };
}
