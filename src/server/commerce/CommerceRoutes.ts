import { Router, type Express, type Request } from "express";
import type { DatabasePort } from "../../infrastructure/core/database";
import type { InfrastructureEnvironment } from "../../infrastructure/core/configuration";
import { CommerceRepository, type CommercePrincipal } from "./CommerceRepository";
import { MarketplaceRepository } from "./MarketplaceRepository";
import { validateMarketAsset } from "../../commerce/DigitalBoostMarketAssetGuard";
import { MARKET_TAKE_RATE, type MarketRail } from "../../commerce/DigitalBoostMarketplace";
import { CommerceAutomationRepository } from "./CommerceAutomationRepository";
import { CommerceCampaignRepository } from "./CommerceCampaignRepository";
import { CommerceStoreDraftRepository } from "./CommerceStoreDraftRepository";
import type { CanvasBlock, BlockType } from "../../DigitalBoostStoreCanvas";
import type { StoreTheme } from "../../DigitalBoostTheme";
import { COMMERCE_BOT_SKILLS, type CommerceBotSkill } from "../../commerce/DigitalBoostCommerceBots";
import type { BotRuleAction, BotRuleTrigger } from "../../commerce/DigitalBoostCommerceBotRules";

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

function validProduct(body: any): { id: string; title: string; sku?: string; price: { amount: number; currency: "USD" }; priceArs?: { amount: number; currency: "ARS" }; stock: number } | null {
  if (!body || typeof body !== "object") return null;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const amount = Number(body.price?.amount);
  const stock = Number(body.stock);
  if (!id || id.length > 100 || !title || title.length > 180) return null;
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) return null;
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2_000_000_000) return null;
  if (body.price?.currency !== "USD") return null;
  let priceArs: { amount: number; currency: "ARS" } | undefined;
  if (body.priceArs != null) {
    const arsAmount = Number(body.priceArs?.amount);
    if (body.priceArs?.currency !== "ARS" || !Number.isFinite(arsAmount) || arsAmount < 0 || arsAmount > 1_000_000_000) return null;
    priceArs = { amount: arsAmount, currency: "ARS" };
  }
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  if (sku.length > 100) return null;
  return { id, title, sku: sku || undefined, price: { amount, currency: "USD" }, priceArs, stock };
}

const MARKET_RAILS = new Set<MarketRail>(["physical", "digital", "nft", "crypto", "gift_card"]);
const BOT_SKILLS = new Set<CommerceBotSkill>(COMMERCE_BOT_SKILLS);
const BOT_TRIGGERS = new Set<BotRuleTrigger>(["cart.idle", "order.unpaid", "stock.zero", "listing.listed"]);
const STORE_PAGES = new Set(["Inicio", "Productos", "Colecciones", "Nosotros", "Contacto"]);
const STORE_BLOCK_TYPES = new Set<BlockType>(["hero", "features", "products", "text", "cta", "media"]);

function validStoreBlocks(value: unknown): CanvasBlock[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const block = item as Record<string, unknown>;
    if (typeof block.id !== "string" || !block.id.trim() || block.id.length > 100
      || typeof block.type !== "string" || !STORE_BLOCK_TYPES.has(block.type as BlockType)
      || typeof block.title !== "string" || block.title.length > 1000
      || typeof block.body !== "string" || block.body.length > 4000
      || typeof block.cta !== "string" || block.cta.length > 300
      || (block.hidden !== undefined && typeof block.hidden !== "boolean")) return null;
  }
  return value as CanvasBlock[];
}

