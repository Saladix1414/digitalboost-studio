export const BOT_RULE_CONTRACT = "cos-bot-rules-v1" as const;
const LS_KEY = "db-commerce-bot-rules-v1";

export type BotRuleTrigger =
  | "cart.idle"
  | "order.unpaid"
  | "stock.zero"
  | "listing.listed";

export type BotRuleAction = "draft_notice" | "draft_offer";

export type BotRule = {
  readonly id: string;
  readonly tenantId: string;
  readonly botId: string;
  readonly trigger: BotRuleTrigger;
  readonly action: BotRuleAction;
  readonly enabled: boolean;
};

const bags = new Map<string, BotRule[]>();

function readAll(): void {
  if (bags.size) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, BotRule[]>;
    for (const [id, list] of Object.entries(parsed || {})) {
      if (id && Array.isArray(list)) bags.set(id, list);
    }
  } catch {}
}
function writeAll(): void {
  try {
    const dump: Record<string, BotRule[]> = {};
    for (const [id, list] of bags) dump[id] = list;
    localStorage.setItem(LS_KEY, JSON.stringify(dump));
  } catch {}
}
function bag(tenantId: string): BotRule[] {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  const existing = bags.get(id);
  if (existing) return existing;
  const created: BotRule[] = [];
  bags.set(id, created);
  return created;
}

export function resetBotRules(): void {
  bags.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function listBotRules(tenantId: string, botId?: string): readonly BotRule[] {
  const list = bag(tenantId);
  return botId ? list.filter((r) => r.botId === botId) : list;
}

export function addBotRule(input: {
  tenantId: string;
  botId: string;
  trigger: BotRuleTrigger;
  action: BotRuleAction;
}) {
  if (input.action !== "draft_notice" && input.action !== "draft_offer") {
    return { ok: false as const, reason: "action not allowed" };
  }
  const rule: BotRule = {
    id: "rule-" + String(bag(input.tenantId).length + 1),
    tenantId: input.tenantId.trim(),
    botId: input.botId,
    trigger: input.trigger,
    action: input.action,
    enabled: true,
  };
  bag(input.tenantId).push(rule);
  writeAll();
  return rule;
}

export function runBotRules(tenantId: string, trigger: BotRuleTrigger) {
  return listBotRules(tenantId).filter((r) => r.enabled && r.trigger === trigger);
}
