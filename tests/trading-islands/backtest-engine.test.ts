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
  "backtest engine defines deterministic simulation result",
  () => {
    const content =
      source(
        "backtest/types.ts"
      );

    for (const token of [
      "BacktestTrade",
      "BacktestMetrics",
      "BacktestResult",
      "simulation-only",
    ]) {
      assert.match(
        content,
        new RegExp(token)
      );
    }
  }
);

test(
  "backtest engine consumes historical strategy evaluation",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    assert.match(
      content,
      /evaluateStrategyHistory/
    );

    assert.match(
      content,
      /history\.points/
    );
  }
);

test(
  "backtest engine calculates equity pnl win rate and drawdown",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    for (const token of [
      "equityCurve",
      "grossPnl",
      "winRatePercent",
      "maxDrawdownPercent",
      "returnPercent",
    ]) {
      assert.match(
        content,
        new RegExp(token)
      );
    }
  }
);

test(
  "backtest uses strategy risk allocation",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    assert.match(
      content,
      /maxPositionPercent/
    );

    assert.match(
      content,
      /allocation/
    );
  }
);

test(
  "backtest remains simulation only and network free",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    assert.match(
      content,
      /simulation-only/
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
