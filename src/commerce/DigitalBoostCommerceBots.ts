export const COMMERCE_BOTS_CONTRACT = "cos-sales-bots-v1" as const;
const LS_KEY = "db-commerce-sales-bots-v1";

export const COMMERCE_BOT_SKILLS = [
  "sales.pre_purchase",
  "order.status",
  "cart.recovery",
  "returns.intake",
  "stock.alert",
  "price.drop",
  "review.ask",
  "upsell.related",
] as const;

export type CommerceBotSkill = (typeof COMMERCE_BOT_SKILLS)[number];

export type CommerceBot = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly skills: readonly CommerceBotSkill[];
  readonly state: "draft";
  readonly personality: string;
  readonly channel: "in_app" | "mail_draft";
};

const bags = new Map<string, CommerceBot[]>();

function readAll(): void {
  if (bags.size) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CommerceBot[]>;
    for (const [id, list] of Object.entries(parsed || {})) {
      if (id && Array.isArray(list)) bags.set(id, list);
    }
  } catch {}
}
function writeAll(): void {
  try {
    const dump: Record<string, CommerceBot[]> = {};
    for (const [id, list] of bags) dump[id] = list;
    localStorage.setItem(LS_KEY, JSON.stringify(dump));
  } catch {}
}
function bag(tenantId: string): CommerceBot[] {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  const existing = bags.get(id);
  if (existing) return existing;
  const created: CommerceBot[] = [];
  bags.set(id, created);
  return created;
}

export function resetCommerceBots(): void {
  bags.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
}
export function listCommerceBots(tenantId: string): readonly CommerceBot[] {
  return bag(tenantId).slice();
}
export function createCommerceBot(input: {
  tenantId: string;
  name: string;
  skills: readonly CommerceBotSkill[];
}) {
  const tenantId = input.tenantId.trim();
  const name = input.name.trim();
  if (!tenantId || name.length < 2) return { ok: false as const, reason: "name required" };
  const skills = [...new Set(input.skills)];
  if (!skills.length) return { ok: false as const, reason: "one skill required" };
  const bot: CommerceBot = {
    id: "bot-" + String(bag(tenantId).length + 1),
    tenantId,
    name,
    skills,
    state: "draft",
    personality: "directo y breve",
    channel: "in_app",
  };
  bag(tenantId).push(bot);
  writeAll();
  return bot;
}
export function renameCommerceBot(tenantId: string, botId: string, name: string) {
  const nextName = name.trim();
  if (nextName.length < 2) return { ok: false as const, reason: "name required" };
  const list = bag(tenantId);
  const idx = list.findIndex((b) => b.id === botId);
  if (idx < 0) return { ok: false as const, reason: "bot not found" };
  list[idx] = { ...list[idx], name: nextName };
  writeAll();
  return list[idx];
}

export function updateCommerceBot(
  tenantId: string,
  botId: string,
  patch: Partial<Pick<CommerceBot, "personality" | "channel" | "name">>,
) {
  const list = bag(tenantId);
  const idx = list.findIndex((b) => b.id === botId);
  if (idx < 0) return { ok: false as const, reason: "bot not found" };
  list[idx] = { ...list[idx], ...patch };
  writeAll();
  return list[idx];
}
