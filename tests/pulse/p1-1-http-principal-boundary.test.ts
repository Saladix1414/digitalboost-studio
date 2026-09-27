import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function src(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const HTTP_FILES = [
  "server.ts",
  "src/server/DigitalBoostOpenClawServer.ts",
];

const FORBIDDEN = [
  "authorizePulseServerExecution",
  "executeAuthorizedPulseServerRequest",
  "PulsePrincipal",
  "authenticated: true",
  "active_tenant_id",
];

test("P1.1 HTTP routes cannot mint or accept a Pulse principal", () => {
  const hits: string[] = [];
  for (const file of HTTP_FILES) {
    const text = src(file);
    for (const token of FORBIDDEN) {
      if (text.includes(token)) hits.push(file + ":" + token);
    }
  }
  assert.deepEqual(hits, []);
});

test("P1.1 authorization boundary does not authenticate from request body", () => {
  const text = src("src/server/DigitalBoostPulseAuthorizationBoundary.ts");
  assert.match(text, /Esta capa NO autentica por sí sola/);
  assert.match(text, /El cliente nunca puede crear autoridad/);
  assert.equal(text.includes("req.body"), false);
  assert.equal(text.includes("express"), false);
});
