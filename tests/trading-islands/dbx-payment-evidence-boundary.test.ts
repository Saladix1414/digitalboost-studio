import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/purchase/evidenceStore.ts",
  "src/trading/dbx/purchase/fiatEvidence.ts",
  "src/trading/dbx/purchase/usdtEvidence.ts",
  "src/trading/dbx/purchase/evidenceBinding.ts",
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
  "Payment evidence cannot issue or post DBX",
  () => {
    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );

    assert.doesNotMatch(
      content,
      /ISSUANCE_AUTHORIZED/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "Payment evidence performs no external execution",
  () => {
    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /ethers|viem|wagmi/i
    );

    assert.doesNotMatch(
      content,
      /stripe|mercadopago/i
    );

    assert.doesNotMatch(
      content,
      /eth_sendTransaction/
    );
  }
);
