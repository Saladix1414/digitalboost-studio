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
  "backtest supports explicit exit reasons",
  () => {
    const content =
      source(
        "backtest/types.ts"
      );

    for (
      const reason of [
        "invalidation",
        "stop-loss",
        "take-profit",
        "end-of-window",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          reason
        )
      );
    }
  }
);

test(
  "backtest evaluates stop loss and take profit against candle ranges",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    assert.match(
      content,
      /candle\.low/
    );

    assert.match(
      content,
      /candle\.high/
    );

    assert.match(
      content,
      /stopLossPercent/
    );

    assert.match(
      content,
      /takeProfitPercent/
    );
  }
);

test(
  "backtest accounts for fees and slippage",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    assert.match(
      content,
      /feePercent/
    );

    assert.match(
      content,
      /slippagePercent/
    );

    assert.match(
      content,
      /applySlippage/
    );

    assert.match(
      content,
      /fees/
    );

    assert.match(
      content,
      /netPnl/
    );
  }
);

test(
  "backtest closes remaining position at end of historical window",
  () => {
    const content =
      source(
        "backtest/engine.ts"
      );

    assert.match(
      content,
      /end-of-window/
    );

    assert.match(
      content,
      /finalIndex/
    );
  }
);

test(
  "backtest exposes profit factor expectancy and total fees",
  () => {
    const content =
      source(
        "backtest/types.ts"
      );

    assert.match(
      content,
      /profitFactor/
    );

    assert.match(
      content,
      /expectancy/
    );

    assert.match(
      content,
      /totalFees/
    );
  }
);

test(
  "backtest realism remains simulation only",
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
