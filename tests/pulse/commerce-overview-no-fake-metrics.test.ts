import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "CommerceOSOverview.tsx");

test("Commerce OS overview does not render decorative production metrics", () => {
  const src = readFileSync(file, "utf8");
  for (const token of ["474", "+18,4%", "+12,1%", "+9,7%", "Martín González", "rangeMul("]) {
    assert.equal(src.includes(token), false, token);
  }
  assert.match(src, /Sin datos/);
  assert.match(src, /No se muestran datos de demostración/);
  assert.match(src, /getCommerceSnapshot/);
  assert.match(src, /Pulse Bot/);
  assert.equal(src.includes("Hablar con PULSE"), false);
});
