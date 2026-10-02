import type {
  NftOriginCaptureInput,
} from "./types";

import {
  captureNftOrigin,
} from "./captureEngine";

import {
  expectedSourceTypeForMode,
} from "./capturePolicy";

import {
  evaluateOriginModePolicy,
} from "./modePolicy";

import {
  validateOriginModeConfig,
} from "./modeValidation";

export type NftOriginModeClosureIssueCode =
  | "MODE_CONFIG_INVALID"
  | "MODE_POLICY_REJECTED"
  | "SOURCE_POLICY_MISMATCH"
  | "CAPTURE_REJECTED"
  | "CAPTURE_RECORD_MISSING"
  | "CAPTURE_MODE_MISMATCH"
  | "CAPTURE_SOURCE_MISMATCH"
  | "CAPTURE_AUTHORITY_ESCALATION";

export type NftOriginModeClosureIssue = {
  readonly code:
    NftOriginModeClosureIssueCode;

  readonly message:
    string;
};

export type NftOriginModeClosureResult = {
  readonly valid:
    boolean;

  readonly modeConfigValid:
    boolean;

  readonly policyAccepted:
    boolean;

  readonly sourceValid:
    boolean;

  readonly captureValid:
    boolean;

  readonly recordValid:
    boolean;

  readonly authoritative:
    false;

  readonly issues:
    readonly NftOriginModeClosureIssue[];
};

export function validateOriginModeClosure(
  input:
    NftOriginCaptureInput
): NftOriginModeClosureResult {
  const issues:
    NftOriginModeClosureIssue[] = [];

  const modeValidation =
    validateOriginModeConfig(
      input.modeConfig.mode,
      input.modeConfig
    );

  const modePolicy =
    evaluateOriginModePolicy(
      input.modeConfig.mode,
      input.modeConfig
    );

  const expectedSource =
    expectedSourceTypeForMode(
      input.modeConfig
    );

  const sourceValid =
    input.source.type ===
      expectedSource;

  const capture =
    captureNftOrigin(
      input
    );

  if (!modeValidation.valid) {
    issues.push({
      code:
        "MODE_CONFIG_INVALID",

      message:
        "Origin mode configuration failed validation.",
    });
  }

  if (!modePolicy.accepted) {
    issues.push({
      code:
        "MODE_POLICY_REJECTED",

      message:
        "Origin mode policy rejected the profile.",
    });
  }

  if (!sourceValid) {
    issues.push({
      code:
        "SOURCE_POLICY_MISMATCH",

      message:
        `Expected ${expectedSource} source for ${input.modeConfig.mode}.`,
    });
  }

  if (!capture.accepted) {
    issues.push({
      code:
        "CAPTURE_REJECTED",

      message:
        "Origin capture did not produce an accepted record.",
    });
  }

  const record =
    capture.record;

  if (!record) {
    issues.push({
      code:
        "CAPTURE_RECORD_MISSING",

      message:
        "Origin closure requires a captured record.",
    });
  }

  if (
    record &&
    record.context.mode !==
      input.modeConfig.mode
  ) {
    issues.push({
      code:
        "CAPTURE_MODE_MISMATCH",

      message:
        "Captured Origin mode does not match the requested mode.",
    });
  }

  if (
    record &&
    record.context.source.type !==
      expectedSource
  ) {
    issues.push({
      code:
        "CAPTURE_SOURCE_MISMATCH",

      message:
        "Captured Origin source does not match mode source policy.",
    });
  }

  if (
    record &&
    record.authoritative !==
      false
  ) {
    issues.push({
      code:
        "CAPTURE_AUTHORITY_ESCALATION",

      message:
        "Origin mode capture must remain non-authoritative.",
    });
  }

  const recordValid =
    Boolean(
      record &&
      record.context.mode ===
        input.modeConfig.mode &&
      record.context.source.type ===
        expectedSource &&
      record.authoritative ===
        false
    );

  return {
    valid:
      issues.length === 0,

    modeConfigValid:
      modeValidation.valid,

    policyAccepted:
      modePolicy.accepted,

    sourceValid,

    captureValid:
      capture.accepted,

    recordValid,

    authoritative:
      false,

    issues,
  };
}
