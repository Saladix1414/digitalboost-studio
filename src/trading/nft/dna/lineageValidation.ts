import type {
  NftDnaLineage,
  NftDnaLineageValidationIssue,
  NftDnaLineageValidationResult,
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

export function validateNftDnaLineage(
  lineage:
    NftDnaLineage
): NftDnaLineageValidationResult {
  const issues:
    NftDnaLineageValidationIssue[] = [];

  if (
    !nonEmpty(
      lineage.dnaId
    )
  ) {
    issues.push({
      code:
        "INVALID_LINEAGE_DNA_ID",

      message:
        "Lineage DNA id is required.",
    });
  }

  lineage.entries.forEach(
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
            "INVALID_LINEAGE_ENTRY_ID",

          message:
            "Lineage entry id is required.",
        });
      }

      if (
        !Number.isInteger(
          entry.version
        ) ||
        entry.version < 1
      ) {
        issues.push({
          code:
            "INVALID_LINEAGE_VERSION",

          message:
            "Lineage version must be >= 1.",
        });
      }

      const expectedVersion =
        index + 1;

      if (
        entry.version !==
        expectedVersion
      ) {
        issues.push({
          code:
            "INVALID_LINEAGE_SEQUENCE",

          message:
            "Lineage versions must be sequential.",
        });
      }

      if (index === 0) {
        if (
          entry.previousEntryId !==
            null
        ) {
          issues.push({
            code:
              "INVALID_PREVIOUS_ENTRY",

            message:
              "Initial lineage entry cannot have a previous entry.",
          });
        }
      } else {
        const previous =
          lineage.entries[
            index - 1
          ];

        if (
          !previous ||
          entry.previousEntryId !==
            previous.id
        ) {
          issues.push({
            code:
              "INVALID_PREVIOUS_ENTRY",

            message:
              "Lineage entry must reference the prior entry.",
          });
        }
      }

      if (
        !validHash(
          entry.identityHash
        )
      ) {
        issues.push({
          code:
            "INVALID_IDENTITY_HASH",

          message:
            "Identity snapshot hash is invalid.",
        });
      }

      if (
        !validHash(
          entry.integrityHash
        )
      ) {
        issues.push({
          code:
            "INVALID_INTEGRITY_HASH",

          message:
            "Integrity snapshot hash is invalid.",
        });
      }

      if (
        entry.blockchainProofHash !==
          null &&
        !validHash(
          entry.blockchainProofHash
        )
      ) {
        issues.push({
          code:
            "INVALID_BLOCKCHAIN_PROOF_HASH",

          message:
            "Blockchain proof snapshot hash is invalid.",
        });
      }

      if (
        !nonEmpty(
          entry.createdAt
        )
      ) {
        issues.push({
          code:
            "INVALID_LINEAGE_TIMESTAMP",

          message:
            "Lineage timestamp is required.",
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
