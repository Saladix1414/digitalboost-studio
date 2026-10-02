import type {
  NftOriginMode,
  NftOriginModeConfig,
} from "./types";

export function createDefaultOriginModeConfig(
  mode:
    NftOriginMode
): NftOriginModeConfig {
  switch (mode) {
    case "CLASSIC":
      return {
        mode,
        config: {
          workflow:
            "FORGE",

          templateRef:
            null,
        },
      };

    case "GENERATIVE":
      return {
        mode,
        config: {
          generatorRef:
            "generator:local:v1",

          seed:
            "seed-local-001",

          deterministic:
            true,

          rulesetVersion:
            1,
        },
      };

    case "LIVING":
      return {
        mode,
        config: {
          evolutionModel:
            "STATE_BASED",

          initialState:
            "GENESIS",

          evolutionSchemaRef:
            "living-schema:v1",
        },
      };

    case "IMPORTED":
      return {
        mode,
        config: {
          sourceSystem:
            "external-local",

          externalAssetRef:
            "external-asset-001",

          importedAt:
            "2026-10-10T12:00:00.000Z",
        },
      };
  }
}
