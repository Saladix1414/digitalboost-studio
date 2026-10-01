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
  "historical evaluator processes candles incrementally",
  () => {
    const content =
      source(
        "strategy/historical-evaluator.ts"
      );

    assert.match(
      content,
      /for\s*\(/
    );

    assert.match(
      content,
      /candles\.slice/
    );

    assert.match(
      content,
      /index \+ 1/
    );
  }
);

test(
  "historical evaluator rebuilds current and previous indicator snapshots",
  () => {
    const content =
      source(
        "strategy/historical-evaluator.ts"
      );

    assert.match(
      content,
      /indicatorEngine\.snapshot/
    );

    assert.match(
      content,
      /current/
    );

    assert.match(
      content,
      /previous/
    );
  }
);

test(
  "historical evaluator delegates rule semantics to strategy evaluator",
  () => {
    const content =
      source(
        "strategy/historical-evaluator.ts"
      );

    assert.match(
      content,
      /evaluateStrategy/
    );

    assert.match(
      content,
      /evaluation/
    );

    assert.match(
      content,
      /signal/
    );
  }
);

test(
  "historical evaluation remains pure and non executing",
  () => {
    const content =
      source(
        "strategy/historical-evaluator.ts"
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

    assert.doesNotMatch(
      content,
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
