import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/reconciliation/types.ts",
  "src/trading/dbx/reconciliation/ledger.ts",
  "src/trading/dbx/reconciliation/holds.ts",
  "src/trading/dbx/reconciliation/consumption.ts",
  "src/trading/dbx/reconciliation/marketplace.ts",
  "src/trading/dbx/reconciliation/rewardPool.ts",
  "src/trading/dbx/reconciliation/reconcile.ts",
  "src/trading/dbx/reconciliation/summary.ts",
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
  "reconciliation is read only",
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
      /createDbxHold/
    );
  }
);

test(
  "reconciliation cannot issue DBX",
  () => {
    assert.doesNotMatch(
      content,
      /SYSTEM_ISSUANCE/
    );

    assert.doesNotMatch(
      content,
      /kind:\s*"ISSUANCE"/
    );
  }
);

test(
  "reconciliation never becomes authority",
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
  "DBX Rewards remain outside economic reconciliation",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "reconciliation performs no external execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /stripe|mercadopago|ethers|viem|wagmi/i
    );
  }
);
