import {
  validateNftDna,
} from "./validation";

import {
  validateNftDnaLineage,
} from "./lineageValidation";

import {
  validateNftDnaConsistency,
} from "./consistency";

import type {
  NftDnaLineage,
  NftDnaRecord,
} from "./types";

export type NftDnaClosureResult = {
  readonly valid: boolean;

  readonly dnaValid: boolean;

  readonly lineageValid: boolean;

  readonly consistencyValid: boolean;

  readonly issueCount: number;
};

export function validateNftDnaClosure(
  dna:
    NftDnaRecord,
  lineage:
    NftDnaLineage
): NftDnaClosureResult {
  const dnaValidation =
    validateNftDna(
      dna
    );

  const lineageValidation =
    validateNftDnaLineage(
      lineage
    );

  const consistencyValidation =
    validateNftDnaConsistency(
      dna,
      lineage
    );

  const issueCount =
    dnaValidation.issues.length +
    lineageValidation.issues.length +
    consistencyValidation.issues.length;

  return {
    valid:
      dnaValidation.valid &&
      lineageValidation.valid &&
      consistencyValidation.consistent,

    dnaValid:
      dnaValidation.valid,

    lineageValid:
      lineageValidation.valid,

    consistencyValid:
      consistencyValidation.consistent,

    issueCount,
  };
}
