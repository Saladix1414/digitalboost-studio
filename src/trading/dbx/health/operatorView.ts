import type {
  DbxEconomyHealthInput,
  DbxEconomyOperatorView,
} from "./types";

import {
  assessDbxEconomyHealth,
} from "./assessment";

import {
  evaluateDbxEconomySafetyInterlock,
} from "./interlock";

export function createDbxEconomyOperatorView(
  input:
    DbxEconomyHealthInput
): DbxEconomyOperatorView {
  const assessment =
    assessDbxEconomyHealth(
      input
    );

  const interlock =
    evaluateDbxEconomySafetyInterlock(
      input
    );

  return {
    health:
      assessment.health,

    totalIssues:
      assessment.totalIssues,

    errors:
      assessment.errors,

    warnings:
      assessment.warnings,

    unhealthySections:
      assessment.unhealthySections,

    newEconomicOperationsAllowed:
      interlock
        .newEconomicOperationsAllowed,

    accountingSystemOfRecord:
      "DBX_LEDGER",

    authoritative:
      false,
  };
}
