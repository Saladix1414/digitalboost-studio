import assert from "node:assert/strict";
import test from "node:test";

import {
  nftMarketplaceListingFixture,
} from "../../src/trading/nft/marketplace/fixtures";

import {
  validateMarketplaceListing,
} from "../../src/trading/nft/marketplace/validation";

import {
  updateMarketplaceListingStatus,
} from "../../src/trading/nft/marketplace/engine";

test(
  "marketplace listing fixture validates",
  () => {
    const result =
      validateMarketplaceListing(
        nftMarketplaceListingFixture
      );

    assert.equal(
      result.valid,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );
  }
);

test(
  "marketplace listing references provenance and DNA",
  () => {
    assert.equal(
      nftMarketplaceListingFixture
        .asset.provenanceId !== null,
      true
    );

    assert.equal(
      nftMarketplaceListingFixture
        .asset.dnaId !== null,
      true
    );
  }
);

test(
  "listing transitions DRAFT to READY",
  () => {
    const ready =
      updateMarketplaceListingStatus(
        nftMarketplaceListingFixture,
        "READY",
        "2026-10-14T10:05:00.000Z"
      );

    assert.equal(
      ready.status,
      "READY"
    );

    assert.equal(
      ready.version,
      2
    );
  }
);

test(
  "listing transitions READY to LISTED",
  () => {
    const ready =
      updateMarketplaceListingStatus(
        nftMarketplaceListingFixture,
        "READY",
        "2026-10-14T10:05:00.000Z"
      );

    const listed =
      updateMarketplaceListingStatus(
        ready,
        "LISTED",
        "2026-10-14T10:10:00.000Z"
      );

    assert.equal(
      listed.status,
      "LISTED"
    );

    assert.equal(
      listed.version,
      3
    );
  }
);

test(
  "listing can pause and resume",
  () => {
    const ready =
      updateMarketplaceListingStatus(
        nftMarketplaceListingFixture,
        "READY",
        "2026-10-14T10:05:00.000Z"
      );

    const listed =
      updateMarketplaceListingStatus(
        ready,
        "LISTED",
        "2026-10-14T10:10:00.000Z"
      );

    const paused =
      updateMarketplaceListingStatus(
        listed,
        "PAUSED",
        "2026-10-14T10:15:00.000Z"
      );

    const resumed =
      updateMarketplaceListingStatus(
        paused,
        "LISTED",
        "2026-10-14T10:20:00.000Z"
      );

    assert.equal(
      paused.status,
      "PAUSED"
    );

    assert.equal(
      resumed.status,
      "LISTED"
    );
  }
);

test(
  "listing can reach SOLD from LISTED",
  () => {
    const ready =
      updateMarketplaceListingStatus(
        nftMarketplaceListingFixture,
        "READY",
        "2026-10-14T10:05:00.000Z"
      );

    const listed =
      updateMarketplaceListingStatus(
        ready,
        "LISTED",
        "2026-10-14T10:10:00.000Z"
      );

    const sold =
      updateMarketplaceListingStatus(
        listed,
        "SOLD",
        "2026-10-14T10:15:00.000Z"
      );

    assert.equal(
      sold.status,
      "SOLD"
    );
  }
);

test(
  "terminal SOLD state cannot transition",
  () => {
    const ready =
      updateMarketplaceListingStatus(
        nftMarketplaceListingFixture,
        "READY",
        "2026-10-14T10:05:00.000Z"
      );

    const listed =
      updateMarketplaceListingStatus(
        ready,
        "LISTED",
        "2026-10-14T10:10:00.000Z"
      );

    const sold =
      updateMarketplaceListingStatus(
        listed,
        "SOLD",
        "2026-10-14T10:15:00.000Z"
      );

    assert.throws(
      () =>
        updateMarketplaceListingStatus(
          sold,
          "LISTED",
          "2026-10-14T10:20:00.000Z"
        ),
      /MARKETPLACE_INVALID_STATUS_TRANSITION/
    );
  }
);

test(
  "DRAFT cannot jump directly to SOLD",
  () => {
    assert.throws(
      () =>
        updateMarketplaceListingStatus(
          nftMarketplaceListingFixture,
          "SOLD",
          "2026-10-14T10:05:00.000Z"
        ),
      /MARKETPLACE_INVALID_STATUS_TRANSITION/
    );
  }
);

test(
  "invalid zero price is rejected",
  () => {
    const result =
      validateMarketplaceListing({
        ...nftMarketplaceListingFixture,

        price: {
          ...nftMarketplaceListingFixture.price,

          amount:
            0,
        },
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_PRICE"
      )
    );
  }
);
