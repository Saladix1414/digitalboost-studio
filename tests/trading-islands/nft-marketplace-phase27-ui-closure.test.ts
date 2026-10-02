import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const catalogWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

const marketplaceWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/NftMarketplaceWorkspace.tsx",
    "utf8"
  );

test(
  "Phase 27 UI preserves discovery controls",
  () => {
    assert.match(
      catalogWorkspace,
      /type="search"/
    );

    assert.match(
      catalogWorkspace,
      /setCollectionId/
    );

    assert.match(
      catalogWorkspace,
      /PRICE_ASC/
    );

    assert.match(
      catalogWorkspace,
      /PRICE_DESC/
    );

    assert.match(
      catalogWorkspace,
      /NEWEST/
    );
  }
);

test(
  "Phase 27 UI preserves hardened discovery state",
  () => {
    assert.match(
      catalogWorkspace,
      /queryFeaturedMarketplaceItems/
    );

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

    assert.match(
      catalogWorkspace,
      /ti-market-card is-selected/
    );
  }
);

test(
  "Phase 27 UI keeps Phase 28 detail boundary explicit",
  () => {
    assert.match(
      catalogWorkspace,
      /View Asset/
    );

    assert.match(
      catalogWorkspace,
      /disabled/
    );

    assert.match(
      catalogWorkspace,
      /Phase 28/
    );
  }
);

test(
  "Phase 27 remains integrated into marketplace workspace",
  () => {
    assert.match(
      marketplaceWorkspace,
      /NftMarketplaceCatalogWorkspace/
    );

    assert.match(
      marketplaceWorkspace,
      /<NftMarketplaceCatalogWorkspace \/>/
    );
  }
);

test(
  "Phase 27 UI preserves authority boundaries",
  () => {
    assert.match(
      catalogWorkspace,
      /visible ≠ available on-chain/
    );

    assert.match(
      catalogWorkspace,
      /listing ≠ ownership proof/
    );

    assert.match(
      catalogWorkspace,
      /discovery ≠ settlement/
    );

    assert.match(
      catalogWorkspace,
      /data-authority="none"/
    );
  }
);
