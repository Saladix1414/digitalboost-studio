import {
  validateNftDnaClosure,
} from "../dna/closure";

import {
  validateNftOrigin,
} from "./validation";

import {
  validateOriginAgainstDna,
} from "./dnaBridge";

import type {
  NftDnaLineage,
  NftDnaRecord,
} from "../dna/types";

import type {
  NftOriginRecord,
} from "./types";

export type NftOriginDnaClosureResult = {
  readonly valid: boolean;

  readonly originValid: boolean;

  readonly dnaValid: boolean;

  readonly bridgeValid: boolean;

  readonly issueCount: number;
};

export function validateOriginDnaClosure(
  origin:
    NftOriginRecord,
  dna:
    NftDnaRecord,
  lineage:
    NftDnaLineage
): NftOriginDnaClosureResult {
  const originValidation =
    validateNftOrigin(
      origin
    );

  const dnaValidation =
    validateNftDnaClosure(
      dna,
      lineage
    );

  const bridgeValidation =
    validateOriginAgainstDna(
      origin,
      dna
    );

  const issueCount =
    originValidation.issues.length +
    dnaValidation.issueCount +
    bridgeValidation.issues.length;

  return {
    valid:
      originValidation.valid &&
      dnaValidation.valid &&
      bridgeValidation.consistent,

    originValid:
      originValidation.valid,

    dnaValid:
      dnaValidation.valid,

    bridgeValid:
      bridgeValidation.consistent,

    issueCount,
  };
}
