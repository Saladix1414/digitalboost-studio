import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../../src/trading/", import.meta.url);

function source(path: string): string {
  return fs.readFileSync(new URL(path, root), "utf8");
}

test("Markets navigation mounts a dedicated local-fixture workspace", () => {
  const workspace = source("TradingIslandsWorkspace.tsx");
  const markets = source("market-data/MarketsWorkspace.tsx");

  assert.match(workspace, /activeSection === "markets"/);
  assert.match(workspace, /<MarketsWorkspace\s*\/>/);
  assert.match(markets, /useMarketData\(\)/);
  assert.match(markets, /MarketPulseChart/);
  assert.match(markets, /not a live quote feed/i);
  assert.doesNotMatch(markets, /fetch\s*\(|WebSocket/i);
});

test("Marketplace navigation mounts the existing marketplace workspace", () => {
  const workspace = source("TradingIslandsWorkspace.tsx");

  assert.match(workspace, /activeSection === "marketplace"/);
  assert.match(workspace, /<NftMarketplaceWorkspace\s*\/>/);
});

test("Overview is a direct navigation destination and DBX stays unavailable", () => {
  const sidebar = source("shell/IslandSidebar.tsx");
  const workspace = source("TradingIslandsWorkspace.tsx");

  assert.match(sidebar, /id: "overview"/);
  assert.match(sidebar, /id: "dbx"[\s\S]*?disabled: true/);
  assert.match(workspace, /disabled: id === "dbx"/);
  assert.match(workspace, /DBX interface unavailable/);
  assert.match(workspace, /No balance, purchase or reward action/);
});
