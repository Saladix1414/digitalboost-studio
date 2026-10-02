import type {
  NftOriginRecord,
  NftOriginValidationIssue,
  NftOriginValidationResult,
} from "./types";

function nonEmpty(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateNftOrigin(
  origin:
    NftOriginRecord
): NftOriginValidationResult {
  const issues:
    NftOriginValidationIssue[] = [];

  if (
    !nonEmpty(
      origin.id
    )
  ) {
    issues.push({
      code:
        "INVALID_ORIGIN_ID",
      message:
        "Origin id is required.",
    });
  }

  if (
    !nonEmpty(
      origin.identity.assetId
    )
  ) {
    issues.push({
      code:
        "INVALID_ASSET_ID",
      message:
        "Origin asset id is required.",
    });
  }

  if (
    !nonEmpty(
      origin.identity.collectionId
    )
  ) {
    issues.push({
      code:
        "INVALID_COLLECTION_ID",
      message:
        "Origin collection id is required.",
    });
  }

  if (
    !nonEmpty(
      origin.identity.creator
    )
  ) {
    issues.push({
      code:
        "INVALID_CREATOR",
      message:
        "Origin creator is required.",
    });
  }

  if (
    !nonEmpty(
      origin.context.createdAt
    )
  ) {
    issues.push({
      code:
        "INVALID_CREATED_AT",
      message:
        "Origin creation timestamp is required.",
    });
  }

  if (
    !nonEmpty(
      origin.capturedAt
    )
  ) {
    issues.push({
      code:
        "INVALID_CAPTURED_AT",
      message:
        "Origin capture timestamp is required.",
    });
  }

  if (
    !nonEmpty(
      origin.context.forgeConfig
    )
  ) {
    issues.push({
      code:
        "INVALID_FORGE_CONFIG",
      message:
        "Origin forge configuration is required.",
    });
  }

  if (
    !nonEmpty(
      origin.context
        .source
        .reference
    )
  ) {
    issues.push({
      code:
        "INVALID_SOURCE_REFERENCE",
      message:
        "Origin source reference is required.",
    });
  }

  if (
    !Number.isInteger(
      origin.version
    ) ||
    origin.version < 1
  ) {
    issues.push({
      code:
        "INVALID_VERSION",
      message:
        "Origin version must be >= 1.",
    });
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
