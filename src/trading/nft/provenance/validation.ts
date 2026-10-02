import type {
  NftProvenanceRecord,
  NftProvenanceValidationIssue,
  NftProvenanceValidationResult,
} from "./types";

function hasText(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateNftProvenance(
  record:
    NftProvenanceRecord
): NftProvenanceValidationResult {
  const issues:
    NftProvenanceValidationIssue[] = [];

  if (!hasText(record.id)) {
    issues.push({
      code:
        "EMPTY_PROVENANCE_ID",

      message:
        "Provenance requires an id.",
    });
  }

  if (!hasText(record.assetId)) {
    issues.push({
      code:
        "EMPTY_ASSET_ID",

      message:
        "Provenance requires an asset id.",
    });
  }

  if (!hasText(record.collectionId)) {
    issues.push({
      code:
        "EMPTY_COLLECTION_ID",

      message:
        "Provenance requires a collection id.",
    });
  }

  if (!hasText(record.creatorRef)) {
    issues.push({
      code:
        "EMPTY_CREATOR_REF",

      message:
        "Provenance requires a creator reference.",
    });
  }

  if (record.evidence.length === 0) {
    issues.push({
      code:
        "EMPTY_EVIDENCE",

      message:
        "Provenance requires at least one evidence reference.",
    });
  }

  if (
    !Number.isInteger(
      record.version
    ) ||
    record.version < 1
  ) {
    issues.push({
      code:
        "INVALID_VERSION",

      message:
        "Provenance version must be >= 1.",
    });
  }

  if (!hasText(record.createdAt)) {
    issues.push({
      code:
        "EMPTY_CREATED_AT",

      message:
        "Provenance requires a creation timestamp.",
    });
  }

  if (record.authoritative !== false) {
    issues.push({
      code:
        "AUTHORITY_ESCALATION",

      message:
        "Provenance domain records must remain non-authoritative.",
    });
  }

  const evidenceIds =
    new Set<string>();

  for (
    const evidence
    of record.evidence
  ) {
    if (
      evidenceIds.has(
        evidence.id
      )
    ) {
      issues.push({
        code:
          "DUPLICATE_EVIDENCE_ID",

        message:
          `Duplicate evidence id: ${evidence.id}`,
      });
    }

    evidenceIds.add(
      evidence.id
    );
  }

  const linkIds =
    new Set<string>();

  for (
    const link
    of record.links
  ) {
    if (
      linkIds.has(
        link.id
      )
    ) {
      issues.push({
        code:
          "DUPLICATE_LINK_ID",

        message:
          `Duplicate link id: ${link.id}`,
      });
    }

    linkIds.add(
      link.id
    );

    if (
      !evidenceIds.has(
        link.fromEvidenceId
      )
    ) {
      issues.push({
        code:
          "BROKEN_LINK_SOURCE",

        message:
          `Unknown source evidence: ${link.fromEvidenceId}`,
      });
    }

    if (
      !evidenceIds.has(
        link.toEvidenceId
      )
    ) {
      issues.push({
        code:
          "BROKEN_LINK_TARGET",

        message:
          `Unknown target evidence: ${link.toEvidenceId}`,
      });
    }

    if (
      link.fromEvidenceId ===
        link.toEvidenceId
    ) {
      issues.push({
        code:
          "SELF_REFERENTIAL_LINK",

        message:
          `Provenance link ${link.id} cannot reference itself.`,
      });
    }
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
