import { Router, type Express, type Request } from "express";
import type { DatabasePort } from "../../infrastructure/core/database";
import type { InfrastructureEnvironment } from "../../infrastructure/core/configuration";
import { CommerceRepository, type CommercePrincipal } from "./CommerceRepository";

type AuthenticatedRequest = Request & {
  digitalboostPrincipal?: CommercePrincipal;
};

function principalFor(
  request: Request,
  environment: InfrastructureEnvironment,
): CommercePrincipal | null {
  const attached = (request as AuthenticatedRequest).digitalboostPrincipal;
  if (attached?.tenantId?.trim() && attached.actorId?.trim()) {
    return { tenantId: attached.tenantId.trim(), actorId: attached.actorId.trim() };
  }
  // Local development is deliberately single-tenant. Never infer tenant from request data.
  if (environment === "development") {
    return { tenantId: "local-tenant", actorId: "local-development" };
  }
  return null;
}

function validProduct(body: any): { id: string; title: string; sku?: string; price: { amount: number; currency: "USD" }; stock: number } | null {
  if (!body || typeof body !== "object") return null;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const amount = Number(body.price?.amount);
  const stock = Number(body.stock);
  if (!id || id.length > 100 || !title || title.length > 180) return null;
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) return null;
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2_000_000_000) return null;
  if (body.price?.currency !== "USD") return null;
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  if (sku.length > 100) return null;
  return { id, title, sku: sku || undefined, price: { amount, currency: "USD" }, stock };
}

export function registerCommerceRoutes(
  app: Express,
  input: {
    database: DatabasePort | null;
    environment: InfrastructureEnvironment;
    publishChange?: () => void;
  },
): void {
  const router = Router();
  const repository = input.database ? new CommerceRepository(input.database) : null;

  router.use((request, response, next) => {
    const principal = principalFor(request, input.environment);
    if (!principal) {
      response.status(401).json({ error: "commerce_auth_required" });
      return;
    }
    (request as AuthenticatedRequest).digitalboostPrincipal = principal;
    if (!repository) {
      response.status(503).json({ error: "commerce_database_unavailable" });
      return;
    }
    next();
  });

  router.get("/snapshot", async (request, response) => {
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const [products, orders] = await Promise.all([
        repository!.listProducts(principal),
        repository!.listOrders(principal),
      ]);
      const paidOrders = orders.filter(order => order.paymentState === "PAID");
      response.json({
        contract: "cos-l0-ledger-v1",
        tenantId: principal.tenantId,
        source: "postgresql",
        products,
        orders,
        customers: [],
        events: [],
        netSales: paidOrders.length
          ? paidOrders.reduce((sum, order) => sum + order.total.amount, 0)
          : null,
        orderCount: orders.length,
        customerCount: 0,
        authoritative: false,
      });
    } catch {
      response.status(503).json({ error: "commerce_read_failed" });
    }
  });

  router.put("/products/:id", async (request, response) => {
    const candidate = validProduct({ ...(request.body ?? {}), id: request.params.id });
    if (!candidate) {
      response.status(400).json({ error: "invalid_product" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const product = await repository!.upsertProduct(principal, candidate);
      input.publishChange?.();
      response.json({ ok: true, product });
    } catch {
      response.status(503).json({ error: "commerce_product_write_failed" });
    }
  });

  router.delete("/products/:id", async (request, response) => {
    const id = request.params.id.trim();
    if (!id || id.length > 100) {
      response.status(400).json({ error: "invalid_product_id" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const deleted = await repository!.deleteProduct(principal, id);
      if (!deleted) {
        response.status(404).json({ error: "product_not_found" });
        return;
      }
      input.publishChange?.();
      response.json({ ok: true });
    } catch {
      response.status(503).json({ error: "commerce_product_delete_failed" });
    }
  });

  router.post("/orders", async (request, response) => {
    const amount = Number(request.body?.amount);
    const customerId = typeof request.body?.customerId === "string"
      ? request.body.customerId.trim()
      : undefined;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000
      || (customerId !== undefined && customerId.length > 100)) {
      response.status(400).json({ error: "invalid_order" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const order = await repository!.createOrder(principal, { amount, customerId });
      input.publishChange?.();
      response.status(201).json({ ok: true, order });
    } catch {
      response.status(503).json({ error: "commerce_order_create_failed" });
    }
  });

  app.use("/api/commerce/v1", router);
}
