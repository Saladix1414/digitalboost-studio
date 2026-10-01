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
  "market data contract exposes health state",
  () => {
    const content =
      source(
        "market-data/types.ts"
      );

    assert.match(
      content,
      /MarketDataStatus/
    );

    assert.match(
      content,
      /MarketDataHealth/
    );

    assert.match(
      content,
      /getHealth/
    );
  }
);

test(
  "local provider reports deterministic ready state",
  () => {
    const content =
      source(
        "market-data/localMarketData.ts"
      );

    assert.match(
      content,
      /status:\s*"ready"/
    );

    assert.match(
      content,
      /Local deterministic fixtures/
    );
  }
);

test(
  "Overview and Terminal consume market health",
  () => {
    assert.match(
      source(
        "overview/TradingOverview.tsx"
      ),
      /marketHealth/
    );

    assert.match(
      source(
        "terminal/TradingTerminal.tsx"
      ),
      /marketHealth/
    );
  }
);

test(
  "market health remains network independent",
  () => {
    for (const file of [
      "market-data/types.ts",
      "market-data/localMarketData.ts",
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
    }
  }
);
