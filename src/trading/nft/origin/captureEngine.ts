import type {
  NftOriginCaptureInput,
  NftOriginCaptureIssue,
  NftOriginCaptureResult,
} from "./types";

import {
  validateOriginModeConfig,
} from "./modeValidation";

import {
  evaluateOriginModePolicy,
} from "./modePolicy";

import {
  expectedSourceTypeForMode,
} from "./capturePolicy";

function hasText(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function captureNftOrigin(
  input:
    NftOriginCaptureInput
): NftOriginCaptureResult {
  const issues:
    NftOriginCaptureIssue[] = [];

  const validation =
    validateOriginModeConfig(
      input.modeConfig.mode,
      input.modeConfig
    );

  const policy =
    evaluateOriginModePolicy(
      input.modeConfig.mode,
      input.modeConfig
    );

  if (
    !validation.valid ||
    !policy.accepted
  ) {
    issues.push({
      code:
        "INVALID_MODE_CONFIG",

      message:
        "Origin mode configuration failed validation or policy.",
    });
  }

  const expectedSource =
    expectedSourceTypeForMode(
      input.modeConfig
    );

  if (
    input.source.type !==
      expectedSource
  ) {
    issues.push({
      code:
        "SOURCE_TYPE_MISMATCH",

      message:
        `Expected source type ${expectedSource} for ${input.modeConfig.mode}.`,
    });
  }

  if (
    !hasText(
      input.assetId
    )
  ) {
    issues.push({
      code:
        "EMPTY_ASSET_ID",

      message:
        "Origin capture requires an asset id.",
    });
  }

  if (
    !hasText(
      input.collectionId
    )
  ) {
    issues.push({
      code:
        "EMPTY_COLLECTION_ID",

      message:
        "Origin capture requires a collection id.",
    });
  }

  if (
    !hasText(
      input.creator
    )
  ) {
    issues.push({
      code:
        "EMPTY_CREATOR",

      message:
        "Origin capture requires a creator reference.",
    });
  }

  if (
    !hasText(
      input.forgeConfig
    )
  ) {
    issues.push({
      code:
        "EMPTY_FORGE_CONFIG",

      message:
        "Origin capture requires a forge configuration reference.",
    });
  }

  if (
    !hasText(
      input.createdAt
    )
  ) {
    issues.push({
      code:
        "EMPTY_CREATED_AT",

      message:
        "Origin capture requires a creation timestamp.",
    });
  }

  if (
    !hasText(
      input.capturedAt
    )
  ) {
    issues.push({
      code:
        "EMPTY_CAPTURED_AT",

      message:
        "Origin capture requires a capture timestamp.",
    });
  }

  if (
    issues.length > 0
  ) {
    return {
      accepted:
        false,

      record:
        null,

      issues,
    };
  }

  return {
    accepted:
      true,

    issues:
      [],

    record: {
      id:
        input.id,

      identity: {
        assetId:
          input.assetId,

        collectionId:
          input.collectionId,

        creator:
          input.creator,
      },

      context: {
        mode:
          input.modeConfig.mode,

        createdAt:
          input.createdAt,

        forgeConfig:
          input.forgeConfig,

        source:
          input.source,
      },

      version:
        1,

      status:
        "CAPTURED",

      capturedAt:
        input.capturedAt,

      authoritative:
        false,
    },
  };
}
