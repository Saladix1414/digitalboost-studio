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
  "Market data boundary defines a stable source contract",
  () => {
    const content =
      source(
        "market-data/types.ts"
      );

    for (const member of [
      "getSnapshot",
      "getMarkets",
      "getMarket",
      "getCandles",
    ]) {
      assert.match(
        content,
        new RegExp(member)
      );
    }
  }
);

test(
  "local market data source owns fixture access",
  () => {
    const content =
      source(
        "market-data/localMarketData.ts"
      );

    assert.match(
      content,
      /mockMarkets/
    );

    assert.match(
      content,
      /getMockCandles/
    );
  }
);

test(
  "Overview no longer imports market fixtures directly",
  () => {
    const content =
      source(
        "overview/TradingOverview.tsx"
      );

    assert.match(
      content,
      /useMarketData/
    );

    assert.doesNotMatch(
      content,
      /fixtures\/markets/
    );
  }
);

test(
  "Terminal no longer imports candles or markets directly",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /useMarketData/
    );

    assert.doesNotMatch(
      content,
      /fixtures\/markets/
    );

    assert.doesNotMatch(
      content,
      /fixtures\/candles/
    );
  }
);

test(
  "Market data abstraction remains local and network free",
  () => {
    for (const file of [
      "market-data/types.ts",
      "market-data/localMarketData.ts",
      "market-data/MarketDataContext.tsx",
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
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);
