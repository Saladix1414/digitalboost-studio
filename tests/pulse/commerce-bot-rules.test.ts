import test from "node:test";
import assert from "node:assert/strict";
import { createCommerceBot, resetCommerceBots } from "../../src/commerce/DigitalBoostCommerceBots.ts";
import {
  addBotRule,
  listBotRules,
  resetBotRules,
  runBotRules,
} from "../../src/commerce/DigitalBoostCommerceBotRules.ts";

test("sales bot can store a draft rule", () => {
  resetCommerceBots();
  resetBotRules();
  const bot = createCommerceBot({ tenantId: "t1", name: "Reglas", skills: ["cart.recovery"] });
  if (!("id" in bot)) throw new Error("bot");
  const rule = addBotRule({
    tenantId: "t1",
    botId: bot.id,
    trigger: "cart.idle",
    action: "draft_notice",
  });
  if (!("id" in rule)) throw new Error("rule");
  assert.equal(listBotRules("t1", bot.id).length, 1);
});

test("listing listed fires listing.listed rules", () => {
  resetCommerceBots();
  resetBotRules();
  const bot = createCommerceBot({ tenantId: "t1", name: "Oferta", skills: ["upsell.related"] });
  if (!("id" in bot)) throw new Error("bot");
  addBotRule({
    tenantId: "t1",
    botId: bot.id,
    trigger: "listing.listed",
    action: "draft_offer",
  });
  assert.equal(runBotRules("t1", "listing.listed").length, 1);
});
