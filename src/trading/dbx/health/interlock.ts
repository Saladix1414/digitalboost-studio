import type {
  DbxEconomyHealthInput,
  DbxEconomySafetyDecision,
} from "./types";

import {
  assessDbxEconomyHealth,
} from "./assessment";

export function evaluateDbxEconomySafetyInterlock(
  input:
    DbxEconomyHealthInput
): DbxEconomySafetyDecision {
  const assessment =
    assessDbxEconomyHealth(
      input
    );

  if (
    assessment.health ===
    "CRITICAL"
  ) {
    return {
      health:
        "CRITICAL",

      newEconomicOperationsAllowed:
        false,

      reason:
        "DBX_RECONCILIATION_CRITICAL",

      reportId:
        assessment.reportId,

      evaluatedAt:
        assessment.evaluatedAt,

      derivedFrom:
        "DBX_RECONCILIATION",

      authoritative:
        false,
    };
  }

  return {
    health:
      assessment.health,

    newEconomicOperationsAllowed:
      true,

    reason:
      assessment.health ===
      "DEGRADED"
        ? "DBX_RECONCILIATION_WARNING"
        : "DBX_RECONCILIATION_HEALTHY",

    reportId:
      assessment.reportId,

    evaluatedAt:
      assessment.evaluatedAt,

    derivedFrom:
      "DBX_RECONCILIATION",

    authoritative:
      false,
  };
}

export function assertDbxEconomyOperational(
  decision:
    DbxEconomySafetyDecision
) {
  if (
    !decision
      .newEconomicOperationsAllowed
  ) {
    throw new Error(
      "DBX_ECONOMY_SAFETY_INTERLOCK_BLOCKED"
    );
  }

  return {
    operational:
      true as const,

    health:
      decision.health,

    authoritative:
      false as const,
  };
}
