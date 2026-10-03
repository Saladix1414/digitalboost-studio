import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/activity/types.ts",
  "src/trading/activity/validation.ts",
  "src/trading/activity/store.ts",
  "src/trading/activity/factory.ts",
  "src/trading/activity/query.ts",
  "src/trading/activity/summary.ts",
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
  "activity center cannot become authority",
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
  "activity center cannot mutate DBX",
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
  }
);

test(
  "activity center performs no blockchain execution",
  () => {
    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi|sendTransaction|writeContract/i
    );
  }
);

test(
  "activity center performs no external execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /stripe|mercadopago/i
    );
  }
);
