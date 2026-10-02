import type {
  NftDnaLineage,
  NftDnaRecord,
} from "../dna/types";

import type {
  NftOriginRecord,
} from "../origin/types";

import type {
  NftProvenanceHistory,
  NftProvenanceRecord,
} from "./types";

import {
  validateNftDnaClosure,
} from "../dna/closure";

import {
  validateNftOrigin,
} from "../origin/validation";

import {
  validateNftProvenance,
} from "./validation";

import {
  validateNftProvenanceHistory,
} from "./historyValidation";

import {
  validateProvenanceConsistency,
} from "./consistency";

export type NftProvenanceClosureResult = {
  readonly provenanceValid:
    boolean;

  readonly historyValid:
    boolean;

  readonly originValid:
    boolean;

  readonly dnaValid:
    boolean;

  readonly consistencyValid:
    boolean;

  readonly issueCount:
    number;

  readonly valid:
    boolean;

  readonly authoritative:
    false;
};

export function validateNftProvenanceClosure(
  provenance:
    NftProvenanceRecord,
  history:
    NftProvenanceHistory,
  origin:
    NftOriginRecord,
  dna:
    NftDnaRecord,
  lineage:
    NftDnaLineage
): NftProvenanceClosureResult {
  const provenanceResult =
    validateNftProvenance(
      provenance
    );

  const historyResult =
    validateNftProvenanceHistory(
      history
    );

  const originResult =
    validateNftOrigin(
      origin
    );

  const dnaResult =
    validateNftDnaClosure(
      dna,
      lineage
    );

  const consistencyResult =
    validateProvenanceConsistency(
      provenance,
      history,
      origin,
      dna
    );

  const issueCount =
    provenanceResult.issues.length +
    historyResult.issues.length +
    originResult.issues.length +
    dnaResult.issueCount +
    consistencyResult.issues.length;

  return {
    provenanceValid:
      provenanceResult.valid,

    historyValid:
      historyResult.valid,

    originValid:
      originResult.valid,

    dnaValid:
      dnaResult.valid,

    consistencyValid:
      consistencyResult.consistent,

    issueCount,

    valid:
      provenanceResult.valid &&
      historyResult.valid &&
      originResult.valid &&
      dnaResult.valid &&
      consistencyResult.consistent,

    authoritative:
      false,
  };
}
