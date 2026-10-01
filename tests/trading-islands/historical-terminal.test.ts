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
    new URL(path, root),
    "utf8"
  );
}

test(
  "Terminal consumes HistoricalDataSource",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /localHistoricalData/
    );

    assert.match(
      content,
      /getSeries/
    );
  }
);

test(
  "Terminal exposes canonical historical windows",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    for (const window of [
      "20",
      "50",
      "100",
      "200",
    ]) {
      assert.match(
        content,
        new RegExp(window)
      );
    }
  }
);

test(
  "historical window controls remain local only",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
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
