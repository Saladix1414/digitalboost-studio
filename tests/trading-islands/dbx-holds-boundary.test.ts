import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/ledger/holds.ts",
  "src/trading/dbx/ledger/holdLifecycle.ts",
  "src/trading/dbx/ledger/reservationGuards.ts",
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
  "holds cannot claim payment or settlement",
  () => {
    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /settled\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /ownershipTransferred\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /governanceAuthority\s*:\s*true/
    );
  }
);

test(
  "holds contain no blockchain execution",
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
      /fetch\s*\(/
    );
  }
);
