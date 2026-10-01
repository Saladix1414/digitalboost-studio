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
  "historical data exposes a stable source contract",
  () => {
    const content =
      source(
        "historical-data/types.ts"
      );

    assert.match(
      content,
      /HistoricalDataSource/
    );

    assert.match(
      content,
      /getSeries/
    );
  }
);

test(
  "historical data supports canonical windows",
  () => {
    const content =
      source(
        "historical-data/types.ts"
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
  "local historical provider remains deterministic",
  () => {
    const content =
      source(
        "historical-data/localHistoricalData.ts"
      );

    assert.match(
      content,
      /getMockCandles/
    );

    assert.match(
      content,
      /repeatCandles/
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
  "historical layer remains independent from PULSE",
  () => {
    for (const file of [
      "historical-data/types.ts",
      "historical-data/localHistoricalData.ts",
      "historical-data/index.ts",
    ]) {
      assert.doesNotMatch(
        source(file),
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
      );
    }
  }
);
