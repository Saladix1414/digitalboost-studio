import {
  getCommerceSnapshot,
  recordCommerceOrder,
  type CommerceOrder,
} from "./DigitalBoostCommerceLedger";
import { notifyBotsOfPayment } from "./DigitalBoostCommerceBotPayments";
import { runBotRules } from "./DigitalBoostCommerceBotRules";

export const ORDER_COMMAND_CONTRACT = "cos-order-command-v1" as const;

export type CommerceOrderCommand =
  | {
      readonly type: "CREATE_ORDER";
      readonly tenantId: string;
      readonly id: string;
      readonly amount: number;
      readonly customerId?: string;
    }
  | {
      readonly type: "MARK_PAID";
      readonly tenantId: string;
      readonly id: string;
    }
  | {
      readonly type: "MARK_FULFILLED";
      readonly tenantId: string;
      readonly id: string;
    }
  | {
      readonly type: "CANCEL_ORDER";
      readonly tenantId: string;
      readonly id: string;
    };

export type CommerceOrderCommandResult =
  | { readonly ok: true; readonly order: CommerceOrder }
  | { readonly ok: false; readonly reason: string };

const index = new Map<string, CommerceOrder>();

function key(tenantId: string, id: string): string {
  return tenantId + ":" + id;
}

export function resetCommerceOrderCommands(): void {
  index.clear();
}

export function dispatchCommerceOrderCommand(
  command: CommerceOrderCommand,
): CommerceOrderCommandResult {
  const tenantId = command.tenantId.trim();
  const id = command.id.trim();
  if (!tenantId || !id) {
    return { ok: false, reason: "tenantId and id are required" };
  }

  if (command.type === "CREATE_ORDER") {
    if (command.amount <= 0) {
      return { ok: false, reason: "amount must be positive" };
    }
    if (index.has(key(tenantId, id))) {
      return { ok: false, reason: "order already exists" };
    }
    const order: CommerceOrder = {
      id,
      tenantId,
      customerId: command.customerId,
      total: { amount: command.amount, currency: "USD" },
      paymentState: "UNPAID",
      fulfillmentState: "UNFULFILLED",
      createdAt: new Date().toISOString(),
    };
    recordCommerceOrder(order);
    index.set(key(tenantId, id), order);
    return { ok: true, order };
  }

  const current = index.get(key(tenantId, id));
  if (!current) {
    return { ok: false, reason: "order not found" };
  }

  let next: CommerceOrder = current;
  if (command.type === "MARK_PAID") {
    if (current.paymentState === "REFUNDED") {
      return { ok: false, reason: "refunded order cannot be paid" };
    }
    next = { ...current, paymentState: "PAID" };
  } else if (command.type === "MARK_FULFILLED") {
    if (current.paymentState !== "PAID") {
      return { ok: false, reason: "cannot fulfill unpaid order" };
    }
    next = { ...current, fulfillmentState: "FULFILLED" };
  } else {
    next = { ...current, fulfillmentState: "CANCELLED" };
  }

  index.set(key(tenantId, id), next);
  recordCommerceOrder(next);
  if (command.type === "MARK_PAID") {
    notifyBotsOfPayment({ tenantId, orderId: id });
    runBotRules(tenantId, "order.unpaid");
  }
  void getCommerceSnapshot(tenantId);
  return { ok: true, order: next };
}
