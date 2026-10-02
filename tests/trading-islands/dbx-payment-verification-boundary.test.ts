import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/purchase/fiatVerification.ts",
  "src/trading/dbx/purchase/usdtVerification.ts",
  "src/trading/dbx/purchase/verificationStore.ts",
  "src/trading/dbx/purchase/applyVerification.ts",
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
  "Phase 31C3 verification cannot issue DBX",
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
      /balanceMinor\s*\+=/
    );
  }
);

test(
  "Phase 31C3 performs no external provider or RPC execution",
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
  "payment verification cannot become governance authority",
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
