import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const catalogWorkspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

test(
  "catalog imports detail lookup",
  () => {
    assert.match(
      catalogWorkspace,
      /findNftAssetDetailByListingId/
    );
  }
);

test(
  "catalog imports NFT Detail workspace",
  () => {
    assert.match(
      catalogWorkspace,
      /NftDetailWorkspace/
    );
  }
);

test(
  "catalog stores local detail listing id",
  () => {
    assert.match(
      catalogWorkspace,
      /detailListingId/
    );

    assert.match(
      catalogWorkspace,
      /setDetailListingId/
    );
  }
);

test(
  "View Asset opens local detail",
  () => {
    assert.match(
      catalogWorkspace,
      /View Asset/
    );

    assert.match(
      catalogWorkspace,
      /setDetailListingId\s*\(/
    );

    assert.match(
      catalogWorkspace,
      /item\.listing\.id/
    );
  }
);

test(
  "detail lookup renders NFT Detail workspace",
  () => {
    assert.match(
      catalogWorkspace,
      /if\s*\(detail\)/
    );

    assert.match(
      catalogWorkspace,
      /<NftDetailWorkspace/
    );

    assert.match(
      catalogWorkspace,
      /detail=\{detail\}/
    );
  }
);

test(
  "back action restores marketplace locally",
  () => {
    assert.match(
      catalogWorkspace,
      /setDetailListingId\s*\(\s*null\s*\)/
    );
  }
);

test(
  "detail navigation does not use external router",
  () => {
    assert.doesNotMatch(
      catalogWorkspace,
      /useNavigate/
    );

    assert.doesNotMatch(
      catalogWorkspace,
      /window\.location/
    );

    assert.doesNotMatch(
      catalogWorkspace,
      /location\.href/
    );
  }
);
