import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/rewardPool/types.ts",
  "src/trading/dbx/rewardPool/validation.ts",
  "src/trading/dbx/rewardPool/fundingIntent.ts",
  "src/trading/dbx/rewardPool/distributionIntent.ts",
  "src/trading/dbx/rewardPool/ledgerTransactions.ts",
  "src/trading/dbx/rewardPool/registry.ts",
  "src/trading/dbx/rewardPool/posting.ts",
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
  "economic reward pool never issues DBX",
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
  "economic reward pool never implements DBX Rewards usage credits",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|free.?account|rewarded.?ad/i
    );
  }
);

test(
  "reward pool cannot become governance authority",
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

test(
  "reward pool performs no external execution",
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
