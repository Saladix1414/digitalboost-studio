import type {
  NftOriginHistory,
  NftOriginHistoryValidationIssue,
  NftOriginHistoryValidationResult,
} from "./types";

function nonEmpty(
  value: string
): boolean {
  return value.trim().length > 0;
}

function validHash(
  value: string
): boolean {
  return /^dna-[a-f0-9]{8}$/i.test(
    value
  );
}

export function validateNftOriginHistory(
  history:
    NftOriginHistory
): NftOriginHistoryValidationResult {
  const issues:
    NftOriginHistoryValidationIssue[] = [];

  if (
    !nonEmpty(
      history.originId
    )
  ) {
    issues.push({
      code:
        "INVALID_HISTORY_ORIGIN_ID",

      message:
        "Origin history id is required.",
    });
  }

  if (
    history.entries.length === 0
  ) {
    issues.push({
      code:
        "EMPTY_ORIGIN_HISTORY",

      message:
        "Origin history requires at least one entry.",
    });
  }

  history.entries.forEach(
    (
      entry,
      index
    ) => {
      if (
        !nonEmpty(
          entry.id
        )
      ) {
        issues.push({
          code:
            "INVALID_HISTORY_ENTRY_ID",

          message:
            "Origin history entry id is required.",
        });
      }

      const expectedVersion =
        index + 1;

      if (
        !Number.isInteger(
          entry.version
        ) ||
        entry.version < 1
      ) {
        issues.push({
          code:
            "INVALID_HISTORY_VERSION",

          message:
            "Origin history version must be >= 1.",
        });
      }

      if (
        entry.version !==
        expectedVersion
      ) {
        issues.push({
          code:
            "INVALID_HISTORY_SEQUENCE",

          message:
            "Origin history versions must be sequential.",
        });
      }

      if (index === 0) {
        if (
          entry.previousEntryId !==
            null
        ) {
          issues.push({
            code:
              "INVALID_HISTORY_LINK",

            message:
              "Initial origin history entry cannot reference a previous entry.",
          });
        }
      } else {
        const previous =
          history.entries[
            index - 1
          ];

        if (
          !previous ||
          entry.previousEntryId !==
            previous.id
        ) {
          issues.push({
            code:
              "INVALID_HISTORY_LINK",

            message:
              "Origin history entry must reference the immediately previous entry.",
          });
        }
      }

      if (
        !validHash(
          entry.snapshot
            .identityHash
        )
      ) {
        issues.push({
          code:
            "INVALID_IDENTITY_HASH",

          message:
            "Origin identity snapshot hash is invalid.",
        });
      }

      if (
        !validHash(
          entry.snapshot
            .contextHash
        )
      ) {
        issues.push({
          code:
            "INVALID_CONTEXT_HASH",

          message:
            "Origin context snapshot hash is invalid.",
        });
      }

      if (
        !validHash(
          entry.snapshot
            .recordHash
        )
      ) {
        issues.push({
          code:
            "INVALID_RECORD_HASH",

          message:
            "Origin record snapshot hash is invalid.",
        });
      }

      if (
        !nonEmpty(
          entry.capturedAt
        )
      ) {
        issues.push({
          code:
            "INVALID_HISTORY_TIMESTAMP",

          message:
            "Origin history timestamp is required.",
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
