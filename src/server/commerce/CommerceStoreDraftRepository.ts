import { randomUUID } from "node:crypto";
import type { DatabasePort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type { CanvasBlock } from "../../DigitalBoostStoreCanvas";
import type { StoreTheme } from "../../DigitalBoostTheme";
import type { CommercePrincipal } from "./CommerceRepository";
import type { CommerceStoreDraft } from "../../commerce/DigitalBoostStoreDraftApi";

type DraftRow = { site_id: string; page_key: string; blocks: CanvasBlock[] | string; theme: StoreTheme | string; updated_at: string | Date };

function operation(principal: CommercePrincipal) {
  return createInfrastructureOperationContext({
    tenantId: principal.tenantId, actorId: principal.actorId,
    correlationId: randomUUID(), requestedAt: new Date().toISOString(),
  });
}

function mapDraft(row: DraftRow): CommerceStoreDraft {
  const blocks = typeof row.blocks === "string" ? JSON.parse(row.blocks) : row.blocks;
  const theme = typeof row.theme === "string" ? JSON.parse(row.theme) : row.theme;
  return {
    siteId: row.site_id, page: row.page_key,
    blocks: Array.isArray(blocks) ? blocks : [], theme,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
  };
}

export class CommerceStoreDraftRepository {
  constructor(private readonly database: DatabasePort) {}

  async get(principal: CommercePrincipal, siteId: string, page: string): Promise<CommerceStoreDraft | null> {
    const result = await this.database.query<DraftRow>({
      statement: `SELECT site_id, page_key, blocks, theme, updated_at
        FROM commerce_store_drafts WHERE tenant_id = $1 AND site_id = $2 AND page_key = $3`,
      parameters: [principal.tenantId, siteId, page], operation: operation(principal),
    });
    return result.rows[0] ? mapDraft(result.rows[0]) : null;
  }

  async save(principal: CommercePrincipal, input: {
    siteId: string; page: string; blocks: readonly CanvasBlock[]; theme: StoreTheme;
  }): Promise<CommerceStoreDraft> {
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: `INSERT INTO commerce_store_drafts
        (tenant_id, site_id, page_key, blocks, theme, updated_at)
        VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6)
        ON CONFLICT (tenant_id, site_id, page_key) DO UPDATE SET
          blocks = EXCLUDED.blocks, theme = EXCLUDED.theme, updated_at = EXCLUDED.updated_at`,
      parameters: [principal.tenantId, input.siteId, input.page,
        JSON.stringify(input.blocks), JSON.stringify(input.theme), now],
      expectedVersion: null, operation: operation(principal),
    });
    return { siteId: input.siteId, page: input.page, blocks: [...input.blocks], theme: input.theme, updatedAt: now };
  }
}
