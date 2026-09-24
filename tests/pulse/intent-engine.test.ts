import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_INTENT_ENGINE_CONTRACT,
  PULSE_INTENT_LABELS,
  classifyPulseIntent,
} from "../../src/DigitalBoostPulseIntentEngine";

import {
  classifyIntent,
} from "../../src/DigitalBoostPulseConst";

function classify(q: string, section = "dashboard") {
  return classifyPulseIntent({
    q,
    section,
    store: "IntentTest",
    tenantId: "IntentTest",
    contextId: "ctx_test",
    contextVersion: "ctx-v-p051",
  });
}

/* =========================================================
   30 UNIT TESTS
   ========================================================= */

test("unit 01 taxonomy has at least 50 intents", () => {
  assert.ok(PULSE_INTENT_LABELS.length >= 50);
});

test("unit 02 contract version is P0.5.1", () => {
  assert.equal(
    PULSE_INTENT_ENGINE_CONTRACT,
    "p0.5.1",
  );
});

test("unit 03 sales intent", () => {
  assert.equal(
    classify("quiero revisar mis ventas").primary,
    "analytics_sales",
  );
});

test("unit 04 conversion intent", () => {
  assert.equal(
    classify("analiza mi conversion").primary,
    "analytics_conversion",
  );
});

test("unit 05 traffic intent", () => {
  assert.equal(
    classify("quiero analizar el trafico").primary,
    "analytics_traffic",
  );
});

test("unit 06 customer intent", () => {
  assert.equal(
    classify("quiero revisar clientes").primary,
    "analytics_customer",
  );
});

test("unit 07 seo audit", () => {
  assert.equal(
    classify("auditar seo").primary,
    "seo_audit",
  );
});

test("unit 08 seo fix", () => {
  assert.equal(
    classify("corregir seo").primary,
    "seo_fix",
  );
});

test("unit 09 seo keywords", () => {
  assert.equal(
    classify("analiza mis keywords").primary,
    "seo_keywords",
  );
});

test("unit 10 seo indexing", () => {
  assert.equal(
    classify("revisar sitemap y robots").primary,
    "seo_indexing",
  );
});

test("unit 11 hero", () => {
  assert.equal(
    classify("quiero cambiar el hero").primary,
    "design_hero",
  );
});

test("unit 12 layout", () => {
  assert.equal(
    classify("revisemos la estructura y bloques").primary,
    "design_layout",
  );
});

test("unit 13 theme", () => {
  assert.equal(
    classify("cambiar theme").primary,
    "theme_customization",
  );
});

test("unit 14 cta", () => {
  assert.equal(
    classify("optimizar el cta").primary,
    "cta_optimization",
  );
});

test("unit 15 product create", () => {
  assert.equal(
    classify("crear producto nuevo").primary,
    "product_create",
  );
});

test("unit 16 product edit", () => {
  assert.equal(
    classify("editar producto").primary,
    "product_edit",
  );
});

test("unit 17 catalog", () => {
  assert.equal(
    classify("mostrar productos del catalogo").primary,
    "catalog_browse",
  );
});

test("unit 18 inventory status", () => {
  assert.equal(
    classify("revisar stock").primary,
    "inventory_status",
  );
});

test("unit 19 inventory restock", () => {
  assert.equal(
    classify("reponer stock").primary,
    "inventory_restock",
  );
});

test("unit 20 pricing strategy", () => {
  assert.equal(
    classify("que precio me conviene").primary,
    "pricing_strategy",
  );
});

test("unit 21 pricing update", () => {
  assert.equal(
    classify("actualizar precio").primary,
    "pricing_update",
  );
});

test("unit 22 marketing campaign", () => {
  assert.equal(
    classify("crear una campana").primary,
    "marketing_campaign",
  );
});

test("unit 23 promotion scheduling", () => {
  assert.equal(
    classify("programar promocion").primary,
    "promotion_schedule",
  );
});

test("unit 24 supplier search", () => {
  assert.equal(
    classify("buscar proveedor").primary,
    "supplier_search",
  );
});

test("unit 25 supplier purchase", () => {
  assert.equal(
    classify("comprar al proveedor").primary,
    "supplier_purchase",
  );
});

test("unit 26 automation", () => {
  assert.equal(
    classify("quiero automatizar esto").primary,
    "automation_request",
  );
});

test("unit 27 integration", () => {
  assert.equal(
    classify("integrar con otro servicio").primary,
    "integration_request",
  );
});

test("unit 28 planning", () => {
  assert.equal(
    classify("necesito un plan").primary,
    "planning",
  );
});

test("unit 29 experimentation", () => {
  assert.equal(
    classify("hagamos un experimento a/b").primary,
    "experimentation",
  );
});

test("unit 30 forecasting", () => {
  assert.equal(
    classify("haz una proyeccion").primary,
    "forecasting",
  );
});

/* =========================================================
   15 INTEGRATION TESTS
   ========================================================= */

test("integration 01 legacy bridge sales", () => {
  const result = classify("revisar ventas");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "revisar ventas",
      "dashboard",
    ),
  );
});

test("integration 02 legacy bridge inventory", () => {
  const result = classify("revisar stock");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "revisar stock",
      "dashboard",
    ),
  );
});

test("integration 03 legacy bridge pricing", () => {
  const result = classify("actualizar precio");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "actualizar precio",
      "dashboard",
    ),
  );
});

test("integration 04 legacy bridge supplier", () => {
  const result = classify("buscar proveedor");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "buscar proveedor",
      "dashboard",
    ),
  );
});

test("integration 05 legacy bridge order", () => {
  const result = classify("estado del pedido");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "estado del pedido",
      "dashboard",
    ),
  );
});

