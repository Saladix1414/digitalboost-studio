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
  "indicator engine exposes RSI series",
  () => {
    assert.match(
      source(
        "indicators/rsi.ts"
      ),
      /calculateRSISeries/
    );

    assert.match(
      source(
        "indicators/engine.ts"
      ),
      /rsi14/
    );
  }
);

test(
  "RSI panel renders canonical 30 50 70 levels",
  () => {
    const content =
      source(
        "terminal/RsiPanel.tsx"
      );

    assert.match(
      content,
      /\[70,\s*50,\s*30\]/
    );

    assert.match(
      content,
      /ti-terminal-rsi__line/
    );

    assert.match(
      content,
      /mapY/
    );
  }
);

test(
  "Terminal renders RSI series from shared indicator engine",
  () => {
    const content =
      source(
        "terminal/TradingTerminal.tsx"
      );

    assert.match(
      content,
      /<RsiPanel/
    );

    assert.match(
      content,
      /indicatorSeries\.rsi14/
    );
  }
);

test(
  "RSI visualization remains local and non executing",
  () => {
    for (const file of [
      "indicators/rsi.ts",
      "terminal/RsiPanel.tsx",
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
