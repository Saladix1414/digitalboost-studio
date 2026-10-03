import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/consumption/recovery/types.ts",
  "src/trading/dbx/consumption/recovery/classification.ts",
  "src/trading/dbx/consumption/recovery/stateMachine.ts",
  "src/trading/dbx/consumption/recovery/holdPolicy.ts",
  "src/trading/dbx/consumption/recovery/applyFailure.ts",
  "src/trading/dbx/consumption/recovery/retryPolicy.ts",
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
  "recovery layer cannot issue DBX",
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
  "recovery layer does not implement DBX Rewards",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "recovery performs no external execution",
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
  "recovery cannot become authority",
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
