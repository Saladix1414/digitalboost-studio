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
  "Trading Terminal exists and is mounted",
  () => {
    assert.match(
      source(
        "TradingIslandsWorkspace.tsx"
      ),
      /<TradingTerminal \/>/
    );
  }
);

test(
  "Terminal supports BTC ETH SOL and multiple timeframes",
  () => {
    const fixture =
      source(
        "fixtures/candles.ts"
      );

    for (const symbol of [
      "BTC",
      "ETH",
      "SOL",
    ]) {
      assert.match(
        fixture,
        new RegExp(
          `${symbol}`
        )
      );
    }

    for (const timeframe of [
      "1m",
      "5m",
      "15m",
      "1h",
      "4h",
      "1d",
    ]) {
      assert.match(
        fixture,
        new RegExp(
          `["']${timeframe}["']`
        )
      );
    }
  }
);

test(
  "Terminal chart renders OHLC candles locally",
  () => {
    const content =
      source(
        "terminal/CandlestickChart.tsx"
      );

    assert.match(
      content,
      /<svg/
    );

    assert.match(
      content,
      /open/
    );

    assert.match(
      content,
      /high/
    );

    assert.match(
      content,
      /low/
    );

    assert.match(
      content,
      /close/
    );
  }
);

test(
  "Terminal paper ticket does not execute real orders",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /No live execution/
    );

    assert.match(
      content,
      /Preview paper order/
    );

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
  }
);

test(
  "Terminal remains independent from PULSE",
  () => {
    for (const file of [
      "terminal/TradingTerminal.tsx",
      "terminal/CandlestickChart.tsx",
      "fixtures/candles.ts",
    ]) {
      assert.doesNotMatch(
        source(file),
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);
