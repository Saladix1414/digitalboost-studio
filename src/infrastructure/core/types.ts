export type InfrastructureAuthority =
  false;

export type InfrastructureHealthState =
  | "ready"
  | "degraded"
  | "unavailable";

export type InfrastructureHealth = {
  readonly state:
    InfrastructureHealthState;

  readonly checkedAt:
    string;

  readonly detail:
    string | null;

  readonly authoritative:
    false;
};

export type InfrastructureOperationContext = {
  readonly correlationId:
    string | null;

  readonly tenantId:
    string | null;

  readonly actorId:
    string | null;

  readonly requestedAt:
    string;

  readonly authoritative:
    false;
};

export type InfrastructureResultMetadata = {
  readonly observedAt:
    string;

  readonly source:
    string;

  readonly authoritative:
    false;
};

export function createInfrastructureOperationContext(
  input: {
    readonly requestedAt:
      string;

    readonly correlationId?:
      string | null;

    readonly tenantId?:
      string | null;

    readonly actorId?:
      string | null;
  }
):
  InfrastructureOperationContext {
  if (
    typeof input.requestedAt !==
      "string" ||
    input.requestedAt.trim().length ===
      0
  ) {
    throw new Error(
      "Infrastructure operation requestedAt is required."
    );
  }

  return {
    correlationId:
      input.correlationId ??
      null,

    tenantId:
      input.tenantId ??
      null,

    actorId:
      input.actorId ??
      null,

    requestedAt:
      input.requestedAt,

    authoritative:
      false,
  };
}
