import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/consumption/holdBindingTypes.ts",
  "src/trading/dbx/consumption/holdBinding.ts",
  "src/trading/dbx/consumption/reservedConsumption.ts",
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
  "binding layer performs no ledger mutation",
  () => {
    assert.doesNotMatch(
      content,
      /postDbxLedgerTransaction/
    );
  }
);

test(
  "binding layer performs no hold capture or release",
  () => {
    assert.doesNotMatch(
      content,
      /captureDbx|releaseDbx/
    );
  }
);

test(
  "binding layer does not issue DBX",
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
  "DBX Rewards remain outside economic hold binding",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "binding cannot become authority",
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
