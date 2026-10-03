import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/activity/adapters/dbxConsumption.ts",
  "src/trading/activity/adapters/dbxSettlement.ts",
  "src/trading/activity/adapters/blockchain.ts",
  "src/trading/activity/adapters/nftMarketplace.ts",
  "src/trading/activity/ingest.ts",
];

const content =
  files
    .map(
      file =>
        fs.readFileSync(
          file,
          "utf8"
        )
    )
    .join("\n");

test(
  "activity adapters do not mutate DBX",
  () => {
    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );

    assert.doesNotMatch(
      content,
      /captureDbxHold/
    );

    assert.doesNotMatch(
      content,
      /releaseDbxHold/
    );

    assert.doesNotMatch(
      content,
      /settleDbxMarketplaceOrder/
    );
  }
);

test(
  "activity adapters do not execute blockchain operations",
  () => {
    assert.doesNotMatch(
      content,
      /sendTransaction|writeContract|walletClient|signTransaction/i
    );

    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );
  }
);

test(
  "activity adapters do not invoke marketplace engine mutations",
  () => {
    assert.doesNotMatch(
      content,
      /runMarketplaceEngine/
    );

    assert.doesNotMatch(
      content,
      /matchMarketplaceOrder/
    );
  }
);

test(
  "activity adapters remain non-authoritative",
  () => {
    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /governanceAuthority:\s*true/
    );
  }
);

test(
  "activity adapters perform no external execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );
  }
);
