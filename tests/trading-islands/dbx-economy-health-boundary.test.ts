import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/health/types.ts",
  "src/trading/dbx/health/assessment.ts",
  "src/trading/dbx/health/interlock.ts",
  "src/trading/dbx/health/operatorView.ts",
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
  "health layer cannot mutate DBX ledger or holds",
  () => {
    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );

    assert.doesNotMatch(
      content,
      /createDbxHold/
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
  "health layer cannot issue DBX",
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
  "health signals never become authority",
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
  "DBX Rewards remain excluded",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "health layer performs no external execution",
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
