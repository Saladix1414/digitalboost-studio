import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/treasury/types.ts",
  "src/trading/dbx/treasury/feePolicy.ts",
  "src/trading/dbx/treasury/allocation.ts",
  "src/trading/dbx/treasury/settlementAdapter.ts",
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
  "treasury allocation does not issue DBX",
  () => {
    assert.doesNotMatch(
      content,
      /SYSTEM_ISSUANCE/
    );

    assert.doesNotMatch(
      content,
      /kind:\s*"ISSUANCE"/
    );

    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );
  }
);

test(
  "DBX Rewards remain outside economic policy",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|dbxRewards/i
    );
  }
);

test(
  "treasury policy cannot become governance authority",
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
  "treasury layer performs no external execution",
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
