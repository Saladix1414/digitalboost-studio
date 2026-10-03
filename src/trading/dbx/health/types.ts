import type {
  DbxEconomyReconciliationReport,
} from "../reconciliation/types";

export type DbxEconomyHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "CRITICAL";

export type DbxEconomySafetyDecision = {
  readonly health:
    DbxEconomyHealthStatus;

  readonly newEconomicOperationsAllowed:
    boolean;

  readonly reason:
    string;

  readonly reportId:
    string;

  readonly evaluatedAt:
    string;

  readonly derivedFrom:
    "DBX_RECONCILIATION";

  readonly authoritative:
    false;
};

export type DbxEconomyOperatorView = {
  readonly health:
    DbxEconomyHealthStatus;

  readonly totalIssues:
    number;

  readonly errors:
    number;

  readonly warnings:
    number;

  readonly unhealthySections:
    readonly string[];

  readonly newEconomicOperationsAllowed:
    boolean;

  readonly accountingSystemOfRecord:
    "DBX_LEDGER";

  readonly authoritative:
    false;
};

export type DbxEconomyHealthInput = {
  readonly report:
    DbxEconomyReconciliationReport;

  readonly evaluatedAt:
    string;
};
