import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/consumption/types.ts",
  "src/trading/dbx/consumption/validation.ts",
  "src/trading/dbx/consumption/intent.ts",
  "src/trading/dbx/consumption/ledgerTransaction.ts",
  "src/trading/dbx/consumption/registry.ts",
  "src/trading/dbx/consumption/posting.ts",
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
  "consumption does not issue new DBX",
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
  "economic consumption does not implement DBX Rewards",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "consumption does not perform blockchain or payment provider execution",
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

test(
  "consumption never becomes governance authority",
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
