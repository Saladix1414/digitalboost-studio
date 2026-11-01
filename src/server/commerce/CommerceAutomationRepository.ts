import { randomUUID } from "node:crypto";
import type { DatabasePort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type { CommerceBot, CommerceBotSkill } from "../../commerce/DigitalBoostCommerceBots";
import type { BotRule, BotRuleAction, BotRuleTrigger } from "../../commerce/DigitalBoostCommerceBotRules";
import type { CommercePrincipal } from "./CommerceRepository";

type BotRow = {
  id: string; name: string; skills: CommerceBotSkill[] | string;
  state: "draft"; personality: string; channel: CommerceBot["channel"];
};
type RuleRow = {
  id: string; bot_id: string; trigger: BotRuleTrigger;
  action: BotRuleAction; enabled: boolean;
};

function operation(principal: CommercePrincipal) {
  return createInfrastructureOperationContext({
    tenantId: principal.tenantId,
    actorId: principal.actorId,
    correlationId: randomUUID(),
    requestedAt: new Date().toISOString(),
  });
}

function mapBot(row: BotRow, tenantId: string): CommerceBot {
  const skills = typeof row.skills === "string" ? JSON.parse(row.skills) : row.skills;
  return {
    id: row.id, tenantId, name: row.name, skills: Array.isArray(skills) ? skills : [],
    state: "draft", personality: row.personality, channel: row.channel,
  };
}

function mapRule(row: RuleRow, tenantId: string): BotRule {
  return {
    id: row.id, tenantId, botId: row.bot_id,
    trigger: row.trigger, action: row.action, enabled: row.enabled,
  };
}

export class CommerceAutomationRepository {
  constructor(private readonly database: DatabasePort) {}

  async listConfiguration(principal: CommercePrincipal): Promise<{ bots: CommerceBot[]; rules: BotRule[] }> {
    const [bots, rules] = await Promise.all([
      this.database.query<BotRow>({
        statement: `SELECT id, name, skills, state, personality, channel
          FROM commerce_sales_bots WHERE tenant_id = $1 ORDER BY created_at, id`,
        parameters: [principal.tenantId], operation: operation(principal),
      }),
      this.database.query<RuleRow>({
        statement: `SELECT id, bot_id, trigger_key AS trigger, action, enabled
          FROM commerce_bot_rules WHERE tenant_id = $1 ORDER BY created_at, id`,
        parameters: [principal.tenantId], operation: operation(principal),
      }),
    ]);
    return {
      bots: bots.rows.map(row => mapBot(row, principal.tenantId)),
      rules: rules.rows.map(row => mapRule(row, principal.tenantId)),
    };
  }

  async saveBot(principal: CommercePrincipal, input: {
    id: string; name: string; skills: readonly CommerceBotSkill[];
  }): Promise<CommerceBot> {
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: `INSERT INTO commerce_sales_bots
        (tenant_id, id, name, skills, state, personality, channel, created_at, updated_at)
        VALUES ($1, $2, $3, $4::jsonb, 'draft', 'directo y breve', 'in_app', $5, $5)
        ON CONFLICT (tenant_id, id) DO NOTHING`,
      parameters: [principal.tenantId, input.id, input.name, JSON.stringify(input.skills), now],
      expectedVersion: null, operation: operation(principal),
    });
    const result = await this.database.query<BotRow>({
      statement: `SELECT id, name, skills, state, personality, channel
        FROM commerce_sales_bots WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, input.id], operation: operation(principal),
    });
    if (!result.rows[0]) throw new Error("commerce_bot_write_missing");
    return mapBot(result.rows[0], principal.tenantId);
  }

  async updateBot(principal: CommercePrincipal, id: string, patch: {
    name?: string; personality?: string; channel?: CommerceBot["channel"];
  }): Promise<CommerceBot | null> {
    const updated = await this.database.mutate({
      statement: `UPDATE commerce_sales_bots SET
        name = CASE WHEN $3 THEN $4 ELSE name END,
        personality = CASE WHEN $5 THEN $6 ELSE personality END,
        channel = CASE WHEN $7 THEN $8 ELSE channel END,
        updated_at = $9
        WHERE tenant_id = $1 AND id = $2 AND state = 'draft'`,
      parameters: [principal.tenantId, id, patch.name !== undefined, patch.name ?? "",
        patch.personality !== undefined, patch.personality ?? "",
        patch.channel !== undefined, patch.channel ?? "in_app", new Date().toISOString()],
      expectedVersion: null, operation: operation(principal),
    });
    if (!updated.affectedRows) return null;
    const result = await this.database.query<BotRow>({
      statement: `SELECT id, name, skills, state, personality, channel
        FROM commerce_sales_bots WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, id], operation: operation(principal),
    });
    return result.rows[0] ? mapBot(result.rows[0], principal.tenantId) : null;
  }

  async saveRule(principal: CommercePrincipal, input: {
    id: string; botId: string; trigger: BotRuleTrigger; action: BotRuleAction;
  }): Promise<BotRule | null> {
    const bot = await this.database.query<{ id: string }>({
      statement: `SELECT id FROM commerce_sales_bots
        WHERE tenant_id = $1 AND id = $2 AND state = 'draft'`,
      parameters: [principal.tenantId, input.botId], operation: operation(principal),
    });
    if (!bot.rows[0]) return null;
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: `INSERT INTO commerce_bot_rules
        (tenant_id, id, bot_id, trigger_key, action, enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
        ON CONFLICT (tenant_id, id) DO NOTHING`,
      parameters: [principal.tenantId, input.id, input.botId, input.trigger, input.action, now],
      expectedVersion: null, operation: operation(principal),
    });
    const result = await this.database.query<RuleRow>({
      statement: `SELECT id, bot_id, trigger_key AS trigger, action, enabled
        FROM commerce_bot_rules WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, input.id], operation: operation(principal),
    });
    const existing = result.rows[0];
    if (!existing || existing.bot_id !== input.botId
      || existing.trigger !== input.trigger || existing.action !== input.action) return null;
    return mapRule(existing, principal.tenantId);
  }
}
