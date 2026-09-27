import { emitCommerceSync } from "./DigitalBoostCommerceSync";
export const PULSE_BOT_CONTRACT = "cos-l2-pulse-bot-v1" as const;

export type PulseBotChannel = "mail" | "notification" | "reminder";

export type PulseBotIntentKind =
  | "order.created"
  | "order.paid"
  | "fulfillment.reminder";

export type PulseBotMessage = {
  readonly id: string;
  readonly tenantId: string;
  readonly contract: typeof PULSE_BOT_CONTRACT;
  readonly channel: PulseBotChannel;
  readonly kind: PulseBotIntentKind;
  readonly state: "draft" | "queued" | "sent" | "failed";
  readonly subject: string;
  readonly body: string;
  readonly orderId?: string;
};

const messages = new Map<string, PulseBotMessage[]>();
const LS_KEY = "db-commerce-pulse-bot-v1";

function readAll(): void {
  if (messages.size) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, PulseBotMessage[]>;
    if (!parsed || typeof parsed !== "object") return;
    for (const [id, list] of Object.entries(parsed)) {
      if (id && Array.isArray(list)) messages.set(id, list);
    }
  } catch {}
}

function writeAll(): void {
  emitCommerceSync("pulse-bot");
  try {
    const dump: Record<string, PulseBotMessage[]> = {};
    for (const [id, list] of messages) dump[id] = list;
    localStorage.setItem(LS_KEY, JSON.stringify(dump));
  } catch {}
}


function bag(tenantId: string): PulseBotMessage[] {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  const existing = messages.get(id);
  if (existing) return existing;
  const created: PulseBotMessage[] = [];
  messages.set(id, created);
  return created;
}

export function resetPulseBot(): void {
  messages.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function draftPulseBotMessage(input: {
  tenantId: string;
  channel: PulseBotChannel;
  kind: PulseBotIntentKind;
  subject: string;
  body: string;
  orderId?: string;
}): PulseBotMessage {
  const tenantId = input.tenantId.trim();
  if (!tenantId) throw new Error("tenantId is required");
  const msg: PulseBotMessage = {
    id: "pb-" + String(bag(tenantId).length + 1),
    tenantId,
    contract: PULSE_BOT_CONTRACT,
    channel: input.channel,
    kind: input.kind,
    state: "draft",
    subject: input.subject,
    body: input.body,
    orderId: input.orderId,
  };
  bag(tenantId).push(msg);
  writeAll();
  return msg;
}

export function listPulseBotMessages(tenantId: string): readonly PulseBotMessage[] {
  return bag(tenantId).slice();
}

export function sendPulseBotMessage(): never {
  throw new Error("PULSE_BOT_SEND_DISABLED: no transport configured");
}
