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
  "indicator engine exposes reusable EMA series",
  () => {
    const types =
      source(
        "indicators/types.ts"
      );

    const engine =
      source(
        "indicators/engine.ts"
      );

    assert.match(
      types,
      /IndicatorSeries/
    );

    assert.match(
      types,
      /IndicatorAnalysis/
    );

    assert.match(
      engine,
      /series\(/
    );

    assert.match(
      engine,
      /analyze\(/
    );

    assert.match(
      engine,
      /ema20/
    );

    assert.match(
      engine,
      /ema50/
    );
  }
);

test(
  "Terminal passes EMA series into CandlestickChart",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /indicatorEngine\.analyze/
    );

    assert.match(
      content,
      /indicatorAnalysis\.snapshot/
    );

    assert.match(
      content,
      /indicatorAnalysis\.series/
    );

    assert.match(
      content,
      /indicatorSeries\.ema20/
    );

    assert.match(
      content,
      /indicatorSeries\.ema50/
    );
  }
);

test(
  "CandlestickChart renders EMA overlays using candle price geometry",
  () => {
    const content =
      source(
        "terminal/CandlestickChart.tsx"
      );

    assert.match(
      content,
      /buildIndicatorPath/
    );

    assert.match(
      content,
      /geometry\.priceY/
    );

    assert.match(
      content,
      /ema20Path/
    );

    assert.match(
      content,
      /ema50Path/
    );

    assert.match(
      content,
      /ti-terminal-indicator-line--ema20/
    );

    assert.match(
      content,
      /ti-terminal-indicator-line--ema50/
    );
  }
);

test(
  "indicator overlays remain local and non executing",
  () => {
    for (const file of [
      "indicators/engine.ts",
      "terminal/CandlestickChart.tsx",
      "terminal/TradingTerminal.tsx",
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
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);
