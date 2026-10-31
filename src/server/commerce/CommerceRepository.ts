import { randomUUID } from "node:crypto";
import type { DatabasePort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type {
  CommerceOrder,
  CommerceProduct,
} from "../../commerce/DigitalBoostCommerceLedger";

export type CommercePrincipal = {
  readonly tenantId: string;
  readonly actorId: string;
};

type ProductRow = {
  id: string;
  title: string;
  sku: string | null;
  price_amount: string | number;
  currency: "USD";
  stock: number;
};

type OrderRow = {
  id: string;
  customer_id: string | null;
  total_amount: string | number;
  currency: "USD";
  payment_state: CommerceOrder["paymentState"];
  fulfillment_state: CommerceOrder["fulfillmentState"];
  created_at: string | Date;
};

function operation(principal: CommercePrincipal) {
  return createInfrastructureOperationContext({
    tenantId: principal.tenantId,
    actorId: principal.actorId,
    correlationId: randomUUID(),
    requestedAt: new Date().toISOString(),
  });
}

function mapProduct(row: ProductRow, tenantId: string): CommerceProduct {
  return {
    id: row.id,
    tenantId,
    title: row.title,
    sku: row.sku ?? undefined,
    price: { amount: Number(row.price_amount), currency: row.currency },
    stock: Number(row.stock),
  };
}

function mapOrder(row: OrderRow, tenantId: string): CommerceOrder {
  return {
    id: row.id,
    tenantId,
    customerId: row.customer_id ?? undefined,
    total: { amount: Number(row.total_amount), currency: row.currency },
    paymentState: row.payment_state,
    fulfillmentState: row.fulfillment_state,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at).toISOString(),
  };
}

export class CommerceRepository {
  constructor(private readonly database: DatabasePort) {}

  async listProducts(principal: CommercePrincipal): Promise<CommerceProduct[]> {
    const result = await this.database.query<ProductRow>({
      statement: `SELECT id, title, sku, price_amount, currency, stock
        FROM commerce_products WHERE tenant_id = $1 ORDER BY created_at, id`,
      parameters: [principal.tenantId],
      operation: operation(principal),
    });
    return result.rows.map(row => mapProduct(row, principal.tenantId));
  }

  async listOrders(principal: CommercePrincipal): Promise<CommerceOrder[]> {
    const result = await this.database.query<OrderRow>({
      statement: `SELECT id, customer_id, total_amount, currency, payment_state,
        fulfillment_state, created_at FROM commerce_orders
        WHERE tenant_id = $1 ORDER BY created_at DESC, id`,
      parameters: [principal.tenantId],
      operation: operation(principal),
    });
    return result.rows.map(row => mapOrder(row, principal.tenantId));
  }

  async upsertProduct(
    principal: CommercePrincipal,
    input: Omit<CommerceProduct, "tenantId">,
  ): Promise<CommerceProduct> {
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: `INSERT INTO commerce_products
        (tenant_id, id, title, sku, price_amount, currency, stock, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        ON CONFLICT (tenant_id, id) DO UPDATE SET
          title = EXCLUDED.title, sku = EXCLUDED.sku,
          price_amount = EXCLUDED.price_amount, currency = EXCLUDED.currency,
          stock = EXCLUDED.stock, updated_at = EXCLUDED.updated_at`,
      parameters: [principal.tenantId, input.id, input.title, input.sku ?? null,
        input.price.amount, input.price.currency, input.stock, now],
      expectedVersion: null,
      operation: operation(principal),
    });
    return { ...input, tenantId: principal.tenantId };
  }

  async deleteProduct(principal: CommercePrincipal, id: string): Promise<boolean> {
    const result = await this.database.mutate({
      statement: "DELETE FROM commerce_products WHERE tenant_id = $1 AND id = $2",
      parameters: [principal.tenantId, id],
      expectedVersion: null,
      operation: operation(principal),
    });
    return result.affectedRows > 0;
  }

  async createOrder(
    principal: CommercePrincipal,
    input: { amount: number; customerId?: string },
  ): Promise<CommerceOrder> {
    const order: CommerceOrder = {
      id: randomUUID(),
      tenantId: principal.tenantId,
      customerId: input.customerId,
      total: { amount: input.amount, currency: "USD" },
      paymentState: "UNPAID",
      fulfillmentState: "UNFULFILLED",
      createdAt: new Date().toISOString(),
    };
    await this.database.mutate({
      statement: `INSERT INTO commerce_orders
        (tenant_id, id, customer_id, total_amount, currency, payment_state,
         fulfillment_state, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
      parameters: [principal.tenantId, order.id, order.customerId ?? null,
        order.total.amount, order.total.currency, order.paymentState,
        order.fulfillmentState, order.createdAt],
      expectedVersion: null,
      operation: operation(principal),
    });
    return order;
  }
}
