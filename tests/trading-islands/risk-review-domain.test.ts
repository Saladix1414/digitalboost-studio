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
  "risk review defines explicit approval lifecycle",
  () => {
    const content =
      source(
        "risk/reviewTypes.ts"
      );

    for (
      const state of [
        "pending",
        "approved",
        "rejected",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          state
        )
      );
    }
  }
);

test(
  "risk review evaluates strategy and bot independently",
  () => {
    const content =
      source(
        "risk/review.ts"
      );

    assert.match(
      content,
      /validateTradingBot/
    );

    assert.match(
      content,
      /validateStrategy/
    );
  }
);

test(
  "risk review requires explicit paper risk checks",
  () => {
    const content =
      source(
        "risk/review.ts"
      );

    for (
      const check of [
        "strategy-valid",
        "paper-only",
        "order-limit",
        "position-limit",
        "cash-reserve",
        "risk-reward",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          check
        )
      );
    }
  }
);

test(
  "risk review approval is authoritative for paper approval only",
  () => {
    const content =
      source(
        "risk/reviewTypes.ts"
      );

    assert.match(
      content,
      /approvedFor:\s*"paper-only"/
    );

    assert.match(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "risk review has no exchange or PULSE coupling",
  () => {
    for (
      const file of [
        "risk/reviewTypes.ts",
        "risk/review.ts",
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
