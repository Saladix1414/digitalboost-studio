import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path: string
): string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}

test(
  "Market Pulse exists and uses deterministic history",
  () => {
    const component =
      source(
        "overview/MarketPulseChart.tsx"
      );

    const fixture =
      source(
        "fixtures/marketHistory.ts"
      );

    assert.match(
      component,
      /mockMarketHistory/
    );

    for (const symbol of [
      "BTC",
      "ETH",
      "SOL",
    ]) {
      assert.match(
        fixture,
        new RegExp(
          `symbol:\\s*["']${symbol}["']`
        )
      );
    }
  }
);

test(
  "Market Pulse uses local SVG rendering",
  () => {
    const content =
      source(
        "overview/MarketPulseChart.tsx"
      );

    assert.match(
      content,
      /<svg/
    );

    assert.match(
      content,
      /buildPath/
    );

    assert.doesNotMatch(
      content,
      /chart\.js|recharts|lightweight-charts/i
    );
  }
);

test(
  "Overview provides navigation to terminal markets and bot forge",
  () => {
    const content =
      source(
        "overview/TradingOverview.tsx"
      );

    for (const section of [
      "terminal",
      "markets",
      "bot-forge",
    ]) {
      assert.match(
        content,
        new RegExp(
          `id:\\s*["']${section}["']`
        )
      );
    }

    assert.match(
      content,
      /onNavigate/
    );
  }
);

test(
  "Market Pulse remains mock-only",
  () => {
    for (const file of [
      "overview/MarketPulseChart.tsx",
      "fixtures/marketHistory.ts",
    ]) {
      const content =
        source(file);

      assert.doesNotMatch(
        content,
        /fetch\s*\(/
      );

      assert.doesNotMatch(
        content,
        /WebSocket/
      );

      assert.doesNotMatch(
        content,
        /binance|bybit|okx/i
      );

      assert.doesNotMatch(
        content,
        /DigitalBoostPulse/i
      );
    }
  }
);
