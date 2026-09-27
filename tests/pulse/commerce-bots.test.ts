import test from "node:test";
import assert from "node:assert/strict";
import {
  createCommerceBot,
  listCommerceBots,
  renameCommerceBot,
  resetCommerceBots,
} from "../../src/commerce/DigitalBoostCommerceBots.ts";

test("marketplace sales bot can be renamed", () => {
  resetCommerceBots();
  const bot = createCommerceBot({
    tenantId: "t1",
    name: "Ventas Noche",
    skills: ["cart.recovery"],
  });
  if (!("id" in bot)) throw new Error("create");
  const renamed = renameCommerceBot("t1", bot.id, "Bot Carrito");
  if (!("id" in renamed)) throw new Error("rename");
  assert.equal(listCommerceBots("t1")[0].name, "Bot Carrito");
});
