import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/marketplace/catalog/types.ts",
  "src/trading/nft/marketplace/catalog/engine.ts",
  "src/trading/nft/marketplace/catalog/defaultQuery.ts",
  "src/trading/nft/marketplace/catalog/featured.ts",
  "src/trading/nft/marketplace/catalog/quickFilters.ts",
  "src/trading/nft/marketplace/catalog/selection.ts",
  "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
];

const content =
  files
    .map(
      (path) =>
        fs.readFileSync(
          path,
          "utf8"
        )
    )
    .join("\n");

test(
  "Phase 27 performs no blockchain or network execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      content,
      /eth_sendTransaction/
    );

    assert.doesNotMatch(
      content,
      /eth_sendRawTransaction/
    );
  }
);

test(
  "Phase 27 cannot claim ownership payment settlement or authority",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /settlementVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipTransferred\s*:\s*true/
    );
  }
);
