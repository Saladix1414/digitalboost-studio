export const INFRASTRUCTURE_PHASE_34_STATUS = {
  phase:
    "34",

  state:
    "closed",

  capabilities: {
    database:
      "postgresql",

    cache:
      "redis",

    objectStorage:
      "s3-compatible",

    queue:
      "redis-queue",

    workers:
      "explicit-only",
  },

  guarantees: {
    providersOptIn:
      true,

    disabledByDefault:
      true,

    configurationFailClosed:
      true,

    startupCleanup:
      true,

    readinessIsolated:
      true,

    shutdownAllSettled:
      true,

    secretValuesServerSideOnly:
      true,

    rawErrorsSanitized:
      true,

    workerAutoStart:
      false,

    infrastructureAuthoritative:
      false,

    infrastructureSourceOfTruth:
      false,

    mayBypassPolicy:
      false,

    mayBypassRisk:
      false,

    mayBypassApproval:
      false,

    mayExecuteExternalSideEffects:
      false,
  },

  authoritative:
    false,
} as const;

export type InfrastructurePhase34Status =
  typeof INFRASTRUCTURE_PHASE_34_STATUS;

export function describeInfrastructurePhase34Closure():
  InfrastructurePhase34Status {
  return INFRASTRUCTURE_PHASE_34_STATUS;
}
