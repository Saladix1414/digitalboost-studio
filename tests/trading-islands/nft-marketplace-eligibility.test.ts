import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateFixtureMarketplaceEligibility,
} from "../../src/trading/nft/marketplace/eligibilityBridge";

import {
  validateMarketplaceEligibility,
} from "../../src/trading/nft/marketplace/eligibility";

import {
  createMarketplaceSaleIntent,
} from "../../src/trading/nft/marketplace/saleIntent";

import {
  nftMarketplaceAssetMismatchFixture,
  nftMarketplaceCollectionMismatchFixture,
  nftMarketplaceMissingProvenanceFixture,
  nftMarketplaceMissingWalletFixture,
  nftMarketplaceReadyListingFixture,
} from "../../src/trading/nft/marketplace/eligibilityFixtures";

import {
  nftProvenanceClosureFixture,
} from "../../src/trading/nft/provenance/closureFixtures";

import {
  validateNftProvenanceClosure,
} from "../../src/trading/nft/provenance/closure";

test(
  "READY listing with coherent provenance is eligible",
  () => {
    const result =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceReadyListingFixture
      );

    assert.equal(
      result.eligible,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "eligible listing can produce a sale intent",
  () => {
    const eligibility =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceReadyListingFixture
      );

    const intent =
      createMarketplaceSaleIntent(
        nftMarketplaceReadyListingFixture,
        eligibility,
        "2026-10-14T10:06:00.000Z"
      );

    assert.equal(
      intent.listingId,
      nftMarketplaceReadyListingFixture.id
    );

    assert.equal(
      intent.assetId,
      nftMarketplaceReadyListingFixture.asset.assetId
    );

    assert.equal(
      intent.sellerId,
      nftMarketplaceReadyListingFixture.seller.sellerId
    );

    assert.equal(
      intent.authoritative,
      false
    );
  }
);

test(
  "asset mismatch is rejected",
  () => {
    const result =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceAssetMismatchFixture
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "ASSET_ID_MISMATCH"
      )
    );
  }
);

test(
  "collection mismatch is rejected",
  () => {
    const result =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceCollectionMismatchFixture
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "COLLECTION_ID_MISMATCH"
      )
    );
  }
);

test(
  "missing seller wallet reference is rejected",
  () => {
    const result =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceMissingWalletFixture
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "WALLET_REFERENCE_MISSING"
      )
    );
  }
);

test(
  "missing provenance reference is rejected",
  () => {
    const result =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceMissingProvenanceFixture
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "PROVENANCE_REFERENCE_MISSING"
      )
    );
  }
);

test(
  "DRAFT listing cannot become eligible",
  () => {
    const draft = {
      ...nftMarketplaceReadyListingFixture,

      status:
        "DRAFT" as const,
    };

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

    const result =
      validateMarketplaceEligibility(
        draft,
        closure
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "LISTING_NOT_READY"
      )
    );
  }
);

test(
  "invalid provenance closure blocks eligibility",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const invalidClosure =
      validateNftProvenanceClosure(
        {
          ...fixture.provenance,

          creatorRef:
            "tampered-creator",
        },
        fixture.history,
        fixture.origin,
        fixture.dna,
        fixture.lineage
      );

    assert.equal(
      invalidClosure.valid,
      false
    );

    const result =
      validateMarketplaceEligibility(
        nftMarketplaceReadyListingFixture,
        invalidClosure
      );

    assert.equal(
      result.eligible,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "PROVENANCE_CLOSURE_INVALID"
      )
    );
  }
);

test(
  "sale intent creation rejects ineligible listing",
  () => {
    const eligibility =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceMissingWalletFixture
      );

    assert.equal(
      eligibility.eligible,
      false
    );

    assert.throws(
      () =>
        createMarketplaceSaleIntent(
          nftMarketplaceMissingWalletFixture,
          eligibility,
          "2026-10-14T10:06:00.000Z"
        ),
      /MARKETPLACE_LISTING_NOT_ELIGIBLE/
    );
  }
);
