import type {
  NftProvenanceHistory,
  NftProvenanceHistoryValidationIssue,
  NftProvenanceHistoryValidationResult,
} from "./types";

function hasText(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateNftProvenanceHistory(
  history:
    NftProvenanceHistory
): NftProvenanceHistoryValidationResult {
  const issues:
    NftProvenanceHistoryValidationIssue[] = [];

  if (
    history.entries.length ===
      0
  ) {
    issues.push({
      code:
        "EMPTY_HISTORY",

      message:
        "Provenance history requires at least one entry.",
    });

    return {
      valid:
        false,

      issues,
    };
  }

  history.entries.forEach(
    (
      entry,
      index
    ) => {
      const expectedVersion =
        index + 1;

      if (
        entry.provenanceId !==
          history.provenanceId
      ) {
        issues.push({
          code:
            "PROVENANCE_ID_MISMATCH",

          message:
            `History entry ${entry.id} belongs to another provenance record.`,
        });
      }

      if (
        entry.version !==
          expectedVersion
      ) {
        issues.push({
          code:
            "INVALID_HISTORY_VERSION",

          message:
            `Expected provenance history version ${expectedVersion}.`,
        });
      }

      const expectedPrevious =
        index === 0
          ? null
          : history.entries[
              index - 1
            ].id;

      if (
        entry.previousEntryId !==
          expectedPrevious
      ) {
        issues.push({
          code:
            "BROKEN_PREVIOUS_ENTRY",

          message:
            `History entry ${entry.id} has an invalid previous link.`,
        });
      }

      if (
        !hasText(
          entry.snapshot
            .evidenceHash
        )
      ) {
        issues.push({
          code:
            "INVALID_EVIDENCE_HASH",

          message:
            `History entry ${entry.id} has no evidence hash.`,
        });
      }

      if (
        !hasText(
          entry.snapshot
            .linksHash
        )
      ) {
        issues.push({
          code:
            "INVALID_LINKS_HASH",

          message:
            `History entry ${entry.id} has no links hash.`,
        });
      }

      if (
        !hasText(
          entry.snapshot
            .recordHash
        )
      ) {
        issues.push({
          code:
            "INVALID_RECORD_HASH",

          message:
            `History entry ${entry.id} has no record hash.`,
        });
      }

      if (
        !hasText(
          entry.capturedAt
        )
      ) {
        issues.push({
          code:
            "EMPTY_CAPTURED_AT",

          message:
            `History entry ${entry.id} requires a timestamp.`,
        });
      }

      if (
        entry.authoritative !==
          false
      ) {
        issues.push({
          code:
            "HISTORY_AUTHORITY_ESCALATION",

          message:
            `History entry ${entry.id} must remain non-authoritative.`,
        });
      }
    }
  );

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
