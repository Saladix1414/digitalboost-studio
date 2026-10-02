import type {
  NftOriginCaptureInput,
  NftOriginCaptureResult,
  NftOriginModeConfig,
} from "./types";

import {
  captureNftOrigin,
} from "./captureEngine";

function captureWithMode(
  input:
    Omit<
      NftOriginCaptureInput,
      "modeConfig"
    >,
  modeConfig:
    NftOriginModeConfig
): NftOriginCaptureResult {
  return captureNftOrigin({
    ...input,
    modeConfig,
  });
}

export function captureClassicOrigin(
  input:
    Omit<
      NftOriginCaptureInput,
      "modeConfig"
    >,
  modeConfig:
    Extract<
      NftOriginModeConfig,
      {
        mode:
          "CLASSIC";
      }
    >
): NftOriginCaptureResult {
  return captureWithMode(
    input,
    modeConfig
  );
}

export function captureGenerativeOrigin(
  input:
    Omit<
      NftOriginCaptureInput,
      "modeConfig"
    >,
  modeConfig:
    Extract<
      NftOriginModeConfig,
      {
        mode:
          "GENERATIVE";
      }
    >
): NftOriginCaptureResult {
  return captureWithMode(
    input,
    modeConfig
  );
}

export function captureLivingOrigin(
  input:
    Omit<
      NftOriginCaptureInput,
      "modeConfig"
    >,
  modeConfig:
    Extract<
      NftOriginModeConfig,
      {
        mode:
          "LIVING";
      }
    >
): NftOriginCaptureResult {
  return captureWithMode(
    input,
    modeConfig
  );
}

export function captureImportedOrigin(
  input:
    Omit<
      NftOriginCaptureInput,
      "modeConfig"
    >,
  modeConfig:
    Extract<
      NftOriginModeConfig,
      {
        mode:
          "IMPORTED";
      }
    >
): NftOriginCaptureResult {
  return captureWithMode(
    input,
    modeConfig
  );
}
