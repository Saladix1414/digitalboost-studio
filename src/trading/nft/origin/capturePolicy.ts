import type {
  NftOriginModeConfig,
  NftOriginSourceType,
} from "./types";

export function expectedSourceTypeForMode(
  profile:
    NftOriginModeConfig
): NftOriginSourceType {
  switch (profile.mode) {
    case "CLASSIC":
      return profile.config.workflow === "FORGE"
        ? "FORGE"
        : "MANUAL";

    case "GENERATIVE":
      return "GENERATOR";

    case "LIVING":
      return "FORGE";

    case "IMPORTED":
      return "IMPORT";
  }
}
