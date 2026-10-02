import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    "src/trading/dbx/purchase/issuancePosting.ts",
    "utf8"
  );

test(
  "issuance posting delegates to canonical DBX ledger",
  () => {
    assert.match(
      source,
      /postDbxLedgerTransaction/
    );

    assert.match(
      source,
      /buildAuthorizedDbxIssuanceLedgerTransaction/
    );

    assert.match(
      source,
      /assertDbxIssuanceNotPreviouslyPosted/
    );
  }
);
