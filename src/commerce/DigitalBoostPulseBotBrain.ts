import { getCommerceSnapshot } from "./DigitalBoostCommerceLedger";
import {
  draftPulseBotMessage,
  listPulseBotMessages,
  type PulseBotMessage,
} from "./DigitalBoostPulseBot";

export const PULSE_BOT_BRAIN_CONTRACT = "cos-l2-pulse-bot-brain-v1" as const;

export type PulseBotBrief = {
  readonly contract: typeof PULSE_BOT_BRAIN_CONTRACT;
  readonly tenantId: string;
  readonly summary: string;
  readonly messages: readonly PulseBotMessage[];
};

export function evaluatePulseBotBrain(tenantId = "local-tenant"): PulseBotBrief {
  const snap = getCommerceSnapshot(tenantId);
  const unpaid = snap.orders.filter((o) => o.paymentState === "UNPAID");
  const paidOpen = snap.orders.filter(
    (o) => o.paymentState === "PAID" && o.fulfillmentState === "UNFULFILLED",
  );

  if (snap.orderCount === 0) {
    return {
      contract: PULSE_BOT_BRAIN_CONTRACT,
      tenantId,
      summary: "Ledger vacío. Pulse Bot no inventa pedidos ni mails.",
      messages: listPulseBotMessages(tenantId),
    };
  }

  for (const order of paidOpen) {
    const exists = listPulseBotMessages(tenantId).some(
      (m) => m.orderId === order.id && m.kind === "fulfillment.reminder",
    );
    if (!exists) {
      draftPulseBotMessage({
        tenantId,
        channel: "reminder",
        kind: "fulfillment.reminder",
        subject: "Recordatorio de despacho",
        body: "Pedido " + order.id + " pagado y sin cumplir. Draft interno.",
        orderId: order.id,
      });
    }
  }

  void unpaid;
  return {
    contract: PULSE_BOT_BRAIN_CONTRACT,
    tenantId,
    summary:
      paidOpen.length
        ? paidOpen.length + " pedido(s) pagos sin cumplir."
        : "No hay cola de despacho.",
    messages: listPulseBotMessages(tenantId),
  };
}
