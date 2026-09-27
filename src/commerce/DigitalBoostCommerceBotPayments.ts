import { getCommerceSnapshot } from "./DigitalBoostCommerceLedger";
import { listCommerceBots } from "./DigitalBoostCommerceBots";

export const BOT_PAY_CONTRACT = "cos-bot-pay-v1" as const;

export type BotPaymentEvent = {
  readonly tenantId: string;
  readonly botId: string;
  readonly orderId: string;
  readonly paymentState: "UNPAID" | "PAID" | "REFUNDED";
  readonly action: "observe" | "draft_notice";
};

const events: BotPaymentEvent[] = [];

export function resetBotPayments(): void {
  events.length = 0;
}

export function listBotPayments(tenantId: string): readonly BotPaymentEvent[] {
  return events.filter((item) => item.tenantId === tenantId);
}

export function notifyBotsOfPayment(input: {
  tenantId: string;
  orderId: string;
}): { readonly ok: true; readonly events: readonly BotPaymentEvent[] } | { readonly ok: false; readonly reason: string } {
  const snap = getCommerceSnapshot(input.tenantId);
  const order = snap.orders.find((item) => item.id === input.orderId);
  if (!order) return { ok: false, reason: "order not in ledger" };
  const bots = listCommerceBots(input.tenantId).filter((bot) =>
    bot.skills.includes("order.status") || bot.skills.includes("sales.pre_purchase"),
  );
  const made: BotPaymentEvent[] = [];
  for (const bot of bots) {
    const event: BotPaymentEvent = {
      tenantId: input.tenantId,
      botId: bot.id,
      orderId: order.id,
      paymentState: order.paymentState,
      action: "draft_notice",
    };
    events.push(event);
    made.push(event);
  }
  return { ok: true, events: made };
}

export function captureBotPayment(): never {
  throw new Error("BOT_CAPTURE_FORBIDDEN: sales bots cannot take payment");
}
