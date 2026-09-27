import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("Commerce writers emit the shared sync event", () => {
  for (const rel of [
    "src/commerce/DigitalBoostCommerceLedger.ts",
    "src/commerce/DigitalBoostSiteBinding.ts",
  ]) {
    const src = readFileSync(join(root, rel), "utf8");
    assert.match(src, /emitCommerceSync/);
  }
});

test("Overview subscribes through useCommerceLive", () => {
  const src = readFileSync(join(root, "src", "CommerceOSOverview.tsx"), "utf8");
  assert.match(src, /useCommerceLive/);
});
