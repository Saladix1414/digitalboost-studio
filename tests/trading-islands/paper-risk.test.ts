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
  "paper risk policy defines explicit limits",
  () => {
    const content =
      source(
        "risk/types.ts"
      );

    assert.match(
      content,
      /maxOrderNotional/
    );

    assert.match(
      content,
      /maxPositionNotional/
    );

    assert.match(
      content,
      /minCashReserve/
    );
  }
);

test(
  "paper risk policy returns explicit approval decision",
  () => {
    const content =
      source(
        "risk/paperRiskPolicy.ts"
      );

    assert.match(
      content,
      /approved/
    );

    assert.match(
      content,
      /projectedCash/
    );

    assert.match(
      content,
      /projectedPositionNotional/
    );
  }
);

test(
  "paper risk rejects oversized orders and positions",
  () => {
    const content =
      source(
        "risk/paperRiskPolicy.ts"
      );

    assert.match(
      content,
      /exceeds max order notional/
    );

    assert.match(
      content,
      /exceed max position notional/
    );

    assert.match(
      content,
      /breach minimum cash reserve/
    );
  }
);

test(
  "Paper Trading workspace evaluates risk before fill",
  () => {
    const content =
      source(
        "paper/PaperTradingWorkspace.tsx"
      );

    const riskIndex =
      content.indexOf(
        "evaluatePaperRisk"
      );

    const fillIndex =
      content.indexOf(
        "fillPaperMarketOrder("
      );

    assert.ok(
      riskIndex >= 0
    );

    assert.ok(
      fillIndex >= 0
    );

    assert.ok(
      riskIndex <
      fillIndex
    );

    assert.match(
      content,
      /!riskDecision\.approved/
    );
  }
);

test(
  "paper risk boundary remains local and exchange free",
  () => {
    for (
      const file of [
        "risk/types.ts",
        "risk/paperRiskPolicy.ts",
      ]
    ) {
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
