import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/consumption/orchestration/types.ts",
  "src/trading/dbx/consumption/orchestration/failureMapper.ts",
  "src/trading/dbx/consumption/orchestration/orchestrator.ts",
  "src/trading/dbx/consumption/orchestration/retry.ts",
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
  "orchestrator delegates canonical reserved posting",
  () => {
    assert.match(
      content,
      /postReservedDbxConsumption/
    );
  }
);

test(
  "orchestrator delegates canonical recovery",
  () => {
    assert.match(
      content,
      /failDbxConsumptionAttempt/
    );

    assert.match(
      content,
      /applyDbxConsumptionFailureRecovery/
    );
  }
);

test(
  "orchestrator cannot issue DBX",
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
  "orchestrator excludes DBX Rewards",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "orchestrator performs no external execution",
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
