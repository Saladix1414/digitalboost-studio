import { randomUUID } from "node:crypto";
import type { DatabasePort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type { CommerceCampaignConfiguration } from "../../commerce/DigitalBoostCommerceCampaignApi";
import type { CommercePrincipal } from "./CommerceRepository";

type CampaignRow = {
  id: string; name: string; audience: string; discount: number | string;
  status: CommerceCampaignConfiguration["status"]; source: string; sequence: string[] | string;
};

function operation(principal: CommercePrincipal) {
  return createInfrastructureOperationContext({
    tenantId: principal.tenantId,
    actorId: principal.actorId,
    correlationId: randomUUID(),
    requestedAt: new Date().toISOString(),
  });
}

function mapCampaign(row: CampaignRow): CommerceCampaignConfiguration {
  const sequence = typeof row.sequence === "string" ? JSON.parse(row.sequence) : row.sequence;
  return {
    id: row.id, name: row.name, audience: row.audience, discount: Number(row.discount),
    status: row.status, source: row.source, sequence: Array.isArray(sequence) ? sequence : [],
  };
}

export class CommerceCampaignRepository {
  constructor(private readonly database: DatabasePort) {}

  async list(principal: CommercePrincipal): Promise<CommerceCampaignConfiguration[]> {
    const result = await this.database.query<CampaignRow>({
      statement: `SELECT id, name, audience, discount, status, source, sequence
        FROM commerce_campaign_configurations WHERE tenant_id = $1 ORDER BY created_at, id`,
      parameters: [principal.tenantId], operation: operation(principal),
    });
    return result.rows.map(mapCampaign);
  }

  async save(principal: CommercePrincipal, input: CommerceCampaignConfiguration): Promise<CommerceCampaignConfiguration> {
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: `INSERT INTO commerce_campaign_configurations
        (tenant_id, id, name, audience, discount, status, source, sequence, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $9)
        ON CONFLICT (tenant_id, id) DO UPDATE SET
          name = EXCLUDED.name, audience = EXCLUDED.audience, discount = EXCLUDED.discount,
          status = EXCLUDED.status, source = EXCLUDED.source, sequence = EXCLUDED.sequence,
          updated_at = EXCLUDED.updated_at`,
      parameters: [principal.tenantId, input.id, input.name, input.audience, input.discount,
        input.status, input.source, JSON.stringify(input.sequence), now],
      expectedVersion: null, operation: operation(principal),
    });
    const result = await this.database.query<CampaignRow>({
      statement: `SELECT id, name, audience, discount, status, source, sequence
        FROM commerce_campaign_configurations WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, input.id], operation: operation(principal),
    });
    if (!result.rows[0]) throw new Error("commerce_campaign_write_missing");
    return mapCampaign(result.rows[0]);
  }

  async delete(principal: CommercePrincipal, id: string): Promise<boolean> {
    const result = await this.database.mutate({
      statement: `DELETE FROM commerce_campaign_configurations WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, id], expectedVersion: null, operation: operation(principal),
    });
    return result.affectedRows > 0;
  }
}
