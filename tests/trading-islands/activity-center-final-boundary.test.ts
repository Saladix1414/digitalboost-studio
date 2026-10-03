import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/activity/types.ts",
  "src/trading/activity/store.ts",
  "src/trading/activity/sharedActivityStore.ts",
  "src/trading/activity/liveProjection.ts",
  "src/trading/activity/timeline/build.ts",
  "src/trading/activity/readModel/build.ts",
  "src/trading/activity/ActivityCenterPanel.tsx",
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
  "Activity Center never becomes economic authority",
  () => {
    assert.doesNotMatch(
      content,
      /governanceAuthority:\s*true/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "Activity Center never executes economic mutations",
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
  "Activity Center never executes blockchain mutations",
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
  "Activity Center has no external transport coupling",
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
