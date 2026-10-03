import type {
  DbxEconomyReconciliationReport,
} from "./types";

export function summarizeDbxEconomyReconciliation(
  report:
    DbxEconomyReconciliationReport
) {
  return {
    reconciliationId:
      report.id,

    healthy:
      report.healthy,

    totalIssues:
      report.issues.length,

    errorCount:
      report.issues.filter(
        issue =>
          issue.severity ===
          "ERROR"
      ).length,

    sections:
      report.sections.map(
        section => ({
          name:
            section.name,

          healthy:
            section.healthy,

          checked:
            section.checked,

          issueCount:
            section.issueCount,
        })
      ),

    accountingSystemOfRecord:
      "DBX_LEDGER" as const,

    authoritative:
      false as const,
  };
}
