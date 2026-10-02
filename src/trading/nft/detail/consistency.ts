import {
  nftProvenanceClosureFixture,
} from "../provenance/closureFixtures";

import {
  validateNftProvenanceClosure,
} from "../provenance/closure";

import type {
  NftAssetDetail,
} from "./types";

export type NftDetailConsistency = {
  readonly assetMatch:
    boolean;

  readonly collectionMatch:
    boolean;

  readonly provenanceClosureValid:
    boolean;

  readonly authoritative:
    false;
};

export function evaluateNftDetailConsistency(
  detail:
    NftAssetDetail
): NftDetailConsistency {
  const fixture =
    nftProvenanceClosureFixture;

  const closure =
    validateNftProvenanceClosure(
      fixture.provenance,
      fixture.history,
      fixture.origin,
      fixture.dna,
      fixture.lineage
    );

  return {
    assetMatch:
      detail.identity.assetId ===
      fixture.provenance.assetId,

    collectionMatch:
      detail.identity.collectionId ===
      fixture.provenance.collectionId,

    provenanceClosureValid:
      closure.valid,

    authoritative:
      false,
  };
}
