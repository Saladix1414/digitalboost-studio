import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/activity/readModel/types.ts",
  "src/trading/activity/readModel/build.ts",
  "src/trading/activity/readModel/query.ts",
  "src/trading/activity/readModel/summary.ts",
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
  "read model cannot execute economic mutations",
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
  "read model cannot execute blockchain operations",
  () => {
    assert.doesNotMatch(
      content,
      /sendTransaction|writeContract|signTransaction/i
    );

    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );
  }
);

test(
  "read model cannot manufacture authority",
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
  "read model has no external execution",
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
