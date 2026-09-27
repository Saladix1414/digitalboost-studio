import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("Marketplace consumes CommerceStore context", () => {
  const panel = readFileSync(join(root, "src/commerce/DigitalBoostMarketplacePanel.tsx"), "utf8");
  const ws = readFileSync(join(root, "src/StoreBuilderWorkspace.tsx"), "utf8");
  assert.match(panel, /useCommerceStore/);
  assert.match(ws, /CommerceStoreProvider/);
});
