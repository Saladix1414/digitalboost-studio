import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/purchase/types.ts",
  "src/trading/dbx/purchase/quote.ts",
  "src/trading/dbx/purchase/intent.ts",
  "src/trading/dbx/purchase/stateMachine.ts",
  "src/trading/dbx/purchase/bindQuote.ts",
  "src/trading/dbx/purchase/store.ts",
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
  "Phase 31C1 cannot issue DBX or execute payment",
  () => {
    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );

    assert.doesNotMatch(
      content,
      /paymentExecuted\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /issuanceAuthorized\s*:\s*true/
    );

    assert.doesNotMatch(
      content,
      /balanceMinor\s*\+=/
    );
  }
);

test(
  "Phase 31C1 contains no provider or blockchain execution",
  () => {
    assert.doesNotMatch(
      content,
      /stripe|mercadopago|ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /eth_sendTransaction/
    );
  }
);