function validStoreTheme(value: unknown): StoreTheme | null {
  if (!value || typeof value !== "object") return null;
  const theme = value as Record<string, unknown>;
  const colors = ["bg", "surface", "text", "muted", "primary", "accent"];
  if (typeof theme.name !== "string" || theme.name.length > 80
    || colors.some((key) => typeof theme[key] !== "string" || !/^#[0-9a-f]{6}$/i.test(theme[key] as string))) return null;
  return value as StoreTheme;
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
  const marketplace = input.database ? new MarketplaceRepository(input.database) : null;
  const automation = input.database ? new CommerceAutomationRepository(input.database) : null;
  const campaigns = input.database ? new CommerceCampaignRepository(input.database) : null;
  const storeDrafts = input.database ? new CommerceStoreDraftRepository(input.database) : null;

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
      const [products, orders, customers] = await Promise.all([
        repository!.listProducts(principal),
        repository!.listOrders(principal),
        repository!.listCustomers(principal),
      ]);
      const paidOrders = orders.filter(order => order.paymentState === "PAID");
      response.json({
        contract: "cos-l0-ledger-v1",
        tenantId: principal.tenantId,
        source: "postgresql",
        products,
        orders,
        customers,
        events: [],
        netSales: paidOrders.length
          ? paidOrders.reduce((sum, order) => sum + order.total.amount, 0)
          : null,
        orderCount: orders.length,
        customerCount: customers.length,
        authoritative: false,
      });
    } catch {
      response.status(503).json({ error: "commerce_read_failed" });
    }
  });

  router.post("/customers", async (request, response) => {
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    const rawEmail = request.body?.email;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const emailOk = !email || (email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (name.length < 2 || name.length > 120 || !emailOk) {
      response.status(400).json({ error: "invalid_commerce_customer" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const customer = await repository!.createCustomer(principal, { name, email: email || undefined });
      input.publishChange?.();
      response.status(201).json({ ok: true, customer });
    } catch {
      response.status(503).json({ error: "commerce_customer_write_failed" });
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

  router.get("/orders/:id/items", async (request, response) => {
    const id = request.params.id.trim();
    if (!id || id.length > 100) {
      response.status(400).json({ error: "invalid_commerce_order_id" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const items = await repository!.getOrderItems(principal, id);
      if (!items) {
        response.status(404).json({ error: "commerce_order_not_found" });
        return;
      }
      response.json({ items, source: "postgresql", authoritative: false });
    } catch {
      response.status(503).json({ error: "commerce_order_items_read_failed" });
    }
  });

  router.post("/orders", async (request, response) => {
    const body = request.body ?? {};
    const lines = body.lines;
    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
    const currency = body.currency === undefined ? "USD" : body.currency;
    const validCurrency = currency === "USD" || currency === "ARS";
    const validLines = Array.isArray(lines) && lines.length >= 1 && lines.length <= 30
      && lines.every((line: any) => line && typeof line.productId === "string"
        && line.productId.trim().length > 0 && line.productId.trim().length <= 100
        && Number.isSafeInteger(line.quantity) && line.quantity >= 1 && line.quantity <= 99)
      && new Set(lines.map((line: any) => line.productId.trim())).size === lines.length;
    if (!validCurrency || !validLines || (customerId && customerId.length > 100)
      || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
      response.status(400).json({ error: "invalid_commerce_checkout" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const result = await repository!.createOrderFromCatalog(principal, {
        lines: lines.map((line: any) => ({ productId: line.productId.trim(), quantity: line.quantity })),
        customerId: customerId || undefined, idempotencyKey, currency,
      });
      input.publishChange?.();
      response.status(result.replayed ? 200 : 201).json({ ok: true, ...result });
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "PRODUCT_NOT_FOUND" || code === "CUSTOMER_NOT_FOUND" || code === "PRODUCT_CURRENCY_PRICE_MISSING") {
        response.status(409).json({ error: code.toLowerCase() });
        return;
      }
      response.status(503).json({ error: "commerce_order_create_failed" });
    }
  });

  router.get("/marketplace/snapshot", async (request, response) => {
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const [sellers, listings] = await Promise.all([
        marketplace!.listSellers(principal),
        marketplace!.listListings(principal),
      ]);
      response.json({
        contract: "cos-market-v1",
        tenantId: principal.tenantId,
        takeRate: MARKET_TAKE_RATE,
        sellers,
        listings,
        gmv: null,
        source: "postgresql",
        authoritative: false,
      });
    } catch {
      response.status(503).json({ error: "commerce_marketplace_read_failed" });
    }
  });

  router.post("/marketplace/sellers", async (request, response) => {
    const id = typeof request.body?.id === "string" ? request.body.id.trim() : "";
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    if (!id || id.length > 100 || name.length < 2 || name.length > 120) {
      response.status(400).json({ error: "invalid_market_seller" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const seller = await marketplace!.createSeller(principal, { id, name });
      input.publishChange?.();
      response.status(201).json({ ok: true, seller });
    } catch {
      response.status(503).json({ error: "commerce_market_seller_write_failed" });
    }
  });

  router.post("/marketplace/sellers/:id/activate", async (request, response) => {
    if (input.environment !== "development") {
      response.status(403).json({ error: "market_seller_activation_requires_review" });
      return;
    }
    const id = request.params.id.trim();
    if (!id || id.length > 100) {
      response.status(400).json({ error: "invalid_market_seller_id" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const seller = await marketplace!.activateSeller(principal, id);
      if (!seller) {
        response.status(409).json({ error: "market_seller_not_pending" });
        return;
      }
      input.publishChange?.();
      response.json({ ok: true, seller });
    } catch {
      response.status(503).json({ error: "commerce_market_seller_activation_failed" });
    }
  });

  router.post("/marketplace/listings", async (request, response) => {
    const body = request.body ?? {};
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const sellerId = typeof body.sellerId === "string" ? body.sellerId.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const rail = body.rail as MarketRail;
    const price = Number(body.price);
    if (!id || id.length > 100 || !sellerId || sellerId.length > 100
      || !MARKET_RAILS.has(rail) || !Number.isFinite(price) || price > 1_000_000_000
      || productId.length > 180) {
      response.status(400).json({ error: "invalid_market_listing" });
      return;
    }
    const validation = validateMarketAsset({ title, rail, price, assetRef: productId });
    if (!validation.ok) {
      response.status(400).json({ error: "market_listing_validation_failed", issues: validation.issues });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const listing = await marketplace!.createListing(principal, {
        id, sellerId, productId: productId || title, title, rail, price,
        railReady: validation.listedAllowed,
      });
      if (!listing) {
        response.status(409).json({ error: "market_seller_not_active" });
        return;
      }
      input.publishChange?.();
      response.status(201).json({ ok: true, listing });
    } catch {
      response.status(503).json({ error: "commerce_market_listing_write_failed" });
    }
  });

  router.get("/store/drafts/:page", async (request, response) => {
    const page = request.params.page.trim();
    if (!STORE_PAGES.has(page)) {
      response.status(400).json({ error: "invalid_store_page" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      response.json({
        draft: await storeDrafts!.get(principal, "site-local", page),
        source: "postgresql",
        authoritative: false,
      });
    } catch {
      response.status(503).json({ error: "commerce_store_draft_read_failed" });
    }
  });

  router.put("/store/drafts/:page", async (request, response) => {
    const page = request.params.page.trim();
    const blocks = validStoreBlocks(request.body?.blocks);
    const theme = validStoreTheme(request.body?.theme);
    if (!STORE_PAGES.has(page) || !blocks || !theme) {
      response.status(400).json({ error: "invalid_commerce_store_draft" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const draft = await storeDrafts!.save(principal, { siteId: "site-local", page, blocks, theme });
      input.publishChange?.();
      response.json({ ok: true, draft });
    } catch {
      response.status(503).json({ error: "commerce_store_draft_write_failed" });
    }
  });

  router.get("/campaigns", async (request, response) => {
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      response.json({
        contract: "cos-commerce-campaign-config-v1",
        campaigns: await campaigns!.list(principal),
        source: "postgresql",
        authoritative: false,
      });
    } catch {
      response.status(503).json({ error: "commerce_campaign_read_failed" });
    }
  });

  router.put("/campaigns/:id", async (request, response) => {
    const id = request.params.id.trim();
    const body = request.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const audience = typeof body.audience === "string" ? body.audience.trim() : "";
    const discount = Number(body.discount);
    const status = body.status;
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const sequence = body.sequence;
    if (!id || id.length > 100 || !name || name.length > 160
      || !audience || audience.length > 500
      || !Number.isFinite(discount) || discount < 0 || discount > 100
      || (status !== "Activa" && status !== "Pausada")
      || source.length > 120
      || !Array.isArray(sequence) || sequence.length > 10
      || sequence.some((item: unknown) => typeof item !== "string" || item.length > 180)) {
      response.status(400).json({ error: "invalid_commerce_campaign" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const campaign = await campaigns!.save(principal, {
        id, name, audience, discount, status, source, sequence,
      });
      input.publishChange?.();
      response.json({ ok: true, campaign });
    } catch {
      response.status(503).json({ error: "commerce_campaign_write_failed" });
    }
  });

  router.delete("/campaigns/:id", async (request, response) => {
    const id = request.params.id.trim();
    if (!id || id.length > 100) {
      response.status(400).json({ error: "invalid_commerce_campaign_id" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      await campaigns!.delete(principal, id);
      input.publishChange?.();
      response.json({ ok: true });
    } catch {
      response.status(503).json({ error: "commerce_campaign_delete_failed" });
    }
  });

  router.get("/bots/snapshot", async (request, response) => {
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const configuration = await automation!.listConfiguration(principal);
      response.json({
        contract: "cos-commerce-bot-config-v1",
        tenantId: principal.tenantId,
        ...configuration,
        source: "postgresql",
        authoritative: false,
      });
    } catch {
      response.status(503).json({ error: "commerce_bot_config_read_failed" });
    }
  });

  router.post("/bots", async (request, response) => {
    const id = typeof request.body?.id === "string" ? request.body.id.trim() : "";
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    const skills = Array.isArray(request.body?.skills) ? request.body.skills as CommerceBotSkill[] : [];
    if (!id || id.length > 100 || name.length < 2 || name.length > 120
      || !skills.length || skills.length > COMMERCE_BOT_SKILLS.length
      || skills.some(skill => !BOT_SKILLS.has(skill))) {
      response.status(400).json({ error: "invalid_commerce_bot" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const bot = await automation!.saveBot(principal, { id, name, skills: [...new Set(skills)] });
      input.publishChange?.();
      response.status(201).json({ ok: true, bot });
    } catch {
      response.status(503).json({ error: "commerce_bot_write_failed" });
    }
  });

  router.patch("/bots/:id", async (request, response) => {
    const id = request.params.id.trim();
    const body = request.body ?? {};
    const patch: { name?: string; personality?: string; channel?: "in_app" | "mail_draft" } = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 120) {
        response.status(400).json({ error: "invalid_commerce_bot_name" });
        return;
      }
      patch.name = body.name.trim();
    }
    if (body.personality !== undefined) {
      if (typeof body.personality !== "string" || body.personality.trim().length > 240) {
        response.status(400).json({ error: "invalid_commerce_bot_personality" });
        return;
      }
      patch.personality = body.personality.trim();
    }
    if (body.channel !== undefined) {
      if (body.channel !== "in_app" && body.channel !== "mail_draft") {
        response.status(400).json({ error: "invalid_commerce_bot_channel" });
        return;
      }
      patch.channel = body.channel;
    }
    if (!id || id.length > 100 || !Object.keys(patch).length) {
      response.status(400).json({ error: "invalid_commerce_bot_update" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const bot = await automation!.updateBot(principal, id, patch);
      if (!bot) {
        response.status(404).json({ error: "commerce_bot_not_found_or_not_draft" });
        return;
      }
      input.publishChange?.();
      response.json({ ok: true, bot });
    } catch {
      response.status(503).json({ error: "commerce_bot_update_failed" });
    }
  });

  router.post("/bots/:id/rules", async (request, response) => {
    const botId = request.params.id.trim();
    const id = typeof request.body?.id === "string" ? request.body.id.trim() : "";
    const trigger = request.body?.trigger as BotRuleTrigger;
    const action = request.body?.action as BotRuleAction;
    if (!botId || botId.length > 100 || !id || id.length > 100
      || !BOT_TRIGGERS.has(trigger)
      || (action !== "draft_notice" && action !== "draft_offer")) {
      response.status(400).json({ error: "invalid_commerce_bot_rule" });
      return;
    }
    try {
      const principal = (request as AuthenticatedRequest).digitalboostPrincipal!;
      const rule = await automation!.saveRule(principal, { id, botId, trigger, action });
      if (!rule) {
        response.status(409).json({ error: "commerce_bot_rule_conflict_or_bot_missing" });
        return;
      }
      input.publishChange?.();
      response.status(201).json({ ok: true, rule });
    } catch {
      response.status(503).json({ error: "commerce_bot_rule_write_failed" });
    }
  });

  app.get("/api/commerce/v1/marketplace/public-listings", async (_request, response) => {
    if (!marketplace || !input.database) {
      response.status(503).json({ error: "commerce_database_unavailable" });
      return;
    }
    try {
      response.json({ listings: await marketplace.listPublicListings() });
    } catch {
      response.status(503).json({ error: "commerce_marketplace_public_read_failed" });
    }
  });
  app.use("/api/commerce/v1", router);
}
