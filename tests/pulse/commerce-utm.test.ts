import test from "node:test";
import assert from "node:assert/strict";
import { recordSiteBinding, resetSiteBindings } from "../../src/commerce/DigitalBoostSiteBinding.ts";
import { buildCommerceUtm, parseCommerceUtm } from "../../src/commerce/DigitalBoostCommerceUtm.ts";

test("UTM refuses unpublished sites and does not invent nimbus host", () => {
  resetSiteBindings();
  const result = buildCommerceUtm({
    path: "/",
    source: "instagram",
    medium: "social",
    campaign: "drop-abril",
  });
  assert.equal(result.ok, false);
});

test("UTM uses published hostname and optional term/content", () => {
  resetSiteBindings();
  recordSiteBinding({
    tenantId: "local-tenant",
    siteId: "site-1",
    hostname: "tienda.example.com",
    published: true,
  });
  const result = buildCommerceUtm({
    path: "/cap",
    source: "IG Stories",
    medium: "social",
    campaign: "Drop Abril",
    term: "cap blue",
    content: "story-3",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.url.includes("nimbus.digitalboost.shop"), false);
  assert.equal(parseCommerceUtm(result.url).utm_source, "ig-stories");
  assert.equal(parseCommerceUtm(result.url).utm_term, "cap-blue");
  assert.equal(parseCommerceUtm(result.url).utm_content, "story-3");
});
