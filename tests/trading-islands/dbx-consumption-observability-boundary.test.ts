import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const files = [
  "src/trading/dbx/consumption/observability/types.ts",
  "src/trading/dbx/consumption/observability/trace.ts",
  "src/trading/dbx/consumption/observability/orchestrationTrace.ts",
  "src/trading/dbx/consumption/observability/observableOrchestrator.ts",
  "src/trading/dbx/consumption/observability/queries.ts",
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
  "observability delegates canonical orchestrator",
  () => {
    assert.match(
      content,
      /orchestrateDbxConsumption/
    );
  }
);

test(
  "telemetry never becomes authority",
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

test(
  "observability cannot issue DBX",
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
  "observability excludes DBX Rewards",
  () => {
    assert.doesNotMatch(
      content,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "observability performs no external execution",
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
