import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

test(
  "workspace exposes quick filters",
  () => {
    assert.match(
      workspace,
      /Featured/
    );

    assert.match(
      workspace,
      /Under 300/
    );

    assert.match(
      workspace,
      /Origin Genesis/
    );

    assert.match(
      workspace,
      /Digital Forge/
    );
  }
);

test(
  "workspace wires featured query",
  () => {
    assert.match(
      workspace,
      /queryFeaturedMarketplaceItems/
    );

    assert.match(
      workspace,
      /quickFilter\s*===\s*[\r\n\s]*"FEATURED"/
    );
  }
);

test(
  "workspace wires deterministic selection",
  () => {
    assert.match(
      workspace,
      /selectMarketplaceCatalogItem/
    );

    assert.match(
      workspace,
      /isMarketplaceCatalogItemSelected/
    );

    assert.match(
      workspace,
      /selectedListingId/
    );

    assert.match(
      workspace,
      /data-selected/
    );
  }
);

test(
  "workspace keeps Phase 28 detail action reserved",
  () => {
    assert.match(
      workspace,
      /View Asset/
    );

    assert.match(
      workspace,
      /disabled/
    );

    assert.match(
      workspace,
      /Phase 28/
    );
  }
);

test(
  "workspace performs no external execution",
  () => {
    assert.doesNotMatch(
      workspace,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      workspace,
      /WebSocket/
    );

    assert.doesNotMatch(
      workspace,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      workspace,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      workspace,
      /eth_sendRawTransaction/
    );
  }
);
