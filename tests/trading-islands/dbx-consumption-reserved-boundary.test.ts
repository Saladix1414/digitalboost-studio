import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const posting =
  fs.readFileSync(
    "src/trading/dbx/consumption/reservedPosting.ts",
    "utf8"
  );

test(
  "reserved posting uses canonical hold capture",
  () => {
    assert.match(
      posting,
      /captureDbxHold/
    );
  }
);

test(
  "reserved posting uses canonical consumption posting",
  () => {
    assert.match(
      posting,
      /postDbxConsumption/
    );
  }
);

test(
  "reserved posting cannot issue DBX",
  () => {
    assert.doesNotMatch(
      posting,
      /SYSTEM_ISSUANCE/
    );

    assert.doesNotMatch(
      posting,
      /kind:\s*"ISSUANCE"/
    );
  }
);

test(
  "reserved posting does not implement DBX Rewards",
  () => {
    assert.doesNotMatch(
      posting,
      /usage-credit|rewarded.?ad|free.?account/i
    );
  }
);

test(
  "no external execution exists",
  () => {
    assert.doesNotMatch(
      posting,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      posting,
      /stripe|mercadopago|ethers|viem|wagmi/i
    );
  }
);
