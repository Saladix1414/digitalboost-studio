import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "_archive" || name.endsWith(".backup") || name.includes(".before")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(name)) acc.push(full);
  }
  return acc;
}

test("P1.1-D only Governance and ClientExecutionGate may call approvePulseAction in src", () => {
  const allowed = new Set([
    "src/DigitalBoostPulseGovernance.ts",
    "src/DigitalBoostPulseClientExecutionGate.ts",
  ]);
  const offenders: string[] = [];
  for (const file of walk(join(root, "src"))) {
    const rel = relative(root, file).replaceAll("\\", "/");
    const src = readFileSync(file, "utf8");
    if (!src.includes("approvePulseAction(")) continue;
    if (!allowed.has(rel)) offenders.push(rel);
  }
  assert.deepEqual(offenders, []);
});
