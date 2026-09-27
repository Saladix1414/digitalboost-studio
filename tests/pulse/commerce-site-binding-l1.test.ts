import test from "node:test";
import assert from "node:assert/strict";
import {
  getSiteBinding,
  recordSiteBinding,
  resetSiteBindings,
} from "../../src/commerce/DigitalBoostSiteBinding.ts";

test("L1 no binding means unpublished site", () => {
  resetSiteBindings();
  assert.equal(getSiteBinding("tenant-a"), null);
});

test("L1 tenants do not share bindings", () => {
  resetSiteBindings();
  recordSiteBinding({ tenantId: "tenant-a", siteId: "site-1", published: true });
  assert.equal(getSiteBinding("tenant-a")?.siteId, "site-1");
  assert.equal(getSiteBinding("tenant-b"), null);
});
