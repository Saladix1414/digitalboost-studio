import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "StoreBuilderWorkspace.tsx");

test("Commerce OS workspace seeds are empty", () => {
  const src = readFileSync(file, "utf8");
  assert.equal(src.includes("Martín González"), false);
  assert.equal(src.includes("DB-HOOD-001"), false);
  assert.match(src, /const productsSeed: Product\[\] = \[\];/);
  assert.match(src, /const ordersSeed: Order\[\] = \[\];/);
  assert.equal(src.includes('value="1.284"'), false);
  assert.match(src, /Sin productos en el ledger/);
  assert.match(src, /Sin pedidos en el ledger/);
  assert.match(src, /Solo ledger/);
  assert.match(src, /totalOrders \? formatCurrency\(totalRevenue\) : "Sin datos"/);
});
