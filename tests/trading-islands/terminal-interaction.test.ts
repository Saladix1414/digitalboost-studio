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
  "terminal indicators are calculated locally",
  () => {
    const content =
      source(
        "terminal/indicators.ts"
      );

    assert.match(
      content,
      /calculateEMA/
    );

    assert.match(
      content,
      /calculateRSI/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );
  }
);

test(
  "candles support local selection",
  () => {
    const content =
      source(
        "terminal/CandlestickChart.tsx"
      );

    assert.match(
      content,
      /selectedIndex/
    );

    assert.match(
      content,
      /onSelectCandle/
    );
  }
);

test(
  "terminal exposes paper positions and orders",
  () => {
    const content =
      source(
        "terminal/TerminalActivityPanel.tsx"
      );

    assert.match(
      content,
      /Positions/
    );

    assert.match(
      content,
      /Orders/
    );

    assert.match(
      content,
      /mockPaperPositions/
    );

    assert.match(
      content,
      /mockPaperOrders/
    );
  }
);

test(
  "paper preview remains non executing",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /Paper preview ready/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );
  }
);

test(
  "candlestick renderer binds the map index used by selection",
  () => {
    const content =
      source(
        "terminal/CandlestickChart.tsx"
      );

    assert.match(
      content,
      /geometry\.items\.map\(\s*\(item,\s*index\)\s*=>/
    );

    assert.match(
      content,
      /selectedIndex === index/
    );

    assert.match(
      content,
      /onSelectCandle\?\.\(\s*index\s*\)/
    );
  }
);
