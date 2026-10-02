import type {
  NftOriginMode,
  NftOriginModeConfig,
} from "./types";

import {
  validateOriginModeConfig,
} from "./modeValidation";

export type NftOriginModePolicyResult = {
  readonly accepted: boolean;

  readonly reason:
    string | null;
};

export function evaluateOriginModePolicy(
  mode:
    NftOriginMode,
  profile:
    NftOriginModeConfig
): NftOriginModePolicyResult {
  const validation =
    validateOriginModeConfig(
      mode,
      profile
    );

  if (!validation.valid) {
    return {
      accepted:
        false,

      reason:
        validation.issues
          .map(
            (issue) =>
              issue.code
          )
          .join(","),
    };
  }

  if (
    profile.mode ===
      "GENERATIVE" &&
    profile.config
      .deterministic !==
      true
  ) {
    return {
      accepted:
        false,

      reason:
        "GENERATIVE_MODE_REQUIRES_DETERMINISTIC_CONFIG",
    };
  }

  return {
    accepted:
      true,

    reason:
      null,
  };
}
