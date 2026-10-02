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
  "Marketplace mounts catalog workspace",
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
  "catalog workspace exposes interactive search",
  () => {
    assert.match(
      catalogWorkspace,
      /useState\(""\)/
    );

    assert.match(
      catalogWorkspace,
      /type="search"/
    );

    assert.match(
      catalogWorkspace,
      /setQuery/
    );

    assert.match(
      catalogWorkspace,
      /Search assets, collections or sellers/
    );
  }
);

test(
  "catalog workspace exposes collection filtering",
  () => {
    assert.match(
      catalogWorkspace,
      /setCollectionId/
    );

    assert.match(
      catalogWorkspace,
      /All collections/
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
  "catalog workspace exposes interactive sorting",
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

    assert.match(
      catalogWorkspace,
      /setSort/
    );
  }
);

test(
  "catalog workspace renders marketplace cards",
  () => {
    assert.match(
      catalogWorkspace,
      /data-market-card/
    );

    assert.match(
      catalogWorkspace,
      /item\.title/
    );

    assert.match(
      catalogWorkspace,
      /item\.listing\s*\.price\.amount/
    );

    assert.match(
      catalogWorkspace,
      /item\.listing\s*\.seller\.sellerId/
    );

    assert.match(
      catalogWorkspace,
      /item\.listing\s*\.asset\.assetId/
    );
  }
);

test(
  "asset detail is activated locally by Phase 28",
  () => {
    assert.match(
      catalogWorkspace,
      /View Asset/
    );

    assert.match(
      catalogWorkspace,
      /setDetailListingId/
    );

    assert.match(
      catalogWorkspace,
      /findNftAssetDetailByListingId/
    );

    assert.match(
      catalogWorkspace,
      /NftDetailWorkspace/
    );

    assert.doesNotMatch(
      catalogWorkspace,
      /title="Asset detail wiring arrives in Phase 28"/
    );
  }
);

test(
  "catalog workspace exposes empty state",
  () => {
    assert.match(
      catalogWorkspace,
      /result\.total === 0/
    );

    assert.match(
      catalogWorkspace,
      /No listed assets match the current filters/
    );
  }
);

test(
  "catalog workspace preserves marketplace authority boundaries",
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
