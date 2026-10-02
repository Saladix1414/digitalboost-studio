import assert from "node:assert/strict";
import test from "node:test";

import {
  queryMarketplaceCatalog,
} from "../../src/trading/nft/marketplace/catalog/engine";

import {
  nftMarketplaceCatalogFixture,
} from "../../src/trading/nft/marketplace/catalog/fixtures";

import {
  defaultMarketplaceCatalogFilter,
} from "../../src/trading/nft/marketplace/catalog/defaultQuery";

test(
  "catalog returns all LISTED items by default",
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
      result.authoritative,
      false
    );
  }
);

test(
  "catalog text search filters by title",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        {
          ...defaultMarketplaceCatalogFilter,

          query:
            "Digital Forge",
        },
        "NEWEST"
      );

    assert.equal(
      result.total,
      1
    );

    assert.equal(
      result.items[0].title,
      "Digital Forge #003"
    );
  }
);

test(
  "catalog collection filter works",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        {
          ...defaultMarketplaceCatalogFilter,

          collectionId:
            "collection-origin-mode-001",
        },
        "NEWEST"
      );

    assert.equal(
      result.total,
      2
    );
  }
);

test(
  "catalog minimum price filter works",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        {
          ...defaultMarketplaceCatalogFilter,

          minPrice:
            250,
        },
        "NEWEST"
      );

    assert.equal(
      result.total,
      2
    );
  }
);

test(
  "catalog maximum price filter works",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        {
          ...defaultMarketplaceCatalogFilter,

          maxPrice:
            250,
        },
        "NEWEST"
      );

    assert.equal(
      result.total,
      2
    );
  }
);

test(
  "catalog sorts by price ascending",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        defaultMarketplaceCatalogFilter,
        "PRICE_ASC"
      );

    assert.deepEqual(
      result.items.map(
        (item) =>
          item.listing.price.amount
      ),
      [
        150,
        250,
        400,
      ]
    );
  }
);

test(
  "catalog sorts by price descending",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        defaultMarketplaceCatalogFilter,
        "PRICE_DESC"
      );

    assert.deepEqual(
      result.items.map(
        (item) =>
          item.listing.price.amount
      ),
      [
        400,
        250,
        150,
      ]
    );
  }
);

test(
  "catalog sorts newest first",
  () => {
    const result =
      queryMarketplaceCatalog(
        nftMarketplaceCatalogFixture,
        defaultMarketplaceCatalogFilter,
        "NEWEST"
      );

    assert.equal(
      result.items[0].listing.id,
      "listing-catalog-003"
    );
  }
);

test(
  "catalog excludes non-LISTED records",
  () => {
    const source = [
      ...nftMarketplaceCatalogFixture,

      {
        ...nftMarketplaceCatalogFixture[0],

        listing: {
          ...nftMarketplaceCatalogFixture[0].listing,

          id:
            "listing-not-listed-001",

          status:
            "PAUSED" as const,
        },
      },
    ];

    const result =
      queryMarketplaceCatalog(
        source,
        defaultMarketplaceCatalogFilter,
        "NEWEST"
      );

    assert.equal(
      result.total,
      3
    );

    assert.equal(
      result.items.some(
        (item) =>
          item.listing.id ===
          "listing-not-listed-001"
      ),
      false
    );
  }
);
