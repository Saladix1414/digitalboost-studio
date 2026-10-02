import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content =
  fs.readFileSync(
    "src/trading/nft/marketplace/catalog/NftMarketplaceCatalogWorkspace.tsx",
    "utf8"
  );

test(
  "catalog UI performs no external execution",
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
  "catalog UI cannot escalate authority",
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
      /settlementVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );
  }
);
