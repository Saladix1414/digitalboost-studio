import type {
  NftOriginMode,
  NftOriginModeConfig,
  NftOriginModeValidationIssue,
  NftOriginModeValidationResult,
} from "./types";

function nonEmpty(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateOriginModeConfig(
  expectedMode:
    NftOriginMode,
  profile:
    NftOriginModeConfig
): NftOriginModeValidationResult {
  const issues:
    NftOriginModeValidationIssue[] = [];

  if (
    profile.mode !==
      expectedMode
  ) {
    issues.push({
      code:
        "MODE_MISMATCH",

      message:
        "Origin mode configuration must match the Origin mode.",
    });

    return {
      valid: false,
      issues,
    };
  }

  switch (profile.mode) {
    case "CLASSIC": {
      if (
        profile.config.workflow !==
          "MANUAL" &&
        profile.config.workflow !==
          "FORGE"
      ) {
        issues.push({
          code:
            "INVALID_CLASSIC_WORKFLOW",

          message:
            "Classic Origin requires MANUAL or FORGE workflow.",
        });
      }

      break;
    }

    case "GENERATIVE": {
      if (
        !nonEmpty(
          profile.config
            .generatorRef
        )
      ) {
        issues.push({
          code:
            "INVALID_GENERATOR_REFERENCE",

          message:
            "Generative Origin requires a generator reference.",
        });
      }

      if (
        !nonEmpty(
          profile.config.seed
        )
      ) {
        issues.push({
          code:
            "INVALID_GENERATIVE_SEED",

          message:
            "Generative Origin requires a deterministic seed reference.",
        });
      }

      if (
        !Number.isInteger(
          profile.config
            .rulesetVersion
        ) ||
        profile.config
          .rulesetVersion < 1
      ) {
        issues.push({
          code:
            "INVALID_GENERATIVE_RULESET_VERSION",

          message:
            "Generative ruleset version must be >= 1.",
        });
      }

      break;
    }

    case "LIVING": {
      if (
        !nonEmpty(
          profile.config
            .initialState
        )
      ) {
        issues.push({
          code:
            "INVALID_LIVING_INITIAL_STATE",

          message:
            "Living Origin requires an initial state.",
        });
      }

      if (
        !nonEmpty(
          profile.config
            .evolutionSchemaRef
        )
      ) {
        issues.push({
          code:
            "INVALID_LIVING_SCHEMA_REFERENCE",

          message:
            "Living Origin requires an evolution schema reference.",
        });
      }

      break;
    }

    case "IMPORTED": {
      if (
        !nonEmpty(
          profile.config
            .sourceSystem
        )
      ) {
        issues.push({
          code:
            "INVALID_IMPORT_SOURCE_SYSTEM",

          message:
            "Imported Origin requires a source system.",
        });
      }

      if (
        !nonEmpty(
          profile.config
            .externalAssetRef
        )
      ) {
        issues.push({
          code:
            "INVALID_IMPORT_ASSET_REFERENCE",

          message:
            "Imported Origin requires an external asset reference.",
        });
      }

      if (
        !nonEmpty(
          profile.config
            .importedAt
        )
      ) {
        issues.push({
          code:
            "INVALID_IMPORT_TIMESTAMP",

          message:
            "Imported Origin requires an import timestamp.",
        });
      }

      break;
    }
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
