import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/activity/timeline/types.ts",
  "src/trading/activity/timeline/correlation.ts",
  "src/trading/activity/timeline/build.ts",
  "src/trading/activity/timeline/multiCorrelation.ts",
  "src/trading/activity/timeline/summary.ts",
  "src/trading/activity/timeline/references.ts",
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
  "timeline cannot mutate economic domains",
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
  "timeline cannot execute blockchain operations",
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
  "timeline never becomes authority",
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
  "timeline performs no external execution",
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
