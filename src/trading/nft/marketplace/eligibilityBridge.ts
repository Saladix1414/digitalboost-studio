import {
  validateNftProvenanceClosure,
} from "../provenance/closure";

import type {
  NftMarketplaceListing,
} from "./types";

import {
  validateMarketplaceEligibility,
} from "./eligibility";

import {
  nftProvenanceClosureFixture,
} from "../provenance/closureFixtures";

export function evaluateFixtureMarketplaceEligibility(
  listing:
    NftMarketplaceListing
) {
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

  const issues =
    [];

  if (
    listing.asset.assetId !==
      fixture.provenance.assetId
  ) {
    issues.push({
      code:
        "ASSET_ID_MISMATCH" as const,

      message:
        "Listing asset must match provenance asset.",
    });
  }

  if (
    listing.asset.collectionId !==
      fixture.provenance.collectionId
  ) {
    issues.push({
      code:
        "COLLECTION_ID_MISMATCH" as const,

      message:
        "Listing collection must match provenance collection.",
    });
  }

  const base =
    validateMarketplaceEligibility(
      listing,
      closure
    );

  return {
    eligible:
      base.eligible &&
      issues.length === 0,

    issues: [
      ...base.issues,
      ...issues,
    ],

    authoritative:
      false as const,
  };
}
