import { randomUUID } from "node:crypto";
import type { DatabasePort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type {
  CommerceCustomer,
  CommerceOrder,
  CommerceOrderLine,
  CommerceOrderLineInput,
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

type CustomerRow = { id: string; name: string; email: string | null };

type OrderLineProductRow = {
  id: string;
  title: string;
  price_amount: string | number;
  currency: "USD";
};

type OrderLineRow = {
  id: string;
  product_id: string;
  title_snapshot: string;
  unit_price_amount: string | number;
  currency: "USD";
  quantity: number;
  line_total_amount: string | number;
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

function mapCustomer(row: CustomerRow, tenantId: string): CommerceCustomer {
  return { id: row.id, tenantId, name: row.name, email: row.email ?? undefined };
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

  async listCustomers(principal: CommercePrincipal): Promise<CommerceCustomer[]> {
    const result = await this.database.query<CustomerRow>({
      statement: "SELECT id, name, email FROM commerce_customers WHERE tenant_id = $1 ORDER BY created_at, id",
      parameters: [principal.tenantId], operation: operation(principal),
    });
    return result.rows.map(row => mapCustomer(row, principal.tenantId));
  }

  async createCustomer(principal: CommercePrincipal, input: { name: string; email?: string }): Promise<CommerceCustomer> {
    const customer: CommerceCustomer = {
      id: randomUUID(), tenantId: principal.tenantId, name: input.name, email: input.email || undefined,
    };
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: "INSERT INTO commerce_customers (tenant_id, id, name, email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5)",
      parameters: [principal.tenantId, customer.id, customer.name, customer.email ?? null, now],
      expectedVersion: null, operation: operation(principal),
    });
    return customer;
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

  async getOrderItems(principal: CommercePrincipal, orderId: string): Promise<CommerceOrderLine[] | null> {
    const order = await this.database.query<{ id: string }>({
      statement: "SELECT id FROM commerce_orders WHERE tenant_id = $1 AND id = $2",
      parameters: [principal.tenantId, orderId],
      operation: operation(principal),
    });
    if (!order.rows[0]) return null;

    const result = await this.database.query<OrderLineRow>({
      statement: "SELECT id, product_id, title_snapshot, unit_price_amount, currency, quantity, line_total_amount FROM commerce_order_items WHERE tenant_id = $1 AND order_id = $2 ORDER BY created_at, id",
      parameters: [principal.tenantId, orderId],
      operation: operation(principal),
    });
    return result.rows.map(row => ({
      productId: row.product_id,
      title: row.title_snapshot,
      quantity: Number(row.quantity),
      unitPrice: { amount: Number(row.unit_price_amount), currency: row.currency },
      total: { amount: Number(row.line_total_amount), currency: row.currency },
    }));
  }

  async createOrderFromCatalog(
    principal: CommercePrincipal,
    input: { lines: readonly CommerceOrderLineInput[]; customerId?: string; idempotencyKey: string },
  ): Promise<{ order: CommerceOrder; items: CommerceOrderLine[]; replayed: boolean }> {
    return this.database.transaction("read-write", async transaction => {
      const op = operation(principal);
      const lockKey = principal.tenantId + ":" + input.idempotencyKey;
      await transaction.query({
        statement: "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
        parameters: [lockKey], operation: op,
      });
      const prior = await transaction.query<{ order_id: string }>({
        statement: "SELECT order_id FROM commerce_order_idempotency WHERE tenant_id = $1 AND idempotency_key = $2",
        parameters: [principal.tenantId, input.idempotencyKey], operation: op,
      });
      if (prior.rows[0]) {
        const orderRows = await transaction.query<OrderRow>({
          statement: "SELECT id, customer_id, total_amount, currency, payment_state, fulfillment_state, created_at FROM commerce_orders WHERE tenant_id = $1 AND id = $2",
          parameters: [principal.tenantId, prior.rows[0].order_id], operation: op,
        });
        if (!orderRows.rows[0]) throw new Error("IDEMPOTENCY_ORDER_MISSING");
        const lineRows = await transaction.query<OrderLineRow>({
          statement: "SELECT id, product_id, title_snapshot, unit_price_amount, currency, quantity, line_total_amount FROM commerce_order_items WHERE tenant_id = $1 AND order_id = $2 ORDER BY id",
          parameters: [principal.tenantId, prior.rows[0].order_id], operation: op,
        });
        return {
          order: mapOrder(orderRows.rows[0], principal.tenantId),
          items: lineRows.rows.map(row => ({
            productId: row.product_id, title: row.title_snapshot, quantity: Number(row.quantity),
            unitPrice: { amount: Number(row.unit_price_amount), currency: row.currency },
            total: { amount: Number(row.line_total_amount), currency: row.currency },
          })),
          replayed: true,
        };
      }
      if (input.customerId) {
        const customer = await transaction.query<{ id: string }>({
          statement: "SELECT id FROM commerce_customers WHERE tenant_id = $1 AND id = $2",
          parameters: [principal.tenantId, input.customerId], operation: op,
        });
        if (!customer.rows[0]) throw new Error("CUSTOMER_NOT_FOUND");
      }
      const ids = input.lines.map(line => line.productId).sort();
      const productsResult = await transaction.query<OrderLineProductRow>({
        statement: "SELECT id, title, price_amount, currency FROM commerce_products WHERE tenant_id = $1 AND id = ANY($2::text[]) ORDER BY id",
        parameters: [principal.tenantId, ids], operation: op,
      });
      const products = new Map(productsResult.rows.map(product => [product.id, product]));
      if (products.size !== ids.length) throw new Error("PRODUCT_NOT_FOUND");
      const items: CommerceOrderLine[] = input.lines.map(line => {
        const product = products.get(line.productId)!;
        const unitCents = Math.round(Number(product.price_amount) * 100);
        return {
          productId: product.id, title: product.title, quantity: line.quantity,
          unitPrice: { amount: unitCents / 100, currency: "USD" },
          total: { amount: unitCents * line.quantity / 100, currency: "USD" },
        };
      });
      const totalCents = items.reduce((sum, item) => sum + Math.round(item.total.amount * 100), 0);
      if (!Number.isSafeInteger(totalCents) || totalCents > 100_000_000_000) throw new Error("ORDER_TOTAL_INVALID");
      const now = new Date().toISOString();
      const order: CommerceOrder = {
        id: randomUUID(), tenantId: principal.tenantId, customerId: input.customerId,
        total: { amount: totalCents / 100, currency: "USD" },
        paymentState: "UNPAID", fulfillmentState: "UNFULFILLED", createdAt: now,
      };
      await transaction.mutate({
        statement: "INSERT INTO commerce_orders (tenant_id, id, customer_id, total_amount, currency, payment_state, fulfillment_state, created_at, updated_at) VALUES ($1, $2, $3, $4, 'USD', 'UNPAID', 'UNFULFILLED', $5, $5)",
        parameters: [principal.tenantId, order.id, order.customerId ?? null, order.total.amount, now],
        expectedVersion: null, operation: op,
      });
      for (const item of items) {
        await transaction.mutate({
          statement: "INSERT INTO commerce_order_items (tenant_id, order_id, id, product_id, title_snapshot, unit_price_amount, currency, quantity, line_total_amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, 'USD', $7, $8, $9)",
          parameters: [principal.tenantId, order.id, randomUUID(), item.productId, item.title, item.unitPrice.amount, item.quantity, item.total.amount, now],
          expectedVersion: null, operation: op,
        });
      }
      await transaction.mutate({
        statement: "INSERT INTO commerce_order_idempotency (tenant_id, idempotency_key, order_id, created_at) VALUES ($1, $2, $3, $4)",
        parameters: [principal.tenantId, input.idempotencyKey, order.id, now],
        expectedVersion: null, operation: op,
      });
      return { order, items, replayed: false };
    });
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
