import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/purchase/issuanceLedgerTransaction.ts",
  "src/trading/dbx/purchase/issuancePosting.ts",
  "src/trading/dbx/purchase/issuancePostingRegistry.ts",
  "src/trading/dbx/purchase/applyLedgerPosting.ts",
  "src/trading/dbx/purchase/completePurchase.ts",
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
  "posting layer performs no provider or blockchain execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /stripe|mercadopago|ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      content,
      /eth_sendTransaction/
    );
  }
);

test(
  "posting layer cannot grant governance authority",
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
  "issuance transaction is not direct balance mutation",
  () => {
    assert.doesNotMatch(
      content,
      /balanceMinor\s*\+=/
    );

    assert.doesNotMatch(
      content,
      /balanceMinor\s*-=/
    );
  }
);
