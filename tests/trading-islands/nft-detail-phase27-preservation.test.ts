import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const catalogWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

test(
  "Phase 28 preserves marketplace search",
  () => {
    assert.match(
      catalogWorkspace,
      /type="search"/
    );

    assert.match(
      catalogWorkspace,
      /setQuery/
    );
  }
);

test(
  "Phase 28 preserves quick filters",
  () => {
    assert.match(
      catalogWorkspace,
      /Featured/
    );

    assert.match(
      catalogWorkspace,
      /Under 300/
    );

    assert.match(
      catalogWorkspace,
      /Origin Genesis/
    );

    assert.match(
      catalogWorkspace,
      /Digital Forge/
    );
  }
);

test(
  "Phase 28 preserves sorting",
  () => {
    assert.match(
      catalogWorkspace,
      /NEWEST/
    );

    assert.match(
      catalogWorkspace,
      /PRICE_ASC/
    );

    assert.match(
      catalogWorkspace,
      /PRICE_DESC/
    );
  }
);

test(
  "Phase 28 preserves deterministic catalog selection",
  () => {
    assert.match(
      catalogWorkspace,
      /selectMarketplaceCatalogItem/
    );

    assert.match(
      catalogWorkspace,
      /isMarketplaceCatalogItemSelected/
    );

    assert.match(
      catalogWorkspace,
      /data-selected/
    );
  }
);
