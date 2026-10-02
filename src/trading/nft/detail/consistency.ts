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
  /*
   * Direct IDs belong to different domain namespaces.
   *
   * Catalog identity:
   *   asset-catalog-*
   *   collection-origin-mode-*
   *
   * Provenance identity:
   *   asset-origin-*
   *   collection-origin-*
   *
   * Therefore direct equality is informational only.
   */
  readonly assetIdDirectMatch:
    boolean;

  readonly collectionIdDirectMatch:
    boolean;

  /*
   * Cross-domain coherence is established through
   * explicit references carried by Detail.
   */
  readonly provenanceReferenceMatch:
    boolean;

  readonly dnaReferenceMatch:
    boolean;

  readonly originReferenceMatch:
    boolean | null;

  readonly provenanceClosureValid:
    boolean;

  readonly coherent:
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

  const assetIdDirectMatch =
    detail.identity.assetId ===
    fixture.provenance.assetId;

  const collectionIdDirectMatch =
    detail.identity.collectionId ===
    fixture.provenance.collectionId;

  const provenanceReferenceMatch =
    detail.integrity.provenanceId ===
    fixture.provenance.id;

  const dnaReferenceMatch =
    detail.integrity.dnaId ===
    fixture.dna.id;

  const originReferenceMatch =
    detail.integrity.originId === null
      ? null
      : detail.integrity.originId ===
        fixture.origin.id;

  const coherent =
    provenanceReferenceMatch &&
    dnaReferenceMatch &&
    closure.valid &&
    (
      originReferenceMatch === null ||
      originReferenceMatch === true
    );

  return {
    assetIdDirectMatch,

    collectionIdDirectMatch,

    provenanceReferenceMatch,

    dnaReferenceMatch,

    originReferenceMatch,

    provenanceClosureValid:
      closure.valid,

    coherent,

    authoritative:
      false,
  };
}
