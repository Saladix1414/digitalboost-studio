import test from "node:test";
import assert from "node:assert/strict";
import { resetCommerceLedger } from "../../src/commerce/DigitalBoostCommerceLedger.ts";
import { resetPulseBot } from "../../src/commerce/DigitalBoostPulseBot.ts";
import { evaluatePulseBotBrain } from "../../src/commerce/DigitalBoostPulseBotBrain.ts";

test("Pulse Bot brain stays silent on empty ledger", () => {
  resetCommerceLedger();
  resetPulseBot();
  const brief = evaluatePulseBotBrain("tenant-a");
  assert.match(brief.summary, /Ledger vacío/);
  assert.equal(brief.messages.length, 0);
});
