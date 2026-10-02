import assert from "node:assert/strict";
import test from "node:test";

import {
  isMarketplaceCatalogItemSelected,
  selectMarketplaceCatalogItem,
} from "../../src/trading/nft/marketplace/catalog/selection";

import {
  nftMarketplaceCatalogFixture,
} from "../../src/trading/nft/marketplace/catalog/fixtures";

test(
  "selection starts empty",
  () => {
    const selection = {
      selectedListingId:
        null,

      authoritative:
        false as const,
    };

    assert.equal(
      selection.selectedListingId,
      null
    );

    assert.equal(
      selection.authoritative,
      false
    );
  }
);

test(
  "selecting an item stores listing id",
  () => {
    const initial = {
      selectedListingId:
        null,

      authoritative:
        false as const,
    };

    const item =
      nftMarketplaceCatalogFixture[0];

    const selected =
      selectMarketplaceCatalogItem(
        initial,
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
  }
);

test(
  "selecting same item twice deselects it",
  () => {
    const item =
      nftMarketplaceCatalogFixture[0];

    const initial = {
      selectedListingId:
        null,

      authoritative:
        false as const,
    };

    const selected =
      selectMarketplaceCatalogItem(
        initial,
        item
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
  }
);

test(
  "selected item helper detects current selection",
  () => {
    const item =
      nftMarketplaceCatalogFixture[0];

    const selection = {
      selectedListingId:
        item.listing.id,

      authoritative:
        false as const,
    };

    assert.equal(
      isMarketplaceCatalogItemSelected(
        selection,
        item
      ),
      true
    );
  }
);
