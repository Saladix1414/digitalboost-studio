import test from "node:test";
import assert from "node:assert/strict";
import {
  addMarketListing,
  getMarketplaceSnapshot,
  registerMarketSeller,
  resetMarketplace,
} from "../../src/commerce/DigitalBoostMarketplace.ts";

test("empty market does not invent GMV", () => {
  resetMarketplace();
  const snap = getMarketplaceSnapshot("t1");
  assert.equal(snap.gmv, null);
  assert.equal(snap.sellers.length, 0);
});

test("listing requires an existing seller", () => {
  resetMarketplace();
  const result = addMarketListing({
    tenantId: "t1",
    sellerId: "missing",
    productId: "p1",
    price: 10,
  });
  assert.equal("ok" in result && result.ok === false, true);
});

test("seller starts pending", () => {
  resetMarketplace();
  const seller = registerMarketSeller({ tenantId: "t1", name: "Taller Norte" });
  assert.equal("id" in seller && seller.state === "pending", true);
});

test("nft stays draft without crypto rail", () => {
  resetMarketplace();
  const seller = registerMarketSeller({ tenantId: "t1", name: "Atelier" });
  if (!("id" in seller)) throw new Error("seller");
  const listing = addMarketListing({
    tenantId: "t1",
    sellerId: seller.id,
    title: "Token study",
    rail: "nft",
    price: 12,
  });
  if (!("id" in listing)) throw new Error("listing");
  assert.equal(listing.state, "draft");
  assert.equal(listing.railReady, false);
});
