import type {
  DbxEconomyHealthInput,
  DbxEconomyHealthStatus,
} from "./types";

export function assessDbxEconomyHealth(
  input:
    DbxEconomyHealthInput
) {
  const errors =
    input.report.issues.filter(
      issue =>
        issue.severity ===
        "ERROR"
    ).length;

  const warnings =
    input.report.issues.filter(
      issue =>
        issue.severity ===
        "WARNING"
    ).length;

  let health:
    DbxEconomyHealthStatus;

  if (
    errors > 0
  ) {
    health =
      "CRITICAL";
  } else if (
    warnings > 0
  ) {
    health =
      "DEGRADED";
  } else {
    health =
      "HEALTHY";
  }

  return {
    health,

    errors,

    warnings,

    totalIssues:
      input.report.issues.length,

    unhealthySections:
      input.report.sections
        .filter(
          section =>
            !section.healthy
        )
        .map(
          section =>
            section.name
        ),

    evaluatedAt:
      input.evaluatedAt,

    reportId:
      input.report.id,

    authoritative:
      false as const,
  };
}
