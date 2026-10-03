import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/activity/sharedActivityStore.ts",
  "src/trading/activity/liveProjection.ts",
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
  "live projection does not execute DBX mutations",
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
  "live projection does not execute blockchain operations",
  () => {
    assert.doesNotMatch(
      content,
      /sendTransaction|writeContract|signTransaction|walletClient/i
    );

    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );
  }
);

test(
  "shared activity cannot become authority",
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
  "shared activity has no external coupling",
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
