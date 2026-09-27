import test from "node:test";
import assert from "node:assert/strict";
import { validateMarketAsset } from "../../src/commerce/DigitalBoostMarketAssetGuard.ts";

test("physical listing can be listed when title and price exist", () => {
  const report = validateMarketAsset({ title: "Hoodie navy", rail: "physical", price: 40 });
  assert.equal(report.ok, true);
  assert.equal(report.listedAllowed, true);
});

test("nft cannot be listed even with a title", () => {
  const report = validateMarketAsset({ title: "Study #1", rail: "nft", price: 12, assetRef: "0xabc123" });
  assert.equal(report.listedAllowed, false);
  assert.equal(report.issues.some((i) => i.includes("rail pending")), true);
});

test("rejects empty title", () => {
  const report = validateMarketAsset({ title: "ab", rail: "digital", price: 5 });
  assert.equal(report.ok, false);
});
