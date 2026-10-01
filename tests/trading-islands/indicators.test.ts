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
  "Indicators engine exposes EMA RSI and snapshot contracts",
  () => {
    assert.match(
      source(
        "indicators/ema.ts"
      ),
      /calculateEMA/
    );

    assert.match(
      source(
        "indicators/rsi.ts"
      ),
      /calculateRSI/
    );

    assert.match(
      source(
        "indicators/engine.ts"
      ),
      /snapshot/
    );
  }
);

test(
  "Terminal consumes the shared indicators engine",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /indicatorEngine/
    );

    assert.match(
      content,
      /rsi14/
    );

    assert.doesNotMatch(
      content,
      /getTerminalIndicators/
    );
  }
);

test(
  "Indicators engine is independent from UI and network",
  () => {
    for (const file of [
      "indicators/ema.ts",
      "indicators/rsi.ts",
      "indicators/engine.ts",
      "indicators/types.ts",
    ]) {
      const content =
        source(file);

      assert.doesNotMatch(
        content,
        /react|lucide-react/i
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
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);

test(
  "legacy terminal indicator module is retired",
  () => {
    assert.equal(
      fs.existsSync(
        new URL(
          "terminal/indicators.ts",
          root
        )
      ),
      false
    );
  }
);
