import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/purchase/issuancePolicy.ts",
  "src/trading/dbx/purchase/issuanceAuthorization.ts",
  "src/trading/dbx/purchase/issuanceStore.ts",
  "src/trading/dbx/purchase/applyIssuanceAuthorization.ts",
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
  "Phase 31C4 cannot post to ledger",
  () => {
    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );

    assert.doesNotMatch(
      content,
      /status:\s*"LEDGER_POSTED"/
    );

    assert.doesNotMatch(
      content,
      /ledgerPosted:\s*true/
    );
  }
);

test(
  "Phase 31C4 cannot execute external payments or blockchain",
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
  "issuance authorization cannot grant governance authority",
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
