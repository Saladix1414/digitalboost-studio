import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("commerce SSE cannot reach PULSE executors", () => {
  const src = readFileSync(join(root, "server.ts"), "utf8");
  assert.match(src, /text\/event-stream/);
  assert.match(src, /\/api\/commerce\/sync/);
  assert.equal(src.includes("executeAuthorizedPulseServerRequest"), false);
  assert.equal(src.includes("approvePulseAction"), false);
});
