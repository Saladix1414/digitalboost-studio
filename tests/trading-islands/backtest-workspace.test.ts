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
  "Backtest workspace is wired into backtests section",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /BacktestWorkspace/
    );

    assert.match(
      workspace,
      /activeSection === "backtests"/
    );
  }
);

test(
  "Backtest workspace runs deterministic strategy simulation",
  () => {
    const content =
      source(
        "backtest/BacktestWorkspace.tsx"
      );

    assert.match(
      content,
      /runBacktest/
    );

    assert.match(
      content,
      /localHistoricalData/
    );

    assert.match(
      content,
      /mockStrategies/
    );
  }
);

test(
  "Backtest workspace exposes core performance metrics",
  () => {
    const content =
      source(
        "backtest/BacktestWorkspace.tsx"
      );

    for (
      const token of [
        "finalCapital",
        "netPnl",
        "returnPercent",
        "winRatePercent",
        "maxDrawdownPercent",
        "totalTrades",
      ]
    ) {
      assert.match(
        content,
        new RegExp(token)
      );
    }
  }
);

test(
  "Backtest workspace renders equity curve and simulated trades",
  () => {
    const content =
      source(
        "backtest/BacktestWorkspace.tsx"
      );

    assert.match(
      content,
      /EquityCurve/
    );

    assert.match(
      content,
      /result\.equityCurve/
    );

    assert.match(
      content,
      /result\.trades/
    );

    assert.match(
      content,
      /simulation/i
    );
  }
);

test(
  "Backtest workspace remains local and non executing",
  () => {
    const content =
      source(
        "backtest/BacktestWorkspace.tsx"
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
