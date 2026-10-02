import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

test(
  "Phase 27C preserves text search",
  () => {
    assert.match(
      workspace,
      /type="search"/
    );

    assert.match(
      workspace,
      /setQuery/
    );
  }
);

test(
  "Phase 27C preserves collection filter",
  () => {
    assert.match(
      workspace,
      /setCollectionId/
    );

    assert.match(
      workspace,
      /All collections/
    );
  }
);

test(
  "Phase 27C preserves sort controls",
  () => {
    assert.match(
      workspace,
      /PRICE_ASC/
    );

    assert.match(
      workspace,
      /PRICE_DESC/
    );

    assert.match(
      workspace,
      /NEWEST/
    );
  }
);

test(
  "Phase 27C preserves marketplace cards",
  () => {
    assert.match(
      workspace,
      /data-market-card/
    );

    assert.match(
      workspace,
      /item\.listing\s*\.price\.amount/
    );

    assert.match(
      workspace,
      /item\.listing\s*\.seller\.sellerId/
    );

    assert.match(
      workspace,
      /item\.listing\s*\.asset\.assetId/
    );
  }
);
