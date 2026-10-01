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
  "strategy engine defines explicit strategy structure",
  () => {
    const content =
      source(
        "strategy/types.ts"
      );

    for (const token of [
      "TradingStrategy",
      "StrategyCondition",
      "StrategyRiskIntent",
      "paper-only",
    ]) {
      assert.match(
        content,
        new RegExp(token)
      );
    }
  }
);

test(
  "strategy fixture is deterministic and paper only",
  () => {
    const content =
      source(
        "strategy/fixtures.ts"
      );

    assert.match(
      content,
      /BTC EMA Momentum/
    );

    assert.match(
      content,
      /ema20/
    );

    assert.match(
      content,
      /ema50/
    );

    assert.match(
      content,
      /rsi14/
    );

    assert.match(
      content,
      /paper-only/
    );
  }
);

test(
  "strategy validator enforces risk constraints",
  () => {
    const content =
      source(
        "strategy/validator.ts"
      );

    assert.match(
      content,
      /maxPositionPercent/
    );

    assert.match(
      content,
      /stopLossPercent/
    );

    assert.match(
      content,
      /takeProfitPercent/
    );

    assert.match(
      content,
      /executionMode/
    );
  }
);

test(
  "strategy assessment cannot deploy",
  () => {
    const content =
      source(
        "strategy/engine.ts"
      );

    assert.match(
      content,
      /deployable:\s*false/
    );
  }
);

test(
  "strategy layer remains isolated from network PULSE and execution",
  () => {
    for (const file of [
      "strategy/types.ts",
      "strategy/fixtures.ts",
      "strategy/validator.ts",
      "strategy/engine.ts",
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
