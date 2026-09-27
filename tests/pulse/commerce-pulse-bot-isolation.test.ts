import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const forbidden = [
  "DigitalBoostPulseExecutor",
  "DigitalBoostPulseGovernance",
  "DigitalBoostPulseClientExecutionGate",
  "DigitalBoostPulseMission",
  "DigitalBoostOperator",
  "executePulseAction",
  "approvePulseAction",
  "executePulseClientAction",
  "executeAuthorizedPulseServerRequest",
];

test("Pulse Bot modules do not import PULSE runtime", () => {
  const dir = join(root, "src", "commerce");
  const hits: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isFile()) continue;
    if (!/\.(ts|tsx)$/.test(name)) continue;
    const src = readFileSync(full, "utf8");
    for (const token of forbidden) {
      if (src.includes(token)) hits.push(name + ":" + token);
    }
  }
  assert.deepEqual(hits, []);
});
