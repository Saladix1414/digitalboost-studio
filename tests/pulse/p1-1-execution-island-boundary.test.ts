import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function src(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const CLIENT_ISLAND = [
  "src/DigitalBoostOperator.tsx",
  "src/DigitalBoostPulseClientExecutionGate.ts",
  "src/DigitalBoostPulseMissionExecutor.ts",
  "src/DigitalBoostPulseExecutor.ts",
];

const SERVER_ISLAND = [
  "src/server/DigitalBoostPulseServerExecutionRuntime.ts",
  "src/server/DigitalBoostPulseServerProofExecution.ts",
  "src/DigitalBoostPulseServerExecutor.ts",
];

test("P1.1 client island cannot import server execution runtime", () => {
  const offenders: string[] = [];
  for (const file of CLIENT_ISLAND) {
    const text = src(file);
    if (
      text.includes("DigitalBoostPulseServerExecutionRuntime") ||
      text.includes("DigitalBoostPulseServerProofExecution") ||
      text.includes("executeAuthorizedPulseServerRequest")
    ) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, []);
});

test("P1.1 server island cannot import client execution gate", () => {
  const offenders: string[] = [];
  for (const file of SERVER_ISLAND) {
    const text = src(file);
    if (
      text.includes("DigitalBoostPulseClientExecutionGate") ||
      text.includes("executePulseClientAction") ||
      text.includes("DigitalBoostOperator")
    ) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, []);
});
