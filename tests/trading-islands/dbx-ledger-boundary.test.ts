import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/ledger/types.ts",
  "src/trading/dbx/ledger/validation.ts",
  "src/trading/dbx/ledger/ledger.ts",
  "src/trading/dbx/ledger/balance.ts",
  "src/trading/dbx/ledger/reversal.ts",
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
  "DBX Ledger contains no blockchain execution",
  () => {
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

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );
  }
);

test(
  "DBX Ledger separates accounting from governance authority",
  () => {
    assert.doesNotMatch(
      content,
      /governanceAuthority:\s*true/
    );
  }
);

test(
  "DBX Ledger uses safe integer minor units",
  () => {
    assert.match(
      content,
      /Number\.isSafeInteger/
    );

    assert.match(
      content,
      /amountMinor/
    );
  }
);
