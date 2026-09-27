import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  draftPulseBotMessage,
  listPulseBotMessages,
  resetPulseBot,
  sendPulseBotMessage,
} from "../../src/commerce/DigitalBoostPulseBot.ts";

test("L2 Pulse Bot stores drafts only", () => {
  resetPulseBot();
  const msg = draftPulseBotMessage({
    tenantId: "tenant-a",
    channel: "mail",
    kind: "order.paid",
    subject: "Pago recibido",
    body: "Pedido pagado. Draft interno.",
    orderId: "ord-1",
  });
  assert.equal(msg.state, "draft");
  assert.equal(listPulseBotMessages("tenant-a").length, 1);
  assert.equal(listPulseBotMessages("tenant-b").length, 0);
});

test("L2 Pulse Bot cannot send without transport", () => {
  assert.throws(() => sendPulseBotMessage(), /PULSE_BOT_SEND_DISABLED/);
});

test("L2 Store Builder sources do not import Pulse Bot", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const offenders: string[] = [];
  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      if (name === "_archive" || name.includes(".before") || name.endsWith(".backup")) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(name)) continue;
      const rel = relative(root, full).replaceAll("\\", "/");
      if (rel.startsWith("src/commerce/")) continue;
      if (!/StoreStudio|StoreDesigner|StoreCanvas|DigitalBoostOperator/.test(rel)) continue;
      const src = readFileSync(full, "utf8");
      if (src.includes("DigitalBoostPulseBot") || src.includes("draftPulseBotMessage")) {
        offenders.push(rel);
      }
    }
  }
  walk(join(root, "src"));
  assert.deepEqual(offenders, []);
});
