import test from "node:test";
import assert from "node:assert/strict";
import { resetCommerceLedger } from "../../src/commerce/DigitalBoostCommerceLedger.ts";
import { createCommerceBot, resetCommerceBots } from "../../src/commerce/DigitalBoostCommerceBots.ts";
import {
  captureBotPayment,
  listBotPayments,
  notifyBotsOfPayment,
  resetBotPayments,
} from "../../src/commerce/DigitalBoostCommerceBotPayments.ts";
import {
  dispatchCommerceOrderCommand,
  resetCommerceOrderCommands,
} from "../../src/commerce/DigitalBoostCommerceOrderCommands.ts";

test("bots cannot capture funds", () => {
  assert.throws(() => captureBotPayment(), /BOT_CAPTURE_FORBIDDEN/);
});

test("paid order notifies order.status bots only as draft notice", () => {
  resetCommerceLedger();
  resetCommerceBots();
  resetBotPayments();
  resetCommerceOrderCommands();
  createCommerceBot({ tenantId: "t1", name: "Estado", skills: ["order.status"] });
  dispatchCommerceOrderCommand({ type: "CREATE_ORDER", tenantId: "t1", id: "o9", amount: 20 });
  dispatchCommerceOrderCommand({ type: "MARK_PAID", tenantId: "t1", id: "o9" });
  const events = listBotPayments("t1");
  assert.equal(events.length, 1);
  assert.equal(events[0].paymentState, "PAID");
  assert.equal(events[0].action, "draft_notice");
});
