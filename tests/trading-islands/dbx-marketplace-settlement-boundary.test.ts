import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/settlement/plan.ts",
  "src/trading/dbx/settlement/creatorEarnings.ts",
  "src/trading/dbx/settlement/ledgerTransaction.ts",
  "src/trading/dbx/settlement/registry.ts",
  "src/trading/dbx/settlement/settleMarketplace.ts",
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
  "settlement does not issue new DBX",
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
  "DBX Rewards do not participate in settlement",
  () => {
    assert.doesNotMatch(
      content,
      /DBX_REWARDS|dbxRewards|usage-credit/i
    );
  }
);

test(
  "settlement performs no external provider or blockchain execution",
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
  "settlement cannot become governance authority",
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
