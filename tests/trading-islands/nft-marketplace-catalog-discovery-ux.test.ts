import assert from "node:assert/strict";
import test from "node:test";

import {
  queryFeaturedMarketplaceItems,
} from "../../src/trading/nft/marketplace/catalog/featured";

import {
  applyMarketplaceQuickFilter,
} from "../../src/trading/nft/marketplace/catalog/quickFilters";

import {
  nftMarketplaceCatalogFixture,
} from "../../src/trading/nft/marketplace/catalog/fixtures";

test(
  "featured query returns only featured LISTED assets",
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
      result.items.every(
        (item) =>
          item.featured === true &&
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
  "UNDER_300 quick filter returns max price intent",
  () => {
    assert.deepEqual(
      applyMarketplaceQuickFilter(
        "UNDER_300"
      ),
      {
        maxPrice:
          300,
      }
    );
  }
);

test(
  "ORIGIN_GENESIS quick filter maps collection",
  () => {
    assert.deepEqual(
      applyMarketplaceQuickFilter(
        "ORIGIN_GENESIS"
      ),
      {
        collectionId:
          "collection-origin-mode-001",
      }
    );
  }
);

test(
  "DIGITAL_FORGE quick filter maps collection",
  () => {
    assert.deepEqual(
      applyMarketplaceQuickFilter(
        "DIGITAL_FORGE"
      ),
      {
        collectionId:
          "collection-digital-001",
      }
    );
  }
);

test(
  "ALL and FEATURED do not inject catalog filter state",
  () => {
    assert.deepEqual(
      applyMarketplaceQuickFilter(
        "ALL"
      ),
      {}
    );

    assert.deepEqual(
      applyMarketplaceQuickFilter(
        "FEATURED"
      ),
      {}
    );
  }
);
