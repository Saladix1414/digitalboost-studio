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
  "bot model defines explicit lifecycle states",
  () => {
    const content =
      source(
        "bots/types.ts"
      );

    for (
      const state of [
        "draft",
        "validated",
        "paper-running",
        "paused",
        "stopped",
      ]
    ) {
      assert.match(
        content,
        new RegExp(state)
      );
    }
  }
);

test(
  "bot model references strategy and explicit risk profile",
  () => {
    const content =
      source(
        "bots/types.ts"
      );

    assert.match(
      content,
      /strategyId/
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
  "bot validator enforces paper-only execution",
  () => {
    const content =
      source(
        "bots/validator.ts"
      );

    assert.match(
      content,
      /paper-only/
    );
  }
);

test(
  "bot lifecycle uses explicit transition policy",
  () => {
    const content =
      source(
        "bots/engine.ts"
      );

    assert.match(
      content,
      /allowedTransitions/
    );

    assert.match(
      content,
      /canTransitionBot/
    );

    assert.match(
      content,
      /transitionTradingBot/
    );
  }
);

test(
  "bots can never be marked live deployable",
  () => {
    const content =
      source(
        "bots/engine.ts"
      );

    assert.match(
      content,
      /liveDeployable:\s*false/
    );
  }
);

test(
  "Bot Forge foundation has no exchange network or PULSE coupling",
  () => {
    for (
      const file of [
        "bots/types.ts",
        "bots/fixtures.ts",
        "bots/validator.ts",
        "bots/engine.ts",
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
