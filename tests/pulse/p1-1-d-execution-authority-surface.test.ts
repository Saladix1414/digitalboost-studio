import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function src(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const EXECUTION_ENTRYPOINTS = [
  "executePulseServerRequest(",
  "executePulseServerRequestWithServerClaimStore(",
  "executeAuthorizedPulseServerRequest(",
  "executePulseServerRequestWithDistributedProof(",
  "executePulseAction(",
];

function mentionsExecution(source: string): string[] {
  return EXECUTION_ENTRYPOINTS.filter((name) => source.includes(name));
}

test("P1.1-D HTTP server.ts cannot reach server execution entrypoints", () => {
  const source = src("server.ts");
  assert.deepEqual(mentionsExecution(source), []);
  assert.match(source, /registerOpenClawRoutes/);
  assert.match(source, /app\.post\('\/api\/generate'/);
});

test("P1.1-D OpenClaw HTTP cannot reach server execution entrypoints", () => {
  const source = src("src/server/DigitalBoostOpenClawServer.ts");
  assert.deepEqual(mentionsExecution(source), []);
  assert.match(source, /app\.post\("\/api\/openclaw\/task"/);
  assert.match(source, /No ejecutes acciones/);
});

test("P1.1-D OpenClaw bridge cannot invoke Pulse executors", () => {
  const source = src("src/openclaw/DigitalBoostOpenClawBridge.ts");
  assert.deepEqual(mentionsExecution(source), []);
});

test("P1.1-D proof execution must enter authorized runtime", () => {
  const source = src("src/server/DigitalBoostPulseServerProofExecution.ts");
  assert.match(source, /executeAuthorizedPulseServerRequest\(/);
  assert.equal(source.includes("executePulseServerRequest("), false);
  assert.equal(
    source.includes("executePulseServerRequestWithServerClaimStore("),
    false,
  );
});

test("P1.1-D authorized runtime reconciles persisted approval before claim composition", () => {
  const source = src("src/server/DigitalBoostPulseServerExecutionRuntime.ts");
  const authorized = source.indexOf(
    "export async function executeAuthorizedPulseServerRequest",
  );
  const claimCompose = source.indexOf(
    "executePulseServerRequestWithServerClaimStore",
    authorized,
  );
  const reconcile = source.indexOf("reconcilePulseServerApproval", authorized);

  assert.ok(authorized >= 0);
  assert.ok(reconcile > authorized);
  assert.ok(claimCompose > reconcile);
});

test("P1.1-D Operator remains a client execution island, not server authority", () => {
  const source = src("src/DigitalBoostOperator.tsx");
  assert.match(source, /executePulseClientAction\(/);
  assert.match(source, /userGesture: true/);
  assert.equal(source.includes("approvePulseAction("), false);
  assert.equal(source.includes("executePulseAction("), false);
  assert.equal(source.includes("executeAuthorizedPulseServerRequest("), false);
});
