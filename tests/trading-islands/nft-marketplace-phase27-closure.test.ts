import assert from "node:assert/strict";
import test from "node:test";

import {
  queryMarketplaceCatalog,
} from "../../src/trading/nft/marketplace/catalog/engine";

import {
  queryFeaturedMarketplaceItems,
} from "../../src/trading/nft/marketplace/catalog/featured";

import {
  nftMarketplaceCatalogFixture,
} from "../../src/trading/nft/marketplace/catalog/fixtures";

import {
  defaultMarketplaceCatalogFilter,
} from "../../src/trading/nft/marketplace/catalog/defaultQuery";

import {
  selectMarketplaceCatalogItem,
} from "../../src/trading/nft/marketplace/catalog/selection";

test(
  "Phase 27 catalog closure returns deterministic LISTED discovery",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        defaultMarketplaceCatalogFilter,
        "NEWEST"
      );

    assert.equal(
      result.total,
      3
    );

    assert.equal(
      result.items.every(
        (item) =>
          item.listing.status ===
          "LISTED"
      ),
      true
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "Phase 27 featured discovery remains non-authoritative",
  () => {
    const result =
      queryFeaturedMarketplaceItems(
        nftMarketplaceCatalogFixture
      );

    assert.equal(
      result.total,
      2
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.items.every(
        (item) =>
          item.authoritative ===
          false
      ),
      true
    );
  }
);

test(
  "Phase 27 selection remains local non-authoritative state",
  () => {
    const item =
      nftMarketplaceCatalogFixture[0];

    const selected =
      selectMarketplaceCatalogItem(
        {
          selectedListingId:
            null,

          authoritative:
            false,
        },
        item
      );

    assert.equal(
      selected.selectedListingId,
      item.listing.id
    );

    assert.equal(
      selected.authoritative,
      false
    );

    const deselected =
      selectMarketplaceCatalogItem(
        selected,
        item
      );

    assert.equal(
      deselected.selectedListingId,
      null
    );

    assert.equal(
      deselected.authoritative,
      false
    );
  }
);
