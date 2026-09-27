import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMMERCE_CUSTODY_MODE,
  createCustodialWallet,
  assertNonCustodialSource,
} from "../../src/commerce/DigitalBoostCustodyPolicy.ts";

test("custody mode is non_custodial", () => {
  assert.equal(COMMERCE_CUSTODY_MODE, "non_custodial");
  assert.throws(() => createCustodialWallet(), /CUSTODY_FORBIDDEN/);
});

test("commerce modules do not store keys", () => {
  const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "commerce");
  const hits: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isFile() || !/\.(ts|tsx)$/.test(name)) continue;
    if (name === "DigitalBoostCustodyPolicy.ts") continue;
    const src = readFileSync(full, "utf8");
    for (const token of assertNonCustodialSource(src)) {
      hits.push(name + ":" + token);
    }
  }
  assert.deepEqual(hits, []);
});