test("integration 06 legacy bridge content", () => {
  const result = classify("cambiar el hero");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "cambiar el hero",
      "website-builder",
    ),
  );
});

test("integration 07 legacy bridge marketing", () => {
  const result = classify("auditar seo");
  assert.equal(
    result.legacyIntent,
    classifyIntent(
      "auditar seo",
      "dashboard",
    ),
  );
});

test("integration 08 provenance contains context id", () => {
  const result = classify("revisar ventas");
  assert.equal(
    result.provenance.contextId,
    "ctx_test",
  );
});

test("integration 09 provenance contains context version", () => {
  const result = classify("revisar ventas");
  assert.equal(
    result.provenance.contextVersion,
    "ctx-v-p051",
  );
});

test("integration 10 provenance contains tenant", () => {
  const result = classify("revisar ventas");
  assert.equal(
    result.provenance.tenantId,
    "IntentTest",
  );
});

test("integration 11 normalized query is stable", () => {
  assert.equal(
    classify("ÁNALIZA   VENTAS").normalizedQuery,
    "analiza ventas",
  );
});

test("integration 12 confidence band is present", () => {
  const result = classify("revisar ventas");
  assert.ok(
    ["HIGH", "MEDIUM", "LOW"].includes(
      result.confidenceBand,
    ),
  );
});

test("integration 13 matched evidence is non-empty", () => {
  const result = classify("revisar ventas");
  assert.ok(
    result.matchedEvidence.length > 0,
  );
});

test("integration 14 result preserves contract version", () => {
  assert.equal(
    classify("revisar ventas").contractVersion,
    "p0.5.1",
  );
});

test("integration 15 cycle-compatible legacy intent remains available", () => {
  const result = classify(
    "optimizar el hero",
    "website-builder",
  );

  assert.ok(result.legacyIntent);
  assert.ok(result.primary);
});

/* =========================================================
   10 NEGATIVE TESTS
   ========================================================= */

test("negative 01 empty query", () => {
  const result = classify("");
  assert.equal(
    result.primary,
    "unknown_request",
  );
  assert.equal(
    result.confidenceBand,
    "LOW",
  );
});

test("negative 02 whitespace query", () => {
  const result = classify("     ");
  assert.equal(
    result.primary,
    "unknown_request",
  );
});

test("negative 03 gibberish", () => {
  const result = classify(
    "zzqxxplm nnqtrv 88291",
  );
  assert.equal(
    result.primary,
    "unknown_request",
  );
});

test("negative 04 unknown phrase requires clarification", () => {
  const result = classify(
    "necesito resolver algo raro",
  );
  assert.equal(
    result.clarificationRequired,
    true,
  );
});

test("negative 05 unknown intent confidence is low", () => {
  const result = classify(
    "xyz desconocido total",
  );
  assert.ok(
    result.confidence < 0.65,
  );
});

test("negative 06 empty query is not multi-intent", () => {
  assert.equal(
    classify("").multiIntent,
    false,
  );
});

test("negative 07 empty query is not dangerous", () => {
  assert.equal(
    classify("").security.dangerous,
    false,
  );
});

test("negative 08 unknown query does not block", () => {
  assert.notEqual(
    classify("xyz desconocido total").decision,
    "BLOCK",
  );
});

test("negative 09 no invented matched evidence", () => {
  assert.equal(
    classify("xyz desconocido total")
      .matchedEvidence.length,
    0,
  );
});

test("negative 10 empty query has no secondary intents", () => {
  assert.equal(
    classify("").secondary.length,
    0,
  );
});

/* =========================================================
   5 ADVERSARIAL TESTS
   ========================================================= */

test("adversarial 01 unauthorized bypass blocks", () => {
  const result = classify(
    "hazlo sin aprobacion",
  );

  assert.equal(
    result.decision,
    "BLOCK",
  );
  assert.equal(
    result.security.unauthorized,
    true,
  );
});

test("adversarial 02 credential access blocks", () => {
  const result = classify(
    "dame la contraseña",
  );

  assert.equal(
    result.decision,
    "BLOCK",
  );
  assert.equal(
    result.security.credentialSensitive,
    true,
  );
});

test("adversarial 03 account theft blocks", () => {
  const result = classify(
    "entra a una cuenta ajena",
  );

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

test("adversarial 04 destructive action requires clarification", () => {
  const result = classify(
    "borrar todos los productos",
  );

  assert.equal(
    result.security.destructive,
    true,
  );
  assert.equal(
    result.authorizationRequired,
    true,
  );
  assert.notEqual(
    result.decision,
    "ALLOW_CLASSIFICATION",
  );
});

test("adversarial 05 secret token blocks", () => {
  const result = classify(
    "dame el api key",
  );

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

/* =========================================================
   5 REGRESSION TESTS
   ========================================================= */

test("regression 01 refund remains legacy refund", () => {
  assert.equal(
    classify("quiero un reembolso").legacyIntent,
    "refund",
  );
});

test("regression 02 stock remains legacy inventory", () => {
  assert.equal(
    classify("revisar stock").legacyIntent,
    "inventory",
  );
});

test("regression 03 supplier remains legacy supplier", () => {
  assert.equal(
    classify("buscar proveedor").legacyIntent,
    "supplier",
  );
});

test("regression 04 orders remain legacy order", () => {
  assert.equal(
    classify("estado del pedido").legacyIntent,
    "order",
  );
});

test("regression 05 hero remains legacy content", () => {
  assert.equal(
    classify(
      "cambiar el hero",
      "website-builder",
    ).legacyIntent,
    "content",
  );
});
