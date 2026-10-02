import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/nft/marketplace/orchestration/engine.ts",
  "src/trading/nft/marketplace/orchestration/lifecycle.ts",
  "src/trading/nft/marketplace/orchestration/lifecycleEngine.ts",
  "src/trading/nft/marketplace/orchestration/trace.ts",
  "src/trading/nft/marketplace/orchestration/observableEngine.ts",
  "src/trading/nft/marketplace/NftMarketplaceWorkspace.tsx",
];

const content =
  files
    .map(
      (file) =>
        fs.readFileSync(
          file,
          "utf8"
        )
    )
    .join("\n");

test(
  "Phase 29 contains no blockchain execution",
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
  "Phase 29 cannot claim financial or ownership finality",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /dbxDebited\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /settlementVerified\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipTransferred\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /walletSigned\s*:\s*true/
    );
  }
);
